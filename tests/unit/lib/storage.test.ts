import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearAllStorage, getFromStorage, removeFromStorage, saveToStorage, STORAGE_KEYS } from '@/lib/storage';

describe('storage helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('reads, writes, removes, and clears storage keys', () => {
    saveToStorage(STORAGE_KEYS.EXERCISES, [{ id: 'exercise-1' }]);
    expect(getFromStorage(STORAGE_KEYS.EXERCISES, [])).toEqual([{ id: 'exercise-1' }]);

    removeFromStorage(STORAGE_KEYS.EXERCISES);
    expect(getFromStorage(STORAGE_KEYS.EXERCISES, [])).toEqual([]);

    saveToStorage(STORAGE_KEYS.EXERCISES, [{ id: 'exercise-1' }]);
    saveToStorage(STORAGE_KEYS.WORKOUTS, [{ id: 'workout-1' }]);
    clearAllStorage();

    expect(localStorage.getItem(STORAGE_KEYS.EXERCISES)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.WORKOUTS)).toBeNull();
  });

  it('returns defaults when storage access throws', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('boom');
    });

    expect(getFromStorage('broken', 'fallback')).toBe('fallback');
    getItemSpy.mockRestore();
  });

  it('swallows write and clear errors', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('nope');
    });
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('nope');
    });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    saveToStorage(STORAGE_KEYS.EXERCISES, []);
    removeFromStorage(STORAGE_KEYS.EXERCISES);
    clearAllStorage();

    expect(errorSpy).toHaveBeenCalled();
    setItemSpy.mockRestore();
    removeItemSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
