import { Header } from './components/layout/Header';
import { Hero } from './components/landing/Hero';
import { DisclaimerStrip } from './components/landing/DisclaimerStrip';
import { WhySection } from './components/landing/WhySection';
import { HowItWorks } from './components/landing/HowItWorks';
import { WhatYouGet } from './components/landing/WhatYouGet';
import { CtaBanner } from './components/landing/CtaBanner';
import { Footer } from './components/layout/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-text font-sans selection:bg-red selection:text-white flex flex-col justify-between">
      <div>
        <Header />
        <main>
          <Hero />
          <DisclaimerStrip />
          <WhySection />
          <HowItWorks />
          <WhatYouGet />
          <CtaBanner />
        </main>
      </div>
      <Footer />
    </div>
  );
}
