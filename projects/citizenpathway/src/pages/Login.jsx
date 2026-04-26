import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '@/api/supabaseClient';
import { GraduationCap, Mail, Lock, Loader2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const next = params.get('next') || '/';

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  // If the user is already signed in, bounce them to `next`.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && !cancelled) navigate(next, { replace: true });
    })();
    return () => { cancelled = true; };
  }, [navigate, next]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate(next, { replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name || null },
            emailRedirectTo: window.location.origin + next,
          },
        });
        if (error) throw error;
        if (data.session) {
          // Confirmations off — immediate sign-in
          navigate(next, { replace: true });
        } else {
          setInfo("Check your email for a confirmation link to finish signing up.");
        }
      }
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMagicLink = async () => {
    setError(null);
    setInfo(null);
    if (!email) {
      setError('Enter your email to receive a sign-in link.');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin + next },
      });
      if (error) throw error;
      setInfo('Check your email for a magic sign-in link.');
    } catch (err) {
      setError(err?.message || 'Could not send magic link.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">Citizen Pathway</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === 'signin' ? 'Sign in to continue your study journey.' : 'Create your free account.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'signup' && (
            <div className="bg-card border border-border rounded-xl px-4 py-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Name (optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none mt-1"
              />
            </div>
          )}
          <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3">
            <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              required
            />
          </div>
          <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3">
            <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signin' ? 'Password' : 'Create a password (min 6)'}
              minLength={6}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
              <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
          {info && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2">
              <p className="text-xs text-emerald-700 dark:text-emerald-300">{info}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>

          <button
            type="button"
            onClick={handleMagicLink}
            disabled={submitting}
            className="w-full py-2.5 bg-muted text-muted-foreground rounded-xl font-semibold text-xs active:scale-[0.98] transition-all disabled:opacity-60"
          >
            Email me a magic link
          </button>
        </form>

        {/* Mode toggle */}
        <div className="text-center mt-6">
          {mode === 'signin' ? (
            <p className="text-xs text-muted-foreground">
              Don&apos;t have an account?{' '}
              <button
                onClick={() => { setMode('signup'); setError(null); setInfo(null); }}
                className="text-primary font-bold hover:underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Already have an account?{' '}
              <button
                onClick={() => { setMode('signin'); setError(null); setInfo(null); }}
                className="text-primary font-bold hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to="/privacy" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
