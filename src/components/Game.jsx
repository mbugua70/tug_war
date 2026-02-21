import { useGameLogic } from '../hooks/useGameLogic';
import { TugArena }     from './TugArena';
import { PlayerPanel }  from './PlayerPanel';
import '../styles/game.css';

export function Game() {
  const { gameState, tensionRef, pulseDRef, startGame, onCorrect, resetGame } = useGameLogic();
  const { gameStatus, leftScore, rightScore } = gameState;

  const isPlaying = gameStatus === 'playing';
  const isOver    = gameStatus === 'leftWin' || gameStatus === 'rightWin';

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

          {/* Win overlay */}
          {isOver && (
            <div className="arena-overlay">
              <div className="start-card">
                <div className="start-icon">{gameStatus === 'leftWin' ? '🔵' : '🔴'}</div>
                <h2 className={gameStatus === 'leftWin' ? 'win-title-left' : 'win-title-right'}>
                  {gameStatus === 'leftWin' ? 'Player 1 Wins!' : 'Player 2 Wins!'}
                </h2>
                <p>{leftScore} vs {rightScore} correct answers</p>
                <button className="btn-start" onClick={startGame}>▶ Play Again</button>
                <button className="btn-menu"  onClick={resetGame}>🏠 Menu</button>
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
    </div>
  );
}
