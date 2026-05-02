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
          resolve(JSON.parse(body));
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

module.exports = { httpsGet };
