import { useEffect, useRef } from 'react';

const COLORS = [
  '#ff2244', '#ff9900', '#ffee00', '#00dd66',
  '#00bbff', '#aa44ff', '#ff44cc', '#ffffff',
];

const PIECE_COUNT = 420;

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

function makePiece(canvasWidth, canvasHeight, fromTop = false) {
  // shape: 0 = rectangle, 1 = circle, 2 = thin strip
  const shape = Math.random() < 0.6 ? 0 : Math.random() < 0.7 ? 2 : 1;
  return {
    x:        randomBetween(0, canvasWidth),
    y:        fromTop
                ? randomBetween(-canvasHeight, 0)
                : randomBetween(-canvasHeight * 0.2, canvasHeight),
    w:        shape === 2 ? randomBetween(2, 4)  : randomBetween(7, 14),
    h:        shape === 2 ? randomBetween(14, 22) : randomBetween(5, 11),
    color:    COLORS[Math.floor(Math.random() * COLORS.length)],
    shape,
    rot:      randomBetween(0, Math.PI * 2),
    rotSpeed: randomBetween(-0.14, 0.14),
    vy:       randomBetween(3.5, 8),
    vx:       randomBetween(-1.5, 1.5),
    waveAmp:  randomBetween(0.8, 2.2),
    waveFreq: randomBetween(0.02, 0.05),
    tick:     randomBetween(0, 100),
    opacity:  randomBetween(0.75, 1),
  };
}

export function WinConfetti() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const ctx = canvas.getContext('2d');

    // Seed pieces spread across entire screen on mount, then loop from top
    const pieces = Array.from({ length: PIECE_COUNT }, () =>
      makePiece(canvas.width, canvas.height, false)
    );

    let rafId;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of pieces) {
        p.tick  += 1;
        p.x     += p.vx + Math.sin(p.tick * p.waveFreq) * p.waveAmp;
        p.y     += p.vy;
        p.rot   += p.rotSpeed;

        // Reset to top when fallen past bottom
        if (p.y > canvas.height + 20) {
          const fresh = makePiece(canvas.width, canvas.height, true);
          Object.assign(p, fresh, { y: randomBetween(-40, 0) });
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;

        if (p.shape === 1) {
          // circle
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // rectangle or strip
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }

        ctx.restore();
      }

      rafId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      'fixed',
        inset:         0,
        width:         '100%',
        height:        '100%',
        pointerEvents: 'none',
        zIndex:        99,
      }}
    />
  );
}
