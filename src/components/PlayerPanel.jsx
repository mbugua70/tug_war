import { useState, useEffect, useRef, useCallback } from 'react';

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion() {
  const op = ['+', '-', '×', '÷'][randInt(0, 3)];
  let a, b, answer;
  switch (op) {
    case '+': { a = randInt(3, 20);  b = randInt(3, 20);  answer = a + b; break; }
    case '-': { a = randInt(8, 20);  b = randInt(2, a - 3); answer = a - b; break; }
    case '×': { a = randInt(2, 12);  b = randInt(2, 12);  answer = a * b; break; }
    case '÷': { answer = randInt(2, 9); b = randInt(2, 9); a = answer * b; break; }
    default:    a = 1; b = 1; answer = 2;
  }
  return { display: `${a} ${op} ${b}`, answer };
}

// Numpad rows: 7-8-9 / 4-5-6 / 1-2-3 / 0-⌫
const PAD_ROWS = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['0', '⌫'],
];

export function PlayerPanel({ side, onCorrect, gameStatus, score }) {
  const isLeft    = side === 'left';
  const isPlaying = gameStatus === 'playing';

  const [question,   setQuestion]   = useState(generateQuestion);
  const [input,      setInput]      = useState('');
  const [feedback,   setFeedback]   = useState(null); // null | 'correct' | 'wrong'
  const [wrongEntry, setWrongEntry] = useState('');
  const inputRef = useRef(null);

  const nextQuestion = useCallback(() => {
    setQuestion(generateQuestion());
    setInput('');
    setFeedback(null);
    setWrongEntry('');
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      setQuestion(generateQuestion());
      setInput('');
      setFeedback(null);
      setWrongEntry('');
    }
  }, [isPlaying]);

  function handleSubmit() {
    if (!isPlaying || feedback !== null || !input.trim()) return;
    const val = parseInt(input, 10);
    if (isNaN(val)) return;

    if (val === question.answer) {
      setFeedback('correct');
      onCorrect(side);
      setTimeout(nextQuestion, 500);
    } else {
      setWrongEntry(input);
      setFeedback('wrong');
      setTimeout(nextQuestion, 1300);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit();
  }

  // Numpad key press — builds the answer digit by digit
  function handleNumpad(key) {
    if (!isPlaying || feedback !== null) return;
    if (key === '⌫') {
      setInput(prev => prev.slice(0, -1));
    } else {
      setInput(prev => (prev.length < 4 ? prev + key : prev));
    }
  }

  const disabled   = !isPlaying || feedback !== null;
  const canSubmit  = isPlaying && feedback === null && input.trim() !== '';

  return (
    <div className={[
      'player-panel',
      isLeft ? 'panel-left' : 'panel-right',
      !isPlaying ? 'panel-disabled' : '',
    ].join(' ')}>

      {/* ── Header ── */}
      <div className="panel-header">
        <span className="player-dot">{isLeft ? '🔵' : '🔴'}</span>
        <span className="player-name">{isLeft ? 'Player 1' : 'Player 2'}</span>
        <span className="player-score">{score} ✓</span>
      </div>

      {!isPlaying ? (
        <p className="panel-hint">Waiting to start…</p>
      ) : (
        <>
          {/* ── Question ── */}
          <div className={`question-box ${feedback ? `qb-${feedback}` : ''}`}>
            <div className="question-expr">{question.display}</div>
            <div className="question-eq">= ?</div>
          </div>

          {/* ── Feedback ── */}
          {feedback === 'correct' && (
            <div className="fb fb-correct">
              <span className="fb-icon">✓</span><span>Correct!</span>
            </div>
          )}
          {feedback === 'wrong' && (
            <div className="fb fb-wrong">
              <span className="fb-icon">✗</span>
              <span><strong>{wrongEntry}</strong> wrong — answer: <strong>{question.answer}</strong></span>
            </div>
          )}
          {!feedback && <div className="fb-spacer" />}

          {/* ── Numpad (desktop only — hidden on tablets/mobile via CSS) ── */}
          <div className="numpad-wrapper">
            {/* Answer display */}
            <div className={`numpad-display ${isLeft ? 'nd-left' : 'nd-right'} ${feedback ? `nd-${feedback}` : ''}`}>
              {input || <span className="nd-placeholder">?</span>}
            </div>

            {/* Digit grid */}
            <div className="numpad-grid">
              {PAD_ROWS.map((row, ri) => (
                <div key={ri} className="numpad-row">
                  {row.map(key => (
                    <button
                      key={key}
                      className={`np-btn ${key === '⌫' ? 'np-back' : 'np-digit'}`}
                      onClick={() => handleNumpad(key)}
                      disabled={disabled}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {/* Pull button */}
            <button
              className={`pull-btn ${isLeft ? 'pull-left' : 'pull-right'}`}
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {isLeft ? '◄ PULL!' : 'PULL! ►'}
            </button>
          </div>

          {/* ── Keyboard input (tablet/mobile only — hidden on desktop via CSS) ── */}
          <div className="keyboard-wrapper">
            <div className="answer-row">
              <input
                ref={inputRef}
                type="number"
                inputMode="numeric"
                className={`answer-input ${isLeft ? 'ai-left' : 'ai-right'}`}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!!feedback}
                placeholder="?"
                autoComplete="off"
              />
              <button
                className={`answer-btn ${isLeft ? 'ab-left' : 'ab-right'}`}
                onClick={handleSubmit}
                disabled={!canSubmit}
              >
                {isLeft ? '◄' : '►'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
