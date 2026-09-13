import { Header } from './components/layout/Header';
import { Hero } from './components/landing/Hero';
import { DisclaimerStrip } from './components/landing/DisclaimerStrip';

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-text font-sans selection:bg-red selection:text-white">
      <Header />
      <main>
        <Hero />
        <DisclaimerStrip />
      </main>
    </div>
  );
}
