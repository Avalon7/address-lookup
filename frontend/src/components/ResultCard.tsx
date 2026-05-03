import type { AddressResult } from '../types';

interface ResultCardProps {
  result: AddressResult | null;
}

export function ResultCard({ result }: ResultCardProps) {
  if (!result) return null;

  const { location, suburb, stateElectoralDistrict } = result;

  return (
    <div className="result-card">
      <div className="result-card__title">Address details</div>
      <div className="result-row">
        <span className="result-label">Latitude</span>
        <span className="result-value result-value--mono">{location.latitude.toFixed(6)}</span>
      </div>
      <div className="result-row">
        <span className="result-label">Longitude</span>
        <span className="result-value result-value--mono">{location.longitude.toFixed(6)}</span>
      </div>
      <div className="result-row">
        <span className="result-label">Suburb</span>
        <span className="result-value">{suburb ?? '—'}</span>
      </div>
      <div className="result-row">
        <span className="result-label">State Electoral District</span>
        <span className="result-value">{stateElectoralDistrict ?? '—'}</span>
      </div>
    </div>
  );
}
