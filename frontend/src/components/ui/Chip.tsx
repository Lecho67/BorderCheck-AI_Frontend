interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function Chip({ label, active = false, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
        active
          ? "bg-cobalt text-white"
          : "bg-slate-100 text-slate-600 hover:bg-cobalt/10 hover:text-cobalt"
      }`}
    >
      {label}
    </button>
  );
}
