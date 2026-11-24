import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isStartPage = location.pathname === '/start';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-200 border-b ${
        isScrolled
          ? 'bg-bg/95 backdrop-blur-md border-border shadow-sm'
          : 'bg-bg/80 backdrop-blur-sm border-transparent'
      }`}
    >
      <div className="max-w-[1120px] mx-auto px-6 md:px-8 h-16 md:h-20 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 text-text group">
          <div className="relative flex items-center justify-center">
            <svg
              className="w-5 h-5 text-primary transition-transform duration-200 group-hover:scale-105"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <span className="hidden dark:block absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(220,38,38,0.9)]" />
          </div>
          <span className="font-display text-xl sm:text-2xl tracking-tight font-medium text-text">
            PathoPredict
          </span>
        </a>

        {/* Actions & Theme Toggle */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {!isStartPage && (
            <a
              href="/start"
              className="inline-flex items-center justify-center bg-primary hover:bg-primary-hover text-on-primary text-sm font-medium px-4 py-2 rounded-lg shadow-card hover:shadow-card-hover transition-all duration-150 font-sans"
            >
              Start a check
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
