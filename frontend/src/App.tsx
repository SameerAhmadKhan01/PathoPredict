import { Header } from './components/layout/Header';
import { Hero } from './components/landing/Hero';
import { DisclaimerStrip } from './components/landing/DisclaimerStrip';
import { WhySection } from './components/landing/WhySection';
import { HowItWorks } from './components/landing/HowItWorks';

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-text font-sans selection:bg-red selection:text-white">
      <Header />
      <main>
        <Hero />
        <DisclaimerStrip />
        <WhySection />
        <HowItWorks />
      </main>
    </div>
  );
}
