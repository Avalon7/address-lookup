const nock = require('nock');
const { geocodeAddress } = require('../geocoding');

const BASE = 'https://portal.spatial.nsw.gov.au';

// Uses a regex path matcher so the test doesn't need to replicate the full
// query string — only the service name is asserted.
describe('geocodeAddress', () => {
  afterEach(() => nock.cleanAll());

  it('resolves with latitude and longitude for a valid address', async () => {
    // GeoJSON coordinates are [longitude, latitude, elevation] — the mock
    // reflects this order to match what the real API returns.
    nock(BASE)
      .get(/NSW_Geocoded_Addressing_Theme/)
      .reply(200, {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [149.56705, -33.42968, 0] },
          properties: {}
        }]
      });

    const result = await geocodeAddress('346 PANORAMA AVENUE BATHURST');
    expect(result).toEqual({ latitude: -33.42968, longitude: 149.56705 });
  });

  it('uppercases the address before querying the NSW API', async () => {
    // The NSW Geocoded Addressing API is case-sensitive and only matches
    // uppercase addresses, so lowercase input must be normalised.
    nock(BASE)
      .get((path) => path.includes('346+PANORAMA+AVENUE+BATHURST') || path.includes('346%20PANORAMA%20AVENUE%20BATHURST'))
      .reply(200, {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [149.56705, -33.42968, 0] },
          properties: {}
        }]
      });

    const result = await geocodeAddress('346 panorama avenue bathurst');
    expect(result).toEqual({ latitude: -33.42968, longitude: 149.56705 });
  });

  it('uses NSW_GEOCODING_URL env var when set', async () => {
    // The env var is read inside the function (not at module load time) so
    // setting it here is sufficient — no module reloading needed.
    process.env.NSW_GEOCODING_URL = 'https://mock-geocoding.example.com/query';

    nock('https://mock-geocoding.example.com')
      .get('/query')
      .query(true)
      .reply(200, {
        type: 'FeatureCollection',
        features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [149.56705, -33.42968, 0] }, properties: {} }]
      });

    const result = await geocodeAddress('346 PANORAMA AVENUE BATHURST');
    expect(result).toEqual({ latitude: -33.42968, longitude: 149.56705 });

    delete process.env.NSW_GEOCODING_URL;
  });

  it('rejects with NOT_FOUND when address has no results', async () => {
    // An empty features array means the NSW API found no match for the address.
    // geocodeAddress should surface this as a typed error so the handler can
    // return 404 rather than 500.
    nock(BASE)
      .get(/NSW_Geocoded_Addressing_Theme/)
      .reply(200, { type: 'FeatureCollection', features: [] });

    await expect(geocodeAddress('UNKNOWN ADDRESS')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});
