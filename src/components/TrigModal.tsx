import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import katex from 'katex';
import TrigChart from './TrigChart';
import { useTrigCurve, useTrigPoint, type TrigFuncInfo } from '../hooks/useTrigWasm';
import { TRIG_THEMES } from '../data/trigTheme';

const TAU = 6.283185307179586;
const PI = 3.141592653589793;
const STEP = TAU / 360;

function fmtRad(v: number): string {
  const t = ((v % TAU) + TAU) % TAU;
  if (t < 0.001 && t > -0.001) return '0';
  const frac = t / PI;
  if (Math.abs(frac - 2) < 0.002) return '2π';
  if (Math.abs(frac - 1) < 0.002) return 'π';
  if (Math.abs(frac - 0.5) < 0.002) return 'π/2';
  if (Math.abs(frac - 1.5) < 0.002) return '3π/2';
  if (Math.abs(frac - 0.25) < 0.002) return 'π/4';
  if (Math.abs(frac - 0.75) < 0.002) return '3π/4';
  if (Math.abs(frac - 1.25) < 0.002) return '5π/4';
  if (Math.abs(frac - 1.75) < 0.002) return '7π/4';
  return v.toFixed(2) + ' rad';
}

function PlayIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;
}
function PauseIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>;
}
function CloseIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>;
}

function fmt(v: number | null | undefined): string {
  if (v === null || v === undefined) return '—';
  return v.toFixed(6);
}

interface Props {
  funcInfo: TrigFuncInfo;
  initialAngle: number;
  onClose: () => void;
}

export default function TrigModal({ funcInfo, initialAngle, onClose }: Props) {
  const theme = TRIG_THEMES[funcInfo.color_index] ?? TRIG_THEMES[0];
  const [angle, setAngle] = useState(initialAngle);
  const [isPlaying, setIsPlaying] = useState(false);
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);
  const angleRef = useRef(angle);
  angleRef.current = angle;

  const { result: curve, loading } = useTrigCurve(funcInfo.id, -TAU, TAU, 400);
  const point = useTrigPoint(funcInfo.id, angle);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const animate = useCallback((ts: number) => {
    if (!lastRef.current) lastRef.current = ts;
    const dt = ts - lastRef.current;
    lastRef.current = ts;
    const speed = 2.0;
    const next = angleRef.current + (speed * dt) / 1000;
    if (next > TAU) {
      setAngle(-TAU);
      angleRef.current = -TAU;
    } else {
      setAngle(next);
      angleRef.current = next;
    }
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      lastRef.current = 0;
      rafRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, animate]);

  return (
    <motion.div
      className="modal-scrim"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`modal card regulation-card ${theme.regClass}`}
        style={{ maxWidth: '960px', maxHeight: '92vh', overflow: 'auto' }}
        initial={{ opacity: 0, scale: 0.92, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 40 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        onClick={e => e.stopPropagation()}
      >
        <button className="btn btn-ghost btn-icon modal__close-btn" onClick={onClose} style={{ position: 'absolute', top: 8, right: 8 }}>
          <span className="icon"><CloseIcon /></span>
        </button>

        <div className="flex-row gap-3 mb-2">
          <h2 className="modal__title m-0" dangerouslySetInnerHTML={{ __html: katex.renderToString(funcInfo.latex, { throwOnError: false }) }} />
          <span className={`badge badge--regulation ${theme.badgeClass}`}>Periodic</span>
        </div>
        <p className="modal__body mb-4" dangerouslySetInnerHTML={{ __html: katex.renderToString(funcInfo.derivative_latex, { throwOnError: false, displayMode: true }) }} />

        {loading && (
          <div className="chart-wrap__loading" style={{ minHeight: 400 }}>
            <div className="spinner spinner--lg" />
          </div>
        )}

        {curve && !loading && (
          <div style={{ height: '50vh', minHeight: 380 }}>
            <TrigChart
              curve={curve}
              color={theme.color}
              functionLabel={funcInfo.name}
              derivativeLabel={funcInfo.derivative_name}
              yMin={funcInfo.y_min}
              yMax={funcInfo.y_max}
              markerAngle={angle}
              markerValue={point?.value ?? null}
              markerDerivativeValue={point?.derivative ?? null}
            />
          </div>
        )}

        <div className="field mt-4">
          <div className="flex-row flex-between mb-1">
            <span className="t-small">Angle θ</span>
            <div className="flex-row flex-center gap-2">
              <button className="btn btn-ghost btn-icon" onClick={() => setIsPlaying(p => !p)}>
                <span className="icon icon--sm">{isPlaying ? <PauseIcon /> : <PlayIcon />}</span>
              </button>
              <span className="t-mono-small">{fmtRad(angle)}</span>
            </div>
          </div>
          <input type="range" min={-TAU} max={TAU} step={STEP} value={angle}
            onChange={e => { setAngle(Number(e.target.value)); setIsPlaying(false); }}
            className="param-range"
          />
        </div>

        <div className="flex-row flex-center gap-4 pt-3">
          <div className="flex-col flex-center">
            <span dangerouslySetInnerHTML={{ __html: katex.renderToString(funcInfo.latex, { throwOnError: false }) }} />
            <span className="t-mono">{fmt(point?.value)}</span>
          </div>
          <div className="flex-col flex-center">
            <span dangerouslySetInnerHTML={{ __html: katex.renderToString(funcInfo.derivative_latex, { throwOnError: false }) }} />
            <span className="t-mono">{fmt(point?.derivative)}</span>
          </div>
        </div>

        <div className="modal__actions mt-4">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
