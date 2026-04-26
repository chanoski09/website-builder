import MobileSelect from '@/components/MobileSelect';

export default function FormField({ label, value, onChange, type = 'text', placeholder, required, options, inputMode }) {
  if (type === 'select') {
    const mobileOptions = (options || []).map(opt => ({
      value: opt.value,
      label: opt.label,
    }));

    return (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-foreground">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <MobileSelect
          value={value || ''}
          onValueChange={onChange}
          options={[{ value: '', label: 'Select...' }, ...mobileOptions]}
          title={label}
          trigger={
            <button
              type="button"
              className="w-full text-left bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-transparent focus:border-primary/30 transition-colors"
            >
              <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
                {value ? mobileOptions.find(o => o.value === value)?.label || value : 'Select...'}
              </span>
            </button>
          }
        />
      </div>
    );
  }

  if (type === 'textarea') {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-foreground">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground outline-none border border-transparent focus:border-primary/30 resize-none"
        />
      </div>
    );
  }

  // Determine inputMode
  const resolvedInputMode = inputMode || (type === 'number' ? 'numeric' : type === 'tel' ? 'tel' : type === 'email' ? 'email' : undefined);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        inputMode={resolvedInputMode}
        value={value || ''}
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        placeholder={placeholder}
        className="bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground outline-none border border-transparent focus:border-primary/30"
      />
    </div>
  );
}