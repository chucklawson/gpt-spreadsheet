// ============================================
// New Ticker Modal Component
// ============================================
import { useState } from 'react';
import type { LotFormData } from '../types';
import { Plus } from 'lucide-react';

export default function NewTickerModal({
                          onClose,
                          onSave,
                        }: {
  onClose: () => void;
  onSave: (lotData: LotFormData) => Promise<void>;
}) {
  const [formData, setFormData] = useState<LotFormData>({
    ticker: '',
    shares: 0,
    costPerShare: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleSave = async () => {
    if (!formData.ticker || formData.shares <= 0 || formData.costPerShare <= 0) {
      alert('Please fill in all required fields with valid values');
      return;
    }

    await onSave(formData);
    onClose();
  };

  const totalCost = formData.shares * formData.costPerShare;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 overflow-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Plus size={28} />
              Add First Lot for New Ticker
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
            >
              <Plus size={24} className="rotate-45" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Ticker Symbol *
              </label>
              <input
                type="text"
                value={formData.ticker}
                onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg font-bold uppercase"
                placeholder="AAPL"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
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
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Cost Per Share *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-slate-500 text-lg font-bold">$</span>
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
              <label className="block text-sm font-bold text-slate-700 mb-2">
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
            <label className="block text-sm font-bold text-slate-700 mb-2">
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

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-300">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-slate-700">Total Cost:</span>
              <span className="text-3xl font-bold text-green-600">
                ${isNaN(totalCost) ? '0.00' : totalCost.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-all font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              <Plus size={20} />
              Create First Lot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


