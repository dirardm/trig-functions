import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

type Mode = 'dark' | 'light';
interface Ctx { mode: Mode; toggleMode: () => void; }
const C = createContext<Ctx | null>(null);
const K = 'obligai-theme';

function load(): Mode { try { const v = localStorage.getItem(K); if (v === 'dark' || v === 'light') return v; } catch {} return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(load);
  useEffect(() => { document.documentElement.setAttribute('data-theme', mode); localStorage.setItem(K, mode); }, [mode]);
  const toggle = useCallback(() => setMode(p => p === 'dark' ? 'light' : 'dark'), []);
  return <C.Provider value={{ mode, toggleMode: toggle }}>{children}</C.Provider>;
}
export function useTheme() { const c = useContext(C); if (!c) throw new Error('need ThemeProvider'); return c; }
