# PHYSICAL — Demo Video Script

Target: 4-5 minutes. Every step below uses the real, live system — nothing
is staged. Where a live wait would be too long for video (attestation can
take minutes), that's called out explicitly with a instructions for how to
handle it honestly on camera.

**Have open before recording:** the live app, a terminal SSH'd into the
VPS, Blockscout, Sepolia Etherscan, and the OpenAQ station page. See
`DEMO_CHECKLIST.md` first.

---

### 00:00 — The problem (15s)

**Say:** "Physical infrastructure — sensor networks, node operators,
providers — makes claims about the real world. Right now, the only way to
check those claims is to trust the operator's own dashboard, or audit them
yourself. That doesn't scale."

**Show:** nothing yet, or the landing page's Problem section, static.

### 00:15 — What PHYSICAL does (20s)

**Say:** "PHYSICAL connects to infrastructure that already exists — real
sensors, not something we invented — and turns each reading into a
cryptographically verified on-chain fact, using the Attestcoin Protocol.
I'm going to show you the entire real pipeline, live, right now."

**Show:** landing page hero, scroll briefly through How it works.

### 00:35 — The real data source (25s)

**Say:** "We're not using a synthetic DePIN network. This is OpenAQ — a
real global air-quality monitoring network. Our station is a real
government reference monitor in Zürich."

**Show:** open `https://explore.openaq.org` (or the station's OpenAQ page)
briefly, then switch to the app's **Providers** page (`OpenAQ`, status
Connected) and **Network** page (real coordinates, `47.3776, 8.5304`).

### 01:00 — Live API demonstration (25s)

**Say:** "Here's the actual request our ingestion worker makes, live,
right now."

**Do, on camera, in a terminal:**
```bash
curl -H "X-API-Key: $OPENAQ_API_KEY" \
  "https://api.openaq.org/v3/locations/9589/latest?limit=1"
```
**Say while it returns:** "That's a real reading, straight from OpenAQ,
just now — parameter, value, timestamp."

*(If recording publicly, redact the API key from view or use a placeholder
env var as shown — never show the literal key on screen.)*

### 01:25 — Ingestion into PHYSICAL (20s)

**Say:** "Our ingestion worker takes that exact reading, normalizes it,
and submits it as a real transaction on Ethereum Sepolia — this is the
step that makes it something the Attestcoin Protocol can actually verify."

**Show:** SSH terminal on the VPS:
```bash
pm2 logs physical-worker-ingestion --lines 15 --nostream
```
Point out a real line like:
`[worker-ingestion] event ... submitted: 0x... (block ...)`

### 01:45 — The Attestcoin Protocol verification (35s)

**Say:** "Now our oracle worker waits for Creditcoin to attest that
Sepolia block, fetches a Merkle and continuity proof from the official
Proof Builder service, and submits it to our contract on Creditcoin —
which verifies it using the Attestcoin Protocol's native precompile."

**Show:** app's **Verification** page — Source Event → Attestation →
Attestcoin Protocol Verification → Verified State, with real IDs.

**If you have time to wait live:** show
```bash
pm2 logs physical-worker-oracle --lines 20 --nostream
```
and narrate the real "waiting for block ... to be attested" line.

**If not enough time to wait live (attestation can take several
minutes):** say so honestly — *"Attestation isn't instant — it can take a
few minutes, so I'll show you one that already completed."* Then point to
an already-`VERIFIED` event.

### 02:20 — Independent verification, off our app entirely (25s)

**Say:** "This is the important part — you don't have to trust me. Here's
the real transaction hash, and I'm going to open it on Creditcoin's public
explorer, completely independent of our app."

**Do:** click a real `creditcoinVerificationTxHash` link → Blockscout opens
→ show the `PhysicalEventVerified` log in the Logs tab.

### 02:45 — The coordination rule (25s)

**Say:** "Once a reading is verified, a coordination rule can act on it
automatically. Ours says: if PM2.5 goes above 5.0, trigger a real
settlement. This threshold sits right in the middle of what this station
actually reports, so it genuinely fires sometimes and not others — it's
not rigged to always succeed."

**Show:** app's **Jobs** page — the real rule, "Active".

### 03:10 — A real settlement (20s)

**Say:** "Here's a settlement that fired because a real verified reading
crossed that threshold — again, independently checkable."

**Show:** **Settlements** page → click through to Blockscout again.

*(If no settlement has fired recently, say so honestly: "The rule hasn't
matched in the last few readings — here's the JobRun record showing it
correctly evaluated and didn't fire, which is exactly the point: it's not
rigged.")*

### 03:30 — Proof the backend is really running (20s)

**Say:** "This isn't a local demo — it's deployed and running continuously
on a real server."

**Show, in the VPS terminal:**
```bash
pm2 list
```
Point out `physical-api`, `physical-worker-ingestion`,
`physical-worker-oracle`, all `online`, alongside other unrelated
processes on the same box (proves it's a real always-on server, not a
container spun up just for the recording).

### 03:50 — Why it matters (20s)

**Say:** "This generalizes beyond air quality — node uptime claims,
connectivity coverage, logistics conditions, anything where a real-world
reading needs to trigger a provable, automatic action instead of a manual
claims process."

**Show:** landing page's Use Cases section, briefly.

### 04:10 — Close (15s)

**Say:** "Everything you just saw — every transaction hash, every reading
— you can go check yourself, right now, on a public block explorer."

**Show:** landing page CTA / links: `physical-depin.vercel.app`,
`github.com/Investorquab/Physical`.

---

## If something doesn't cooperate live

- **OpenAQ is slow/down:** show a recent successful log line instead of a
  fresh live call, and say so plainly ("here's one from a few minutes
  ago, since OpenAQ's response is slow right now").
- **Attestation is taking too long to show live:** narrate the real
  waiting log, then cut to an already-verified example — never fake a
  faster resolution than actually happened.
- **No settlement has fired recently:** show a `NOT_MATCHED` `JobRun` and
  explain that's the rule correctly *not* firing — this is honest and
  actually strengthens credibility (a rule that always fires looks rigged).

Never present a fixture/simulated value as if it were a fresh live
reading. If you must fall back to something pre-recorded, say so on camera.
