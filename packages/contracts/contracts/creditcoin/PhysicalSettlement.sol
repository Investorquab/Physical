// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/// @title PhysicalSettlement
/// @notice Deployed on Creditcoin CC3 Testnet. Called by PHYSICAL's backend
/// once a coordination rule (Job) evaluates true against a VERIFIED event.
/// This does not re-verify anything — verification already happened in
/// PhysicalASC. This is the downstream action: the actual settlement.
contract PhysicalSettlement {
    address public immutable operator;

    struct SettlementRecord {
        bytes32 eventId;
        uint256 jobId;
        int256 value;
        uint256 settledAt;
    }

    mapping(bytes32 => SettlementRecord) public settlements;

    event SettlementRecorded(
        bytes32 indexed eventId,
        uint256 indexed jobId,
        int256 value,
        uint256 settledAt
    );

    error NotOperator();
    error AlreadySettled();

    constructor(address _operator) {
        operator = _operator;
    }

    function recordSettlement(
        bytes32 eventId,
        uint256 jobId,
        int256 value
    ) external {
        if (msg.sender != operator) revert NotOperator();
        if (settlements[eventId].settledAt != 0) revert AlreadySettled();

        settlements[eventId] = SettlementRecord({
            eventId: eventId,
            jobId: jobId,
            value: value,
            settledAt: block.timestamp
        });

        emit SettlementRecorded(eventId, jobId, value, block.timestamp);
    }
}
