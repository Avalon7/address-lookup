const { geocodeAddress } = require('./geocoding');
const { getAdminBoundaries } = require('./adminBoundaries');

// Wildcard CORS header required so the React frontend can call this Lambda
// Function URL directly from the browser.
const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*'
};

// Builds the Lambda response envelope expected by both the Lambda runtime
// and the local Express server wrapper.
function respond(statusCode, body) {
  return { statusCode, headers: HEADERS, body: JSON.stringify(body) };
}

// Lambda entry point. event.queryStringParameters comes from the Lambda
// Function URL; the local-server.js wrapper maps Express req.query to the
// same shape so this function works unchanged in both environments.
async function handler(event) {
  const address = event.queryStringParameters?.address?.trim();

  // Proactively reject empty or missing address before making any external API calls.
  if (!address) {
    return respond(400, { error: 'Missing required query parameter: address' });
  }

  try {
    // Step 1: resolve address to coordinates via the NSW Geocoding API.
    const location = await geocodeAddress(address);

    // Step 2: use coordinates to look up suburb and electoral district.
    // getAdminBoundaries calls two API layers in parallel internally.
    const { suburb, stateElectoralDistrict } = await getAdminBoundaries(location.latitude, location.longitude);

    return respond(200, { location, suburb, stateElectoralDistrict });
  } catch (err) {
    // geocodeAddress throws with code NOT_FOUND when the NSW API returns no
    // features — treat that as a client error (bad address), not a server fault.
    if (err.code === 'NOT_FOUND') {
      return respond(404, { error: 'Address not found' });
    }
    return respond(500, { error: 'An unexpected error occurred' });
  }
}

module.exports = { handler };
