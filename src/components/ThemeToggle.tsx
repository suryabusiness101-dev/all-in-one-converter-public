import React, { useSyncExternalStore } from 'react';

type Theme = 'dark' | 'light';

const listeners = new Set<() => void>();
const subscribe = (onStoreChange: () => void) => {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
};

// Reads the `light` class the blocking inline script in index.html already set on <html>
// before hydration ran — not localStorage directly, so this always agrees with what's
// actually applied to the page right now.
const getSnapshot = (): Theme => (document.documentElement.classList.contains('light') ? 'light' : 'dark');

// entry-server.tsx prerenders in Node with no DOM/localStorage to read a real preference
// from, so the static HTML always ships as 'dark'. useSyncExternalStore uses this snapshot
// for the client's first hydration render too (matching that static HTML exactly, so
// hydration never mismatches), then switches to getSnapshot right after — see
// https://react.dev/reference/react/useSyncExternalStore#im-getting-an-error-the-server-used-x-but-the-client-rendered-y
const getServerSnapshot = (): Theme => 'dark';

const setStoredTheme = (next: Theme) => {
  document.documentElement.classList.toggle('light', next === 'light');
  try {
    localStorage.setItem('theme', next);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
};

const ThemeToggle: React.FC = () => {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = () => {
    setStoredTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="inline-flex items-center justify-center h-9 w-9 shrink-0 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors duration-200 light:border-slate-300 light:bg-white light:text-slate-500 light:hover:text-cyan-600 light:shadow-sm"
    >
      {theme === 'dark' ? (
        <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
