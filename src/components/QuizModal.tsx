import { useMemo, useState } from 'react';
import type { Country, QuizQuestion } from '../types';
import { generateQuiz } from '../lib/quiz';

interface QuizModalProps {
  country: Country;
  allCountries: Country[];
  onPass: () => void;
  onClose: () => void;
}

const PASS_THRESHOLD = 2; // need at least 2 correct answers out of 3

export default function QuizModal({ country, allCountries, onPass, onClose }: QuizModalProps) {
  const [attempt, setAttempt] = useState(0);
  const questions = useMemo(
    () => generateQuiz(country, allCountries, 3),
    // regenerate a fresh shuffle on each retry
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [country, attempt],
  );

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const current: QuizQuestion | undefined = questions[index];
  const passed = score >= PASS_THRESHOLD;

  function handleAnswer(i: number) {
    if (selected !== null || !current) return;
    setSelected(i);
    const correct = i === current.correctIndex;
    const newScore = score + (correct ? 1 : 0);
    setScore(newScore);

    setTimeout(() => {
      if (index + 1 < questions.length) {
        setIndex(index + 1);
        setSelected(null);
      } else {
        setFinished(true);
        if (newScore >= PASS_THRESHOLD) {
          onPass();
        }
      }
    }, 900);
  }

  function retry() {
    setAttempt((a) => a + 1);
    setIndex(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
  }

  if (questions.length === 0) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <p>Pas assez de données pour générer un quiz sur ce pays.</p>
          <button className="btn btn-primary" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="panel-close" onClick={onClose} aria-label="Fermer">
          ✕
        </button>

        {!finished && current ? (
          <>
            <div className="quiz-progress">
              {String(index + 1).padStart(2, '0')} / {String(questions.length).padStart(2, '0')}
            </div>
            <h3 className="quiz-question">{current.question}</h3>
            <div className="quiz-options">
              {current.options.map((opt, i) => {
                let cls = 'quiz-option';
                if (selected !== null) {
                  if (i === current.correctIndex) cls += ' quiz-option-correct';
                  else if (i === selected) cls += ' quiz-option-wrong';
                }
                return (
                  <button
                    key={i}
                    className={cls}
                    disabled={selected !== null}
                    onClick={() => handleAnswer(i)}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="quiz-result">
            <h3>{passed ? 'Pays débloqué' : 'Pas cette fois'}</h3>
            <p>
              Score {score} / {questions.length} — {PASS_THRESHOLD} bonnes réponses minimum
            </p>
            {passed ? (
              <button className="btn btn-primary" onClick={onClose}>
                Continuer l'exploration
              </button>
            ) : (
              <div className="quiz-result-actions">
                <button className="btn btn-primary" onClick={retry}>
                  Réessayer
                </button>
                <button className="btn btn-secondary" onClick={onClose}>
                  Plus tard
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
