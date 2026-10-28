export function WhySection() {
  return (
    <section
      id="why-pathopredict"
      className="relative w-full py-[72px] min-[861px]:py-[104px] border-b border-hairline"
    >
      <div className="max-w-[1120px] mx-auto px-[22px] min-[861px]:px-[32px]">
        {/* Two-column grid; on mobile copy is on top, diagram is below */}
        <div className="grid grid-cols-1 min-[861px]:grid-cols-2 gap-12 min-[861px]:gap-16 items-center">
          {/* Column 1: Explanatory Copy */}
          <div className="flex flex-col items-start text-left order-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 mb-4 rounded-[3px] border border-hairline bg-soft-shell text-xs text-text-muted font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>Diagnostic Ambiguity</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl min-[861px]:text-[44px] leading-[1.12] font-medium tracking-tight text-text mb-6">
              One common symptom. <br className="hidden sm:inline" />
              <span className="italic text-accent">Five divergent</span> clinical trajectories.
            </h2>

            <p className="font-sans text-base text-text-muted leading-relaxed mb-6">
              An elevated body temperature is one of medicine’s most frequent yet least specific
              signals. On day two, a patient presenting with an identical 102°F fever could be
              fighting a benign viral flu or entering the critical incubation phase of Dengue,
              Typhoid, COVID-19, or Malaria.
            </p>

            <p className="font-sans text-base text-text-muted leading-relaxed mb-8">
              PathoPredict de-convolutes shared surface symptoms by evaluating multi-vector biometric
              markers, onset chronology, and vital patterns — surfacing high-confidence
              differential risk probabilities before complications take root.
            </p>

            {/* Micro comparison points */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-lg border border-hairline bg-surface text-left">
                <div className="font-mono text-xs text-text-faint uppercase tracking-wider mb-1">
                  Conventional
                </div>
                <div className="font-sans text-xs text-text-muted leading-normal">
                  Symptom-checking rules isolate fever in isolation, delaying differential testing.
                </div>
              </div>
              <div className="p-3.5 rounded-lg border border-hairline bg-surface text-left">
                <div className="font-mono text-xs text-accent uppercase tracking-wider mb-1">
                  PathoPredict Calibrated
                </div>
                <div className="font-sans text-xs text-text-muted leading-normal">
                  Cross-checks secondary indicators to calculate specific pathology probabilities.
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Hub-and-Spoke SVG Diagram */}
          <div className="w-full order-2">
            <div className="w-full bg-surface border border-hairline rounded-lg p-5 sm:p-7 relative shadow-card">
              {/* Diagram Card Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-hairline text-xs font-sans">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span className="font-medium uppercase tracking-wider text-[11px] text-text">
                    Differential Mapping
                  </span>
                </div>
                <span className="font-mono text-[11px] text-text-faint">
                  Topology 1:5 Cluster
                </span>
              </div>

              {/* Inline SVG Hub and Spoke Diagram */}
              <div className="relative w-full aspect-[4/3] min-h-[300px] flex items-center justify-center bg-surface rounded-lg border border-hairline p-2 overflow-hidden">
                <svg
                  viewBox="0 0 540 400"
                  className="w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    {/* Line gradients - using accent color */}
                    <linearGradient id="spoke-accent" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: 'var(--svg-accent)' }} stopOpacity="0.8" />
                      <stop offset="100%" style={{ stopColor: 'var(--svg-accent)' }} stopOpacity="0.3" />
                    </linearGradient>
                  </defs>

                  {/* Connecting Spoke Lines */}
                  {/* Spoke to Flu (top-left) */}
                  <line
                    x1="220"
                    y1="185"
                    x2="115"
                    y2="105"
                    stroke="url(#spoke-accent)"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                  />
                  {/* Spoke to COVID-19 (top-center) */}
                  <line
                    x1="270"
                    y1="175"
                    x2="270"
                    y2="90"
                    stroke="url(#spoke-accent)"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                  />
                  {/* Spoke to Dengue (top-right) */}
                  <line
                    x1="320"
                    y1="185"
                    x2="425"
                    y2="105"
                    stroke="url(#spoke-accent)"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                  />
                  {/* Spoke to Typhoid (bottom-left) */}
                  <line
                    x1="225"
                    y1="215"
                    x2="125"
                    y2="295"
                    stroke="url(#spoke-accent)"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                  />
                  {/* Spoke to Malaria (bottom-right) */}
                  <line
                    x1="315"
                    y1="215"
                    x2="415"
                    y2="295"
                    stroke="url(#spoke-accent)"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                  />

                  {/* Spoke Marker Badges (differential probability indicator) */}
                  <circle cx="167" cy="145" r="2.5" style={{ fill: 'var(--svg-accent)' }} />
                  <circle cx="270" cy="132" r="2.5" style={{ fill: 'var(--svg-accent)' }} />
                  <circle cx="372" cy="145" r="2.5" style={{ fill: 'var(--svg-accent)' }} />
                  <circle cx="175" cy="255" r="2.5" style={{ fill: 'var(--svg-accent)' }} />
                  <circle cx="365" cy="255" r="2.5" style={{ fill: 'var(--svg-accent)' }} />

                  {/* 1. Disease Node: Flu */}
                  <g transform="translate(30, 60)">
                    <rect
                      width="120"
                      height="46"
                      rx="3"
                      style={{ fill: 'var(--svg-surface)', stroke: 'var(--svg-hairline)' }}
                      strokeWidth="1"
                    />
                    <circle cx="16" cy="23" r="3" style={{ fill: 'var(--svg-accent)' }} />
                    <text
                      x="28"
                      y="20"
                      style={{ fill: 'var(--svg-text)' }}
                      fontSize="12.5"
                      fontWeight="500"
                      fontFamily="IBM Plex Sans, sans-serif"
                    >
                      Flu
                    </text>
                    <text
                      x="28"
                      y="34"
                      style={{ fill: 'var(--svg-text-muted)' }}
                      fontSize="9.5"
                      fontFamily="IBM Plex Sans, sans-serif"
                    >
                      Viral · Acute onset
                    </text>
                  </g>

                  {/* 2. Disease Node: COVID-19 */}
                  <g transform="translate(210, 44)">
                    <rect
                      width="120"
                      height="46"
                      rx="3"
                      style={{ fill: 'var(--svg-surface)', stroke: 'var(--svg-hairline)' }}
                      strokeWidth="1"
                    />
                    <circle cx="16" cy="23" r="3" style={{ fill: 'var(--svg-accent)' }} />
                    <text
                      x="28"
                      y="20"
                      style={{ fill: 'var(--svg-text)' }}
                      fontSize="12.5"
                      fontWeight="500"
                      fontFamily="IBM Plex Sans, sans-serif"
                    >
                      COVID-19
                    </text>
                    <text
                      x="28"
                      y="34"
                      style={{ fill: 'var(--svg-text-muted)' }}
                      fontSize="9.5"
                      fontFamily="IBM Plex Sans, sans-serif"
                    >
                      Respiratory · Anosmia
                    </text>
                  </g>

                  {/* 3. Disease Node: Dengue */}
                  <g transform="translate(390, 60)">
                    <rect
                      width="120"
                      height="46"
                      rx="3"
                      style={{ fill: 'var(--svg-surface)', stroke: 'var(--svg-hairline)' }}
                      strokeWidth="1"
                    />
                    <circle cx="16" cy="23" r="3" style={{ fill: 'var(--svg-accent)' }} />
                    <text
                      x="28"
                      y="20"
                      style={{ fill: 'var(--svg-text)' }}
                      fontSize="12.5"
                      fontWeight="500"
                      fontFamily="IBM Plex Sans, sans-serif"
                    >
                      Dengue
                    </text>
                    <text
                      x="28"
                      y="34"
                      style={{ fill: 'var(--svg-text-muted)' }}
                      fontSize="9.5"
                      fontFamily="IBM Plex Sans, sans-serif"
                    >
                      Platelet · Retro-orbital
                    </text>
                  </g>

                  {/* 4. Disease Node: Typhoid */}
                  <g transform="translate(45, 275)">
                    <rect
                      width="120"
                      height="46"
                      rx="3"
                      style={{ fill: 'var(--svg-surface)', stroke: 'var(--svg-hairline)' }}
                      strokeWidth="1"
                    />
                    <circle cx="16" cy="23" r="3" style={{ fill: 'var(--svg-accent)' }} />
                    <text
                      x="28"
                      y="20"
                      style={{ fill: 'var(--svg-text)' }}
                      fontSize="12.5"
                      fontWeight="500"
                      fontFamily="IBM Plex Sans, sans-serif"
                    >
                      Typhoid
                    </text>
                    <text
                      x="28"
                      y="34"
                      style={{ fill: 'var(--svg-text-muted)' }}
                      fontSize="9.5"
                      fontFamily="IBM Plex Sans, sans-serif"
                    >
                      Enteric · Step-ladder
                    </text>
                  </g>

                  {/* 5. Disease Node: Malaria */}
                  <g transform="translate(375, 275)">
                    <rect
                      width="120"
                      height="46"
                      rx="3"
                      style={{ fill: 'var(--svg-surface)', stroke: 'var(--svg-hairline)' }}
                      strokeWidth="1"
                    />
                    <circle cx="16" cy="23" r="3" style={{ fill: 'var(--svg-accent)' }} />
                    <text
                      x="28"
                      y="20"
                      style={{ fill: 'var(--svg-text)' }}
                      fontSize="12.5"
                      fontWeight="500"
                      fontFamily="IBM Plex Sans, sans-serif"
                    >
                      Malaria
                    </text>
                    <text
                      x="28"
                      y="34"
                      style={{ fill: 'var(--svg-text-muted)' }}
                      fontSize="9.5"
                      fontFamily="IBM Plex Sans, sans-serif"
                    >
                      Cyclic chill · Parasitic
                    </text>
                  </g>

                  {/* Central Hub Node: Fever */}
                  <g transform="translate(205, 175)">
                    {/* Outer halo */}
                    <rect
                      x="-6"
                      y="-6"
                      width="142"
                      height="56"
                      rx="5"
                      fill="none"
                      style={{ stroke: 'var(--svg-accent-halo)' }}
                      strokeWidth="1"
                    />
                    {/* Main box */}
                    <rect
                      width="130"
                      height="44"
                      rx="3"
                      style={{ fill: 'var(--svg-surface)', stroke: 'var(--svg-accent)' }}
                      strokeWidth="1.25"
                    />
                    {/* Indicator dot */}
                    <circle cx="20" cy="22" r="4" style={{ fill: 'var(--svg-accent)' }} />
                    {/* Label */}
                    <text
                      x="34"
                      y="24"
                      dominantBaseline="middle"
                      style={{ fill: 'var(--svg-text)' }}
                      fontSize="14"
                      fontFamily="Satoshi, sans-serif"
                      fontWeight="500"
                    >
                      Fever ≥ 38°C
                    </text>
                  </g>
                </svg>
              </div>

              {/* Bottom annotation */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-hairline text-xs font-sans text-text-faint">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  High critical divergence
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Secondary biomarker verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhySection;
