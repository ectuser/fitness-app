import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  clearAllStorage,
  getFromStorage,
  removeFromStorage,
  saveToStorage,
  STORAGE_KEYS,
} from './storage';

describe('storage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('saves and reads JSON values', () => {
    saveToStorage('key', { value: 42 });

    expect(getFromStorage('key', { value: 0 })).toEqual({ value: 42 });
  });

  it('returns default value for missing or invalid values', () => {
    expect(getFromStorage('missing', 'fallback')).toBe('fallback');

    localStorage.setItem('broken', '{invalid');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(getFromStorage('broken', 'fallback')).toBe('fallback');
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('removes storage values', () => {
    saveToStorage('key', 'value');
    removeFromStorage('key');

    expect(localStorage.getItem('key')).toBeNull();
  });

  it('clears all known application keys', () => {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.setItem(key, 'value'));

    clearAllStorage();

    Object.values(STORAGE_KEYS).forEach((key) => {
      expect(localStorage.getItem(key)).toBeNull();
    });
  });
});
