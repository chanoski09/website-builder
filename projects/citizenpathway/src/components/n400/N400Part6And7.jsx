import FormField from '@/components/n400/FormField';

export default function N400Part6And7({ form, updateField }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Part 6 */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-foreground">Part 6. Information About Your Children</h3>
        <FormField label="Total children under 18" type="number" inputMode="numeric" value={form.number_of_children} onChange={v => updateField('number_of_children', v)} />
      </div>

      {/* Part 7 */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-foreground">Part 7. Employment and Schools</h3>
        <p className="text-xs text-muted-foreground">List your most recent employment or school.</p>
        <FormField label="Employer or School Name" value={form.employer_name} onChange={v => updateField('employer_name', v)} />
        <FormField label="Occupation or Field of Study" value={form.occupation} onChange={v => updateField('occupation', v)} />
      </div>
    </div>
  );
}