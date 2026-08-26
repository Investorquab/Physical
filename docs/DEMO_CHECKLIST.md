# Pre-Recording Checklist

Run through this before hitting record — takes about 5 minutes.

## Backend health

```bash
ssh root@185.7.81.139
pm2 list
```
- [ ] `physical-api`, `physical-worker-ingestion`, `physical-worker-oracle` all show `online`
- [ ] No process shows a high restart count (would indicate crash-looping)

```bash
pm2 logs physical-api --lines 10 --nostream
pm2 logs physical-worker-ingestion --lines 10 --nostream
pm2 logs physical-worker-oracle --lines 10 --nostream
```
- [ ] No red error stack traces in any of the three

## API reachability

From your own machine:
```bash
curl https://185-7-81-139.sslip.io/healthz
```
- [ ] Returns `{"status":"ok"}`

```bash
curl https://185-7-81-139.sslip.io/api/v1/events
```
- [ ] Returns a real JSON array, not an empty array or error

## Frontend

- [ ] Open `https://physical-depin.vercel.app` — landing page loads
- [ ] No "Mock data" badge visible anywhere in the app
- [ ] Click through Overview, Network, Providers, Events, Jobs, Verification, Settlements, Activity — each loads real data, no error states

## OpenAQ

- [ ] Confirm your OpenAQ API key hasn't expired/hit a rate limit — a
      quick manual request (see `DEMO_VIDEO_SCRIPT.md` 01:00) should
      succeed

## Blockchain / explorers

- [ ] Have `sepolia.etherscan.io` and `creditcoin-testnet.blockscout.com`
      open in tabs already, ready to paste a tx hash
- [ ] Pull at least one real, already-`VERIFIED` event's tx hash from the
      Verification page as a fallback in case nothing new verifies live
      during recording

## Secrets

- [ ] Double-check no terminal window has `.env` open or a private key
      visible before you start screen recording
- [ ] If demonstrating the OpenAQ curl command live, redact the API key
      (use `$OPENAQ_API_KEY` shown as a variable, not the literal value)

## Backup plan

If OpenAQ, attestation, or a settlement doesn't cooperate in real time
during recording, use an **already-completed** real example instead of
waiting — and say on camera that you're doing so. Never present old data
as if it just happened, and never substitute fabricated/fixture data
without saying so explicitly.
