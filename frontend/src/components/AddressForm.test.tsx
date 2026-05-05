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

  it('shows a validation error and does not submit when address is empty', async () => {
    const onSubmit = vi.fn();
    render(<AddressForm onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/please enter an address/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows a validation error and does not submit when address is whitespace only', async () => {
    const onSubmit = vi.fn();
    render(<AddressForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByRole('textbox'), '   ');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/please enter an address/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows a validation error and does not submit when address exceeds 200 characters', async () => {
    const onSubmit = vi.fn();
    render(<AddressForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByRole('textbox'), 'A'.repeat(201));
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/200 characters/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows a validation error and does not submit when address contains invalid characters', async () => {
    const onSubmit = vi.fn();
    render(<AddressForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByRole('textbox'), '<script>alert(1)</script>');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/invalid characters/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('clears the validation error when the user starts typing', async () => {
    const onSubmit = vi.fn();
    render(<AddressForm onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: /search/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await userEvent.type(screen.getByRole('textbox'), '3');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
