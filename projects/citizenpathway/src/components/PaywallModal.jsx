import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Crown, Check, Sparkles, X } from 'lucide-react';
import { PRICING } from '@/lib/usePremium';
import { auth as supaAuth } from '@/api/supabaseClient';

const benefits = [
  'Unlimited AI mock interviews',
  'Unlimited flashcard study sessions',
  'Unlimited voice practice',
  'Unlock all 10 mastery badges',
  'Advanced progress analytics',
  'Ad-free experience',
  'Priority support',
];

export default function PaywallModal({ open, onClose, trigger = 'Upgrade' }) {
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [upgrading, setUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      // Note: this is a placeholder upgrade flow — in production, integrate a payment provider (e.g. Stripe).
      await supaAuth.updateMe({
        is_premium: true,
        premium_plan: selectedPlan,
        premium_since: new Date().toISOString(),
      });
      window.location.reload();
    } catch (e) {
      setUpgrading(false);
      alert('Upgrade failed. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm mx-auto rounded-2xl p-0 gap-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button onClick={onClose} className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
          <X className="w-4 h-4" />
        </button>

        {/* Hero */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-pink-500 text-white px-6 pt-8 pb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur mb-3">
            <Crown className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold">Unlock Citizen Pathway Pro</h2>
          <p className="text-white/90 mt-2 text-sm leading-relaxed px-2">
            {trigger === 'limit'
              ? "You've reached your free limit. Upgrade to keep studying without interruption."
              : 'Go unlimited and ace your citizenship test with confidence.'}
          </p>
        </div>

        {/* Benefits */}
        <div className="px-5 pt-5 pb-3 space-y-2.5">
          {benefits.map((b) => (
            <div key={b} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
              </div>
              <p className="text-sm text-foreground">{b}</p>
            </div>
          ))}
        </div>

        {/* Plan selection */}
        <div className="px-5 pt-3 pb-4 space-y-2">
          <button
            onClick={() => setSelectedPlan('yearly')}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
              selectedPlan === 'yearly'
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-foreground">Yearly</p>
                  <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Best value
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{PRICING.yearly.label}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedPlan === 'yearly' ? 'border-primary bg-primary' : 'border-muted-foreground/40'
              }`}>
                {selectedPlan === 'yearly' && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedPlan('monthly')}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
              selectedPlan === 'monthly'
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-foreground">Monthly</p>
                <p className="text-xs text-muted-foreground mt-0.5">{PRICING.monthly.label}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedPlan === 'monthly' ? 'border-primary bg-primary' : 'border-muted-foreground/40'
              }`}>
                {selectedPlan === 'monthly' && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
            </div>
          </button>
        </div>

        {/* CTA */}
        <div className="px-5 pb-6 space-y-2">
          <button
            onClick={handleUpgrade}
            disabled={upgrading}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold text-base active:scale-95 transition-all shadow-md disabled:opacity-60"
          >
            {upgrading ? 'Upgrading…' : `Upgrade — ${selectedPlan === 'yearly' ? PRICING.yearly.label : PRICING.monthly.label}`}
          </button>
          <button onClick={onClose} className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
            Maybe later
          </button>
          <p className="text-[10px] text-center text-muted-foreground leading-relaxed px-2 mt-1">
            Cancel anytime. Prices in USD.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}