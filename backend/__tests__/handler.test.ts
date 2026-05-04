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

  it('returns 400 when address query parameter is missing', async () => {
    const response = await handler({ queryStringParameters: null });
    expect(response.statusCode).toBe(400);
  });

  it('returns 400 when address is an empty string', async () => {
    const response = await handler({ queryStringParameters: { address: '' } });
    expect(response.statusCode).toBe(400);
  });

  it('returns 400 when address is whitespace only', async () => {
    const response = await handler({ queryStringParameters: { address: '   ' } });
    expect(response.statusCode).toBe(400);
  });

  it('returns 404 when address is not found', async () => {
    nock(BASE).get(/NSW_Geocoded_Addressing_Theme/).reply(200, { type: 'FeatureCollection', features: [] });

    const response = await handler({ queryStringParameters: { address: 'UNKNOWN ADDRESS' } });
    expect(response.statusCode).toBe(404);
  });

  it('returns 500 when the geocoding API fails', async () => {
    nock(BASE).get(/NSW_Geocoded_Addressing_Theme/).replyWithError('connection refused');

    const response = await handler({ queryStringParameters: { address: '346 PANORAMA AVENUE BATHURST' } });
    expect(response.statusCode).toBe(500);
  });

  it('returns 500 when the admin boundaries API fails', async () => {
    nock(BASE).get(/NSW_Geocoded_Addressing_Theme/).reply(200, mockGeocodingReply);
    nock(BASE).get(/FeatureServer\/2/).replyWithError('connection refused');
    nock(BASE).get(/FeatureServer\/4/).replyWithError('connection refused');

    const response = await handler({ queryStringParameters: { address: '346 PANORAMA AVENUE BATHURST' } });
    expect(response.statusCode).toBe(500);
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
