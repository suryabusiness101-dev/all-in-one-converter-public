import React, { useEffect } from 'react';
import { faqs } from '../lib/faqData';

interface FaqModalProps {
  onClose: () => void;
}

const FaqModal: React.FC<FaqModalProps> = ({ onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 light:bg-black/30"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Frequently Asked Questions"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-lg bg-slate-900 border border-slate-700 shadow-2xl p-6 light:bg-white light:border-slate-200"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            Frequently Asked Questions
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="h-8 w-8 shrink-0 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors duration-200 light:text-slate-500 light:hover:text-slate-900 light:hover:bg-slate-100"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-5">
          {faqs.map((item) => (
            <div key={item.q}>
              <h3 className="text-slate-100 font-semibold mb-1 light:text-slate-900">{item.q}</h3>
              <p className="text-slate-400 text-sm leading-relaxed light:text-slate-600">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FaqModal;
