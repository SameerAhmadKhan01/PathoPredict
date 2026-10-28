export function Hero() {
  return (
    <section className="relative w-full py-[56px] min-[861px]:py-[96px]">
      <div className="max-w-[1120px] mx-auto px-[22px] min-[861px]:px-[32px]">
        <div className="grid grid-cols-1 min-[861px]:grid-cols-2 gap-10 min-[861px]:gap-16 items-center">
          {/* Left Column: Copy */}
          <div className="flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-lg border border-hairline bg-soft-shell text-xs text-text-muted font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>Predictive Clinical Intelligence</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl min-[861px]:text-[58px] leading-[1.12] font-normal tracking-[-0.02em] text-text mb-6">
              Detect pathology <span className="italic text-accent font-normal">before symptoms</span> manifest.
            </h1>

            <p className="font-sans text-base min-[861px]:text-lg text-text-muted leading-[1.7] max-w-xl mb-8 font-normal">
              PathoPredict transforms raw clinical markers into calibrated probabilistic risk
              assessments across critical disease pathways, enabling proactive clinical
              interventions rather than reactive care.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="/start"
                className="inline-flex items-center justify-center bg-accent hover:bg-accent-hover text-white text-base font-medium px-6 py-3 rounded-lg shadow-card hover:shadow-card-hover transition-all duration-150 font-sans hover:-translate-y-px"
              >
                Start a clinical check →
              </a>
            </div>
          </div>

          {/* Right Column: Animated Pulse Line */}
          <div className="w-full">
            <div className="bg-surface border border-hairline rounded-lg shadow-card p-5 sm:p-7 relative overflow-hidden">
              {/* Header inside panel */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-hairline text-xs font-sans">
                <div className="flex items-center gap-2 text-text">
                  <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-pulse" />
                  <span className="font-medium tracking-wide uppercase text-[11px] text-text-muted">
                    Signal Telemetry
                  </span>
                </div>
                <div className="text-text-faint font-mono text-[11px]">
                  CH-01
                </div>
              </div>

              {/* Background Grid & SVG Waveform */}
              <div className="relative w-full aspect-[16/9] min-h-[190px] flex items-center justify-center overflow-hidden bg-surface rounded-lg border border-hairline">
                {/* ECG Background Grid */}
                <svg
                  className="absolute inset-0 w-full h-full stroke-hairline opacity-60"
                  width="100%"
                  height="100%"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <defs>
                    <pattern
                      id="hero-grid"
                      width="24"
                      height="24"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 24 0 L 0 0 0 24"
                        fill="none"
                        style={{ stroke: 'var(--svg-hairline)' }}
                        strokeWidth="0.75"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#hero-grid)" />
                </svg>

                {/* Animated Pulse Wave */}
                <svg
                  viewBox="0 0 600 200"
                  className="relative z-10 w-full h-full p-2"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient
                      id="pulse-stroke-grad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#E11D48" />
                      <stop offset="38%" stopColor="#EF4444" />
                      <stop offset="55%" stopColor="#8B5CF6" />
                      <stop offset="78%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#2563EB" />
                    </linearGradient>
                  </defs>

                  {/* Faint static trail */}
                  <path
                    d="M 0 100 L 90 100 L 115 88 L 135 100 L 175 100 L 195 100 L 210 142 L 235 24 L 260 178 L 280 92 L 305 100 L 340 100 L 360 84 L 390 100 L 440 100 L 455 132 L 472 40 L 490 162 L 505 96 L 525 100 L 600 100"
                    style={{ stroke: 'var(--svg-hairline)' }}
                    strokeOpacity="var(--svg-trail-opacity)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Primary Animated Line */}
                  <path
                    d="M 0 100 L 90 100 L 115 88 L 135 100 L 175 100 L 195 100 L 210 142 L 235 24 L 260 178 L 280 92 L 305 100 L 340 100 L 360 84 L 390 100 L 440 100 L 455 132 L 472 40 L 490 162 L 505 96 L 525 100 L 600 100"
                    stroke="url(#pulse-stroke-grad)"
                    strokeWidth="2.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength="1000"
                    strokeDasharray="1000"
                    className="pulse-animated-path"
                  />
                </svg>
              </div>

              {/* Status Line in Panel */}
              <div className="mt-4 pt-4 border-t border-hairline text-left flex items-center justify-between">
                <div className="font-sans text-xs text-text-faint tracking-wide">
                  Screening 202 conditions
                </div>
                <div className="flex items-center gap-2.5 text-[11px] font-sans text-text-faint">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48]" />
                    Arterial
                  </span>
                  <span className="text-text-faint/40">/</span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                    Venous
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulseDraw {
          0% {
            stroke-dashoffset: 1000;
          }
          50% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -1000;
          }
        }

        .pulse-animated-path {
          animation: pulseDraw 4.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .pulse-animated-path {
            animation: none;
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </section>
  );
}

export default Hero;
