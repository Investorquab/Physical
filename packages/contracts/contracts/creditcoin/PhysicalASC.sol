// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {USCBase} from "./USCBase.sol";
import {EvmV1Decoder} from "@gluwa/usc-contracts/contracts/decoding/EvmV1Decoder.sol";

/// @title PhysicalASC
/// @notice Attestcoin Smart Contract for PHYSICAL. Verifies that a normalized
/// real-world event was really committed on the source chain (Sepolia) via
/// SourceEventRegistry, then records the verified state on Creditcoin.
/// Combined pattern: verification + business logic in one contract (MVP).
contract PhysicalASC is USCBase {
    enum PhysicalActions {
        RecordVerifiedEvent // 0
    }

    error InvalidAction(uint8 action);

    // Computed by the compiler from this exact literal — must match the event
    // declared in SourceEventRegistry.sol (contracts/source/) verbatim, same
    // parameter types and order.
    bytes32 public constant EVENT_RECORDED_SIGNATURE =
        keccak256("EventRecorded(bytes32,bytes32,int256,uint256)");

    struct VerifiedEvent {
        bytes32 eventId;
        bytes32 payloadHash;
        int256 value;
        uint256 observedAt;
        uint256 verifiedAt;
        bytes32 queryId;
    }

    mapping(bytes32 => VerifiedEvent) public verifiedEvents;

    event PhysicalEventVerified(
        bytes32 indexed eventId,
        bytes32 payloadHash,
        int256 value,
        uint256 observedAt,
        bytes32 indexed queryId
    );

    function _processAndEmitEvent(uint8 action, bytes32 queryId, bytes memory encodedTransaction) internal override {
        if (action == uint8(PhysicalActions.RecordVerifiedEvent)) {
            _processEventRecorded(queryId, encodedTransaction);
        } else {
            revert InvalidAction(action);
        }
    }

    function _processEventRecorded(bytes32 queryId, bytes memory encodedTransaction) internal {
        uint8 txType = EvmV1Decoder.getTransactionType(encodedTransaction);
        require(EvmV1Decoder.isValidTransactionType(txType), "Unsupported transaction type");

        EvmV1Decoder.ReceiptFields memory receipt = EvmV1Decoder.decodeReceiptFields(encodedTransaction);
        require(receipt.receiptStatus == 1, "Source transaction did not succeed");

        EvmV1Decoder.LogEntry[] memory logs =
            EvmV1Decoder.getLogsByEventSignature(receipt, EVENT_RECORDED_SIGNATURE);
        require(logs.length > 0, "No EventRecorded events found");

        EvmV1Decoder.LogEntry memory log = logs[0];
        require(log.topics.length == 2, "Invalid EventRecorded topics");
        require(log.topics[0] == EVENT_RECORDED_SIGNATURE, "Not EventRecorded event");

        bytes32 eventId = log.topics[1];
        (bytes32 payloadHash, int256 value, uint256 observedAt) =
            abi.decode(log.data, (bytes32, int256, uint256));

        verifiedEvents[eventId] = VerifiedEvent({
            eventId: eventId,
            payloadHash: payloadHash,
            value: value,
            observedAt: observedAt,
            verifiedAt: block.timestamp,
            queryId: queryId
        });

        emit PhysicalEventVerified(eventId, payloadHash, value, observedAt, queryId);
    }
}