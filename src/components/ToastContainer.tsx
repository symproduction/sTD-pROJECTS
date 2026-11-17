import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import type { ToastItem } from "../types/medical";

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0"
    >
      {toasts.map((toast) => {
        const icon =
          toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden="true" />
          ) : toast.type === "error" ? (
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
          ) : (
            <Info className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          );

        const borderClass =
          toast.type === "success"
            ? "border-teal-200 dark:border-teal-900"
            : toast.type === "error"
            ? "border-red-200 dark:border-red-900"
            : "border-blue-200 dark:border-blue-900";

        return (
          <div
            key={toast.id}
            role="status"
            className={`flex items-start gap-3 rounded-xl border bg-white p-3.5 text-sm text-slate-800 shadow-lg dark:bg-slate-900 dark:text-slate-100 ${borderClass}`}
          >
            <div className="mt-0.5">{icon}</div>
            <p className="flex-1 leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-blue-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
