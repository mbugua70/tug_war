import { useState } from 'react';

const NUMS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Available operations — easily extensible
const OPS = [
  { symbol: '×', label: 'Multiply', fn: (a, b) => a * b },
  { symbol: '+', label: 'Add',      fn: (a, b) => a + b },
];

export function Calculator({ side, onSubmit, disabled, locked, gameStatus }) {
  const [factorA, setFactorA] = useState(null);
  const [factorB, setFactorB] = useState(null);
  const [opIdx,   setOpIdx]   = useState(0);

  const isLeft  = side === 'left';
  const op      = OPS[opIdx];
  const result  = factorA !== null && factorB !== null ? op.fn(factorA, factorB) : null;

  const isIdle = gameStatus === 'idle';

  const canSubmit = !disabled && !locked && result !== null;

  function pick(setter, val) {
    if (disabled || locked) return;
    setter(val);
  }

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit(side, result);
    setFactorA(null);
    setFactorB(null);
  }

  return (
    <div className={[
      'calculator',
      isLeft ? 'calc-left' : 'calc-right',
      locked  ? 'locked'   : '',
      disabled ? 'calc-disabled' : '',
    ].join(' ')}>

      {/* ── Header ── */}
      <div className="calc-header">
        <span className="player-dot">{isLeft ? '🔵' : '🔴'}</span>
        <span className="player-name">{isLeft ? 'Player 1' : 'Player 2'}</span>
        {locked && <span className="locked-badge">LOCKED</span>}
      </div>

      {/* ── Math display ── */}
      <div className="math-display">
        <span className={`mval ${factorA !== null ? 'mval-set' : ''}`}>{factorA ?? '?'}</span>
        <span className="mop">{op.symbol}</span>
        <span className={`mval ${factorB !== null ? 'mval-set' : ''}`}>{factorB ?? '?'}</span>
        <span className="meq">=</span>
        <span className={`mresult ${result !== null ? 'mresult-ready' : ''}`}>
          {result ?? '?'}
        </span>
      </div>

      {/* ── Operation selector ── */}
      {!isIdle && (
        <div className="op-selector">
          {OPS.map((o, i) => (
            <button
              key={o.symbol}
              className={`op-btn ${opIdx === i ? 'op-active' : ''}`}
              onClick={() => { if (!disabled && !locked) { setOpIdx(i); setFactorA(null); setFactorB(null); } }}
              disabled={disabled || locked}
            >
              {o.symbol} {o.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Number grids ── */}
      {isIdle && <p className="calc-hint">Waiting to start…</p>}

      {!isIdle && (
        <div className="factor-rows">
          {/* Factor A */}
          <div className="factor-row">
            <span className="factor-label">A</span>
            <div className="num-grid">
              {NUMS.map(n => (
                <button
                  key={n}
                  className={`num-btn ${factorA === n ? 'num-active' : ''}`}
                  onClick={() => pick(setFactorA, n)}
                  disabled={disabled || locked}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Factor B */}
          <div className="factor-row">
            <span className="factor-label">B</span>
            <div className="num-grid">
              {NUMS.map(n => (
                <button
                  key={n}
                  className={`num-btn ${factorB === n ? 'num-active' : ''}`}
                  onClick={() => pick(setFactorB, n)}
                  disabled={disabled || locked}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Submit ── */}
      {!isIdle && (
        <button
          className={`pull-btn ${isLeft ? 'pull-left' : 'pull-right'} ${locked ? 'pull-locked' : ''}`}
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {locked ? '⏳ Waiting…' : canSubmit ? '💪 PULL!' : 'Pick A and B'}
        </button>
      )}
    </div>
  );
}
