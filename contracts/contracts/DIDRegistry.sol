// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/*
 * DIDRegistry
 * - supports multiple DIDs per controller (wallet)
 * - stores minimal DIDDocument pointer (CID), publicKey, controller mapping
 * - allows a recoveryManager to update controller after social recovery
 * - emits events for off-chain indexing
 *
 * NOTE: For gas sanity we index DIDs by bytes32 hash (keccak256 of the DID string).
 */

contract DIDRegistry {
    struct DIDDocument {
        string did; // original DID string (human readable)
        address controller; // owner/controller (wallet)
        string publicKey; // public key (hex or base58) as a string
        string serviceEndpoint; // IPFS CID or URL
        uint256 updatedAt;
    }

    // DID hash => DIDDocument
    mapping(bytes32 => DIDDocument) public didDocuments;

    // DID hash => controller
    mapping(bytes32 => address) public controllerOf;

    // controller => list of DIDs (hashes)
    mapping(address => bytes32[]) public didsOf;

    address public owner;
    address public recoveryManager; // settable by owner (or via RegistryHub)

    event DIDRegistered(bytes32 indexed didHash, string did, address indexed controller, string cid);
    event DIDUpdated(bytes32 indexed didHash, address indexed controller, string newPublicKey, string newCid);
    event DIDControllerUpdated(bytes32 indexed didHash, address indexed oldController, address indexed newController);
    event RecoveryManagerSet(address indexed oldManager, address indexed newManager);

    modifier onlyOwner() {
        require(msg.sender == owner, 'DIDRegistry: only owner');
        _;
    }

    modifier onlyController(bytes32 didHash) {
        require(controllerOf[didHash] == msg.sender, 'DIDRegistry: not controller');
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// Register a DID; msg.sender becomes the controller if not already taken
    function registerDID(string calldata did, string calldata cid, string calldata publicKey) external {
        bytes32 didHash = keccak256(abi.encodePacked(did));
        require(controllerOf[didHash] == address(0), 'DIDRegistry: did already registered');

        controllerOf[didHash] = msg.sender;
        didDocuments[didHash] = DIDDocument({
            did: did,
            controller: msg.sender,
            publicKey: publicKey,
            serviceEndpoint: cid,
            updatedAt: block.timestamp
        });

        didsOf[msg.sender].push(didHash);

        emit DIDRegistered(didHash, did, msg.sender, cid);
    }

    /// Update public key and/or service endpoint (only controller)
    function updateDID(string calldata did, string calldata newCid, string calldata newPublicKey) external {
        bytes32 didHash = keccak256(abi.encodePacked(did));
        require(controllerOf[didHash] == msg.sender, 'DIDRegistry: not controller');
        DIDDocument storage doc = didDocuments[didHash];
        doc.publicKey = newPublicKey;
        doc.serviceEndpoint = newCid;
        doc.updatedAt = block.timestamp;

        emit DIDUpdated(didHash, msg.sender, newPublicKey, newCid);
    }

    /// Set recovery manager (only owner)
    function setRecoveryManager(address mgr) external onlyOwner {
        address old = recoveryManager;
        recoveryManager = mgr;
        emit RecoveryManagerSet(old, mgr);
    }

    /// Called by Recovery contract (recoveryManager) after threshold approvals
    function updateControllerByRecovery(string calldata did, address newController) external {
        require(msg.sender == recoveryManager, 'DIDRegistry: only recovery manager');
        bytes32 didHash = keccak256(abi.encodePacked(did));
        address old = controllerOf[didHash];
        require(old != address(0), 'DIDRegistry: unknown did');

        controllerOf[didHash] = newController;
        didDocuments[didHash].controller = newController;
        didDocuments[didHash].updatedAt = block.timestamp;

        // Append didHash to newController's list
        didsOf[newController].push(didHash);

        emit DIDControllerUpdated(didHash, old, newController);
    }

    /// Resolve returns document metadata (note: DID document full JSON should be fetched off-chain via CID)
    function resolveDID(
        string calldata did
    ) external view returns (address controller, string memory cid, string memory publicKey, uint256 updatedAt) {
        bytes32 didHash = keccak256(abi.encodePacked(did));
        DIDDocument storage doc = didDocuments[didHash];
        return (doc.controller, doc.serviceEndpoint, doc.publicKey, doc.updatedAt);
    }

    /// Helper: get DIDs owned by an address
    function getDIDsOf(address controller) external view returns (bytes32[] memory) {
        return didsOf[controller];
    }
}
