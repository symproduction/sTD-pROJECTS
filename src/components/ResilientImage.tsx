import { useState } from "react";
import { HeartPulse } from "lucide-react";

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function ResilientImage({
  src,
  alt,
  className = "",
  fallbackTitle = "MediAI Clinical View",
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-blue-50 via-slate-50 to-teal-50 p-6 text-center dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 ${className}`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-200 bg-white text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-400">
          <HeartPulse className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="font-display text-sm font-semibold text-slate-700 dark:text-slate-300">
          {fallbackTitle}
        </p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
