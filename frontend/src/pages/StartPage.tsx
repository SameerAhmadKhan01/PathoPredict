import { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { SYMPTOMS_DATASET, type Symptom } from '../data/symptoms';

interface QuickSuggestionItem {
  id: string;
  label: string;
}

const QUICK_SUGGESTIONS: QuickSuggestionItem[] = [
  { id: 'fever', label: 'Fever' },
  { id: 'cough', label: 'Persistent cough' },
  { id: 'headache', label: 'Headache' },
  { id: 'chest_pain', label: 'Chest pain / pressure' },
  { id: 'shortness_of_breath', label: 'Shortness of breath' },
  { id: 'fatigue', label: 'Fatigue & exhaustion' },
  { id: 'joint_pain', label: 'Joint pain' },
  { id: 'nausea', label: 'Nausea' },
  { id: 'chills', label: 'Chills & shivering' },
  { id: 'sore_throat', label: 'Sore throat' },
];

const CATEGORIES = [
  'All',
  'Constitutional',
  'Respiratory',
  'Cardiac',
  'Gastrointestinal',
  'Musculoskeletal',
  'Neurological',
  'Dermatological',
  'ENT',
  'Ophthalmological',
  'Psychiatric',
  'Urological/Renal',
] as const;

export function StartPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem('pathopredict_symptoms') || '[]');
    } catch {
      return [];
    }
  });
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORIES)[number]>('All');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered suggestions based on search query and active category
  const filteredSuggestions = useMemo(() => {
    const trimmed = query.trim().toLowerCase();

    return SYMPTOMS_DATASET.filter((symptom) => {
      // Exclude already selected
      if (selectedIds.includes(symptom.id)) return false;

      // Filter by category if one is chosen and no active search query
      if (activeCategory !== 'All' && trimmed.length === 0) {
        return symptom.category === activeCategory;
      }

      // If search query exists, match name, description, category, or common diseases
      if (trimmed.length > 0) {
        const nameMatch = symptom.name.toLowerCase().includes(trimmed);
        const descMatch = symptom.description?.toLowerCase().includes(trimmed);
        const catMatch = symptom.category.toLowerCase().includes(trimmed);
        const diseaseMatch = symptom.commonIn.some((d) => d.toLowerCase().includes(trimmed));

        return nameMatch || descMatch || catMatch || diseaseMatch;
      }

      return true;
    });
  }, [query, selectedIds, activeCategory]);

  // Reset highlighted index when suggestions change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredSuggestions.length, query]);

  const selectedSymptoms = useMemo(() => {
    return selectedIds
      .map((id) => SYMPTOMS_DATASET.find((s) => s.id === id))
      .filter((s): s is Symptom => s !== undefined);
  }, [selectedIds]);

  const handleSelect = (symptom: Symptom) => {
    if (!selectedIds.includes(symptom.id)) {
      setSelectedIds((prev) => [...prev, symptom.id]);
    }
    setQuery('');
    setIsDropdownOpen(false);
    inputRef.current?.focus();
  };

  const handleRemove = (id: string) => {
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const handleClearAll = () => {
    setSelectedIds([]);
    sessionStorage.removeItem('pathopredict_symptoms');
    setQuery('');
  };

  const handleAnalyze = () => {
    if (selectedIds.length === 0 || isAnalyzing) return;
    setIsAnalyzing(true);
    sessionStorage.setItem('pathopredict_symptoms', JSON.stringify(selectedIds));
    setTimeout(() => {
      navigate('/results', { state: { symptomIds: selectedIds } });
    }, 450);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen || filteredSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % filteredSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(
        (prev) => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSuggestions[highlightedIndex]) {
        handleSelect(filteredSuggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text font-sans flex flex-col justify-between">
      <div>
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 pb-28 lg:pb-12">
          {/* Asymmetrical 2-Column Split-View Grid */}
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
            
            {/* Left Main Area: Intake & Search (col-span-8) */}
            <div className="lg:col-span-8 space-y-6 sm:space-y-7">
              {/* Compact Header */}
              <div>
                <div className="flex items-center gap-3 mb-2.5">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-text-muted hover:text-text transition-colors group"
                  >
                    <span className="transition-transform group-hover:-translate-x-0.5">←</span>
                    <span>Overview</span>
                  </Link>
                  <span className="text-text-whisper text-xs">/</span>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-xs text-accent font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    <span>Clinical Intake</span>
                  </div>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal tracking-tight text-text leading-tight">
                  Select Presenting Symptoms
                </h1>

                <p className="font-sans text-xs sm:text-sm text-text-muted leading-relaxed mt-1">
                  Search or select symptoms below to compute differential disease probabilities across 202 conditions.
                </p>
              </div>

              {/* Prominent Search Bar */}
              <div ref={containerRef} className="relative w-full">
                <div className="relative flex items-center bg-surface border border-hairline hover:border-hairline-strong rounded-xl shadow-card transition-all duration-200 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 h-12 sm:h-14">
                  {/* Search Icon */}
                  <div className="pl-4 pr-2.5 text-text-faint pointer-events-none">
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>

                  {/* Input */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search symptoms (e.g. fever, headache, chest pain, cough)..."
                    className="w-full bg-transparent py-3 pr-10 text-sm sm:text-base text-text placeholder:text-text-whisper focus:outline-none font-sans"
                    aria-autocomplete="list"
                    aria-expanded={isDropdownOpen}
                  />

                  {/* Clear Query button */}
                  {query.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery('');
                        inputRef.current?.focus();
                      }}
                      className="absolute right-3.5 p-1 text-text-faint hover:text-text rounded-full hover:bg-soft-shell transition-colors"
                      aria-label="Clear search input"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Suggestions Dropdown Popover */}
                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-surface border border-hairline rounded-xl shadow-card-elevated overflow-hidden max-h-[320px] overflow-y-auto">
                    {filteredSuggestions.length > 0 ? (
                      <ul className="divide-y divide-hairline">
                        {filteredSuggestions.map((symptom, index) => {
                          const isHighlighted = index === highlightedIndex;
                          const isCritical = symptom.severity === 'critical';

                          return (
                            <li key={symptom.id}>
                              <button
                                type="button"
                                onClick={() => handleSelect(symptom)}
                                onMouseEnter={() => setHighlightedIndex(index)}
                                className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors duration-100 ${
                                  isHighlighted ? 'bg-soft-shell' : 'hover:bg-soft-shell'
                                }`}
                              >
                                <div className="flex flex-col pr-3">
                                  <div className="flex items-center gap-2">
                                    <span className="font-sans text-sm sm:text-base font-medium text-text">
                                      {symptom.name}
                                    </span>
                                    {isCritical && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] bg-critical/15 text-critical font-mono font-semibold uppercase tracking-wider">
                                        Critical
                                      </span>
                                    )}
                                  </div>
                                  {symptom.description && (
                                    <span className="font-sans text-xs text-text-muted mt-0.5 leading-snug line-clamp-1">
                                      {symptom.description}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2.5 flex-shrink-0">
                                  <span className="hidden sm:inline-block font-sans text-xs px-2 py-0.5 rounded bg-soft-shell text-text-faint border border-hairline">
                                    {symptom.category}
                                  </span>
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-sm">
                                    + Add
                                  </span>
                                </div>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="px-5 py-6 text-center text-text-muted text-sm font-sans">
                        No symptoms matching <span className="font-semibold text-text">"{query}"</span>.
                        <p className="text-xs text-text-faint mt-1">Try another term or select from the common signs below.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Frequently Reported Symptoms Chips */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-sans text-text-faint uppercase tracking-wider font-semibold">
                    Frequently Reported Symptoms
                  </span>
                  <span className="text-[11px] font-sans text-text-faint">
                    Quick-add
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_SUGGESTIONS.map((item) => {
                    const symptom = SYMPTOMS_DATASET.find((s) => s.id === item.id);
                    if (!symptom) return null;
                    const isSelected = selectedIds.includes(item.id);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            handleRemove(item.id);
                          } else {
                            handleSelect(symptom);
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3.5 py-2 rounded-xl border transition-all duration-150 ${
                          isSelected
                            ? 'bg-accent text-white border-accent shadow-sm'
                            : 'bg-surface border-hairline text-text hover:border-hairline-strong hover:bg-soft-shell'
                        }`}
                      >
                        <span className="font-bold text-xs">{isSelected ? '✓' : '+'}</span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Browse by Body System */}
              <div>
                <div className="text-xs font-sans text-text-faint uppercase tracking-wider font-semibold mb-2.5">
                  Browse by Body System
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setActiveCategory(cat);
                        setIsDropdownOpen(true);
                      }}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all duration-150 ${
                        activeCategory === cat
                          ? 'bg-accent text-white border-accent shadow-sm'
                          : 'bg-surface border-hairline text-text-muted hover:text-text hover:border-hairline-strong'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sticky Action Sidebar: Selected Summary & Primary CTA (col-span-4) */}
            <div className="lg:col-span-4 mt-8 lg:mt-0">
              <div className="lg:sticky lg:top-24 rounded-2xl border border-hairline p-5 sm:p-6 shadow-card bg-surface flex flex-col space-y-4">
                {/* Card Header: Count + Clear All */}
                <div className="flex items-center justify-between pb-3.5 border-b border-hairline">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-base sm:text-lg font-semibold text-text">
                      Selected Symptoms
                    </span>
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-accent/15 text-accent border border-accent/25">
                      {selectedSymptoms.length}
                    </span>
                  </div>

                  {selectedSymptoms.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="text-xs font-sans font-medium text-text-faint hover:text-critical transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Scrollable Selection Queue */}
                <div className="min-h-[160px] max-h-[300px] overflow-y-auto pr-1">
                  {selectedSymptoms.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {selectedSymptoms.map((symptom) => {
                        const isCritical = symptom.severity === 'critical';

                        return (
                          <div
                            key={symptom.id}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs sm:text-sm font-medium transition-colors ${
                              isCritical
                                ? 'bg-critical/10 border-critical/30 text-critical'
                                : 'bg-soft-shell border-hairline text-text'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              <span
                                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                  isCritical ? 'bg-critical animate-pulse' : 'bg-accent'
                                }`}
                              />
                              <span className="truncate">{symptom.name}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemove(symptom.id)}
                              className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-md text-text-faint hover:text-critical hover:bg-critical/20 transition-colors font-bold text-xs"
                              aria-label={`Remove ${symptom.name}`}
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-full py-10 flex flex-col items-center justify-center text-center p-4 border border-dashed border-hairline rounded-xl">
                      <svg
                        className="w-8 h-8 text-text-faint/50 mb-2"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 9v6M9 12h6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                      </svg>
                      <p className="text-xs font-medium text-text-muted">
                        Select symptoms from the left to start.
                      </p>
                      <p className="text-[11px] text-text-faint mt-0.5">
                        Add 1 or more indicators to begin.
                      </p>
                    </div>
                  )}
                </div>

                {/* Primary Sticky Action CTA */}
                <div className="pt-2 border-t border-hairline space-y-2">
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={selectedSymptoms.length === 0 || isAnalyzing}
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-card min-h-[46px] ${
                      selectedSymptoms.length > 0 && !isAnalyzing
                        ? 'bg-accent hover:bg-accent-hover text-white cursor-pointer hover:shadow-card-elevated hover:-translate-y-px'
                        : 'bg-soft-shell text-text-whisper border border-hairline cursor-not-allowed opacity-50'
                    }`}
                  >
                    {isAnalyzing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Analyzing differential...</span>
                      </span>
                    ) : (
                      <>
                        <span>Start Analysis</span>
                        <span>→</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-text-faint">
                    {selectedSymptoms.length === 0
                      ? 'Select at least 1 symptom to proceed.'
                      : `Evaluating differential across 202 conditions.`}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Mobile Sticky Bottom Action Bar (< lg) */}
      <div className="fixed bottom-0 inset-x-0 p-3.5 sm:p-4 border-t border-hairline bg-surface/95 backdrop-blur-md z-40 lg:hidden shadow-lg flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-text">
            {selectedSymptoms.length === 0
              ? 'No symptoms selected'
              : `${selectedSymptoms.length} symptom${selectedSymptoms.length > 1 ? 's' : ''} added`}
          </span>
          <span className="text-[11px] text-text-faint">
            {selectedSymptoms.length === 0 ? 'Select from above' : 'Ready for differential analysis'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={selectedSymptoms.length === 0 || isAnalyzing}
          className={`py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 transition-all shadow-sm ${
            selectedSymptoms.length > 0 && !isAnalyzing
              ? 'bg-accent hover:bg-accent-hover text-white cursor-pointer'
              : 'bg-soft-shell text-text-whisper border border-hairline cursor-not-allowed opacity-60'
          }`}
        >
          {isAnalyzing ? (
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing...</span>
            </span>
          ) : (
            <>
              <span>Start Analysis</span>
              <span>→</span>
            </>
          )}
        </button>
      </div>

      <Footer />
    </div>
  );
}

export default StartPage;
