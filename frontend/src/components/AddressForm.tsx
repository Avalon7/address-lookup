import { useState } from 'react';

interface AddressFormProps {
  onSubmit: (address: string) => void;
  disabled?: boolean;
}

export function AddressForm({ onSubmit, disabled }: AddressFormProps) {
  const [value, setValue] = useState('');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit(value.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <label htmlFor="address-input" className="form__label">Street address</label>
      <div className="form__row">
        <input
          id="address-input"
          className="input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. 346 PANORAMA AVENUE BATHURST"
          disabled={disabled}
          autoComplete="street-address"
        />
        <button className="button" type="submit" disabled={disabled}>
          {disabled ? 'Searching…' : 'Search'}
        </button>
      </div>
    </form>
  );
}
