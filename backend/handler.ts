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
  const address = event.queryStringParameters?.address?.trim();

  if (!address) {
    return respond(400, { error: 'Missing required query parameter: address' });
  }

  try {
    const location = await geocodeAddress(address);
    const { suburb, stateElectoralDistrict } = await getAdminBoundaries(location.latitude, location.longitude);
    return respond(200, { location, suburb, stateElectoralDistrict });
  } catch (err) {
    if (err instanceof AppError && err.code === 'NOT_FOUND') {
      return respond(404, { error: 'Address not found' });
    }
    return respond(500, { error: 'An unexpected error occurred' });
  }
}

export { handler };
