interface HeaderProps {
  unlockedCount: number;
  totalCount: number;
  onRandomCountry: () => void;
}

export default function Header({ unlockedCount, totalCount, onRandomCountry }: HeaderProps) {
  const pct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <header className="app-header">
      <div className="app-title">
        <h1>🌍 Globe Quiz</h1>
        <p>Clique sur un pays, découvre ses secrets, puis débloque-le avec un quiz !</p>
      </div>

      <div className="app-controls">
        <button className="btn btn-primary" onClick={onRandomCountry}>
          🎲 Pays aléatoire
        </button>
        <div className="progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="progress-label">
            {unlockedCount} / {totalCount} pays débloqués ({pct}%)
          </span>
        </div>
      </div>
    </header>
  );
}
