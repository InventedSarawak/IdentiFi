// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/*
 * RevocationRegistry
 * - anchor credential CID / hash and allow issuer to revoke
 * - minimal on-chain storage: (issuer, cid, revoked flag, timestamp)
 *
 * credHash is computed off-chain by issuer/verifier:
 *  e.g. credHash = keccak256(abi.encodePacked(cid, credentialId, issuanceDate))
 */

contract RevocationRegistry {
    struct Anchor {
        address issuer;
        string cid; // IPFS CID or metadata pointer
        bool revoked;
        uint256 ts;
    }

    mapping(bytes32 => Anchor) public anchors;

    event CredentialAnchored(bytes32 indexed credHash, address indexed issuer, string cid);
    event CredentialRevoked(bytes32 indexed credHash, address indexed issuer, string reason);

    // Anchor a credential (issuer only for that credHash)
    function anchorCredential(bytes32 credHash, string calldata cid) external {
        require(anchors[credHash].issuer == address(0), 'Revocation: already anchored');
        anchors[credHash] = Anchor({ issuer: msg.sender, cid: cid, revoked: false, ts: block.timestamp });
        emit CredentialAnchored(credHash, msg.sender, cid);
    }

    // Revoke (only issuer who anchored can revoke)
    function revokeCredential(bytes32 credHash, string calldata reason) external {
        Anchor storage a = anchors[credHash];
        require(a.issuer != address(0), 'Revocation: not anchored');
        require(a.issuer == msg.sender, 'Revocation: only issuer');
        require(!a.revoked, 'Revocation: already revoked');
        a.revoked = true;
        emit CredentialRevoked(credHash, msg.sender, reason);
    }

    // Query if revoked
    function isRevoked(bytes32 credHash) external view returns (bool) {
        return anchors[credHash].revoked;
    }

    // Get anchor metadata
    function getAnchor(
        bytes32 credHash
    ) external view returns (address issuer, string memory cid, bool revoked, uint256 ts) {
        Anchor storage a = anchors[credHash];
        return (a.issuer, a.cid, a.revoked, a.ts);
    }
}
