export function Footer() {
  return (
    <footer className="w-full border-t border-hairline bg-bg py-8 min-[861px]:py-10">
      <div className="max-w-[1120px] mx-auto px-[22px] min-[861px]:px-[32px] flex flex-col min-[861px]:flex-row items-start min-[861px]:items-center justify-between gap-4 min-[861px]:gap-8">
        {/* Logo Left */}
        <a href="/" className="flex items-center gap-2.5 text-text group flex-shrink-0">
          <svg
            className="w-4 h-4 text-red transition-transform duration-200 group-hover:scale-105"
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
          <span className="font-serif text-lg tracking-tight font-medium text-text">
            Pulse
          </span>
        </a>

        {/* One-Line Disclaimer Text Right (wraps on mobile) */}
        <p className="font-sans text-xs text-text-faint leading-relaxed text-left min-[861px]:text-right">
          Investigational clinical decision support. Not intended to replace diagnostic judgment
          by licensed healthcare professionals.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
