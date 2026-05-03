# Address Lookup

A fullstack solution that resolves geographic and administrative information for a given NSW address using public Spatial Services REST APIs.

---

## Project Structure

```
address-lookup/
├── backend/                        Node.js AWS Lambda
│   ├── __tests__/
│   │   ├── adminBoundaries.test.js  Tests for admin boundary lookups
│   │   ├── geocoding.test.js        Tests for address geocoding
│   │   ├── handler.test.js          Tests for the Lambda handler (all error cases)
│   │   └── httpClient.test.js       Tests for the HTTP client wrapper
│   ├── adminBoundaries.js           Queries NSW Admin Boundaries API (suburb + district)
│   ├── geocoding.js                 Queries NSW Geocoded Addressing API (lat/lng)
│   ├── handler.js                   Lambda entry point — orchestrates geocoding → boundaries
│   ├── httpClient.js                Wraps Node's https.get in a Promise
│   └── local-server.js              Express wrapper for local development on port 3001
│
├── frontend/                        React + TypeScript (Vite)
│   └── src/
│       ├── components/
│       │   ├── AddressForm.tsx       Address input and submit button
│       │   ├── ErrorMessage.tsx      Displays error messages (role="alert")
│       │   └── ResultCard.tsx        Displays lat/lng, suburb, and district
│       ├── hooks/
│       │   └── useAddressLookup.ts   Manages fetch state (data, loading, error)
│       ├── App.tsx                   Root component
│       └── types.ts                  Shared TypeScript interfaces
│
└── infrastructure/                  AWS CDK (TypeScript)
    ├── lib/
    │   └── address-lookup-stack.ts  Defines Lambda + Function URL resources
    └── test/
        └── address-lookup-stack.test.ts  CDK construct tests
```

---

## Run the Frontend Locally

```bash
cd frontend && npm install && npm run dev
```

Create `frontend/.env.development`:

```
VITE_API_URL=http://localhost:3001
```

Start the backend in a separate terminal:

```bash
cd backend && npm install && npm start
```

Open `http://localhost:5173`.

---

## Deploy the Lambda

**Prerequisites:** AWS CLI configured, CDK CLI installed (`npm install -g aws-cdk`)

```bash
cd infrastructure && npm install
npx cdk bootstrap   # first time only
npx cdk deploy
```

CDK prints the Function URL on completion:

```
Outputs:
AddressLookupStack.FunctionUrl = https://<id>.lambda-url.ap-southeast-2.on.aws/
```

**Invoke the deployed Lambda:**

```bash
curl "https://<id>.lambda-url.ap-southeast-2.on.aws/lookup?address=346%20PANORAMA%20AVENUE%20BATHURST"
```

**Build and deploy the frontend** — set the Function URL in `frontend/.env.production`, then:

```bash
cd frontend && npm run build
```

Drag `frontend/dist/` to [Netlify Drop](https://app.netlify.com/drop).

---

## Error Responses

| Status | Cause |
|--------|-------|
| `400` | Missing or empty `address` query parameter |
| `404` | Address not found in NSW Geocoded Addressing dataset |
| `500` | External API failure |

---

## Assumptions & Tradeoffs

- **No API key required** — both NSW Spatial Services APIs are public and unauthenticated.
- **Node built-in `https` module** over `fetch` — nock intercepts at the `https` module level, keeping the test setup clean with no extra dependency.
- **Two admin boundary queries run in parallel** — suburb (layer 2) and state electoral district (layer 4) are independent, so they use `Promise.all` to reduce latency.
- **Lambda Function URL over API Gateway** — simpler setup, no extra AWS configuration, sufficient for a single-endpoint function.
- **CDK over manual zip deploy** — `NodejsFunction` bundles the backend with esbuild automatically; CDK is the canonical deploy path.
