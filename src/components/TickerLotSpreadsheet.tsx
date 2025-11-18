// ============================================
// FILE: src/components/TickerLotSpreadsheet.tsx
// ============================================
import React from 'react';
import {
  Edit2,
  Trash2,
  Calendar,
  DollarSign,
  TrendingUp,
  Package
} from 'lucide-react';
import type { TickerLot } from '../types';

interface Props {
  lots: TickerLot[];
  onEdit: (lot: TickerLot) => void;
  onDelete: (id: string) => void;
  selectedRows: Set<string>;
  onToggleRow: (id: string) => void;
  onToggleAll: () => void;
}

export default function TickerLotSpreadsheet({
                                               lots,
                                               onEdit,
                                               onDelete,
                                               selectedRows,
                                               onToggleRow,
                                               onToggleAll,
                                             }: Props) {
  const allSelected = lots.length > 0 && selectedRows.size === lots.length;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-lg">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-slate-100 to-slate-200 border-b-2 border-slate-300">
        <tr>
          <th className="p-4 text-left">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300"
              checked={allSelected}
              onChange={onToggleAll}
            />
          </th>
          <th className="p-4 text-left font-bold text-slate-700 uppercase text-xs tracking-wide">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} />
              Ticker
            </div>
          </th>
          <th className="p-4 text-left font-bold text-slate-700 uppercase text-xs tracking-wide">
            <div className="flex items-center gap-2">
              <Package size={16} />
              Shares
            </div>
          </th>
          <th className="p-4 text-left font-bold text-slate-700 uppercase text-xs tracking-wide">
            <div className="flex items-center gap-2">
              <DollarSign size={16} />
              Cost/Share
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
              <Calendar size={16} />
              Purchase Date
            </div>
          </th>
          <th className="p-4 text-left font-bold text-slate-700 uppercase text-xs tracking-wide">
            Notes
          </th>
          <th className="p-4 text-right font-bold text-slate-700 uppercase text-xs tracking-wide">
            Actions
          </th>
        </tr>
        </thead>
        <tbody>
        {lots.length === 0 ? (
          <tr>
            <td colSpan={8} className="p-12 text-center text-slate-400">
              <TrendingUp size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-lg">No lots for this ticker yet</p>
            </td>
          </tr>
        ) : (
          lots.map((lot, idx) => (
            <tr
              key={lot.id}
              className={`border-b border-slate-200 hover:bg-blue-50 transition-colors ${
                idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
              }`}
            >
              <td className="p-4">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300"
                  checked={selectedRows.has(lot.id)}
                  onChange={() => onToggleRow(lot.id)}
                />
              </td>
              <td className="p-4">
                <span className="font-bold text-blue-600 text-lg">{lot.ticker}</span>
              </td>
              <td className="p-4 text-slate-700 font-semibold">
                {lot.shares.toLocaleString()}
              </td>
              <td className="p-4 text-slate-700 font-mono">
                ${lot.costPerShare.toFixed(2)}
              </td>
              <td className="p-4 font-bold text-green-600 text-lg">
                ${lot.totalCost.toFixed(2)}
              </td>
              <td className="p-4 text-slate-600">
                {new Date(lot.purchaseDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </td>
              <td className="p-4 text-slate-600 text-sm max-w-xs truncate">
                {lot.notes || '-'}
              </td>
              <td className="p-4 text-right">
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => onEdit(lot)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                    title="Edit Lot"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this lot?')) {
                        onDelete(lot.id);
                      }
                    }}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                    title="Delete Lot"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
        </tbody>
      </table>
    </div>
  );
}