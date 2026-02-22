import { useEffect, useState } from 'react';

// Sharp percussive click synthesized with Web Audio — no file needed
function playTick() {
  try {
    const ctx  = new AudioContext();
    const buf  = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      // Exponentially decaying noise burst
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.008));
    }
    const src    = ctx.createBufferSource();
    src.buffer   = buf;
    const filter = ctx.createBiquadFilter();
    filter.type            = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value         = 0.8;
    const gain        = ctx.createGain();
    gain.gain.value   = 0.55;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start();
    src.onended = () => ctx.close();
  } catch (_) { /* AudioContext not available */ }
}

const STEPS = [
  { label: '3',   color: '#ff4455', dur: 1000 },
  { label: '2',   color: '#ff9900', dur: 1000 },
  { label: '1',   color: '#ffdd00', dur: 1000 },
  { label: 'GO!', color: '#00ff88', dur: 850  },
];

// 2 * π * r  where r = 104
const CIRCUMFERENCE = 653;

export function CountdownOverlay({ onComplete }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const { dur } = STEPS[idx];
    const t = setTimeout(() => {
      if (idx < STEPS.length - 1) {
        setIdx(i => i + 1);
      } else {
        onComplete();
      }
    }, dur);
    return () => clearTimeout(t);
  }, [idx, onComplete]);

  const { label, color } = STEPS[idx];
  const isGo = idx === STEPS.length - 1;

  return (
    <div className="cd-overlay">

      {/* Ambient glow that blooms on each tick */}
      <div
        key={`glow-${idx}`}
        className="cd-ambient"
        style={{ background: `radial-gradient(ellipse 55% 55% at 50% 50%, ${color}28 0%, transparent 70%)` }}
      />

      {/* Shock-ring that expands outward on each tick */}
      <div
        key={`shock-${idx}`}
        className="cd-shock"
        style={{ borderColor: color }}
      />

      <div className="cd-center">

        {/* Draining SVG ring — only for 3/2/1 */}
        {!isGo && (
          <svg key={`ring-${idx}`} className="cd-ring" viewBox="0 0 240 240" aria-hidden="true">
            <circle cx="120" cy="120" r="104" className="cd-ring-track" />
            <circle
              cx="120" cy="120" r="104"
              className="cd-ring-fill"
              style={{ stroke: color, strokeDasharray: CIRCUMFERENCE }}
            />
          </svg>
        )}

        {/* Number or GO! label */}
        <span
          key={`num-${idx}`}
          className={`cd-num${isGo ? ' cd-go' : ''}`}
          style={{
            color,
            textShadow: `0 0 40px ${color}, 0 0 90px ${color}99, 0 0 180px ${color}44`,
          }}
        >
          {label}
        </span>

      </div>
    </div>
  );
}
