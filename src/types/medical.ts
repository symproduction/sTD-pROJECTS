export type PageId =
  | "home"
  | "assistant"
  | "report"
  | "medicine"
  | "about"
  | "contact"
  | "privacy"
  | "disclaimer";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isEmergency?: boolean;
  emergencyGuidance?: string | null;
  suggestedFollowUps?: string[];
}

export interface HealthAssistantResponse {
  reply: string;
  isEmergency: boolean;
  emergencyGuidance: string | null;
  suggestedFollowUps: string[];
}

export interface ObservedValueRow {
  testName: string;
  observedValue: string;
  unit: string;
  referenceRange: string;
  flagStatus: "within_range" | "outside_range" | "not_specified";
  explanation: string;
}

export interface OutsideRangeRow {
  testName: string;
  observedValue: string;
  referenceRange: string;
  note: string;
}

export interface ReportAnalysisResponse {
  reportOverview: string;
  testNames: string[];
  observedValues: ObservedValueRow[];
  referenceRangesNote: string;
  valuesOutsideRange: OutsideRangeRow[];
  simpleExplanation: string;
  questionsForDoctor: string[];
  isInsufficientInfo: boolean;
  limitationsNote: string | null;
}

export interface MedicineSource {
  title: string;
  url: string;
}

export interface MedicineInfoResponse {
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

export interface ToastItem {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export interface ApiHealthStatus {
  ok: boolean;
  aiConfigured: boolean;
}
