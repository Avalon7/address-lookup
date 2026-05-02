const nock = require('nock');
const { httpsGet } = require('../httpClient');

// nock intercepts outbound https requests at the module level, so no real
// network traffic is made during these tests.
describe('httpsGet', () => {
  it('resolves with parsed JSON on success', async () => {
    nock('https://example.com')
      .get('/data')
      .reply(200, { result: 'ok' });

    const data = await httpsGet('https://example.com/data');
    expect(data).toEqual({ result: 'ok' });
  });
});
