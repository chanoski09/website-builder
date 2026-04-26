import FormField from '@/components/n400/FormField';

export default function N400Part8({ form, updateField }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
      <h3 className="text-sm font-bold text-foreground">Part 8. Time Outside the United States</h3>
      <p className="text-xs text-muted-foreground">List all trips outside the U.S. during the last 5 years (excluding day trips under 24 hours).</p>
      <FormField
        label="Trips Summary"
        type="textarea"
        value={form.time_outside_us}
        onChange={v => updateField('time_outside_us', v)}
        placeholder="e.g., Mexico, 01/2023 - 02/2023 (30 days); India, 06/2024 - 07/2024 (45 days)..."
      />
    </div>
  );
}