import { useTheme } from '../../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="group relative inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full border border-border bg-surface hover:border-border transition-all duration-200 text-xs font-sans text-muted hover:text-text shadow-card"
      aria-label={`Toggle theme (currently ${theme})`}
      title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} mode`}
    >
      <span className="flex items-center gap-1.5">
        {theme === 'light' ? (
          <>
            {/* Sun Icon */}
            <svg
              className="w-3.5 h-3.5 text-warn"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
            <span className="hidden sm:inline text-[11px] font-medium tracking-wide">Light</span>
          </>
        ) : (
          <>
            {/* Red and Blue Dots */}
            <span className="flex items-center -space-x-1" aria-hidden="true">
              <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#1D4ED8] dark:bg-[#93C5FD] shadow-[0_0_8px_rgba(147,197,253,0.6)]" />
            </span>
            <span className="hidden sm:inline text-[11px] font-medium tracking-wide text-text font-semibold">
              Dark
            </span>
          </>
        )}
      </span>
    </button>
  );
}

export default ThemeToggle;
