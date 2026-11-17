import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ExternalLink,
  Info,
  Loader2,
  Pill,
  Search,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { ApiNoticeBanner } from "../components/ApiNoticeBanner";
import { ApiClientError, lookupMedicineInfo } from "../services/apiClient";
import type { MedicineInfoResponse } from "../types/medical";

interface MedicineInfoPageProps {
  aiConfigured: boolean | null;
  onToast: (type: "success" | "error" | "info", message: string) => void;
}

const COMMON_MEDICINES = [
  "Acetaminophen",
  "Ibuprofen",
  "Amoxicillin",
  "Metformin",
  "Lisinopril",
  "Atorvastatin",
  "Omeprazole",
  "Cetirizine",
  "Albuterol",
  "Levothyroxine",
  "Losartan",
  "Aspirin",
  "Azithromycin",
  "Diphenhydramine",
];

export function MedicineInfoPage({
  aiConfigured,
  onToast,
}: MedicineInfoPageProps) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MedicineInfoResponse | null>(null);
  const [apiError, setApiError] = useState<{
    title: string;
    message: string;
    variant: "config" | "error";
  } | null>(null);

  const filteredSuggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMON_MEDICINES.slice(0, 6);
    return COMMON_MEDICINES.filter((item) => item.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  const handleSearch = async (overrideQuery?: string) => {
    const term = (overrideQuery ?? query).trim();
    if (term.length < 2) {
      setValidationError("Please enter at least 2 characters for a medicine name.");
      return;
    }
    if (term.length > 120) {
      setValidationError("Medicine name must be 120 characters or fewer.");
      return;
    }

    setValidationError(null);
    setApiError(null);
    setShowSuggestions(false);
    if (overrideQuery) setQuery(overrideQuery);
    setIsLoading(true);

    try {
      const data = await lookupMedicineInfo(term);
      setResult(data);
      if (!data.found) {
        onToast("info", `Could not verify "${term}" in official drug references.`);
      }
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
            : "Unable to retrieve medicine information right now.";
        setApiError({
          title: "Lookup Failed",
          message: msg,
          variant: "error",
        });
        onToast("error", msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="space-y-2 border-b border-slate-200 pb-6 dark:border-slate-800">
        <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
          FDA-Grounded Lookup · Plain-English Summaries · Non-Prescriptive
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          AI Medicine Information Assistant
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Search verified medication details including generic names, common uses, side effects,
          precautions, and safety warnings. MediAI never recommends prescription drugs or personal
          dosages.
        </p>
      </div>

      {aiConfigured === false && (
        <div className="mt-6">
          <ApiNoticeBanner
            title="AI Service Not Configured"
            message="The server-side GEMINI_API_KEY environment variable is not configured. Medicine summaries require a configured server key."
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

      {/* Search Bar & Suggestions */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="relative"
        >
          <label
            htmlFor="medicine-search-input"
            className="block text-sm font-semibold text-slate-900 dark:text-white"
          >
            Search by generic or brand medicine name
          </label>
          <div className="mt-2.5 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="medicine-search-input"
                type="text"
                value={query}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                  if (validationError) setValidationError(null);
                }}
                placeholder="e.g., Ibuprofen, Metformin, Lisinopril, Amoxicillin..."
                className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white py-2.5 pr-4 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
              />

              {showSuggestions && filteredSuggestions.length > 0 && (
                <ul
                  role="listbox"
                  aria-label="Suggested medicines"
                  className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
                >
                  {filteredSuggestions.map((item) => (
                    <li key={item}>
                      <button
                        type="button"
                        onMouseDown={() => handleSearch(item)}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-blue-300"
                      >
                        <Pill className="h-4 w-4 text-slate-400" aria-hidden="true" />
                        <span>{item}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Searching...</span>
                </>
              ) : (
                <span>Search Medicine</span>
              )}
            </button>
          </div>

          {validationError && (
            <p role="alert" className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
              {validationError}
            </p>
          )}
        </form>

        {/* Quick-Access Common Searches */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Quick examples:
          </span>
          {["Acetaminophen", "Ibuprofen", "Metformin", "Lisinopril", "Omeprazole"].map((med) => (
            <button
              key={med}
              type="button"
              disabled={isLoading}
              onClick={() => handleSearch(med)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-blue-400 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-blue-600 dark:hover:text-blue-300"
            >
              {med}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {!result && !isLoading && (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-10 text-center dark:border-slate-800 dark:bg-slate-900/40">
          <Pill className="mx-auto h-9 w-9 text-slate-400" aria-hidden="true" />
          <h2 className="mt-3 font-display text-base font-semibold text-slate-900 dark:text-white">
            Search for a medication to inspect verified details
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-600 dark:text-slate-400">
            MediAI checks official U.S. FDA drug labeling and verified clinical references, then
            explains key safety facts clearly.
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div
          aria-busy="true"
          className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center gap-3 text-sm font-medium text-blue-600 dark:text-blue-400">
            <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden="true" />
            <span>Checking official drug label records and preparing summary...</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-28 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            <div className="h-28 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
      )}

      {/* Results View */}
      {result && !isLoading && (
        <div className="mt-8 space-y-6">
          {/* Unverified / Limitation Alert */}
          {(!result.found || result.verificationStatus === "unverified" || result.limitationNote) && (
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
                    {result.found ? "Verification Notice" : "Medicine Information Could Not Be Verified"}
                  </p>
                  <p className="leading-relaxed">
                    {result.limitationNote ||
                      "This query could not be matched to an official FDA drug label. Please verify the exact name with a licensed pharmacist."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {result.found && (
            <>
              {/* Overview & Generic Name Card */}
              <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>{result.drugClass}</span>
                      {result.brandNames.length > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>Common Brands: {result.brandNames.slice(0, 4).join(", ")}</span>
                        </>
                      )}
                    </div>
                    <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                      {result.medicineName}
                    </h2>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      <span className="font-semibold">Generic Name:</span> {result.genericName}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                    <ShieldCheck
                      className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400"
                      aria-hidden="true"
                    />
                    <span>
                      {result.verificationStatus === "verified_fda"
                        ? "Matched with U.S. FDA Drug Label"
                        : result.verificationStatus === "verified_web"
                        ? "Grounded in Clinical References"
                        : "Unverified Reference"}
                    </span>
                  </div>
                </div>
              </section>

              {/* 5 Structured Medicine Cards */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Common Uses */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-2.5">
                    <Info className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      Common Uses
                    </h3>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {result.commonUses.map((use) => (
                      <li key={use} className="flex items-start gap-2">
                        <span className="text-slate-400" aria-hidden="true">·</span>
                        <span>{use}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Common Side Effects */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle
                      className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400"
                      aria-hidden="true"
                    />
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      Common Side Effects
                    </h3>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {result.commonSideEffects.map((effect) => (
                      <li key={effect} className="flex items-start gap-2">
                        <span className="text-slate-400" aria-hidden="true">·</span>
                        <span>{effect}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Precautions */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck
                      className="h-4.5 w-4.5 text-teal-600 dark:text-teal-400"
                      aria-hidden="true"
                    />
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      Precautions
                    </h3>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {result.precautions.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="text-slate-400" aria-hidden="true">·</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Warnings */}
                <section className="rounded-2xl border border-red-200/80 bg-white p-6 dark:border-red-900/60 dark:bg-slate-900">
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert
                      className="h-4.5 w-4.5 text-red-600 dark:text-red-400"
                      aria-hidden="true"
                    />
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      Warnings
                    </h3>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {result.warnings.map((warn) => (
                      <li key={warn} className="flex items-start gap-2">
                        <span className="text-slate-400" aria-hidden="true">·</span>
                        <span>{warn}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              {/* When to Consult a Healthcare Professional */}
              <section className="rounded-2xl border border-slate-200 bg-blue-50/40 p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2.5">
                  <Stethoscope
                    className="h-5 w-5 text-blue-600 dark:text-blue-400"
                    aria-hidden="true"
                  />
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    When to Consult a Healthcare Professional
                  </h3>
                </div>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {result.whenToConsultProfessional.map((advice) => (
                    <li key={advice} className="flex items-start gap-2">
                      <span className="text-slate-400" aria-hidden="true">·</span>
                      <span>{advice}</span>
                    </li>
                  ))}
                </ul>

                {result.sources.length > 0 && (
                  <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Trusted Sources Referenced
                    </p>
                    <div className="mt-2 flex flex-wrap gap-3">
                      {result.sources.map((src) => (
                        <a
                          key={src.url}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                        >
                          <span>{src.title}</span>
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
}
