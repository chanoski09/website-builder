import FormField from '@/components/n400/FormField';

export default function N400Part2({ form, updateField }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-foreground mb-4">Part 2. Information About You</h3>
        
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">1. Current Legal Name</p>
          <FormField label="Family Name (Last Name)" value={form.family_name} onChange={v => updateField('family_name', v)} required />
          <FormField label="Given Name (First Name)" value={form.given_name} onChange={v => updateField('given_name', v)} required />
          <FormField label="Middle Name (if applicable)" value={form.middle_name} onChange={v => updateField('middle_name', v)} />
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">2. Other Names Used Since Birth</p>
          <FormField label="Other names (maiden, aliases)" value={form.other_names} onChange={v => updateField('other_names', v)} />
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">5. Sex</p>
          <div className="flex gap-2">
            {['male', 'female'].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => updateField('sex', s)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  form.sex === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {s === 'male' ? 'Male' : 'Female'}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <FormField label="6. Date of Birth" type="date" value={form.date_of_birth} onChange={v => updateField('date_of_birth', v)} />
          <FormField label="7. Date Became Lawful Permanent Resident" type="date" value={form.date_became_resident} onChange={v => updateField('date_became_resident', v)} />
          <FormField label="8. Country of Birth" value={form.country_of_birth} onChange={v => updateField('country_of_birth', v)} />
          <FormField label="9. Country of Citizenship or Nationality" value={form.country_of_nationality} onChange={v => updateField('country_of_nationality', v)} />
          <FormField label="A-Number" value={form.a_number} onChange={v => updateField('a_number', v)} placeholder="A-XXXXXXXXX" />
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">10. Parent a U.S. Citizen before your 18th birthday?</p>
          <YesNo value={form.parent_us_citizen} onChange={v => updateField('parent_us_citizen', v)} />
        </div>
      </div>
    </div>
  );
}

function YesNo({ value, onChange }) {
  return (
    <div className="flex gap-2">
      <button type="button" onClick={() => onChange(true)} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${value === true ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>Yes</button>
      <button type="button" onClick={() => onChange(false)} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${value === false ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>No</button>
    </div>
  );
}