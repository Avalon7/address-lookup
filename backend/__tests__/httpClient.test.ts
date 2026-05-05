import nock from 'nock';
import { httpsGet } from '../httpClient';

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
    nock('https://example.com')
      .get('/data')
      .reply(503, { message: 'Service unavailable' });

    await expect(httpsGet('https://example.com/data')).rejects.toMatchObject({ code: 'EXTERNAL_API_ERROR' });
  });

  it('rejects with NETWORK_ERROR when the connection fails', async () => {
    nock('https://example.com')
      .get('/data')
      .replyWithError('connection refused');

    await expect(httpsGet('https://example.com/data')).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
  });
});
