/**
 * Real API Service for ShieldNet
 * Connects to FastAPI backend running on localhost:8000
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

// API Base URL - can be configured via environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Analyze an invoice file using the backend AI
 */
export const analyzeInvoice = async (invoiceFile: File): Promise<InvoiceAnalysisResult> => {
  const formData = new FormData();
  formData.append('file', invoiceFile);

  const response = await fetch(`${API_BASE_URL}/api/invoices/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to analyze invoice' }));
    throw new Error(error.detail || 'Failed to analyze invoice');
  }

  return response.json();
};

/**
 * Analyze invoice with streaming progress updates
 */
export const analyzeInvoiceStreaming = async (
  invoiceFile: File,
  onProgress: (update: any) => void
): Promise<InvoiceAnalysisResult> => {
  const formData = new FormData();
  formData.append('file', invoiceFile);

  const response = await fetch(`${API_BASE_URL}/api/invoices/analyze/stream`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to start analysis');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('No response body');
  }

  let result: InvoiceAnalysisResult | null = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          onProgress(data);

          if (data.type === 'complete') {
            result = data.result as InvoiceAnalysisResult;
          }

          if (data.type === 'error') {
            throw new Error(data.message);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  if (!result) {
    throw new Error('Analysis did not complete');
  }

  return result;
};

/**
 * Get threat analytics from the backend
 */
export const getThreatAnalytics = async (): Promise<ThreatAnalytics> => {
  const response = await fetch(`${API_BASE_URL}/api/threats/analytics`);

  if (!response.ok) {
    throw new Error('Failed to fetch threat analytics');
  }

  return response.json();
};

/**
 * Get all transactions from the backend
 */
export const getTransactions = async (): Promise<Transaction[]> => {
  const response = await fetch(`${API_BASE_URL}/api/transactions`);

  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }

  return response.json();
};

/**
 * Get wallet balance from the backend
 */
export const getWalletBalance = async (): Promise<WalletBalance> => {
  const response = await fetch(`${API_BASE_URL}/api/wallet/balance`);

  if (!response.ok) {
    throw new Error('Failed to fetch wallet balance');
  }

  return response.json();
};

/**
 * Report a threat to the ShieldNet network
 */
export const reportThreat = async (threatData: {
  invoiceId: string;
  vendor: string;
  fraudScore: number;
  reason: string;
  amount: number;
}): Promise<{ success: boolean; threatId: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/threats/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(threatData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to report threat' }));
    throw new Error(error.detail || 'Failed to report threat');
  }

  return response.json();
};

/**
 * Health check to verify backend is running
 */
export const healthCheck = async (): Promise<{ status: string; api_key_configured: boolean }> => {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error('Backend is not responding');
  }

  return response.json();
};
