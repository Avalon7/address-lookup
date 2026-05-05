import { httpsGet } from './httpClient';
import { AppError } from './errors';

const DEFAULT_GEOCODING_URL = 'https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Geocoded_Addressing_Theme/FeatureServer/1/query';

interface GeocodingResponse {
  features: Array<{
    geometry: { coordinates: [number, number, number] };
  }>;
}

async function geocodeAddress(address: string): Promise<{ latitude: number; longitude: number }> {
  const BASE_URL = process.env.NSW_GEOCODING_URL || DEFAULT_GEOCODING_URL;

  const params = new URLSearchParams({
    where: `address = '${address.toUpperCase()}'`,
    outFields: '*',
    f: 'geojson'
  });

  const data = await httpsGet<GeocodingResponse>(`${BASE_URL}?${params}`);

  if (!data.features || data.features.length === 0) {
    throw new AppError('Address not found in NSW Geocoded Addressing database', 'GEOCODING_NOT_FOUND');
  }

  const [longitude, latitude] = data.features[0].geometry.coordinates;
  return { latitude, longitude };
}

export { geocodeAddress };
