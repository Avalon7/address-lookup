const { httpsGet } = require('./httpClient');

const BASE_URL = 'https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Administrative_Boundaries_Theme/FeatureServer';

function buildQuery(layer, lat, lng) {
  const params = new URLSearchParams({
    geometry: `${lng}, ${lat}`,
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: '*',
    returnGeometry: 'false',
    f: 'geoJSON'
  });
  return `${BASE_URL}/${layer}/query?${params}`;
}

async function getAdminBoundaries(lat, lng) {
  // Layer 2 = Suburb, layer 4 = StateElectoralDistrict. Both are independent
  // of each other so they run in parallel to minimise latency.
  const [suburbData, districtData] = await Promise.all([
    httpsGet(buildQuery(2, lat, lng)),
    httpsGet(buildQuery(4, lat, lng))
  ]);

  const suburb = suburbData.features?.[0]?.properties?.suburbname ?? null;
  const stateElectoralDistrict = districtData.features?.[0]?.properties?.districtname ?? null;

  return { suburb, stateElectoralDistrict };
}

module.exports = { getAdminBoundaries };
