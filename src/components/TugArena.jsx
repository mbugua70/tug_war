import { useEffect, useRef } from 'react';

// ── Bezier helpers ────────────────────────────────────────────────────────────
function bezierPt(t, x0, y0, cx, cy, x1, y1) {
  const mt = 1 - t;
  return {
    x: mt * mt * x0 + 2 * mt * t * cx + t * t * x1,
    y: mt * mt * y0 + 2 * mt * t * cy + t * t * y1,
  };
}

// Draw taut rope as a quadratic bezier between two grip points.
// sag = how much the midpoint dips (0 = perfectly straight).
function drawRope(g, x1, y1, x2, y2, sag) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 + sag;

  // Drop shadow
  g.moveTo(x1, y1 + 5);
  g.quadraticCurveTo(mx, my + 5, x2, y2 + 5);
  g.stroke({ color: 0x000000, alpha: 0.28, width: 10, cap: 'round', join: 'round' });

  // Main rope body
  g.moveTo(x1, y1);
  g.quadraticCurveTo(mx, my, x2, y2);
  g.stroke({ color: 0xbf9450, width: 8, cap: 'round', join: 'round' });

  // Top highlight
  g.moveTo(x1, y1 - 2);
  g.quadraticCurveTo(mx, my - 2, x2, y2 - 2);
  g.stroke({ color: 0xddb862, alpha: 0.65, width: 3, cap: 'round', join: 'round' });

  // Twist marks — sampled along the bezier
  for (let t = 0.06; t < 1; t += 0.13) {
    const p  = bezierPt(t,       x1, y1, mx, my, x2, y2);
    const p2 = bezierPt(t + 0.01, x1, y1, mx, my, x2, y2);
    const dx = p2.x - p.x, dy = p2.y - p.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len * 4, ny = dx / len * 4;
    g.moveTo(p.x - nx, p.y - ny).lineTo(p.x + nx, p.y + ny);
    g.stroke({ color: 0x7a510a, alpha: 0.5, width: 1.5 });
  }
}

// ── Character drawing ─────────────────────────────────────────────────────────
// handX/handY = grip point on rope (fist drawn here, body extends behind)
function drawCharHolding(g, handX, handY, groundY, color, dir, displayTension, time, vel) {
  g.clear();

  const moving      = Math.abs(vel) > 0.15;
  const strideSpeed = moving ? Math.abs(vel) * 2.8 + 6 : 2;
  const strideAmp   = moving ? Math.min(22, Math.abs(vel) * 8 + 10) : 5;
  const phase       = time * strideSpeed * (moving ? Math.sign(vel) : 1);
  const stride      = Math.sin(phase) * strideAmp;
  const bob         = Math.abs(Math.sin(phase)) * (moving ? 4 : 2);

  const dragAmt     = dir === 1 ? Math.max(0, displayTension) : Math.max(0, -displayTension);
  const totalStrain = Math.min(1, dragAmt + Math.abs(displayTension) * 0.3);
  const leanFactor  = -0.18 + totalStrain * 0.50;
  const leanX       = -dir * leanFactor * 28;

  const BODY_BACK = 50;
  const hipX      = handX - dir * BODY_BACK;
  const hipY      = groundY - 36 + bob;
  const shoulderX = hipX + leanX;
  const shoulderY = hipY - 50;
  const headX     = shoulderX + leanX * 0.55;
  const headY     = shoulderY - 27;

  const eFrac   = 0.46;
  const elbow1X = shoulderX + (handX - shoulderX) * eFrac;
  const elbow1Y = shoulderY + 12;
  const elbow2X = elbow1X - dir * 2;
  const elbow2Y = elbow1Y + 9;

  const heel1X = hipX - dir * 16 + stride;
  const toe1X  = hipX + dir * 14 + stride;
  const heel2X = hipX - dir * 16 - stride;
  const toe2X  = hipX + dir * 14 - stride;

  // Shadow
  g.ellipse(hipX, groundY + 4, 30, 9).fill({ color: 0x000000, alpha: 0.25 });

  // Back leg
  g.moveTo(hipX, hipY).lineTo(heel2X, groundY);
  g.moveTo(hipX, hipY).lineTo(toe2X,  groundY);
  g.stroke({ color: Math.max(0, color - 0x444444), width: 10, cap: 'round' });
  // Front leg
  g.moveTo(hipX, hipY).lineTo(heel1X, groundY);
  g.moveTo(hipX, hipY).lineTo(toe1X,  groundY);
  g.stroke({ color, width: 12, cap: 'round' });

  // Shoes (back then front)
  g.ellipse(heel2X - dir * 5, groundY + 5, 14, 6).fill(0x1a1a2e);
  g.ellipse(toe2X  + dir * 5, groundY + 5, 12, 6).fill(0x1a1a2e);
  g.ellipse(heel1X - dir * 5, groundY + 5, 16, 7).fill(0x0d0d1e);
  g.ellipse(toe1X  + dir * 5, groundY + 5, 14, 7).fill(0x0d0d1e);

  // Torso
  g.moveTo(hipX, hipY).lineTo(shoulderX, shoulderY);
  g.stroke({ color, width: 16, cap: 'round' });
  // Jersey stripe
  g.rect(shoulderX + dir * 2 - 4, shoulderY + 14, 8, 14).fill(0xffd700);

  // Back arm
  g.moveTo(shoulderX, shoulderY + 15).lineTo(elbow2X, elbow2Y);
  g.moveTo(elbow2X,   elbow2Y).lineTo(handX, handY + 7);
  g.stroke({ color, width: 9, cap: 'round' });
  // Front arm
  g.moveTo(shoulderX, shoulderY + 5).lineTo(elbow1X, elbow1Y);
  g.moveTo(elbow1X,   elbow1Y).lineTo(handX, handY);
  g.stroke({ color, width: 11, cap: 'round' });

  // Head
  g.circle(headX, headY, 23).fill(color);
  g.circle(headX, headY, 23).stroke({ color: 0x111111, width: 2.5 });
  const eyeX = headX + dir * 9;
  g.circle(eyeX,          headY - 2, 6).fill(0xffffff);
  g.circle(eyeX + dir * 1.8, headY - 2, 3).fill(0x111111);

  // Expression
  if (dragAmt > 0.25 || totalStrain > 0.5) {
    g.ellipse(headX + dir * 5, headY + 10, 6, 4).fill(0xcc2222);
    g.ellipse(headX + dir * 5, headY + 10, 6, 4).stroke({ color: 0x111111, width: 1.5 });
    g.circle(headX - dir * 9, headY - 14, 5).fill({ color: 0x66aaff, alpha: 0.85 });
    g.circle(headX - dir * 8, headY - 20, 3).fill({ color: 0x66aaff, alpha: 0.65 });
  } else {
    g.moveTo(headX + dir * 3,  headY + 11).lineTo(headX + dir * 12, headY + 8);
    g.stroke({ color: 0x111111, width: 2.5, cap: 'round' });
    g.moveTo(headX + dir * 5,  headY - 14).lineTo(headX + dir * 11, headY - 11);
    g.stroke({ color: 0x111111, width: 2,   cap: 'round' });
  }

  // Fist — drawn OVER rope endpoint, creating the grip illusion
  g.circle(handX, handY,      11).fill(color);
  g.circle(handX, handY,      11).stroke({ color: 0x111111, width: 2.5 });
  g.circle(handX, handY + 7,  10).fill(color);
  g.circle(handX, handY + 7,  10).stroke({ color: 0x111111, width: 2 });
  for (let k = -1; k <= 1; k++) {
    g.rect(handX + dir * 1.5, handY + k * 4 - 1, dir * 8, 2)
      .fill({ color: 0x000000, alpha: 0.20 });
  }
}

// ── Tension meter ─────────────────────────────────────────────────────────────
function drawMeter(g, tension, W, H) {
  const mW = 260, mH = 13, mX = W / 2 - mW / 2, mY = H - 26;
  g.rect(mX, mY, mW, mH).fill({ color: 0x080612 });
  g.rect(mX, mY, mW, mH).stroke({ color: 0x404060, width: 1.5 });
  const fillW = Math.abs(tension) * (mW / 2);
  if (tension < 0) g.rect(mX + mW / 2 - fillW, mY, fillW, mH).fill(0x2277ff);
  else if (tension > 0) g.rect(mX + mW / 2, mY, fillW, mH).fill(0xff2233);
  g.rect(mX + mW / 2 - 1.5, mY - 4, 3, mH + 8).fill(0xffffff);
  g.rect(mX,          mY - 4, 3, mH + 8).fill(0x4499ff);
  g.rect(mX + mW - 3, mY - 4, 3, mH + 8).fill(0xff4444);
}

// ── Arena component ───────────────────────────────────────────────────────────
export function TugArena({ tensionRef, pulseDRef }) {
  const containerRef = useRef(null);

  useEffect(() => {
    let pixiApp;
    let destroyed = false;

    async function init() {
      const { Application, Graphics } = await import('pixi.js');

      const el   = containerRef.current;
      const rect = el.getBoundingClientRect();
      const W    = Math.max(Math.round(rect.width), 300);
      const H    = Math.round(W * 0.54);

      // ── Layout constants ─────────────────────────────────────────────────
      const GROUND_Y = Math.round(H * 0.77);
      const HAND_Y   = GROUND_Y - Math.round(H * 0.265);
      const WZ       = Math.round(W * 0.08);  // win-zone width from each edge

      // Fixed rope system — slides as a unit; rope length never changes.
      // At t=±1.0: losing player's grip is clearly past center (W/2),
      // winning player's grip exits the screen on their side.
      const ROPE_LEN  = Math.round(W * 0.55); // rope always this many px long
      const MAX_SLIDE = Math.round(W * 0.38); // how far the rope center shifts at max tension

      pixiApp = new Application();
      await pixiApp.init({
        width: W, height: H,
        backgroundColor: 0x0c0a1c,
        antialias:   true,
        resolution:  Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
      });
      if (destroyed) { pixiApp.destroy(true); return; }

      const canvas = pixiApp.canvas;
      canvas.style.cssText = 'width:100%;height:100%;display:block;';
      el.appendChild(canvas);

      // ── Graphics layers ──────────────────────────────────────────────────
      const bgGfx       = new Graphics();
      const crowdGfx    = new Graphics();
      const glowGfx     = new Graphics();
      const wzGfx       = new Graphics();
      const ropeGfx     = new Graphics();
      const particleGfx = new Graphics();
      const leftGfx     = new Graphics();
      const rightGfx    = new Graphics();
      const flagGfx     = new Graphics();
      const meterGfx    = new Graphics();

      pixiApp.stage.addChild(
        bgGfx, crowdGfx, glowGfx, wzGfx,
        ropeGfx, particleGfx, leftGfx, rightGfx,
        flagGfx, meterGfx,
      );

      // ── Static background ────────────────────────────────────────────────
      bgGfx.rect(0, 0, W, GROUND_Y).fill({ color: 0x0c0a1c });
      for (let i = 0; i < 70; i++) {
        const sr = Math.random() * 1.5 + 0.3;
        bgGfx.circle(Math.random() * W, Math.random() * (GROUND_Y - 40), sr)
          .fill({ color: 0xffffff, alpha: Math.random() * 0.55 + 0.25 });
      }
      bgGfx.rect(0, GROUND_Y,      W, 10).fill({ color: 0x1c4a18 });
      bgGfx.rect(0, GROUND_Y + 10, W, 22).fill({ color: 0x2d5a27 });
      bgGfx.rect(0, GROUND_Y + 32, W, H - GROUND_Y - 32).fill({ color: 0x1a3a16 });
      // Center dividing line
      bgGfx.rect(W / 2 - 1, 0, 2, H).fill({ color: 0xffffff, alpha: 0.10 });

      // ── Crowd silhouettes ────────────────────────────────────────────────
      const CROWD_Y = GROUND_Y - 8;
      for (let cx = 8; cx < W; cx += 20) {
        const isLeft = cx < W / 2;
        const cc     = isLeft ? 0x162140 : 0x3a1220;
        const h      = 22 + (cx * 13 % 14);
        crowdGfx.circle(cx + 10, CROWD_Y - h - 9, 9).fill(cc);
        crowdGfx.rect(cx + 1, CROWD_Y - h, 18, h).fill(cc);
      }

      // ── Win zones ────────────────────────────────────────────────────────
      wzGfx.rect(0, 0, WZ, GROUND_Y).fill({ color: 0x3388ff, alpha: 0.12 });
      wzGfx.rect(W - WZ, 0, WZ, GROUND_Y).fill({ color: 0xff3344, alpha: 0.12 });
      for (let y = 0; y < GROUND_Y; y += 18) {
        wzGfx.rect(WZ - 2, y, 2, 10).fill({ color: 0x3388ff, alpha: 0.45 });
        wzGfx.rect(W - WZ, y, 2, 10).fill({ color: 0xff3344, alpha: 0.45 });
      }
      wzGfx.poly([2, 16, 22, 24, 2, 32]).fill(0x3388ff);
      wzGfx.poly([W - 2, 16, W - 22, 24, W - 2, 32]).fill(0xff3344);

      // ── Particle system ──────────────────────────────────────────────────
      let particles = [];
      function emitDust(x, vel) {
        for (let i = 0; i < 3; i++) {
          particles.push({
            x:    x + (Math.random() - 0.5) * 24,
            y:    GROUND_Y + Math.random() * 4,
            vx:   (Math.random() - 0.5) * 2.5 - vel * 0.2,
            vy:   -(Math.random() * 2.5 + 0.8),
            r:    Math.random() * 4 + 2,
            life: 1.0,
          });
        }
        if (particles.length > 80) particles = particles.slice(-80);
      }

      // Track previous grip positions for velocity (walk animation + dust)
      let prevLeftGripX  = W / 2 - ROPE_LEN / 2;
      let prevRightGripX = W / 2 + ROPE_LEN / 2;
      let time           = 0;

      // ── Ticker ───────────────────────────────────────────────────────────
      pixiApp.ticker.add(ticker => {
        time += ticker.deltaTime / 60;

        const rawTension     = tensionRef.current;
        const pulse          = pulseDRef.current;
        const displayTension = rawTension + pulse * 0.44;
        const clampedT       = Math.max(-1, Math.min(1, displayTension));

        // ── Fixed-length rope system ──────────────────────────────────────
        // The rope slides as a rigid unit. At t=0: centered.
        // At t>0 (right winning): whole rope shifts right →
        //   left grip crosses center into right territory (loser visible)
        //   right grip exits screen right (winner disappears)
        // At t<0 (left winning): mirror of above.
        const ropeCenter  = W / 2 + clampedT * MAX_SLIDE;
        const leftGripX   = ropeCenter - ROPE_LEN / 2;
        const rightGripX  = ropeCenter + ROPE_LEN / 2;
        const gripY       = HAND_Y;

        const leftVel  = leftGripX  - prevLeftGripX;
        const rightVel = rightGripX - prevRightGripX;
        prevLeftGripX  = leftGripX;
        prevRightGripX = rightGripX;

        // Dust at feet — body sits ~50px behind each grip point
        if (Math.abs(leftVel)  > 0.2) emitDust(leftGripX  - 50, leftVel);
        if (Math.abs(rightVel) > 0.2) emitDust(rightGripX + 50, rightVel);

        // ── Atmospheric glow ──────────────────────────────────────────────
        glowGfx.clear();
        const glowAlpha = Math.min(0.22, Math.abs(clampedT) * 0.25);
        if      (clampedT < 0) glowGfx.rect(0,       0, W * 0.5, GROUND_Y).fill({ color: 0x2255ff, alpha: glowAlpha });
        else if (clampedT > 0) glowGfx.rect(W * 0.5, 0, W * 0.5, GROUND_Y).fill({ color: 0xff2233, alpha: glowAlpha });

        // Rope sag: near-zero at rest, springs briefly on each correct answer
        const sagAmount = 2 + Math.abs(pulse) * 18;

        // ── Draw rope — fixed length, clips naturally at screen edges ─────
        ropeGfx.clear();
        drawRope(ropeGfx, leftGripX, gripY, rightGripX, gripY, sagAmount);

        // ── Dust particles ────────────────────────────────────────────────
        particleGfx.clear();
        particles = particles.filter(p => p.life > 0).map(p => {
          p.x += p.vx; p.y += p.vy; p.vy += 0.18; p.life -= 0.045;
          if (p.life > 0) {
            particleGfx.circle(p.x, p.y, Math.max(0.5, p.r * p.life))
              .fill({ color: 0x9b8560, alpha: p.life * 0.55 });
          }
          return p;
        });

        // ── Characters — fists overlap rope endpoints ─────────────────────
        drawCharHolding(leftGfx,  leftGripX,  gripY, GROUND_Y, 0x2277ff, +1, displayTension, time, leftVel);
        drawCharHolding(rightGfx, rightGripX, gripY, GROUND_Y, 0xff2233, -1, displayTension, time, rightVel);

        // ── FLAG — fixed at rope's midpoint = ropeCenter (always on-screen) ─
        // As the rope slides, the flag moves with it, showing who's winning.
        const mx     = ropeCenter;           // midpoint x of the rope
        const my     = gripY + sagAmount;    // midpoint control point y
        const flagPt = bezierPt(0.5, leftGripX, gripY, mx, my, rightGripX, gripY);

        flagGfx.clear();
        // Pole
        flagGfx.moveTo(flagPt.x, flagPt.y - 8).lineTo(flagPt.x, flagPt.y - 38);
        flagGfx.stroke({ color: 0xdddddd, width: 3 });
        // Banner pointing toward winner's side
        if (clampedT >= 0) {
          flagGfx.poly([flagPt.x, flagPt.y - 38, flagPt.x + 18, flagPt.y - 30, flagPt.x, flagPt.y - 22]).fill(0xff4400);
        } else {
          flagGfx.poly([flagPt.x, flagPt.y - 38, flagPt.x - 18, flagPt.y - 30, flagPt.x, flagPt.y - 22]).fill(0xff4400);
        }
        // Rope knot ring
        flagGfx.circle(flagPt.x, flagPt.y, 10).fill(0xdd1111);
        flagGfx.circle(flagPt.x, flagPt.y, 10).stroke({ color: 0xffffff, width: 2 });

        // ── Tension meter ─────────────────────────────────────────────────
        meterGfx.clear();
        drawMeter(meterGfx, clampedT, W, H);
      });
    }

    init();

    return () => {
      destroyed = true;
      if (pixiApp) pixiApp.destroy(true, { children: true });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className="tug-arena"
      aria-label="Tug of War Arena"
    />
  );
}
