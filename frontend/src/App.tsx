import { Header } from './components/layout/Header';
import { Hero } from './components/landing/Hero';

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-text font-sans selection:bg-red selection:text-white">
      <Header />
      <main>
        <Hero />
      </main>
    </div>
  );
}
