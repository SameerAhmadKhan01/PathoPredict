import { steps as defaultSteps, type Step } from '../../data/landingContent';

interface HowItWorksProps {
  steps?: Step[];
}

export function HowItWorks({ steps = defaultSteps }: HowItWorksProps) {
  return (
    <section
      id="how-it-works"
      className="relative w-full py-[72px] min-[861px]:py-[104px] border-b border-hairline"
    >
      <div className="max-w-[1120px] mx-auto px-[22px] min-[861px]:px-[32px]">
        {/* Section Header */}
        <div className="flex flex-col items-start text-left mb-12 min-[861px]:mb-16">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 mb-4 rounded-[3px] border border-hairline bg-panel text-xs text-text-muted font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-red" />
            <span>Workflow</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl min-[861px]:text-[44px] leading-[1.12] font-medium tracking-tight text-text mb-4">
            How it works
          </h2>

          <p className="font-sans text-base text-text-muted leading-relaxed max-w-xl">
            From initial symptom presentation to high-certainty risk stratification in three
            methodical steps.
          </p>
        </div>

        {/* 3-Step Numbered Grid with vertical dividers on desktop, horizontal on mobile */}
        <div className="grid grid-cols-1 min-[861px]:grid-cols-3 divide-y divide-hairline min-[861px]:divide-y-0 min-[861px]:divide-x min-[861px]:divide-hairline border-y border-hairline">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`flex flex-col text-left py-8 min-[861px]:py-10 ${
                index === 0
                  ? 'min-[861px]:pr-8 min-[861px]:pl-0'
                  : index === steps.length - 1
                    ? 'min-[861px]:pl-8 min-[861px]:pr-0'
                    : 'min-[861px]:px-8'
              }`}
            >
              {/* Number in muted Fraunces */}
              <span className="font-serif text-3xl sm:text-4xl font-light text-text-faint/70 mb-5 select-none">
                {step.number}
              </span>

              {/* Step Heading */}
              <h3 className="font-serif text-xl sm:text-2xl font-medium tracking-tight text-text mb-3">
                {step.title}
              </h3>

              {/* Step Description */}
              <p className="font-sans text-sm sm:text-base text-text-muted leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
