// ============================================
// FILE: src/types/index.ts
// ============================================
export interface TickerLot {
  id: string;
  ticker: string;
  shares: number;
  costPerShare: number;
  purchaseDate: string;
  notes?: string;
  totalCost: number;
  createdAt?: string;
  updatedAt?: string;
  owner?: string;
}

export interface TickerSummary {
  ticker: string;
  totalShares: number;
  totalCost: number;
  averageCostPerShare: number;
  lotCount: number;
  earliestPurchase: string;
  latestPurchase: string;
}

export interface LotFormData {
  ticker: string;
  shares: number;
  costPerShare: number;
  purchaseDate: string;
  notes: string;
}
