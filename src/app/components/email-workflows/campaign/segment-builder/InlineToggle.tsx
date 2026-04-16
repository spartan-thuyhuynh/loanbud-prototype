interface InlineToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
}

export function InlineToggle({ checked, onChange }: InlineToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors focus:outline-none ${
        checked ? "bg-primary" : "bg-muted-foreground/30"
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
