import { describe, expect, it } from 'vitest';

import { cn } from './utils';

describe('cn', () => {
  it('merges conditional classes and tailwind conflicts', () => {
    const shouldHide = false;
    const classes = cn('px-2', shouldHide ? 'hidden' : '', 'px-4', 'text-sm');

    expect(classes).toBe('px-4 text-sm');
  });
});
