import { useState } from 'react';

const MAX_LENGTH = 200;
const ALLOWED_CHARS = /^[A-Za-z0-9 ,'./\-]+$/;

function validateAddress(address: string): string | null {
  if (!address) return 'Please enter an address.';
  if (address.length > MAX_LENGTH) return `Address must be ${MAX_LENGTH} characters or fewer.`;
  if (!ALLOWED_CHARS.test(address)) return 'Address contains invalid characters. Use only letters, numbers, spaces, and common punctuation ( , . \' / - ).';
  return null;
}

interface AddressFormProps {
  onSubmit: (address: string) => void;
  disabled?: boolean;
}

export function AddressForm({ onSubmit, disabled }: AddressFormProps) {
  const [value, setValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    if (validationError) setValidationError(null);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = value.trim();
    const error = validateAddress(trimmed);
    if (error) {
      setValidationError(error);
      return;
    }
    onSubmit(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <label htmlFor="address-input" className="form__label">Street address</label>
      <div className="form__row">
        <input
          id="address-input"
          className={`input${validationError ? ' input--error' : ''}`}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="e.g. 346 PANORAMA AVENUE BATHURST"
          disabled={disabled}
          autoComplete="street-address"
          maxLength={MAX_LENGTH + 1}
          aria-describedby={validationError ? 'address-validation-error' : undefined}
          aria-invalid={validationError ? true : undefined}
        />
        <button className="button" type="submit" disabled={disabled}>
          {disabled ? 'Searching…' : 'Search'}
        </button>
      </div>
      {validationError && (
        <p id="address-validation-error" className="validation-error" role="alert">
          {validationError}
        </p>
      )}
    </form>
  );
}
