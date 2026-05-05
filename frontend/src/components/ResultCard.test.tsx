import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ResultCard } from './ResultCard';
import type { AddressResult } from '../types';

const mockResult: AddressResult = {
  location: { latitude: -33.42968, longitude: 149.56705 },
  suburb: 'BATHURST',
  stateElectoralDistrict: 'BATHURST',
};

describe('ResultCard', () => {
  it('renders nothing when result is null', () => {
    const { container } = render(<ResultCard result={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('displays all result fields when result is provided', () => {
    render(<ResultCard result={mockResult} />);
    expect(screen.getByText('-33.429680')).toBeInTheDocument();
    expect(screen.getByText('149.567050')).toBeInTheDocument();
    // Both suburb and stateElectoralDistrict are 'BATHURST' in this mock,
    // so use getAllByText and assert at least two occurrences are rendered.
    expect(screen.getAllByText('BATHURST')).toHaveLength(2);
  });
});
