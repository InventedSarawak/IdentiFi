// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import '@openzeppelin/contracts/access/Ownable.sol';

/*
 * IssuerRegistry
 * - owner (deployer) can add/remove trusted issuers and attach metadata (CID)
 * - verifiers can query if an issuer is trusted
 */

contract IssuerRegistry is Ownable {
    constructor() Ownable(msg.sender) {}
    
    mapping(address => bool) public trusted;
    mapping(address => string) public metadataCID;

    event IssuerAdded(address indexed issuer, string metaCID);
    event IssuerRemoved(address indexed issuer);

    function addIssuer(address issuer, string calldata metaCID) external onlyOwner {
        trusted[issuer] = true;
        metadataCID[issuer] = metaCID;
        emit IssuerAdded(issuer, metaCID);
    }

    function removeIssuer(address issuer) external onlyOwner {
        trusted[issuer] = false;
        emit IssuerRemoved(issuer);
    }

    function isTrusted(address issuer) external view returns (bool) {
        return trusted[issuer];
    }

    function getMetadataCID(address issuer) external view returns (string memory) {
        return metadataCID[issuer];
    }
}
