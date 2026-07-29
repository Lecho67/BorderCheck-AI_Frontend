import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="text-xs font-medium text-slate-500 mb-1 block">{label}</label>}
        <input
          ref={ref}
          className={`w-full rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent ${
            error ? "border-red-400" : "border-slate-300"
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
