import { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Power,
  RefreshCw,
  Plus,
  Settings
} from 'lucide-react';
import { usePortfolioData } from './hooks/usePortfolioData';
import TickerSummarySpreadsheet from './components/TickerSummarySpreadsheet';
import TickerDetailModal from './components/TickerDetailModal';
import NewTickerModal from './components/NewTickerModal';
import PortfolioManagerModal from './components/PortfolioManagerModal';

export interface PortfolioManagerPageProps {
  user?: {
    email?: string;
    username?: string;
  };
  onSignOut?: () => void;
  className?: string;
}

/**
 * Portfolio Lot Manager - Main page component
 * Manages ticker lots with portfolio tracking, real-time sync, and detailed analytics
 */
export function PortfolioManagerPage({
  user,
  onSignOut,
  className
}: PortfolioManagerPageProps) {
  // Use orchestrator hook for all data
  const {
    lots,
    tickers,
    summaries,
    portfolios,
    loading,
    error,
    saveLot,
    deleteLot,
    deleteSelected,
    updateTicker,
    refresh,
    createPortfolio,
    deletePortfolio,
  } = usePortfolioData();

  // Modal state (keep local)
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [showPortfolioManager, setShowPortfolioManager] = useState(false);

  // Calculated stats
  const totalPortfolioValue = summaries.reduce((sum, s) => sum + s.totalCost, 0);
  const totalTickers = summaries.length;

  return (
    <div className={className || "h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6"}>
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
                {user && (
                  <p className="text-blue-100 mt-2 text-lg">
                    Signed in as: {user.email || user.username}
                  </p>
                )}
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
                  onClick={refresh}
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
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    className="bg-red-500 text-white px-5 py-3 rounded-lg hover:bg-red-600 transition-all flex items-center gap-2 font-semibold"
                  >
                    <Power size={20} />
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6">
              <p className="text-red-700 font-semibold">{error}</p>
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
                onUpdateTicker={updateTicker}
              />
            )}
          </div>
        </div>
      </div>

      {/* Ticker Detail Modal */}
      {selectedTicker && selectedTicker !== 'NEW' && (
        <TickerDetailModal
          ticker={selectedTicker}
          allLots={lots}
          portfolios={portfolios}
          tickers={tickers}
          onClose={() => setSelectedTicker(null)}
          onSaveLot={saveLot}
          onDeleteLot={deleteLot}
          onDeleteSelected={deleteSelected}
          onUpdateTicker={updateTicker}
        />
      )}

      {/* New Ticker Modal */}
      {selectedTicker === 'NEW' && (
        <NewTickerModal
          portfolios={portfolios}
          onClose={() => setSelectedTicker(null)}
          onSave={saveLot}
        />
      )}

      {/* Portfolio Manager Modal */}
      {showPortfolioManager && (
        <PortfolioManagerModal
          portfolios={portfolios}
          onClose={() => setShowPortfolioManager(false)}
          onCreatePortfolio={createPortfolio}
          onDeletePortfolio={deletePortfolio}
        />
      )}
    </div>
  );
}
