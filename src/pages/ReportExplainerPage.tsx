import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  FileCheck2,
  FileText,
  Info,
  Loader2,
  Lock,
  Trash2,
  Upload,
} from "lucide-react";
import { ApiNoticeBanner } from "../components/ApiNoticeBanner";
import { analyzeMedicalReport, ApiClientError } from "../services/apiClient";
import type { ReportAnalysisResponse } from "../types/medical";

interface ReportExplainerPageProps {
  aiConfigured: boolean | null;
  onToast: (type: "success" | "error" | "info", message: string) => void;
}

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ReportExplainerPage({
  aiConfigured,
  onToast,
}: ReportExplainerPageProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<{
    title: string;
    message: string;
    variant: "config" | "error";
  } | null>(null);
  const [result, setResult] = useState<ReportAnalysisResponse | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!selectedFile || !selectedFile.type.startsWith("image/")) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const validateAndSelectFile = (file: File) => {
    setFileError(null);
    setApiError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError("Unsupported file format. Please upload a PDF, JPG, or PNG file.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setFileError("File exceeds the 10 MB limit. Please upload a smaller report.");
      return;
    }

    setSelectedFile(file);
    setResult(null);
    onToast("info", `Selected ${file.name} for analysis.`);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      validateAndSelectFile(dropped);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setFileError("Please upload a PDF, JPG, or PNG medical report first.");
      return;
    }
    setFileError(null);
    setApiError(null);
    setIsAnalyzing(true);

    try {
      const analysis = await analyzeMedicalReport(selectedFile, notes);
      setResult(analysis);
      onToast("success", "Medical report explanation is ready.");
    } catch (err) {
      if (err instanceof ApiClientError && (err.errorCode === "API_KEY_MISSING" || err.errorCode === "API_KEY_INVALID")) {
        setApiError({
          title: "AI Service Configuration Required",
          message: err.message,
          variant: "config",
        });
      } else {
        const msg =
          err instanceof Error
            ? err.message
            : "Could not analyze this report. Please verify the file and try again.";
        setApiError({
          title: "Analysis Error",
          message: msg,
          variant: "error",
        });
        onToast("error", msg);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setFileError(null);
    setApiError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-200 pb-6 dark:border-slate-800">
        <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
          PDF, JPG &amp; PNG Support · In-Memory Processing · Non-Diagnostic
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          AI Medical Report Explainer
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Upload a laboratory report or diagnostic summary to review structured values, stated
          reference ranges, plain-English explanations, and questions to ask your doctor.
        </p>
      </div>

      {aiConfigured === false && (
        <div className="mt-6">
          <ApiNoticeBanner
            title="AI Service Not Configured"
            message="The server-side GEMINI_API_KEY environment variable is not configured. Report analysis requires a valid server key."
            variant="config"
          />
        </div>
      )}

      {apiError && (
        <div className="mt-6">
          <ApiNoticeBanner
            title={apiError.title}
            message={apiError.message}
            variant={apiError.variant}
          />
        </div>
      )}

      {/* Upload & Preview Grid */}
      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-7 dark:border-slate-800 dark:bg-slate-900">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
              isDragging
                ? "border-blue-600 bg-blue-50/70 dark:border-blue-400 dark:bg-blue-950/30"
                : "border-slate-300 bg-slate-50/60 dark:border-slate-700 dark:bg-slate-950/40"
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400">
              <Upload className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="mt-4 font-display text-base font-semibold text-slate-900 dark:text-white">
              Drag and drop your medical report here
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Supports PDF, JPG, and PNG files up to 10 MB
            </p>

            <input
              ref={fileInputRef}
              id="medical-report-upload"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) validateAndSelectFile(file);
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              <span>Upload Report</span>
            </button>
          </div>

          {fileError && (
            <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
              {fileError}
            </p>
          )}

          <div>
            <label
              htmlFor="report-context-notes"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              Optional context (e.g., routine annual checkup, fasting blood panel)
            </label>
            <input
              id="report-context-notes"
              type="text"
              maxLength={400}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional note to help frame the explanation..."
              className="mt-1.5 min-h-[42px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!selectedFile || isAnalyzing}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white whitespace-nowrap transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Analyzing Report...</span>
                </>
              ) : (
                <>
                  <FileCheck2 className="h-4 w-4" aria-hidden="true" />
                  <span>Analyze Report</span>
                </>
              )}
            </button>

            {selectedFile && (
              <button
                type="button"
                onClick={handleClearFile}
                disabled={isAnalyzing}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span>Remove File</span>
              </button>
            )}
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden="true" />
            <span>
              Privacy safeguard: Uploaded medical documents are processed in memory only during this
              request and are never permanently saved or written to disk.
            </span>
          </div>
        </div>

        {/* File Preview Card */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            File Preview
          </h2>

          {!selectedFile ? (
            <div className="mt-4 flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center dark:border-slate-800 dark:bg-slate-950/40">
              <FileText className="h-8 w-8 text-slate-400" aria-hidden="true" />
              <p className="mt-2.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                No report selected
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Choose a PDF, JPG, or PNG report to preview it before running analysis.
              </p>
            </div>
          ) : (
            <div className="mt-4 flex flex-1 flex-col gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-950">
                <p className="truncate font-semibold text-slate-900 dark:text-white">
                  {selectedFile.name}
                </p>
                <p className="mt-1 font-mono text-slate-500 tabular-nums dark:text-slate-400">
                  {selectedFile.type} · {formatBytes(selectedFile.size)}
                </p>
              </div>

              {previewUrl ? (
                <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950">
                  <img
                    src={previewUrl}
                    alt={`Preview of ${selectedFile.name}`}
                    className="max-h-72 w-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-950">
                  <FileText className="h-10 w-10 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                    PDF Document Ready
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Click &ldquo;Analyze Report&rdquo; to extract and explain the contents securely.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isAnalyzing && (
        <div
          aria-busy="true"
          className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center gap-3 text-sm font-medium text-blue-600 dark:text-blue-400">
            <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden="true" />
            <span>Reading report contents and organizing educational sections...</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            <div className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
      )}

      {/* 7 Structured Output Cards */}
      {result && !isAnalyzing && (
        <div className="mt-10 space-y-6">
          {result.isInsufficientInfo && (
            <div
              role="alert"
              className="rounded-2xl border border-amber-300 bg-amber-50/80 p-5 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400"
                  aria-hidden="true"
                />
                <div className="space-y-1 text-sm">
                  <p className="font-display font-semibold">
                    Limited Report Information Available
                  </p>
                  <p className="leading-relaxed">
                    {result.limitationsNote ||
                      "Some details or reference ranges were missing or unclear. MediAI will not guess missing figures or declare the report normal or abnormal."}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Card 1: Report Overview */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <p className="font-mono text-xs text-blue-600 tabular-nums dark:text-blue-400">
                01. Overview
              </p>
              <h2 className="mt-1 font-display text-lg font-bold text-slate-900 dark:text-white">
                Report Overview
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {result.reportOverview}
              </p>
            </section>

            {/* Card 2: Test Names */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <p className="font-mono text-xs text-blue-600 tabular-nums dark:text-blue-400">
                02. Identified Tests
              </p>
              <h2 className="mt-1 font-display text-lg font-bold text-slate-900 dark:text-white">
                Test Names
              </h2>
              {result.testNames.length > 0 ? (
                <ul className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2 dark:text-slate-300">
                  {result.testNames.map((name) => (
                    <li
                      key={name}
                      className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/60"
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  No specific laboratory test names could be identified from this document.
                </p>
              )}
            </section>
          </div>

          {/* Card 3: Observed Values Table */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <p className="font-mono text-xs text-blue-600 tabular-nums dark:text-blue-400">
              03. Extracted Measurements
            </p>
            <h2 className="mt-1 font-display text-lg font-bold text-slate-900 dark:text-white">
              Observed Values
            </h2>

            {result.observedValues.length > 0 ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
                      <th className="py-2.5 pr-4">Test Name</th>
                      <th className="py-2.5 pr-4">Observed Value</th>
                      <th className="py-2.5 pr-4">Unit</th>
                      <th className="py-2.5 pr-4">Stated Reference Range</th>
                      <th className="py-2.5">Comparison</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {result.observedValues.map((row, idx) => {
                      const statusLabel =
                        row.flagStatus === "outside_range"
                          ? "Outside stated range"
                          : row.flagStatus === "within_range"
                          ? "Within stated range"
                          : "Range not specified";

                      const statusClass =
                        row.flagStatus === "outside_range"
                          ? "text-amber-700 dark:text-amber-400 font-semibold"
                          : row.flagStatus === "within_range"
                          ? "text-teal-700 dark:text-teal-400 font-medium"
                          : "text-slate-500 dark:text-slate-400";

                      return (
                        <tr key={`${row.testName}-${idx}`} className="align-top">
                          <td className="py-3 pr-4 font-medium text-slate-900 dark:text-white">
                            <div>{row.testName}</div>
                            {row.explanation && (
                              <p className="mt-0.5 text-xs font-normal text-slate-500 dark:text-slate-400">
                                {row.explanation}
                              </p>
                            )}
                          </td>
                          <td className="py-3 pr-4 font-mono font-medium text-slate-900 tabular-nums dark:text-white">
                            {row.observedValue}
                          </td>
                          <td className="py-3 pr-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                            {row.unit}
                          </td>
                          <td className="py-3 pr-4 font-mono text-xs text-slate-600 tabular-nums dark:text-slate-300">
                            {row.referenceRange}
                          </td>
                          <td className={`py-3 text-xs ${statusClass}`}>{statusLabel}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                No structured numeric test values were readable in this document.
              </p>
            )}
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Card 4: Reference Ranges */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <p className="font-mono text-xs text-blue-600 tabular-nums dark:text-blue-400">
                04. Laboratory Benchmarks
              </p>
              <h2 className="mt-1 font-display text-lg font-bold text-slate-900 dark:text-white">
                Reference Ranges
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {result.referenceRangesNote}
              </p>
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                <span>
                  Reference intervals differ across laboratories, testing instruments, age, sex, and
                  clinical history.
                </span>
              </div>
            </section>

            {/* Card 5: Values Outside Reference Ranges */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <p className="font-mono text-xs text-blue-600 tabular-nums dark:text-blue-400">
                05. Highlighted Items
              </p>
              <h2 className="mt-1 font-display text-lg font-bold text-slate-900 dark:text-white">
                Values Outside Reference Ranges
              </h2>
              {result.valuesOutsideRange.length > 0 ? (
                <ul className="mt-3 space-y-3">
                  {result.valuesOutsideRange.map((item, idx) => (
                    <li
                      key={`${item.testName}-${idx}`}
                      className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 text-sm dark:border-amber-900/70 dark:bg-amber-950/30"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {item.testName}
                        </span>
                        <span className="font-mono text-xs text-amber-800 tabular-nums dark:text-amber-300">
                          {item.observedValue} (Ref: {item.referenceRange})
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                        {item.note}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  No values were flagged as outside stated reference ranges in the readable portion
                  of this document. Always verify directly with your clinician.
                </p>
              )}
            </section>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Card 6: Simple Explanation */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <p className="font-mono text-xs text-blue-600 tabular-nums dark:text-blue-400">
                06. Plain Language
              </p>
              <h2 className="mt-1 font-display text-lg font-bold text-slate-900 dark:text-white">
                Simple Explanation
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {result.simpleExplanation}
              </p>
            </section>

            {/* Card 7: Questions to Discuss with a Doctor */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <p className="font-mono text-xs text-blue-600 tabular-nums dark:text-blue-400">
                07. Visit Preparation
              </p>
              <h2 className="mt-1 font-display text-lg font-bold text-slate-900 dark:text-white">
                Questions to Discuss with a Doctor
              </h2>
              <ul className="mt-3 space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
                {result.questionsForDoctor.map((q) => (
                  <li
                    key={q}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 leading-relaxed dark:border-slate-800 dark:bg-slate-950/60"
                  >
                    {q}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
