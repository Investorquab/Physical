# Judge Q&A — Top 20

Short answer first (say this out loud), technical answer if they push
further, and where to point on screen if asked to prove it.

---

**1. What exactly is PHYSICAL?**
*Short:* A verification layer that turns real-world sensor readings into
cryptographically verified on-chain facts, using the Attestcoin Protocol.
*Technical:* Full pipeline in `SYSTEM_MAP.md` — OpenAQ → Sepolia →
Attestcoin Protocol verification on Creditcoin → coordination rule →
settlement.
*Show:* Verification page.

**2. Isn't this just an oracle?**
*Short:* Yes, specifically — an off-chain worker that gets a real-world
transaction onto a chain the Attestcoin Protocol can verify. We don't
claim to be more decentralized than that.
*Technical:* `apps/worker-oracle` is the Readability Worker in the
official four-component Attestcoin architecture — this is the intended
role, not a shortcut.
*Show:* `docs/USC_INTEGRATION.md`.

**3. Why do you need blockchain? Why not just a database?**
*Short:* A database only proves "our server says so." The Attestcoin
Protocol verification proves a specific transaction happened, checkable by
anyone, without trusting our server at all.
*Technical:* `PhysicalASC.sol` calls the native precompile at `0x0FD2` —
verification is public and independently re-checkable on Blockscout.
*Show:* click a real tx hash → Blockscout.

**4. Does blockchain prove the sensor is truthful?**
*Short:* No — it proves the transaction happened, not that the underlying
sensor is honest. We're explicit about that boundary.
*Technical:* Trust in the sensor still sits with OpenAQ/the station
operator. Production would add multiple redundant, cross-checked sources.
*Show:* `HOW_PHYSICAL_WORKS.md`, "Limitations, stated plainly."

**5. Is this real, or a simulation?**
*Short:* Real. Real API, real testnet transactions, deployed and running
continuously on a live server right now.
*Technical:* `PHYSICAL_ARCHITECTURE_AUDIT.md` labels every component
REAL/TESTNET/MOCKED explicitly — nothing is fabricated for demo purposes.
*Show:* `pm2 list` on the VPS, live.

**6. Why Attestcoin specifically?**
*Short:* It's the piece that makes "we verified it" independently
checkable instead of just another unverifiable claim.
*Technical:* We use the current native-precompile generation, not the
legacy STARK-proving generation — confirmed by tracing actual working
code, not just docs prose.
*Show:* `docs/USC_INTEGRATION.md`, "The core correction" section.

**7. Why Creditcoin specifically?**
*Short:* Because that's where the Attestcoin Protocol's verifier
precompile lives — it's not an arbitrary choice, it's a requirement of
using the protocol at all.
*Technical:* `0x0FD2` is a Creditcoin-native precompile; there's no
version of this integration that doesn't involve Creditcoin.

**8. Why OpenAQ and not a weather API or your own sensors?**
*Short:* OpenAQ is literal existing physical infrastructure — real
stations, not a forecast model — which matches PHYSICAL's actual thesis:
build on what exists, don't manufacture fake nodes.
*Technical:* Free v3 API, strong provenance (station id, operator,
instrument metadata), natural threshold-based coordination story.

**9. What's on-chain vs off-chain?**
*Short:* Fetching and normalizing is off-chain; the source transaction,
verification, and settlement are all on-chain, real transactions.
*Show:* `SYSTEM_MAP.md`.

**10. What happens if OpenAQ goes down?**
*Short:* The next poll just returns nothing — no fake data gets
substituted. Production would add redundant data sources.

**11. What happens if verification fails?**
*Short:* The event's status honestly shows `VERIFICATION_FAILED` in the
database and the UI — we don't hide or fake a success.
*Show:* the `EventStatus` enum in `packages/db/schema.prisma`.

**12. Is anyone actually being paid? Is there a token economy?**
*Short:* No — not in the current hackathon build. That's explicitly future
work, not something we're claiming exists today.

**13. What prevents fake/duplicate data?**
*Short:* `SourceEventRegistry.sol` has replay protection (`EventAlreadyRecorded`),
and `USCBase`'s `execute()` has its own replay guard against re-verifying
the same proof twice.
*Show:* the contract source directly.

**14. Why is the backend on a VPS instead of all-Vercel?**
*Short:* The workers need to run continuously, indefinitely, polling and
waiting — that's a persistent-process workload, not a serverless request/
response one, which is what Vercel functions are built for.

**15. Why no Docker?**
*Short:* Deliberate tradeoff — the VPS runs 8 other lightweight processes
on 4GB RAM already; three more via pm2 was lower-overhead and lower-risk
given hackathon time than adding a Docker layer on top.

**16. What's your actual moat / what stops someone copying this tomorrow?**
*Short:* Honestly, at this stage — not much technically; the moat would be
real integrations with more data providers and rule builders over time,
not this specific pipeline.
*If pushed further:* Say so plainly rather than overclaiming a moat that
doesn't exist yet.

**17. What's the business model?**
*Short:* Not built or decided for the hackathon — the honest answer is
this demonstrates the technical primitive; a real business model (per-
verified-event fees, subscriptions) is future work, not implemented today.

**18. How does this scale beyond one station?**
*Short:* The adapter interface in `apps/worker-ingestion/src/adapters/`
is already built to support additional providers without rewriting the
pipeline — just not populated with more than one yet.
*Show:* `DataProviderAdapter` interface.

**19. What's the hardest part you actually solved?**
*Short:* Correctly integrating the real Attestcoin Protocol architecture
— we started with a wrong assumption (that it verifies arbitrary API data
directly), caught it against the real docs, and rebuilt around the actual
four-component architecture.
*Show:* `docs/USC_INTEGRATION.md`, "The core correction."

**20. Why should this win?**
*Short:* Because every claim we're making right now, you can go verify
yourself on a public block explorer, on infrastructure that's actually
running — not a demo we spun up for judging and will tear down after.
*Show:* the live app + a real tx hash, live, right now.
