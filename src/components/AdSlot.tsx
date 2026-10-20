interface AdSlotProps {
  label?: string;
  minHeight?: number;
  className?: string;
}

// Reserves fixed ad space so a real unit (e.g. AdSense) can drop in later
// without causing layout shift. No ad network script is wired in yet.
const AdSlot = ({ label = 'Advertisement', minHeight = 100, className = '' }: AdSlotProps) => (
  <div
    aria-hidden="true"
    className={`w-full flex items-center justify-center rounded-lg border border-dashed border-slate-800 bg-slate-900/30 text-[10px] uppercase tracking-widest text-slate-600 light:border-slate-300 light:bg-slate-100 light:text-slate-400 ${className}`}
    style={{ minHeight }}
  >
    {label}
  </div>
);

export default AdSlot;
