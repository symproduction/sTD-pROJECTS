import { AlertTriangle, ServerCrash } from "lucide-react";

interface ApiNoticeBannerProps {
  title: string;
  message: string;
  variant?: "config" | "error";
}

export function ApiNoticeBanner({
  title,
  message,
  variant = "config",
}: ApiNoticeBannerProps) {
  const isConfig = variant === "config";

  return (
    <div
      role="alert"
      className={`rounded-xl border p-4 sm:p-5 ${
        isConfig
          ? "border-amber-200 bg-amber-50/70 text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-100"
          : "border-red-200 bg-red-50/70 text-red-950 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-100"
      }`}
    >
      <div className="flex items-start gap-3">
        {isConfig ? (
          <ServerCrash
            className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400"
            aria-hidden="true"
          />
        ) : (
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-red-700 dark:text-red-400"
            aria-hidden="true"
          />
        )}
        <div className="space-y-1 text-sm">
          <p className="font-display font-semibold">{title}</p>
          <p className="leading-relaxed opacity-90">{message}</p>
        </div>
      </div>
    </div>
  );
}
