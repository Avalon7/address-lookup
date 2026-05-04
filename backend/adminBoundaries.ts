import { httpsGet } from './httpClient';

const DEFAULT_ADMIN_BOUNDARIES_URL = 'https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Administrative_Boundaries_Theme/FeatureServer';

interface BoundaryResponse {
  features: Array<{
    properties: { suburbname?: string; districtname?: string };
  }>;
}

function buildQuery(layer: number, lat: number, lng: number): string {
  const BASE_URL = process.env.NSW_ADMIN_BOUNDARIES_URL || DEFAULT_ADMIN_BOUNDARIES_URL;
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

async function getAdminBoundaries(lat: number, lng: number): Promise<{ suburb: string | null; stateElectoralDistrict: string | null }> {
  const [suburbData, districtData] = await Promise.all([
    httpsGet<BoundaryResponse>(buildQuery(2, lat, lng)),
    httpsGet<BoundaryResponse>(buildQuery(4, lat, lng))
  ]);

  const suburb = suburbData.features?.[0]?.properties?.suburbname ?? null;
  const stateElectoralDistrict = districtData.features?.[0]?.properties?.districtname ?? null;

  return { suburb, stateElectoralDistrict };
}

export { getAdminBoundaries };
