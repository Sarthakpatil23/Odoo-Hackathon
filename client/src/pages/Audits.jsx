import { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export default function Audits() {
  const { user } = useAuth();
  const isAdminOrManager = user?.role === 'Admin' || user?.role === 'AssetManager';

  // State Lists
  const [cycles, setCycles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [auditItems, setAuditItems] = useState([]);
  const [discrepancies, setDiscrepancies] = useState([]);

  // Loaders & Alerts
  const [loadingCycles, setLoadingCycles] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Create Cycle Form State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    scope: '',
    startDate: '',
    endDate: '',
    auditorIds: [],
  });

  // Discrepancy Modal
  const [isDiscrepancyOpen, setIsDiscrepancyOpen] = useState(false);

  const fetchCycles = async () => {
    setLoadingCycles(true);
    try {
      const res = await api.get('/audit-cycles');
      setCycles(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load audit cycles.');
    } finally {
      setLoadingCycles(false);
    }
  };

  const fetchEmployeesList = async () => {
    if (!isAdminOrManager) return;
    try {
      const res = await api.get('/employees', { params: { status: 'Active' } });
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCycles();
    fetchEmployeesList();
  }, []);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 5000);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.scope.trim() || !createForm.startDate || !createForm.endDate || !createForm.auditorIds.length) {
      showError('Please fill in all fields and select at least one auditor.');
      return;
    }

    try {
      await api.post('/audit-cycles', createForm);
      showSuccess('Audit cycle created successfully and assets assigned.');
      setIsCreateOpen(false);
      setCreateForm({ scope: '', startDate: '', endDate: '', auditorIds: [] });
      fetchCycles();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to create audit cycle.');
    }
  };

  const handleViewItems = async (cycle) => {
    setSelectedCycle(cycle);
    setLoadingItems(true);
    setDiscrepancies([]);
    try {
      const res = await api.get(`/audit-cycles/${cycle.id}/items`);
      setAuditItems(res.data);
    } catch (err) {
      console.error(err);
      showError('Failed to load items for this audit cycle.');
    } finally {
      setLoadingItems(false);
    }
  };

  const handleResultChange = async (itemId, result) => {
    try {
      setErrorMsg(null);
      await api.patch(`/audit-items/${itemId}`, { result });
      showSuccess('Audit result updated.');
      
      // Update result in local state
      setAuditItems(prevItems =>
        prevItems.map(item => (item.id === itemId ? { ...item, result } : item))
      );
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to update result.');
    }
  };

  const handleCloseCycle = async () => {
    if (!selectedCycle) return;
    try {
      const res = await api.patch(`/audit-cycles/${selectedCycle.id}/close`);
      showSuccess('Audit cycle successfully closed.');
      setDiscrepancies(res.data.discrepancies);
      setIsDiscrepancyOpen(true);
      
      // Reload lists
      fetchCycles();
      // Reload selected cycle
      handleViewItems({ ...selectedCycle, status: 'Closed' });
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to close audit cycle.');
    }
  };

  // Toggle multi-select auditors
  const handleAuditorToggle = (empId) => {
    const selected = [...createForm.auditorIds];
    const idx = selected.indexOf(empId);
    if (idx > -1) {
      selected.splice(idx, 1);
    } else {
      selected.push(empId);
    }
    setCreateForm({ ...createForm, auditorIds: selected });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto text-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-200">
            Physical Audits
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Initiate verification sweeps, reconcile missing assets, or update assigned checklist logs.
          </p>
        </div>

        {isAdminOrManager && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-violet-600/15 active:scale-95 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Audit Cycle
          </button>
        )}
      </div>

      {/* Global Alerts */}
      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Left side Cycle lists, Right side Item view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Cycles List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-bold text-slate-200">Active & Past Cycles</h2>
          
          {loadingCycles ? (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
            </div>
          ) : cycles.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
              <p className="text-slate-500 text-sm">No audit sweeps registered yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cycles.map((cy) => (
                <div
                  key={cy.id}
                  onClick={() => handleViewItems(cy)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedCycle?.id === cy.id
                      ? 'bg-violet-600/10 border-violet-500/30'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-200 text-sm leading-tight">{cy.scope}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      cy.status === 'Open'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse'
                        : 'bg-slate-800 text-slate-500 border-slate-700/50'
                    }`}>
                      {cy.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Schedule: {new Date(cy.startDate).toLocaleDateString()} — {new Date(cy.endDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Items Checklist */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
          {selectedCycle ? (
            <div>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-200">{selectedCycle.scope} Checklist</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Cycle Status: <span className="font-semibold text-violet-400">{selectedCycle.status}</span>
                  </p>
                </div>

                {isAdminOrManager && selectedCycle.status === 'Open' && (
                  <button
                    onClick={handleCloseCycle}
                    className="px-3.5 py-2 bg-red-950/20 hover:bg-red-500/20 border border-red-500/25 text-red-400 text-xs font-semibold rounded-xl transition-all"
                  >
                    Close Cycle & Reconcile
                  </button>
                )}
              </div>

              {loadingItems ? (
                <div className="py-20 flex justify-center">
                  <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
                </div>
              ) : auditItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 text-sm">No items mapped in this cycle.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="text-xs uppercase bg-slate-950/40 text-slate-500 border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Asset Tag</th>
                        <th className="px-4 py-3 font-semibold">Asset Name</th>
                        <th className="px-4 py-3 font-semibold">Location</th>
                        <th className="px-4 py-3 font-semibold">Auditor</th>
                        <th className="px-4 py-3 font-semibold text-right">Verification Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {auditItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/10 transition-colors">
                          <td className="px-4 py-3 font-bold text-violet-400">{item.asset?.tag}</td>
                          <td className="px-4 py-3 text-slate-200">{item.asset?.name}</td>
                          <td className="px-4 py-3 text-slate-400">{item.asset?.location}</td>
                          <td className="px-4 py-3 text-xs text-slate-500">{item.auditor?.name}</td>
                          <td className="px-4 py-3 text-right">
                            {selectedCycle.status === 'Open' ? (
                              <select
                                value={item.result}
                                onChange={(e) => handleResultChange(item.id, e.target.value)}
                                className="px-2.5 py-1 text-xs bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-lg text-slate-300 outline-none cursor-pointer"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Verified">Verified</option>
                                <option value="Missing">Missing</option>
                                <option value="Damaged">Damaged</option>
                              </select>
                            ) : (
                              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                item.result === 'Verified'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : item.result === 'Pending'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : 'bg-red-500/10 text-red-400 border-red-500/20'
                              }`}>
                                {item.result}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">
              <svg className="w-12 h-12 mx-auto text-slate-850 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm">Select an active or historical cycle from the left panel to display checklists.</p>
            </div>
          )}
        </div>
      </div>

      {/* ─── CREATE MODAL ─── */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Audit Cycle"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Scope Description *</label>
            <input
              type="text"
              required
              placeholder="e.g. Q3 Electronics Audit, Head Office Check"
              value={createForm.scope}
              onChange={(e) => setCreateForm({ ...createForm, scope: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl text-slate-100 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Start Date *</label>
              <input
                type="date"
                required
                value={createForm.startDate}
                onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl text-slate-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">End Date *</label>
              <input
                type="date"
                required
                value={createForm.endDate}
                onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl text-slate-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Select Auditors (Multi-select) *</label>
            <div className="mt-1 max-h-36 overflow-y-auto border border-slate-850 bg-slate-950/60 p-3 rounded-xl space-y-2">
              {employees.map((emp) => (
                <label key={emp.id} className="flex items-center gap-2.5 text-sm text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={createForm.auditorIds.includes(emp.id)}
                    onChange={() => handleAuditorToggle(emp.id)}
                    className="rounded bg-slate-950 border-slate-800 text-violet-600 focus:ring-0 cursor-pointer"
                  />
                  <span>{emp.name} ({emp.role})</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 border border-slate-700 text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-violet-600/10"
            >
              Create Cycle
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── DISCREPANCY LIST REPORT MODAL ─── */}
      <Modal
        isOpen={isDiscrepancyOpen}
        onClose={() => setIsDiscrepancyOpen(false)}
        title="Audit Cycle Discrepancy Log"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-slate-300 text-sm">
            Reconciliation completed! Below are the items flagged as **Missing** (marked Lost in DB) or **Damaged** / **Pending** for this cycle:
          </p>

          {discrepancies.length === 0 ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-center text-sm">
              No discrepancies! All assets successfully audited and verified.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-850 rounded-xl">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs bg-slate-950/80 text-slate-500 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-2.5">Asset Tag</th>
                    <th className="px-4 py-2.5">Asset Name</th>
                    <th className="px-4 py-2.5">Auditor</th>
                    <th className="px-4 py-2.5 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {discrepancies.map((d) => (
                    <tr key={d.id} className="text-xs hover:bg-slate-800/10">
                      <td className="px-4 py-2.5 font-bold text-violet-400">{d.asset?.tag}</td>
                      <td className="px-4 py-2.5 text-slate-200">{d.asset?.name}</td>
                      <td className="px-4 py-2.5 text-slate-400">{d.auditor?.name}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={`px-2 py-0.5 rounded font-semibold border ${
                          d.result === 'Missing'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {d.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setIsDiscrepancyOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              Close Report
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
