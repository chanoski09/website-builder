export default function N400Part1({ form, updateField }) {
  const options = [
    { value: 'general_provision', label: 'A. General Provision (5 years as permanent resident)' },
    { value: 'spouse_of_citizen', label: 'B. Spouse of U.S. Citizen (3 years)' },
    { value: 'vawa', label: 'C. VAWA (Violence Against Women Act)' },
    { value: 'spouse_qualified_employment', label: 'D. Spouse of U.S. Citizen in Qualified Employment Abroad' },
    { value: 'military_hostilities', label: 'E. Military Service During Period of Hostilities' },
    { value: 'military_honorable', label: 'F. At Least One Year of Honorable Military Service' },
    { value: 'other', label: 'G. Other Reason' },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
      <h3 className="text-sm font-bold text-foreground mb-1">Part 1. Information About Your Eligibility</h3>
      <p className="text-xs text-muted-foreground mb-4">Select only one box to identify the basis of your eligibility.</p>
      <div className="flex flex-col gap-2">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => updateField('eligibility_basis', opt.value)}
            className={`text-left px-3 py-3 rounded-xl text-xs font-medium transition-all ${
              form.eligibility_basis === opt.value
                ? 'bg-primary/10 border border-primary/30 text-primary'
                : 'bg-muted/50 border border-transparent text-foreground hover:bg-muted'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}