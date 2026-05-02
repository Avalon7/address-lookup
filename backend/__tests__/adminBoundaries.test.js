const nock = require('nock');
const { getAdminBoundaries } = require('../adminBoundaries');

const BASE = 'https://portal.spatial.nsw.gov.au';

describe('getAdminBoundaries', () => {
  afterEach(() => nock.cleanAll());

  it('resolves with suburb and stateElectoralDistrict for given coordinates', async () => {
    // Two nock interceptors are needed because getAdminBoundaries calls
    // layer 2 (Suburb) and layer 4 (StateElectoralDistrict) in parallel.
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

  it('resolves with nulls when features are empty', async () => {
    // Coordinates may fall outside a boundary (e.g. remote area with no suburb
    // polygon). The function should return null gracefully rather than throwing.
    const emptyCollection = { type: 'FeatureCollection', features: [] };
    nock(BASE).get(/FeatureServer\/2/).reply(200, emptyCollection);
    nock(BASE).get(/FeatureServer\/4/).reply(200, emptyCollection);

    const result = await getAdminBoundaries(-33.42968, 149.56705);
    expect(result).toEqual({ suburb: null, stateElectoralDistrict: null });
  });
});
