import { Header } from './components/layout/Header';

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-text font-sans selection:bg-red selection:text-white">
      <Header />
      <main className="max-w-[1120px] mx-auto px-[22px] min-[861px]:px-[32px] py-[72px] min-[861px]:py-[104px]">
        <div className="flex flex-col items-center text-center space-y-6">
          <span className="inline-flex items-center px-3 py-1 rounded-[3px] border border-hairline bg-panel text-xs text-text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-red mr-2" />
            Disease Prediction System
          </span>
          <h1 className="font-serif text-4xl min-[861px]:text-6xl font-medium tracking-tight text-text max-w-2xl">
            Precision clinical risk intelligence.
          </h1>
          <p className="text-text-muted text-base min-[861px]:text-lg max-w-xl font-sans leading-relaxed">
            Early detection and predictive disease assessment powered by machine learning models.
          </p>
        </div>
      </main>
    </div>
  );
}
