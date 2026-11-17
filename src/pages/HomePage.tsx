import { useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  FileText,
  MessageSquareHeart,
  Pill,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { ResilientImage } from "../components/ResilientImage";
import type { PageId } from "../types/medical";

interface HomePageProps {
  onNavigate: (page: PageId) => void;
}

const CAPABILITY_HIGHLIGHTS = [
  {
    label: "Health Literacy",
    value: "24/7 Educational Guidance",
    detail: "Plain-English answers with emergency red-flag awareness.",
  },
  {
    label: "Report Formats",
    value: "PDF, JPG & PNG",
    detail: "Structured 7-part breakdowns with zero file storage.",
  },
  {
    label: "Drug Lookup",
    value: "FDA-Grounded Data",
    detail: "Official drug label references translated for patients.",
  },
  {
    label: "Privacy First",
    value: "No Account Required",
    detail: "Session-only history with no database persistence.",
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    number: "01.",
    title: "Choose the right tool for your question",
    description:
      "Start a conversation with the AI Health Assistant, upload a lab report PDF or photo, or search any medication by brand or generic name.",
  },
  {
    number: "02.",
    title: "Receive structured, plain-language clarity",
    description:
      "MediAI organizes complex medical terminology, observed lab figures, and FDA safety warnings into clear sections you can read in minutes.",
  },
  {
    number: "03.",
    title: "Prepare informed questions for your clinician",
    description:
      "Use your generated summary and tailored doctor questions during your next appointment—while keeping clinical decisions with licensed professionals.",
  },
];

const WHY_CHOOSE_POINTS = [
  {
    title: "Strict non-diagnostic guardrails",
    body: "MediAI explains medical concepts and test markers without diagnosing conditions, prescribing medications, or inventing missing lab values.",
  },
  {
    title: "Trusted medication verification",
    body: "Medicine searches cross-reference official U.S. FDA drug labeling and verified clinical sources, clearly stating any limitations if unverified.",
  },
  {
    title: "Immediate emergency awareness",
    body: "If symptoms described in chat indicate urgent danger, the assistant immediately surfaces emergency care instructions.",
  },
  {
    title: "Ephemeral in-memory processing",
    body: "Uploaded medical reports are processed strictly in server memory for your request and immediately discarded—never saved to a database.",
  },
];

const FAQS = [
  {
    question: "Can MediAI diagnose medical conditions or prescribe treatments?",
    answer:
      "No. MediAI is strictly an educational health literacy platform. It helps you understand symptoms, medical terms, laboratory reports, and medication facts in plain English, but it never provides a diagnosis or prescribes medication.",
  },
  {
    question: "Are my uploaded medical reports saved on your servers?",
    answer:
      "No. Uploaded PDFs, JPGs, and PNGs are processed strictly in temporary memory to generate your explanation and are discarded immediately after the response is returned. There are no user accounts or permanent report databases.",
  },
  {
    question: "What happens if my lab report is missing reference ranges?",
    answer:
      "MediAI never invents or guesses missing test values or reference ranges. If ranges are not printed on your report, the explainer marks them as not specified and reminds you that reference ranges vary by laboratory.",
  },
  {
    question: "Where does Medicine Information data come from?",
    answer:
      "The Medicine Information Assistant queries official U.S. FDA drug labeling data and trusted clinical references, then translates those verified sections into easy-to-read summaries without recommending dosages.",
  },
];

export function HomePage({ onNavigate }: HomePageProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="border-b border-slate-200/80 bg-gradient-to-b from-blue-50/70 via-white to-white pt-10 pb-12 dark:border-slate-800/80 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-stretch gap-10 lg:grid-cols-12">
            <div className="flex flex-col justify-center space-y-6 lg:col-span-6">
              <p className="text-xs font-medium tracking-wide text-teal-700 dark:text-teal-400">
                Clinical Literacy Platform · Educational Health Guidance
              </p>

              <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08] [text-wrap:balance] dark:text-white">
                Your Health, Smarter with AI.
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
                Understand your health, medical reports, and medicines with intelligent AI
                assistance.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => scrollToSection("ai-tools")}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <span>Explore AI Tools</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection("how-it-works")}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 whitespace-nowrap shrink-0 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  Learn More
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <ResilientImage
                  src="/src/assets/images/hero_medical_consultation_1794905376729.jpg"
                  alt="Clinician reviewing structured digital healthcare insights at a sunlit consultation desk"
                  fallbackTitle="MediAI Clinical Workspace"
                  className="h-72 w-full object-cover sm:h-88 lg:h-full"
                />
              </div>
            </div>
          </div>

          {/* 4-Column Capability Strip */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CAPABILITY_HIGHLIGHTS.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70"
              >
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {item.label}
                </p>
                <p className="mt-1.5 font-display text-base font-semibold text-slate-900 dark:text-white">
                  {item.value}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three Core AI Features (Asymmetric Bento Layout) */}
      <section id="ai-tools" className="mx-auto max-w-6xl scroll-mt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
            Three Focused Tools · Dedicated Workflows
          </p>
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl [text-wrap:balance] dark:text-white">
            Explore MediAI Healthcare Assistants
          </h2>
          <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
            Each capability is built around clinical safety rules, clear explanations, and practical
            next steps.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          {/* Feature 1: Featured Wide Lead Card */}
          <article className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 lg:col-span-12 dark:border-slate-800 dark:bg-slate-900">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className="space-y-4 lg:col-span-7">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Feature 01</span>
                  <span aria-hidden="true">·</span>
                  <span>Interactive Q&amp;A</span>
                  <span aria-hidden="true">·</span>
                  <span>Emergency Detection</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400">
                    <MessageSquareHeart className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
                    AI Health Assistant
                  </h3>
                </div>
                <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
                  Ask everyday health, symptom, and wellness questions in a calm conversational
                  interface. Receives simple educational explanations, suggests follow-up topics,
                  and flags urgent warning signs that need immediate emergency care.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onNavigate("assistant")}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white whitespace-nowrap transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
                  >
                    <span>Open Health Assistant</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-5 lg:col-span-5 dark:border-slate-800 dark:bg-slate-950/60">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Popular questions inside the assistant
                </p>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <li>· What are common symptoms of flu?</li>
                  <li>· What is high blood pressure?</li>
                  <li>· How can I maintain a healthy lifestyle?</li>
                  <li>· What are common causes of headaches?</li>
                </ul>
              </div>
            </div>
          </article>

          {/* Feature 2: AI Medical Report Explainer */}
          <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white lg:col-span-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="h-52 overflow-hidden border-b border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
              <ResilientImage
                src="/src/assets/images/feature_report_analysis_1794905377078.jpg"
                alt="Printed blood panel laboratory report beside a digital tablet"
                fallbackTitle="Medical Report Explainer"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col justify-between space-y-4 p-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Feature 02</span>
                  <span aria-hidden="true">·</span>
                  <span>PDF, JPG &amp; PNG</span>
                  <span aria-hidden="true">·</span>
                  <span>7-Card Breakdown</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950/70 dark:text-teal-400">
                    <FileText className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                    AI Medical Report Explainer
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  Upload a lab report or imaging summary to review test names, observed values,
                  stated reference ranges, flagged items, plain-English explanations, and questions
                  to bring to your doctor.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate("report")}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 whitespace-nowrap transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                >
                  <span>Analyze a Report</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </article>

          {/* Feature 3: AI Medicine Information Assistant */}
          <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white lg:col-span-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="h-52 overflow-hidden border-b border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
              <ResilientImage
                src="/src/assets/images/feature_medicine_pharmacy_1794905377201.jpg"
                alt="Clean pharmacy reference bottles and blister packs on pale stone counter"
                fallbackTitle="Medicine Information Assistant"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col justify-between space-y-4 p-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Feature 03</span>
                  <span aria-hidden="true">·</span>
                  <span>FDA-Grounded</span>
                  <span aria-hidden="true">·</span>
                  <span>Safety Warnings</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400">
                    <Pill className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                    AI Medicine Information Assistant
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  Search any medication to inspect its generic name, common uses, side effects,
                  precautions, official warnings, and guidance on when to consult a pharmacist or
                  physician.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate("medicine")}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 whitespace-nowrap transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                >
                  <span>Search Medicines</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="border-y border-slate-200/80 bg-slate-50/70 py-16 scroll-mt-24 dark:border-slate-800/80 dark:bg-slate-900/40"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
              Simple Three-Step Workflow
            </p>
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl [text-wrap:balance] dark:text-white">
              How MediAI Works
            </h2>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {HOW_IT_WORKS_STEPS.map((step) => (
              <div
                key={step.number}
                className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="font-mono text-sm font-medium text-blue-600 tabular-nums dark:text-blue-400">
                  {step.number}
                </span>
                <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose MediAI */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-stretch gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
              <ResilientImage
                src="/src/assets/images/about_healthcare_team_1794905377210.jpg"
                alt="Healthcare researchers and clinicians collaborating on clear patient education"
                fallbackTitle="Why Choose MediAI"
                className="h-64 w-full object-cover sm:h-80 lg:h-full"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-6 lg:col-span-7">
            <div className="space-y-2">
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                Built Around Clinical Responsibility
              </p>
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl [text-wrap:balance] dark:text-white">
                Why Choose MediAI
              </h2>
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
                Generic AI tools often guess missing numbers or overstate certainty. MediAI is
                engineered around explicit accuracy guardrails and transparent limitations.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {WHY_CHOOSE_POINTS.map((point) => (
                <div
                  key={point.title}
                  className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck
                      className="mt-0.5 h-4.5 w-4.5 shrink-0 text-teal-600 dark:text-teal-400"
                      aria-hidden="true"
                    />
                    <div className="space-y-1">
                      <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                        {point.title}
                      </h3>
                      <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                        {point.body}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Healthcare Information Disclaimer Banner */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-blue-50/50 p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-white text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-400">
                <ShieldAlert className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                  Healthcare Information Disclaimer
                </h2>
                <p className="max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  MediAI provides educational health information only and is not a substitute for
                  professional medical advice, diagnosis, or treatment. Never disregard
                  professional medical guidance or delay seeking urgent care because of content read
                  on this site.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("disclaimer")}
              className="inline-flex min-h-[40px] shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 whitespace-nowrap transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              Read Full Disclaimer
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-2 text-center">
          <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
            Frequently Asked Questions
          </p>
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Common Questions About MediAI
          </h2>
        </div>

        <div className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div key={faq.question}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-slate-50/70 focus-visible:outline-2 focus-visible:outline-blue-600 dark:hover:bg-slate-800/50"
                >
                  <span className="font-display text-base font-semibold text-slate-900 dark:text-white">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
