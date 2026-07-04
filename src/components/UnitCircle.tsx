import { useRef, useEffect } from 'react';
import type { TrigValues } from '../hooks/useTrigWasm';

const TAU = 6.283185307179586;

interface Props {
  angle: number;
  values: TrigValues | null;
  color: string;
  size?: number;
}

export default function UnitCircle({ angle, values, color, size = 240 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    ctx.strokeStyle = color + '55';
    ctx.lineWidth = 1;
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
    // Angle markers around circle
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

    // Angle arc from positive x-axis
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5;
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

    // sin projection — vertical dashed from x-axis to circle point
    ctx.strokeStyle = color + '88';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px, py); ctx.stroke();

    // cos projection — horizontal dashed from y-axis to circle point
    ctx.beginPath(); ctx.moveTo(cx, py); ctx.lineTo(px, py); ctx.stroke();
    ctx.setLineDash([]);

    // Moving dot on the circle
    ctx.fillStyle = color;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 6;
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

    // θ label — angle value in radians below the circle
    const p = 3.141592653589793;
    let angleLabel = angle.toFixed(3) + ' rad';
    if (Math.abs(angle + p*2) < 0.02) angleLabel = '−2π';
    else if (Math.abs(angle + p) < 0.02) angleLabel = '−π';
    else if (Math.abs(angle) < 0.02) angleLabel = '0';
    else if (Math.abs(angle - p/2) < 0.02) angleLabel = 'π/2';
    else if (Math.abs(angle - p) < 0.02) angleLabel = 'π';
    else if (Math.abs(angle - 3*p/2) < 0.02) angleLabel = '3π/2';
    else if (Math.abs(angle - p*2) < 0.02) angleLabel = '2π';
    ctx.fillStyle = color;
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('θ = ' + angleLabel, cx, cy + r + 28);
  }, [angle, values, color, size]);

  return <canvas ref={canvasRef} style={{ display: 'block', flexShrink: 0 }} />;
}
