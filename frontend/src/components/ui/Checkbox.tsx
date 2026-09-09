interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

export function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-slate-300 text-cobalt focus:ring-cobalt"
      />
      <span className={checked ? "line-through text-slate-400" : ""}>{label}</span>
    </label>
  );
}
