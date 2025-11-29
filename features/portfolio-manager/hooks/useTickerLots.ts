import { useState, useEffect } from 'react';
import type { TickerLot, LotFormData } from '../types';
import { useAmplifyClient } from './useAmplifyClient';

/**
 * Custom hook for managing ticker lots with real-time synchronization
 * Handles CRUD operations and subscribes to real-time updates from Amplify
 */
export function useTickerLots() {
  const client = useAmplifyClient();
  const [lots, setLots] = useState<TickerLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Setup real-time subscription
  useEffect(() => {
    const subscription = client.models.TickerLot.observeQuery().subscribe({
      next: ({ items }) => {
        const tickerLots: TickerLot[] = items
          .filter((item) => item !== null)
          .map((item) => ({
            id: item.id,
            ticker: item.ticker,
            shares: item.shares,
            costPerShare: item.costPerShare,
            purchaseDate: item.purchaseDate,
            portfolios: (item.portfolios ?? ['Default']).filter((p): p is string => p !== null),
            calculateAccumulatedProfitLoss: item.calculateAccumulatedProfitLoss ?? true,
            baseYield: item.baseYield ?? 0,
            notes: item.notes ?? '',
            totalCost: item.totalCost ?? item.shares * item.costPerShare,
            createdAt: item.createdAt ?? undefined,
            updatedAt: item.updatedAt ?? undefined,
            owner: item.owner ?? undefined,
          }));
        setLots(tickerLots);
        setLoading(false);
      },
      error: (err: Error) => {
        console.error('TickerLot subscription error:', err);
        setError('Failed to sync lot data');
      },
    });

    return () => subscription.unsubscribe();
  }, [client]);

  /**
   * Load lots from the backend
   */
  const loadLots = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, errors } = await client.models.TickerLot.list();

      if (errors) {
        console.error('Load errors:', errors);
        setError('Failed to load lots');
      } else {
        const tickerLots: TickerLot[] = data
          .filter((item) => item !== null)
          .map((item) => ({
            id: item.id,
            ticker: item.ticker,
            shares: item.shares,
            costPerShare: item.costPerShare,
            purchaseDate: item.purchaseDate,
            portfolios: (item.portfolios ?? ['Default']).filter((p): p is string => p !== null),
            calculateAccumulatedProfitLoss: item.calculateAccumulatedProfitLoss ?? true,
            baseYield: item.baseYield ?? 0,
            notes: item.notes ?? '',
            totalCost: item.totalCost ?? item.shares * item.costPerShare,
            createdAt: item.createdAt ?? undefined,
            updatedAt: item.updatedAt ?? undefined,
            owner: item.owner ?? undefined,
          }));
        setLots(tickerLots);
      }
    } catch (err) {
      console.error('Load error:', err);
      setError('Failed to load lots');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save a lot (create new or update existing)
   */
  const saveLot = async (lotData: LotFormData, lotId?: string) => {
    try {
      const totalCost = lotData.shares * lotData.costPerShare;

      if (lotId) {
        await client.models.TickerLot.update({
          id: lotId,
          ticker: lotData.ticker,
          shares: lotData.shares,
          costPerShare: lotData.costPerShare,
          purchaseDate: lotData.purchaseDate,
          portfolios: lotData.portfolios,
          calculateAccumulatedProfitLoss: lotData.calculateAccumulatedProfitLoss,
          notes: lotData.notes,
          totalCost,
        });
      } else {
        await client.models.TickerLot.create({
          ticker: lotData.ticker,
          shares: lotData.shares,
          costPerShare: lotData.costPerShare,
          purchaseDate: lotData.purchaseDate,
          portfolios: lotData.portfolios,
          calculateAccumulatedProfitLoss: lotData.calculateAccumulatedProfitLoss,
          notes: lotData.notes,
          totalCost,
        });
      }

      await loadLots();
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save lot');
      throw err;
    }
  };

  /**
   * Delete a single lot by ID
   */
  const deleteLot = async (id: string) => {
    try {
      await client.models.TickerLot.delete({ id });
      await loadLots();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete lot');
      throw err;
    }
  };

  /**
   * Delete multiple lots by ID
   */
  const deleteSelected = async (ids: string[]) => {
    try {
      for (const id of ids) {
        await client.models.TickerLot.delete({ id });
      }
      await loadLots();
    } catch (err) {
      console.error('Bulk delete error:', err);
      setError('Failed to delete selected lots');
      throw err;
    }
  };

  /**
   * Refresh lots from backend
   */
  const refresh = loadLots;

  return {
    lots,
    loading,
    error,
    saveLot,
    deleteLot,
    deleteSelected,
    refresh,
  };
}
