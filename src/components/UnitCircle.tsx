import { useRef, useEffect, useCallback } from 'react';
import type { TrigValues } from '../hooks/useTrigWasm';

function near(a: number, b: number, tol: number): boolean { const d = a - b; return d > -tol && d < tol; }

const TAU = 6.283185307179586;

interface Props {
  angle: number;
  values: TrigValues | null;
  color: string;
  size?: number;
  onAngleChange?: (angle: number) => void;
  ping?: number;
}

export default function UnitCircle({ angle, values, color, size = 240, onAngleChange, ping }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const draggingRef = useRef(false);
  const trailRef = useRef<{x:number;y:number;t:number}[]>([]);

  const pointerToAngle = useCallback((clientX: number, clientY: number, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const a = Math.atan2(-(clientY - cy), clientX - cx);
    const clamped = ((a % TAU) + TAU) % TAU;
    onAngleChange?.(clamped > Math.PI ? clamped - TAU : clamped);
  }, [onAngleChange]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    draggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    pointerToAngle(e.clientX, e.clientY, e.currentTarget as HTMLElement);
  }, [pointerToAngle]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    pointerToAngle(e.clientX, e.clientY, e.currentTarget as HTMLElement);
  }, [pointerToAngle]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    draggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.35;

    ctx.clearRect(0, 0, size, size);

    // Axes
    ctx.strokeStyle = color + '88';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx - r - 12, cy); ctx.lineTo(cx + r + 12, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy - r - 12); ctx.lineTo(cx, cy + r + 12); ctx.stroke();

    // Unit circle ring
    ctx.strokeStyle = color + '88';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();

    // Axis labels
    ctx.fillStyle = color;
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('0', cx + r + 12, cy + 4);
    ctx.font = '9px Inter, sans-serif';
    ctx.fillText('π/2', cx + 4, cy - r - 6);
    ctx.fillText('π', cx - r - 12, cy + 4);
    ctx.fillText('3π/2', cx + 4, cy + r + 12);

    if (!values) return;

    const cosVal = values.cos;
    const sinVal = values.sin;
    const px = cx + cosVal * r;
    const py = cy - sinVal * r;

    // Trail — store and draw previous positions
    const now = Date.now();
    trailRef.current.push({ x:px, y:py, t:now });
    while (trailRef.current.length > 12) trailRef.current.shift();
    for (let i = 0; i < trailRef.current.length; i++) {
      const tr = trailRef.current[i];
      const age = (now - tr.t) / 1000;
      const alpha = 0.3 - age * 0.6;
      if (alpha > 0) {
        ctx.beginPath();
        ctx.arc(tr.x, tr.y, 3 + (1 - alpha) * 3, 0, TAU);
        const a = alpha > 1 ? 1 : alpha < 0 ? 0 : alpha;
        ctx.fillStyle = color + Math.round(a * 255).toString(16).padStart(2, '0');
        ctx.fill();
      }
    }

    // Angle arc with pulsing opacity
    const arcAlpha = 0.35 + Math.sin(now / 1500) * 0.15;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = arcAlpha;
    ctx.beginPath();
    if (angle >= 0) {
      ctx.arc(cx, cy, r * 0.25, 0, -angle, true);
    } else {
      ctx.arc(cx, cy, r * 0.25, 0, -angle, false);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Radius line from center to circle point
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();

    // sin projection — marching dashes
    ctx.strokeStyle = color + '88';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.lineDashOffset = -(now / 150);
    ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px, py); ctx.stroke();

    // cos projection — marching dashes
    ctx.beginPath(); ctx.moveTo(cx, py); ctx.lineTo(px, py); ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;

    // Ping ring
    if (ping !== undefined && ping > 0) {
      const pingR = 8 + ping * 30;
      const pingAlpha = 1 - ping;
      if (pingAlpha > 0) {
        ctx.beginPath(); ctx.arc(px, py, pingR, 0, TAU);
        ctx.strokeStyle = color + Math.round(pingAlpha * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Moving dot on the circle with glow
    ctx.fillStyle = color;
    ctx.shadowColor = color + '99';
    ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.arc(px, py, 6, 0, TAU); ctx.fill();
    ctx.shadowBlur = 0;

    // Projection dots on axes
    ctx.fillStyle = color + '66';
    ctx.beginPath(); ctx.arc(px, cy, 3.5, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(cx, py, 3.5, 0, TAU); ctx.fill();

    // sin value label
    if (sinVal > 0.04 || sinVal < -0.04) {
      ctx.fillStyle = color;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(sinVal.toFixed(2), cx - 8, py + (sinVal > 0 ? -5 : 13));
    }

    // cos value label
    if (cosVal > 0.04 || cosVal < -0.04) {
      ctx.fillStyle = color;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(cosVal.toFixed(2), px, cy + (cosVal > 0 ? 18 : -8));
    }

    // θ label
    const p = 3.141592653589793;
    let angleLabel = angle.toFixed(3) + ' rad';
    if (near(angle, -p*2, 0.02)) angleLabel = '−2π';
    else if (near(angle, -p, 0.02)) angleLabel = '−π';
    else if (near(angle, 0, 0.02)) angleLabel = '0';
    else if (near(angle, p/2, 0.02)) angleLabel = 'π/2';
    else if (near(angle, p, 0.02)) angleLabel = 'π';
    else if (near(angle, 3*p/2, 0.02)) angleLabel = '3π/2';
    else if (near(angle, p*2, 0.02)) angleLabel = '2π';
    ctx.fillStyle = color;
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('θ = ' + angleLabel, cx, cy + r + 28);
  }, [angle, values, color, size, ping]);

  return <canvas ref={canvasRef} className="unit-circle-canvas"
    onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
    style={{ touchAction: 'none', cursor: onAngleChange ? 'grab' : 'default' }}
  />;
}
