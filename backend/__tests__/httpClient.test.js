const nock = require('nock');
const { httpsGet } = require('../httpClient');

// nock intercepts outbound https requests at the module level, so no real
// network traffic is made during these tests.
describe('httpsGet', () => {
  afterEach(() => nock.cleanAll());

  it('resolves with parsed JSON on success', async () => {
    nock('https://example.com')
      .get('/data')
      .reply(200, { result: 'ok' });

    const data = await httpsGet('https://example.com/data');
    expect(data).toEqual({ result: 'ok' });
  });

  it('rejects when the external API returns a non-2xx status code', async () => {
    // A 503 from the NSW API should be treated as an external API failure,
    // not silently resolved — otherwise downstream code gets an unexpected
    // body shape and may return a misleading 404 instead of 500.
    nock('https://example.com')
      .get('/data')
      .reply(503, { message: 'Service unavailable' });

    await expect(httpsGet('https://example.com/data')).rejects.toMatchObject({ code: 'EXTERNAL_API_ERROR' });
  });
});
