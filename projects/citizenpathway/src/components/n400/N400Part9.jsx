export default function N400Part9({ form, updateField }) {
  const questions = [
    { key: 'claimed_us_citizen', label: '1. Have you EVER claimed to be a U.S. citizen?' },
    { key: 'registered_to_vote', label: '2. Have you EVER registered to vote or voted in any U.S. election?' },
    { key: 'owes_taxes', label: '3. Do you currently owe any overdue Federal, state, or local taxes?' },
    { key: 'claimed_nonresident', label: '4. Have you called yourself a "nonresident alien" on a tax return?' },
    { key: 'communist_party', label: '5a. Have you EVER been associated with any Communist or totalitarian party?' },
    { key: 'has_criminal_record', label: '15. Have you EVER been arrested, cited, or charged with any crime or offense?' },
    { key: 'removal_proceedings', label: '20. Have you EVER been placed in removal or deportation proceedings?' },
    { key: 'deported', label: '21. Have you EVER been removed or deported from the United States?' },
    { key: 'selective_service', label: '22b. Did you register for the Selective Service? (Males 18-26)' },
    { key: 'served_military', label: '25. Have you EVER served in the U.S. armed forces?' },
  ];

  const oathQuestions = [
    { key: 'supports_constitution', label: '31. Do you support the Constitution and form of Government of the United States?' },
    { key: 'willing_to_take_oath', label: '34. Are you willing to take the full Oath of Allegiance to the United States?' },
    { key: 'willing_to_bear_arms', label: '35. If the law requires it, are you willing to bear arms on behalf of the United States?' },
    { key: 'willing_noncombatant', label: '36. If the law requires it, are you willing to perform noncombatant services?' },
    { key: 'willing_national_importance', label: '37. If the law requires it, are you willing to perform work of national importance?' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-foreground mb-1">Part 9. Additional Information About You</h3>
        <p className="text-xs text-muted-foreground mb-4">When a question includes "EVER," provide information about any actions anywhere in the world at any time.</p>
        <div className="flex flex-col gap-3">
          {questions.map(q => (
            <div key={q.key} className="flex items-start justify-between gap-3">
              <span className="text-xs text-foreground flex-1 leading-relaxed">{q.label}</span>
              <div className="flex rounded-full bg-muted p-0.5 gap-0.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => updateField(q.key, false)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                    form[q.key] === false || form[q.key] === undefined ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                  }`}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => updateField(q.key, true)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                    form[q.key] === true ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                  }`}
                >
                  Yes
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Oath section */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-foreground mb-1">Oath of Allegiance</h3>
        <p className="text-xs text-muted-foreground mb-4">These questions relate to the Oath you will take at the naturalization ceremony.</p>
        <div className="flex flex-col gap-3">
          {oathQuestions.map(q => (
            <div key={q.key} className="flex items-start justify-between gap-3">
              <span className="text-xs text-foreground flex-1 leading-relaxed">{q.label}</span>
              <div className="flex rounded-full bg-muted p-0.5 gap-0.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => updateField(q.key, false)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                    form[q.key] === false ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                  }`}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => updateField(q.key, true)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                    form[q.key] === true || form[q.key] === undefined ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                  }`}
                >
                  Yes
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-foreground">Contact Information</h3>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-foreground">Daytime Phone</label>
          <input type="tel" inputMode="tel" value={form.daytime_phone || ''} onChange={e => updateField('daytime_phone', e.target.value)} className="bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground outline-none border border-transparent focus:border-primary/30" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-foreground">Email Address</label>
          <input type="email" inputMode="email" value={form.email || ''} onChange={e => updateField('email', e.target.value)} className="bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground outline-none border border-transparent focus:border-primary/30" />
        </div>
      </div>
    </div>
  );
}