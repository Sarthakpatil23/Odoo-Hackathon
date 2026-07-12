import { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export default function Maintenance() {
  const { user } = useAuth();
  const isAdminOrManager = user?.role === 'Admin' || user?.role === 'AssetManager';

  // Data Lists
  const [requests, setRequests] = useState([]);
  const [assets, setAssets] = useState([]);

  // Loaders & Alerts
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form State
  const [isRaiseOpen, setIsRaiseOpen] = useState(false);
  const [raiseForm, setRaiseForm] = useState({
    assetId: '',
    issue: '',
    priority: 'Medium',
    photoUrl: ''
  });

  // Assign Modal State
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedReqId, setSelectedReqId] = useState(null);
  const [technicianName, setTechnicianName] = useState('');

  const fetchMaintenanceRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/maintenance');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load maintenance requests.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssetsForRaise = async () => {
    try {
      // Scoped assets from backend
      const res = await api.get('/assets');
      setAssets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMaintenanceRequests();
    fetchAssetsForRaise();
  }, []);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 5000);
  };

  const handleRaiseSubmit = async (e) => {
    e.preventDefault();
    if (!raiseForm.assetId || !raiseForm.issue.trim()) {
      showError('Please select an asset and write an issue.');
      return;
    }

    try {
      await api.post('/maintenance', raiseForm);
      showSuccess('Maintenance request submitted successfully.');
      setIsRaiseOpen(false);
      setRaiseForm({ assetId: '', issue: '', priority: 'Medium', photoUrl: '' });
      fetchMaintenanceRequests();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to submit request.');
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/maintenance/${id}/approve`);
      showSuccess('Maintenance request approved. Asset is now Under Maintenance.');
      fetchMaintenanceRequests();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to approve request.');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/maintenance/${id}/reject`);
      showSuccess('Maintenance request rejected.');
      fetchMaintenanceRequests();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to reject request.');
    }
  };

  const handleOpenAssignModal = (id) => {
    setSelectedReqId(id);
    setTechnicianName('');
    setIsAssignOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!technicianName.trim()) return;

    try {
      await api.patch(`/maintenance/${selectedReqId}/assign`, { technician: technicianName });
      showSuccess(`Technician "${technicianName}" assigned.`);
      setIsAssignOpen(false);
      setSelectedReqId(null);
      fetchMaintenanceRequests();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to assign technician.');
    }
  };

  const handleStart = async (id) => {
    try {
      await api.patch(`/maintenance/${id}/start`);
      showSuccess('Maintenance work started.');
      fetchMaintenanceRequests();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to start maintenance.');
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.patch(`/maintenance/${id}/resolve`);
      showSuccess('Maintenance resolved. Asset is back online.');
      fetchMaintenanceRequests();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to resolve request.');
    }
  };

  const getPriorityBadge = (priority) => {
    const classes = {
      Low: 'bg-slate-800 text-slate-400 border border-slate-700/50',
      Medium: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      High: 'bg-red-500/10 text-red-400 border border-red-500/20',
    };
    return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${classes[priority]}`}>{priority}</span>;
  };

  const getStatusBadge = (status) => {
    const classes = {
      Pending: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      Approved: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      Rejected: 'bg-red-500/10 text-red-400 border border-red-500/20',
      TechnicianAssigned: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
      InProgress: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
      Resolved: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${classes[status] || 'bg-slate-800'}`}>
        {status === 'TechnicianAssigned' ? 'Tech Assigned' : status === 'InProgress' ? 'In Progress' : status}
      </span>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto text-slate-100 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-200">
            Maintenance request tickets
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            File repair reports or manage active technicians and workflow status.
          </p>
        </div>

        <button
          onClick={() => setIsRaiseOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-violet-600/15 active:scale-95 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Raise Request
        </button>
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

      {/* Requests Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 px-4">
            <svg className="w-12 h-12 mx-auto text-slate-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
            <p className="text-slate-400 text-sm mb-4">No active maintenance tickets logged.</p>
            <button
              onClick={() => setIsRaiseOpen(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm transition-colors"
            >
              Raise Request
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950/40 text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Asset Tag</th>
                  <th className="px-6 py-4 font-semibold">Issue</th>
                  <th className="px-6 py-4 font-semibold">Priority</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Technician</th>
                  <th className="px-6 py-4 font-semibold">Raised By</th>
                  <th className="px-6 py-4 font-semibold">Date Raised</th>
                  {isAdminOrManager && <th className="px-6 py-4 font-semibold text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-violet-400">{req.asset?.tag}</td>
                    <td className="px-6 py-4 text-slate-200">
                      <div>
                        <p className="font-medium">{req.issue}</p>
                        {req.photoUrl && (
                          <a href={req.photoUrl} target="_blank" rel="noreferrer" className="text-[10px] text-violet-400 hover:underline block mt-1">View Image</a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getPriorityBadge(req.priority)}</td>
                    <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                    <td className="px-6 py-4 text-slate-400">{req.technician || <span className="text-slate-600 italic">— None</span>}</td>
                    <td className="px-6 py-4 text-slate-400">{req.raisedBy?.name}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                    {isAdminOrManager && (
                      <td className="px-6 py-4 text-right space-x-2">
                        {req.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(req.id)}
                              className="px-2.5 py-1.5 bg-emerald-950/20 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(req.id)}
                              className="px-2.5 py-1.5 bg-red-950/20 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-semibold rounded-lg transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {req.status === 'Approved' && (
                          <button
                            onClick={() => handleOpenAssignModal(req.id)}
                            className="px-2.5 py-1.5 bg-indigo-950/20 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-lg transition-colors"
                          >
                            Assign Tech
                          </button>
                        )}
                        {req.status === 'TechnicianAssigned' && (
                          <button
                            onClick={() => handleStart(req.id)}
                            className="px-2.5 py-1.5 bg-orange-950/20 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 text-xs font-semibold rounded-lg transition-colors"
                          >
                            Start Work
                          </button>
                        )}
                        {req.status === 'InProgress' && (
                          <button
                            onClick={() => handleResolve(req.id)}
                            className="px-2.5 py-1.5 bg-emerald-950/20 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg transition-colors"
                          >
                            Resolve Ticket
                          </button>
                        )}
                        {req.status === 'Resolved' && (
                          <span className="text-xs text-slate-600 italic">Resolved</span>
                        )}
                        {req.status === 'Rejected' && (
                          <span className="text-xs text-slate-600 italic">Rejected</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── RAISE REQUEST MODAL ─── */}
      <Modal
        isOpen={isRaiseOpen}
        onClose={() => setIsRaiseOpen(false)}
        title="Raise Maintenance Request"
      >
        <form onSubmit={handleRaiseSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Select Asset *</label>
            <select
              required
              value={raiseForm.assetId}
              onChange={(e) => setRaiseForm({ ...raiseForm, assetId: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl text-slate-100 outline-none cursor-pointer"
            >
              <option value="">Select Asset</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>{asset.tag} - {asset.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Describe Issue *</label>
            <textarea
              required
              placeholder="Describe the issue or defect in detail..."
              value={raiseForm.issue}
              onChange={(e) => setRaiseForm({ ...raiseForm, issue: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl text-slate-100 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Priority *</label>
            <select
              value={raiseForm.priority}
              onChange={(e) => setRaiseForm({ ...raiseForm, priority: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl text-slate-100 outline-none cursor-pointer"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Photo URL (Optional)</label>
            <input
              type="text"
              placeholder="e.g. https://example.com/asset-defect.jpg"
              value={raiseForm.photoUrl}
              onChange={(e) => setRaiseForm({ ...raiseForm, photoUrl: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl text-slate-100 outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
            <button
              type="button"
              onClick={() => setIsRaiseOpen(false)}
              className="px-4 py-2 border border-slate-700 text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-violet-600/10"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── ASSIGN TECHNICIAN MODAL ─── */}
      <Modal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title="Assign Technician"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Technician Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Robert Martin, TechTeam Ltd."
              value={technicianName}
              onChange={(e) => setTechnicianName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl text-slate-100 outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
            <button
              type="button"
              onClick={() => setIsAssignOpen(false)}
              className="px-4 py-2 border border-slate-700 text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-violet-600/10"
            >
              Assign
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
