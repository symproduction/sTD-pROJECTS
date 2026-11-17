import type {
  ApiHealthStatus,
  HealthAssistantResponse,
  MedicineInfoResponse,
  ReportAnalysisResponse,
} from "../types/medical";

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly errorCode: string;

  constructor(message: string, status: number, errorCode = "REQUEST_FAILED") {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.errorCode = errorCode;
  }
}

async function parseJsonResponse<T>(res: Response): Promise<T> {
  let payload: unknown = null;
  try {
    payload = await res.json();
  } catch {
    // Non-JSON response
  }

  if (!res.ok) {
    const errBody = payload as { message?: string; errorCode?: string } | null;
    throw new ApiClientError(
      errBody?.message || `Request failed (${res.status})`,
      res.status,
      errBody?.errorCode || "SERVER_ERROR"
    );
  }

  return payload as T;
}

export async function checkApiHealth(): Promise<ApiHealthStatus> {
  const res = await fetch("/api/health", { method: "GET" });
  return parseJsonResponse<ApiHealthStatus>(res);
}

export async function sendHealthChat(
  message: string,
  history: Array<{ role: "user" | "assistant"; content: string }>
): Promise<HealthAssistantResponse> {
  const res = await fetch("/api/health-assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  return parseJsonResponse<HealthAssistantResponse>(res);
}

export async function analyzeMedicalReport(
  file: File,
  notes?: string
): Promise<ReportAnalysisResponse> {
  const formData = new FormData();
  formData.append("report", file);
  if (notes?.trim()) {
    formData.append("notes", notes.trim());
  }

  const res = await fetch("/api/report/analyze", {
    method: "POST",
    body: formData,
  });
  return parseJsonResponse<ReportAnalysisResponse>(res);
}

export async function lookupMedicineInfo(query: string): Promise<MedicineInfoResponse> {
  const res = await fetch("/api/medicine/info", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  return parseJsonResponse<MedicineInfoResponse>(res);
}

export async function submitContactForm(data: {
  name: string;
  email: string;
  topic: string;
  message: string;
}): Promise<{
  received: boolean;
  referenceCode: string;
  topic: string;
  submittedAt: string;
}> {
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseJsonResponse(res);
}
