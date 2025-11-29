// ============================================
// FILE: src/App.tsx
// ============================================
import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import '@aws-amplify/ui-react/styles.css';
import {
  TrendingUp,
  DollarSign,
  Power,
  RefreshCw,
  Plus,
  Settings
} from 'lucide-react';
import type { TickerLot, TickerSummary, LotFormData, Portfolio, Ticker } from './types';
import { calculateTickerSummaries } from './utils/tickerCalculations';
import TickerSummarySpreadsheet from './components/TickerSummarySpreadsheet';
import TickerDetailModal from './components/TickerDetailModal';
import NewTickerModal from './components/NewTickerModal';
import PortfolioManager from './components/PortfolioManager';
import { Authenticator } from '@aws-amplify/ui-react';

interface AuthenticatorUser {
  signInDetails?: {
    loginId?: string;
  };
}

function MainApp({ signOut, user }: { signOut: () => void; user: AuthenticatorUser | undefined }) {
  const client = generateClient<Schema>();
  const [lots, setLots] = useState<TickerLot[]>([]);
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [summaries, setSummaries] = useState<TickerSummary[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [showPortfolioManager, setShowPortfolioManager] = useState(false);

  useEffect(() => {
    initializeDefaultPortfolio();
    loadLots();
    loadPortfolios();
    loadTickers();

    // Subscribe to real-time updates
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
        console.error('Subscription error:', err);
        setError('Failed to sync data');
      },
    });

    // Portfolio subscription
    const portfolioSub = client.models.Portfolio.observeQuery().subscribe({
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

    // Ticker subscription
    const tickerSub = client.models.Ticker.observeQuery().subscribe({
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

    return () => {
      subscription.unsubscribe();
      portfolioSub.unsubscribe();
      tickerSub.unsubscribe();
    };
  }, []);

  // Recalculate summaries whenever lots or tickers change
  useEffect(() => {
    setSummaries(calculateTickerSummaries(lots, tickers));
  }, [lots, tickers]);

  const initializeDefaultPortfolio = async () => {
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

  const handleSaveLot = async (lotData: LotFormData, lotId?: string) => {
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

  const handleDeleteLot = async (id: string) => {
    try {
      await client.models.TickerLot.delete({ id });
      await loadLots();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete lot');
      throw err;
    }
  };

  const handleDeleteSelected = async (ids: string[]) => {
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

  const handleUpdateTicker = async (ticker: Ticker) => {
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
      setError('Failed to update ticker');
      throw err;
    }
  };

  const runTickerMigration = async () => {
    if (!confirm('This will create Ticker records from your existing lots. Continue?')) {
      return;
    }

    try {
      setLoading(true);
      console.log('Starting Ticker migration...');

      const { data: allLots } = await client.models.TickerLot.list();

      // Group by ticker, find earliest lot for each
      const tickerMap = new Map<string, { symbol: string; baseYield: number; date: string }>();

      for (const lot of allLots) {
        if (!lot) continue;
        const existing = tickerMap.get(lot.ticker);
        if (!existing || lot.purchaseDate < existing.date) {
          tickerMap.set(lot.ticker, {
            symbol: lot.ticker,
            baseYield: lot.baseYield ?? 0,
            date: lot.purchaseDate,
          });
        }
      }

      // Create Ticker records
      let created = 0;
      let skipped = 0;

      for (const tickerData of tickerMap.values()) {
        const { data: existing } = await client.models.Ticker.list({
          filter: { symbol: { eq: tickerData.symbol } }
        });

        if (!existing || existing.length === 0) {
          await client.models.Ticker.create({
            symbol: tickerData.symbol,
            baseYield: tickerData.baseYield,
            companyName: '',
          });
          console.log(`✓ Created Ticker: ${tickerData.symbol} (yield: ${tickerData.baseYield}%)`);
          created++;
        } else {
          console.log(`- Skipped ${tickerData.symbol} (already exists)`);
          skipped++;
        }
      }

      await loadTickers();
      setLoading(false);

      alert(`Migration complete!\nCreated: ${created} ticker records\nSkipped: ${skipped} (already existed)`);
    } catch (err) {
      console.error('Migration error:', err);
      setError('Migration failed');
      setLoading(false);
      alert('Migration failed. Check console for details.');
    }
  };

  const totalPortfolioValue = summaries.reduce((sum, s) => sum + s.totalCost, 0);
  const totalTickers = summaries.length;

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="h-full max-w-7xl mx-auto flex flex-col">
        <div className="bg-white rounded-2xl shadow-2xl flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold flex items-center gap-3">
                  <TrendingUp size={40} />
                  Portfolio Lot Manager
                </h1>
                <p className="text-blue-100 mt-2 text-lg">
                  Signed in as: {user?.signInDetails?.loginId}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPortfolioManager(true)}
                  className="bg-white bg-opacity-20 text-blue-500 px-5 py-3 rounded-lg hover:bg-opacity-30 transition-all flex items-center gap-2 font-semibold"
                >
                  <Settings size={20} />
                  Manage Portfolios
                </button>
                <button
                  onClick={runTickerMigration}
                  className="bg-yellow-500 text-white px-5 py-3 rounded-lg hover:bg-yellow-600 transition-all flex items-center gap-2 font-semibold shadow-lg"
                  title="One-time migration: Create Ticker records from existing lots"
                >
                  <RefreshCw size={20} />
                  Run Migration
                </button>
                <button
                  onClick={loadLots}
                  className="bg-white bg-opacity-20 text-blue-500 px-5 py-3 rounded-lg hover:bg-opacity-30 transition-all flex items-center gap-2 font-semibold"
                >
                  <RefreshCw size={20} strokeWidth={2.5} />
                  Refresh
                </button>
                <button
                  onClick={() => setSelectedTicker('NEW')}
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition-all flex items-center gap-2 shadow-lg"
                >
                  <Plus size={22} />
                  Add First Lot
                </button>
                <button
                  onClick={signOut}
                  className="bg-red-500 text-white px-5 py-3 rounded-lg hover:bg-red-600 transition-all flex items-center gap-2 font-semibold"
                >
                  <Power size={20} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6">
              <p className="text-red-700 font-semibold">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-600 underline text-sm mt-2"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Portfolio Stats */}
          <div className="grid grid-cols-2 gap-4 p-6 bg-gradient-to-r from-slate-50 to-blue-50">
            <div className="bg-white p-5 rounded-xl shadow-lg border-2 border-green-200">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-4 rounded-lg">
                  <DollarSign className="text-green-600" size={28} />
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-bold uppercase">Portfolio Value</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${totalPortfolioValue.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-lg border-2 border-purple-200">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-4 rounded-lg">
                  <TrendingUp className="text-purple-600" size={28} />
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-bold uppercase">Tickers</p>
                  <p className="text-2xl font-bold text-purple-600">{totalTickers}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 flex-1 overflow-y-auto overflow-x-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                <TrendingUp size={28} className="text-blue-600" />
                Ticker Summary
              </h2>
              <p className="text-slate-600">
                Click on any ticker row to view and manage individual lots
              </p>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <RefreshCw size={48} className="mx-auto mb-4 text-blue-600 animate-spin" />
                <p className="text-lg text-slate-600">Loading portfolio data...</p>
              </div>
            ) : (
              <TickerSummarySpreadsheet
                summaries={summaries}
                onViewDetails={(ticker) => setSelectedTicker(ticker)}
                onUpdateTicker={handleUpdateTicker}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedTicker && selectedTicker !== 'NEW' && (
        <TickerDetailModal
          ticker={selectedTicker}
          allLots={lots}
          portfolios={portfolios}
          tickers={tickers}
          onClose={() => setSelectedTicker(null)}
          onSaveLot={handleSaveLot}
          onDeleteLot={handleDeleteLot}
          onDeleteSelected={handleDeleteSelected}
          onUpdateTicker={handleUpdateTicker}
        />
      )}

      {/* New Ticker Modal */}
      {selectedTicker === 'NEW' && (
        <NewTickerModal
          portfolios={portfolios}
          onClose={() => setSelectedTicker(null)}
          onSave={handleSaveLot}
        />
      )}

      {/* Portfolio Manager Modal */}
      {showPortfolioManager && (
        <PortfolioManager
          portfolios={portfolios}
          onClose={() => setShowPortfolioManager(false)}
        />
      )}
    </div>
  );
}


// ============================================
// Main App with Authenticator
// ============================================
export default function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => <MainApp signOut={signOut!} user={user} />}
    </Authenticator>
  );
}
