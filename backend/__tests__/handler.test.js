const nock = require('nock');
const { handler } = require('../handler');

const BASE = 'https://portal.spatial.nsw.gov.au';

// Reusable mock payloads that mirror the shape of the real NSW API responses.
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

// handler() is called directly with a synthetic Lambda event object, the same
// way the Lambda runtime would invoke it — no HTTP server needed in tests.
describe('handler', () => {
  afterEach(() => nock.cleanAll());

  it('returns 400 when address query parameter is missing', async () => {
    // Simulates a request with no query string at all (Lambda sets
    // queryStringParameters to null when no params are present).
    const response = await handler({ queryStringParameters: null });
    expect(response.statusCode).toBe(400);
  });

  it('returns 400 when address is an empty string', async () => {
    const response = await handler({ queryStringParameters: { address: '' } });
    expect(response.statusCode).toBe(400);
  });

  it('returns 400 when address is whitespace only', async () => {
    // .trim() reduces whitespace-only input to '' which is treated as missing.
    const response = await handler({ queryStringParameters: { address: '   ' } });
    expect(response.statusCode).toBe(400);
  });

  it('returns 404 when address is not found', async () => {
    // The geocoding API returns an empty feature collection for unknown
    // addresses — the handler should surface this as 404, not 500.
    nock(BASE).get(/NSW_Geocoded_Addressing_Theme/).reply(200, { type: 'FeatureCollection', features: [] });

    const response = await handler({ queryStringParameters: { address: 'UNKNOWN ADDRESS' } });
    expect(response.statusCode).toBe(404);
  });

  it('returns 500 when the geocoding API fails', async () => {
    // A network-level error (connection refused, timeout, etc.) should produce
    // a 500 rather than an unhandled rejection.
    nock(BASE).get(/NSW_Geocoded_Addressing_Theme/).replyWithError('connection refused');

    const response = await handler({ queryStringParameters: { address: '346 PANORAMA AVENUE BATHURST' } });
    expect(response.statusCode).toBe(500);
  });

  it('returns 500 when the admin boundaries API fails', async () => {
    // Geocoding succeeds but the subsequent admin boundaries call fails —
    // the handler's catch block should handle this the same way.
    nock(BASE).get(/NSW_Geocoded_Addressing_Theme/).reply(200, mockGeocodingReply);
    nock(BASE).get(/FeatureServer\/2/).replyWithError('connection refused');
    nock(BASE).get(/FeatureServer\/4/).replyWithError('connection refused');

    const response = await handler({ queryStringParameters: { address: '346 PANORAMA AVENUE BATHURST' } });
    expect(response.statusCode).toBe(500);
  });

  it('returns 200 with combined result for a valid address', async () => {
    // Happy path — all three external calls succeed and the handler assembles
    // the combined response correctly.
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
