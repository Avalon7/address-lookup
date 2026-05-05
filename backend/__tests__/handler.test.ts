import nock from 'nock';
import { handler } from '../handler';

const BASE = 'https://portal.spatial.nsw.gov.au';

const mockGeocodingReply = {
  type: 'FeatureCollection',
  features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [149.56705, -33.42968, 0] }, properties: {} }]
};
const mockSuburbReply = {
  type: 'FeatureCollection',
  features: [{ type: 'Feature', geometry: null, properties: { suburbname: 'BATHURST' } }]
};
const mockDistrictReply = {
  type: 'FeatureCollection',
  features: [{ type: 'Feature', geometry: null, properties: { districtname: 'BATHURST' } }]
};

describe('handler', () => {
  afterEach(() => nock.cleanAll());

  it('returns 400 with missing-parameter message when address param is absent', async () => {
    const response = await handler({ queryStringParameters: null });
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).error).toMatch(/Missing required query parameter/);
  });

  it('returns 400 with empty-address message when address is an empty string', async () => {
    const response = await handler({ queryStringParameters: { address: '' } });
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).error).toMatch(/cannot be empty/);
  });

  it('returns 400 with empty-address message when address is whitespace only', async () => {
    const response = await handler({ queryStringParameters: { address: '   ' } });
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).error).toMatch(/cannot be empty/);
  });

  it('returns 404 when address is not found in geocoding API', async () => {
    nock(BASE).get(/NSW_Geocoded_Addressing_Theme/).reply(200, { type: 'FeatureCollection', features: [] });

    const response = await handler({ queryStringParameters: { address: 'UNKNOWN ADDRESS' } });
    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body).error).toMatch(/Address not found/);
  });

  it('returns 404 when location is not found in admin boundaries API', async () => {
    const emptyCollection = { type: 'FeatureCollection', features: [] };
    nock(BASE).get(/NSW_Geocoded_Addressing_Theme/).reply(200, mockGeocodingReply);
    nock(BASE).get(/FeatureServer\/2/).reply(200, emptyCollection);
    nock(BASE).get(/FeatureServer\/4/).reply(200, emptyCollection);

    const response = await handler({ queryStringParameters: { address: '346 PANORAMA AVENUE BATHURST' } });
    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body).error).toMatch(/outside NSW administrative boundaries/);
  });

  it('returns 503 when the geocoding API is unreachable', async () => {
    nock(BASE).get(/NSW_Geocoded_Addressing_Theme/).replyWithError('connection refused');

    const response = await handler({ queryStringParameters: { address: '346 PANORAMA AVENUE BATHURST' } });
    expect(response.statusCode).toBe(503);
  });

  it('returns 503 when the admin boundaries API is unreachable', async () => {
    nock(BASE).get(/NSW_Geocoded_Addressing_Theme/).reply(200, mockGeocodingReply);
    nock(BASE).get(/FeatureServer\/2/).replyWithError('connection refused');
    nock(BASE).get(/FeatureServer\/4/).replyWithError('connection refused');

    const response = await handler({ queryStringParameters: { address: '346 PANORAMA AVENUE BATHURST' } });
    expect(response.statusCode).toBe(503);
  });

  it('returns 503 when the geocoding API returns a non-2xx status', async () => {
    nock(BASE).get(/NSW_Geocoded_Addressing_Theme/).reply(503, { message: 'Service unavailable' });

    const response = await handler({ queryStringParameters: { address: '346 PANORAMA AVENUE BATHURST' } });
    expect(response.statusCode).toBe(503);
  });

  it('returns 200 with combined result for a valid address', async () => {
    nock(BASE).get(/NSW_Geocoded_Addressing_Theme/).reply(200, mockGeocodingReply);
    nock(BASE).get(/FeatureServer\/2/).reply(200, mockSuburbReply);
    nock(BASE).get(/FeatureServer\/4/).reply(200, mockDistrictReply);

    const response = await handler({ queryStringParameters: { address: '346 PANORAMA AVENUE BATHURST' } });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      location: { latitude: -33.42968, longitude: 149.56705 },
      suburb: 'BATHURST',
      stateElectoralDistrict: 'BATHURST'
    });
  });
});
