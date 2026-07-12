import { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export default function Allocations() {
  const { user } = useAuth();

  const isAdminOrManager = user?.role === 'Admin' || user?.role === 'AssetManager';
  const isApprover = user?.role === 'Admin' || user?.role === 'AssetManager' || user?.role === 'DepartmentHead';

  // Active Tab: 'allocations' or 'transfers'
  const [activeTab, setActiveTab] = useState('allocations');

  // Lists
  const [activeAllocations, setActiveAllocations] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Loaders
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Allocate Form State
  const [allocateForm, setAllocateForm] = useState({
    assetId: '',
    holderType: 'Employee', // 'Employee' or 'Department'
    employeeId: '',
    departmentId: '',
    expectedReturnDate: '',
  });

  // Conflict state (from 409)
  const [conflictData, setConflictData] = useState(null);

  // Modals
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedAllocId, setSelectedAllocId] = useState(null);
  const [conditionNotes, setConditionNotes] = useState('');

  const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false);
  const [isRejectConfirmOpen, setIsRejectConfirmOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);

  // ─── Fetching Data ─────────────────────────────────────────────────────────

  const fetchAllocations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/allocations', { params: { status: 'Active' } });
      setActiveAllocations(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load allocations.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/transfers');
      setTransfers(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load transfer requests.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFormData = async () => {
    try {
      // 1. Fetch available assets (status=Available)
      const assetRes = await api.get('/assets', { params: { status: 'Available' } });
      setAssets(assetRes.data);

      // 2. Fetch Active employees
      const empRes = await api.get('/employees', { params: { status: 'Active' } });
      setEmployees(empRes.data);

      // 3. Fetch Active departments
      const deptRes = await api.get('/departments', { params: { status: 'Active' } });
      setDepartments(deptRes.data);
    } catch (err) {
      console.error('Error fetching form details', err);
    }
  };

  useEffect(() => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setConflictData(null);
    if (activeTab === 'allocations') {
      fetchAllocations();
      fetchFormData();
    } else {
      fetchTransfers();
    }
  }, [activeTab]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 5000);
  };

  // ─── Allocation Actions ────────────────────────────────────────────────────

  const handleAllocateSubmit = async (e) => {
    e.preventDefault();
    setConflictData(null);
    setErrorMsg(null);

    const { assetId, holderType, employeeId, departmentId, expectedReturnDate } = allocateForm;

    if (!assetId) {
      showError('Please select an asset.');
      return;
    }

    if (holderType === 'Employee' && !employeeId) {
      showError('Please select an employee.');
      return;
    }

    if (holderType === 'Department' && !departmentId) {
      showError('Please select a department.');
      return;
    }

    try {
      const payload = {
        assetId,
        employeeId: holderType === 'Employee' ? employeeId : null,
        departmentId: holderType === 'Department' ? departmentId : null,
        expectedReturnDate: expectedReturnDate || null,
      };

      await api.post('/allocations', payload);
      showSuccess('Asset successfully allocated!');
      
      // Reset form
      setAllocateForm({
        assetId: '',
        holderType: 'Employee',
        employeeId: '',
        departmentId: '',
        expectedReturnDate: '',
      });

      // Reload
      fetchAllocations();
      fetchFormData();
    } catch (err) {
      if (err.response?.status === 409) {
        // Conflict detected: asset is currently held by someone else
        setConflictData(err.response.data);
      } else {
        showError(err.response?.data?.error || 'Failed to allocate asset.');
      }
    }
  };

  const handleRequestTransfer = async () => {
    if (!conflictData?.allocationId) return;

    try {
      setErrorMsg(null);
      await api.post('/transfers', { allocationId: conflictData.allocationId });
      showSuccess('Transfer request submitted successfully. The current holder and manager have been notified.');
      setConflictData(null);
      
      // Reset form
      setAllocateForm({
        assetId: '',
        holderType: 'Employee',
        employeeId: '',
        departmentId: '',
        expectedReturnDate: '',
      });

      // Reload form data
      fetchFormData();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to submit transfer request.');
    }
  };

  const handleOpenReturnModal = (allocId) => {
    setSelectedAllocId(allocId);
    setConditionNotes('');
    setIsReturnModalOpen(true);
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAllocId) return;

    try {
      await api.patch(`/allocations/${selectedAllocId}/return`, {
        conditionNotes: conditionNotes.trim() || null,
      });
      showSuccess('Asset successfully returned and marked Available.');
      setIsReturnModalOpen(false);
      setSelectedAllocId(null);
      fetchAllocations();
      fetchFormData();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to return asset.');
    }
  };

  // ─── Transfer Actions ──────────────────────────────────────────────────────

  const handleApproveConfirm = (transfer) => {
    setSelectedTransfer(transfer);
    setIsApproveConfirmOpen(true);
  };

  const handleRejectConfirm = (transfer) => {
    setSelectedTransfer(transfer);
    setIsRejectConfirmOpen(true);
  };

  const handleApproveTransfer = async () => {
    if (!selectedTransfer) return;
    try {
      await api.patch(`/transfers/${selectedTransfer.id}/approve`);
      showSuccess('Transfer request approved and reallocated.');
      setIsApproveConfirmOpen(false);
      setSelectedTransfer(null);
      fetchTransfers();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to approve transfer.');
      setIsApproveConfirmOpen(false);
    }
  };

  const handleRejectTransfer = async () => {
    if (!selectedTransfer) return;
    try {
      await api.patch(`/transfers/${selectedTransfer.id}/reject`);
      showSuccess('Transfer request rejected.');
      setIsRejectConfirmOpen(false);
      setSelectedTransfer(null);
      fetchTransfers();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to reject transfer.');
      setIsRejectConfirmOpen(false);
    }
  };

  // Helpers
  const getTransferStatusClass = (status) => {
    const classes = {
      Requested: 'bg-amber-500/10 text-amber-400 border border-amber-500/25',
      Approved: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
      Rejected: 'bg-red-500/10 text-red-400 border border-red-500/25',
      Reallocated: 'bg-blue-500/10 text-blue-400 border border-blue-500/25',
    };
    return `inline-flex px-2 py-0.5 rounded text-xs font-semibold ${classes[status] || 'bg-slate-800'}`;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto text-slate-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-sky-300">
          Allocations & Transfers
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Allocate assets, process return drop-offs, and request or approve asset transfers.
        </p>
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

      {/* Tab Controls */}
      <div className="flex border-b border-slate-800 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('allocations')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all duration-200 ${
            activeTab === 'allocations'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          } rounded-t-xl`}
        >
          Asset Allocations
        </button>
        <button
          onClick={() => setActiveTab('transfers')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all duration-200 ${
            activeTab === 'transfers'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          } rounded-t-xl`}
        >
          Transfers
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === 'allocations' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 1. Allocate Asset Form */}
            <div className="lg:col-span-1 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
              <h2 className="text-xl font-bold text-slate-200 mb-4">Allocate Asset</h2>
              
              <form onSubmit={handleAllocateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Select Asset *</label>
                  <select
                    value={allocateForm.assetId}
                    onChange={(e) => {
                      setAllocateForm({ ...allocateForm, assetId: e.target.value });
                      setConflictData(null);
                    }}
                    className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-100 outline-none cursor-pointer"
                  >
                    <option value="">Select Available Asset</option>
                    {assets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.tag} - {asset.name} ({asset.categoryName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Allocate To *</label>
                  <div className="flex gap-4 mb-2">
                    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="holderType"
                        value="Employee"
                        checked={allocateForm.holderType === 'Employee'}
                        onChange={() => setAllocateForm({ ...allocateForm, holderType: 'Employee', departmentId: '' })}
                        className="text-indigo-600 focus:ring-0 cursor-pointer bg-slate-950 border-slate-800"
                      />
                      Individual Employee
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="holderType"
                        value="Department"
                        checked={allocateForm.holderType === 'Department'}
                        onChange={() => setAllocateForm({ ...allocateForm, holderType: 'Department', employeeId: '' })}
                        className="text-indigo-600 focus:ring-0 cursor-pointer bg-slate-950 border-slate-800"
                      />
                      Department
                    </label>
                  </div>

                  {allocateForm.holderType === 'Employee' ? (
                    <select
                      value={allocateForm.employeeId}
                      onChange={(e) => setAllocateForm({ ...allocateForm, employeeId: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-100 outline-none cursor-pointer"
                    >
                      <option value="">Select Employee</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={allocateForm.departmentId}
                      onChange={(e) => setAllocateForm({ ...allocateForm, departmentId: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-100 outline-none cursor-pointer"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Expected Return Date</label>
                  <input
                    type="date"
                    value={allocateForm.expectedReturnDate}
                    onChange={(e) => setAllocateForm({ ...allocateForm, expectedReturnDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-100 outline-none"
                  />
                </div>

                {/* Inline Conflict message and Transfer request trigger */}
                {conflictData && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs space-y-3">
                    <p className="text-red-400 font-semibold flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {conflictData.error}
                    </p>
                    <p className="text-slate-300">
                      Currently held by: <strong className="text-white">{conflictData.currentHolder?.name}</strong> ({conflictData.currentHolder?.type})
                    </p>
                    <button
                      type="button"
                      onClick={handleRequestTransfer}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors border border-indigo-500 text-center"
                    >
                      Request Transfer
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/10 active:scale-95"
                >
                  Allocate Asset
                </button>
              </form>
            </div>

            {/* 2. Active Allocations List */}
            <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-slate-200 mb-4">Active Allocations</h2>
              
              {loading && activeAllocations.length === 0 ? (
                <div className="py-12 flex justify-center">
                  <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
                </div>
              ) : activeAllocations.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl">
                  <p className="text-slate-500 text-sm">No active asset allocations found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="text-xs uppercase bg-slate-950/40 text-slate-500 border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Asset</th>
                        <th className="px-4 py-3 font-semibold">Allocated To</th>
                        <th className="px-4 py-3 font-semibold">Date Allocated</th>
                        <th className="px-4 py-3 font-semibold">Expected Return</th>
                        {isAdminOrManager && <th className="px-4 py-3 font-semibold text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {activeAllocations.map((alloc) => (
                        <tr key={alloc.id} className="hover:bg-slate-800/15 transition-colors">
                          <td className="px-4 py-3">
                            <span className="font-bold text-indigo-400 block text-xs">{alloc.asset.tag}</span>
                            <span className="text-slate-200 font-medium">{alloc.asset.name}</span>
                          </td>
                          <td className="px-4 py-3">
                            {alloc.employee ? (
                              <div>
                                <p className="text-slate-200">{alloc.employee.name}</p>
                                <span className="text-[10px] text-slate-500">Employee</span>
                              </div>
                            ) : alloc.department ? (
                              <div>
                                <p className="text-slate-200">{alloc.department.name}</p>
                                <span className="text-[10px] text-slate-500">Department</span>
                              </div>
                            ) : (
                              <span className="text-slate-600 italic">Unknown</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">
                            {new Date(alloc.allocatedAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">
                            {alloc.expectedReturnDate ? (
                              new Date(alloc.expectedReturnDate).toLocaleDateString()
                            ) : (
                              <span className="text-slate-600 italic">—</span>
                            )}
                          </td>
                          {isAdminOrManager && (
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleOpenReturnModal(alloc.id)}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                              >
                                Mark Returned
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB B: TRANSFERS */}
        {activeTab === 'transfers' && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-200 mb-4">Transfer Requests</h2>

            {loading && transfers.length === 0 ? (
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : transfers.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl">
                <p className="text-slate-500 text-sm">No transfer requests logged.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase bg-slate-950/40 text-slate-500 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Asset</th>
                      <th className="px-4 py-3 font-semibold">Current Holder</th>
                      <th className="px-4 py-3 font-semibold">Requested By</th>
                      <th className="px-4 py-3 font-semibold">Date Requested</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      {isApprover && <th className="px-4 py-3 font-semibold text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {transfers.map((tr) => {
                      const oldHolder = tr.allocation?.employee?.name || tr.allocation?.department?.name || 'Unknown';
                      return (
                        <tr key={tr.id} className="hover:bg-slate-800/15 transition-colors">
                          <td className="px-4 py-3">
                            <span className="font-bold text-indigo-400 block text-xs">{tr.allocation?.asset?.tag}</span>
                            <span className="text-slate-200 font-medium">{tr.allocation?.asset?.name}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-300">{oldHolder}</td>
                          <td className="px-4 py-3 text-slate-300">{tr.requestedBy?.name}</td>
                          <td className="px-4 py-3 text-xs text-slate-400">
                            {new Date(tr.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">{getTransferStatusClass(tr.status)}</td>
                          {isApprover && (
                            <td className="px-4 py-3 text-right space-x-2">
                              {tr.status === 'Requested' ? (
                                <>
                                  <button
                                    onClick={() => handleApproveConfirm(tr)}
                                    className="px-2.5 py-1.5 bg-emerald-950/20 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg transition-colors"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleRejectConfirm(tr)}
                                    className="px-2.5 py-1.5 bg-red-950/20 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-semibold rounded-lg transition-colors"
                                  >
                                    Reject
                                  </button>
                                </>
                              ) : (
                                <span className="text-xs text-slate-600 italic">No action pending</span>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── MODALS ─── */}

      {/* 1. Return Asset Condition Notes Modal */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Record Asset Return"
      >
        <form onSubmit={handleReturnSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
              Condition & Check-in Notes (Optional)
            </label>
            <textarea
              placeholder="Describe the asset condition (e.g., returned with minor scratches, condition is Good)."
              value={conditionNotes}
              onChange={(e) => setConditionNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-100 outline-none placeholder-slate-600 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsReturnModalOpen(false)}
              className="px-4 py-2 border border-slate-700 text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/10"
            >
              Record Return
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. Approve Transfer Modal */}
      <Modal
        isOpen={isApproveConfirmOpen}
        onClose={() => setIsApproveConfirmOpen(false)}
        title="Approve Transfer"
      >
        <div className="space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            Are you sure you want to approve this transfer? The asset{' '}
            <strong className="text-slate-100">
              "{selectedTransfer?.allocation?.asset?.tag} - {selectedTransfer?.allocation?.asset?.name}"
            </strong>{' '}
            will be immediately reallocated to{' '}
            <strong className="text-slate-100">"{selectedTransfer?.requestedBy?.name}"</strong>.
          </p>
          <div className="bg-blue-500/10 border border-blue-500/20 text-blue-300 p-3 rounded-lg text-xs leading-normal">
            <strong>Note:</strong> The asset status remains Allocated throughout the reallocation. Only the holder changes hands.
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsApproveConfirmOpen(false)}
              className="px-4 py-2 border border-slate-700 text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApproveTransfer}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white text-sm font-semibold rounded-xl transition-all"
            >
              Confirm Approval
            </button>
          </div>
        </div>
      </Modal>

      {/* 3. Reject Transfer Modal */}
      <Modal
        isOpen={isRejectConfirmOpen}
        onClose={() => setIsRejectConfirmOpen(false)}
        title="Reject Transfer Request"
      >
        <div className="space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            Are you sure you want to reject this transfer request for asset{' '}
            <strong className="text-slate-100">
              "{selectedTransfer?.allocation?.asset?.tag}"
            </strong>{' '}
            requested by <strong className="text-slate-100">"{selectedTransfer?.requestedBy?.name}"</strong>?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsRejectConfirmOpen(false)}
              className="px-4 py-2 border border-slate-700 text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRejectTransfer}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Reject Request
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
