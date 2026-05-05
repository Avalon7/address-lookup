import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock the hook so App tests are isolated from fetch behaviour.
vi.mock('./hooks/useAddressLookup');
import { useAddressLookup } from './hooks/useAddressLookup';

describe('App', () => {
  it('renders the address form on load', () => {
    vi.mocked(useAddressLookup).mockReturnValue({ data: null, loading: false, error: null, lookup: vi.fn() });
    render(<App />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('shows loading state while fetching', () => {
    vi.mocked(useAddressLookup).mockReturnValue({ data: null, loading: true, error: null, lookup: vi.fn() });
    render(<App />);
    expect(screen.getByText(/looking up address/i)).toBeInTheDocument();
  });

  it('shows results when data is returned', () => {
    vi.mocked(useAddressLookup).mockReturnValue({
      data: { location: { latitude: -33.42968, longitude: 149.56705 }, suburb: 'BATHURST', stateElectoralDistrict: 'BATHURST' },
      loading: false,
      error: null,
      lookup: vi.fn(),
    });
    render(<App />);
    expect(screen.getByText('-33.429680')).toBeInTheDocument();
  });

  it('shows error message when lookup fails', () => {
    vi.mocked(useAddressLookup).mockReturnValue({ data: null, loading: false, error: 'Address not found', lookup: vi.fn() });
    render(<App />);
    expect(screen.getByText('Address not found')).toBeInTheDocument();
  });

  it('calls lookup when form is submitted', async () => {
    const lookup = vi.fn();
    vi.mocked(useAddressLookup).mockReturnValue({ data: null, loading: false, error: null, lookup });
    render(<App />);

    await userEvent.type(screen.getByRole('textbox'), '346 PANORAMA AVENUE BATHURST');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(lookup).toHaveBeenCalledWith('346 PANORAMA AVENUE BATHURST');
  });
});
