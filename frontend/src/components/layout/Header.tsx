import { useState, useEffect } from 'react';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          ? 'bg-[#0a0d12]/85 backdrop-blur-md border-b border-hairline'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-[1120px] mx-auto px-[22px] min-[861px]:px-[32px] h-16 min-[861px]:h-20 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 text-text group">
          <svg
            className="w-5 h-5 text-red transition-transform duration-200 group-hover:scale-105"
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
          <span className="font-serif text-xl tracking-tight font-medium text-text">
            PathoPredict
          </span>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden min-[861px]:flex items-center gap-8 font-sans text-sm tracking-wide">
          <a
            href="#why-pathopredict"
            className="text-text-muted hover:text-text transition-colors duration-150"
          >
            Why PathoPredict
          </a>
          <a
            href="#how-it-works"
            className="text-text-muted hover:text-text transition-colors duration-150"
          >
            How it works
          </a>
          <a
            href="#what-you-get"
            className="text-text-muted hover:text-text transition-colors duration-150"
          >
            What you get
          </a>
        </nav>

        {/* Actions & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <a
            href="#sign-in"
            className="hidden min-[861px]:inline-flex items-center text-sm text-text-muted hover:text-text px-3 py-1.5 transition-colors duration-150 font-sans"
          >
            Sign in
          </a>
          <a
            href="/start"
            className="inline-flex items-center justify-center bg-red hover:bg-red-dim text-text text-sm font-medium px-3.5 py-1.5 rounded-[3px] border border-transparent transition-colors duration-150 font-sans"
          >
            Start a check
          </a>

          {/* Mobile toggle button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="min-[861px]:hidden inline-flex items-center justify-center p-1.5 text-text-muted hover:text-text rounded-[3px] border border-hairline focus:outline-none"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {mobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Links */}
      {mobileMenuOpen && (
        <div className="min-[861px]:hidden bg-panel border-b border-hairline px-[22px] py-4">
          <nav className="flex flex-col gap-3 font-sans text-sm">
            <a
              href="#why-pathopredict"
              onClick={() => setMobileMenuOpen(false)}
              className="text-text-muted hover:text-text py-1 transition-colors duration-150"
            >
              Why PathoPredict
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-text-muted hover:text-text py-1 transition-colors duration-150"
            >
              How it works
            </a>
            <a
              href="#what-you-get"
              onClick={() => setMobileMenuOpen(false)}
              className="text-text-muted hover:text-text py-1 transition-colors duration-150"
            >
              What you get
            </a>
            <div className="pt-3 mt-1 border-t border-hairline flex items-center justify-between">
              <a
                href="#sign-in"
                onClick={() => setMobileMenuOpen(false)}
                className="text-text-muted hover:text-text py-1 transition-colors duration-150"
              >
                Sign in
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
