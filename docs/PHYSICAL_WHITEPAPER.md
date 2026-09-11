# PHYSICAL
## Verifiable Coordination for Real World Infrastructure

**Technical Whitepaper**  
**BUIDL CTC 2026 Fall | DePIN Track**  
**Author:** Bello Quadri Olawale, also known as Quab

## Abstract

PHYSICAL connects existing physical sensor infrastructure to programmable actions across blockchain networks. The prototype collects real air quality observations from OpenAQ, normalizes each observation, commits it to Ethereum Sepolia, and uses the Attestcoin Protocol, formerly known as Universal Smart Contracts, to verify the source chain event on Creditcoin.

After verification, a Creditcoin side coordination rule evaluates the observation. A configured condition, such as a PM2.5 reading crossing a threshold, can trigger a real Creditcoin testnet settlement transaction. The result is a complete evidence path from a physical measurement to a verifiable on chain consequence.

PHYSICAL does not create virtual sensor readings or claim that Attestcoin proves the physical sensor is honest. OpenAQ and the underlying sensor infrastructure remain the physical data trust boundary. Attestcoin verifies the source chain commitment and event inclusion, while Creditcoin executes the destination logic.

## 1. Problem Statement

Physical infrastructure produces valuable data, but the data is often isolated from programmable financial and coordination systems. An API response alone is not enough for a destination smart contract to safely act on a measurement. A robust system needs:

1. A traceable source of the observation.
2. A stable commitment to the data on a source blockchain.
3. A verifiable cross chain mechanism.
4. Deterministic destination rules.
5. Evidence that allows a reviewer to follow the complete flow.

Many systems stop at dashboards, centralized webhooks, or opaque oracle messages. PHYSICAL focuses on the missing connection between real world data and verifiable on chain execution.

## 2. Product Overview

PHYSICAL is a DePIN coordination and settlement layer built on existing infrastructure. It currently uses OpenAQ air quality stations as the physical data source. The system turns a measurement into a structured event, records that event on Ethereum Sepolia, verifies it on Creditcoin through Attestcoin, and evaluates a coordination rule.

The prototype demonstrates a simple but meaningful action: a verified PM2.5 measurement can satisfy a configured threshold rule and trigger a Creditcoin testnet settlement.

The product is designed around four principles:

- Use real infrastructure instead of simulated hardware.
- Keep source data, proof transport, and destination business logic separate.
- Make Attestcoin essential to the cross chain path.
- Show evidence instead of relying on claims.

## 3. System Architecture

```text
Existing physical sensor infrastructure
                |
              OpenAQ
                |
        PHYSICAL ingestion worker
                |
     normalize, deduplicate, persist
                |
     SourceEventRegistry on Sepolia
                |
         Attestcoin Protocol
                |
       Merkle and continuity proof
                |
       PhysicalASC on Creditcoin
                |
       native verifier precompile
                |
       verified physical event
                |
        PHYSICAL coordination rule
                |
         PhysicalSettlement
                |
      real Creditcoin testnet tx
                |
             frontend
```

The deployed application uses a Next.js frontend on Vercel, API and worker services on a VPS, and PostgreSQL hosted on Neon. The services are separated so ingestion, proof handling, settlement, and presentation can be operated and improved independently.

## 4. Data Ingestion

The ingestion worker retrieves measurements from OpenAQ using the required API credentials. A measurement is normalized into a stable application payload containing relevant station information, location metadata, measured parameter, value, unit, observation timestamp, source reference, and payload hash.

The worker also performs basic deduplication and persistence. The application stores the source reference and processing state so that the same observation is not needlessly processed multiple times.

OpenAQ is treated as the source of the physical observation. PHYSICAL preserves attribution to that source rather than presenting the application as the origin of the measurement.

## 5. Source Chain Commitment

The normalized observation is committed to Ethereum Sepolia through the SourceEventRegistry contract. The source contract emits an event containing the information needed to identify the observation and connect it to the normalized payload.

The source contract has a deliberately narrow responsibility. It records the source event and emits a log. It does not make the final business decision. The destination chain contains the coordination and settlement logic.

The payload hash connects the application record to the source chain commitment. Source transaction and event references are retained as part of the evidence trail.

## 6. Attestcoin Integration

Attestcoin is the core verification layer in PHYSICAL. The oracle worker monitors SourceEventRegistry events and waits until the relevant Ethereum block is eligible for verification. It then obtains the required Merkle and continuity proofs and submits them to PhysicalASC on Creditcoin.

PhysicalASC calls Creditcoin's native Attestcoin verifier precompile at:

```text
0x0000000000000000000000000000000000000FD2
```

The verifier checks the source transaction inclusion and the supplied proof material. PhysicalASC then validates the expected source context, decodes the verified transaction data, applies replay protection, and emits a Creditcoin side verified event.

This integration is load bearing. Without Attestcoin, PHYSICAL would not have the intended verifiable cross chain mechanism for confirming that the source event was committed on Ethereum before allowing the Creditcoin side action to execute.

## 7. Coordination Rules

A coordination rule defines the condition under which a verified observation should produce an action. A rule can identify:

- The source provider.
- The station or measurement scope.
- The measured parameter.
- The comparison operator.
- The threshold.
- The action to execute.

A sample rule is:

```text
If verified PM2.5 is greater than the configured threshold,
create a settlement action on Creditcoin.
```

The rule engine only evaluates observations that have passed the Attestcoin verification step. This prevents an unverified API response from directly triggering the destination action.

## 8. Settlement

When a verified observation satisfies a rule, PHYSICAL calls PhysicalSettlement. The contract records the action and produces a real Creditcoin CC3 testnet transaction.

The frontend displays the observation, source transaction, verification state, rule result, and settlement reference. The user can follow the evidence from the original source commitment to the final destination transaction.

The settlement is a testnet demonstration. Testnet tokens have no real world economic value.

## 9. Trust and Security Model

PHYSICAL separates three different forms of trust:

### Physical measurement trust

OpenAQ and the underlying sensor operators are responsible for producing the physical measurement. Attestcoin does not independently prove that the sensor is honest or that the measurement is free from physical world error.

### Cross chain transport trust

Attestcoin verifies that the source transaction and event are included in the source chain according to the supplied proof and attestation process. This creates an independently verifiable connection between the source commitment and the Creditcoin side application.

### Destination execution trust

Creditcoin smart contracts evaluate the verified event and execute deterministic rules. The frontend is not the trust anchor. The authoritative verification and settlement actions happen in the workers and contracts.

The prototype uses the following safeguards:

- Payload hashes connect normalized data to source commitments.
- Source transaction and event references support auditability.
- Replay protection prevents repeated processing of the same verified event.
- Destination rules execute only after successful verification.
- The application distinguishes source data from proof and settlement state.
- Testnet limitations are stated explicitly.

## 10. Operational Flow

1. The ingestion worker retrieves a real OpenAQ measurement.
2. The measurement is normalized and stored.
3. SourceEventRegistry commits the observation on Ethereum Sepolia.
4. The oracle worker monitors the source event.
5. The worker waits for the relevant attestation state.
6. Merkle and continuity proofs are obtained.
7. PhysicalASC submits the proof to the native verifier.
8. The verified event becomes available to the coordination layer.
9. The rule engine evaluates the configured condition.
10. PhysicalSettlement records the action on Creditcoin.
11. The frontend displays the complete evidence path.

## 11. Why This Fits the DePIN Track

PHYSICAL uses existing physical sensor infrastructure as the input to a programmable coordination system. The physical data drives a cross chain decision and can trigger settlement on Creditcoin. The project therefore demonstrates a practical DePIN pattern:

```text
physical observation -> verified cross chain fact -> programmable coordination -> settlement
```

The architecture can be extended to other infrastructure datasets without changing the central pattern. Possible future sources include additional environmental measurements, mobility infrastructure, energy telemetry, and other sensor networks that expose verifiable observations.

## 12. Limitations

The current prototype is a focused testnet implementation. It uses a limited rule configuration, a controlled set of supported measurement flows, and a single VPS deployment. It is not presented as a production ready decentralized sensor network.

The system does not claim that OpenAQ measurements are universally accurate. It also does not claim that Attestcoin replaces source data quality controls. The current design proves source chain commitment and cross chain verification, while physical measurement quality remains a separate concern.

## 13. Roadmap

- Add broader rule creation and management.
- Introduce durable retry queues and operational monitoring.
- Expand automated negative path and end to end test coverage.
- Support more physical data providers.
- Add source quality and anomaly signals.
- Support more coordination actions and settlement policies.
- Improve deployment redundancy and operational resilience.

## 14. Conclusion

PHYSICAL demonstrates how real world infrastructure data can become a verifiable on chain consequence. A real OpenAQ observation is normalized, committed to Ethereum, verified on Creditcoin through Attestcoin, evaluated by a deterministic rule, and used to trigger a real testnet settlement.

The central contribution is not another dashboard. It is an inspectable evidence path from a physical measurement to a programmable action across chains.

## Project Links

- Live application: https://physical-depin.vercel.app/
- Source repository: https://github.com/Investorquab/Physical
- Logo: https://physical-depin.vercel.app/physical-logo.jpg
- Whitepaper: https://physical-depin.vercel.app/whitepaper.md
