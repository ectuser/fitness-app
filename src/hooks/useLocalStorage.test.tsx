import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  it('reads default value when key is missing', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 1));

    expect(result.current[0]).toBe(1);
  });

  it('hydrates from localStorage when value exists', () => {
    localStorage.setItem('counter', JSON.stringify(7));

    const { result } = renderHook(() => useLocalStorage('counter', 1));

    expect(result.current[0]).toBe(7);
  });

  it('updates state and persists values using both direct and updater APIs', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 1));

    act(() => {
      result.current[1](5);
    });

    expect(result.current[0]).toBe(5);
    expect(localStorage.getItem('counter')).toBe('5');

    act(() => {
      result.current[1]((previous) => previous + 2);
    });

    expect(result.current[0]).toBe(7);
    expect(localStorage.getItem('counter')).toBe('7');
  });

  it('falls back to default and logs when stored value is invalid json', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem('counter', '{not-valid');

    const { result } = renderHook(() => useLocalStorage('counter', 3));

    expect(result.current[0]).toBe(3);
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('logs and keeps state when localStorage throws during write', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const setItemSpy = vi.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });

    const { result } = renderHook(() => useLocalStorage('counter', 1));

    act(() => {
      result.current[1](8);
    });

    expect(result.current[0]).toBe(8);
    expect(consoleSpy).toHaveBeenCalled();

    setItemSpy.mockRestore();
  });
});
