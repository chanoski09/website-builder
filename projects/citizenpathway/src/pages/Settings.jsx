import { useState } from 'react';
import { ArrowLeft, Check, Globe, Moon, Sun, Trash2, Volume2, Gauge, Info, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SUPPORTED_LANGUAGES } from '@/lib/questions-data';
import { useTheme } from '@/lib/useTheme';
import { auth as supaAuth } from '@/api/supabaseClient';
import { APP_VERSION, APP_BUILD_DATE } from '@/lib/version';
import { usePremium } from '@/lib/usePremium';
import PaywallModal from '@/components/PaywallModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function Settings() {
  const [translatedLang, setTranslatedLang] = useState(() => {
    return localStorage.getItem('civics_translate_lang') || 'en';
  });
  const [voiceGender, setVoiceGender] = useState(() => {
    return localStorage.getItem('civics_voice_gender') || 'male';
  });
  const [voiceSpeed, setVoiceSpeed] = useState(() => {
    const stored = parseFloat(localStorage.getItem('civics_voice_speed'));
    return isNaN(stored) ? 1 : stored;
  });
  const { theme, toggleTheme } = useTheme();
  const { isPremium } = usePremium();
  const [paywallOpen, setPaywallOpen] = useState(false);

  const handleLanguageChange = (code) => {
    setTranslatedLang(code);
    localStorage.setItem('civics_translate_lang', code);
  };

  const handleVoiceChange = (gender) => {
    setVoiceGender(gender);
    localStorage.setItem('civics_voice_gender', gender);
  };

  const handleSpeedChange = (speed) => {
    setVoiceSpeed(speed);
    localStorage.setItem('civics_voice_speed', String(speed));
  };

  return (
    <div className="min-h-screen bg-background py-6 md:py-8 flex flex-col gap-5 md:gap-6 pb-24 md:px-8 md:max-w-3xl md:mx-auto md:w-full">
      <div className="flex items-center justify-between px-4 md:px-0" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <Link to="/" className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <h2 className="text-base font-bold text-foreground">Settings</h2>
        <div className="w-9" />
      </div>

      {/* Premium status */}
      <div className="mx-4 md:mx-0">
        {isPremium ? (
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl p-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold">Citizen Pathway Pro</h3>
                <p className="text-xs text-white/80">Premium features unlocked. Thank you!</p>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setPaywallOpen(true)}
            className="w-full bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl p-4 shadow-md text-left active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Crown className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-extrabold">Upgrade to Pro</h3>
                <p className="text-xs text-white/90">$5.97/mo or $64.95/yr · Unlock everything</p>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Dark Mode Toggle */}
      <div className="mx-4 md:mx-0">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-primary" />
              ) : (
                <Sun className="w-5 h-5 text-primary" />
              )}
              <div>
                <h3 className="text-sm font-bold text-foreground">Appearance</h3>
                <p className="text-xs text-muted-foreground">
                  {theme === 'dark' ? 'Dark mode is on' : 'Light mode is on'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
                theme === 'dark' ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
                theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Voice Gender */}
      <div className="mx-4 md:mx-0">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Volume2 className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-sm font-bold text-foreground">Voice Preference</h3>
              <p className="text-xs text-muted-foreground">Choose the voice used for reading questions and answers.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleVoiceChange('male')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                voiceGender === 'male' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              👨 Male
            </button>
            <button
              onClick={() => handleVoiceChange('female')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                voiceGender === 'female' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              👩 Female
            </button>
          </div>
        </div>
      </div>

      {/* Voice Speed */}
      <div className="mx-4 md:mx-0">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Gauge className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-sm font-bold text-foreground">Voice Speed</h3>
              <p className="text-xs text-muted-foreground">Adjust how fast the AI reads questions and answers.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleSpeedChange(0.75)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                voiceSpeed === 0.75 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              🐢 Slow
              <span className="text-[10px] font-normal opacity-70">0.75x</span>
            </button>
            <button
              onClick={() => handleSpeedChange(1)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                voiceSpeed === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              🐇 Normal
              <span className="text-[10px] font-normal opacity-70">1x</span>
            </button>
          </div>
        </div>
      </div>

      {/* Translation Language */}
      <div className="mx-4 md:mx-0">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-sm font-bold text-foreground">Translation Language</h3>
              <p className="text-xs text-muted-foreground">
                Questions are always in English. Choose a language to see translated answers.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 max-h-[400px] overflow-y-auto">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  translatedLang === lang.code
                    ? 'bg-primary/10 border border-primary/30'
                    : 'bg-muted/50 hover:bg-muted border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{lang.flag}</span>
                  <span className={`text-sm font-semibold ${translatedLang === lang.code ? 'text-primary' : 'text-foreground'}`}>
                    {lang.label}
                  </span>
                  {lang.code === 'en' && (
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">Default</span>
                  )}
                </div>
                {translatedLang === lang.code && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mx-4 md:mx-0 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-3">
        <p className="text-xs text-blue-700 dark:text-blue-300 text-center font-medium">
          💡 Translations are AI-generated to help you understand the answers in your preferred language.
          The actual test is conducted in English.
        </p>
      </div>

      {/* Version indicator */}
      <div className="mx-4 md:mx-0">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-foreground">App Version</h3>
              <p className="text-xs text-muted-foreground">
                v{APP_VERSION} · Updated {APP_BUILD_DATE}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account */}
      <div className="mx-4 md:mx-0">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Trash2 className="w-5 h-5 text-red-500" />
            <div>
              <h3 className="text-sm font-bold text-red-700 dark:text-red-400">Delete Account</h3>
              <p className="text-xs text-red-600/70 dark:text-red-400/70">
                Permanently delete your account and all progress data.
              </p>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all active:scale-95">
                Delete My Account
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-sm mx-4 rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-600">Delete Account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your account and all study progress. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
                  onClick={() => {
                    localStorage.removeItem('civics_progress');
                    localStorage.removeItem('civics_streak');
                    localStorage.removeItem('civics_theme');
                    localStorage.removeItem('civics_theme_manual');
                    localStorage.removeItem('civics_translate_lang');
                    localStorage.removeItem('civics_voice_gender');
                    localStorage.removeItem('civics_flashcard_index');
                    localStorage.removeItem('civics_flashcard_filter');
                    localStorage.removeItem('civics_voice_index');
                    localStorage.removeItem('civics_voice_mode');
                    supaAuth.logout('/');
                  }}
                >
                  Yes, Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </div>
  );
}