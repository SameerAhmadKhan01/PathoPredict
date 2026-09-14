export function CtaBanner() {
  return (
    <section className="relative w-full py-[72px] min-[861px]:py-[104px] border-b border-hairline">
      <div className="max-w-[1120px] mx-auto px-[22px] min-[861px]:px-[32px]">
        <div className="bg-panel border border-hairline rounded-[3px] p-8 sm:p-14 min-[861px]:p-20 text-center flex flex-col items-center justify-center relative overflow-hidden">
          {/* Subtle decorative background glow / hairline grid */}
          <div
            className="absolute inset-0 bg-radial from-red/5 via-transparent to-transparent pointer-events-none opacity-40"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col items-center max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 mb-6 rounded-[3px] border border-hairline bg-panel-raised text-xs text-text-muted font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-red" />
              <span>Immediate Clinical Triage</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl min-[861px]:text-5xl font-medium tracking-tight text-text leading-[1.12] mb-5">
              Stratify risk before symptoms escalate.
            </h2>

            <p className="font-sans text-base text-text-muted leading-relaxed max-w-lg mb-8">
              Evaluate biometric patterns against multi-pathogen models to surface actionable
              probability scores in minutes.
            </p>

            <a
              href="#start"
              className="inline-flex items-center justify-center bg-red hover:bg-red-dim text-text text-sm sm:text-base font-medium px-6 py-3 rounded-[3px] border border-transparent transition-colors duration-150 font-sans"
            >
              Start a clinical check
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CtaBanner;
