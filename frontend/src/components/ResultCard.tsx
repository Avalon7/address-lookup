import type { AddressResult } from '../types';

interface ResultCardProps {
  result: AddressResult | null;
}

// Renders nothing until a successful lookup response is available.
export function ResultCard({ result }: ResultCardProps) {
  if (!result) return null;

  const { location, suburb, stateElectoralDistrict } = result;

  return (
    <div>
      <h2>Results</h2>
      <p><strong>Latitude:</strong> {location.latitude}</p>
      <p><strong>Longitude:</strong> {location.longitude}</p>
      <p><strong>Suburb:</strong> {suburb}</p>
      <p><strong>State Electoral District:</strong> {stateElectoralDistrict}</p>
    </div>
  );
}
