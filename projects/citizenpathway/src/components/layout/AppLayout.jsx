import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { BookOpen, BarChart2, Home, Users, ClipboardList } from 'lucide-react';
import { useTheme } from '@/lib/useTheme';
import { useRef, useEffect, useCallback } from 'react';

// Bottom nav mirrors the design handoff (Citizen Pathway UI Screens):
// 5 tabs — Home / Study / Quiz / Progress / Community.
// Voice Practice and Interview Simulator live under the Home action cards,
// not as their own tabs — matches the mockup's nav model.
const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/flashcards', icon: BookOpen, label: 'Study' },
  { path: '/quiz', icon: ClipboardList, label: 'Quiz' },
  { path: '/progress', icon: BarChart2, label: 'Progress' },
  { path: '/community', icon: Users, label: 'Community' },
];

const TAB_ROOTS = navItems.map(n => n.path);

export default function AppLayout() {
  useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const scrollPositions = useRef({});
  const prevPath = useRef(location.pathname);

  // Save scroll position when leaving, restore when entering
  useEffect(() => {
    const prev = prevPath.current;
    // Save scroll for the page we're leaving
    scrollPositions.current[prev] = window.scrollY;
    prevPath.current = location.pathname;

    // Restore scroll for the page we're entering
    if (scrollPositions.current[location.pathname] != null) {
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPositions.current[location.pathname]);
      });
    } else {
      // New page — scroll to top
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  // Find which tab root the current path belongs to
  const activeTab = TAB_ROOTS.find(root =>
    root === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(root)
  ) || '/';

  const handleTabClick = useCallback((path) => {
    if (path === activeTab && location.pathname === path) {
      // Already on root of active tab — scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (path === activeTab && location.pathname !== path) {
      // On a child page of this tab — reset to root
      scrollPositions.current[path] = 0;
      navigate(path);
    } else {
      // Switching tabs
      navigate(path);
    }
  }, [activeTab, location.pathname, navigate]);

  return (
    <div className="app-shell flex flex-col max-w-md md:max-w-3xl lg:max-w-5xl mx-auto relative">
      <main className="flex-1 main-safe-bottom">
        <Outlet />
      </main>

      {/* Bottom Navigation — sits flush to the device edge, with safe-area
          padding applied to the inner row so icons stay above the home
          indicator on iOS while the card itself extends to the bottom. */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-3xl lg:max-w-5xl bg-card border-t border-border z-50 bottom-nav-safe">
        <div className="flex items-center justify-around py-1 px-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(path);
            return (
              <button
                key={path}
                onClick={() => handleTabClick(path)}
                className={`flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all duration-200 ${isActive ? 'bg-primary/10' : ''}`}>
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span className={`text-[10px] font-bold tracking-wide ${isActive ? 'text-primary' : ''}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}