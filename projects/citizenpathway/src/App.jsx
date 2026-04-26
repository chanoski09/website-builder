import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { AnimatePresence, motion } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import Home from '@/pages/Home';
import Flashcards from '@/pages/Flashcards';
import VoicePage from '@/pages/VoicePage';
import Progress from '@/pages/Progress';
import Interview from '@/pages/Interview';
import Settings from '@/pages/Settings';
import Community from '@/pages/Community';
import Quiz from '@/pages/Quiz';
import N400Form from '@/pages/N400Form';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import Politicians from '@/pages/Politicians';
import Login from '@/pages/Login';

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

function AnimatedPage({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Loading Citizen Pathway...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />
          <Route path="/flashcards" element={<AnimatedPage><Flashcards /></AnimatedPage>} />
          <Route path="/voice" element={<AnimatedPage><VoicePage /></AnimatedPage>} />
          <Route path="/progress" element={<AnimatedPage><Progress /></AnimatedPage>} />
          <Route path="/interview" element={<AnimatedPage><Interview /></AnimatedPage>} />
          <Route path="/settings" element={<AnimatedPage><Settings /></AnimatedPage>} />
          <Route path="/community" element={<AnimatedPage><Community /></AnimatedPage>} />
          <Route path="/quiz" element={<AnimatedPage><Quiz /></AnimatedPage>} />
          <Route path="/n400" element={<AnimatedPage><N400Form /></AnimatedPage>} />
          <Route path="/privacy" element={<AnimatedPage><PrivacyPolicy /></AnimatedPage>} />
          <Route path="/politicians" element={<AnimatedPage><Politicians /></AnimatedPage>} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App