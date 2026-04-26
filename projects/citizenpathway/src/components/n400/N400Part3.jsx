import FormField from '@/components/n400/FormField';

export default function N400Part3({ form, updateField }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-foreground">Part 3. Biographic Information</h3>
      
      <FormField
        label="1. Ethnicity"
        type="select"
        value={form.ethnicity}
        onChange={v => updateField('ethnicity', v)}
        options={[
          { value: 'hispanic_latino', label: 'Hispanic or Latino' },
          { value: 'not_hispanic_latino', label: 'Not Hispanic or Latino' },
        ]}
      />

      <FormField label="2. Race" value={form.race} onChange={v => updateField('race', v)} placeholder="e.g., White, Asian, Black..." />

      <div className="grid grid-cols-2 gap-3">
        <FormField label="3. Height (Feet)" type="number" value={form.height_feet} onChange={v => updateField('height_feet', v)} />
        <FormField label="Height (Inches)" type="number" value={form.height_inches} onChange={v => updateField('height_inches', v)} />
      </div>

      <FormField label="4. Weight (Pounds)" type="number" value={form.weight_pounds} onChange={v => updateField('weight_pounds', v)} />

      <FormField
        label="5. Eye Color"
        type="select"
        value={form.eye_color}
        onChange={v => updateField('eye_color', v)}
        options={['black','blue','brown','gray','green','hazel','maroon','pink','unknown'].map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
      />

      <FormField
        label="6. Hair Color"
        type="select"
        value={form.hair_color}
        onChange={v => updateField('hair_color', v)}
        options={['bald','black','blond','brown','gray','red','sandy','white','unknown'].map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
      />
    </div>
  );
}