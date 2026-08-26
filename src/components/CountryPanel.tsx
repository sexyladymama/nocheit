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
  const facts = useMemo(() => generateFacts(country), [country]);

  return (
    <aside className="panel" role="dialog" aria-label={`Informations sur ${country.nameFr}`}>
      <button className="panel-close" onClick={onClose} aria-label="Fermer">
        ✕
      </button>

      <header className="panel-header">
        <span className="panel-flag">{country.flag}</span>
        <div>
          <h2>{country.nameFr}</h2>
          <span className={`badge ${isUnlocked ? 'badge-unlocked' : 'badge-locked'}`}>
            {isUnlocked ? '🔓 Débloqué' : '🔒 Verrouillé'}
          </span>
        </div>
      </header>

      <h3 className="panel-subtitle">5 fun facts</h3>
      <ul className="fact-list">
        {facts.map((fact, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: renderBold(fact) }} />
        ))}
      </ul>

      {isUnlocked ? (
        <div className="panel-footer panel-footer-unlocked">
          <p>Bravo, tu as déjà débloqué ce pays ! 🎉</p>
          <button className="btn btn-secondary" onClick={onStartQuiz}>
            Retenter le quiz pour le fun
          </button>
        </div>
      ) : (
        <div className="panel-footer">
          <button className="btn btn-primary" onClick={onStartQuiz}>
            🧠 Lancer le quiz pour débloquer
          </button>
        </div>
      )}
    </aside>
  );
}

function renderBold(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}
