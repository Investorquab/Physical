# PHYSICAL — Architecture Audit

Honest, code-grounded account of what exists, what's real, and what isn't.
Labels used throughout: **REAL** (actually happens, verifiable), **TESTNET**
(real blockchain activity, but on a test network with no economic value),
**MOCKED** (exists in code but not used in the live deployment),
**NOT BUILT** (deliberately out of scope for the hackathon).

## 1. Frontend — `apps/web`

- Next.js 16 (App Router, Turbopack), deployed on Vercel at
  `https://physical-depin.vercel.app`. **REAL**, live.
- Data fetching: `lib/api/*.ts` hooks using TanStack Query, calling the real
  API via `NEXT_PUBLIC_API_BASE_URL`. **REAL** in production.
- `app/api/mock/*` — a set of Next.js API routes returning fixture data,
  toggled by `NEXT_PUBLIC_USE_MOCK`. **MOCKED**, present in the codebase for
  local development before the backend existed, but `NEXT_PUBLIC_USE_MOCK=false`
  in the live Vercel deployment, so these routes are **not used** in
  production. The UI shows a visible "Mock data" badge whenever mock mode is
  actually active — it does not appear on the live deployment.
- No authentication/authorization on the frontend. **NOT BUILT** — the app
  is read-only/public by design for the hackathon; no user accounts exist.

## 2. Backend API — `apps/api`

- Express + TypeScript, deployed on a VPS, managed by pm2, reverse-proxied
  through Caddy with a real Let's Encrypt TLS certificate at
  `https://185-7-81-139.sslip.io/api/v1`. **REAL**, running continuously.
- Routes: `/events`, `/providers`, `/stations`, `/jobs`, `/settlements`,
  `/activity` — all read from PostgreSQL via Prisma, no hardcoded/fixture
  data. **REAL**.
- Security middleware: `helmet` (secure headers), `express-rate-limit`
  (120 req/min per IP), CORS locked to the exact Vercel origin. **REAL**.
- No authentication on the API — every route is public-read. **NOT BUILT**
  (acceptable for a read-only public dashboard; would be required before
  any write/admin endpoints existed).

## 3. Ingestion worker — `apps/worker-ingestion`

- Polls OpenAQ's real v3 API (`api.openaq.org`) every 5 minutes for one
  real station (`Zürich-Kaserne`, OpenAQ location id `9589`). **REAL**
  external API, **REAL** HTTP calls (see Phase 3 answers below).
- Normalizes each reading, deduplicates by sensor id + timestamp, stores it
  in Postgres, then submits it as a real transaction to
  `SourceEventRegistry.sol` on Ethereum Sepolia. **REAL** testnet
  transaction, running continuously on the VPS via pm2.

## 4. Oracle worker — `apps/worker-oracle`

- Polls the database for events awaiting verification. For each one: waits
  for Creditcoin to attest the relevant Sepolia block (`@gluwa/usc-sdk`),
  fetches the real Merkle + continuity proof from the official Proof
  Builder service, and submits it to `PhysicalASC.sol` on Creditcoin CC3
  Testnet, which verifies it via the native precompile at `0x0FD2`.
  **REAL** Attestcoin Protocol verification, **TESTNET**.
- After verification, evaluates active `Job` rules (`coordination.ts`)
  against the verified value; if a condition matches, submits a real
  transaction to `PhysicalSettlement.sol`. **REAL** testnet transaction,
  conditional — only fires when the rule genuinely matches.

## 5. Smart contracts — `packages/contracts`

| Contract | Network | Status |
|---|---|---|
| `SourceEventRegistry.sol` | Ethereum Sepolia | **TESTNET**, deployed, verified working via real transactions |
| `PhysicalASC.sol` | Creditcoin CC3 Testnet | **TESTNET**, deployed, verified working |
| `EvmV1Decoder` (library) | Creditcoin CC3 Testnet | **TESTNET**, deployed |
| `PhysicalSettlement.sol` | Creditcoin CC3 Testnet | **TESTNET**, deployed, verified working |

`USCBase.sol` and `VerifierInterface.sol` are verbatim (MIT-licensed) copies
of the official Attestcoin Protocol example contracts, not our own
invention — this is the correct, intended way to use the protocol, not a
shortcut.

## 6. Database — Neon PostgreSQL

- Real hosted Postgres (Neon free tier). Schema via Prisma 7: `Provider`,
  `Station`, `RawEvent`, `Event`, `SourceSubmission`, `Attestation`,
  `Verification`, `Job`, `JobRun`, `Settlement`, `AuditLog`. **REAL**, live
  data only — no seed/fixture rows except the one deliberately-configured
  demo `Job` rule.

## 7. Deployment

- Frontend: Vercel, auto-deploys from GitHub `main`. **REAL**.
- Backend + workers: VPS, pm2-managed, `systemd` service registered so it
  survives reboots (`pm2 startup` + `pm2 save`). **REAL**.
- Docker: **NOT BUILT**. Deliberate choice — the VPS already runs 8 other
  pm2-managed processes with limited RAM (4GB total); running three more
  lightweight Node processes directly via pm2 was judged lower-risk and
  lower-overhead than adding Docker on top, given hackathon time
  constraints. This is a documented tradeoff, not an oversight.
- CI/CD: **NOT BUILT** beyond Vercel's own git-push auto-deploy for the
  frontend. No automated pipeline for the backend/workers — deploys are
  manual (`git pull` + pm2 restart).

## 8. Testing

- **NOT BUILT.** No automated test suite exists. Verification of
  correctness throughout the build was done by running the real pipeline
  end-to-end against real testnets and inspecting real transaction results
  — which is a legitimate form of validation for a time-boxed hackathon,
  but should not be confused with an automated regression suite.

## 9. Known technical debt / limitations

- Single data source (OpenAQ), single station. Adding more is
  straightforward given the adapter interface in
  `apps/worker-ingestion/src/adapters/`, but not done.
- Single coordination rule (`Job`) exists, seeded manually via SQL — no UI
  to create new rules yet.
- No retry/backoff queue for failed Sepolia submissions — a failed
  ingestion attempt is logged and the event stays at `INGESTED` status,
  requiring a manual/future retry pass.
- `CORS_ORIGIN` and other VPS environment values are set directly in
  `ecosystem.config.js`, not a secrets manager — acceptable for a
  testnet-only hackathon project, would need hardening for production.
