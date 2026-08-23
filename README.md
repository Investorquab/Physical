# PHYSICAL

**Real world. Verified on-chain.**

PHYSICAL turns readings from existing infrastructure — sensors, providers,
networks already deployed in the world — into cryptographically verified
on-chain state, using the **Attestcoin Protocol**. Nothing fabricated.
Nothing simulated. Every number on this dashboard traces back to a real
transaction you can independently check on a block explorer.

- **Live app:** https://physical-depin.vercel.app
- **Live API:** https://185-7-81-139.sslip.io/api/v1
- **Sector:** DePIN / RWA verification infrastructure

---

## The problem

Physical infrastructure — sensor networks, node operators, connectivity
providers — makes claims about the real world that downstream systems
(rewards, insurance, settlement) currently have no way to independently
check. The options today are: trust the operator's own dashboard, or run
your own audit. Neither scales.

## What PHYSICAL does

PHYSICAL connects to **existing, real external infrastructure** — we do not
manufacture fake sensors or a synthetic DePIN network — and turns each
reading into a verifiable on-chain fact, then lets a coordination rule act
on that fact automatically once it's genuinely proven.

```
REAL EXTERNAL DATA (OpenAQ air-quality station)
        │
        ▼
INGESTION  (apps/worker-ingestion) — fetch, normalize, dedupe
        │
        ▼
SOURCE REPRESENTATION — submitted as a real transaction on Ethereum Sepolia
        │  (SourceEventRegistry.sol)
        ▼
ATTESTCOIN PROTOCOL VERIFICATION  (apps/worker-oracle)
        │  waits for attestation → fetches Merkle + continuity proof
        │  → PhysicalASC.sol verifies via the native precompile on Creditcoin
        ▼
VERIFIED STATE — stored, provenance-linked back to the original reading
        │
        ▼
COORDINATION RULE  — IF verified value meets a condition
        │
        ▼
SETTLEMENT — a real transaction on Creditcoin CC3 Testnet
             (PhysicalSettlement.sol)
```

Every step above is real, running continuously, deployed on a VPS — not a
one-off demo script.

## Why OpenAQ

We chose air-quality monitoring as the first real-world data source because
it's literal existing physical infrastructure (government/community sensor
stations, not a forecast model), free and reliable to access, and gives a
natural coordination-rule story: a verified environmental reading crossing
a threshold is exactly the kind of real-world event that should trigger an
automatic, provable downstream action (parametric response, incentive,
service-level action) instead of a manual claims process.

## Attestcoin Protocol integration — summary

We use the **native precompile verifier** (address `0x0FD2` on Creditcoin),
not the legacy STARK-proving generation of the protocol. Concretely:

- `packages/contracts/contracts/source/SourceEventRegistry.sol` — deployed
  on **Ethereum Sepolia**, our own contract, the "source representation"
  every real reading gets committed to.
- `packages/contracts/contracts/creditcoin/PhysicalASC.sol` — our
  Attestcoin Smart Contract, deployed on **Creditcoin CC3 Testnet**,
  inheriting the official `USCBase` pattern and decoding verified
  transaction data via `@gluwa/usc-contracts`' `EvmV1Decoder`.
- `apps/worker-oracle` — the off-chain Readability Worker. Uses
  `@gluwa/usc-sdk` to wait for Sepolia block attestation, fetch the Merkle +
  continuity proof from the official Proof Builder service, and submit it
  on-chain for verification.
- `packages/contracts/contracts/creditcoin/PhysicalSettlement.sol` —
  the downstream coordination/settlement contract, also on Creditcoin.

Full technical writeup: [`docs/USC_INTEGRATION.md`](docs/USC_INTEGRATION.md).

### Deployed contracts (testnet)

| Contract | Network | Address |
|---|---|---|
| `SourceEventRegistry` | Ethereum Sepolia | [`0xFe7126B90CdC0945F55aB05bFF669B61B09414fb`](https://sepolia.etherscan.io/address/0xFe7126B90CdC0945F55aB05bFF669B61B09414fb) |
| `EvmV1Decoder` (library) | Creditcoin CC3 Testnet | [`0x104E6D889875c5bac04c6a17cfb66d74b4638e95`](https://creditcoin-testnet.blockscout.com/address/0x104E6D889875c5bac04c6a17cfb66d74b4638e95) |
| `PhysicalASC` | Creditcoin CC3 Testnet | [`0x2aF3203cCeAE275a990a540c49D282e41199121c`](https://creditcoin-testnet.blockscout.com/address/0x2aF3203cCeAE275a990a540c49D282e41199121c) |
| `PhysicalSettlement` | Creditcoin CC3 Testnet | [`0x5b4e110eB1A4Ddba72fbd24a2168CEAA000a3f6D`](https://creditcoin-testnet.blockscout.com/address/0x5b4e110eB1A4Ddba72fbd24a2168CEAA000a3f6D) |

## Architecture / tech stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16 (App Router, Turbopack), TypeScript, Tailwind — deployed on Vercel |
| Backend API | Express, TypeScript — deployed on a VPS via pm2 |
| Ingestion & oracle workers | Node/TypeScript, `ethers` v6, `@gluwa/usc-sdk` — same VPS |
| Database | PostgreSQL (Neon), Prisma 7 ORM |
| Smart contracts | Solidity 0.8.23, Hardhat, `@gluwa/usc-contracts` |
| Data source | OpenAQ v3 API |

Repo layout:
```
apps/
  web/                Next.js frontend
  api/                REST API
  worker-ingestion/   OpenAQ → Sepolia
  worker-oracle/      Attestcoin Protocol verification + coordination rules
packages/
  contracts/          Solidity contracts + Hardhat
  db/                 Prisma schema
  shared-types/       Shared API contract (zod)
docs/
```

## Running it yourself

```bash
git clone https://github.com/Investorquab/Physical.git
cd Physical
npm install

# Fill in your own .env — see .env.example for every required key
# (RPC URLs, a funded Sepolia + Creditcoin testnet wallet, an OpenAQ API key,
#  and a Postgres connection string)

cd packages/db && npx prisma migrate dev && cd ../..
cd packages/contracts && npx hardhat compile && cd ../..

# Terminal 1
cd apps/api && npm run start
# Terminal 2
cd apps/worker-ingestion && npm run start
# Terminal 3
cd apps/worker-oracle && npm run start
# Terminal 4
cd apps/web && npm run dev
```

Full demo walkthrough: [`docs/DEMO_FLOW.md`](docs/DEMO_FLOW.md).

## Honesty by design

The product never fabricates a number. Empty states say so explicitly
("Waiting for connected infrastructure") instead of showing placeholder
data, and the frontend has a visible "Mock data" indicator that only
appears when genuinely running against mock endpoints (it does not appear
against the live deployment above, which is 100% real data).
