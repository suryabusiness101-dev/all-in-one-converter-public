import React, { useState } from 'react';
import CopyToClipboardButton from './CopyToClipboardButton';

interface BaseDef {
  key: string;
  label: string;
  radix: number;
  allowedChars: RegExp;
  prefix: string;
}

const bases: BaseDef[] = [
  { key: 'binary', label: 'Binary', radix: 2, allowedChars: /[^01]/g, prefix: '0b' },
  { key: 'octal', label: 'Octal', radix: 8, allowedChars: /[^0-7]/g, prefix: '0o' },
  { key: 'decimal', label: 'Decimal', radix: 10, allowedChars: /[^0-9]/g, prefix: '' },
  { key: 'hexadecimal', label: 'Hexadecimal', radix: 16, allowedChars: /[^0-9a-fA-F]/g, prefix: '0x' },
];

const BaseConverter: React.FC = () => {
  const [values, setValues] = useState<Record<string, string>>({
    binary: '',
    octal: '',
    decimal: '',
    hexadecimal: '',
  });

  const handleChange = (base: BaseDef) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(base.allowedChars, '');

    if (sanitized === '') {
      setValues({ binary: '', octal: '', decimal: '', hexadecimal: '' });
      return;
    }

    let asBigInt: bigint;
    try {
      asBigInt = BigInt(base.prefix + sanitized);
    } catch {
      return;
    }

    const next: Record<string, string> = {};
    bases.forEach((b) => {
      next[b.key] = b.key === base.key ? sanitized : asBigInt.toString(b.radix);
    });
    setValues(next);
  };

  return (
    <div className="p-4 sm:p-6 bg-slate-800 rounded-lg shadow-lg max-w-md mx-auto light:bg-white light:border light:border-slate-200">
      <h2 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-6 text-center">Base Converter</h2>
      <div className="space-y-4">
        {bases.map((base) => (
          <div key={base.key} className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-0 sm:justify-between">
            <label htmlFor={base.key} className="text-slate-300 text-lg w-full sm:w-1/3 light:text-slate-600">
              {base.label}:
            </label>
            <input
              id={base.key}
              type="text"
              inputMode="text"
              spellCheck={false}
              value={values[base.key]}
              onChange={handleChange(base)}
              className="flex-grow min-w-0 p-2 rounded-md bg-slate-700 text-slate-100 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono light:bg-slate-50 light:text-slate-900 light:border-slate-300"
              placeholder="0"
            />
            <CopyToClipboardButton textToCopy={values[base.key]} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BaseConverter;
