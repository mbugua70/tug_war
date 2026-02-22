import { useState, useRef, useCallback, useEffect } from 'react';
import { useGameAudio } from './useGameAudio';

// ── Physics constants ─────────────────────────────────────────────────────────
const SHIFT_PER_CORRECT = 0.12;  // rope shift per correct answer
const TENSION_LERP      = 0.045; // how fast tension follows target
const WIN_THRESHOLD     = 1.0;   // rope boundary — cross it to win
const PULSE_DAMP        = 0.82;
const PULSE_K           = 0.09;

const INITIAL_STATE = {
  leftScore:   0,   // correct answer count
  rightScore:  0,
  ropeTension: 0,
  gameStatus:  'idle', // 'idle' | 'playing' | 'leftWin' | 'rightWin'
};

export function useGameLogic() {
  const [gameState, setGameState] = useState(INITIAL_STATE);
  const { playGameLoop, playVictory, stopAll } = useGameAudio();

  const tensionRef       = useRef(0);
  const targetTensionRef = useRef(0);
  const statusRef        = useRef('idle');
  const rafRef           = useRef(null);
  const loopRef          = useRef(null);
  const pulseDRef        = useRef(0);
  const pulseVRef        = useRef(0);

  // ── Physics loop ──────────────────────────────────────────────────────────
  useEffect(() => {
    loopRef.current = function physicsLoop() {
      if (statusRef.current !== 'playing') return;

      tensionRef.current += (targetTensionRef.current - tensionRef.current) * TENSION_LERP;
      pulseVRef.current   = pulseVRef.current * PULSE_DAMP - pulseDRef.current * PULSE_K;
      pulseDRef.current  += pulseVRef.current;

      const t = tensionRef.current;
      if (t <= -WIN_THRESHOLD || t >= WIN_THRESHOLD) {
        const winner = t <= -WIN_THRESHOLD ? 'leftWin' : 'rightWin';
        statusRef.current = winner;
        stopAll();
        playVictory();
        setGameState(prev => ({ ...prev, gameStatus: winner, ropeTension: t }));
        return;
      }

      setGameState(prev => ({ ...prev, ropeTension: t }));
      rafRef.current = requestAnimationFrame(loopRef.current);
    };
  }, []);

  // ── Start / restart ───────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    tensionRef.current       = 0;
    targetTensionRef.current = 0;
    pulseDRef.current        = 0;
    pulseVRef.current        = 0;
    statusRef.current        = 'playing';
    stopAll();
    playGameLoop();
    setGameState({ ...INITIAL_STATE, gameStatus: 'playing' });
    rafRef.current = requestAnimationFrame(loopRef.current);
  }, [stopAll, playGameLoop]);

  // ── Correct answer from a player ──────────────────────────────────────────
  const onCorrect = useCallback((side) => {
    if (statusRef.current !== 'playing') return;
    if (side === 'left') {
      targetTensionRef.current = Math.max(-WIN_THRESHOLD * 1.5, targetTensionRef.current - SHIFT_PER_CORRECT);
      pulseVRef.current -= 0.55;
      setGameState(prev => ({ ...prev, leftScore: prev.leftScore + 1 }));
    } else {
      targetTensionRef.current = Math.min(WIN_THRESHOLD * 1.5, targetTensionRef.current + SHIFT_PER_CORRECT);
      pulseVRef.current += 0.55;
      setGameState(prev => ({ ...prev, rightScore: prev.rightScore + 1 }));
    }
  }, []);

  // ── Reset to menu ─────────────────────────────────────────────────────────
  const resetGame = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    tensionRef.current       = 0;
    targetTensionRef.current = 0;
    pulseDRef.current        = 0;
    pulseVRef.current        = 0;
    statusRef.current        = 'idle';
    stopAll();
    setGameState(INITIAL_STATE);
  }, [stopAll]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return { gameState, tensionRef, pulseDRef, startGame, onCorrect, resetGame };
}
