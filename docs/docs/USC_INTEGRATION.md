# USC / Attestcoin Protocol Integration

This document explains exactly how PHYSICAL integrates with the Attestcoin
Protocol (formerly "USC"), including the technical corrections we made to
our own original assumptions along the way — in the interest of being
defensible under judge questioning, not just impressive-sounding.

## The core correction

Our original design assumed the Attestcoin Protocol could directly verify
arbitrary external API data (an air-quality reading, for instance). That's
not how the protocol works. It verifies one specific thing:

> "Did transaction X really happen on source chain Y?" — proven with a
> Merkle inclusion proof plus a continuity proof, checked synchronously on
> Creditcoin via the **native precompile verifier** at address `0x0FD2`.

It's a cross-chain **transaction** verification oracle, not a general
real-world-data oracle. So the real architecture needs an explicit "source
representation" step: our own backend commits each normalized reading as a
transaction on a supported source chain (Ethereum Sepolia), and *that*
transaction is what actually gets verified.

## The four required components

Per the official protocol architecture, we implemented all four:

1. **Source Chain Smart Contract** — [`SourceEventRegistry.sol`](../packages/contracts/contracts/source/SourceEventRegistry.sol),
   deployed on Sepolia. Emits an `EventRecorded` event carrying the
   normalized reading and a hash of the raw payload for provenance.
2. **Attestcoin Smart Contract (ASC)** — [`PhysicalASC.sol`](../packages/contracts/contracts/creditcoin/PhysicalASC.sol),
   deployed on Creditcoin CC3 Testnet. Inherits `USCBase.sol` (copied
   verbatim, MIT-licensed, from the official
   [`gluwa/usc-testnet-bridge-examples`](https://github.com/gluwa/usc-testnet-bridge-examples)
   repo) and decodes the verified Sepolia transaction using
   `@gluwa/usc-contracts`' `EvmV1Decoder` library.
3. **Business Logic Contract** — [`PhysicalSettlement.sol`](../packages/contracts/contracts/creditcoin/PhysicalSettlement.sol),
   deployed on Creditcoin CC3 Testnet. Records the real settlement action
   once a coordination rule evaluates true against a verified event.
4. **Readability / Oracle Worker** — [`apps/worker-oracle`](../apps/worker-oracle),
   an off-chain Node/TypeScript service using `@gluwa/usc-sdk`. Watches for
   submitted-but-unverified events, waits for Creditcoin to attest the
   relevant Sepolia block, fetches the Merkle + continuity proof from the
   official Proof Builder service, and submits it to `PhysicalASC` for
   on-chain verification.

## Verification flow, step by step

1. `apps/worker-ingestion` fetches a real reading from OpenAQ, normalizes
   it, stores it, then calls `SourceEventRegistry.recordEvent(...)` on
   Sepolia.
2. `apps/worker-oracle` picks up the new `SUBMITTED_SOURCE_CHAIN` event and
   calls `proofBuilder.waitUntilHeightAttested(...)` — this genuinely
   blocks until Creditcoin has attested the Sepolia block containing our
   transaction (real latency, anywhere from under a minute to several
   minutes; the UI reflects this honestly with an `AWAITING_ATTESTATION`
   status rather than faking instant confirmation).
3. Once attested, `proofBuilder.getProof(txHash)` returns the Merkle proof
   (inclusion) and continuity proof (chain integrity back to an attested
   anchor).
4. `PhysicalASC.execute(...)` is called with that proof. Internally it
   calls the native precompile (`NativeQueryVerifierLib.getVerifier()` at
   `0x0FD2`) to verify inclusion, decodes the `EventRecorded` log from the
   now-proven transaction bytes, and stores the verified state on-chain
   (`PhysicalEventVerified` event, `verifiedEvents` mapping).
5. `apps/worker-oracle`'s coordination engine (`coordination.ts`) then
   evaluates all active `Job` rules against the newly verified value. If a
   condition matches, it calls `PhysicalSettlement.recordSettlement(...)` —
   a second, real, separate transaction on Creditcoin.

Every status in this pipeline (`INGESTED → SUBMITTED_SOURCE_CHAIN →
AWAITING_ATTESTATION → PROOF_READY → VERIFIED → SETTLED`, or
`VERIFICATION_FAILED`) is a real column value in the database, driving
what the UI shows — nothing is inferred or faked for demo purposes.

## Known ambiguities we resolved by verifying, not guessing

Per our own engineering discipline on this project: when the docs were
ambiguous, we didn't invent an answer.

- **Multiple testnet generations exist.** The Attestcoin Protocol docs
  reference at least three architectures across their history: an older
  STARK-proving generation (`ICreditcoinPublicProver`), the current native
  precompile generation ("CC3 Testnet", what we built against — matches
  the hackathon's own supplied SDK link), and a newer, separate
  "CCNext"/`usc-testnet2` generation not referenced by the hackathon's
  supplied resources. We deliberately built against CC3 Testnet.
- **Proof Builder API endpoint.** Docs and examples showed several
  candidate URLs across different pages. We resolved this empirically: the
  correct one for CC3 Testnet is `https://proof-gen-api.cc3-testnet.creditcoin.network`
  — confirmed by successfully generating real proofs against it.
- **`USCMinter.sol`'s structure changed** since the docs page describing it
  was written (the docs page itself notes this). We pulled the *current*
  source directly from the GitHub repo rather than trusting the
  documentation prose, which is why `PhysicalASC.sol` follows the current
  `USCBase` inheritance pattern rather than an older, deprecated one.

## Wallets and networks

- **Sepolia submitter** — funded via a public Sepolia faucet, submits
  `recordEvent` transactions.
- **Creditcoin submitter** — funded via the Creditcoin Discord faucet bot,
  submits verification and settlement transactions.
- **Creditcoin CC3 Testnet** — RPC `https://rpc.cc3-testnet.creditcoin.network`,
  explorer `https://creditcoin-testnet.blockscout.com`.

Batch verification (proving up to 10 queries with one shared continuity
proof) is supported by the protocol and is a natural P1 extension — not
implemented in the MVP, which processes one event at a time for clarity.
