import { useState, useEffect } from 'react';
import type { Ticker } from '../types';
import { useAmplifyClient } from './useAmplifyClient';

/**
 * Custom hook for managing ticker metadata with real-time synchronization
 * Handles ticker-level data like company name and base yield
 */
export function useTickers() {
  const client = useAmplifyClient();
  const [tickers, setTickers] = useState<Ticker[]>([]);

  // Setup real-time subscription
  useEffect(() => {
    const subscription = client.models.Ticker.observeQuery().subscribe({
      next: ({ items }) => {
        const tickerList: Ticker[] = items
          .filter(item => item !== null)
          .map((item) => ({
            id: item.id,
            symbol: item.symbol,
            companyName: item.companyName ?? '',
            baseYield: item.baseYield ?? 0,
            createdAt: item.createdAt ?? undefined,
            updatedAt: item.updatedAt ?? undefined,
            owner: item.owner ?? undefined,
          }));
        setTickers(tickerList);
      },
      error: (err: Error) => console.error('Ticker subscription error:', err),
    });

    return () => subscription.unsubscribe();
  }, [client]);

  /**
   * Load tickers from backend
   */
  const loadTickers = async () => {
    try {
      const { data, errors } = await client.models.Ticker.list();
      if (errors) {
        console.error('Ticker load errors:', errors);
      } else {
        const tickerList: Ticker[] = data
          .filter(item => item !== null)
          .map((item) => ({
            id: item.id,
            symbol: item.symbol,
            companyName: item.companyName ?? '',
            baseYield: item.baseYield ?? 0,
            createdAt: item.createdAt ?? undefined,
            updatedAt: item.updatedAt ?? undefined,
            owner: item.owner ?? undefined,
          }));
        setTickers(tickerList);
      }
    } catch (err) {
      console.error('Ticker load error:', err);
    }
  };

  /**
   * Update or create ticker metadata
   * Searches for existing ticker by symbol, updates if found, creates if not
   */
  const updateTicker = async (ticker: Ticker) => {
    try {
      // Check if ticker already exists
      const { data: existing } = await client.models.Ticker.list({
        filter: { symbol: { eq: ticker.symbol } }
      });

      if (existing && existing.length > 0) {
        // Update existing ticker
        await client.models.Ticker.update({
          id: existing[0].id,
          companyName: ticker.companyName,
          baseYield: ticker.baseYield,
        });
      } else {
        // Create new ticker
        await client.models.Ticker.create({
          symbol: ticker.symbol,
          companyName: ticker.companyName ?? '',
          baseYield: ticker.baseYield ?? 0,
        });
      }

      await loadTickers();
    } catch (err) {
      console.error('Error updating ticker:', err);
      throw err;
    }
  };

  return {
    tickers,
    loadTickers,
    updateTicker,
  };
}
