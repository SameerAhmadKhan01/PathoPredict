import { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { SYMPTOMS_DATASET, type Symptom } from '../data/symptoms';

interface QuickSuggestionItem {
  id: string;
  label: string;
  icon?: string;
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
    if (selectedIds.length === 0) return;
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

        <main className="max-w-[1120px] mx-auto px-6 md:px-8 py-10 md:py-16">
          {/* Back link */}
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm sm:text-base font-medium text-text-muted hover:text-text transition-colors duration-200 group"
            >
              <span className="transition-transform duration-200 group-hover:-translate-x-1">
                ←
              </span>
              <span>Back to overview</span>
            </Link>
          </div>

          {/* Section Header with Big Fonts */}
          <div className="flex flex-col items-start text-left mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-4 rounded-full bg-accent/15 border border-accent/25 text-xs sm:text-sm text-accent font-sans font-medium">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span>Step 1 of 3 · Clinical Intake</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-text mb-4 leading-[1.12]">
              Enter presenting symptoms.
            </h1>

            <p className="font-sans text-base sm:text-lg text-text-muted leading-relaxed max-w-2xl">
              Search our verified clinical symptom dataset or tap common signs below.
              Add all observations and warning signs to calculate a calibrated differential diagnostic profile.
            </p>
          </div>

          {/* Prominent, High-Contrast Search Bar */}
          <div ref={containerRef} className="relative w-full max-w-3xl mb-8">
            <div className="relative flex items-center bg-surface border-2 border-hairline hover:border-hairline-strong rounded-2xl shadow-card transition-all duration-200 focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/20 focus-within:shadow-card-hover h-14 sm:h-16">
              {/* Search Icon */}
              <div className="pl-5 pr-3 text-text-faint pointer-events-none">
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
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
                placeholder="Search symptoms (e.g. fever, headache, chest pain, cough, nausea)..."
                className="w-full bg-transparent py-4 pr-12 text-base sm:text-lg text-text placeholder:text-text-whisper focus:outline-none font-sans"
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
                  className="absolute right-4 p-1.5 text-text-faint hover:text-text rounded-full hover:bg-soft-shell transition-colors"
                  aria-label="Clear search input"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            {/* Suggestions Dropdown Popover */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 z-40 bg-surface border-2 border-hairline rounded-2xl shadow-card-elevated overflow-hidden max-h-[380px] overflow-y-auto">
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
                            className={`w-full text-left px-5 py-4 flex items-center justify-between transition-colors duration-100 ${
                              isHighlighted ? 'bg-soft-shell' : 'hover:bg-soft-shell'
                            }`}
                          >
                            <div className="flex flex-col pr-4">
                              <div className="flex items-center gap-2.5">
                                <span className="font-sans text-base sm:text-lg font-semibold text-text">
                                  {symptom.name}
                                </span>
                                {isCritical && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-critical/15 border border-critical/30 text-xs text-critical font-mono uppercase tracking-wider font-semibold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-critical" />
                                    Critical flag
                                  </span>
                                )}
                              </div>
                              {symptom.description && (
                                <span className="font-sans text-sm text-text-muted mt-1 leading-snug">
                                  {symptom.description}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3.5 flex-shrink-0">
                              <span className="hidden sm:inline-block font-sans text-xs px-2.5 py-1 rounded-md bg-soft-shell text-text-faint border border-hairline">
                                {symptom.category}
                              </span>
                              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors shadow-sm">
                                + Add
                              </span>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="px-6 py-8 text-center text-text-muted text-base font-sans">
                    No matching clinical symptoms found for <span className="font-semibold text-text">"{query}"</span>.
                    <p className="text-sm text-text-faint mt-1">Try another everyday term or select from frequently reported signs below.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick-Pick Frequently Reported Symptoms (Big & Clear) */}
          <div className="max-w-3xl mb-10">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs sm:text-sm font-sans text-text-faint uppercase tracking-wider font-semibold">
                Frequently reported symptoms
              </span>
              <span className="text-xs font-sans text-text-faint">
                Tap to quickly add
              </span>
            </div>
            <div className="flex flex-wrap gap-2.5">
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
                    className={`inline-flex items-center gap-2 text-sm sm:text-base font-medium px-4 py-2.5 rounded-xl border transition-all duration-200 shadow-sm ${
                      isSelected
                        ? 'bg-accent text-white border-accent shadow-card hover:bg-accent-hover'
                        : 'bg-surface border-hairline text-text hover:border-accent hover:text-accent hover:shadow-card hover:-translate-y-px'
                    }`}
                  >
                    <span className="font-bold">{isSelected ? '✓' : '+'}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="max-w-3xl mb-10">
            <div className="text-xs sm:text-sm font-sans text-text-faint uppercase tracking-wider font-semibold mb-3.5">
              Browse by body system
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat);
                    setIsDropdownOpen(true);
                  }}
                  className={`text-xs sm:text-sm font-medium px-3.5 py-2 rounded-xl border transition-all duration-200 ${
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

          {/* Selected Symptoms Roster (Big & Clear) */}
          <div className="max-w-3xl bg-surface border-2 border-hairline rounded-2xl shadow-card p-6 sm:p-8 mb-10">
            <div className="flex items-center justify-between pb-5 mb-5 border-b border-hairline">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                <h2 className="font-display text-xl sm:text-2xl font-semibold text-text">
                  Selected symptoms ({selectedSymptoms.length})
                </h2>
              </div>

              {selectedSymptoms.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs sm:text-sm font-sans font-semibold text-text-faint hover:text-critical transition-colors px-2 py-1 rounded hover:bg-soft-shell"
                >
                  Clear all
                </button>
              )}
            </div>

            {selectedSymptoms.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {selectedSymptoms.map((symptom) => {
                  const isCritical = symptom.severity === 'critical';

                  return (
                    <div
                      key={symptom.id}
                      className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm sm:text-base font-medium transition-all shadow-sm ${
                        isCritical
                          ? 'bg-critical/15 border-critical/40 text-critical shadow-[0_0_8px_rgba(225,29,72,0.15)]'
                          : 'bg-soft-shell border-hairline text-text'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isCritical ? 'bg-critical animate-pulse' : 'bg-accent'
                        }`}
                      />
                      <span>{symptom.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemove(symptom.id)}
                        className="w-5 h-5 flex items-center justify-center rounded-full text-text-faint hover:text-critical hover:bg-critical/20 transition-colors ml-1 font-bold text-base"
                        aria-label={`Remove ${symptom.name}`}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-text-muted text-sm sm:text-base font-sans flex flex-col items-center justify-center gap-2">
                <svg className="w-10 h-10 text-text-faint/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 12h6M12 9v6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                </svg>
                <p className="font-medium text-text">No symptoms selected yet.</p>
                <p className="text-xs sm:text-sm text-text-faint max-w-md">
                  Type in the search box above or tap any frequently reported sign to start your intake profile.
                </p>
              </div>
            )}
          </div>

          {/* Action CTA Panel with Big CTA Button */}
          <div className="max-w-3xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-5 p-6 sm:p-8 bg-surface border-2 border-hairline rounded-2xl shadow-card-elevated">
            <div>
              <div className="font-sans text-base sm:text-lg font-bold text-text">
                {selectedSymptoms.length === 0
                  ? 'Intake pending'
                  : `${selectedSymptoms.length} symptom${
                      selectedSymptoms.length > 1 ? 's' : ''
                    } documented`}
              </div>
              <div className="font-sans text-sm text-text-muted mt-1 leading-snug">
                {selectedSymptoms.length === 0
                  ? 'Add at least one symptom to calculate differential disease probabilities.'
                  : 'Ready for full differential diagnosis evaluation across 202 conditions.'}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={selectedSymptoms.length === 0 || isAnalyzing}
              className={`inline-flex items-center justify-center font-sans text-base sm:text-lg font-semibold px-7 py-3.5 rounded-xl border transition-all duration-200 min-h-[52px] ${
                selectedSymptoms.length > 0 && !isAnalyzing
                  ? 'bg-accent hover:bg-accent-hover text-white border-transparent cursor-pointer hover:-translate-y-0.5 shadow-card hover:shadow-card-elevated'
                  : 'bg-soft-shell text-text-whisper border-hairline cursor-not-allowed opacity-50'
              }`}
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2.5">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Calculating differential risk...
                </span>
              ) : (
                'Analyze differential risk →'
              )}
            </button>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default StartPage;
