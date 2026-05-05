import { geocodeAddress } from './geocoding';
import { getAdminBoundaries } from './adminBoundaries';
import { AppError } from './errors';

interface LambdaEvent {
  queryStringParameters?: Record<string, string> | null;
}

interface LambdaResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

const HEADERS = { 'Content-Type': 'application/json' };

function respond(statusCode: number, body: unknown): LambdaResponse {
  return { statusCode, headers: HEADERS, body: JSON.stringify(body) };
}

async function handler(event: LambdaEvent): Promise<LambdaResponse> {
  const raw = event.queryStringParameters?.address;
  const address = raw?.trim();

  if (raw === undefined || raw === null) {
    return respond(400, { error: 'Missing required query parameter: address.' });
  }
  if (!address) {
    return respond(400, { error: 'Address cannot be empty.' });
  }

  try {
    const location = await geocodeAddress(address);
    const { suburb, stateElectoralDistrict } = await getAdminBoundaries(location.latitude, location.longitude);
    return respond(200, { location, suburb, stateElectoralDistrict });
  } catch (err) {
    if (err instanceof AppError && err.code === 'GEOCODING_NOT_FOUND') {
      return respond(404, { error: 'Address not found. Please check the spelling and include the suburb (e.g. 346 PANORAMA AVENUE BATHURST).' });
    }
    if (err instanceof AppError && err.code === 'BOUNDARIES_NOT_FOUND') {
      return respond(404, { error: 'Address found but location falls outside NSW administrative boundaries.' });
    }
    if (err instanceof AppError && (err.code === 'NETWORK_ERROR' || err.code === 'EXTERNAL_API_ERROR')) {
      return respond(503, { error: 'NSW API temporarily unavailable' });
    }
    return respond(500, { error: 'An unexpected error occurred' });
  }
}

export { handler };
