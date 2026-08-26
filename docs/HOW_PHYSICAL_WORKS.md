# How PHYSICAL Works

## Level 1 — 30 seconds

PHYSICAL takes readings from a real, already-existing air-quality sensor
and turns each one into a cryptographically verified fact on a blockchain
— so anyone, not just us, can independently confirm the reading was real
and act on it automatically. Nothing is invented. Nothing is simulated.

## Level 2 — 2 minutes

Right now, if a sensor network or infrastructure provider says "this
reading is real" or "we served this area," the only way to know is to
trust their own dashboard, or audit them yourself. That doesn't scale
across organizations.

PHYSICAL solves this by connecting to a real external data source (OpenAQ,
a global air-quality monitoring network) and, instead of just storing the
reading in our own database, committing it as a real transaction on
Ethereum Sepolia. That transaction is then independently verified on
Creditcoin using the Attestcoin Protocol's native cryptographic verifier —
proving the reading genuinely happened, without anyone needing to trust
PHYSICAL's own database. Once verified, a coordination rule can act on it
automatically — in our demo, triggering a real settlement transaction when
a threshold is crossed.

## Level 3 — Technical

See [`SYSTEM_MAP.md`](./SYSTEM_MAP.md) for the full component-level flow,
and [`USC_INTEGRATION.md`](./USC_INTEGRATION.md) for exactly how the
Attestcoin Protocol verification works, down to the precompile call.

---

## Why does this need to exist?

Because "trust the operator's own dashboard" is the current default for
physical-world data claims, and it doesn't survive contact with real money
— rewards, insurance, settlement — being on the line.

## Why can't this just be a normal API?

A normal API only proves "our server says so." PHYSICAL's verification
step proves something a third party can check *without* trusting our
server at all — the proof lives on a public blockchain, not in our
database.

## Why does Attestcoin matter?

It's the mechanism that makes the previous answer true. Without it, "we
verified it" would just be another unverifiable claim, no different from
the problem we're trying to solve.

## What is actually being verified?

Precisely: that a specific transaction (containing our normalized reading)
was really included in a specific Sepolia block. Not the sensor's
truthfulness itself — see "Limitations" below.

## What is OpenAQ's role vs. PHYSICAL's role?

OpenAQ is a **data source** — a real, independent air-quality network we
do not own or operate. PHYSICAL is the **verification and coordination
layer** built around it. We are explicit about this distinction: PHYSICAL
does not claim to own or control OpenAQ's sensors.

## What part is on-chain vs. off-chain?

**Off-chain:** fetching from OpenAQ, normalizing, waiting for attestation,
fetching proofs (`apps/worker-ingestion`, `apps/worker-oracle`).
**On-chain:** the source transaction (Sepolia), the verification
transaction and the settlement transaction (both Creditcoin).

## What happens if OpenAQ goes down?

The ingestion worker's next poll simply returns no new readings; nothing
breaks, no fake data gets substituted. This is the current, honest
behavior — see Limitations for what a production version would add
(multiple redundant data sources).

## What happens if attestation fails or takes a long time?

The event's status stays at `AWAITING_ATTESTATION` in the database and the
UI reflects that honestly rather than showing a fake "verified" state.
Attestation latency is real and variable (seconds to several minutes) —
we do not fake instant confirmation.

## What would this become in production?

Multiple data sources and stations, a UI for defining new coordination
rules (not just SQL), redundant oracle workers, and — most importantly —
an honest answer to "who pays for this," which the current hackathon
version does not yet solve (see Limitations).

## Limitations, stated plainly

- Blockchain verification proves the *transaction* happened — it does not
  independently prove the *sensor* is truthful. That trust still sits with
  OpenAQ and its station operators. PHYSICAL narrows the trust surface; it
  doesn't eliminate it entirely.
- Single data source, single station, single coordination rule in the
  current build.
- No economic incentive layer exists yet — nobody is currently paid for
  anything. This is future work, not a current feature.
- No redundancy: one oracle worker, one ingestion worker, one VPS.
