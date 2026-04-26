import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { BookOpen, Mic, Shield, ClipboardList, BarChart2, FileText } from 'lucide-react';

const features = [
  { icon: BookOpen, label: 'Flashcards', desc: 'Study all 128 official civics questions with flip cards' },
  { icon: Mic, label: 'Voice Practice', desc: 'Speak your answers and get instant AI feedback' },
  { icon: Shield, label: 'Mock Interview', desc: 'Simulate a real USCIS interview with AI Officer Rivera' },
  { icon: ClipboardList, label: 'Quick Quiz', desc: 'Test yourself with 20 randomized questions' },
  { icon: FileText, label: 'N-400 Form', desc: 'Personalize your interview prep with your real info' },
  { icon: BarChart2, label: 'Progress Tracking', desc: 'Track streaks, XP, and mastery across all questions' },
];

export default function WelcomeModal({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm mx-auto rounded-2xl p-0 gap-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Hero */}
        <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-6 pt-8 pb-6 text-center">
          <div className="text-4xl mb-3">🇺🇸</div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold text-primary-foreground">
              Welcome to Citizen Pathway!
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/80 mt-2 text-sm leading-relaxed">
              Your all-in-one guide to preparing for the U.S. Citizenship Test & Interview. Study smarter, practice speaking, and build confidence.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Features */}
        <div className="px-5 py-5 space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">What you can do</p>
          {features.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-5 pb-6">
          <button
            onClick={onClose}
            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-base hover:bg-primary/90 transition-all active:scale-95 shadow-md"
          >
            Let's Get Started! 🚀
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}