import { useState } from 'react';
import type { AddressResult } from '../types';

// VITE_API_URL is set per environment: localhost:3001 in development,
// the Lambda Function URL in production.
const API_URL = import.meta.env.VITE_API_URL as string;

interface UseAddressLookupReturn {
  data: AddressResult | null;
  loading: boolean;
  error: string | null;
  lookup: (address: string) => Promise<void>;
}

// Manages the three states of an address lookup: loading, result data, and error.
// Returns a lookup() function the caller invokes with an address string.
export function useAddressLookup(): UseAddressLookupReturn {
  const [data, setData] = useState<AddressResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function lookup(address: string): Promise<void> {
    setLoading(true);
    setData(null);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/lookup?address=${encodeURIComponent(address)}`);
      const json = await res.json();

      // Non-2xx responses still resolve (no network error), so check res.ok
      // and surface the error message from the Lambda response body.
      if (!res.ok) {
        setError((json as { error?: string }).error ?? 'Something went wrong');
      } else {
        setData(json as AddressResult);
      }
    } catch {
      // Network-level failure (server unreachable, no internet, etc.)
      setError('Unable to reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return { data, loading, error, lookup };
}
