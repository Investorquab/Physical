# Demo Flow

A ~5 minute walkthrough for judges. Every step below uses the live
deployment — nothing is a local-only demo.

**App:** https://physical-depin.vercel.app

## 1. Landing page

Open the root URL. The hero explains the core claim in one line: real
readings from existing infrastructure become cryptographically verified
on-chain state via the Attestcoin Protocol. Scroll through Problem → How it
works → Use cases → Architecture to see the full story before going into
the app.

## 2. Enter the app

Click "Launch app". You land on **Overview** — a snapshot of connected
infrastructure, verified events, and confirmed settlements. If any numbers
are genuinely zero, the page says so honestly rather than showing a
placeholder.

## 3. See the connected real-world source

Go to **Providers** → shows **OpenAQ**, status "Connected", linking to its
real API endpoint (`api.openaq.org`).

Go to **Network** → shows the real station we're polling — **Zürich
Kaserne**, a real government air-quality reference monitor — with its
actual coordinates plotted, not a placeholder pin.

## 4. Watch a real event arrive and get normalized

Go to **Events**. Each row is a real PM2.5 reading fetched from that
station, with a normalized value, unit, and timestamp. Click into one to
see the full provenance: raw payload reference, normalization, and current
status in the pipeline.

## 5. The verification flow

Go to **Verification**. This page exists specifically so a judge doesn't
need to read source code to understand the flow: Source Event → Attestation
→ Attestcoin Protocol Verification → Verified State, with real IDs and
transaction hashes at each stage, not diagram boxes with no data behind
them.

Click any real `creditcoinVerificationTxHash` link — it opens
**Blockscout** (Creditcoin's testnet explorer) directly, showing the real
`PhysicalEventVerified` transaction, independently, outside our app
entirely.

## 6. The coordination rule

Go to **Jobs**. Shows the live rule: *"PM2.5 threshold watch — Zürich
Kaserne"* — `IF pm25 > 5.0 THEN record_settlement`. This threshold was
picked deliberately close to the station's real observed range (roughly
2.8–6.1 µg/m³ so far) so the rule genuinely sometimes matches and sometimes
doesn't — not rigged to always fire.

## 7. A real settlement

Go to **Settlements**. Each entry here only exists because a verified
event actually crossed the rule's threshold — click through to Blockscout
again to confirm the settlement transaction independently.

## 8. The full timeline

Go to **Activity** — a combined chronological feed of every verified event
and settlement, the fastest way to see the whole system's real history at
a glance.

## 9. Independent verification, unprompted

At this point, a judge should be able to take *any* transaction hash shown
anywhere in the app, paste it into Blockscout or Sepolia Etherscan
themselves, and confirm it independently — without trusting anything we
say. That's the actual point of the project.

## What to say, in one sentence

"We connected a real, already-deployed piece of physical infrastructure to
a verifiable cross-chain coordination and settlement system, built on the
Attestcoin Protocol — and every number you just saw, you can go check
yourself."
