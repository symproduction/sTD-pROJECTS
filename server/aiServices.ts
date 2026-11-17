import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

export class ApiConfigError extends Error {
  public readonly statusCode = 503;
  public readonly errorCode = "API_KEY_MISSING";

  constructor(message = "AI service is not configured on the server.") {
    super(message);
    this.name = "ApiConfigError";
  }
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface HealthAssistantResult {
  reply: string;
  isEmergency: boolean;
  emergencyGuidance: string | null;
  suggestedFollowUps: string[];
}

export interface ObservedValueItem {
  testName: string;
  observedValue: string;
  unit: string;
  referenceRange: string;
  flagStatus: "within_range" | "outside_range" | "not_specified";
  explanation: string;
}

export interface OutsideRangeItem {
  testName: string;
  observedValue: string;
  referenceRange: string;
  note: string;
}

export interface ReportAnalysisResult {
  reportOverview: string;
  testNames: string[];
  observedValues: ObservedValueItem[];
  referenceRangesNote: string;
  valuesOutsideRange: OutsideRangeItem[];
  simpleExplanation: string;
  questionsForDoctor: string[];
  isInsufficientInfo: boolean;
  limitationsNote: string | null;
}

export interface MedicineSource {
  title: string;
  url: string;
}

export interface MedicineInfoResult {
  query: string;
  found: boolean;
  verificationStatus: "verified_fda" | "verified_web" | "unverified";
  medicineName: string;
  genericName: string;
  brandNames: string[];
  drugClass: string;
  commonUses: string[];
  commonSideEffects: string[];
  precautions: string[];
  warnings: string[];
  whenToConsultProfessional: string[];
  limitationNote: string | null;
  sources: MedicineSource[];
}

const GEMINI_MODEL = "gemini-4-hydrogen";
const OPENAI_MODEL = "gpt-4o-mini";

export function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY?.trim();
  return Boolean(key && key !== "MY_GEMINI_API_KEY");
}

export function isOpenAiConfigured(): boolean {
  const key = process.env.OPENAI_API_KEY?.trim();
  return Boolean(key && key !== "MY_OPENAI_API_KEY");
}

export function isAiConfigured(): boolean {
  return isGeminiConfigured() || isOpenAiConfigured();
}

function getGeminiClient(): GoogleGenAI {
  if (!isGeminiConfigured()) {
    throw new ApiConfigError(
      "Primary AI provider (GEMINI_API_KEY) is not configured on the server."
    );
  }
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!.trim(),
    httpOptions: {
      timeout: 60000,
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

type OpenAiContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } }
  | { type: "file"; file: { filename: string; file_data: string } };

interface OpenAiMessage {
  role: "system" | "user" | "assistant";
  content: string | OpenAiContentPart[];
}

async function callOpenAiJson<T>(
  messages: OpenAiMessage[],
  timeoutMs = 45000
): Promise<T> {
  if (!isOpenAiConfigured()) {
    throw new ApiConfigError(
      "Fallback AI provider (OPENAI_API_KEY) is not configured on the server."
    );
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY!.trim()}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      response_format: { type: "json_object" },
      messages,
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    const err = new Error(`OpenAI API error (${res.status}): ${errText}`) as Error & {
      status?: number;
    };
    err.status = res.status;
    throw err;
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content?.trim() || "{}";
  return JSON.parse(content) as T;
}

/**
 * Executes Gemini as the primary AI provider and automatically fails over to OpenAI
 * if Gemini is unavailable, hits quota/rate limits, or times out (when OPENAI_API_KEY is set).
 */
async function withProviderFailover<T>(
  geminiFn: () => Promise<T>,
  openAiFn: () => Promise<T>
): Promise<T> {
  if (!isGeminiConfigured() && !isOpenAiConfigured()) {
    throw new ApiConfigError(
      "AI features require GEMINI_API_KEY (or fallback OPENAI_API_KEY) configured in server Secrets."
    );
  }

  if (isGeminiConfigured()) {
    try {
      return await geminiFn();
    } catch (geminiErr) {
      if (isOpenAiConfigured()) {
        const errMsg = geminiErr instanceof Error ? geminiErr.message : String(geminiErr);
        console.warn("[MediAI] Primary Gemini request failed; failing over to OpenAI:", errMsg);
        return await openAiFn();
      }
      throw geminiErr;
    }
  }

  return await openAiFn();
}

/**
 * Feature 1: AI Health Assistant
 * Provides educational, plain-English health information without diagnosing or prescribing.
 * Detects potential emergency red flags and advises immediate emergency care.
 */
export async function askHealthAssistant(
  history: ChatTurn[],
  question: string
): Promise<HealthAssistantResult> {
  const systemInstruction = `You are MediAI Health Assistant, a patient-friendly healthcare education assistant.
Strict clinical safety rules:
1. Explain health concepts in clear, calm, simple English that any patient can understand.
2. Provide educational health information ONLY.
3. NEVER diagnose a disease or confirm that a user has a specific condition.
4. NEVER prescribe medicines or recommend specific prescription medication dosages.
5. Recommend consulting a licensed physician or qualified healthcare professional whenever symptoms persist, worsen, or require personal evaluation.
6. EMERGENCY DETECTION: Carefully check the user's message for urgent or life-threatening red-flag symptoms, including chest pain/tightness/pressure, difficulty breathing or shortness of breath at rest, sudden facial drooping, arm weakness, slurred speech, severe uncontrolled bleeding, severe allergic reaction (swelling of lips/tongue/throat), sudden severe headache, loss of consciousness, poisoning/overdose, or thoughts of self-harm/suicide.
   - If ANY emergency red-flag symptom is present, set isEmergency to true, provide a concise urgent emergencyGuidance message instructing them to call local emergency services (such as 911) or go to the nearest emergency room immediately, and keep the reply calm, direct, and focused on immediate safety.
7. Keep responses well-structured, concise (roughly 120-260 words), and practical.`;

  const normalizeResult = (parsed: {
    reply?: string;
    isEmergency?: boolean;
    emergencyGuidance?: string;
    suggestedFollowUps?: string[];
  }): HealthAssistantResult => ({
    reply:
      parsed.reply?.trim() ||
      "I could not generate an educational response for that question. Please try rephrasing.",
    isEmergency: Boolean(parsed.isEmergency),
    emergencyGuidance: parsed.isEmergency
      ? parsed.emergencyGuidance?.trim() ||
        "These symptoms may indicate a medical emergency. Please call your local emergency number (such as 911) or seek immediate emergency medical care."
      : null,
    suggestedFollowUps: Array.isArray(parsed.suggestedFollowUps)
      ? parsed.suggestedFollowUps.slice(0, 3)
      : [],
  });

  return withProviderFailover(
    async () => {
      const ai = getGeminiClient();
      const contents = [
        ...history.slice(-12).map((turn) => ({
          role: turn.role === "assistant" ? "model" : "user",
          parts: [{ text: turn.content }],
        })),
        {
          role: "user",
          parts: [{ text: question }],
        },
      ];

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: {
                type: Type.STRING,
                description: "Clear, plain-English educational health response.",
              },
              isEmergency: {
                type: Type.BOOLEAN,
                description:
                  "True if the user described urgent or life-threatening emergency symptoms.",
              },
              emergencyGuidance: {
                type: Type.STRING,
                description:
                  "Immediate action notice advising emergency services if isEmergency is true; otherwise empty string.",
              },
              suggestedFollowUps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description:
                  "2 to 3 short relevant follow-up educational questions the user might ask next.",
              },
            },
            required: ["reply", "isEmergency", "emergencyGuidance", "suggestedFollowUps"],
          },
        },
      });

      return normalizeResult(JSON.parse((response.text ?? "{}").trim()));
    },
    async () => {
      const jsonFormatInstruction = `${systemInstruction}

Return ONLY valid JSON with exact keys:
{
  "reply": string,
  "isEmergency": boolean,
  "emergencyGuidance": string,
  "suggestedFollowUps": string[]
}`;
      const messages: OpenAiMessage[] = [
        { role: "system", content: jsonFormatInstruction },
        ...history.slice(-12).map((turn) => ({
          role: turn.role,
          content: turn.content,
        })),
        { role: "user", content: question },
      ];

      const parsed = await callOpenAiJson<{
        reply?: string;
        isEmergency?: boolean;
        emergencyGuidance?: string;
        suggestedFollowUps?: string[];
      }>(messages);

      return normalizeResult(parsed);
    }
  );
}

/**
 * Feature 2: AI Medical Report Explainer
 * Processes PDF, JPG, or PNG medical reports in memory without permanent storage.
 * Never invents missing test values or reference ranges.
 */
export async function explainMedicalReport(
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string,
  extraNotes?: string
): Promise<ReportAnalysisResult> {
  const systemInstruction = `You are MediAI Medical Report Explainer, an educational clinical-literacy assistant.
Strict accuracy and medical safety rules:
1. Examine ONLY what is actually readable in the uploaded document (${fileName}).
2. NEVER invent, guess, or fabricate missing test values, units, or reference ranges. If a reference range is not printed on the report, set referenceRange to "Not specified in report" and flagStatus to "not_specified".
3. NEVER claim that a report is "normal" or "abnormal" overall if the image/PDF is blurry, incomplete, non-medical, or lacks reference ranges. When information is insufficient, set isInsufficientInfo to true and explain clearly in limitationsNote.
4. Always explain in referenceRangesNote that reference ranges vary between laboratories, instruments, age groups, and clinical contexts.
5. NEVER provide a medical diagnosis or tell the patient what disease they have.
6. Write simpleExplanation in clear, reassuring, everyday English explaining what the identified biomarkers or tests generally measure.
7. Provide 3 to 5 thoughtful, specific questionsForDoctor tailored to the actual tests visible in the document.`;

  const promptText = extraNotes?.trim()
    ? `Please review this uploaded medical report and extract its structured educational explanation. Patient context note: "${extraNotes.trim()}". Remember: never invent missing numbers or reference ranges.`
    : `Please review this uploaded medical report and extract its structured educational explanation. Remember: never invent missing numbers or reference ranges.`;

  const normalizeReport = (parsed: Partial<ReportAnalysisResult>): ReportAnalysisResult => {
    const normalizedObserved: ObservedValueItem[] = Array.isArray(parsed.observedValues)
      ? parsed.observedValues.map((item) => ({
          testName: item.testName || "Unspecified test",
          observedValue: item.observedValue || "Not readable",
          unit: item.unit || "—",
          referenceRange: item.referenceRange || "Not specified in report",
          flagStatus:
            item.flagStatus === "within_range" || item.flagStatus === "outside_range"
              ? item.flagStatus
              : "not_specified",
          explanation: item.explanation || "",
        }))
      : [];

    return {
      reportOverview:
        parsed.reportOverview?.trim() || "Unable to summarize the uploaded document clearly.",
      testNames: Array.isArray(parsed.testNames) ? parsed.testNames : [],
      observedValues: normalizedObserved,
      referenceRangesNote:
        parsed.referenceRangesNote?.trim() ||
        "Reference ranges can vary between laboratories depending on testing equipment, methods, and patient context. Always interpret results using the specific laboratory range on your official report and with your clinician.",
      valuesOutsideRange: Array.isArray(parsed.valuesOutsideRange)
        ? parsed.valuesOutsideRange
        : [],
      simpleExplanation:
        parsed.simpleExplanation?.trim() ||
        "Not enough readable test detail was available to provide a plain-language explanation.",
      questionsForDoctor: Array.isArray(parsed.questionsForDoctor)
        ? parsed.questionsForDoctor
        : [
            "How do these results relate to my symptoms and medical history?",
            "Are any repeat tests or follow-up evaluations needed?",
          ],
      isInsufficientInfo: Boolean(parsed.isInsufficientInfo),
      limitationsNote: parsed.limitationsNote?.trim() || null,
    };
  };

  return withProviderFailover(
    async () => {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: fileBuffer.toString("base64"),
              },
            },
            { text: promptText },
          ],
        },
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reportOverview: {
                type: Type.STRING,
                description: "High-level summary of the document type, panels shown, and readability.",
              },
              testNames: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of laboratory or clinical test names explicitly visible in the report.",
              },
              observedValues: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    testName: { type: Type.STRING },
                    observedValue: { type: Type.STRING },
                    unit: { type: Type.STRING },
                    referenceRange: { type: Type.STRING },
                    flagStatus: {
                      type: Type.STRING,
                      description: "One of: within_range, outside_range, not_specified",
                    },
                    explanation: { type: Type.STRING },
                  },
                  required: [
                    "testName",
                    "observedValue",
                    "unit",
                    "referenceRange",
                    "flagStatus",
                    "explanation",
                  ],
                },
              },
              referenceRangesNote: {
                type: Type.STRING,
                description:
                  "Summary of reference ranges shown in the report and explicit reminder that reference ranges vary across laboratories.",
              },
              valuesOutsideRange: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    testName: { type: Type.STRING },
                    observedValue: { type: Type.STRING },
                    referenceRange: { type: Type.STRING },
                    note: { type: Type.STRING },
                  },
                  required: ["testName", "observedValue", "referenceRange", "note"],
                },
                description:
                  "Only values explicitly flagged or outside the stated reference range on the report. Empty array if none or if ranges were not provided.",
              },
              simpleExplanation: {
                type: Type.STRING,
                description:
                  "Plain-English educational explanation of what these tests measure without diagnosing.",
              },
              questionsForDoctor: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Practical questions for the patient to discuss with their healthcare provider.",
              },
              isInsufficientInfo: {
                type: Type.BOOLEAN,
                description: "True if document is unreadable, non-medical, or lacks sufficient values/ranges.",
              },
              limitationsNote: {
                type: Type.STRING,
                description:
                  "Clear explanation of any missing data, image quality issues, or limitations; empty string if none.",
              },
            },
            required: [
              "reportOverview",
              "testNames",
              "observedValues",
              "referenceRangesNote",
              "valuesOutsideRange",
              "simpleExplanation",
              "questionsForDoctor",
              "isInsufficientInfo",
              "limitationsNote",
            ],
          },
        },
      });

      return normalizeReport(JSON.parse((response.text ?? "{}").trim()));
    },
    async () => {
      const base64 = fileBuffer.toString("base64");
      const dataUrl = `data:${mimeType};base64,${base64}`;
      const filePart: OpenAiContentPart =
        mimeType === "application/pdf"
          ? { type: "file", file: { filename: fileName, file_data: dataUrl } }
          : { type: "image_url", image_url: { url: dataUrl } };

      const openAiSystem = `${systemInstruction}

Return ONLY valid JSON matching this schema:
{
  "reportOverview": string,
  "testNames": string[],
  "observedValues": [{ "testName": string, "observedValue": string, "unit": string, "referenceRange": string, "flagStatus": "within_range" | "outside_range" | "not_specified", "explanation": string }],
  "referenceRangesNote": string,
  "valuesOutsideRange": [{ "testName": string, "observedValue": string, "referenceRange": string, "note": string }],
  "simpleExplanation": string,
  "questionsForDoctor": string[],
  "isInsufficientInfo": boolean,
  "limitationsNote": string
}`;

      const parsed = await callOpenAiJson<Partial<ReportAnalysisResult>>(
        [
          { role: "system", content: openAiSystem },
          {
            role: "user",
            content: [filePart, { type: "text", text: promptText }],
          },
        ],
        55000
      );

      return normalizeReport(parsed);
    }
  );
}

interface OpenFdaLabelRecord {
  openfda?: {
    generic_name?: string[];
    brand_name?: string[];
    pharm_class_epc?: string[];
    route?: string[];
    product_type?: string[];
  };
  indications_and_usage?: string[];
  warnings?: string[];
  warnings_and_cautions?: string[];
  boxed_warning?: string[];
  precautions?: string[];
  adverse_reactions?: string[];
  do_not_use?: string[];
  ask_doctor?: string[];
  purpose?: string[];
  set_id?: string;
}

async function fetchOpenFdaLabel(medicineQuery: string): Promise<OpenFdaLabelRecord | null> {
  const sanitized = medicineQuery.replace(/["\\]/g, "").trim();
  if (!sanitized) return null;

  const term = encodeURIComponent(`"${sanitized}"`);
  const urls = [
    `https://api.fda.gov/drug/label.json?search=openfda.generic_name:${term}+openfda.brand_name:${term}&limit=1`,
    `https://api.fda.gov/drug/label.json?search=${encodeURIComponent(sanitized)}&limit=1`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) continue;
      const data = (await res.json()) as { results?: OpenFdaLabelRecord[] };
      if (data.results && data.results.length > 0) {
        return data.results[0];
      }
    } catch {
      // Fall through to next query or web grounding
    }
  }
  return null;
}

function truncateField(arr: string[] | undefined, maxChars = 2200): string {
  if (!arr || arr.length === 0) return "";
  const joined = arr.join(" ").replace(/\s+/g, " ").trim();
  return joined.length > maxChars ? `${joined.slice(0, maxChars)}...` : joined;
}

/**
 * Feature 3: AI Medicine Information Assistant
 * Queries official U.S. FDA Drug Labeling data first, falling back to Google Search grounding
 * (with OpenAI failover if Gemini hits limits). Never recommends prescriptions or dosages.
 */
export async function getMedicineInformation(query: string): Promise<MedicineInfoResult> {
  const cleanQuery = query.trim();
  const fdaRecord = await fetchOpenFdaLabel(cleanQuery);

  const medicineSchema = {
    type: Type.OBJECT,
    properties: {
      found: {
        type: Type.BOOLEAN,
        description: "True only if this is a real, verified medicine with reliable information.",
      },
      medicineName: { type: Type.STRING },
      genericName: { type: Type.STRING },
      brandNames: { type: Type.ARRAY, items: { type: Type.STRING } },
      drugClass: { type: Type.STRING },
      commonUses: { type: Type.ARRAY, items: { type: Type.STRING } },
      commonSideEffects: { type: Type.ARRAY, items: { type: Type.STRING } },
      precautions: { type: Type.ARRAY, items: { type: Type.STRING } },
      warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
      whenToConsultProfessional: { type: Type.ARRAY, items: { type: Type.STRING } },
      limitationNote: { type: Type.STRING },
    },
    required: [
      "found",
      "medicineName",
      "genericName",
      "brandNames",
      "drugClass",
      "commonUses",
      "commonSideEffects",
      "precautions",
      "warnings",
      "whenToConsultProfessional",
      "limitationNote",
    ],
  };

  const safetyRules = `Strict medication safety rules:
1. Explain verified information in clear, simple English for patients.
2. NEVER recommend prescription medicines to take.
3. NEVER independently prescribe or suggest personal dosage amounts or schedules.
4. NEVER suggest starting, stopping, or changing any medication.
5. If the medicine name cannot be verified as a real, recognized drug or lacks reliable source data, set found to false and clearly explain the limitation in limitationNote.`;

  const openAiSchemaPrompt = `${safetyRules}

Return ONLY valid JSON with exact keys:
{
  "found": boolean,
  "medicineName": string,
  "genericName": string,
  "brandNames": string[],
  "drugClass": string,
  "commonUses": string[],
  "commonSideEffects": string[],
  "precautions": string[],
  "warnings": string[],
  "whenToConsultProfessional": string[],
  "limitationNote": string
}`;

  if (fdaRecord) {
    const fdaContext = {
      generic_name: fdaRecord.openfda?.generic_name ?? [],
      brand_name: fdaRecord.openfda?.brand_name ?? [],
      pharm_class: fdaRecord.openfda?.pharm_class_epc ?? [],
      product_type: fdaRecord.openfda?.product_type ?? [],
      indications_or_purpose: truncateField(fdaRecord.indications_and_usage || fdaRecord.purpose),
      boxed_warning: truncateField(fdaRecord.boxed_warning),
      warnings: truncateField(
        fdaRecord.warnings || fdaRecord.warnings_and_cautions || fdaRecord.do_not_use
      ),
      precautions: truncateField(fdaRecord.precautions || fdaRecord.ask_doctor),
      adverse_reactions: truncateField(fdaRecord.adverse_reactions),
    };

    const userPrompt = `Summarize the following official U.S. FDA Drug Label record for "${cleanQuery}" into patient-friendly educational sections. Do not invent facts outside the verified FDA label and established pharmacology.\n\nFDA Record:\n${JSON.stringify(fdaContext)}`;

    const parsed = await withProviderFailover(
      async () => {
        const ai = getGeminiClient();
        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: userPrompt,
          config: {
            systemInstruction: safetyRules,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: "application/json",
            responseSchema: medicineSchema,
          },
        });
        return JSON.parse((response.text ?? "{}").trim()) as Partial<MedicineInfoResult>;
      },
      async () =>
        callOpenAiJson<Partial<MedicineInfoResult>>([
          { role: "system", content: openAiSchemaPrompt },
          { role: "user", content: userPrompt },
        ])
    );

    const genericLabel =
      fdaRecord.openfda?.generic_name?.[0] || parsed.genericName || cleanQuery;
    const sources: MedicineSource[] = [
      {
        title: `U.S. FDA / DailyMed Label Reference (${genericLabel})`,
        url: fdaRecord.set_id
          ? `https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=${encodeURIComponent(fdaRecord.set_id)}`
          : `https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=${encodeURIComponent(genericLabel)}`,
      },
      {
        title: `MedlinePlus Drug Information (${genericLabel})`,
        url: `https://medlineplus.gov/druginformation.html`,
      },
    ];

    return {
      query: cleanQuery,
      found: parsed.found !== false,
      verificationStatus: "verified_fda",
      medicineName: parsed.medicineName || fdaRecord.openfda?.brand_name?.[0] || cleanQuery,
      genericName: parsed.genericName || genericLabel,
      brandNames:
        Array.isArray(parsed.brandNames) && parsed.brandNames.length > 0
          ? parsed.brandNames
          : fdaRecord.openfda?.brand_name?.slice(0, 5) ?? [],
      drugClass:
        parsed.drugClass || fdaRecord.openfda?.pharm_class_epc?.[0] || "Therapeutic Agent",
      commonUses: Array.isArray(parsed.commonUses) ? parsed.commonUses : [],
      commonSideEffects: Array.isArray(parsed.commonSideEffects) ? parsed.commonSideEffects : [],
      precautions: Array.isArray(parsed.precautions) ? parsed.precautions : [],
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
      whenToConsultProfessional: Array.isArray(parsed.whenToConsultProfessional)
        ? parsed.whenToConsultProfessional
        : [
            "Before starting, stopping, or changing any medication, speak with your doctor or pharmacist.",
          ],
      limitationNote: parsed.limitationNote?.trim() || null,
      sources,
    };
  }

  // Fallback when FDA label did not match directly: Gemini Search grounding or OpenAI fallback
  return withProviderFailover(
    async () => {
      const ai = getGeminiClient();
      const groundedSearch = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Look up authoritative clinical drug information (such as FDA, DailyMed, MedlinePlus, Mayo Clinic, or NHS) for the medicine query: "${cleanQuery}". Identify whether it is a real, recognized medication, its generic name, brand names, drug class, approved uses, common side effects, precautions, warnings, and when to consult a healthcare professional. Do NOT include dosing recommendations.`,
        config: {
          systemInstruction: safetyRules,
          tools: [{ googleSearch: {} }],
        },
      });

      const groundingChunks =
        groundedSearch.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
      const webSources: MedicineSource[] = groundingChunks
        .map((chunk) => {
          const web = (chunk as { web?: { uri?: string; title?: string } }).web;
          if (web?.uri) {
            return { title: web.title || "Verified Clinical Reference", url: web.uri };
          }
          return null;
        })
        .filter((s): s is MedicineSource => Boolean(s))
        .slice(0, 4);

      const groundedNotes = groundedSearch.text?.trim() || "";
      if (!groundedNotes) {
        return {
          query: cleanQuery,
          found: false,
          verificationStatus: "unverified",
          medicineName: cleanQuery,
          genericName: "Unverified",
          brandNames: [],
          drugClass: "Unverified",
          commonUses: [],
          commonSideEffects: [],
          precautions: [],
          warnings: [],
          whenToConsultProfessional: [
            "Consult a licensed pharmacist or physician to verify the exact name, ingredients, and safe use of any medication.",
          ],
          limitationNote: `We could not verify "${cleanQuery}" in official drug databases or trusted clinical references. Please check the spelling or ask a pharmacist.`,
          sources: [],
        };
      }

      const structuredResponse = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Structure the following verified clinical lookup notes for "${cleanQuery}" into the required JSON schema. If the notes indicate "${cleanQuery}" is NOT a real or verifiable medication, set found to false.\n\nLookup Notes:\n${groundedNotes}`,
        config: {
          systemInstruction: safetyRules,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: "application/json",
          responseSchema: medicineSchema,
        },
      });

      const parsed = JSON.parse(
        (structuredResponse.text ?? "{}").trim()
      ) as Partial<MedicineInfoResult>;

      const isVerified = Boolean(parsed.found) && webSources.length > 0;

      return {
        query: cleanQuery,
        found: Boolean(parsed.found),
        verificationStatus: isVerified ? "verified_web" : "unverified",
        medicineName: parsed.medicineName || cleanQuery,
        genericName: parsed.genericName || "Not verified",
        brandNames: Array.isArray(parsed.brandNames) ? parsed.brandNames : [],
        drugClass: parsed.drugClass || "Not specified",
        commonUses: Array.isArray(parsed.commonUses) ? parsed.commonUses : [],
        commonSideEffects: Array.isArray(parsed.commonSideEffects) ? parsed.commonSideEffects : [],
        precautions: Array.isArray(parsed.precautions) ? parsed.precautions : [],
        warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
        whenToConsultProfessional: Array.isArray(parsed.whenToConsultProfessional)
          ? parsed.whenToConsultProfessional
          : [
              "Consult a licensed doctor or pharmacist before taking, combining, or stopping any medication.",
            ],
        limitationNote:
          parsed.limitationNote?.trim() ||
          (!isVerified
            ? "Information could not be matched to an official FDA drug label. Please confirm details with a licensed pharmacist."
            : null),
        sources: webSources,
      };
    },
    async () => {
      const parsed = await callOpenAiJson<Partial<MedicineInfoResult>>([
        { role: "system", content: openAiSchemaPrompt },
        {
          role: "user",
          content: `Provide verified, conservative educational pharmacology information for "${cleanQuery}". Notice that no direct U.S. FDA openFDA label was matched for this exact query, so if you cannot confidently verify it as a real medication, set found to false.`,
        },
      ]);

      return {
        query: cleanQuery,
        found: Boolean(parsed.found),
        verificationStatus: "unverified",
        medicineName: parsed.medicineName || cleanQuery,
        genericName: parsed.genericName || "Not verified",
        brandNames: Array.isArray(parsed.brandNames) ? parsed.brandNames : [],
        drugClass: parsed.drugClass || "Not specified",
        commonUses: Array.isArray(parsed.commonUses) ? parsed.commonUses : [],
        commonSideEffects: Array.isArray(parsed.commonSideEffects) ? parsed.commonSideEffects : [],
        precautions: Array.isArray(parsed.precautions) ? parsed.precautions : [],
        warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
        whenToConsultProfessional: Array.isArray(parsed.whenToConsultProfessional)
          ? parsed.whenToConsultProfessional
          : [
              "Consult a licensed doctor or pharmacist before taking, combining, or stopping any medication.",
            ],
        limitationNote:
          parsed.limitationNote?.trim() ||
          "No direct U.S. FDA drug label match was found for this query; please verify official labeling with a pharmacist.",
        sources: [
          {
            title: "MedlinePlus Drug Information Directory",
            url: "https://medlineplus.gov/druginformation.html",
          },
        ],
      };
    }
  );
}
