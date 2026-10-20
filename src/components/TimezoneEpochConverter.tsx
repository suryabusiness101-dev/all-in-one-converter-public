import React, { useState, useSyncExternalStore } from 'react';
import CopyToClipboardButton from './CopyToClipboardButton';
import TimezoneCombobox from './TimezoneCombobox';
import { toDatetimeLocalString } from '../lib/datetime';
import {
  cityOf,
  countryOf,
  detectLocalZone,
  getPinnedZones,
  hasStoredPins,
  isWallClockGap,
  offsetLabel,
  offsetMs,
  prettyIn,
  setPinnedZones,
  shortName,
  wallClockInZone,
  wallToInstant,
} from '../lib/timezones';

const DT_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;

const TICK_MS = 30000;

/* --- "now" as an external store -------------------------------------------
 * entry-server.tsx prerenders this in Node, so reading `Date.now()` in
 * render or a useState initializer bakes a build-time instant into the
 * static HTML. getServerSnapshot pins SSR *and* the first client render to
 * 0, so they match byte-for-byte (no hydration mismatch); `subscribe` then
 * fills in the real time one render later.
 *
 * getSnapshot returns the cached `sharedNowMs`, NOT a fresh `Date.now()` —
 * a fresh value every call is what React reads as "the store changed on
 * every commit", the unbroken re-render loop ("Maximum update depth
 * exceeded") the old code hit. The value only moves on the 30s tick and the
 * one initial read. */
let sharedNowMs = 0;
const nowListeners = new Set<() => void>();
let nowClockRunning = false;

function emitNow() {
  sharedNowMs = Date.now();
  for (const l of nowListeners) l();
}
function subscribeNow(listener: () => void) {
  nowListeners.add(listener);
  if (!nowClockRunning) {
    nowClockRunning = true;
    // Async so it lands as a normal post-mount store update React re-renders
    // on, rather than a value mutated mid-subscribe.
    setTimeout(emitNow, 0);
    setInterval(emitNow, TICK_MS);
  }
  return () => {
    nowListeners.delete(listener);
  };
}
function useNow(): number {
  return useSyncExternalStore(
    subscribeNow,
    () => sharedNowMs,
    () => 0,
  );
}

/* --- the visitor's zone as an external store -----------------------------
 * Same shape, same reason: `detectLocalZone()` in the Node prerender is the
 * build machine's zone, and baking that into the "From"/"To" pickers left
 * every visitor stuck on it. '' for SSR + first client render, real zone
 * after mount; the cached string keeps getSnapshot referentially stable. */
let cachedZone = '';
const zoneListeners = new Set<() => void>();
let zoneLookupRunning = false;

function subscribeZone(listener: () => void) {
  zoneListeners.add(listener);
  if (!zoneLookupRunning) {
    zoneLookupRunning = true;
    setTimeout(() => {
      cachedZone = detectLocalZone();
      for (const l of zoneListeners) l();
    }, 0);
  }
  return () => {
    zoneListeners.delete(listener);
  };
}
function useClientZone(): string {
  return useSyncExternalStore(
    subscribeZone,
    () => cachedZone,
    () => '',
  );
}

/** First-ever visit: seed the pinned list with the visitor's zone + UTC and
 *  persist it. After this `hasStoredPins()` is true, so it isn't hit again. */
function seedFirstVisitPins(zone: string): string[] {
  const pins = Array.from(new Set([zone, 'UTC']));
  setPinnedZones(pins);
  return pins;
}

const TimezoneEpochConverter: React.FC = () => {
  const seedMs = useNow();
  const clientZone = useClientZone();
  const [dt, setDt] = useState<string | null>(null);
  const [fromZone, setFromZone] = useState<string | null>(null);
  const [toZone, setToZone] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string[]>([]);
  const [seeded, setSeeded] = useState(false);

  // `clientZone` is '' for SSR + the first client render (so this component
  // renders identically to the prerendered HTML — no hydration mismatch),
  // then flips to the visitor's real zone once the store resolves. Seed the
  // pickers and pinned list off it here, in a render-phase branch (React's
  // "store info from previous renders" pattern, same as TimezoneCombobox) —
  // never a useState initializer, which would also run in the Node prerender
  // with the build machine's zone. Pins are read fresh from localStorage at
  // this point, so they survive SPA re-mounts.
  if (clientZone && !seeded) {
    setSeeded(true);
    const pins = hasStoredPins() ? getPinnedZones() : seedFirstVisitPins(clientZone);
    setPinned(pins);
    setFromZone(clientZone);
    setToZone(
      pins.find((z) => z !== clientZone) ||
        (clientZone === 'America/Chicago' ? 'Asia/Kolkata' : 'America/Chicago'),
    );
  }

  // The date field shows "now, in the From zone" until the user edits it.
  // wallToInstant() below reads this string as a wall-clock time *in the
  // From zone*, so seeding it from the browser's own clock (as this did
  // before) was wrong whenever From wasn't the browser's zone. `dt === null`
  // is the "not yet edited" flag: while null the field tracks the live
  // now-in-From value and re-seeds when From changes; the moment the user
  // types (dt becomes a string, even an empty one) their value stands.
  // seedMs is 0 for SSR and the first client render, so both render value="".
  const dtValue = dt ?? (seedMs && fromZone ? wallClockInZone(fromZone, seedMs) : '');

  // Back to "not edited": the field returns to now-in-From and will re-seed
  // on later From-zone changes. (The old handler wrote the browser's local
  // wall clock here — the same zone bug as the initial seed.)
  const handleNow = () => setDt(null);

  const handleSwap = () => {
    if (!fromZone || !toZone) return;
    // Swapping changes direction, not the chosen time — freeze whatever is
    // shown so it survives the From-zone change instead of re-seeding.
    if (dt === null) setDt(dtValue);
    setFromZone(toZone);
    setToZone(fromZone);
  };

  const handlePin = (zone: string) => {
    setPinned((prev) => {
      if (prev.includes(zone)) return prev;
      const next = [...prev, zone];
      setPinnedZones(next);
      return next;
    });
  };

  const handleUnpin = (zone: string) => {
    setPinned((prev) => {
      const next = prev.filter((z) => z !== zone);
      setPinnedZones(next);
      return next;
    });
  };

  let resultTime = '';
  let resultMeta = 'Pick a time and two zones.';
  let dstWarning = '';

  const match = dtValue.match(DT_RE);
  if (fromZone && toZone && match) {
    const [, y, mo, d, h, mi] = match.map(Number) as unknown as number[];
    const instant = wallToInstant(y, mo, d, h, mi, fromZone);

    resultTime = prettyIn(toZone, instant);
    const fromOffset = offsetLabel(fromZone, instant);
    const toOffset = offsetLabel(toZone, instant);
    const diffHours = (offsetMs(instant, toZone) - offsetMs(instant, fromZone)) / 3600000;
    const diffText = `${diffHours > 0 ? '+' : ''}${Math.round(diffHours * 100) / 100}h`;
    const abbr = shortName(toZone, instant);
    resultMeta =
      `${cityOf(fromZone)} (${fromOffset}) → ${cityOf(toZone)} (${toOffset}) · ${diffText}` +
      (abbr ? ` · ${abbr}` : '');

    if (isWallClockGap(h, mi, fromZone, instant)) {
      dstWarning = `That clock time doesn't exist in ${cityOf(fromZone)} on this date (daylight-saving change). Showing the nearest valid instant.`;
    }
  }

  const copyText = resultTime ? `${resultTime} — ${resultMeta}` : '';

  return (
    <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
      <div className="p-4 sm:p-6 bg-slate-800 rounded-lg shadow-lg light:bg-white light:border light:border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-cyan-400">Timezone Converter</h2>
          <button
            type="button"
            onClick={handleNow}
            className="px-3 py-1.5 rounded-md text-sm font-medium bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600 transition-colors duration-200 light:bg-slate-100 light:text-slate-700 light:border-slate-300 light:hover:bg-slate-200"
          >
            Now
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="tz-dt" className="text-slate-300 text-lg block mb-1.5 light:text-slate-600">
              Date and time
            </label>
            <input
              id="tz-dt"
              type="datetime-local"
              step="60"
              value={dtValue}
              onChange={(e) => setDt(e.target.value)}
              className="w-full p-2 rounded-md bg-slate-700 text-slate-100 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono [color-scheme:dark] light:bg-slate-50 light:text-slate-900 light:border-slate-300 light:[color-scheme:light]"
            />
          </div>

          <TimezoneCombobox
            label="From"
            placeholder="Search a city, zone or abbreviation (IST, CST…)"
            value={fromZone}
            onChange={setFromZone}
            pinned={pinned}
          />

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleSwap}
              aria-label="Swap zones"
              className="px-3 py-1.5 rounded-md text-sm font-medium bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600 transition-colors duration-200 light:bg-slate-100 light:text-slate-700 light:border-slate-300 light:hover:bg-slate-200"
            >
              ⇅ Swap
            </button>
          </div>

          <TimezoneCombobox
            label="To"
            placeholder="Search a city, zone or abbreviation"
            value={toZone}
            onChange={setToZone}
            pinned={pinned}
          />

          <div className="bg-slate-700/50 rounded-md p-4 light:bg-slate-50" aria-live="polite">
            <div className="text-xl sm:text-2xl font-semibold font-mono text-slate-100 light:text-slate-900">
              {resultTime || '—'}
            </div>
            <div className="mt-1 text-sm text-slate-400 light:text-slate-500">{resultMeta}</div>
            {dstWarning && <div className="mt-2 text-sm text-amber-400">{dstWarning}</div>}
          </div>

          <div className="flex flex-wrap gap-2">
            <CopyToClipboardButton textToCopy={copyText} />
            <button
              type="button"
              onClick={() => toZone && handlePin(toZone)}
              disabled={!toZone}
              className="px-3 py-1.5 rounded-md text-sm font-medium bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed light:bg-slate-100 light:text-slate-700 light:border-slate-300 light:hover:bg-slate-200"
            >
              Pin &ldquo;to&rdquo; zone
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 bg-slate-800 rounded-lg shadow-lg light:bg-white light:border light:border-slate-200">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Your Clocks</h3>
        {pinned.length === 0 ? (
          <p className="text-sm text-slate-500 light:text-slate-500">
            Pin zones above to keep them here. Saved on this device.
          </p>
        ) : (
          <div className="space-y-2">
            {pinned.map((zone) => (
              <div
                key={zone}
                className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-md bg-slate-700/50 border border-slate-700 light:bg-slate-50 light:border-slate-200"
              >
                <span className="text-slate-300 font-medium light:text-slate-600">
                  {cityOf(zone)}
                  <span className="block text-xs text-slate-500 light:text-slate-400">{countryOf(zone)}</span>
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-100 font-mono text-sm light:text-slate-900">
                    {seedMs
                      ? `${prettyIn(zone, new Date(seedMs))} · ${offsetLabel(zone, new Date(seedMs))}`
                      : '…'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUnpin(zone)}
                    aria-label={`Remove ${cityOf(zone)}`}
                    className="text-slate-500 hover:text-slate-300 px-1.5 light:text-slate-400 light:hover:text-slate-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DurationCalculator />

      <TimezoneEpochFields />
    </div>
  );
};

/** Elapsed time between two zoned date-times. Both fields start blank/null —
 *  no "now" prefill — so unlike the converter above there's no seedMs/clientZone
 *  store to read and nothing computed from Date.now() during initial render;
 *  the whole result is derived from user input, so there's no hydration
 *  mismatch to guard against here. */
const DurationCalculator: React.FC = () => {
  const [dtA, setDtA] = useState('');
  const [zoneA, setZoneA] = useState<string | null>(null);
  const [dtB, setDtB] = useState('');
  const [zoneB, setZoneB] = useState<string | null>(null);

  const matchA = dtA.match(DT_RE);
  const matchB = dtB.match(DT_RE);

  let body: React.ReactNode = (
    <p className="text-sm text-slate-500 light:text-slate-500">
      Set both times and zones to see the elapsed time between them.
    </p>
  );
  let copyText = '';

  if (zoneA && zoneB && matchA && matchB) {
    const [, ya, moa, da, ha, mia] = matchA.map(Number) as unknown as number[];
    const [, yb, mob, db, hb, mib] = matchB.map(Number) as unknown as number[];
    // Resolve each side to a real instant first — never subtract the wall-clock
    // strings directly, or a pair spanning a DST transition comes out an hour off.
    const instantA = wallToInstant(ya, moa, da, ha, mia, zoneA);
    const instantB = wallToInstant(yb, mob, db, hb, mib, zoneB);
    const diffMs = instantB.getTime() - instantA.getTime();
    const absMs = Math.abs(diffMs);

    const totalMinutes = Math.round(absMs / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    const parts: string[] = [];
    if (days) parts.push(`${days} day${days === 1 ? '' : 's'}`);
    if (hours) parts.push(`${hours} hour${hours === 1 ? '' : 's'}`);
    if (minutes || parts.length === 0) parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);
    const humanReadable = parts.join(', ');

    const totalHours = Math.round((absMs / 3600000) * 100) / 100;
    const sign = diffMs > 0 ? '+' : diffMs < 0 ? '-' : '';
    const direction = diffMs === 0 ? null : diffMs > 0 ? 'after' : 'before';

    const gapA = isWallClockGap(ha, mia, zoneA, instantA);
    const gapB = isWallClockGap(hb, mib, zoneB, instantB);

    copyText =
      diffMs === 0
        ? 'Both times are exactly the same instant.'
        : `${humanReadable} (${sign}${totalHours}h / ${sign}${totalMinutes}m) — second time is ${direction} the first`;

    body = (
      <div className="space-y-2">
        <div className="text-xl sm:text-2xl font-semibold font-mono text-slate-100 light:text-slate-900">
          {diffMs === 0 ? 'Exactly the same instant' : humanReadable}
        </div>
        {direction && (
          <div className="text-sm text-slate-400 light:text-slate-500">
            Second time is {direction} the first · {sign}
            {totalHours} hours total · {sign}
            {totalMinutes.toLocaleString()} minutes total
          </div>
        )}
        {(gapA || gapB) && (
          <div className="text-sm text-amber-400 space-y-1">
            {gapA && (
              <div>
                The first clock time doesn&rsquo;t exist in {cityOf(zoneA)} on that date
                (daylight-saving change) — nearest valid instant used.
              </div>
            )}
            {gapB && (
              <div>
                The second clock time doesn&rsquo;t exist in {cityOf(zoneB)} on that date
                (daylight-saving change) — nearest valid instant used.
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-slate-800 rounded-lg shadow-lg light:bg-white light:border light:border-slate-200">
      <h2 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-6">Duration Between Two Times</h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="dur-dt-a" className="text-slate-300 text-lg block mb-1.5 light:text-slate-600">
            First date and time
          </label>
          <input
            id="dur-dt-a"
            type="datetime-local"
            step="60"
            value={dtA}
            onChange={(e) => setDtA(e.target.value)}
            className="w-full p-2 rounded-md bg-slate-700 text-slate-100 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono [color-scheme:dark] light:bg-slate-50 light:text-slate-900 light:border-slate-300 light:[color-scheme:light]"
          />
        </div>

        <TimezoneCombobox
          label="Zone for first time"
          placeholder="Search a city, zone or abbreviation (IST, CST…)"
          value={zoneA}
          onChange={setZoneA}
        />

        <div>
          <label htmlFor="dur-dt-b" className="text-slate-300 text-lg block mb-1.5 light:text-slate-600">
            Second date and time
          </label>
          <input
            id="dur-dt-b"
            type="datetime-local"
            step="60"
            value={dtB}
            onChange={(e) => setDtB(e.target.value)}
            className="w-full p-2 rounded-md bg-slate-700 text-slate-100 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono [color-scheme:dark] light:bg-slate-50 light:text-slate-900 light:border-slate-300 light:[color-scheme:light]"
          />
        </div>

        <TimezoneCombobox
          label="Zone for second time"
          placeholder="Search a city, zone or abbreviation"
          value={zoneB}
          onChange={setZoneB}
        />

        <div className="bg-slate-700/50 rounded-md p-4 light:bg-slate-50" aria-live="polite">
          {body}
        </div>

        {copyText && (
          <div className="flex flex-wrap gap-2">
            <CopyToClipboardButton textToCopy={copyText} />
          </div>
        )}
      </div>
    </div>
  );
};

const TimezoneEpochFields: React.FC = () => {
  const seedMs = useNow();
  const [epochInput, setEpochInput] = useState<string | null>(null);
  const [datetimeInput, setDatetimeInput] = useState<string | null>(null);
  const epochValue = epochInput ?? (seedMs ? Math.floor(seedMs / 1000).toString() : '');
  const datetimeValue = datetimeInput ?? (seedMs ? toDatetimeLocalString(new Date(seedMs)) : '');

  const handleEpochChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setEpochInput(raw);
    if (!/^-?\d+$/.test(raw)) return;
    const seconds = Number(raw);
    if (!Number.isSafeInteger(seconds)) return;
    setDatetimeInput(toDatetimeLocalString(new Date(seconds * 1000)));
  };

  const handleDatetimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDatetimeInput(raw);
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return;
    setEpochInput(Math.floor(date.getTime() / 1000).toString());
  };

  const setNow = () => {
    const now = new Date();
    setEpochInput(Math.floor(now.getTime() / 1000).toString());
    setDatetimeInput(toDatetimeLocalString(now));
  };

  return (
    <div className="p-4 sm:p-6 bg-slate-800 rounded-lg shadow-lg light:bg-white light:border light:border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-cyan-400">Epoch ↔ Date/Time</h2>
        <button
          type="button"
          onClick={setNow}
          className="px-3 py-1.5 rounded-md text-sm font-medium bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600 transition-colors duration-200 light:bg-slate-100 light:text-slate-700 light:border-slate-300 light:hover:bg-slate-200"
        >
          Now
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-0 sm:justify-between">
          <label htmlFor="epoch" className="text-slate-300 text-lg w-full sm:w-1/3 light:text-slate-600">
            Unix Epoch (s):
          </label>
          <input
            id="epoch"
            type="text"
            inputMode="numeric"
            value={epochValue}
            onChange={handleEpochChange}
            className="flex-grow min-w-0 p-2 rounded-md bg-slate-700 text-slate-100 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono light:bg-slate-50 light:text-slate-900 light:border-slate-300"
            placeholder="0"
          />
          <CopyToClipboardButton textToCopy={epochValue} />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-0 sm:justify-between">
          <label htmlFor="datetime" className="text-slate-300 text-lg w-full sm:w-1/3 light:text-slate-600">
            Local Date/Time:
          </label>
          <input
            id="datetime"
            type="datetime-local"
            step="1"
            value={datetimeValue}
            onChange={handleDatetimeChange}
            className="flex-grow min-w-0 p-2 rounded-md bg-slate-700 text-slate-100 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono [color-scheme:dark] light:bg-slate-50 light:text-slate-900 light:border-slate-300 light:[color-scheme:light]"
          />
          <CopyToClipboardButton textToCopy={datetimeValue} />
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-500 light:text-slate-500">
        Epoch is a single, timezone-independent number — it only becomes a local time above at
        the moment you convert it.
      </p>
    </div>
  );
};

export default TimezoneEpochConverter;
