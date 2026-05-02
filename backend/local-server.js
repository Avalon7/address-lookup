const express = require('express');
const { handler } = require('./handler');

const app = express();
const PORT = process.env.PORT || 3001;

// Wraps the Lambda handler in an Express route for local development.
// Shapes req.query into the Lambda event format so the handler is unchanged.
app.get('/lookup', async (req, res) => {
  const result = await handler({ queryStringParameters: req.query });
  res.status(result.statusCode).set(result.headers).send(result.body);
});

app.listen(PORT, () => {
  console.log(`Local server running at http://localhost:${PORT}`);
});
