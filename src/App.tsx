import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from './context/ThemeContext';
import { initWasm, useTrigInfo, type TrigFuncInfo } from './hooks/useTrigWasm';
import { TRIG_THEMES } from './data/trigTheme';
import TrigCard from './components/TrigCard';
import HelpModal from './components/HelpModal';
import markSvg from './assets/mark.svg';
import logoLight from './assets/logo.svg';
import logoDark from './assets/logo-dark.svg';

function SunIcon(){return<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m-10-10h2m16 0h2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41"/></svg>}
function MoonIcon(){return<svg viewBox="0 0 24 24"><path d="M20 12.79A9 9 0 1111.21 3a7 7 0 007 9.79z"/></svg>}
function MenuIcon(){return<svg viewBox="0 0 24 24"><path d="M3 12h18M3 6h18M3 18h18"/></svg>}
function HelpIcon(){return<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}

export default function App(){
  const { mode, toggleMode } = useTheme();
  const [ready, setReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => { initWasm().then(() => setReady(true)).catch(() => {}); }, []);

  const funcs: TrigFuncInfo[] = useTrigInfo();
  const activeFunc = funcs[activeIndex] ?? null;

  return (
    <div className="app-shell">
      <aside className={`sidebar${sidebarOpen?' sidebar--expanded':''}`}>
        <div className="sidebar__brand">
          <img src={markSvg} alt="ObligaI" className="sidebar-brand-mark"/>
          <img src={mode==='dark'?logoDark:logoLight} alt="ObligaI" className="sidebar-brand-logo"/>
        </div>
        <div className="sidebar__group">Functions</div>
        <nav className="sidebar__nav">
          {funcs.map((f, i) => {
            const theme = TRIG_THEMES[f.color_index] ?? TRIG_THEMES[0];
            return (
              <button key={f.id} className={`nav-item ${theme.tClass}${activeIndex===i?' is-active':''}`} onClick={() => setActiveIndex(i)}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={theme.shape}/></svg>
                <span className="nav-item__label">{f.name}</span>
              </button>
            );
          })}
        </nav>
        <div className="sidebar__footer">
          <button className="btn btn-ghost btn-icon" onClick={()=>setSidebarOpen(o=>!o)}>
            <span className="icon">{sidebarOpen?<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>:<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>}</span>
          </button>
        </div>
      </aside>

      <header className="topbar">
        <div className="topbar__left">
          <button className="btn btn-ghost btn-icon" onClick={()=>setSidebarOpen(o=>!o)}><span className="icon"><MenuIcon/></span></button>
          <h1 className="t-h4 m-0">Trigonometric Functions</h1>
        </div>
        <div className="topbar__right">
          <button className="btn btn-ghost btn-icon" onClick={() => setHelpOpen(true)} title="Help">
            <span className="icon"><HelpIcon/></span>
          </button>
          <motion.button className="btn btn-ghost btn-icon" onClick={toggleMode} whileTap={{ scale:0.85 }}>
            <AnimatePresence mode="wait">
              <motion.span
                key={mode}
                initial={{ opacity:0, rotate:-180, scale:0 }}
                animate={{ opacity:1, rotate:0, scale:1 }}
                exit={{ opacity:0, rotate:180, scale:0 }}
                transition={{ duration:0.3 }}
                className="icon"
              >
                {mode==='dark'?<SunIcon/>:<MoonIcon/>}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </header>

      <main className="app-shell__content">
        {!ready && (
          <div className="flex-center loading-screen">
            <div className="spinner spinner--lg spinner--centered"/>
          </div>
        )}
        {ready && activeIndex<0 && (
          <div className="empty-state">
            <div className="empty-state__icon"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="20"/></svg></div>
            <h2 className="empty-state__title">Select a Function</h2>
            <p className="empty-state__body">Choose a trigonometric function from the sidebar to explore its curve and derivative — all computed in Rust via WebAssembly.</p>
          </div>
        )}
        {ready && activeFunc && (
          <div key={activeFunc.id} className="content-card-wrap">
            <TrigCard funcInfo={activeFunc}/>
          </div>
        )}
        <AnimatePresence>
          {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
        </AnimatePresence>
      </main>
    </div>
  );
}
