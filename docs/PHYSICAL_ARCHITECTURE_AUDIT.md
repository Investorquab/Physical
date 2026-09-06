# PHYSICAL — Architecture & Current State Audit

Honest, code-grounded account of what exists, what runs live, and what
does not — written for judges and reviewers, not marketing copy. Labels:
**REAL** (verified in code and/or running in production), **PARTIAL**
(exists but incomplete), **PLANNED / NOT IMPLEMENTED** (does not exist).

---

## 1. Project summary

**What it is:** PHYSICAL ingests a real, external, already-deployed
sensor reading (air quality), commits it as a transaction on a source
blockchain, has that transaction independently verified via the
Attestcoin Protocol on Creditcoin, and — if a configured coordination
rule matches the verified value — triggers a second real transaction
recording a settlement.

**Problem it addresses:** infrastructure operators (sensor networks, node
operators, connectivity providers) make claims about real-world state that
currently can't be independently checked by a third party without trusting
the operator's own reporting.

**Real-world use case implemented:** air-quality (PM2.5) monitoring
across four real stations, with a threshold-crossing rule as the
coordination example.

**Why DePIN:** the project connects to existing physical infrastructure
(real sensor stations) rather than building synthetic hardware/nodes —
an explicit, deliberate design constraint from the start, not an
afterthought.

## 2. Architecture (verified flow)

```
OpenAQ v3 API (real, external, third-party)
  → apps/worker-ingestion (Node/TS)
      fetch → normalize → dedupe → store in Postgres
      → submit tx to SourceEventRegistry.sol (Ethereum Sepolia)       [REAL]
  → apps/worker-oracle (Node/TS)
      wait for Creditcoin attestation of the Sepolia block
      fetch Merkle + continuity proof (official Proof Builder API)
      submit proof to PhysicalASC.sol (Creditcoin CC3 Testnet)
      → native precompile 0x0FD2 verifies inclusion                   [REAL]
      → PhysicalEventVerified event emitted, verified state stored on-chain
      evaluate active Job rows against the verified value
      → if matched: submit tx to PhysicalSettlement.sol               [REAL]
  → apps/api (Express) serves all of the above from Postgres          [REAL]
  → apps/web (Next.js) renders it                                     [REAL]
```

## 3. Data source (OpenAQ)

- Endpoints: `GET /v3/locations/{id}` (metadata) and
  `GET /v3/locations/{id}/latest` (readings), `api.openaq.org`.
- Auth: `X-API-Key` header, key stored only in `.env`, never committed.
- Currently polls four real stations: Zürich-Kaserne (`9589`), a London
  station (`148`), a New York station (`625`), a Tokyo station
  (`1214508`) — confirmed live with genuinely differing real PM2.5 values
  (observed roughly 1.4–16.5 µg/m³ across the four during development).
- Poll interval: every 5 minutes.
- Nothing in the production data path is mocked or hardcoded.
  `apps/web/app/api/mock/*` routes exist in the frontend codebase but are
  inactive on the live deployment (`NEXT_PUBLIC_USE_MOCK=false`).

## 4. Attestcoin Protocol integration

- SDK: `@gluwa/usc-sdk` (the package name retains "usc" branding; the
  product is now called Attestcoin Protocol — a naming lag confirmed in
  the protocol's own official documentation, not an error on our part).
- Contracts: `PhysicalASC.sol` inherits `USCBase.sol` and
  `VerifierInterface.sol` — both verbatim, MIT-licensed copies from the
  protocol's own official example repository, not our reimplementation
  of its core verification logic.
- What is proved: that a specific transaction (our normalized reading)
  was included in a specific, attested Ethereum Sepolia block, via
  Merkle inclusion + continuity proof, checked against the native
  precompile at `0x0FD2` on Creditcoin. A second precompile,
  `0x0FD3` (ChainInfo), is used to query attestation status
  (`chainInfo.PrecompileChainInfoProvider` in `apps/worker-oracle`).
- On-chain result: `PhysicalASC.execute(...)` calls the precompile,
  decodes the verified transaction's log data, and stores a
  `VerifiedEvent` struct, emitting `PhysicalEventVerified`.
- These are real testnet operations — real transactions, independently
  checkable on Blockscout.
- **Explicit limitation:** verification proves the *transaction*
  happened, not that the underlying *sensor reading* is truthful — that
  trust boundary still runs through OpenAQ and its station operators.

## 5. Creditcoin integration

| Contract | Address | Network |
|---|---|---|
| `PhysicalASC` | `0x2aF3203cCeAE275a990a540c49D282e41199121c` | Creditcoin CC3 Testnet |
| `EvmV1Decoder` (library) | `0x104E6D889875c5bac04c6a17cfb66d74b4638e95` | Creditcoin CC3 Testnet |
| `PhysicalSettlement` | `0x5b4e110eB1A4Ddba72fbd24a2168CEAA000a3f6D` | Creditcoin CC3 Testnet |

- Business logic: one coordination rule (`"PM2.5 threshold watch —
  Zürich Kaserne"`, `IF pm25 > 5.0 THEN record_settlement`), seeded
  manually via SQL, no UI to create new ones yet.
- State change: a `VerifiedEvent` struct stored on `PhysicalASC`; if the
  rule matches, a `SettlementRecord` struct stored on
  `PhysicalSettlement`. Both real, permanent on-chain state.

## 6. Backend / API

- Express 4 + TypeScript, run via `tsx`, no build step.
- Routes: `GET /healthz`, `/api/v1/events`, `/providers`, `/stations`,
  `/jobs`, `/settlements`, `/activity` — all read-only.
- Security: CORS locked to the exact production frontend origin (not a
  wildcard — confirmed by live testing with a forged `Origin` header),
  `helmet` security headers, `express-rate-limit` (120 req/min/IP).
- Authentication/authorization: **PLANNED / NOT IMPLEMENTED** — every
  route is public read-only, no user accounts exist.
- Logging: `console.log`/`console.error`, captured by pm2 log files.
  **PARTIAL** — no structured logging or aggregation.
- Caching layer: **PLANNED / NOT IMPLEMENTED.**

## 7. Frontend

Pages: landing page, and under `/app`: Overview, Network, Providers,
Events, Jobs, Verification, Settlements, Activity, Settings.

- Every page except Settings renders real, live data with real loading/
  empty/error states.
- Settings honestly shows "not wired up yet" — there is no account
  system for it to control. The account icon (top right) is likewise
  **PLANNED / NOT IMPLEMENTED**, consistent with the no-auth backend.

## 8. Deployment

- Frontend: Vercel, auto-deploy from `main`. Live at
  `physical-depin.vercel.app`.
- Backend + both workers: a VPS, pm2-managed, registered as a `systemd`
  service (reboot-safe), reverse-proxied through Caddy with a real
  Let's Encrypt TLS certificate. Live at
  `185-7-81-139.sslip.io/api/v1`.
- Database: Neon (hosted Postgres), free tier.
- No Docker, no CI/CD for the backend — a deliberate scope decision
  given the VPS already runs several unrelated processes on a
  resource-constrained 4GB/2vCPU box.

## 9. Testing

**PLANNED / NOT IMPLEMENTED.** No automated test suite exists yet.
Correctness was validated by running the real pipeline end-to-end against
live testnets and inspecting real transaction results on public block
explorers throughout the build — a legitimate validation method for a
time-boxed hackathon, explicitly not a substitute for automated tests.

## 10. Security

- Replay protection: **REAL**, at two independent layers —
  `SourceEventRegistry` rejects a duplicate event id;
  `USCBase.execute()` (inherited by `PhysicalASC`) independently rejects
  re-processing an already-verified query. Both observed firing
  correctly during development.
- Both on-chain write functions (`SourceEventRegistry`,
  `PhysicalSettlement`) restrict calls to a single hardcoded
  submitter/operator address.
- All private keys live only in `.env`, excluded from git, never logged.

## 11. Real vs. mocked

| Component | Status |
|---|---|
| OpenAQ data (4 real stations) | REAL |
| Sepolia source transactions | REAL |
| Attestcoin Protocol verification | REAL (testnet) |
| Coordination rule evaluation | REAL |
| Settlement transactions | REAL (testnet), conditional on the rule matching |
| Database | REAL, live, no fixture data except the one seeded demo rule |
| `/app` pages except Settings | REAL |
| Settings / account icon | PLANNED / NOT IMPLEMENTED |
| `apps/web/app/api/mock/*` | Exists in code, inactive in production |
| Automated tests | PLANNED / NOT IMPLEMENTED |
| CI/CD for backend | PLANNED / NOT IMPLEMENTED (deliberate scope decision) |

## 12. Known limitations

- Single coordination rule, no UI to create new ones.
- No retry queue for a failed Sepolia submission.
- No authentication anywhere in the system.
- No automated tests.
- Single VPS, single points of failure for both workers and the API.

---

## What currently exists — one paragraph

PHYSICAL is a working, currently-deployed system that polls four real
OpenAQ air-quality sensor stations every five minutes, submits each new
reading as a real transaction on Ethereum Sepolia, waits for Creditcoin to
attest that transaction and verifies it on-chain via the Attestcoin
Protocol's native precompile (using contracts adapted directly from the
protocol's own official example repository), evaluates one manually
configured coordination rule against each verified reading, and — when
that rule's threshold is crossed — submits a second real transaction
recording a settlement, all independently checkable on public block
explorers. The frontend (Vercel) and backend (a VPS managed by pm2) are
both live and have been running continuously throughout the build. There
is no user authentication and no automated test suite — both by explicit
scope decision, not incomplete attempts.
