# PHYSICAL — System Map

```
REAL WORLD
  Zürich-Kaserne air-quality station (real government sensor)
        │
        ▼
OpenAQ v3 API  (api.openaq.org)  — third-party, not owned by PHYSICAL
        │  polled every 5 min
        ▼
apps/worker-ingestion  (Node/TS, running on VPS via pm2)
  - src/adapters/openaq.ts   → fetches + validates the reading
  - src/index.ts             → normalizes, dedupes, stores in Postgres
  - src/sepolia.ts           → submits SourceEventRegistry.recordEvent(...)
        │
        ▼
Ethereum Sepolia (testnet)
  SourceEventRegistry.sol  @ 0xFe7126B90CdC0945F55aB05bFF669B61B09414fb
  emits EventRecorded(eventId, payloadHash, value, observedAt)
        │
        ▼
apps/worker-oracle  (Node/TS, running on VPS via pm2)
  - src/proof.ts    → @gluwa/usc-sdk: waits for Creditcoin attestation,
                       fetches Merkle + continuity proof
  - src/index.ts    → submits proof to PhysicalASC.execute(...)
        │
        ▼
Creditcoin CC3 Testnet
  PhysicalASC.sol  @ 0x2aF3203cCeAE275a990a540c49D282e41199121c
  - calls native precompile 0x0FD2 (Attestcoin Protocol verifier)
  - decodes verified tx via EvmV1Decoder @ 0x104E6D889875c5bac04c6a17cfb66d74b4638e95
  - emits PhysicalEventVerified(...)
        │
        ▼
apps/worker-oracle/src/coordination.ts
  - evaluates active Job rules against the verified value
  - IF condition matches →
        ▼
Creditcoin CC3 Testnet
  PhysicalSettlement.sol  @ 0x5b4e110eB1A4Ddba72fbd24a2168CEAA000a3f6D
  recordSettlement(eventId, jobId, value) → real transaction
        │
        ▼
PostgreSQL (Neon)  — every status transition stored: INGESTED →
SUBMITTED_SOURCE_CHAIN → AWAITING_ATTESTATION → PROOF_READY → VERIFIED →
(SETTLED, if a rule matched, otherwise the JobRun records NOT_MATCHED)
        │
        ▼
apps/api  (Express, VPS, https://185-7-81-139.sslip.io/api/v1)
  serves all of the above as JSON, matching packages/shared-types exactly
        │
        ▼
apps/web  (Next.js, Vercel, https://physical-depin.vercel.app)
  renders Overview / Network / Providers / Events / Jobs / Verification /
  Settlements / Activity — every number sourced from the API above
```

## Component ownership

| Folder | Responsibility |
|---|---|
| `apps/web` | Frontend, all read-only rendering |
| `apps/api` | REST API, database reads |
| `apps/worker-ingestion` | OpenAQ → normalize → Sepolia |
| `apps/worker-oracle` | Attestcoin Protocol verification + coordination rules → Settlement |
| `packages/contracts` | All Solidity, Hardhat config, deploy scripts |
| `packages/db` | Prisma schema, migrations, configured client |
| `packages/shared-types` | The single API contract both frontend and backend trust |
