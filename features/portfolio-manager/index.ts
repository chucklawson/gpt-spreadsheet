// ============================================
// Portfolio Manager Feature - Public API
// ============================================

// Main page component (primary export)
export { PortfolioManagerPage } from './PortfolioManagerPage';
export type { PortfolioManagerPageProps } from './PortfolioManagerPage';

// Hooks (for advanced usage - consumers can use these to build custom UIs)
export { usePortfolioData } from './hooks/usePortfolioData';
export { useTickerLots } from './hooks/useTickerLots';
export { usePortfolios } from './hooks/usePortfolios';
export { useTickers } from './hooks/useTickers';
export { useAmplifyClient } from './hooks/useAmplifyClient';

// Types (for TypeScript consumers)
export type {
  Portfolio,
  Ticker,
  TickerLot,
  TickerSummary,
  LotFormData,
} from './types';

// Utils (for consumers who want to use calculations)
export { calculateTickerSummaries, getLotsForTicker } from './utils/tickerCalculations';
