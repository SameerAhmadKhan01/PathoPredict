export function CtaBanner() {
  return (
    <section className="relative w-full py-[72px] min-[861px]:py-[104px] border-b border-border">
      <div className="max-w-[1120px] mx-auto px-[22px] min-[861px]:px-[32px]">
        <div className="bg-surface border border-border rounded-lg shadow-card-elevated p-8 sm:p-14 min-[861px]:p-20 text-left flex flex-col items-start justify-start relative overflow-hidden">
          
          <div className="relative z-10 flex flex-col items-start max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 mb-6 rounded-[3px] border border-border bg-elevated text-xs text-muted font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Immediate Clinical Triage</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl min-[861px]:text-5xl font-medium tracking-tight text-text leading-[1.12] mb-5">
              Stratify risk before symptoms escalate.
            </h2>

            <p className="font-sans text-base text-muted leading-relaxed max-w-lg mb-8">
              Evaluate biometric patterns against multi-pathogen models to surface actionable
              probability scores in minutes.
            </p>

            <a
              href="/start"
              className="inline-flex items-center justify-center bg-primary hover:bg-primary-hover text-on-primary text-sm sm:text-base font-medium px-6 py-3 rounded border border-transparent transition-colors duration-150 font-sans"
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
