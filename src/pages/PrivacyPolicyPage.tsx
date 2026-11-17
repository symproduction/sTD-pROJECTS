export function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-2 border-b border-slate-200 pb-6 dark:border-slate-800">
        <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
          Privacy Policy · Data Minimization Commitment
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Effective Date: November 2026
        </p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            1. No Accounts and No Permanent Database Storage
          </h2>
          <p className="mt-2">
            MediAI does not require user registration, login credentials, or personal profiles. We
            do not operate a persistent database of patient conversations, medical reports, or
            medication searches.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            2. Handling of Uploaded Medical Reports
          </h2>
          <p className="mt-2">
            When you upload a PDF, JPG, or PNG file to the AI Medical Report Explainer, the file is
            held strictly in volatile server memory during your active request so the AI proxy can
            extract and explain the document. Immediately after returning the response, the memory
            buffer is cleared and never written to permanent server storage.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            3. Chat Session &amp; Browser Preferences
          </h2>
          <p className="mt-2">
            AI Health Assistant messages remain in your browser&apos;s temporary page memory for the
            duration of your current session and are cleared when you click &ldquo;Clear
            Conversation&rdquo; or refresh the tab. The only persistent browser preference stored
            locally is your light/dark color theme choice.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            4. Third-Party AI &amp; Drug Reference Processing
          </h2>
          <p className="mt-2">
            Requests sent through our secure backend proxy are transmitted over encrypted HTTPS to
            the configured AI inference provider and, for medication lookups, to the public U.S. FDA
            openFDA drug labeling API. Please remove unnecessary personal identifiers (such as full
            home addresses or national ID numbers) before uploading reports whenever possible.
          </p>
        </section>
      </div>
    </div>
  );
}
