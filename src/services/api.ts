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
  let buffer = ''; // Buffer for incomplete lines

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Decode chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });

      // Split by newlines but keep the last incomplete line in buffer
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep last incomplete line

      for (const line of lines) {
        if (line.trim().startsWith('data: ')) {
          try {
            const jsonStr = line.trim().slice(6);
            const data = JSON.parse(jsonStr);
            onProgress(data);

            if (data.type === 'complete') {
              result = data.result as InvoiceAnalysisResult;
            }

            if (data.type === 'error') {
              throw new Error(data.message);
            }
          } catch (e) {
            console.error('Failed to parse SSE line:', line, e);
          }
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim().startsWith('data: ')) {
      try {
        const data = JSON.parse(buffer.trim().slice(6));
        onProgress(data);
        if (data.type === 'complete') {
          result = data.result as InvoiceAnalysisResult;
        }
      } catch (e) {
        console.error('Failed to parse final SSE line:', buffer, e);
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
 * Get invoice analysis history
 */
export const getInvoiceHistory = async (): Promise<InvoiceAnalysisResult[]> => {
  const url = `${API_BASE_URL}/api/invoices/history`;
  console.log('getInvoiceHistory: Fetching from', url);

  try {
    const response = await fetch(url);
    console.log('getInvoiceHistory: Response status', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('getInvoiceHistory: Error response', errorText);
      throw new Error(`Failed to fetch invoice history: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('getInvoiceHistory: Success, got', data.length, 'invoices');
    return data;
  } catch (error) {
    console.error('getInvoiceHistory: Fetch error', error);
    throw error;
  }
};

/**
 * Get threat analytics from the backend
 */
export const getThreatAnalytics = async (): Promise<ThreatAnalytics> => {
  const url = `${API_BASE_URL}/api/threats/analytics`;
  console.log('getThreatAnalytics: Fetching from', url);

  try {
    const response = await fetch(url);
    console.log('getThreatAnalytics: Response status', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('getThreatAnalytics: Error response', errorText);
      throw new Error(`Failed to fetch threat analytics: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('getThreatAnalytics: Success', data);
    return data;
  } catch (error) {
    console.error('getThreatAnalytics: Fetch error', error);
    throw error;
  }
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
