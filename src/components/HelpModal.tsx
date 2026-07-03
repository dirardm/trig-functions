import { useEffect } from 'react';
import { motion } from 'framer-motion';
import katex from 'katex';
import { TRIG_HELP } from '../data/trigHelp';

interface Props {
  onClose: () => void;
}

function Formula({ latex, displayMode = false }: { latex: string; displayMode?: boolean }) {
  const html = katex.renderToString(latex, { throwOnError: false, displayMode });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function HelpModal({ onClose }: Props) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <motion.div
      className="modal-scrim"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal"
        style={{ maxWidth: '800px', maxHeight: '85vh', overflow: 'auto' }}
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        onClick={e => e.stopPropagation()}
      >
        <h2 className="modal__title">Trigonometric Functions Reference</h2>

        <p className="modal__body mb-4">
          Each trigonometric function is defined by its relationship to the unit circle
          {' '}<Formula latex="x^2+y^2=1"/> or as a ratio of sides in a right triangle.
          The derivative of each function gives the instantaneous rate of change at each angle —
          visualised as the dashed curve on every chart. All computation is performed in{' '}
          <strong>Rust</strong> compiled to <strong>WebAssembly</strong> via <code>wasm-pack</code>.
        </p>

        {TRIG_HELP.map(d => (
          <div key={d.id} className="mb-6">
            <div className={`regulation-card ${d.regClass}`} style={{ padding: 'var(--space-6)' }}>
              <div className="flex-row gap-3 mb-2">
                <h3 className="t-h3 m-0" id={`help-${d.id}`}><Formula latex={d.nameLatex} /></h3>
                <span className="badge badge--regulation">Periodic</span>
              </div>

              <div className="mb-3">
                <span className="t-label">Definition</span>
                <div className="mt-1"><Formula latex={d.definition} displayMode /></div>
              </div>

              <div className="grid-3 mb-3">
                <div>
                  <span className="t-label">Derivative</span>
                  <div className="mt-1"><Formula latex={d.derivative} displayMode /></div>
                </div>
                <div>
                  <span className="t-label">Domain</span>
                  <div className="mt-1"><Formula latex={d.domain} displayMode /></div>
                </div>
                <div>
                  <span className="t-label">Period</span>
                  <div className="mt-1"><Formula latex={d.period} displayMode /></div>
                </div>
              </div>

              <hr className="divider mb-3" />

              <div className="mb-3">
                <span className="t-label">Example</span>
                <div className="t-body mt-1"><Formula latex={d.example} /></div>
              </div>
              <div>
                <span className="t-label">Common Uses</span>
                <div className="t-body mt-1"><Formula latex={d.uses} /></div>
              </div>
            </div>
          </div>
        ))}

        <div className="modal__actions">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
