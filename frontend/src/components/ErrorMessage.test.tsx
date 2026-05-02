import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders nothing when error is null', () => {
    const { container } = render(<ErrorMessage error={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('displays the error message when error is set', () => {
    render(<ErrorMessage error="Address not found" />);
    expect(screen.getByText('Address not found')).toBeInTheDocument();
  });
});
