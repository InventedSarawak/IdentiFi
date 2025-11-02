// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import '@openzeppelin/contracts/access/Ownable.sol';

/*
 * RegistryHub - simple coordinator to store contract addresses for frontends/backends
 * - owner can set addresses for DIDRegistry, AccessControl, Recovery, RevocationRegistry, IssuerRegistry
 * - convenience getter for front-end to fetch single config
 */

contract RegistryHub is Ownable {
    constructor() Ownable(msg.sender) {}

    address public didRegistry;
    address public accessControl;
    address public recovery;
    address public revocationRegistry;
    address public issuerRegistry;

    event AddressesSet(
        address didRegistry,
        address accessControl,
        address recovery,
        address revocationRegistry,
        address issuerRegistry
    );

    function setAddresses(
        address _didRegistry,
        address _accessControl,
        address _recovery,
        address _revocationRegistry,
        address _issuerRegistry
    ) external onlyOwner {
        didRegistry = _didRegistry;
        accessControl = _accessControl;
        recovery = _recovery;
        revocationRegistry = _revocationRegistry;
        issuerRegistry = _issuerRegistry;
        emit AddressesSet(didRegistry, accessControl, recovery, revocationRegistry, issuerRegistry);
    }

    function getAddresses() external view returns (address, address, address, address, address) {
        return (didRegistry, accessControl, recovery, revocationRegistry, issuerRegistry);
    }
}
