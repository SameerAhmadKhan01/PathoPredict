import { Header } from '../components/layout/Header';
import { Hero } from '../components/landing/Hero';
import { Footer } from '../components/layout/Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-text font-sans flex flex-col justify-between">
      <Header />
      <main className="flex-1 flex flex-col justify-center">
        <Hero />
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;
