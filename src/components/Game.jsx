import { useGameLogic }  from '../hooks/useGameLogic';
import { TugArena }      from './TugArena';
import { PlayerPanel }   from './PlayerPanel';
import { WinConfetti }       from './WinConfetti';
import { CountdownOverlay }  from './CountdownOverlay';
import '../styles/game.css';

export function Game() {
  const { gameState, tensionRef, pulseDRef, startGame, beginPlaying, onCorrect, pauseGame, resumeGame, resetGame } = useGameLogic();
  const { gameStatus, leftScore, rightScore } = gameState;

  const isPlaying   = gameStatus === 'playing';
  const isPaused    = gameStatus === 'paused';
  const isCountdown = gameStatus === 'countdown';
  const isOver      = gameStatus === 'leftWin' || gameStatus === 'rightWin';

  return (
    <div className="game-root">

      {/* ── Header ── */}
      <header className="game-header">
        <div className="header-inner">
          <h1 className="game-title">
            <span className="title-l">◄ TUG</span>
            <span className="title-dot"> · </span>
            <span className="title-r">OF WAR ►</span>
          </h1>

          {(isPlaying || isOver) ? (
            <div className="live-score">
              <span className="ls-val ls-left">{leftScore}</span>
              <span className="ls-sep">vs</span>
              <span className="ls-val ls-right">{rightScore}</span>
              <span className="ls-round">correct</span>
            </div>
          ) : (
            <p className="game-subtitle">Answer math questions · correct answers pull the rope!</p>
          )}
        </div>
      </header>

      {/* ── Single row: [Panel] [Arena] [Panel] ── */}
      <div className="game-body">

        <PlayerPanel
          side="left"
          onCorrect={onCorrect}
          gameStatus={gameStatus}
          score={leftScore}
        />

        <div className="arena-wrapper">
          <TugArena tensionRef={tensionRef} pulseDRef={pulseDRef} />

          {/* Pause overlay */}
          {isPaused && (
            <div className="pause-overlay">
              <div className="pause-icon">⏸</div>
              <p className="pause-label">PAUSED</p>
            </div>
          )}

          {/* Start overlay */}
          {gameStatus === 'idle' && (
            <div className="arena-overlay">
              <div className="start-card">
                <div className="start-icon">🏆</div>
                <h2>Tug of War</h2>
                <p>
                  Solve math questions as fast as you can!<br />
                  Every correct answer pulls the rope.<br />
                  Drag your opponent across the line to win!
                </p>
                <button className="btn-start" onClick={startGame}>▶ Start Game</button>
              </div>
            </div>
          )}

        </div>

        <PlayerPanel
          side="right"
          onCorrect={onCorrect}
          gameStatus={gameStatus}
          score={rightScore}
        />
      </div>

      {/* ── Game controls (home + pause) — visible while playing or paused ── */}
      {(isPlaying || isPaused) && (
        <div className="game-controls">
          <button
            className="gc-btn gc-home"
            onClick={resetGame}
            title="Home"
            aria-label="Go to home"
          >
            {/* Home icon */}
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </button>

          <button
            className={`gc-btn gc-pause${isPaused ? ' gc-is-paused' : ''}`}
            onClick={isPaused ? resumeGame : pauseGame}
            title={isPaused ? 'Resume' : 'Pause'}
            aria-label={isPaused ? 'Resume game' : 'Pause game'}
          >
            {isPaused ? (
              /* Play / Resume icon */
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z"/>
              </svg>
            ) : (
              /* Pause icon */
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            )}
          </button>
        </div>
      )}

      {/* ── Countdown overlay ── */}
      {isCountdown && <CountdownOverlay onComplete={beginPlaying} />}

      {/* ── Full-screen win card ── */}
      {isOver && (
        <div className="win-overlay">
          <WinConfetti />
          <div className={`win-card ${gameStatus === 'leftWin' ? 'win-card-left' : 'win-card-right'}`}>
            <div className="win-trophy">🏆</div>
            <h2 className={gameStatus === 'leftWin' ? 'win-hl-left' : 'win-hl-right'}>
              {gameStatus === 'leftWin' ? 'Player 1 Wins!' : 'Player 2 Wins!'}
            </h2>
            <div className="win-score-row">
              <span className={`win-score-val ${gameStatus === 'leftWin' ? 'ws-winner' : 'ws-loser'}`}>
                {leftScore}
              </span>
              <span className="win-score-sep">vs</span>
              <span className={`win-score-val ${gameStatus === 'rightWin' ? 'ws-winner' : 'ws-loser'}`}>
                {rightScore}
              </span>
            </div>
            <p className="win-label">correct answers</p>
            <div className="win-btns">
              <button className="btn-start" onClick={startGame}>▶ Play Again</button>
              <button className="btn-menu"  onClick={resetGame}>🏠 Menu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
