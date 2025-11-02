// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/*
 * Recovery
 * - social recovery with configurable guardians and threshold
 * - guardians approve recovery; after threshold approvals, Recovery.executeRecovery calls DIDRegistry.updateControllerByRecovery
 * - prevents double approvals and resets approvals after execution
 *
 * Security notes:
 * - recommended to add a challenge/timelock off-chain or on-chain for production
 * - DIDRegistry must set this contract as recoveryManager after deployment
 */

interface IDIDRegistry {
    function updateControllerByRecovery(string calldata did, address newController) external;
}

contract Recovery {
    struct RecoveryData {
        address[] guardians;
        uint8 threshold; // number required to recover (e.g., 2)
        bool initialized;
    }

    // owner => RecoveryData
    mapping(address => RecoveryData) public recoveryData;

    // owner => guardian => approved (for a specific pending controller + did hash)
    mapping(address => mapping(address => bool)) public approvals;

    // owner => pending new controller's address and did string (optional local store)
    // We do not store pending in contract to reduce gas; approvals are guardian->true and counted at execution

    address public owner;
    address public didRegistry; // set in constructor or via setter

    event GuardiansSet(address indexed ownerAddr, address[] guardians, uint8 threshold);
    event RecoveryApproved(address indexed ownerAddr, address indexed guardian);
    event RecoveryExecuted(address indexed ownerAddr, address indexed newController, string did);

    modifier onlyOwner() {
        require(msg.sender == owner, 'Recovery: only owner');
        _;
    }

    constructor(address _didRegistry) {
        owner = msg.sender;
        didRegistry = _didRegistry;
    }

    function setDIDRegistry(address _didRegistry) external onlyOwner {
        didRegistry = _didRegistry;
    }

    /// Owner sets guardians and threshold (e.g., 3 guardians, threshold 2)
    function setGuardians(address[] calldata guardians, uint8 threshold) external {
        require(guardians.length >= 1 && guardians.length <= 10, 'Recovery: guardians count invalid');
        require(threshold >= 1 && threshold <= guardians.length, 'Recovery: threshold invalid');
        RecoveryData storage rd = recoveryData[msg.sender];
        rd.guardians = guardians;
        rd.threshold = threshold;
        rd.initialized = true;

        // reset any old approvals for this owner
        for (uint i = 0; i < guardians.length; i++) {
            approvals[msg.sender][guardians[i]] = false;
        }

        emit GuardiansSet(msg.sender, guardians, threshold);
    }

    /// Guardian approves a recovery for the given owner
    function approveRecovery(address ownerAddr) external {
        RecoveryData storage rd = recoveryData[ownerAddr];
        require(rd.initialized, 'Recovery: guardians not set');
        bool isGuardian = false;
        for (uint i = 0; i < rd.guardians.length; i++) {
            if (rd.guardians[i] == msg.sender) {
                isGuardian = true;
                break;
            }
        }
        require(isGuardian, 'Recovery: caller not guardian');
        require(!approvals[ownerAddr][msg.sender], 'Recovery: already approved');

        approvals[ownerAddr][msg.sender] = true;
        emit RecoveryApproved(ownerAddr, msg.sender);
    }

    /// Execute recovery: counts approvals and if >= threshold, calls DIDRegistry to update controller
    /// 'did' must be the DID string as originally registered (e.g., "did:identifi:abc")
    function executeRecovery(address ownerAddr, address newController, string calldata did) external {
        RecoveryData storage rd = recoveryData[ownerAddr];
        require(rd.initialized, 'Recovery: guardians not set');

        uint256 count = 0;
        for (uint i = 0; i < rd.guardians.length; i++) {
            if (approvals[ownerAddr][rd.guardians[i]]) count++;
        }
        require(count >= rd.threshold, 'Recovery: not enough approvals');

        // reset approvals
        for (uint i = 0; i < rd.guardians.length; i++) {
            approvals[ownerAddr][rd.guardians[i]] = false;
        }

        // call DIDRegistry to update controller (DIDRegistry must allow this contract as recoveryManager)
        IDIDRegistry(didRegistry).updateControllerByRecovery(did, newController);

        emit RecoveryExecuted(ownerAddr, newController, did);
    }

    /// Helper: check approvals count for owner
    function approvalsCount(address ownerAddr) external view returns (uint256) {
        RecoveryData storage rd = recoveryData[ownerAddr];
        uint256 count = 0;
        for (uint i = 0; i < rd.guardians.length; i++) {
            if (approvals[ownerAddr][rd.guardians[i]]) count++;
        }
        return count;
    }

    /// Helper: get guardians & threshold
    function getGuardians(
        address ownerAddr
    ) external view returns (address[] memory guardians, uint8 threshold, bool initialized) {
        RecoveryData storage rd = recoveryData[ownerAddr];
        return (rd.guardians, rd.threshold, rd.initialized);
    }
}
