# ShieldNet - AI Fraud Detection for Payments

**A shared fraud-detection network for AI-driven payments**

ShieldNet is a multi-agent fraud and risk layer that sits in front of your wallet, analyzing every invoice before USDC moves. When fraud is detected, the threat fingerprint is shared anonymously across the network—and early detectors earn rewards.

## What is ShieldNet?

ShieldNet provides:
- **Multi-agent invoice verification** - AI agents parse invoices, verify against POs and contracts, check hours vs. logs, and query the network
- **Treasury protection** - Locus-powered USDC payments only execute after verification passes
- **Network intelligence** - Blocked threats are shared across the network; when others use your intel, you earn micro-rewards
- **Threat analytics** - Track fraud patterns, vendor risks, and total USDC protected

Think of it as a **shared immune system for AI payments**.

## Frontend Overview

The ShieldNet UI provides three main views:

### 1. Invoice Protection Platform
- **Upload & analyze invoices** - Drag-and-drop invoice files (PDF, PNG, JPG)
- **Real-time fraud detection** - Get instant decisions: Approved, Hold, or Blocked
- **Decision details** - View confidence scores, fraud scores, local checks (PO match, hours verification), and network signals
- **Treasury wallet** - See USDC balance, auto-paid amounts, and recent transaction activity

### 2. Threat Analytics Dashboard
- **Network-wide threat intelligence** - View all blocked threats with fraud scores and detection details
- **Rewards tracking** - Monitor earnings from shared threat intelligence
- **Fraud patterns** - See vendor patterns, template hashes, and times threats were seen across the network

### 3. Treasury Management
- **USDC wallet balance** - Track available funds for payments
- **Transaction history** - View paid, held, and blocked invoices with reasons
- **Monthly summaries** - See auto-paid vs. blocked amounts

## Tech Stack

- **React** + **TypeScript** - Modern component architecture
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** + **shadcn/ui** - Beautiful, accessible UI components
- **Mock API layer** - `/src/services/mockApi.ts` ready for backend integration

## How to Run

### Prerequisites
- Node.js & npm installed ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

### Installation & Running

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>
cd ShieldNet

# Step 2: Install dependencies
npm install

# Step 3: Start the development server
npm run dev
```

The app will be available at **http://localhost:8080/**

## Key Files & Components

### New Components Created

1. **`src/components/InvoiceAnalysis.tsx`**
   - Upload invoice files
   - Display decision banner (Approved/Hold/Blocked)
   - Show confidence & fraud scores
   - Display local security checks (PO match, hours verification, vendor trust)
   - Show network signals (flagged by others, seen in network)
   - Automatically reports blocked threats to network

2. **`src/components/ThreatAnalytics.tsx`**
   - Summary stats (threats blocked, fraud avoided, rewards earned)
   - List of detected threats with fraud scores and details
   - Network intelligence explanation
   - Wired to call `getThreatAnalytics()` from mock API

3. **`src/components/TreasuryPanel.tsx`**
   - USDC wallet balance display
   - Monthly payment summaries (auto-paid vs. blocked)
   - Transaction history with status badges
   - Wired to call `getWalletBalance()` and `getTransactions()` from mock API

### Mock API Service

**`src/services/mockApi.ts`**
- Contains all mock data functions with TODO comments for backend integration
- Ready for backend - just replace mock functions with actual API calls

### Updated Components

**`src/pages/Index.tsx`**
- Updated hero section with ShieldNet messaging
- Changed tab labels to "Invoice Protection" and "Threat Analytics"
- Replaced trading panels with InvoiceAnalysis and TreasuryPanel
- Updated feature descriptions to reflect fraud detection story

## Using the Application

### 1. Analyze an Invoice
- Go to **Invoice Protection** tab
- Upload a file (PDF, PNG, JPG)
- Click **"Analyze Invoice"**
- View decision: Approved, Hold, or Blocked
- See detailed checks and network signals

### 2. View Threat Analytics
- Click **Threat Analytics** tab
- See summary stats and rewards earned
- Review detailed threat list with fraud scores

### 3. Monitor Treasury
- Right panel shows USDC balance
- View transaction history with statuses
- See monthly summaries

## Design Philosophy

The UI preserves the existing visual style while transforming the content:

- ✅ Kept existing card components and layout structure
- ✅ Maintained Tailwind styling and color system
- ✅ Preserved animations and hover effects
- ✅ Updated only the text, icons, and data flows
- ✅ Added new components that match the existing design language

## Backend Integration

The mock API service (`src/services/mockApi.ts`) is ready for backend integration. Replace mock functions with real API calls to:

- `POST /api/invoices/analyze` - Analyze invoice and return decision
- `GET /api/threats/analytics` - Get threat analytics data
- `GET /api/transactions` - Get transaction history
- `POST /api/threats/report` - Report blocked threat to network
- `GET /api/wallet/balance` - Get USDC wallet balance

Each function has TODO comments indicating where to add real backend calls.

## Deployment

```sh
# Build for production
npm run build

# Preview production build
npm run preview
```

Deploy the `dist/` folder to your hosting provider (Vercel, Netlify, AWS, etc.)
