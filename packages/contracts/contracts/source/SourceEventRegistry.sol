// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/// @title SourceEventRegistry
/// @notice Deployed on Ethereum Sepolia. PHYSICAL's backend calls recordEvent()
/// for every normalized real-world event it ingests. This transaction is what
/// the Attestcoin Protocol verifies on Creditcoin.
contract SourceEventRegistry {
    address public immutable submitter;

    /// @dev Signature MUST exactly match EVENT_RECORDED_SIGNATURE in PhysicalASC.sol.
    event EventRecorded(
        bytes32 indexed eventId,
        bytes32 payloadHash,
        int256 value,
        uint256 observedAt
    );

    error NotSubmitter();
    error EventAlreadyRecorded();

    mapping(bytes32 => bool) public recorded;

    constructor(address _submitter) {
        submitter = _submitter;
    }

    function recordEvent(
        bytes32 eventId,
        bytes32 payloadHash,
        int256 value,
        uint256 observedAt
    ) external {
        if (msg.sender != submitter) revert NotSubmitter();
        if (recorded[eventId]) revert EventAlreadyRecorded();

        recorded[eventId] = true;
        emit EventRecorded(eventId, payloadHash, value, observedAt);
    }
}