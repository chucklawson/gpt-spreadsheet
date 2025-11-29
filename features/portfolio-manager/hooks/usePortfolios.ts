import { useState, useEffect } from 'react';
import type { Portfolio } from '../types';
import { useAmplifyClient } from './useAmplifyClient';

/**
 * Custom hook for managing portfolios with real-time synchronization
 * Handles CRUD operations and initialization of default portfolio
 */
export function usePortfolios() {
  const client = useAmplifyClient();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);

  // Setup real-time subscription
  useEffect(() => {
    const subscription = client.models.Portfolio.observeQuery().subscribe({
      next: ({ items }) => {
        const portfolioList: Portfolio[] = items.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description ?? '',
          createdAt: item.createdAt ?? undefined,
          updatedAt: item.updatedAt ?? undefined,
          owner: item.owner ?? undefined,
        }));
        setPortfolios(portfolioList);
      },
      error: (err: Error) => console.error('Portfolio subscription error:', err),
    });

    return () => subscription.unsubscribe();
  }, [client]);

  /**
   * Initialize default portfolio and migrate old data
   * Creates a "Default" portfolio if it doesn't exist
   * Migrates lots from old single-portfolio format to array format
   */
  const initializeDefault = async () => {
    try {
      const { data } = await client.models.Portfolio.list();
      const defaultExists = data.some(p => p && p.name === 'Default');

      if (!defaultExists) {
        await client.models.Portfolio.create({
          name: 'Default',
          description: 'Default portfolio for existing lots',
        });
      }

      // Migrate existing lots to portfolios array format
      const { data: lots } = await client.models.TickerLot.list();
      for (const lot of lots) {
        if (lot) {
          // Case 1: Lot has no portfolios field (very old data)
          if (!lot.portfolios && !(lot as any).portfolio) {
            await client.models.TickerLot.update({
              id: lot.id,
              portfolios: ['Default'],
            });
          }
          // Case 2: Lot has old 'portfolio' string field (needs migration)
          else if ((lot as any).portfolio && !lot.portfolios) {
            await client.models.TickerLot.update({
              id: lot.id,
              portfolios: [(lot as any).portfolio],
            });
          }
          // Case 3: Lot already has portfolios array (no action needed)
        }
      }
    } catch (err) {
      console.error('Default portfolio initialization error:', err);
    }
  };

  /**
   * Load portfolios from backend
   */
  const loadPortfolios = async () => {
    try {
      const { data, errors } = await client.models.Portfolio.list();
      if (errors) {
        console.error('Portfolio load errors:', errors);
      } else {
        const portfolioList: Portfolio[] = data.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description ?? '',
          createdAt: item.createdAt ?? undefined,
          updatedAt: item.updatedAt ?? undefined,
          owner: item.owner ?? undefined,
        }));
        setPortfolios(portfolioList);
      }
    } catch (err) {
      console.error('Portfolio load error:', err);
    }
  };

  /**
   * Create a new portfolio
   */
  const createPortfolio = async (name: string, description: string) => {
    await client.models.Portfolio.create({ name, description });
  };

  /**
   * Delete a portfolio by ID and name
   * Removes the portfolio from all lots that reference it
   * If a lot would have no portfolios after removal, assigns it to "Default"
   */
  const deletePortfolio = async (id: string, name: string) => {
    // Get lots in this portfolio
    const { data: lots } = await client.models.TickerLot.list();
    const lotsInPortfolio = lots.filter(lot =>
      lot.portfolios && lot.portfolios.includes(name)
    );

    // Update lots to remove this portfolio
    for (const lot of lotsInPortfolio) {
      const updatedPortfolios = lot.portfolios.filter(p => p !== name);

      // If lot would have no portfolios, assign to Default
      if (updatedPortfolios.length === 0) {
        updatedPortfolios.push('Default');
      }

      await client.models.TickerLot.update({
        id: lot.id,
        portfolios: updatedPortfolios,
      });
    }

    // Then delete the portfolio
    await client.models.Portfolio.delete({ id });
  };

  return {
    portfolios,
    initializeDefault,
    loadPortfolios,
    createPortfolio,
    deletePortfolio,
  };
}
