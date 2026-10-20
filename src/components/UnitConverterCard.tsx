import React, { useState } from 'react';
import CopyToClipboardButton from './CopyToClipboardButton';

export interface UnitDef {
  key: string;
  label: string;
  /** Convert a value in this unit to the base unit. */
  toBase: (value: number) => number;
  /** Convert a value in the base unit to this unit. */
  fromBase: (value: number) => number;
}

interface UnitConverterCardProps {
  title: string;
  units: UnitDef[];
}

const formatNumber = (value: number) => (Number.isFinite(value) ? value.toFixed(4) : '');

const UnitConverterCard: React.FC<UnitConverterCardProps> = ({ title, units }) => {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    units.forEach((unit, i) => {
      initial[unit.key] = i === 0 ? '0' : formatNumber(unit.fromBase(0));
    });
    return initial;
  });

  const handleChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const parsed = parseFloat(raw);

    if (raw.trim() === '' || Number.isNaN(parsed)) {
      // Keep whatever the user typed (including intermediate states like "1." or "-")
      // without touching the other fields, so we never fight the caret mid-keystroke.
      setValues((prev) => ({ ...prev, [key]: raw }));
      return;
    }

    const sourceUnit = units.find((u) => u.key === key)!;
    const base = sourceUnit.toBase(parsed);

    const next: Record<string, string> = {};
    units.forEach((unit) => {
      next[unit.key] = unit.key === key ? raw : formatNumber(unit.fromBase(base));
    });
    setValues(next);
  };

  return (
    <div className="p-4 sm:p-6 bg-slate-800 rounded-lg shadow-lg max-w-md mx-auto light:bg-white light:border light:border-slate-200">
      <h2 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-6 text-center">{title}</h2>
      <div className="space-y-4">
        {units.map((unit) => (
          <div key={unit.key} className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-0 sm:justify-between">
            <label htmlFor={unit.key} className="text-slate-300 text-lg w-full sm:w-1/3 light:text-slate-600">
              {unit.label}:
            </label>
            <input
              id={unit.key}
              type="number"
              value={values[unit.key]}
              onChange={handleChange(unit.key)}
              className="flex-grow min-w-0 p-2 rounded-md bg-slate-700 text-slate-100 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 light:bg-slate-50 light:text-slate-900 light:border-slate-300"
              placeholder="0"
            />
            <CopyToClipboardButton textToCopy={values[unit.key]} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnitConverterCard;
