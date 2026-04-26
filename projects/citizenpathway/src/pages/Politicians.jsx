import { useState, useEffect } from 'react';
import { ArrowLeft, Landmark, Loader2, RefreshCw, Volume2, Crown, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { invokeProxy } from '@/api/supabaseClient';
import { usePremium } from '@/lib/usePremium';
import PaywallModal from '@/components/PaywallModal';
import { speakText } from '@/lib/useSpeech';
import { US_STATES } from '@/lib/us-states';
import { FEDERAL_OFFICIALS } from '@/lib/federal-officials';

const CACHE_KEY = 'civics_politicians_cache';
const FEDERAL_TOGGLE_KEY = 'civics_show_federal';

export default function Politicians() {
  const { isPremium, isLoading } = usePremium();
  const [paywallOpen, setPaywallOpen] = useState(!isPremium);
  const [state, setState] = useState(() => localStorage.getItem('civics_user_state') || '');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [showFederal, setShowFederal] = useState(() => {
    const saved = localStorage.getItem(FEDERAL_TOGGLE_KEY);
    return saved === null ? true : saved === 'true';
  });

  const toggleFederal = () => {
    setShowFederal((v) => {
      localStorage.setItem(FEDERAL_TOGGLE_KEY, String(!v));
      return !v;
    });
  };

  useEffect(() => {
    if (!isPremium) { setPaywallOpen(true); return; }
    // Load cache for current state
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (cached && cached.state === state && state) {
      setData(cached.data);
    }
  }, [isPremium, state]);

  useEffect(() => { setPaywallOpen(!isPremium && !isLoading); }, [isPremium, isLoading]);

  const voiceGender = localStorage.getItem('civics_voice_gender') || 'male';
  const voiceSpeed = parseFloat(localStorage.getItem('civics_voice_speed')) || 1;

  const fetchPoliticians = async (targetState) => {
    if (!targetState) return;
    setLoading(true);
    setError(null);
    localStorage.setItem('civics_user_state', targetState);

    const schema = {
      type: 'object',
      properties: {
        state_officials: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              position: { type: 'string' },
              name: { type: 'string' },
              party: { type: 'string' },
              note: { type: 'string' }
            }
          }
        },
        as_of: { type: 'string' }
      }
    };

    const prompt = `List the CURRENT state-level U.S. politicians relevant to the USCIS civics naturalization test for a resident of ${targetState} (today's date: ${new Date().toISOString().slice(0,10)}).

Include these positions for ${targetState}:
- Governor of ${targetState}
- Both U.S. Senators from ${targetState}
- The U.S. Representative depends on the resident's district — add ONE entry with position "U.S. Representative" and name "Varies by district — check house.gov/representatives/find-your-representative" with an empty party.

For each, provide the most current officeholder's full name, party (if applicable), and a 1-sentence helpful note about their role. Set as_of to today's date. Be accurate with current officeholders as of today.`;

    try {
      const result = await invokeProxy('invoke_llm', {
        prompt,
        response_json_schema: schema,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
      });
      setData(result);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ state: targetState, data: result, cachedAt: new Date().toISOString() }));
    } catch (e) {
      setError('Could not fetch politicians. Please try again.');
    }
    setLoading(false);
  };

  const handleStateChange = (val) => {
    setState(val);
    if (val) fetchPoliticians(val);
  };

  const speak = (text) => speakText(text, 'en', voiceGender, voiceSpeed);

  if (!isPremium) {
    return (
      <>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 gap-6 text-center">
          <Link to="/" className="absolute top-6 left-4 p-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Politicians — Premium</h1>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Get an up-to-date list of elected officials for your state — exactly the names you'll need for the civics test.
            </p>
          </div>
          <button
            onClick={() => setPaywallOpen(true)}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold text-base active:scale-95 transition-all shadow-md"
          >
            Unlock with Pro
          </button>
        </div>
        <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} trigger="Upgrade" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-8" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <Link to="/" className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <h2 className="text-base md:text-lg font-bold text-foreground">Politicians</h2>
        <button
          onClick={() => fetchPoliticians(state)}
          disabled={!state || loading}
          className="p-2 rounded-xl hover:bg-muted transition-colors disabled:opacity-40"
          aria-label="Refresh"
        >
          <RefreshCw className={`w-5 h-5 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Intro */}
      <div className="mx-4 md:mx-8 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <Landmark className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-foreground">Your state's current officials</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              The civics test asks about current leaders. Select your state to see the names you need to know.
            </p>
          </div>
        </div>
      </div>

      {/* State selector */}
      <div className="mx-4 md:mx-8">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your State</label>
        <select
          value={state}
          onChange={(e) => handleStateChange(e.target.value)}
          className="mt-2 w-full bg-card border border-border rounded-xl px-4 py-3 text-sm font-semibold text-foreground outline-none focus:border-primary/40"
        >
          <option value="">Select your state…</option>
          {US_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Looking up current officials for {state}…</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mx-4 md:mx-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-center">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Federal Officials (always loaded, toggleable) */}
      <div className="mx-4 md:mx-8 flex flex-col gap-2">
        <button
          onClick={toggleFederal}
          className="flex items-center justify-between w-full px-1 py-1 hover:opacity-80 transition-opacity"
        >
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Federal Officials</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{showFederal ? 'Hide' : 'Show'}</span>
            {showFederal ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>
        {showFederal && (
          <div className="flex flex-col gap-2">
            {FEDERAL_OFFICIALS.map((p, i) => (
              <PoliticianCard key={i} p={p} onSpeak={speak} />
            ))}
          </div>
        )}
      </div>

      {/* State officials (from LLM) */}
      {!loading && data && (
        <div className="mx-4 md:mx-8 flex flex-col gap-5">
          <PoliticianSection title={`${state} State Officials`} items={data.state_officials} onSpeak={speak} />
          {data.as_of && (
            <p className="text-[10px] text-center text-muted-foreground mt-1">
              State info current as of {data.as_of}. Always verify with official sources.
            </p>
          )}
        </div>
      )}

      {/* Empty state */}
      {!loading && !data && !state && (
        <div className="mx-4 md:mx-8 bg-muted/40 rounded-2xl p-6 text-center">
          <p className="text-sm text-muted-foreground">Select your state above to load state officials.</p>
        </div>
      )}
    </div>
  );
}

function PoliticianSection({ title, items, onSpeak }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">{title}</h3>
      <div className="flex flex-col gap-2">
        {items.map((p, i) => (
          <PoliticianCard key={i} p={p} onSpeak={onSpeak} />
        ))}
      </div>
    </div>
  );
}

function PoliticianCard({ p, onSpeak }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-primary uppercase tracking-wide">{p.position}</p>
          <p className="text-base font-extrabold text-foreground mt-0.5">{p.name || '—'}</p>
          {p.party && (
            <span className="inline-block mt-1 text-[10px] font-bold bg-muted px-2 py-0.5 rounded-full text-muted-foreground uppercase tracking-wide">
              {p.party}
            </span>
          )}
          {p.note && <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{p.note}</p>}
        </div>
        {p.name && (
          <button
            onClick={() => onSpeak(`${p.position}: ${p.name}`)}
            className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex-shrink-0"
            aria-label="Read aloud"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}