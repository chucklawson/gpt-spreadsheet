import  { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, TrendingUp, DollarSign, Calendar, Hash, LogOut, RefreshCw } from 'lucide-react';
import type { Schema } from '../../amplify/data/resource';
import type { SelectionSet } from 'aws-amplify/data';
import LotModal from './LotModal';

type TickerLot = SelectionSet<Schema['TickerLot']['type'], typeof selectionSet>;

const selectionSet = ['id', 'ticker', 'shares', 'costPerShare', 'purchaseDate', 'notes', 'companyName', 'page', 'totalCost', 'createdAt', 'updatedAt'] as const;

interface Props {
  client: any;
  user: any;
  signOut: () => void;
}

export default function TickerLotManager({ client, user, signOut }: Props) {
  const [lots, setLots] = useState<TickerLot[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLot, setEditingLot] = useState<TickerLot | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLots();

    // Subscribe to real-time updates
    const subscription = client.models.TickerLot.observeQuery().subscribe({
      next: ({ items }: { items: TickerLot[] }) => {
        setLots(items);
        setLoading(false);
      },
      error: (err: Error) => {
        console.error('Subscription error:', err);
        setError('Failed to sync data');
      },
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadLots = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, errors } = await client.models.TickerLot.list();
      if (errors) {
        console.error('Load errors:', errors);
        setError('Failed to load lots');
      } else {
        setLots(data);
      }
    } catch (err) {
      console.error('Load error:', err);
      setError('Failed to load lots');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (lot: TickerLot | null = null) => {
    setEditingLot(lot);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLot(null);
  };

  const saveLot = async (lotData: any) => {
    try {
      const totalCost = lotData.shares * lotData.costPerShare;

      if (editingLot) {
        await client.models.TickerLot.update({
          id: editingLot.id,
          ...lotData,
          totalCost,
        });
      } else {
        await client.models.TickerLot.create({
          ...lotData,
          totalCost,
        });
      }

      closeModal();
      await loadLots();
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save lot');
    }
  };

  const deleteLot = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lot?')) return;

    try {
      await client.models.TickerLot.delete({ id });
      await loadLots();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete lot');
    }
  };

  const deleteSelected = async () => {
    if (!confirm(`Delete ${selectedRows.size} selected lots?`)) return;

    try {
      for (const id of selectedRows) {
        await client.models.TickerLot.delete({ id });
      }
      setSelectedRows(new Set());
      await loadLots();
    } catch (err) {
      console.error('Bulk delete error:', err);
      setError('Failed to delete selected lots');
    }
  };

  const toggleRowSelection = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const totalValue = lots.reduce((sum, lot) => sum + (lot.shares * lot.costPerShare), 0);
  const totalShares = lots.reduce((sum, lot) => sum + lot.shares, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <TrendingUp size={32} />
                  Ticker Lot Manager
                </h1>
                <p className="text-blue-100 mt-1">
                  Signed in as: {user?.signInDetails?.loginId}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={loadLots}
                  className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all flex items-center gap-2"
                >
                  <RefreshCw size={18} />
                  Refresh
                </button>
                <button
                  onClick={() => openModal()}
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all flex items-center gap-2 shadow-lg"
                >
                  <Plus size={20} />
                  Add Lot
                </button>
                <button
                  onClick={signOut}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all flex items-center gap-2"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 p-6 bg-slate-50">
            <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <DollarSign className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Value</p>
                  <p className="text-2xl font-bold text-slate-800">${totalValue.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Hash className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Shares</p>
                  <p className="text-2xl font-bold text-slate-800">{totalShares.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <TrendingUp className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Lots</p>
                  <p className="text-2xl font-bold text-slate-800">{lots.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Spreadsheet */}
          <div className="p-6">
            {selectedRows.size > 0 && (
              <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 p-3 rounded-lg">
                <span className="text-red-700 font-medium">{selectedRows.size} selected</span>
                <button
                  onClick={deleteSelected}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete Selected
                </button>
              </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-lg">
              <table className="w-full">
                <thead className="bg-slate-100 border-b-2 border-slate-300">
                <tr>
                  <th className="p-4 text-left">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded"
                      checked={selectedRows.size === lots.length && lots.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows(new Set(lots.map(l => l.id)));
                        } else {
                          setSelectedRows(new Set());
                        }
                      }}
                    />
                  </th>
                  <th className="p-4 text-left font-semibold text-slate-700">Ticker</th>
                  <th className="p-4 text-left font-semibold text-slate-700">Shares</th>
                  <th className="p-4 text-left font-semibold text-slate-700">Cost/Share</th>
                  <th className="p-4 text-left font-semibold text-slate-700">Total Cost</th>
                  <th className="p-4 text-left font-semibold text-slate-700">Purchase Date</th>
                  <th className="p-4 text-left font-semibold text-slate-700">Notes</th>
                  <th className="p-4 text-right font-semibold text-slate-700">Actions</th>
                </tr>
                </thead>
                <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-400">
                      <RefreshCw size={48} className="mx-auto mb-3 opacity-50 animate-spin" />
                      <p className="text-lg">Loading lots...</p>
                    </td>
                  </tr>
                ) : lots.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-400">
                      <TrendingUp size={48} className="mx-auto mb-3 opacity-50" />
                      <p className="text-lg">No lots yet. Click "Add Lot" to get started!</p>
                    </td>
                  </tr>
                ) : (
                  lots.map((lot, idx) => (
                    <tr
                      key={lot.id}
                      className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded"
                          checked={selectedRows.has(lot.id)}
                          onChange={() => toggleRowSelection(lot.id)}
                        />
                      </td>
                      <td className="p-4 font-bold text-blue-600">{lot.ticker}</td>
                      <td className="p-4 text-slate-700">{lot.shares.toLocaleString()}</td>
                      <td className="p-4 text-slate-700">${lot.costPerShare.toFixed(2)}</td>
                      <td className="p-4 font-semibold text-green-600">
                        ${(lot.shares * lot.costPerShare).toFixed(2)}
                      </td>
                      <td className="p-4 text-slate-600 flex items-center gap-2">
                        <Calendar size={16} className="text-slate-400" />
                        {lot.purchaseDate}
                      </td>
                      <td className="p-4 text-slate-600 text-sm max-w-xs truncate">
                        {lot.notes || '-'}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => openModal(lot)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => deleteLot(lot.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
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
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <LotModal
          lot={editingLot}
          onClose={closeModal}
          onSave={saveLot}
        />
      )}
    </div>
  );
}