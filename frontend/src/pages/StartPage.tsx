import { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { SYMPTOMS_DATASET, type Symptom } from '../data/symptoms';

const QUICK_SUGGESTIONS = [
  'fever',
  'cough',
  'chest_pain',
  'headache',
  'shortness_of_breath',
  'joint_pain',
  'fatigue',
  'nausea',
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

        <main className="max-w-[1120px] mx-auto px-6 md:px-8 py-14 md:py-20">
          {/* Back link */}
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors duration-200 group"
            >
              <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
                ←
              </span>
              <span>Back to overview</span>
            </Link>
          </div>

          {/* Section Header */}
          <div className="flex flex-col items-start text-left mb-8 md:mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 rounded-lg bg-accent-light text-xs text-accent font-sans font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>Step 1 of 3 — Symptom intake</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-text mb-4">
              Enter presenting symptoms.
            </h1>

            <p className="font-sans text-base text-text-muted leading-relaxed max-w-2xl">
              Search our verified clinical symptom dataset. Select multiple symptoms,
              observations, or warning indicators to build a comprehensive differential profile.
            </p>
          </div>

          {/* Search Bar & Auto-Suggestions Dropdown */}
          <div ref={containerRef} className="relative w-full max-w-3xl mb-6">
            <div className="relative flex items-center bg-surface border border-hairline rounded-lg shadow-card transition-all duration-200 focus-within:border-hairline-strong focus-within:shadow-card-hover">
              {/* Search Icon */}
              <div className="pl-4 pr-2 text-text-faint pointer-events-none">
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
                placeholder="Search symptoms (e.g. high fever, retro-orbital pain, chills)..."
                className="w-full bg-transparent py-3.5 pr-10 text-sm sm:text-base text-text placeholder:text-text-whisper placeholder:italic focus:outline-none font-sans"
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
                  className="absolute right-3 p-1 text-text-faint hover:text-text transition-colors"
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
              <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-surface border border-hairline rounded-lg shadow-card-hover overflow-hidden max-h-[340px] overflow-y-auto">
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
                            <div className="flex flex-col pr-4">
                              <div className="flex items-center gap-2">
                                <span className="font-sans text-sm font-medium text-text">
                                  {symptom.name}
                                </span>
                                {isCritical && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-critical-light border border-critical/20 text-[10px] text-critical font-mono uppercase tracking-wider">
                                    <span className="w-1 h-1 rounded-full bg-critical" />
                                    Warning sign
                                  </span>
                                )}
                              </div>
                              {symptom.description && (
                                <span className="font-sans text-xs text-text-muted mt-0.5">
                                  {symptom.description}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 flex-shrink-0">
                              <span className="hidden sm:inline-block font-sans text-[11px] text-text-faint">
                                {symptom.category}
                              </span>
                              <span className="text-xs text-accent font-medium">+ Add</span>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="px-4 py-6 text-center text-text-muted text-sm font-sans">
                    No matching clinical symptoms found. Try another term or browse categories below.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick-Pick Frequently Reported Symptoms */}
          <div className="max-w-3xl mb-8">
            <div className="text-xs font-sans text-text-faint uppercase tracking-wider mb-2.5">
              Frequently reported clinical signs
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_SUGGESTIONS.map((id) => {
                const symptom = SYMPTOMS_DATASET.find((s) => s.id === id);
                if (!symptom) return null;
                const isSelected = selectedIds.includes(id);

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        handleRemove(id);
                      } else {
                        handleSelect(symptom);
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 text-xs font-sans px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                      isSelected
                        ? 'bg-accent-light border-accent/30 text-accent font-medium'
                        : 'bg-surface border-hairline text-text-muted hover:text-text hover:border-hairline-strong hover:shadow-card'
                    }`}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{symptom.name.split(' (')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="max-w-3xl mb-8">
            <div className="text-xs font-sans text-text-faint uppercase tracking-wider mb-2.5">
              Browse by system domain
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat);
                    setIsDropdownOpen(true);
                  }}
                  className={`text-xs font-sans px-2.5 py-1.5 rounded-lg border transition-all duration-200 ${
                    activeCategory === cat
                      ? 'bg-accent-light border-accent/30 text-accent font-medium'
                      : 'bg-surface border-hairline text-text-faint hover:text-text hover:border-hairline-strong'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Symptoms Roster */}
          <div className="max-w-3xl bg-surface border border-hairline rounded-lg shadow-card p-5 sm:p-7 mb-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-hairline">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span className="font-display text-lg font-medium text-text">
                  Selected symptoms ({selectedSymptoms.length})
                </span>
              </div>

              {selectedSymptoms.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs font-sans text-text-faint hover:text-critical transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            {selectedSymptoms.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {selectedSymptoms.map((symptom) => {
                  const isCritical = symptom.severity === 'critical';

                  return (
                    <div
                      key={symptom.id}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-sans transition-colors ${
                        isCritical
                          ? 'bg-critical-light border-critical/20 text-text'
                          : 'bg-soft-shell border-hairline text-text'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isCritical ? 'bg-critical' : 'bg-accent'
                        }`}
                      />
                      <span>{symptom.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemove(symptom.id)}
                        className="text-text-faint hover:text-critical transition-colors pl-1"
                        aria-label={`Remove ${symptom.name}`}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-text-muted text-xs sm:text-sm font-sans">
                No symptoms selected yet. Use the search bar above or click quick tags to start
                your intake profile.
              </div>
            )}
          </div>

          {/* Action CTA Panel */}
          <div className="max-w-3xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-5 bg-surface border border-hairline rounded-lg shadow-card">
            <div>
              <div className="font-sans text-sm font-medium text-text">
                {selectedSymptoms.length === 0
                  ? 'Intake pending'
                  : `${selectedSymptoms.length} marker${
                      selectedSymptoms.length > 1 ? 's' : ''
                    } documented`}
              </div>
              <div className="font-sans text-xs text-text-muted mt-0.5">
                {selectedSymptoms.length === 0
                  ? 'Add at least one symptom to calculate differential disease probabilities.'
                  : 'Ready for differential evaluation.'}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={selectedSymptoms.length === 0 || isAnalyzing}
              className={`inline-flex items-center justify-center font-sans text-sm font-medium px-5 py-2.5 rounded-lg border transition-all duration-200 min-h-[44px] ${
                selectedSymptoms.length > 0 && !isAnalyzing
                  ? 'bg-accent hover:bg-accent-hover text-white border-transparent cursor-pointer hover:-translate-y-px hover:shadow-card'
                  : 'bg-soft-shell text-text-whisper border-hairline cursor-not-allowed'
              }`}
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
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
