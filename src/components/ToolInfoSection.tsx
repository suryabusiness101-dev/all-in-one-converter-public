import type { ReactNode } from 'react';

const ToolInfoSection = ({ children }: { children: ReactNode }) => (
  <div className="mt-12 pt-8 border-t border-slate-800 light:border-slate-200 max-w-3xl space-y-4 text-sm leading-relaxed text-slate-400 light:text-slate-600 [&_h2]:text-slate-200 [&_h2]:light:text-slate-800 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_strong]:text-slate-300 [&_strong]:light:text-slate-700 [&_a]:text-cyan-400 [&_a]:hover:underline">
    {children}
  </div>
);

export default ToolInfoSection;
