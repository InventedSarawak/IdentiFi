# SSI Wallet (Decentralized Identity Management System)

## Objective

Build a **college project** version of a Decentralized Identity Management System (SSI Wallet) that enables users to:

- Create and manage **DIDs** (Self-Sovereign Identity)
- Issue and verify **Verifiable Credentials (VCs)**
- Recover lost accounts using **Social Recovery**
- Manage **Access Control** through smart contracts

The goal is a **functional prototype within 4 days** — prioritizing working features over scalability.

---

## Project Structure

```text
/contracts   - Hardhat project for Solidity contracts
/backend     - Express.js API for credentials and recovery
/frontend    - Next.js app for wallet UI
/scripts     - Deployment scripts
/docs        - Documentation
```

---

## Tech Stack

- **Frontend:** Next.js + Tailwind + wagmi + viem + web3modal
- **Backend:** Express.js + IPFS-HTTP-Client + Crypto + Nodemailer
- **Blockchain:** Solidity + Hardhat + ethers.js + OpenZeppelin
- **Storage:** LocalStorage (wallet), IPFS (documents)
- **RPC Provider:** Infura
- **Crypto:** Node.js crypto + tweetnacl

---

## 4-Day Plan

### Day 1 – Setup & Smart Contracts

**Goal:** Get blockchain contracts working.

Tasks:

1. Create project folders & initialize git.
2. Setup Hardhat and install dependencies.
3. Implement contracts:
    - `DIDRegistry.sol` – register & resolve DIDs.
    - `AccessControl.sol` – grant/revoke data access.
    - `Recovery.sol` – manage guardians & recovery.
4. Deploy to Sepolia testnet.
5. Save ABIs and addresses to `backend/config/contracts.json`.

Deliverable: Verified smart contracts + working deployment script.

---

### ⚡ Day 2 – Backend API & IPFS

**Goal:** Create a minimal backend for credentials.

Tasks:

1. Initialize Express backend.
2. Add routes:
    - `/api/credentials/issue` – sign VC JSON.
    - `/api/credentials/verify` – verify VC signature.
    - `/api/ipfs/upload` – upload to IPFS.
    - `/api/email/notify` – send guardian recovery emails.
3. Integrate IPFS client.
4. Implement crypto signing (tweetnacl).
5. Store temporary credentials in `data/issued.json`.

Deliverable: Working backend APIs tested via Postman.

---

### 🖥️ Day 3 – Frontend (Next.js UI)

**Goal:** Build wallet UI connected to blockchain.

Tasks:

1. Initialize Next.js + Tailwind.
2. Setup `wagmi` + `web3modal` for wallet connect.
3. Create pages:
    - `/wallet` – DID info & guardians.
    - `/credentials` – issue/view credentials.
    - `/recovery` – manage guardians & recovery.
4. Add AES-GCM encryption for local wallet storage.
5. Integrate backend APIs and display credential data.

Deliverable: Running Next.js app with wallet connection.

---

### 🔐 Day 4 – Integration & Testing

**Goal:** End-to-end integration & polish.

Tasks:

1. Connect frontend ↔ backend ↔ contracts.
2. Test DID registration, credential issuance, and recovery.
3. Implement 2-of-3 guardian recovery demo.
4. Add simple branding (college name/logo).
5. Document usage and screenshots in `/docs/README.md`.

Deliverable: Functional SSI Wallet prototype ready for submission.

---

## ✅ Success Criteria

- DIDs can be registered and fetched from blockchain.
- Verifiable credentials issued and verified successfully.
- Access control for credentials functional.
- Social recovery demo works with guardian flow.
- Data encrypted locally.
- End-to-end working demo using testnet.

---

## 🧰 Optional Enhancements

- QR-based credential verification.
- Multi-wallet support.
- Dynamic guardian threshold.

---

## 🧩 Quick Commands

```bash
# Contracts
cd contracts && npx hardhat compile && npx hardhat run scripts/deploy.js --network sepolia

# Backend
cd backend && node server.js

# Frontend
cd frontend && npm run dev
```

---

## Decentralized Identity Management System (Course Project)

This project implements a Self-Sovereign Identity (SSI) platform where individuals can own, manage, and verify their digital identity using the blockchain technology. It follows W3C standards for Decentralized Identifiers (DIDs) and Verifiable Credentials (VCs), ensuring privacy, security, and decentralization.

### Core Features

- [ ] Self-Sovereign Identity (SSI): Users own and control their identity without central authorities.
- [ ] Verifiable Credentials (VCs): Institutions issue signed digital credentials verifiable via blockchain.
- [ ] Social Recovery Mechanism: Guardians help recover access if private keys are lost.
- [ ] Decentralized Access Control: Smart contract–based permission management.
- [ ] Optional Email Integration for recovery notifications.

### Architecture Overview

The system follows a modular architecture combining blockchain smart contracts, a frontend dApp, and a lightweight backend API.

|        Layer        | Technology / Protocol                                 |
| :-----------------: | :---------------------------------------------------- |
| **Identity (DIDs)** | W3C Decentralized Identifiers                         |
|   **Credentials**   | W3C Verifiable Credentials                            |
|   **Blockchain**    | Solidity Smart Contracts + EIP-1056 DID Registry      |
|  **Cryptography**   | SHA-256 (hash), Ed25519 / secp256k1 (signatures)      |
| **Social Recovery** | Multisig (t-of-n) Recovery Contract                   |
| **Access Control**  | Smart contract–based permission mapping               |
|    **Frontend**     | Next.js + wagmi/viem + web3modal                      |
|     **Backend**     | Express.js (API, email)                               |
|     **Storage**     | IPFS for PDFs, LocalStorage/IndexedDB for wallet data |
|  **RPC Provider**   | Infura                                                |
|     **Crypto**      | Node.js crypto / tweetnacl for encryption and signing |

### Data Storage Design

User identity and credential data is stored locally in the user’s wallet (browser storage), while blockchain stores only hashes and access permissions for privacy.

Wallet JSON Structure includes: DID info, Verifiable Credentials (JSON-LD), Access Control settings, and Recovery Guardians.  
Sensitive data is encrypted locally using AES-GCM derived from user password or private key.

### Smart Contracts

DIDRegistry.sol – register and resolve decentralized identifiers.  
AccessControl.sol – manage granular data access permissions.  
Recovery.sol – implement social recovery using guardian approvals.

### 6. Functionality Achieved

- [ ] Create and register DIDs on-chain.
- [ ] Issue and verify digital credentials (VCs).
- [ ] Grant/revoke access via smart contracts.
- [ ] Recover accounts through t-of-n guardian approval.
- [ ] Optional integration with email recovery notifications.

### Project Setup Summary

1. Install dependencies: npm install (Express, Hardhat, Next.js, ethers.js).
2. Compile & deploy smart contracts using Hardhat.
3. Configure backend routes for credential issuance and recovery.
4. Connect frontend wallet (MetaMask) via web3modal.
5. Store credentials securely in localStorage or IndexedDB.

### Data Storage Summary

| Data Type                 | Location                 | Format      | Encryption |
| :------------------------ | :----------------------- | :---------- | :--------- |
| **DID Document**          | Blockchain / IPFS        | JSON        | Public     |
| **Verifiable Credential** | LocalStorage / IndexedDB | JSON-LD     | AES-GCM    |
| **PDF / Attachments**     | IPFS                     | File + Hash | Optional   |
| **Access Control**        | Blockchain               | Mapping     | Public     |
| **Recovery Config**       | Blockchain               | Struct      | Public     |
| **Guardian Metadata**     | Backend (Express)        | JSON        | Optional   |

### Example Wallet JSON Layout

```json
{
    "user": {
        "did": "did:ethr:0x1234abcd...",
        "walletAddress": "0x1234abcd...",
        "publicKey": "0x04bfc1a7...",
        "encryptionKey": "base64:a3f0c2..."
    },
    "credentials": [
        {
            "id": "urn:uuid:b21c3f45...",
            "type": ["VerifiableCredential", "UniversityDegreeCredential"],
            "issuer": "did:ethr:0xABCD1234...",
            "credentialSubject": {
                "id": "did:ethr:0xUSER1234...",
                "degree": {
                    "type": "BachelorDegree",
                    "name": "B.Sc. Computer Science"
                }
            },
            "evidence": {
                "fileCID": "bafybeid5...",
                "fileHash": "0x8f3b5d...",
                "fileName": "DegreeCertificate.pdf"
            },
            "proof": {
                "type": "EcdsaSecp256k1Signature2019",
                "created": "2025-10-27T14:21:00Z",
                "verificationMethod": "did:ethr:0xABCD1234#key-1",
                "proofPurpose": "assertionMethod",
                "jws": "eyJhbGciOiJFUzI1NiIs..."
            }
        }
    ],
    "accessControl": {
        "permissions": [
            {
                "field": "degree",
                "grantedTo": "did:ethr:0xVerifier...",
                "status": true
            }
        ]
    },
    "recovery": {
        "guardians": [
            { "did": "did:ethr:0xGuardianA...", "email": "alice@example.com" },
            { "did": "did:ethr:0xGuardianB...", "email": "bob@example.com" }
        ],
        "threshold": 2,
        "active": true
    }
}
```
