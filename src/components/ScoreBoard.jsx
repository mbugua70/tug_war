export function ScoreBoard({ gameState }) {
  const { leftScore, rightScore, currentRound, rounds, lastWinner, gameStatus } = gameState;

  const recentRounds = rounds.slice(-5).reverse();

  return (
    <div className="scoreboard">
      {/* Score display */}
      <div className="score-display">
        <div className={`score-block score-left ${lastWinner === 'left' ? 'score-flash' : ''}`}>
          <span className="score-label">LEFT</span>
          <span className="score-num">{leftScore}</span>
        </div>

        <div className="score-center">
          <div className="vs-text">VS</div>
          <div className="round-badge">Round {currentRound}</div>
          {lastWinner && lastWinner !== 'tie' && (
            <div className={`round-result ${lastWinner}`}>
              {lastWinner === 'left' ? '◄ Left won' : 'Right won ►'}
            </div>
          )}
          {lastWinner === 'tie' && (
            <div className="round-result tie">✦ Tie!</div>
          )}
        </div>

        <div className={`score-block score-right ${lastWinner === 'right' ? 'score-flash' : ''}`}>
          <span className="score-label">RIGHT</span>
          <span className="score-num">{rightScore}</span>
        </div>
      </div>

      {/* Win announcement */}
      {(gameStatus === 'leftWin' || gameStatus === 'rightWin') && (
        <div className={`win-announcement ${gameStatus === 'leftWin' ? 'win-left' : 'win-right'}`}>
          🏆 {gameStatus === 'leftWin' ? 'LEFT PLAYER WINS!' : 'RIGHT PLAYER WINS!'}
        </div>
      )}

      {/* Round history */}
      {recentRounds.length > 0 && (
        <div className="round-history">
          {recentRounds.map(r => (
            <div
              key={r.round}
              className={`history-row ${r.winner === 'left' ? 'hist-left' : r.winner === 'right' ? 'hist-right' : 'hist-tie'}`}
            >
              <span className="hist-round">R{r.round}</span>
              <span className="hist-left-val">{r.left}</span>
              <span className="hist-sep">vs</span>
              <span className="hist-right-val">{r.right}</span>
              <span className="hist-winner">
                {r.winner === 'left' ? '◄' : r.winner === 'right' ? '►' : '–'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
