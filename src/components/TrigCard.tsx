import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import { useTheme } from '../context/ThemeContext';
import TrigChart from './TrigChart';
import UnitCircle from './UnitCircle';
import { useTrigCurve, useTrigPoint, useTrigValues, type TrigFuncInfo } from '../hooks/useTrigWasm';
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
  if (Math.abs(frac - 0.166) < 0.005) return 'π/6';
  if (Math.abs(frac - 0.333) < 0.005) return 'π/3';
  if (Math.abs(frac - 0.666) < 0.005) return '2π/3';
  if (Math.abs(frac - 0.833) < 0.005) return '5π/6';
  if (Math.abs(frac - 1.166) < 0.005) return '7π/6';
  if (Math.abs(frac - 1.333) < 0.005) return '4π/3';
  if (Math.abs(frac - 1.666) < 0.005) return '5π/3';
  if (Math.abs(frac - 1.833) < 0.005) return '11π/6';
  return v.toFixed(3) + ' rad';
}

interface Props {
  funcInfo: TrigFuncInfo;
}

function PlayIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;
}
function PauseIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>;
}
function fmt(v: number | null | undefined): string {
  if (v === null || v === undefined) return '—';
  return v.toFixed(6);
}

export default function TrigCard({ funcInfo }: Props) {
  const { mode } = useTheme();
  const themeData = TRIG_THEMES[funcInfo.color_index] ?? TRIG_THEMES[0];
  const theme = { ...themeData, color: mode === 'dark' ? themeData.colorDark : themeData.color };
  const [angle, setAngle] = useState(PI / 4);
  const [isPlaying, setIsPlaying] = useState(false);
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);
  const angleRef = useRef(angle);
  angleRef.current = angle;

  const { result: curve, loading } = useTrigCurve(funcInfo.id, -TAU, TAU, 200);
  const point = useTrigPoint(funcInfo.id, angle);
  const trigValues = useTrigValues(angle);

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

  const togglePlay = useCallback(() => setIsPlaying(p => !p), []);
  const [tilt, setTilt] = useState({ rx:0, ry:0 });
  const [glowPos, setGlowPos] = useState({ x:50, y:50 });
  const [ripple, setRipple] = useState<{x:number;y:number;id:number} | null>(null);
  const [ping, setPing] = useState(0);
  const pingRaf = useRef<number>(0);
  const doPing = useCallback(() => {
    setPing(0);
    cancelAnimationFrame(pingRaf.current);
    let start = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = (ts - start) / 600;
      if (p >= 1) { setPing(0); return; }
      setPing(p);
      pingRaf.current = requestAnimationFrame(step);
    };
    pingRaf.current = requestAnimationFrame(step);
  }, []);
  const prevValueRef = useRef(point?.value);
  const [valueFlash, setValueFlash] = useState(false);
  useEffect(() => {
    if (point && prevValueRef.current !== point.value) { setValueFlash(true); const t=setTimeout(()=>setValueFlash(false),300); prevValueRef.current=point.value; return ()=>clearTimeout(t); }
  }, [point?.value]);
  const handleCardMove = useCallback((e: React.MouseEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left; const y = e.clientY - r.top;
    setTilt({ rx:((y-r.height/2)/r.height*2)*-6, ry:((x-r.width/2)/r.width*2)*6 });
    setGlowPos({ x:(x/r.width)*100, y:(y/r.height)*100 });
  }, []);
  const handleCardLeave = useCallback(() => { setTilt({ rx:0, ry:0 }); setGlowPos({ x:50, y:50 }); }, []);

  const derivFormulaHtml = useMemo(
    () => katex.renderToString(funcInfo.derivative_latex, { throwOnError: false }),
    [funcInfo.derivative_latex],
  );

  return (
    <motion.div
      className={`card regulation-card ${theme.regClass}`}
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateX: tilt.rx, rotateY: tilt.ry }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], rotateX: { type:'spring', stiffness:300, damping:30 }, rotateY: { type:'spring', stiffness:300, damping:30 } }}
      onMouseMove={handleCardMove}
      onMouseLeave={handleCardLeave}
      style={{ perspective:'1000px', transformStyle:'preserve-3d' }}
    >
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', borderRadius:'inherit', background:`radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, ${theme.color}18, transparent 55%)`, zIndex:1 }} />
      <div style={{ position:'relative', zIndex:2 }}>
      <div className="card-header-row">
        <span className="regulation-card__title m-0" dangerouslySetInnerHTML={{ __html: katex.renderToString(funcInfo.latex, { throwOnError: false }) }} style={{ color: theme.color }} />
        <span className={`badge badge--regulation ${theme.badgeClass}`}>Periodic</span>
      </div>

      <div className="mb-3 mt-2">
        <span className="t-label">Derivative</span>{' '}
        <span dangerouslySetInnerHTML={{ __html: derivFormulaHtml }} style={{ color: theme.color }} />
      </div>

      {loading && (
        <div className="chart-wrap__loading">
          <div className="spinner spinner--lg" />
        </div>
      )}

      {curve && !loading && (
        <motion.div className="trig-layout" initial="hidden" animate="visible" variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.12, delayChildren:0.05 } } }}>
          <motion.div className="trig-layout__circle" variants={{ hidden:{ opacity:0, scale:0.85, filter:'blur(8px)' }, visible:{ opacity:1, scale:1, filter:'blur(0px)', transition:{ duration:0.55, ease:[0.16,1,0.3,1] } } }}>
            <UnitCircle angle={angle} values={trigValues} color={theme.color} size={220} onAngleChange={a => { setAngle(a); setIsPlaying(false); doPing(); }} ping={ping} isDragging={false} />
          </motion.div>
          <motion.div className="trig-layout__chart" variants={{ hidden:{ opacity:0, x:40, filter:'blur(8px)' }, visible:{ opacity:1, x:0, filter:'blur(0px)', transition:{ duration:0.55, ease:[0.16,1,0.3,1] } } }}>
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
              onAngleChange={a => { setAngle(a); setIsPlaying(false); doPing(); }}
              ping={ping}
            />
          </motion.div>
        </motion.div>
      )}

      <div className="field mt-3">
        <div className="flex-row flex-between mb-1">
          <span className="t-small">Angle <span dangerouslySetInnerHTML={{ __html: katex.renderToString('\\theta', { throwOnError: false }) }} /></span>
          <div className="flex-row flex-center gap-2">
            <motion.button
              className="btn btn-ghost btn-icon"
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setRipple({ x: e.clientX - r.left, y: e.clientY - r.top, id: Date.now() });
                togglePlay();
              }}
              title={isPlaying ? 'Pause' : 'Play'}
              whileTap={{ scale: 0.85 }}
              style={{ position: 'relative', overflow: 'hidden' }}
            >
              {ripple && (
                <motion.span
                  key={ripple.id}
                  initial={{ width: 0, height: 0, opacity: 0.5, x: ripple.x, y: ripple.y }}
                  animate={{ width: 80, height: 80, opacity: 0, x: ripple.x - 40, y: ripple.y - 40 }}
                  transition={{ duration: 0.5 }}
                  style={{ position: 'absolute', borderRadius: '50%', background: theme.color, pointerEvents: 'none' }}
                />
              )}
              <AnimatePresence mode="wait">
                <motion.span
                  key={isPlaying ? 'pause' : 'play'}
                  initial={{ opacity: 0, rotate: -90, scale: 0 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0 }}
                  transition={{ duration: 0.2 }}
                  className="icon icon--sm"
                >
                  {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
            <span className="t-mono-small">{fmtRad(angle)}</span>
          </div>
        </div>
        <input
          type="range"
          min={-TAU}
          max={TAU}
          step={STEP}
          value={angle}
          onChange={e => { setAngle(Number(e.target.value)); setIsPlaying(false); }}
          className="param-range"
          style={{ '--pct': `${((angle + TAU) / (2 * TAU)) * 100}%` } as React.CSSProperties}
        />
        <span className="t-caption">One rad ≈ 57.3° — one radian is the angle where the arc length equals the radius</span>
      </div>

      <div className="flex-row flex-center gap-3 pt-2">
        <div className="flex-col flex-center">
          <span dangerouslySetInnerHTML={{ __html: katex.renderToString(funcInfo.latex, { throwOnError: false }) }} style={{ color: theme.color }} />
          <motion.span key={point?.value?.toFixed(4)} initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.25 }} className="t-mono" style={{ color: valueFlash ? theme.color : undefined, transition: 'color 0.3s' }}>{fmt(point?.value)}</motion.span>
        </div>
        <div className="flex-col flex-center">
          <span dangerouslySetInnerHTML={{ __html: derivFormulaHtml }} style={{ color: theme.color }} />
          <motion.span key={point?.derivative?.toFixed(4)} initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.25 }} className="t-mono">{fmt(point?.derivative)}</motion.span>
        </div>
      </div>
      </div>
    </motion.div>
  );
}
