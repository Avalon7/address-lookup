# Address Lookup

A fullstack solution that resolves geographic and administrative information for a given NSW address using public Spatial Services REST APIs.

Fully deployed — frontend hosted on Netlify and backend running on AWS Lambda (ap-southeast-2).

| | URL | Hosting |
|---|---|---|
| **Frontend** | https://quiet-longma-0d0964.netlify.app/ | Netlify free tier |
| **Lambda Function URL** | https://ttgyiukhl2lbzmoiptxkr5ev3u0kmktf.lambda-url.ap-southeast-2.on.aws/ | AWS Lambda free tier |

---

## Project Structure

```
address-lookup/
├── backend/                        Node.js AWS Lambda
│   ├── __tests__/
│   │   ├── adminBoundaries.test.ts  Tests for admin boundary lookups
│   │   ├── geocoding.test.ts        Tests for address geocoding
│   │   ├── handler.test.ts          Tests for the Lambda handler (all error cases)
│   │   └── httpClient.test.ts       Tests for the HTTP client wrapper
│   ├── adminBoundaries.ts           Queries NSW Admin Boundaries API (suburb + district)
│   ├── errors.ts                    Shared AppError class
│   ├── geocoding.ts                 Queries NSW Geocoded Addressing API (lat/lng)
│   ├── handler.ts                   Lambda entry point — orchestrates geocoding → boundaries
│   ├── httpClient.ts                Wraps Node's https.get in a Promise
│   └── local-server.ts              Express wrapper for local development on port 3001
│
├── frontend/                        React + TypeScript (Vite)
│   └── src/
│       ├── components/
│       │   ├── AddressForm.tsx       Address input, client-side validation, and submit button
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

## Assumptions & Tradeoffs

- **No API key required** — both NSW Spatial Services APIs are public and unauthenticated.
- **Node built-in `https` module** over `fetch` — nock intercepts at the `https` module level, keeping the test setup clean with no extra dependency.
- **Two admin boundary queries run in parallel** — suburb (layer 2) and state electoral district (layer 4) are independent, so they use `Promise.all` to reduce latency.
- **Lambda Function URL over API Gateway** — simpler setup, no extra AWS configuration, sufficient for a single-endpoint function.
- **CDK over manual zip deploy** — `NodejsFunction` bundles the backend with esbuild automatically; CDK is the canonical deploy path.

---

## Backend Error Handling

Errors are modelled as typed `AppError` instances with a `code` field. The Lambda handler maps each code to an HTTP status:

| `AppError` code | HTTP status | Scenario |
|---|---|---|
| — | `400` | Missing or empty `address` query parameter |
| `GEOCODING_NOT_FOUND` | `404` | Address not found in NSW Geocoded Addressing database |
| `BOUNDARIES_NOT_FOUND` | `404` | Coordinates returned but location falls outside all NSW Admin Boundary polygons |
| `NETWORK_ERROR` | `503` | Network failure reaching a NSW Spatial Services API |
| `EXTERNAL_API_ERROR` | `503` | A NSW Spatial Services API returned a non-2xx response |
| _(unexpected)_ | `500` | Unhandled internal error |

The `404` responses carry distinct error messages so callers can tell whether the geocoding or the boundaries lookup failed.

External API base URLs are overridable via environment variables (`NSW_GEOCODING_URL`, `NSW_ADMIN_BOUNDARIES_URL`), which makes it straightforward to simulate failures in integration tests without code changes.

---

## Frontend Input Validation

Before a request is sent to the Lambda, `AddressForm` validates the input client-side:

| Rule | Limit | Error shown |
|---|---|---|
| Non-empty | — | "Please enter an address." |
| Max length | 200 characters | "Address must be 200 characters or fewer." |
| Allowed characters | `A–Z a–z 0–9` and ` , . ' / -` | "Address contains invalid characters…" |

If validation fails the API call is not made. The error renders with `role="alert"` so screen readers announce it, and the input receives `aria-invalid` / `aria-describedby` for accessibility. The error clears as soon as the user starts editing.

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
curl "https://ttgyiukhl2lbzmoiptxkr5ev3u0kmktf.lambda-url.ap-southeast-2.on.aws/lookup?address=346%20PANORAMA%20AVENUE%20BATHURST"
```

**Build and deploy the frontend** — set the Function URL in `frontend/.env.production`, then:

```bash
cd frontend && npm run build
```

Drag `frontend/dist/` to [Netlify Drop](https://app.netlify.com/drop).

**Live frontend:** https://quiet-longma-0d0964.netlify.app/

---

## Error Responses

| Status | Cause |
|--------|-------|
| `400` | Missing or empty `address` query parameter |
| `404` | Address not found in NSW Geocoded Addressing database |
| `404` | Coordinates found but location outside NSW Admin Boundary polygons |
| `503` | NSW Spatial Services API unreachable or returned a non-2xx response |
| `500` | Unexpected internal error |

---

## Testing with curl

Replace `http://localhost:3001` with the Lambda Function URL to test the deployed endpoint.

**Happy path — valid NSW address**
```bash
curl "http://localhost:3001/lookup?address=346%20PANORAMA%20AVENUE%20BATHURST"
```

**400 — missing address parameter**
```bash
curl "http://localhost:3001/lookup"
```

**400 — empty address**
```bash
curl "http://localhost:3001/lookup?address="
```

**404 — address not found**
```bash
curl "http://localhost:3001/lookup?address=123%20FAKE%20STREET%20FAKETOWN%20NSW"
```

**404 — address outside NSW administrative boundaries**
```bash
curl "http://localhost:3001/lookup?address=LORD%20HOWE%20ISLAND%20ROAD%20LORD%20HOWE%20ISLAND"
```

**503 — simulate geocoding API unavailable** (set env var before starting the server)
```bash
NSW_GEOCODING_URL=https://localhost:9999/query npm start
# then in another terminal:
curl "http://localhost:3001/lookup?address=346%20PANORAMA%20AVENUE%20BATHURST"
```
