import { useCallback, useEffect, useMemo, useState } from 'react';
import GlobeView from './components/GlobeView';
import Header from './components/Header';
import CountryPanel from './components/CountryPanel';
import QuizModal from './components/QuizModal';
import { loadPlayableCountries } from './lib/geo';
import { loadUnlocked, saveUnlocked } from './lib/storage';
import type { PlayableCountry } from './types';
import './App.css';

export default function App() {
  const countries = useMemo(() => loadPlayableCountries(), []);
  const [unlocked, setUnlocked] = useState<Set<string>>(() => loadUnlocked());
  const [selected, setSelected] = useState<PlayableCountry | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [flyToToken, setFlyToToken] = useState(0);

  useEffect(() => {
    saveUnlocked(unlocked);
  }, [unlocked]);

  const selectCountry = useCallback((country: PlayableCountry) => {
    setSelected(country);
    setQuizOpen(false);
    setFlyToToken((t) => t + 1);
  }, []);

  const pickRandomCountry = useCallback(() => {
    const locked = countries.filter((c) => !unlocked.has(c.cca3));
    const pool = locked.length > 0 ? locked : countries;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick) selectCountry(pick);
  }, [countries, unlocked, selectCountry]);

  function handlePass() {
    if (!selected) return;
    setUnlocked((prev) => new Set(prev).add(selected.cca3));
  }

  return (
    <div className="app">
      <Header
        unlockedCount={unlocked.size}
        totalCount={countries.length}
        onRandomCountry={pickRandomCountry}
      />

      <main className="app-main">
        <GlobeView
          countries={countries}
          unlocked={unlocked}
          selected={selected}
          onSelectCountry={selectCountry}
          flyToToken={flyToToken}
        />

        {selected && (
          <CountryPanel
            country={selected}
            isUnlocked={unlocked.has(selected.cca3)}
            onStartQuiz={() => setQuizOpen(true)}
            onClose={() => setSelected(null)}
          />
        )}
      </main>

      {quizOpen && selected && (
        <QuizModal
          country={selected}
          allCountries={countries}
          onPass={handlePass}
          onClose={() => setQuizOpen(false)}
        />
      )}
    </div>
  );
}
