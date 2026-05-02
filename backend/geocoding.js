const { httpsGet } = require('./httpClient');

const BASE_URL = 'https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Geocoded_Addressing_Theme/FeatureServer/1/query';

async function geocodeAddress(address) {
  // The NSW API only matches uppercase addresses — normalise before querying.
  const params = new URLSearchParams({
    where: `address = '${address.toUpperCase()}'`,
    outFields: '*',
    f: 'geojson'
  });

  const data = await httpsGet(`${BASE_URL}?${params}`);
  const features = data.features;

  if (!features || features.length === 0) {
    const err = new Error('Address not found');
    err.code = 'NOT_FOUND';
    throw err;
  }

  // GeoJSON coordinates are [longitude, latitude, elevation] — destructure accordingly.
  const [longitude, latitude] = features[0].geometry.coordinates;
  return { latitude, longitude };
}

module.exports = { geocodeAddress };
