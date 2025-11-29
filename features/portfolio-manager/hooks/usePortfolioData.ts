import { useMemo, useEffect } from 'react';
import { useTickerLots } from './useTickerLots';
import { usePortfolios } from './usePortfolios';
import { useTickers } from './useTickers';
import { calculateTickerSummaries } from '../utils/tickerCalculations';

/**
 * Orchestrator hook that combines all portfolio data management hooks
 * Provides a unified API for accessing lots, portfolios, tickers, and calculated summaries
 * This is the primary hook that components should use for portfolio data
 */
export function usePortfolioData() {
  const {
    lots,
    loading: lotsLoading,
    error,
    saveLot,
    deleteLot,
    deleteSelected,
    refresh
  } = useTickerLots();

  const {
    portfolios,
    initializeDefault,
    loadPortfolios,
    createPortfolio,
    deletePortfolio
  } = usePortfolios();

  const {
    tickers,
    loadTickers,
    updateTicker
  } = useTickers();

  // Calculate summaries whenever lots or tickers change
  const summaries = useMemo(
    () => calculateTickerSummaries(lots, tickers),
    [lots, tickers]
  );

  // Initialize default portfolio on mount
  useEffect(() => {
    initializeDefault();
  }, []);

  const loading = lotsLoading; // Can combine multiple loading states if needed

  return {
    // Data
    lots,
    tickers,
    summaries,
    portfolios,
    loading,
    error,

    // Lot operations
    saveLot,
    deleteLot,
    deleteSelected,
    refresh,

    // Ticker operations
    updateTicker,

    // Portfolio operations
    createPortfolio,
    deletePortfolio,
  };
}
