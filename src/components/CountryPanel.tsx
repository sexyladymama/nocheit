import { useMemo } from 'react';
import type { PlayableCountry } from '../types';
import { generateFacts } from '../lib/facts';

interface CountryPanelProps {
  country: PlayableCountry;
  isUnlocked: boolean;
  onStartQuiz: () => void;
  onClose: () => void;
}

export default function CountryPanel({
  country,
  isUnlocked,
  onStartQuiz,
  onClose,
}: CountryPanelProps) {
  const dossier = useMemo(() => generateFacts(country), [country]);

  return (
    <aside className="panel" role="dialog" aria-label={`Fiche de ${country.nameFr}`}>
      <button className="panel-close" onClick={onClose} aria-label="Fermer">
        ✕
      </button>

      <header className="panel-header">
        <span className="panel-flag">{country.flag}</span>
        <div>
          <h2>{country.nameFr}</h2>
          <span className={`badge ${isUnlocked ? 'badge-unlocked' : 'badge-locked'}`}>
            {isUnlocked ? 'Débloqué' : 'Verrouillé'}
          </span>
        </div>
      </header>

      <h3 className="panel-subtitle">Fiche</h3>
      <dl className="stat-grid">
        {dossier.stats.map((stat) => (
          <div key={stat.label} className={stat.wide ? 'stat-wide' : undefined}>
            <dt>{stat.label}</dt>
            <dd>{stat.value}</dd>
          </div>
        ))}
      </dl>

      <ul className="fact-notes">
        {dossier.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>

      {isUnlocked ? (
        <div className="panel-footer panel-footer-unlocked">
          <p>Ce pays est débloqué.</p>
          <button className="btn btn-secondary" onClick={onStartQuiz}>
            Retenter le quiz
          </button>
        </div>
      ) : (
        <div className="panel-footer">
          <button className="btn btn-primary" onClick={onStartQuiz}>
            Lancer le quiz
          </button>
        </div>
      )}
    </aside>
  );
}
