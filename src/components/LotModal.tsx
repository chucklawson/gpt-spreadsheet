import  { useState } from 'react';
import { X, Save} from 'lucide-react';
import type { TickerLot, LotFormData } from '../types';

// ============================================
// Modal Component
// ============================================
interface LotModalProps {
  lot: TickerLot | null;
  onClose: () => void;
  onSave: (lot: LotFormData) => void;
}

export default function LotModal({ lot, onClose, onSave }: LotModalProps) {
  const [formData, setFormData] = useState({
    ticker: lot?.ticker || '',
    shares: lot?.shares || 0,
    costPerShare: lot?.costPerShare || 0,
    purchaseDate: lot?.purchaseDate || new Date().toISOString().split('T')[0],
    notes: lot?.notes || '',
    companyName: lot?.companyName || 'Apple',
    page: lot?.page || 'Unknown',
  });

  const handleSave = () => {
    if (!formData.ticker || formData.shares <= 0 || formData.costPerShare <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    onSave({
      ...formData,
      shares: parseFloat(formData.shares.toString()),
      costPerShare: parseFloat(formData.costPerShare.toString())
    });
  };

  const totalCost = formData.shares * formData.costPerShare;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {lot ? 'Edit Lot' : 'Add New Lot'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Ticker Symbol *
              </label>
              <input
                type="text"
                value={formData.ticker}
                onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg font-bold"
                placeholder="AAPL"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Number of Shares *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={formData.shares}
                onChange={(e) => setFormData({ ...formData, shares: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Cost Per Share *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-slate-500 text-lg">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.costPerShare}
                  onChange={(e) => setFormData({ ...formData, costPerShare: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="150.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Purchase Date *
              </label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
              rows={3}
              placeholder="Add any additional notes about this lot..."
            />
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-slate-700">Total Cost:</span>
              <span className="text-3xl font-bold text-green-600">
                ${isNaN(totalCost) ? '0.00' : totalCost.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all font-semibold flex items-center justify-center gap-2 shadow-lg"
            >
              <Save size={20} />
              {lot ? 'Update Lot' : 'Save Lot'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
