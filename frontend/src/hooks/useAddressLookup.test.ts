import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAddressLookup } from './useAddressLookup';
import type { AddressResult } from '../types';

describe('useAddressLookup', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('has correct initial state', () => {
    const { result } = renderHook(() => useAddressLookup());
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('returns data on successful lookup', async () => {
    const mockResult: AddressResult = {
      location: { latitude: -33.42968, longitude: 149.56705 },
      suburb: 'BATHURST',
      stateElectoralDistrict: 'BATHURST',
    };
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockResult,
    } as Response);

    const { result } = renderHook(() => useAddressLookup());
    await act(async () => {
      await result.current.lookup('346 PANORAMA AVENUE BATHURST');
    });

    expect(result.current.data).toEqual(mockResult);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets error when the API returns a non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Address not found' }),
    } as Response);

    const { result } = renderHook(() => useAddressLookup());
    await act(async () => {
      await result.current.lookup('UNKNOWN ADDRESS');
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Address not found');
  });
});
