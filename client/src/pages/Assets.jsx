import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export default function Assets() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAdminOrManager = user?.role === 'Admin' || user?.role === 'AssetManager';

  // State Lists
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Scoping & Loading States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [bookableFilter, setBookableFilter] = useState(false);

  // Register Modal State
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    serialNumber: '',
    acquisitionDate: '',
    acquisitionCost: '',
    condition: 'New',
    location: '',
    isBookable: false,
    photoUrl: '',
  });

  // ─── Fetching Data ─────────────────────────────────────────────────────────

  const fetchAssets = async (currentSearch = search) => {
    setLoading(true);
    try {
      const params = {};
      if (currentSearch) params.search = currentSearch;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.categoryId = categoryFilter;
      if (departmentFilter) params.departmentId = departmentFilter;
      if (bookableFilter) params.bookable = 'true';

      const response = await api.get('/assets', { params });
      setAssets(response.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to fetch assets.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFiltersData = async () => {
    try {
      // Categories are fetched for dropdown selection
      const catRes = await api.get('/asset-categories');
      setCategories(catRes.data);

      // Departments are fetched (only useful/permitted for Admin/Manager filters)
      if (isAdminOrManager) {
        const deptRes = await api.get('/departments');
        setDepartments(deptRes.data);
      }
    } catch (err) {
      console.error('Failed to load filter directories', err);
    }
  };

  // Debounced search trigger
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchAssets(search);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [search, statusFilter, categoryFilter, departmentFilter, bookableFilter]);

  // Initial load
  useEffect(() => {
    fetchFiltersData();
  }, []);

  const handleRegisterAsset = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.categoryId || !form.acquisitionDate || !form.acquisitionCost || !form.location.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    try {
      setErrorMsg(null);
      const payload = {
        ...form,
        acquisitionCost: parseFloat(form.acquisitionCost),
      };

      const response = await api.post('/assets', payload);
      setSuccessMsg(`Asset registered successfully with tag ${response.data.tag}`);
      setIsRegisterOpen(false);
      
      // Reset form
      setForm({
        name: '',
        categoryId: '',
        serialNumber: '',
        acquisitionDate: '',
        acquisitionCost: '',
        condition: 'New',
        location: '',
        isBookable: false,
        photoUrl: '',
      });

      // Reload asset lists
      fetchAssets();
      
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to register asset.');
    }
  };

  // Status Badge styling helper
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
      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${classes[status] || 'bg-slate-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto text-slate-100 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-sky-300">
            Asset Registry
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Search, filter, and register physical assets or bookable resources.
          </p>
        </div>

        {isAdminOrManager && (
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-indigo-600/15 active:scale-95 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Register Asset
          </button>
        )}
      </div>

      {/* Global Toast Alert */}
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

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-lg mb-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by tag, name, or serial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-100 outline-none placeholder-slate-500 transition-colors"
          />
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filters Group */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3">
          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-300 outline-none cursor-pointer transition-colors"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-300 outline-none cursor-pointer transition-colors"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Allocated">Allocated</option>
            <option value="Reserved">Reserved</option>
            <option value="UnderMaintenance">Under Maintenance</option>
            <option value="Lost">Lost</option>
            <option value="Retired">Retired</option>
            <option value="Disposed">Disposed</option>
          </select>

          {/* Department (Admin/Manager only) */}
          {isAdminOrManager && (
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-300 outline-none cursor-pointer transition-colors"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          )}

          {/* Bookable checkbox wrapper */}
          <label className="flex items-center gap-2 text-sm text-slate-400 select-none cursor-pointer hover:text-slate-200 transition-colors pl-2">
            <input
              type="checkbox"
              checked={bookableFilter}
              onChange={(e) => setBookableFilter(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0 cursor-pointer"
            />
            Bookable Only
          </label>
        </div>
      </div>

      {/* Assets List Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-20 px-4">
            <svg className="w-12 h-12 mx-auto text-slate-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-slate-400 text-sm mb-4">No assets matched your search filters.</p>
            {isAdminOrManager && (
              <button
                onClick={() => setIsRegisterOpen(true)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm transition-colors"
              >
                Register New Asset
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950/40 text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Tag</th>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Location</th>
                  <th className="px-6 py-4 font-semibold">Condition</th>
                  <th className="px-6 py-4 font-semibold">Bookable</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {assets.map((asset) => (
                  <tr
                    key={asset.id}
                    onClick={() => navigate(`/assets/${asset.id}`)}
                    className="hover:bg-slate-800/20 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-bold text-indigo-400">{asset.tag}</td>
                    <td className="px-6 py-4 font-medium text-slate-200">
                      <div>
                        <p>{asset.name}</p>
                        {asset.currentHolder && (
                          <span className="text-xs text-slate-500">Held by: {asset.currentHolder}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{asset.categoryName}</td>
                    <td className="px-6 py-4">{getStatusBadge(asset.status)}</td>
                    <td className="px-6 py-4 text-slate-400">{asset.location}</td>
                    <td className="px-6 py-4 text-slate-400">{asset.condition}</td>
                    <td className="px-6 py-4">
                      {asset.isBookable ? (
                        <span className="text-indigo-400 font-semibold text-xs bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10">Yes</span>
                      ) : (
                        <span className="text-slate-600 text-xs">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/assets/${asset.id}`)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── REGISTRATION MODAL ─────────────────────────────────────────────────── */}
      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Register Asset"
        size="lg"
      >
        <form onSubmit={handleRegisterAsset} className="space-y-4">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-slate-400 text-xs flex items-center justify-between mb-4">
            <span>Asset Tag Assignment</span>
            <span className="font-bold text-indigo-400 italic">Auto-generated upon submission</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Asset Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. MacBook Pro M3"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Category *</label>
              <select
                required
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
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
                placeholder="e.g. SN-871465223"
                value={form.serialNumber}
                onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Acquisition Date *</label>
              <input
                type="date"
                required
                value={form.acquisitionDate}
                onChange={(e) => setForm({ ...form, acquisitionDate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Acquisition Cost (USD) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="e.g. 1499.00"
                value={form.acquisitionCost}
                onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Condition *</label>
              <select
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
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
                placeholder="e.g. Head Office, Room 402"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-100 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Photo/Document URL</label>
              <input
                type="text"
                placeholder="e.g. https://example.com/asset-photo.jpg"
                value={form.photoUrl}
                onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-100 outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2.5 text-sm text-slate-300 select-none cursor-pointer hover:text-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={form.isBookable}
                onChange={(e) => setForm({ ...form, isBookable: e.target.checked })}
                className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0 cursor-pointer w-4 h-4"
              />
              Mark as bookable (employees can book this asset for specific time slots)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
            <button
              type="button"
              onClick={() => setIsRegisterOpen(false)}
              className="px-4 py-2 border border-slate-700 text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-800 hover:text-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/10"
            >
              Submit Registration
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
