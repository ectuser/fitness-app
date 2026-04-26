import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DataProvider, useData } from '@/context/DataContext';

const mockUsePersistentFitnessData = vi.fn();

vi.mock('@/hooks/usePersistentFitnessData', () => ({
  usePersistentFitnessData: () => mockUsePersistentFitnessData(),
}));

function Consumer() {
  const value = useData();
  return <div>{value.settings.defaultWeightUnit}</div>;
}

describe('DataContext', () => {
  it('provides hook data to descendants', () => {
    mockUsePersistentFitnessData.mockReturnValue({
      settings: { defaultWeightUnit: 'lb' },
    });

    render(
      <DataProvider>
        <Consumer />
      </DataProvider>
    );

    expect(screen.getByText('lb')).toBeInTheDocument();
  });

  it('throws when the hook is used outside the provider', () => {
    expect(() => render(<Consumer />)).toThrow('useData must be used within a DataProvider');
  });
});
