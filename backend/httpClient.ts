import https from 'https';
import { AppError } from './errors';

function httpsGet<T = unknown>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', (chunk: string) => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body) as T;
          if (res.statusCode !== undefined && (res.statusCode < 200 || res.statusCode >= 300)) {
            reject(new AppError(`External API returned status ${res.statusCode}`, 'EXTERNAL_API_ERROR'));
          } else {
            resolve(json);
          }
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', (err: Error) => reject(new AppError(err.message, 'NETWORK_ERROR')));
  });
}

export { httpsGet };
