import { AlertTriangle } from "lucide-react";

export function MedicalDisclaimerPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-2 border-b border-slate-200 pb-6 dark:border-slate-800">
        <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
          Important Safety &amp; Educational Scope Notice
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Medical Disclaimer
        </h1>
      </div>

      <div
        role="alert"
        className="rounded-2xl border border-red-200 bg-red-50/70 p-6 text-red-950 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-100"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400"
            aria-hidden="true"
          />
          <div className="space-y-1 text-sm">
            <p className="font-display font-bold">Emergency Care Notice</p>
            <p className="leading-relaxed">
              If you think you may have a medical emergency—such as chest pain, severe shortness of
              breath, sudden weakness or numbness, severe bleeding, or thoughts of self-harm—call
              911 or your local emergency services immediately. Do not wait for an AI response.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            1. Educational Information Only — No Doctor-Patient Relationship
          </h2>
          <p className="mt-2">
            All content generated or displayed by MediAI—including responses from the AI Health
            Assistant, explanations in the Medical Report Explainer, and summaries in the Medicine
            Information Assistant—is strictly for informational and educational purposes. Using this
            platform does not create a physician-patient, pharmacist-patient, or clinical care
            relationship.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            2. No Medical Diagnosis or Prescribing
          </h2>
          <p className="mt-2">
            MediAI does not diagnose diseases, interpret clinical images or laboratory panels as
            normal or abnormal without full clinical context, recommend prescription medications,
            determine personal dosages, or advise starting, stopping, or altering any treatment plan.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            3. Laboratory Reference Range Variations
          </h2>
          <p className="mt-2">
            Laboratory reference ranges vary across testing facilities, analytical methods, age,
            sex, pregnancy status, and individual health history. Always review your complete report
            directly with the ordering clinician.
          </p>
        </section>
      </div>
    </div>
  );
}
