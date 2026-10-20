import React, { useState } from 'react';
import CopyToClipboardButton from './CopyToClipboardButton';
import {
  cmykToCmykString,
  cmykToRgb,
  hslToHslString,
  hslToRgb,
  parseCmykString,
  parseHex,
  parseHslString,
  parseRgbString,
  rgbToCmyk,
  rgbToHex,
  rgbToHsl,
  rgbToRgbString,
  type Rgb,
} from '../lib/color';

type FieldKey = 'hex' | 'rgb' | 'hsl' | 'cmyk';

const buildStrings = (rgb: Rgb): Record<FieldKey, string> => ({
  hex: rgbToHex(rgb),
  rgb: rgbToRgbString(rgb),
  hsl: hslToHslString(rgbToHsl(rgb)),
  cmyk: cmykToCmykString(rgbToCmyk(rgb)),
});

const initialRgb: Rgb = { r: 34, g: 211, b: 238 };

const ColorHarmonizer: React.FC = () => {
  const [previewRgb, setPreviewRgb] = useState<Rgb>(initialRgb);
  const [values, setValues] = useState<Record<FieldKey, string>>(() => buildStrings(initialRgb));

  const parseField = (field: FieldKey, raw: string): Rgb | null => {
    switch (field) {
      case 'hex':
        return parseHex(raw);
      case 'rgb':
        return parseRgbString(raw);
      case 'hsl': {
        const hsl = parseHslString(raw);
        return hsl ? hslToRgb(hsl) : null;
      }
      case 'cmyk': {
        const cmyk = parseCmykString(raw);
        return cmyk ? cmykToRgb(cmyk) : null;
      }
    }
  };

  const handleChange = (field: FieldKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const rgb = parseField(field, raw);

    if (!rgb) {
      setValues((prev) => ({ ...prev, [field]: raw }));
      return;
    }

    setPreviewRgb(rgb);
    const strs = buildStrings(rgb);
    strs[field] = raw;
    setValues(strs);
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rgb = parseHex(e.target.value);
    if (!rgb) return;
    setPreviewRgb(rgb);
    setValues(buildStrings(rgb));
  };

  const fields: { key: FieldKey; label: string }[] = [
    { key: 'hex', label: 'HEX' },
    { key: 'rgb', label: 'RGB' },
    { key: 'hsl', label: 'HSL' },
    { key: 'cmyk', label: 'CMYK' },
  ];

  return (
    <div className="p-4 sm:p-6 bg-slate-800 rounded-lg shadow-lg max-w-md mx-auto light:bg-white light:border light:border-slate-200">
      <h2 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-6 text-center">Color Code Harmonizer</h2>

      <div className="flex items-center gap-4 mb-6">
        <div
          className="h-20 w-20 rounded-lg border border-slate-600 shadow-inner shrink-0 transition-colors duration-200 light:border-slate-300"
          style={{ backgroundColor: `rgb(${previewRgb.r}, ${previewRgb.g}, ${previewRgb.b})` }}
        />
        <input
          type="color"
          value={rgbToHex(previewRgb)}
          onChange={handlePickerChange}
          className="h-20 flex-1 rounded-lg cursor-pointer bg-transparent border border-slate-600 light:border-slate-300"
          aria-label="Pick a color"
        />
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.key} className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-0 sm:justify-between">
            <label htmlFor={field.key} className="text-slate-300 text-lg w-full sm:w-1/4 light:text-slate-600">
              {field.label}:
            </label>
            <input
              id={field.key}
              type="text"
              spellCheck={false}
              value={values[field.key]}
              onChange={handleChange(field.key)}
              className="flex-grow min-w-0 p-2 rounded-md bg-slate-700 text-slate-100 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono light:bg-slate-50 light:text-slate-900 light:border-slate-300"
            />
            <CopyToClipboardButton textToCopy={values[field.key]} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorHarmonizer;
