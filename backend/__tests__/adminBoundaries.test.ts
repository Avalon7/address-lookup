import nock from 'nock';
import { getAdminBoundaries } from '../adminBoundaries';

const BASE = 'https://portal.spatial.nsw.gov.au';

describe('getAdminBoundaries', () => {
  afterEach(() => nock.cleanAll());

  it('resolves with suburb and stateElectoralDistrict for given coordinates', async () => {
    nock(BASE)
      .get(/FeatureServer\/2/)
      .reply(200, {
        type: 'FeatureCollection',
        features: [{ type: 'Feature', geometry: null, properties: { suburbname: 'BATHURST' } }]
      });

    nock(BASE)
      .get(/FeatureServer\/4/)
      .reply(200, {
        type: 'FeatureCollection',
        features: [{ type: 'Feature', geometry: null, properties: { districtname: 'BATHURST' } }]
      });

    const result = await getAdminBoundaries(-33.42968, 149.56705);
    expect(result).toEqual({ suburb: 'BATHURST', stateElectoralDistrict: 'BATHURST' });
  });

  it('uses NSW_ADMIN_BOUNDARIES_URL env var when set', async () => {
    process.env.NSW_ADMIN_BOUNDARIES_URL = 'https://mock-admin.example.com/FeatureServer';

    nock('https://mock-admin.example.com')
      .get(/FeatureServer\/2/).query(true)
      .reply(200, { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: null, properties: { suburbname: 'BATHURST' } }] });

    nock('https://mock-admin.example.com')
      .get(/FeatureServer\/4/).query(true)
      .reply(200, { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: null, properties: { districtname: 'BATHURST' } }] });

    const result = await getAdminBoundaries(-33.42968, 149.56705);
    expect(result).toEqual({ suburb: 'BATHURST', stateElectoralDistrict: 'BATHURST' });

    delete process.env.NSW_ADMIN_BOUNDARIES_URL;
  });

  it('resolves with nulls when features are empty', async () => {
    const emptyCollection = { type: 'FeatureCollection', features: [] };
    nock(BASE).get(/FeatureServer\/2/).reply(200, emptyCollection);
    nock(BASE).get(/FeatureServer\/4/).reply(200, emptyCollection);

    const result = await getAdminBoundaries(-33.42968, 149.56705);
    expect(result).toEqual({ suburb: null, stateElectoralDistrict: null });
  });
});
