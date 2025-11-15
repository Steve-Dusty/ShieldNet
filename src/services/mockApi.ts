/**
 * Mock API Service for ShieldNet
 * 
 * TODO: Replace these mock functions with real API calls to the backend
 * Backend endpoints:
 * - POST /api/invoices/analyze
 * - GET /api/threats/analytics
 * - GET /api/transactions
 * - POST /api/threats/report
 * - GET /api/wallet/balance
 */

export type InvoiceStatus = 'approved' | 'hold' | 'blocked';

export interface LocalCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  detail: string;
}

export interface NetworkSignal {
  type: 'flagged' | 'seen' | 'clean';
  description: string;
}

export interface InvoiceAnalysisResult {
  invoiceId: string;
  status: InvoiceStatus;
  confidence: number; // 0-100
  fraudScore: number; // 0-100
  localChecks: LocalCheck[];
  networkSignals: NetworkSignal[];
  explanation: string;
  vendor: string;
  amount: number;
  currency: string;
}

export interface ThreatRecord {
  id: string;
  vendor: string;
  fraudScore: number;
  firstSeen: string;
  timesSeen: number;
  reason: string;
  amountBlocked: number;
  templateHash?: string;
}

export interface ThreatAnalytics {
  totalBlockedAmount: number;
  totalBlockedInvoices: number;
  totalThreatsDetected: number;
  rewardsEarned: number;
  threats: ThreatRecord[];
}

export interface Transaction {
  id: string;
  status: 'paid' | 'held' | 'blocked';
  vendor: string;
  amount: number;
  currency: string;
  date: string;
  reason?: string;
  invoiceId: string;
}

export interface WalletBalance {
  balance: number;
  currency: string;
  autoPaidThisMonth: number;
  blockedThisMonth: number;
}

// TODO: Replace with actual API call
export const analyzeInvoice = async (invoiceFile: File | null, invoiceData?: any): Promise<InvoiceAnalysisResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock response - in real implementation, this would call POST /api/invoices/analyze
  const mockResults: InvoiceAnalysisResult[] = [
    {
      invoiceId: 'INV-2024-001',
      status: 'approved',
      confidence: 96,
      fraudScore: 8,
      vendor: 'CloudHosting Inc.',
      amount: 2450.00,
      currency: 'USDC',
      localChecks: [
        { name: 'PO Match', status: 'pass', detail: 'Matches PO-7781' },
        { name: 'Hours Verification', status: 'pass', detail: 'Logged hours: 82h, Invoice: 80h' },
        { name: 'Vendor Trust', status: 'pass', detail: 'Trusted vendor, 24 previous payments' },
      ],
      networkSignals: [
        { type: 'clean', description: 'No similar scams seen in ShieldNet' },
        { type: 'seen', description: 'Vendor seen 47 times across network' },
      ],
      explanation: 'Invoice matches PO-7781 and logged hours; no similar scams seen in ShieldNet.',
    },
    {
      invoiceId: 'INV-2024-002',
      status: 'blocked',
      confidence: 94,
      fraudScore: 87,
      vendor: 'QuickDesign Studio',
      amount: 8500.00,
      currency: 'USDC',
      localChecks: [
        { name: 'PO Match', status: 'fail', detail: 'No matching PO found' },
        { name: 'Hours Verification', status: 'fail', detail: 'Invoice hours exceed logs by 100%' },
        { name: 'Vendor Trust', status: 'warning', detail: 'New vendor, first invoice' },
      ],
      networkSignals: [
        { type: 'flagged', description: 'Flagged by 2 other companies in last 30 days' },
        { type: 'flagged', description: 'Similar template seen in 5 fraud cases' },
      ],
      explanation: 'Invoice hours exceed logs by 100%; similar template flagged as fraud by other agents.',
    },
    {
      invoiceId: 'INV-2024-003',
      status: 'hold',
      confidence: 78,
      fraudScore: 42,
      vendor: 'DataAnalytics Pro',
      amount: 5200.00,
      currency: 'USDC',
      localChecks: [
        { name: 'PO Match', status: 'pass', detail: 'Matches PO-7812' },
        { name: 'Hours Verification', status: 'warning', detail: 'Hours mismatch: 15% over estimate' },
        { name: 'Vendor Trust', status: 'pass', detail: 'Trusted vendor, 8 previous payments' },
      ],
      networkSignals: [
        { type: 'clean', description: 'No flags from network' },
        { type: 'seen', description: 'Vendor seen 12 times this quarter' },
      ],
      explanation: 'Minor hours mismatch detected. Manual review recommended before payment.',
    },
  ];
  
  // Return a random result for demo purposes
  return mockResults[Math.floor(Math.random() * mockResults.length)];
};

// TODO: Replace with actual API call
export const getThreatAnalytics = async (): Promise<ThreatAnalytics> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock response - in real implementation, this would call GET /api/threats/analytics
  return {
    totalBlockedAmount: 1247500,
    totalBlockedInvoices: 2847,
    totalThreatsDetected: 156,
    rewardsEarned: 3450,
    threats: [
      {
        id: 'THR-001',
        vendor: 'QuickDesign Studio',
        fraudScore: 87,
        firstSeen: '2024-10-15',
        timesSeen: 5,
        reason: 'Invoice template matches known fraud pattern',
        amountBlocked: 42500,
        templateHash: 'a3f8d9c2...',
      },
      {
        id: 'THR-002',
        vendor: 'TechSupport Global',
        fraudScore: 92,
        firstSeen: '2024-10-20',
        timesSeen: 8,
        reason: 'Hours inflate by 150% compared to logs',
        amountBlocked: 67800,
        templateHash: 'b7e2c1a9...',
      },
      {
        id: 'THR-003',
        vendor: 'Marketing Plus LLC',
        fraudScore: 78,
        firstSeen: '2024-10-28',
        timesSeen: 3,
        reason: 'No PO match, suspicious vendor address',
        amountBlocked: 23400,
      },
      {
        id: 'THR-004',
        vendor: 'DevConsulting Inc.',
        fraudScore: 85,
        firstSeen: '2024-11-02',
        timesSeen: 4,
        reason: 'Duplicate invoice pattern detected',
        amountBlocked: 31200,
        templateHash: 'c9d4e6f1...',
      },
      {
        id: 'THR-005',
        vendor: 'CloudServices XYZ',
        fraudScore: 81,
        firstSeen: '2024-11-08',
        timesSeen: 6,
        reason: 'Vendor identity mismatch with payment details',
        amountBlocked: 45600,
      },
    ],
  };
};

// TODO: Replace with actual API call
export const getTransactions = async (): Promise<Transaction[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock response - in real implementation, this would call GET /api/transactions
  return [
    {
      id: 'TXN-001',
      status: 'paid',
      vendor: 'CloudHosting Inc.',
      amount: 2450.00,
      currency: 'USDC',
      date: '2024-11-14',
      invoiceId: 'INV-2024-087',
      reason: 'Auto-approved: All checks passed',
    },
    {
      id: 'TXN-002',
      status: 'blocked',
      vendor: 'QuickDesign Studio',
      amount: 8500.00,
      currency: 'USDC',
      date: '2024-11-13',
      invoiceId: 'INV-2024-086',
      reason: 'High fraud score (87/100)',
    },
    {
      id: 'TXN-003',
      status: 'paid',
      vendor: 'DataAnalytics Pro',
      amount: 3200.00,
      currency: 'USDC',
      date: '2024-11-12',
      invoiceId: 'INV-2024-085',
      reason: 'Auto-approved: PO match verified',
    },
    {
      id: 'TXN-004',
      status: 'held',
      vendor: 'Marketing Agency Co.',
      amount: 5200.00,
      currency: 'USDC',
      date: '2024-11-11',
      invoiceId: 'INV-2024-084',
      reason: 'PO mismatch: Manual review required',
    },
    {
      id: 'TXN-005',
      status: 'blocked',
      vendor: 'TechSupport Global',
      amount: 6700.00,
      currency: 'USDC',
      date: '2024-11-10',
      invoiceId: 'INV-2024-083',
      reason: 'Network flagged: Similar template in fraud cases',
    },
    {
      id: 'TXN-006',
      status: 'paid',
      vendor: 'DevOps Partners',
      amount: 4100.00,
      currency: 'USDC',
      date: '2024-11-09',
      invoiceId: 'INV-2024-082',
      reason: 'Auto-approved: Trusted vendor',
    },
  ];
};

// TODO: Replace with actual API call
export const getWalletBalance = async (): Promise<WalletBalance> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock response - in real implementation, this would call GET /api/wallet/balance
  return {
    balance: 48200,
    currency: 'USDC',
    autoPaidThisMonth: 34500,
    blockedThisMonth: 23400,
  };
};

// TODO: Replace with actual API call
export const reportThreat = async (threatData: {
  invoiceId: string;
  vendor: string;
  fraudScore: number;
  reason: string;
  amount: number;
}): Promise<{ success: boolean; threatId: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock response - in real implementation, this would call POST /api/threats/report
  console.log('Reporting threat to ShieldNet:', threatData);
  
  return {
    success: true,
    threatId: `THR-${Date.now()}`,
  };
};
