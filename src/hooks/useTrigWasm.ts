import { useState, useEffect, useRef } from 'react';
import wasmUrl from '../wasm-pkg/trig_wasm_bg.wasm?url';
import { initSync, trig_values, trig_curve, trig_info, trig_point } from '../wasm-pkg/trig_wasm';

let ready = false;
let pending: Promise<void> | null = null;
const onReady = new Set<() => void>();

export async function initWasm(): Promise<void> {
  if (ready) return;
  if (pending) return pending;
  pending = fetch(wasmUrl)
    .then(r => r.arrayBuffer())
    .then(b => { initSync({ module: b }); ready = true; onReady.forEach(fn => fn()); onReady.clear(); })
    .catch(e => { pending = null; throw e; });
  return pending;
}

export function useWasmReady(): boolean {
  const [isReady, setIsReady] = useState(ready);
  useEffect(() => {
    if (ready) { setIsReady(true); return; }
    const cb = () => setIsReady(true);
    onReady.add(cb);
    return () => { onReady.delete(cb); };
  }, []);
  return isReady;
}

export interface TrigValues {
  pi: number; twopi: number;
  sin: number; cos: number; tan: number;
  cot: number; sec: number; csc: number;
}

export interface TrigCurve {
  x: number[]; y: number[]; derivative_y: number[];
}

export interface TrigFuncInfo {
  id: string; name: string; latex: string; derivative_name: string; derivative_latex: string;
  color_index: number; y_min: number; y_max: number;
}

export function useTrigInfo(): TrigFuncInfo[] {
  const isReady = useWasmReady();
  const [info, setInfo] = useState<TrigFuncInfo[]>([]);
  useEffect(() => {
    if (!isReady) return;
    setInfo(JSON.parse(trig_info()) as TrigFuncInfo[]);
  }, [isReady]);
  return info;
}

export function useTrigCurve(funcId: string | null, startDeg: number, endDeg: number, numPoints: number = 200) {
  const isReady = useWasmReady();
  const [result, setResult] = useState<TrigCurve | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!funcId || !isReady) return;
    setLoading(true);
    const json = trig_curve(funcId, startDeg, endDeg, numPoints);
    setResult(JSON.parse(json) as TrigCurve);
    setLoading(false);
  }, [funcId, startDeg, endDeg, numPoints, isReady]);

  return { result, loading };
}

export interface TrigPoint {
  value: number; derivative: number;
}

export function useTrigPoint(funcId: string | null, degrees: number | null) {
  const isReady = useWasmReady();
  const [result, setResult] = useState<TrigPoint | null>(null);

  useEffect(() => {
    if (funcId === null || degrees === null || !isReady) return;
    setResult(JSON.parse(trig_point(funcId, degrees)) as TrigPoint);
  }, [funcId, degrees, isReady]);

  return result;
}

export function useTrigValues(degrees: number | null) {
  const isReady = useWasmReady();
  const [result, setResult] = useState<TrigValues | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (degrees === null || !isReady) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setResult(JSON.parse(trig_values(degrees)) as TrigValues);
    }, 80);
    return () => clearTimeout(timer.current);
  }, [degrees, isReady]);

  return result;
}
