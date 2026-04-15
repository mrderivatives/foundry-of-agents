'use client';
import { useRef, useEffect } from 'react';

interface Props {
  width?: number;
  height?: number;
  interactive?: boolean;
  className?: string;
}

export function ForgeFlame({ width = 560, height = 560, interactive = true, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    // --- gridToBraille packer ---
    function gridToBraille(grid: Uint8Array, rows: number, cols: number) {
      const brailleRows = Math.floor(rows / 4);
      const brailleCols = Math.floor(cols / 2);
      const out = new Array(brailleRows * brailleCols);
      for (let by = 0; by < brailleRows; by++) {
        for (let bx = 0; bx < brailleCols; bx++) {
          const y0 = by * 4, x0 = bx * 2;
          let bits = 0;
          if (grid[(y0    ) * cols + x0    ]) bits |= 0x01;
          if (grid[(y0 + 1) * cols + x0    ]) bits |= 0x02;
          if (grid[(y0 + 2) * cols + x0    ]) bits |= 0x04;
          if (grid[(y0 + 3) * cols + x0    ]) bits |= 0x40;
          if (grid[(y0    ) * cols + x0 + 1]) bits |= 0x08;
          if (grid[(y0 + 1) * cols + x0 + 1]) bits |= 0x10;
          if (grid[(y0 + 2) * cols + x0 + 1]) bits |= 0x20;
          if (grid[(y0 + 3) * cols + x0 + 1]) bits |= 0x80;
          out[by * brailleCols + bx] = String.fromCharCode(0x2800 + bits);
        }
      }
      return { chars: out, brailleRows, brailleCols };
    }

    // --- ForgeFlame simulation ---
    const cols = 80;
    const rows = 56;
    const hotCol = '#e0d4ff';
    const midCol = '#a78bfa';
    const dimCol = '#7c3aed';
    const farCol = '#3b1a7a';
    const seedY0 = 0.45;

    let heat = new Float32Array(cols * rows);
    let running = true;

    // Mouse / wind state
    const mouse = { x: -9999, y: -9999, lastX: -9999, lastY: -9999, vx: 0, vy: 0, hover: false };
    const wind = { x: 0, y: 0 };
    const sparks: { cx: number; cy: number; r: number; t: number; max: number }[] = [];

    // Procedural seed: elliptical ember base at bottom
    const seed = new Uint8Array(cols * rows);
    const cx = cols / 2;
    const emberTop = Math.floor(rows * 0.75);
    const emberBottom = rows - 1;
    const maxHalfW = cols * 0.32;
    for (let y = emberTop; y <= emberBottom; y++) {
      const t = (y - emberTop) / Math.max(1, emberBottom - emberTop);
      const halfW = maxHalfW * (0.55 + 0.45 * t);
      for (let x = 0; x < cols; x++) {
        const dx = (x - cx) / halfW;
        if (Math.abs(dx) < 1) seed[y * cols + x] = 1;
      }
    }

    // Mouse bindings
    const toGrid = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const xRatio = (e.clientX - r.left) / r.width;
      const yRatio = (e.clientY - r.top) / r.height;
      return { x: xRatio * cols, y: yRatio * rows };
    };

    const onPointerMove = (e: PointerEvent) => {
      const g = toGrid(e);
      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;
      mouse.x = g.x; mouse.y = g.y;
      mouse.hover = true;
    };
    const onPointerLeave = () => {
      mouse.hover = false;
      mouse.x = -9999; mouse.y = -9999;
    };
    const onPointerDown = (e: PointerEvent) => {
      const g = toGrid(e);
      sparks.push({ cx: g.x, cy: g.y, r: 0, t: 0, max: 10 });
    };

    if (interactive) {
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerleave', onPointerLeave);
      canvas.addEventListener('pointerdown', onPointerDown);
    }

    const ctx = canvas.getContext('2d', { alpha: true })!;

    function step() {
      // Wind from mouse velocity
      if (mouse.hover && mouse.lastX > -9000) {
        const dx = mouse.x - mouse.lastX;
        const dy = mouse.y - mouse.lastY;
        wind.x = wind.x * 0.85 + dx * 0.25;
        wind.y = wind.y * 0.85 + dy * 0.15;
        mouse.lastX = mouse.x;
        mouse.lastY = mouse.y;
      } else {
        wind.x *= 0.9;
        wind.y *= 0.9;
      }

      // Heat diffusion
      const next = new Float32Array(cols * rows);
      for (let y = 0; y < rows - 1; y++) {
        for (let x = 0; x < cols; x++) {
          const sy = y + 1;
          let sx = x - wind.x * (0.3 + 0.7 * (1 - y / rows));
          if (sx < 0) sx = 0;
          if (sx > cols - 1) sx = cols - 1;
          const sxi = Math.floor(sx);
          const sxf = sx - sxi;
          const a = heat[sy * cols + sxi] || 0;
          const b = heat[sy * cols + Math.min(sxi + 1, cols - 1)] || 0;
          const sample = a * (1 - sxf) + b * sxf;
          const heightT = 1 - (y / rows);
          const centreT = Math.abs(x - cols / 2) / (cols / 2);
          const decayEdge = centreT * centreT * heightT * 0.06;
          const decay = 0.988 - decayEdge;
          const flicker = (Math.random() - 0.5) * 0.10;
          next[y * cols + x] = Math.max(0, sample * decay + flicker);
        }
      }
      for (let x = 0; x < cols; x++) next[(rows - 1) * cols + x] = 0;

      // Mouse push-away
      if (mouse.hover) {
        const mx = mouse.x, my = mouse.y;
        const radius = 6;
        for (let y = Math.max(0, my - radius); y < Math.min(rows, my + radius); y++) {
          for (let x = Math.max(0, mx - radius); x < Math.min(cols, mx + radius); x++) {
            const dx = x - mx, dy = y - my;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < radius) {
              const falloff = 1 - d / radius;
              const idx = Math.floor(y) * cols + Math.floor(x);
              next[idx] = (next[idx] || 0) * (1 - falloff * 0.6);
            }
          }
        }
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2;
          const rx = Math.floor(mx + Math.cos(angle) * (radius + 1));
          const ry = Math.floor(my + Math.sin(angle) * (radius + 1));
          if (rx >= 0 && rx < cols && ry >= 0 && ry < rows) {
            next[ry * cols + rx] = Math.min(1, (next[ry * cols + rx] || 0) + 0.1);
          }
        }
      }

      // Inject seed
      const startY = Math.floor(rows * seedY0);
      for (let y = startY; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (seed[y * cols + x]) {
            const baseHeat = 0.85 + Math.random() * 0.15;
            next[y * cols + x] = Math.max(next[y * cols + x] || 0, baseHeat);
          }
        }
      }

      // Sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.t++;
        s.r = Math.min(s.max, s.r + 0.8);
        const steps = Math.ceil(s.r * 3);
        for (let j = 0; j < steps; j++) {
          const angle = (j / steps) * Math.PI * 2;
          const rx = Math.floor(s.cx + Math.cos(angle) * s.r);
          const ry = Math.floor(s.cy + Math.sin(angle) * s.r);
          if (rx >= 0 && rx < cols && ry >= 0 && ry < rows) {
            next[ry * cols + rx] = Math.min(1, (next[ry * cols + rx] || 0) + 1.0 - (s.t / 30));
          }
        }
        if (s.t > 30) sparks.splice(i, 1);
      }

      heat = next;
    }

    function draw() {
      const W = canvas!.width, H = canvas!.height;
      ctx.clearRect(0, 0, W, H);

      const bool = new Uint8Array(cols * rows);
      for (let i = 0; i < cols * rows; i++) bool[i] = heat[i] > 0.14 ? 1 : 0;

      const { chars, brailleRows, brailleCols } = gridToBraille(bool, rows, cols);

      const avgHeat = new Float32Array(brailleRows * brailleCols);
      for (let by = 0; by < brailleRows; by++) {
        for (let bx = 0; bx < brailleCols; bx++) {
          let sum = 0;
          for (let dy = 0; dy < 4; dy++) {
            for (let dx = 0; dx < 2; dx++) {
              sum += heat[(by * 4 + dy) * cols + (bx * 2 + dx)];
            }
          }
          avgHeat[by * brailleCols + bx] = sum / 8;
        }
      }

      const cellW = W / brailleCols;
      const cellH = H / brailleRows;
      ctx.font = `${Math.round(cellH * 1.35)}px "IBM Plex Mono", monospace`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      for (let by = 0; by < brailleRows; by++) {
        for (let bx = 0; bx < brailleCols; bx++) {
          const ch = chars[by * brailleCols + bx];
          if (ch === '\u2800') continue;
          const hv = avgHeat[by * brailleCols + bx];
          let col;
          if (hv > 0.85) col = hotCol;
          else if (hv > 0.55) col = midCol;
          else if (hv > 0.30) col = dimCol;
          else col = farCol;
          ctx.fillStyle = col;
          ctx.fillText(ch, bx * cellW, by * cellH);
        }
      }
    }

    function loop() {
      if (!running) return;
      step();
      draw();
      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);

    return () => {
      running = false;
      if (interactive) {
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerleave', onPointerLeave);
        canvas.removeEventListener('pointerdown', onPointerDown);
      }
    };
  }, [width, height, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={`cursor-crosshair ${className}`}
      style={{ width, height, opacity: 0.21 }}
    />
  );
}
