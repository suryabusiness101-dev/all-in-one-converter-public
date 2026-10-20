import React, { useState } from 'react';
import UnitConverterCard from './UnitConverterCard';
import { unitCategories, type UnitCategory } from '../lib/unitConfigs';

const SmartUnitConverter: React.FC = () => {
  const [category, setCategory] = useState<UnitCategory>('length');
  const active = unitCategories.find((c) => c.key === category)!;

  return (
    <div>
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {unitCategories.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setCategory(c.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border ${
              c.key === category
                ? 'bg-cyan-600/20 text-cyan-400 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                : 'text-slate-400 border-transparent hover:bg-slate-800 hover:text-slate-200 light:text-slate-500 light:hover:bg-slate-100 light:hover:text-slate-900'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <UnitConverterCard key={active.key} title={`${active.label} Converter`} units={active.units} />
    </div>
  );
};

export default SmartUnitConverter;
