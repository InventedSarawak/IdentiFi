# SSI Wallet Development Todo - 4 Day Plan

## Overview

A focused 4-day plan to build a working SSI Wallet prototype for college project submission. Prioritizes core functionality over scalability.

---

## Day 1 - Setup & Smart Contracts

### Goal: Get blockchain contracts working

#### Task 1.1: Project Setup

- [ ] Create main project folders: `/contracts`, `/backend`, `/frontend`, `/scripts`, `/docs`
- [ ] Initialize Git repository
- [ ] Create `.gitignore` for Node.js and Hardhat
- [ ] Setup basic README structure

#### Task 1.2: Hardhat Environment

- [ ] Initialize Hardhat project in `/contracts`
- [ ] Install dependencies: `hardhat`, `@nomicfoundation/hardhat-toolbox`, `@openzeppelin/contracts`
- [ ] Configure `hardhat.config.js` for Sepolia testnet
- [ ] Get Sepolia ETH from faucet
- [ ] Setup Infura RPC provider

#### Task 1.3: Smart Contract Development

- [ ] Create `DIDRegistry.sol` - register and resolve DIDs
- [ ] Create `AccessControl.sol` - grant/revoke data access permissions
- [ ] Create `Recovery.sol` - manage guardians and recovery process
- [ ] Add basic events and error handling
- [ ] Write simple unit tests

#### Task 1.4: Contract Deployment

- [ ] Create deployment script `scripts/deploy.js`
- [ ] Deploy all contracts to Sepolia testnet
- [ ] Verify contracts on Etherscan
- [ ] Save contract addresses and ABIs to `backend/config/contracts.json`

**Day 1 Deliverable:** Verified smart contracts deployed on testnet with saved ABIs

---

## Day 2 - Backend API & IPFS

### Goal: Create minimal backend for credentials

#### Task 2.1: Express Backend Setup

- [ ] Initialize Node.js project in `/backend`
- [ ] Install dependencies: `express`, `cors`, `dotenv`, `ipfs-http-client`, `tweetnacl`, `nodemailer`
- [ ] Create basic server structure with middleware
- [ ] Setup environment variables
- [ ] Create `data/` folder for temporary storage

#### Task 2.2: Credential API Routes

- [ ] `POST /api/credentials/issue` - sign and issue VC JSON
- [ ] `POST /api/credentials/verify` - verify VC signature
- [ ] `GET /api/credentials/:id` - fetch credential by ID
- [ ] Add JSON schema validation for VCs
- [ ] Test routes with Postman

#### Task 2.3: IPFS Integration

- [ ] `POST /api/ipfs/upload` - upload files to IPFS
- [ ] `GET /api/ipfs/:cid` - retrieve files from IPFS
- [ ] Add file hash verification
- [ ] Test with PDF uploads

#### Task 2.4: Recovery & Email

- [ ] `POST /api/recovery/initiate` - start recovery process
- [ ] `POST /api/recovery/approve` - guardian approval
- [ ] `POST /api/email/notify` - send guardian emails
- [ ] Setup nodemailer configuration
- [ ] Create email templates

**Day 2 Deliverable:** Working backend APIs tested via Postman

---

## Day 3 - Frontend (Next.js UI)

### Goal: Build wallet UI connected to blockchain

#### Task 3.1: Next.js Setup

- [ ] Initialize Next.js project in `/frontend`
- [ ] Install dependencies: `wagmi`, `viem`, `@web3modal/wagmi`, `@tanstack/react-query`, `tailwindcss`
- [ ] Configure Tailwind CSS
- [ ] Setup basic layout and routing
- [ ] Configure wagmi and web3modal

#### Task 3.2: Wallet Connection

- [ ] Create wallet connection component
- [ ] Add MetaMask integration
- [ ] Handle network switching to Sepolia
- [ ] Display connected account info
- [ ] Add disconnect functionality

#### Task 3.3: Core Pages

- [ ] `/wallet` - DID info, guardians, recovery status
- [ ] `/credentials` - view, issue, and manage credentials
- [ ] `/recovery` - guardian management and recovery initiation
- [ ] Add navigation between pages
- [ ] Implement responsive design

#### Task 3.4: Local Storage & Encryption

- [ ] Create wallet data structure (as per README example)
- [ ] Implement AES-GCM encryption/decryption
- [ ] Store encrypted wallet data in localStorage
- [ ] Add export/import wallet functionality

#### Task 3.5: Backend Integration

- [ ] Connect to backend APIs
- [ ] Display credential data from backend
- [ ] Handle IPFS file uploads/downloads
- [ ] Show real-time contract data

**Day 3 Deliverable:** Running Next.js app with wallet connection and basic functionality

---

## Day 4 - Integration & Testing

### Goal: End-to-end integration and polish

#### Task 4.1: Full Integration

- [ ] Connect frontend ↔ backend ↔ smart contracts
- [ ] Test complete DID registration flow
- [ ] Test credential issuance and verification
- [ ] Test access control grant/revoke
- [ ] Fix any integration issues

#### Task 4.2: Social Recovery Demo

- [ ] Implement complete 2-of-3 guardian recovery flow
- [ ] Test guardian approval collection
- [ ] Test threshold validation
- [ ] Test key recovery and restoration
- [ ] Add email notifications

#### Task 4.3: User Experience

- [ ] Add loading states and error handling
- [ ] Improve UI/UX with better styling
- [ ] Add success/error notifications
- [ ] Add simple branding (college name/logo)
- [ ] Test on mobile devices

#### Task 4.4: Documentation & Testing

- [ ] Create `/docs/README.md` with usage instructions
- [ ] Add screenshots of working features
- [ ] Test all user flows end-to-end
- [ ] Record demo video (optional)
- [ ] Prepare presentation slides

**Day 4 Deliverable:** Functional SSI Wallet prototype ready for submission

---

## Success Criteria Checklist

- [ ] User can connect MetaMask wallet
- [ ] DIDs can be registered and fetched from blockchain
- [ ] Verifiable credentials can be issued with backend signatures
- [ ] Credentials can be verified cryptographically
- [ ] Access control permissions work (grant/revoke)
- [ ] Social recovery demo works with 2-of-3 guardians
- [ ] Wallet data is encrypted and stored locally
- [ ] IPFS integration works for document storage
- [ ] All components work together end-to-end
- [ ] Demo runs successfully on Sepolia testnet

---

## Optional Enhancements (if time permits)

- [ ] QR code generation for credential sharing
- [ ] QR code scanner for verification
- [ ] Multiple credential types support
- [ ] Batch operations
- [ ] Advanced UI animations

---

## Emergency Backup Plan (if running behind)

**Minimum Viable Demo:**

1. Simple DID registration (just store on contract)
2. Basic credential JSON display (skip crypto verification)
3. Guardian list management (skip email recovery)
4. Static frontend with hardcoded data

**Focus on:** Core functionality over polish, working demo over perfect code.

---

## Daily Stand-up Questions

**Daily Check:**

1. What did I complete yesterday?
2. What will I work on today?
3. Any blockers or issues?
4. Am I on track for the day's deliverable?

**Keep momentum, stay focused, ship working software!**
