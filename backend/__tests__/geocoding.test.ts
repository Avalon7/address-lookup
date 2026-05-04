import nock from 'nock';
import { geocodeAddress } from '../geocoding';

const BASE = 'https://portal.spatial.nsw.gov.au';

describe('geocodeAddress', () => {
  afterEach(() => nock.cleanAll());

  it('resolves with latitude and longitude for a valid address', async () => {
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
    nock(BASE)
      .get(/NSW_Geocoded_Addressing_Theme/)
      .reply(200, { type: 'FeatureCollection', features: [] });

    await expect(geocodeAddress('UNKNOWN ADDRESS')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});
