import { panels as defaultPanels, type Panel } from '../../data/landingContent';

interface WhatYouGetProps {
  panels?: Panel[];
}

export function WhatYouGet({ panels = defaultPanels }: WhatYouGetProps) {
  return (
    <section
      id="what-you-get"
      className="relative w-full py-[72px] min-[861px]:py-[104px] border-b border-hairline"
    >
      <div className="max-w-[1120px] mx-auto px-[22px] min-[861px]:px-[32px]">
        {/* Section Header */}
        <div className="flex flex-col items-start text-left mb-12 min-[861px]:mb-16">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 mb-4 rounded-[3px] border border-hairline bg-panel text-xs text-text-muted font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-blue" />
            <span>Deliverables</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl min-[861px]:text-[44px] leading-[1.12] font-medium tracking-tight text-text mb-4">
            What you get
          </h2>

          <p className="font-sans text-base text-text-muted leading-relaxed max-w-xl">
            Dense, calibrated outputs structured for immediate clinical utility and informed
            consultation.
          </p>
        </div>

        {/* 2x2 Grid of Bordered Panels with Hairline Dividers */}
        <div className="grid grid-cols-1 min-[861px]:grid-cols-2 gap-px bg-hairline border border-hairline rounded-[3px] overflow-hidden">
          {panels.map((panel, index) => {
            const isBlue = (panel.accent ?? (index % 2 === 0 ? 'blue' : 'red')) === 'blue';

            return (
              <div
                key={panel.title}
                className="bg-panel p-7 sm:p-10 flex flex-col justify-between text-left transition-colors duration-150 hover:bg-panel-raised"
              >
                <div>
                  {/* Alternating Blue/Red Circular Mark */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border mb-6 ${
                      isBlue
                        ? 'border-blue/35 bg-blue-deep/35'
                        : 'border-red/35 bg-red-deep/35'
                    }`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isBlue ? 'bg-blue' : 'bg-red'
                      }`}
                    />
                  </div>

                  {/* Heading in Fraunces */}
                  <h3 className="font-serif text-xl sm:text-2xl font-medium tracking-tight text-text mb-3">
                    {panel.title}
                  </h3>

                  {/* Description in IBM Plex Sans */}
                  <p className="font-sans text-sm sm:text-base text-text-muted leading-relaxed">
                    {panel.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default WhatYouGet;
