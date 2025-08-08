import { dev } from '$app/environment';

export const logger = {
  log: (...args: unknown[]) => {
    if (dev) console.log('[DEBUG]', ...args);
  },
  error: (...args: unknown[]) => {
    console.error('[ERROR] ', ...args);
  },
  warn: (...args: unknown[]) => {
    console.warn('[WARN]', ...args);
  },
};
