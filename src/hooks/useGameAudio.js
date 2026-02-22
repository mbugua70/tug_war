import { useRef, useEffect, useCallback } from 'react';

export function useGameAudio() {
  const loopRef    = useRef(null);
  const victoryRef = useRef(null);

  useEffect(() => {
    const loop    = new Audio('/game_loop.mpeg');
    loop.loop     = true;
    loop.volume   = 0.4;

    const victory  = new Audio('/victory.mpeg');
    victory.volume = 0.7;

    loopRef.current    = loop;
    victoryRef.current = victory;

    return () => {
      loop.pause();
      victory.pause();
    };
  }, []);

  const stopAll = useCallback(() => {
    const loop    = loopRef.current;
    const victory = victoryRef.current;
    if (loop)    { loop.pause();    loop.currentTime    = 0; }
    if (victory) { victory.pause(); victory.currentTime = 0; }
  }, []);

  const playGameLoop = useCallback(() => {
    const loop = loopRef.current;
    if (loop) { loop.currentTime = 0; loop.play(); }
  }, []);

  const playVictory = useCallback(() => {
    const victory = victoryRef.current;
    if (victory) { victory.currentTime = 0; victory.play(); }
  }, []);

  return { playGameLoop, playVictory, stopAll };
}
