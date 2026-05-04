import express from 'express';
import { handler } from './handler';

const app = express();
const PORT = process.env.PORT || 3001;

app.use((_req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/lookup', async (req, res) => {
  const result = await handler({ queryStringParameters: req.query as Record<string, string> });
  res.status(result.statusCode).set(result.headers).send(result.body);
});

app.listen(PORT, () => {
  console.log(`Local server running at http://localhost:${PORT}`);
});
