import { useState, useEffect } from 'react';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-200 ${
        isScrolled
          ? 'bg-bg/90 backdrop-blur-md border-b border-hairline'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-[1120px] mx-auto px-[22px] min-[861px]:px-[32px] h-16 min-[861px]:h-20 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 text-text group">
          <svg
            className="w-5 h-5 text-accent transition-transform duration-200 group-hover:scale-105"
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
          <span className="font-display text-xl tracking-tight font-medium text-text">
            PathoPredict
          </span>
        </a>

        {/* Actions & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <a
            href="/sign-in"
            className="inline-flex items-center text-sm text-text-muted hover:text-text px-2.5 py-1.5 transition-colors duration-150 font-sans"
          >
            Sign in
          </a>
          <a
            href="/start"
            className="inline-flex items-center justify-center bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-lg shadow-card hover:shadow-card-hover transition-all duration-150 font-sans"
          >
            Start a check
          </a>
        </div>
      </div>
    </header>
  );
}

export default Header;
