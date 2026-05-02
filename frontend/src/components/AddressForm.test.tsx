import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { AddressForm } from './AddressForm';

describe('AddressForm', () => {
  it('renders an input and a submit button', () => {
    render(<AddressForm onSubmit={vi.fn()} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('calls onSubmit with the trimmed address when form is submitted', async () => {
    const onSubmit = vi.fn();
    render(<AddressForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByRole('textbox'), '  346 PANORAMA AVENUE BATHURST  ');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(onSubmit).toHaveBeenCalledWith('346 PANORAMA AVENUE BATHURST');
  });

  it('disables input and button while loading', () => {
    render(<AddressForm onSubmit={vi.fn()} disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: /search/i })).toBeDisabled();
  });
});
