interface ProgressBarProps {
  step: number;
  steps: string[];
}

export function ProgressBar({ step, steps }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-2 flex-1">
          <div className="flex items-center gap-2 w-full">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                i < step
                  ? "bg-brand-blue text-white"
                  : i === step
                  ? "bg-brand-blue text-white ring-4 ring-blue-100"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {i < step ? "✓" : i + 1}
            </div>
            <span className={`text-sm hidden sm:inline ${i === step ? "text-slate-900 font-medium" : "text-slate-400"}`}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-0.5 flex-1 rounded ${i < step ? "bg-brand-blue" : "bg-slate-200"}`}></div>
          )}
        </div>
      ))}
    </div>
  );
}
