// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/*
 * AccessControl
 * - field-granular permissioning (field names hashed to bytes32)
 * - supports expiry timestamps and optional consentCID (off-chain proof)
 * - batch grant/revoke for convenience
 */

contract AccessControl {
    struct Permission {
        bool granted;
        uint256 expiry; // unix ts, 0 = no expiry
        string consentCID; // optional IPFS CID of consent statement
    }

    // owner => grantee => fieldHash => Permission
    mapping(address => mapping(address => mapping(bytes32 => Permission))) public permissions;

    event AccessGranted(
        address indexed owner,
        address indexed grantee,
        bytes32 indexed fieldHash,
        uint256 expiry,
        string consentCID
    );
    event AccessRevoked(address indexed owner, address indexed grantee, bytes32 indexed fieldHash);

    // Grant access for a single field
    function grantAccess(address grantee, string calldata field, uint256 expiry, string calldata consentCID) external {
        bytes32 f = keccak256(abi.encodePacked(field));
        permissions[msg.sender][grantee][f] = Permission(true, expiry, consentCID);
        emit AccessGranted(msg.sender, grantee, f, expiry, consentCID);
    }

    // Batch grant: arrays must match
    function grantAccessBatch(
        address[] calldata grantees,
        string[] calldata fields,
        uint256[] calldata expiries,
        string[] calldata consentCIDs
    ) external {
        require(
            grantees.length == fields.length &&
                fields.length == expiries.length &&
                expiries.length == consentCIDs.length,
            'AccessControl: array length mismatch'
        );
        for (uint i = 0; i < grantees.length; i++) {
            bytes32 f = keccak256(abi.encodePacked(fields[i]));
            permissions[msg.sender][grantees[i]][f] = Permission(true, expiries[i], consentCIDs[i]);
            emit AccessGranted(msg.sender, grantees[i], f, expiries[i], consentCIDs[i]);
        }
    }

    // Revoke access
    function revokeAccess(address grantee, string calldata field) external {
        bytes32 f = keccak256(abi.encodePacked(field));
        permissions[msg.sender][grantee][f].granted = false;
        emit AccessRevoked(msg.sender, grantee, f);
    }

    // Batch revoke
    function revokeAccessBatch(address[] calldata grantees, string[] calldata fields) external {
        require(grantees.length == fields.length, 'AccessControl: array length mismatch');
        for (uint i = 0; i < grantees.length; i++) {
            bytes32 f = keccak256(abi.encodePacked(fields[i]));
            permissions[msg.sender][grantees[i]][f].granted = false;
            emit AccessRevoked(msg.sender, grantees[i], f);
        }
    }

    // View: check if grantee has access for field (and not expired)
    function hasAccess(address owner, address grantee, string calldata field) external view returns (bool) {
        bytes32 f = keccak256(abi.encodePacked(field));
        Permission memory p = permissions[owner][grantee][f];
        if (!p.granted) return false;
        if (p.expiry == 0) return true;
        return p.expiry > block.timestamp;
    }

    // Helper to fetch permission (off-chain UI can show consentCID and expiry)
    function getPermission(
        address owner,
        address grantee,
        string calldata field
    ) external view returns (bool granted, uint256 expiry, string memory consentCID) {
        bytes32 f = keccak256(abi.encodePacked(field));
        Permission memory p = permissions[owner][grantee][f];
        return (p.granted, p.expiry, p.consentCID);
    }
}
