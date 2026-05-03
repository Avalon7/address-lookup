const https = require('https');

// Uses the built-in https module instead of fetch so that nock can intercept
// requests in tests — nock hooks into http/https at the module level and does
// not intercept the Node global fetch.
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          // Treat any non-2xx response as an external API failure so callers
          // always get a rejection rather than an unexpected response body shape.
          if (res.statusCode < 200 || res.statusCode >= 300) {
            const err = new Error(`External API returned status ${res.statusCode}`);
            err.code = 'EXTERNAL_API_ERROR';
            reject(err);
          } else {
            resolve(json);
          }
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

module.exports = { httpsGet };
