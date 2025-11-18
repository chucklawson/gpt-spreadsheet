// ============================================
// FILE: src/components/TickerSummarySpreadsheet.tsx
// ============================================
import React from 'react';
import {
  Eye,
  TrendingUp,
  DollarSign,
  Package,
  Calendar,
  Hash
} from 'lucide-react';
import type { TickerSummary } from '../types';

interface Props {
  summaries: TickerSummary[];
  onViewDetails: (ticker: string) => void;
}

export default function TickerSummarySpreadsheet({
                                                   summaries,
                                                   onViewDetails,
                                                 }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-lg">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-slate-100 to-slate-200 border-b-2 border-slate-300">
        <tr>
          <th className="p-4 text-left font-bold text-slate-700 uppercase text-xs tracking-wide">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} />
              Ticker
            </div>
          </th>
          <th className="p-4 text-left font-bold text-slate-700 uppercase text-xs tracking-wide">
            <div className="flex items-center gap-2">
              <Package size={16} />
              Total Shares
            </div>
          </th>
          <th className="p-4 text-left font-bold text-slate-700 uppercase text-xs tracking-wide">
            <div className="flex items-center gap-2">
              <DollarSign size={16} />
              Total Cost
            </div>
          </th>
          <th className="p-4 text-left font-bold text-slate-700 uppercase text-xs tracking-wide">
            <div className="flex items-center gap-2">
              <DollarSign size={16} />
              Avg Cost/Share
            </div>
          </th>
          <th className="p-4 text-left font-bold text-slate-700 uppercase text-xs tracking-wide">
            <div className="flex items-center gap-2">
              <Hash size={16} />
              Lots
            </div>
          </th>
          <th className="p-4 text-left font-bold text-slate-700 uppercase text-xs tracking-wide">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              Date Range
            </div>
          </th>
          <th className="p-4 text-right font-bold text-slate-700 uppercase text-xs tracking-wide">
            Actions
          </th>
        </tr>
        </thead>
        <tbody>
        {summaries.length === 0 ? (
          <tr>
            <td colSpan={7} className="p-12 text-center text-slate-400">
              <TrendingUp size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-lg">No tickers yet. Add your first lot to get started!</p>
            </td>
          </tr>
        ) : (
          summaries.map((summary, idx) => (
            <tr
              key={summary.ticker}
              className={`border-b border-slate-200 hover:bg-blue-50 transition-colors cursor-pointer ${
                idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
              }`}
              onClick={() => onViewDetails(summary.ticker)}
            >
              <td className="p-4">
                <span className="font-bold text-blue-600 text-xl">{summary.ticker}</span>
              </td>
              <td className="p-4 text-slate-700 font-semibold text-lg">
                {summary.totalShares.toLocaleString()}
              </td>
              <td className="p-4 font-bold text-green-600 text-lg">
                ${summary.totalCost.toFixed(2)}
              </td>
              <td className="p-4 text-slate-700 font-mono font-semibold">
                ${summary.averageCostPerShare.toFixed(2)}
              </td>
              <td className="p-4 text-slate-600 font-semibold">
                {summary.lotCount}
              </td>
              <td className="p-4 text-slate-600 text-sm">
                <div>
                  {new Date(summary.earliestPurchase).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <div className="text-slate-400">to</div>
                <div>
                  {new Date(summary.latestPurchase).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </td>
              <td className="p-4 text-right">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(summary.ticker);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-md"
                >
                  <Eye size={18} />
                  View Details
                </button>
              </td>
            </tr>
          ))
        )}
        </tbody>
      </table>
    </div>
  );
}
