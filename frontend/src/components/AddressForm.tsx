import { useState } from 'react';

interface AddressFormProps {
  onSubmit: (address: string) => void;
  disabled?: boolean;
}

// disabled prop is set to true while a lookup is in flight to prevent
// duplicate submissions.
export function AddressForm({ onSubmit, disabled }: AddressFormProps) {
  const [value, setValue] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Trim here so the hook always receives a clean string regardless of
    // what the user typed.
    onSubmit(value.trim());
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter NSW address"
        disabled={disabled}
      />
      <button type="submit" disabled={disabled}>Search</button>
    </form>
  );
}
