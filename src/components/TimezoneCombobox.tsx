import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ALIAS_BY_ZONE,
  ambiguousAliasMatches,
  canonicalZone,
  cityOf,
  countryOf,
  offsetLabel,
  searchZones,
  synonymsOf,
  zoneLabel,
} from '../lib/timezones';

/** "City, Country — Zone/Id" shown in the input once a zone is chosen, with
 *  the id canonicalised so a runtime that lists e.g. `Asia/Calcutta` still
 *  reads as `Asia/Kolkata`. */
const displayLabel = (zone: string) => `${zoneLabel(zone)} — ${canonicalZone(zone)}`;

interface TimezoneComboboxProps {
  label: string;
  placeholder: string;
  value: string | null;
  onChange: (zone: string) => void;
  pinned?: string[];
}

interface Placement {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
}

const LIST_HEIGHT_ESTIMATE = 260;

const TimezoneCombobox: React.FC<TimezoneComboboxProps> = ({ label, placeholder, value, onChange, pinned = [] }) => {
  const reactId = useId();
  const inputId = `tz-combo-${reactId}`;
  const listId = `tz-combo-list-${reactId}`;

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [text, setText] = useState(value ? displayLabel(value) : '');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [placement, setPlacement] = useState<Placement | null>(null);

  // Sync displayed text when `value` changes from outside (e.g. the swap
  // button) without fighting text the user is actively typing while open.
  // Comparing against a snapshot of the previous prop during render — rather
  // than in an effect — avoids an extra render pass (see React's "adjusting
  // state when a prop changes" guidance).
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    if (!open) setText(value ? displayLabel(value) : '');
  }

  const recomputePlacement = () => {
    const input = inputRef.current;
    if (!input) return;
    const rect = input.getBoundingClientRect();
    const maxHeight = Math.min(LIST_HEIGHT_ESTIMATE, window.innerHeight * 0.4);
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const flipUp = spaceBelow < maxHeight && spaceAbove > spaceBelow;

    setPlacement({
      left: rect.left,
      width: rect.width,
      maxHeight,
      ...(flipUp
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    recomputePlacement();
    const reposition = () => recomputePlacement();
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    window.visualViewport?.addEventListener('resize', reposition);
    window.visualViewport?.addEventListener('scroll', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
      window.visualViewport?.removeEventListener('resize', reposition);
      window.visualViewport?.removeEventListener('scroll', reposition);
    };
  }, [open]);

  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (listRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, []);

  const runSearch = (query: string) => {
    const results = searchZones(query, pinned);
    setItems(results);
    setActiveIndex(results.length ? 0 : -1);
    setOpen(true);
  };

  const pick = (index: number) => {
    const zone = items[index];
    if (!zone) return;
    setText(displayLabel(zone));
    setOpen(false);
    onChange(zone);
  };

  const ambiguous = ambiguousAliasMatches(text);

  return (
    <div className="relative" ref={rootRef}>
      <label htmlFor={inputId} className="text-slate-300 text-lg block mb-1.5 light:text-slate-600">
        {label}
      </label>
      <input
        id={inputId}
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        value={text}
        placeholder={placeholder}
        onFocus={(e) => {
          e.target.select();
          runSearch('');
        }}
        onChange={(e) => {
          setText(e.target.value);
          runSearch(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            if (!items.length) return;
            setActiveIndex((i) => (i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length);
          } else if (e.key === 'Enter') {
            e.preventDefault();
            pick(activeIndex);
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
        className="w-full p-2 rounded-md bg-slate-700 text-slate-100 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 light:bg-slate-50 light:text-slate-900 light:border-slate-300"
      />

      {open &&
        placement &&
        createPortal(
          <div
            ref={listRef}
            id={listId}
            role="listbox"
            style={{
              position: 'fixed',
              left: placement.left,
              width: placement.width,
              top: placement.top,
              bottom: placement.bottom,
              maxHeight: placement.maxHeight,
            }}
            className="z-50 overflow-auto rounded-md bg-slate-800 border border-slate-600 shadow-2xl light:bg-white light:border-slate-300"
          >
            {ambiguous && (
              <div className="px-3 py-1.5 text-xs uppercase tracking-wider text-slate-400 bg-slate-900/60 sticky top-0 light:text-slate-500 light:bg-slate-100">
                {text.trim().toUpperCase()} matches {ambiguous.length} zones — pick one
              </div>
            )}
            {items.length === 0 && (
              <div className="px-3 py-2 text-sm text-slate-400 light:text-slate-500">No match</div>
            )}
            {items.map((zone, idx) => {
              const abbr = (ALIAS_BY_ZONE[zone] || [])[0];
              const synonyms = synonymsOf(zone);
              return (
                <div
                  key={zone}
                  role="option"
                  aria-selected={idx === activeIndex}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(idx);
                  }}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`px-3 py-2 cursor-pointer flex items-center justify-between gap-3 ${
                    idx === activeIndex ? 'bg-slate-700 light:bg-slate-100' : ''
                  }`}
                >
                  <span className="min-w-0">
                    <span className="text-slate-100 light:text-slate-900">
                      {cityOf(zone)}, {countryOf(zone)}
                    </span>
                    {abbr && <span className="ml-2 text-cyan-400 text-xs">{abbr}</span>}
                    <br />
                    <span className="text-slate-500 text-xs truncate light:text-slate-400">{canonicalZone(zone)}</span>
                    {synonyms.length > 0 && (
                      <span className="text-slate-500 text-xs truncate light:text-slate-400">
                        {' '}
                        · aka {synonyms.slice(0, 3).join(', ')}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-slate-400 text-sm font-mono light:text-slate-500">
                    {offsetLabel(zone, new Date())}
                  </span>
                </div>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default TimezoneCombobox;
