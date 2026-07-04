import { useMemo } from 'react';
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

const PI2 = 6.283185307179586;

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
}

const markerPlugin = {
  id: 'verticalMarker',
  afterDraw(chart: ChartJS, _args: unknown, opts: { angle?: number; fnY?: number | null; derivY?: number | null; color?: string }) {
    const { angle, fnY, derivY, color } = opts;
    if (angle === undefined || angle === null) return;
    const { ctx, scales: { x: xScale, y: yScale } } = chart;
    if (!xScale || !yScale) return;
    const px = xScale.getPixelForValue(angle);
    const xMin = xScale.getPixelForValue(xScale.min);
    const xMax = xScale.getPixelForValue(xScale.max);
    if (px < xMin || px > xMax) return;

    const c = color || '#C0622F';

    // skier on function curve
    if (fnY !== null && fnY !== undefined && isFinite(fnY)) {
      const py = yScale.getPixelForValue(fnY);
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, PI2);
      ctx.fillStyle = c;
      ctx.fill();
      ctx.restore();
    }

    // skier on derivative curve
    if (derivY !== null && derivY !== undefined && isFinite(derivY)) {
      const py = yScale.getPixelForValue(derivY);
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, PI2);
      ctx.fillStyle = c + '88';
      ctx.fill();
      ctx.restore();
    }
  },
};

export default function TrigChart({ curve, color, functionLabel, derivativeLabel, yMin, yMax, markerAngle, markerValue, markerDerivativeValue }: Props) {
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
    animation: { duration: 0 },
    interaction: { intersect: false, mode: 'index' as const },
    plugins: {
      verticalMarker: {
        angle: markerAngle ?? undefined,
        fnY: markerValue,
        derivY: markerDerivativeValue,
        color: color,
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
        grid: { display: false },
        ticks: {
          color: '#94a3b8',
          stepSize: 1.5707963267948966,
          font: { size: 10 },
          callback: (v: string | number) => {
            const n = v as number;
            const p = 3.141592653589793;
            if (Math.abs(n + 2*p) < 0.01) return '−2π';
            if (Math.abs(n + p) < 0.01) return '−π';
            if (Math.abs(n) < 0.01) return '0';
            if (Math.abs(n - p) < 0.01) return 'π';
            if (Math.abs(n - 2*p) < 0.01) return '2π';
            if (Math.abs(n + 3*p/2) < 0.01) return '−3π/2';
            if (Math.abs(n + p/2) < 0.01) return '−π/2';
            if (Math.abs(n - p/2) < 0.01) return 'π/2';
            if (Math.abs(n - 3*p/2) < 0.01) return '3π/2';
            return '';
          },
        },
      },
      y: {
        type: 'linear' as const,
        min: yMin,
        max: yMax,
        display: true,
        grid: { display: false },
        ticks: {
          color: '#94a3b8',
          maxTicksLimit: 7,
          font: { size: 10 },
        },
      },
    },
  }), [curve, functionLabel, derivativeLabel, yMin, yMax, markerAngle, markerValue, markerDerivativeValue, color]);

  return (
    <div className="chart-wrap">
      <div className="chart-wrap__inner">
        <Line data={data} options={options} plugins={[markerPlugin]} />
      </div>
    </div>
  );
}
