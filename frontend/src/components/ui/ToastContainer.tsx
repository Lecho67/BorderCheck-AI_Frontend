// src/components/ui/ToastContainer.tsx
import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { subscribeToToasts, type ToastMessage } from "@/lib/toast";

const AUTO_DISMISS_MS = 6000;

const variantStyles: Record<ToastMessage["variant"], string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-700",
  info: "border-blue-200 bg-blue-50 text-cobalt",
};

const variantIcon: Record<ToastMessage["variant"], typeof Info> = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    return subscribeToToasts((message) => {
      setToasts((prev) => [...prev, message]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== message.id));
      }, AUTO_DISMISS_MS);
    });
  }, []);

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0">
      {toasts.map((t) => {
        const Icon = variantIcon[t.variant];
        return (
          <div
            key={t.id}
            role="alert"
            className={`flex items-start gap-3 rounded-xl border p-4 text-sm shadow transition-opacity ${variantStyles[t.variant]}`}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1">
              <p className="font-medium">{t.title}</p>
              {t.description && <p className="mt-0.5 text-xs opacity-90">{t.description}</p>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="opacity-60 transition-opacity hover:opacity-100"
              aria-label="Cerrar notificación"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}