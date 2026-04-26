import FormField from '@/components/n400/FormField';

export default function N400Part4And5({ form, updateField }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Part 4 */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-foreground">Part 4. Information About Your Residence</h3>
        <FormField label="Street Address" value={form.current_address} onChange={v => updateField('current_address', v)} />
        <div className="grid grid-cols-2 gap-3">
          <FormField label="City or Town" value={form.current_city} onChange={v => updateField('current_city', v)} />
          <FormField label="State" value={form.current_state} onChange={v => updateField('current_state', v)} />
        </div>
        <FormField label="ZIP Code" value={form.current_zip} onChange={v => updateField('current_zip', v)} inputMode="numeric" />
      </div>

      {/* Part 5 */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-foreground">Part 5. Marital History</h3>
        <FormField
          label="1. Current Marital Status"
          type="select"
          value={form.marital_status}
          onChange={v => updateField('marital_status', v)}
          options={[
            { value: 'single', label: 'Single, Never Married' },
            { value: 'married', label: 'Married' },
            { value: 'divorced', label: 'Divorced' },
            { value: 'widowed', label: 'Widowed' },
            { value: 'separated', label: 'Separated' },
            { value: 'annulled', label: 'Marriage Annulled' },
          ]}
        />
        <FormField label="3. Times Married" type="number" value={form.times_married} onChange={v => updateField('times_married', v)} />

        {(form.marital_status === 'married' || form.marital_status === 'separated') && (
          <>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2">Current Spouse</p>
            <FormField label="Spouse's Last Name" value={form.spouse_family_name} onChange={v => updateField('spouse_family_name', v)} />
            <FormField label="Spouse's First Name" value={form.spouse_given_name} onChange={v => updateField('spouse_given_name', v)} />
            <FormField label="Spouse's Date of Birth" type="date" value={form.spouse_dob} onChange={v => updateField('spouse_dob', v)} />
            <FormField label="Date of Marriage" type="date" value={form.marriage_date} onChange={v => updateField('marriage_date', v)} />
            <FormField
              label="Spouse U.S. Citizen?"
              type="select"
              value={form.spouse_us_citizen}
              onChange={v => updateField('spouse_us_citizen', v)}
              options={[
                { value: 'by_birth', label: 'By Birth in the U.S.' },
                { value: 'other', label: 'Naturalized / Other' },
                { value: 'not_citizen', label: 'Not a U.S. Citizen' },
              ]}
            />
          </>
        )}
      </div>
    </div>
  );
}