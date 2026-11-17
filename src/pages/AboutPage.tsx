import { ArrowRight, FileCheck, HeartHandshake, Lock, ShieldCheck } from "lucide-react";
import { ResilientImage } from "../components/ResilientImage";
import type { PageId } from "../types/medical";

interface AboutPageProps {
  onNavigate: (page: PageId) => void;
}

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: "Safety Before Speed",
    description:
      "Every AI prompt and structured output schema is constrained to prevent diagnosis, prescription recommendations, or fabricated lab benchmarks.",
  },
  {
    icon: Lock,
    title: "Zero Account Friction",
    description:
      "No user registration, no medical profile database, and no permanent storage of uploaded laboratory reports.",
  },
  {
    icon: FileCheck,
    title: "Source Grounding",
    description:
      "Medication lookups prioritize official U.S. FDA drug labeling and verified clinical references rather than ungrounded summaries.",
  },
  {
    icon: HeartHandshake,
    title: "Clinician Partnership",
    description:
      "MediAI is built to help patients arrive at appointments informed and ready with clear questions—not to replace doctors or pharmacists.",
  },
];

export function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-16 px-4 py-12 sm:px-6 lg:px-8">
      <section className="grid items-stretch gap-10 lg:grid-cols-12">
        <div className="flex flex-col justify-center space-y-5 lg:col-span-6">
          <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
            About MediAI · Clinical Literacy Initiative
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl [text-wrap:balance] dark:text-white">
            Making Medical Information Clearer for Every Patient
          </h1>
          <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
            Patients frequently leave clinics or open lab portals facing unfamiliar abbreviations,
            dense drug inserts, and confusing reference tables. MediAI bridges that comprehension
            gap with three focused educational assistants.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate("assistant")}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <span>Try Health Assistant</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate("contact")}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Contact Our Team
            </button>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
            <ResilientImage
              src="/src/assets/images/about_healthcare_team_1794905377210.jpg"
              alt="MediAI healthcare technology specialists and clinical advisors reviewing patient literacy workflows"
              fallbackTitle="MediAI Clinical Literacy Team"
              className="h-72 w-full object-cover lg:h-full"
            />
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="max-w-2xl space-y-2">
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Core Design &amp; Clinical Principles
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Every workflow inside MediAI follows explicit boundaries designed for patient safety
            and transparency.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {PRINCIPLES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
