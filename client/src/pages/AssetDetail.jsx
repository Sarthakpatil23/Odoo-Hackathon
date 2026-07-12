import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export default function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdminOrManager = user?.role === 'Admin' || user?.role === 'AssetManager';

  // State
  const [asset, setAsset] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    categoryId: '',
    serialNumber: '',
    condition: 'New',
    location: '',
    isBookable: false,
    photoUrl: '',
  });

  // Action Confirmations
  const [isRetireConfirmOpen, setIsRetireConfirmOpen] = useState(false);
  const [isDisposeConfirmOpen, setIsDisposeConfirmOpen] = useState(false);

  const fetchAssetDetail = async () => {
    setLoading(true);
    try {
      setErrorMsg(null);
      const res = await api.get(`/assets/${id}`);
      setAsset(res.data);
      
      // Pre-fill edit form
      setEditForm({
        name: res.data.name,
        categoryId: res.data.categoryId,
        serialNumber: res.data.serialNumber || '',
        condition: res.data.condition,
        location: res.data.location,
        isBookable: res.data.isBookable,
        photoUrl: res.data.photoUrl || '',
      });
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Failed to load asset details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/asset-categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  useEffect(() => {
    fetchAssetDetail();
    if (isAdminOrManager) {
      fetchCategories();
    }
  }, [id]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 5000);
  };

  const handleEditAssetSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.categoryId || !editForm.location.trim()) {
      showError('Please fill in all required fields.');
      return;
    }

    try {
      await api.put(`/assets/${id}`, editForm);
      showSuccess('Asset details updated successfully.');
      setIsEditOpen(false);
      fetchAssetDetail();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to update asset details.');
    }
  };

  const handleRetireAsset = async () => {
    try {
      await api.patch(`/assets/${id}/retire`);
      showSuccess('Asset has been successfully retired.');
      setIsRetireConfirmOpen(false);
      fetchAssetDetail();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to retire asset.');
      setIsRetireConfirmOpen(false);
    }
  };

  const handleDisposeAsset = async () => {
    try {
      await api.patch(`/assets/${id}/dispose`);
      showSuccess('Asset has been successfully marked as disposed.');
      setIsDisposeConfirmOpen(false);
      fetchAssetDetail();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to dispose of asset.');
      setIsDisposeConfirmOpen(false);
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      Available: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      Allocated: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      Reserved: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
      UnderMaintenance: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      Lost: 'bg-slate-700/20 text-slate-400 border border-slate-700/30',
      Retired: 'bg-slate-800 text-slate-500 border border-slate-800/80',
      Disposed: 'bg-red-950/20 text-red-400 border border-red-500/10',
    };
    return (
      <span className={`px-2.5 py-1 rounded text-xs font-semibold ${classes[status] || 'bg-slate-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (errorMsg && !asset) {
    return (
      <div className="p-8 max-w-3xl mx-auto text-center">
        <div className="bg-red-500/10 border border-red-500/25 p-6 rounded-2xl text-red-400 mb-6">
          <p className="font-bold text-lg mb-2">Error Loading Asset</p>
          <p className="text-sm">{errorMsg}</p>
        </div>
        <Link to="/assets" className="px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all text-slate-300">
          Back to Asset Registry
        </Link>
      </div>
    );
  }

  const isAllocated = asset?.status === 'Allocated';

  return (
    <div className="p-8 max-w-7xl mx-auto text-slate-100 min-h-screen">
      {/* Back button */}
      <Link to="/assets" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-6 select-none">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Asset Registry
      </Link>

      {/* Global Alerts */}
      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Detail Header Grid */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Asset Photo Placeholder or Supplied Image URL */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600 shrink-0 overflow-hidden relative">
              {asset.photoUrl ? (
                <img src={asset.photoUrl} alt={asset.name} className="w-full h-full object-cover" />
              ) : (
                <svg className="w-10 h-10 md:w-14 md:h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <span className="text-xs font-bold text-indigo-400 tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{asset.tag}</span>
                {getStatusBadge(asset.status)}
                {asset.isBookable && (
                  <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">Bookable Resource</span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 mb-4">{asset.name}</h1>

              {/* Quick specs grid */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-slate-400">
                <p>Category: <strong className="text-slate-300">{asset.categoryName}</strong></p>
                <p>Location: <strong className="text-slate-300">{asset.location}</strong></p>
                <p>Serial Number: <strong className="text-slate-300">{asset.serialNumber || '—'}</strong></p>
                <p>Condition: <strong className="text-slate-300">{asset.condition}</strong></p>
                <p>Acquisition Cost: <strong className="text-slate-300">${Number(asset.acquisitionCost).toLocaleString()}</strong></p>
                <p>Acquisition Date: <strong className="text-slate-300">{new Date(asset.acquisitionDate).toLocaleDateString()}</strong></p>
              </div>
            </div>
          </div>

          {/* Admin / Manager Action Buttons */}
          {isAdminOrManager && (
            <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0 pt-4 lg:pt-0 border-t border-slate-800 lg:border-t-0">
              <button
                onClick={() => setIsEditOpen(true)}
                className="flex-1 lg:w-36 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition-all active:scale-95 text-center"
              >
                Edit Details
              </button>

              <div className="relative group flex-1 lg:w-36">
                <button
                  onClick={() => setIsRetireConfirmOpen(true)}
                  disabled={isAllocated}
                  className="w-full px-4 py-2 bg-red-950/20 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-semibold rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-center"
                >
                  Retire Asset
                </button>
                {isAllocated && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-slate-950 border border-slate-800 text-slate-400 text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity text-center z-20">
                    Cannot retire an asset that is currently allocated — return it first.
                  </div>
                )}
              </div>

              <div className="relative group flex-1 lg:w-36">
                <button
                  onClick={() => setIsDisposeConfirmOpen(true)}
                  disabled={isAllocated}
                  className="w-full px-4 py-2 bg-red-950/20 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-semibold rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-center"
                >
                  Dispose Asset
                </button>
                {isAllocated && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-slate-950 border border-slate-800 text-slate-400 text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity text-center z-20">
                    Cannot dispose of an asset that is currently allocated — return it first.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Current Allocation Holder banner */}
        {asset.currentAllocation ? (
          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  Currently Allocated to: <strong className="text-blue-300">{asset.currentAllocation.holderName}</strong> ({asset.currentAllocation.holderType})
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Allocated on: {new Date(asset.currentAllocation.allocatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            {asset.currentAllocation.expectedReturnDate && (
              <div className="text-right">
                <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold block">Expected Return Date</span>
                <span className="text-sm font-medium text-slate-300">{new Date(asset.currentAllocation.expectedReturnDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 text-sm">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>This asset is currently in storage and **Available** for allocation or booking.</span>
          </div>
        )}
      </div>

      {/* History Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* A. Allocation History */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col">
          <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Allocation History
          </h3>

          {!asset.allocationHistory || asset.allocationHistory.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl flex-1 flex flex-col justify-center">
              <p className="text-slate-500 text-sm">No allocation logs found for this asset.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-950/40 text-slate-500 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Holder</th>
                    <th className="px-4 py-3 font-semibold">Allocated</th>
                    <th className="px-4 py-3 font-semibold">Returned</th>
                    <th className="px-4 py-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30">
                  {asset.allocationHistory.map((h, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/10 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-200">{h.holderName}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{new Date(h.allocatedAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {h.returnedAt ? new Date(h.returnedAt).toLocaleDateString() : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded ${
                          h.status === 'Active' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {h.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* B. Maintenance History */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col">
          <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
            Maintenance Logs
          </h3>

          {!asset.maintenanceHistory || asset.maintenanceHistory.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl flex-1 flex flex-col justify-center">
              <p className="text-slate-500 text-sm">No maintenance incidents reported.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-950/40 text-slate-500 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Incident / Issue</th>
                    <th className="px-4 py-3 font-semibold">Priority</th>
                    <th className="px-4 py-3 font-semibold">Raised Date</th>
                    <th className="px-4 py-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30">
                  {asset.maintenanceHistory.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/10 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-200">
                        <div>
                          <p>{m.issue}</p>
                          <span className="text-[10px] text-slate-500">By: {m.raisedByName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">{m.priority}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{new Date(m.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded ${
                          m.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ─── EDIT MODAL ─── */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Asset Details"
        size="lg"
      >
        <form onSubmit={handleEditAssetSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Asset Name *</label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Category *</label>
              <select
                required
                value={editForm.categoryId}
                onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-100 outline-none cursor-pointer"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Serial Number</label>
              <input
                type="text"
                value={editForm.serialNumber}
                onChange={(e) => setEditForm({ ...editForm, serialNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Condition *</label>
              <select
                value={editForm.condition}
                onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-100 outline-none cursor-pointer"
              >
                <option value="New">New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Location *</label>
              <input
                type="text"
                required
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-100 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Photo/Document URL</label>
              <input
                type="text"
                value={editForm.photoUrl}
                onChange={(e) => setEditForm({ ...editForm, photoUrl: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-100 outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2.5 text-sm text-slate-300 select-none cursor-pointer hover:text-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={editForm.isBookable}
                onChange={(e) => setEditForm({ ...editForm, isBookable: e.target.checked })}
                className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0 cursor-pointer w-4 h-4"
              />
              Mark as bookable (employees can book this asset for specific time slots)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 border border-slate-700 text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-800 hover:text-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/10"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* RETIRE CONFIRMATION MODAL */}
      <Modal
        isOpen={isRetireConfirmOpen}
        onClose={() => setIsRetireConfirmOpen(false)}
        title="Confirm Retirement"
      >
        <div className="space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            Are you sure you want to retire the asset <strong className="text-slate-100">"{asset.name}" ({asset.tag})</strong>?
          </p>
          <p className="text-xs text-slate-400">
            Retiring an asset flags it as retired permanently. It will no longer be available for allocation or resource bookings.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsRetireConfirmOpen(false)}
              className="px-4 py-2 border border-slate-700 text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-800 hover:text-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRetireAsset}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-red-600/10"
            >
              Retire Asset
            </button>
          </div>
        </div>
      </Modal>

      {/* DISPOSE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDisposeConfirmOpen}
        onClose={() => setIsDisposeConfirmOpen(false)}
        title="Confirm Disposal"
      >
        <div className="space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            Are you sure you want to mark the asset <strong className="text-slate-100">"{asset.name}" ({asset.tag})</strong> as disposed?
          </p>
          <p className="text-xs text-slate-400">
            Marking an asset as disposed implies it has been permanently removed from organization properties. This action is irreversible.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsDisposeConfirmOpen(false)}
              className="px-4 py-2 border border-slate-700 text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-800 hover:text-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDisposeAsset}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-red-600/10"
            >
              Mark Disposed
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
