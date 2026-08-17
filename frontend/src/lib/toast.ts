// src/lib/toast.ts
export type ToastVariant = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
}

type Listener = (toast: ToastMessage) => void;

const listeners = new Set<Listener>();

function emit(variant: ToastVariant, title: string, description?: string) {
  const message: ToastMessage = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    variant,
    title,
    description,
  };
  listeners.forEach((listener) => listener(message));
}

export const toast = {
  success: (title: string, description?: string) => emit("success", title, description),
  error: (title: string, description?: string) => emit("error", title, description),
  info: (title: string, description?: string) => emit("info", title, description),
};

export function subscribeToToasts(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}