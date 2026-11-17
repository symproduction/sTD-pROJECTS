import type { PageId } from "../types/medical";

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="border-t border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-3 md:col-span-1">
            <button
              type="button"
              onClick={() => onNavigate("home")}
              className="flex items-center gap-2.5 text-left focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              <span
                aria-hidden="true"
                className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
              <span className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-white">
                MediAI
              </span>
            </button>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              MediAI – Your Smart Health Assistant. Clear, educational health guidance designed to
              support informed conversations with licensed clinicians.
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
              AI Tools
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("assistant")}
                  className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  AI Health Assistant
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("report")}
                  className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Medical Report Explainer
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("medicine")}
                  className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Medicine Information
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
              Organization & Trust
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("home")}
                  className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("about")}
                  className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("contact")}
                  className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("privacy")}
                  className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("disclaimer")}
                  className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Medical Disclaimer
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
              Contact Information
            </h3>
            <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>care@mediai-health.example</p>
              <p>Clinical Literacy Support · Mon–Fri, 9:00–17:00 PT</p>
              <p className="pt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                For medical emergencies, call your local emergency services (such as 911)
                immediately.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:text-slate-400">
          <p>© {new Date().getFullYear()} MediAI Health Literacy Platform. Educational use only.</p>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => onNavigate("privacy")}
              className="hover:text-slate-900 dark:hover:text-slate-200"
            >
              Privacy Policy
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => onNavigate("disclaimer")}
              className="hover:text-slate-900 dark:hover:text-slate-200"
            >
              Medical Disclaimer
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => onNavigate("contact")}
              className="hover:text-slate-900 dark:hover:text-slate-200"
            >
              Contact
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
