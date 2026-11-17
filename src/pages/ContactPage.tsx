import { useState } from "react";
import { CheckCircle2, Clock, Loader2, Mail, MapPin, Send } from "lucide-react";
import { submitContactForm } from "../services/apiClient";

interface ContactPageProps {
  onToast: (type: "success" | "error" | "info", message: string) => void;
}

export function ContactPage({ onToast }: ContactPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("General Support");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    referenceCode: string;
    topic: string;
  } | null>(null);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (name.trim().length < 2) {
      nextErrors.name = "Please enter your full name (at least 2 characters).";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (message.trim().length < 10) {
      nextErrors.message = "Please include at least 10 characters in your message.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await submitContactForm({ name, email, topic, message });
      setConfirmation({ referenceCode: res.referenceCode, topic: res.topic });
      setName("");
      setEmail("");
      setMessage("");
      onToast("success", `Inquiry submitted (Ref: ${res.referenceCode}).`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not submit your inquiry.";
      onToast("error", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-2 border-b border-slate-200 pb-6 dark:border-slate-800">
        <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
          Support &amp; Feedback · Non-Emergency Inquiries
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Contact Us
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Have feedback on MediAI, accessibility suggestions, or partnership questions? Send us a
          note below. Do not submit personal medical emergencies through this form.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        {/* Contact Details */}
        <div className="space-y-4 lg:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Direct Channels
            </h2>
            <div className="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4.5 w-4.5 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Support Email</p>
                  <p>care@mediai-health.example</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4.5 w-4.5 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Response Hours</p>
                  <p>Monday – Friday, 9:00 AM – 5:00 PM PT</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4.5 w-4.5 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Clinical Literacy Lab</p>
                  <p>San Francisco, CA · Educational Platform</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-xs leading-relaxed text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-100">
            <p className="font-display font-semibold">Emergency Notice</p>
            <p className="mt-1">
              This contact form is not monitored by emergency medical personnel. If you are
              experiencing urgent symptoms, call 911 or your local emergency number immediately.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 lg:col-span-7 dark:border-slate-800 dark:bg-slate-900">
          {confirmation ? (
            <div className="space-y-4 py-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/70 dark:text-teal-400">
                <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                Message Received
              </h2>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Thank you for contacting MediAI regarding <span className="font-medium">{confirmation.topic}</span>.
                Your inquiry reference is{" "}
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {confirmation.referenceCode}
                </span>
                .
              </p>
              <button
                type="button"
                onClick={() => setConfirmation(null)}
                className="inline-flex min-h-[40px] items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-sm font-medium text-slate-800 dark:text-slate-200"
                  >
                    Full Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                    placeholder="Alex Morgan"
                    className="mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                  {errors.name && (
                    <p role="alert" className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-medium text-slate-800 dark:text-slate-200"
                  >
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    placeholder="alex@example.com"
                    className="mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                  {errors.email && (
                    <p role="alert" className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-topic"
                  className="block text-sm font-medium text-slate-800 dark:text-slate-200"
                >
                  Topic
                </label>
                <select
                  id="contact-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="General Support">General Support</option>
                  <option value="Report Explainer Feedback">Report Explainer Feedback</option>
                  <option value="Medicine Database Question">Medicine Database Question</option>
                  <option value="Accessibility & Privacy">Accessibility &amp; Privacy</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-sm font-medium text-slate-800 dark:text-slate-200"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (errors.message) setErrors((prev) => ({ ...prev, message: "" }));
                  }}
                  placeholder="Write your question or feedback here (please avoid sharing sensitive personal health records)..."
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
                {errors.message && (
                  <p role="alert" className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                    {errors.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" aria-hidden="true" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
