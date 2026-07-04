import { useMemo, useRef, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';
import type { TrigCurve } from '../hooks/useTrigWasm';

ChartJS.register(LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

function near(a: number, b: number, tol: number): boolean { const d = a - b; return d > -tol && d < tol; }
const PI2 = 6.283185307179586;

const zeroLinePlugin = {
  id: 'zeroLine',
  afterDraw(chart: ChartJS, _args: unknown, opts: { color?: string }) {
    const { ctx, chartArea, scales: { y } } = chart;
    if (!y || !chartArea) return;
    const y0 = y.getPixelForValue(0);
    if (y0 < chartArea.top || y0 > chartArea.bottom) return;
    ctx.save();
    ctx.strokeStyle = (opts.color || '#94a3b8') + '88';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(chartArea.left, y0); ctx.lineTo(chartArea.right, y0); ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const step = 1.5707963267948966;
    const p = 3.141592653589793;
    const xScale = chart.scales.x;
    if (xScale) {
      const min = xScale.min as number;
      const max = xScale.max as number;
      let v = (min / step) | 0;
      v = v * step < min ? (v + 1) * step : v * step;
      for (; v <= max; v += step) {
        const px = xScale.getPixelForValue(v);
        if (px < chartArea.left || px > chartArea.right) continue;
        let label = '';
        if (near(v, -2*p, 0.01)) label = '−2π';
        else if (near(v, -p, 0.01)) label = '−π';
        else if (near(v, 0, 0.01)) label = '0';
        else if (near(v, p, 0.01)) label = 'π';
        else if (near(v, 2*p, 0.01)) label = '2π';
        else if (near(v, -3*p/2, 0.01)) label = '−3π/2';
        else if (near(v, -p/2, 0.01)) label = '−π/2';
        else if (near(v, p/2, 0.01)) label = 'π/2';
        else if (near(v, 3*p/2, 0.01)) label = '3π/2';
        else continue;
        ctx.fillText(label, px, y0 + 4);
      }
    }
    ctx.restore();
  },
};

interface Props {
  curve: TrigCurve;
  color: string;
  functionLabel: string;
  derivativeLabel: string;
  yMin: number;
  yMax: number;
  markerAngle: number | null;
  markerValue: number | null;
  markerDerivativeValue: number | null;
  onAngleChange?: (angle: number) => void;
  ping?: number;
}

const markerPlugin = {
  id: 'verticalMarker',
  afterDraw(chart: ChartJS, _args: unknown, opts: { angle?: number; fnY?: number | null; derivY?: number | null; color?: string; ping?: number }) {
    const { angle, fnY, derivY, color, ping } = opts;
    if (angle === undefined || angle === null) return;
    const { ctx, scales: { x: xScale, y: yScale } } = chart;
    if (!xScale || !yScale) return;
    const px = xScale.getPixelForValue(angle);
    const xMin = xScale.getPixelForValue(xScale.min);
    const xMax = xScale.getPixelForValue(xScale.max);
    if (px < xMin || px > xMax) return;

    const c = color || '#C0622F';
    const top = yScale.getPixelForValue(yScale.max);
    const bot = yScale.getPixelForValue(yScale.min);

    // Vertical marker line
    ctx.save();
    ctx.strokeStyle = c + '44';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.lineDashOffset = -(Date.now() / 200);
    ctx.beginPath(); ctx.moveTo(px, top); ctx.lineTo(px, bot); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    function drawSkier(py: number, alpha: string, r: number) {
      ctx.save();
      if (ping) {
        const pr = 4 + ping * 20;
        const po = 0.5 * (1 - ping);
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, PI2);
        ctx.strokeStyle = c + Math.round(po * 255).toString(16).padStart(2,'0');
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, PI2);
      ctx.fillStyle = c + alpha;
      ctx.fill();
      ctx.restore();
    }

    if (fnY !== null && fnY !== undefined && isFinite(fnY)) drawSkier(yScale.getPixelForValue(fnY), '', 7);
    if (derivY !== null && derivY !== undefined && isFinite(derivY)) drawSkier(yScale.getPixelForValue(derivY), '88', 7);
  },
};

export default function TrigChart({ curve, color, functionLabel, derivativeLabel, yMin, yMax, markerAngle, markerValue, markerDerivativeValue, onAngleChange, ping }: Props) {
  const chartRef = useRef<ChartJS<'line'>>(null);
  const draggingRef = useRef(false);

  const pointerToAngle = useCallback((clientX: number, el: HTMLElement) => {
    const chart = chartRef.current;
    if (!chart || !onAngleChange) return;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const xScale = chart.scales.x;
    if (!xScale) return;
    const angle = xScale.getValueForPixel(x) as number;
    if (angle < (xScale.min as number) || angle > (xScale.max as number)) return;
    onAngleChange(angle);
  }, [onAngleChange]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    draggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    pointerToAngle(e.clientX, e.currentTarget as HTMLElement);
  }, [pointerToAngle]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    pointerToAngle(e.clientX, e.currentTarget as HTMLElement);
  }, [pointerToAngle]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    draggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  const data = useMemo(() => {
    const points = curve.x.map((xv, i) => ({ x: xv, y: curve.y[i] }));
    const derivPoints = curve.x.map((xv, i) => ({ x: xv, y: curve.derivative_y[i] }));
    return {
      datasets: [
        {
          label: functionLabel,
          data: points,
          borderColor: color,
          backgroundColor: color + '33',
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          tension: 0.3,
          fill: false,
          spanGaps: false,
        },
        {
          label: derivativeLabel,
          data: derivPoints,
          borderColor: color + '99',
          backgroundColor: color + '22',
          borderWidth: 2,
          borderDash: [6, 3],
          pointRadius: 0,
          pointHoverRadius: 5,
          tension: 0.3,
          fill: false,
          spanGaps: false,
        },
      ],
    };
  }, [curve, color, functionLabel, derivativeLabel]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 800, easing: 'easeInOutQuart' as const },
    interaction: { intersect: false, mode: 'index' as const },
    plugins: {
      zeroLine: { color: color },
      verticalMarker: {
        angle: markerAngle ?? undefined,
        fnY: markerValue,
        derivY: markerDerivativeValue,
        color: color,
        ping: ping ?? undefined,
      },
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: 'var(--text-secondary, #94a3b8)',
          usePointStyle: true,
          padding: 16,
          font: { size: 12 },
          filter: (item: { text: string }) => item.text !== '',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15,15,25,0.95)',
        titleColor: '#e2e8f0',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (ctx: { datasetIndex: number; raw: unknown }) => {
            const raw = ctx.raw as { x: number; y: number | null } | null;
            if (!raw || raw.y === null) return '';
            const v = raw.y;
            const label = ctx.datasetIndex === 0 ? functionLabel : derivativeLabel;
            return `${label}: ${v.toFixed(6)}`;
          },
          title: (items: Array<{ raw: unknown }>) => {
            const raw = items[0]?.raw as { x: number } | undefined;
            if (!raw) return '';
            return raw.x.toFixed(1) + '°';
          },
        },
      },
    },
    scales: {
      x: {
        type: 'linear' as const,
        min: -6.283185307179586,
        max: 6.283185307179586,
        display: true,
        border: { display: false },
        grid: { display: false, drawBorder: false },
        ticks: { display: false },
      },
      y: {
        type: 'linear' as const,
        min: yMin,
        max: yMax,
        display: true,
        border: { display: true, color: color + '66' },
        grid: { display: false },
        ticks: {
          color: '#94a3b8',
          maxTicksLimit: 7,
          font: { size: 10 },
        },
      },
    },
  }), [curve, color, functionLabel, derivativeLabel, yMin, yMax, markerAngle, markerValue, markerDerivativeValue, ping]);

  return (
    <div className="chart-wrap"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{ touchAction: 'none', cursor: onAngleChange ? 'grab' : 'default' }}
    >
      <div className="chart-wrap__inner">
        <Line ref={chartRef} data={data} options={options} plugins={[markerPlugin, zeroLinePlugin]} />
      </div>
    </div>
  );
}
