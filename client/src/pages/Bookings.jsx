import { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export default function Bookings() {
  const { user } = useAuth();

  // Data Lists
  const [bookableAssets, setBookableAssets] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [existingBookings, setExistingBookings] = useState([]);
  const [userBookings, setUserBookings] = useState([]);

  // Loaders & Message States
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [loadingMyBookings, setLoadingMyBookings] = useState(false);

  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [conflictSlot, setConflictSlot] = useState(null);

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    startTime: '',
    endTime: '',
  });

  // Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  // ─── Fetching Data ─────────────────────────────────────────────────────────

  const fetchBookableAssets = async () => {
    setLoadingAssets(true);
    try {
      const res = await api.get('/assets', { params: { bookable: 'true' } });
      setBookableAssets(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load bookable assets.');
    } finally {
      setLoadingAssets(false);
    }
  };

  const fetchExistingBookings = async (assetId) => {
    if (!assetId) {
      setExistingBookings([]);
      return;
    }
    setLoadingSchedule(true);
    try {
      const res = await api.get('/bookings', { params: { assetId } });
      setExistingBookings(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load resource schedule.');
    } finally {
      setLoadingSchedule(false);
    }
  };

  const fetchUserBookings = async () => {
    setLoadingMyBookings(true);
    try {
      const res = await api.get('/bookings');
      setUserBookings(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load your bookings.');
    } finally {
      setLoadingMyBookings(false);
    }
  };

  useEffect(() => {
    fetchBookableAssets();
    fetchUserBookings();
  }, []);

  useEffect(() => {
    setConflictSlot(null);
    fetchExistingBookings(selectedAssetId);
  }, [selectedAssetId]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 5000);
  };

  // ─── Booking Actions ───────────────────────────────────────────────────────

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setConflictSlot(null);
    setErrorMsg(null);

    const { startTime, endTime } = bookingForm;

    if (!selectedAssetId) {
      showError('Please select a resource first.');
      return;
    }

    if (!startTime || !endTime) {
      showError('Start time and End time are required.');
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      showError('End time must be after start time.');
      return;
    }

    try {
      await api.post('/bookings', {
        assetId: selectedAssetId,
        startTime,
        endTime,
      });

      showSuccess('Time slot booked successfully!');
      
      // Reset form
      setBookingForm({ startTime: '', endTime: '' });

      // Refresh schedule and user bookings lists
      fetchExistingBookings(selectedAssetId);
      fetchUserBookings();
    } catch (err) {
      if (err.response?.status === 409) {
        setConflictSlot(err.response.data.conflictingBooking);
      } else {
        showError(err.response?.data?.error || 'Failed to place booking.');
      }
    }
  };

  const handleOpenCancelModal = (booking) => {
    setBookingToCancel(booking);
    setIsCancelModalOpen(true);
  };

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;
    try {
      await api.patch(`/bookings/${bookingToCancel.id}/cancel`);
      showSuccess('Booking cancelled successfully.');
      setIsCancelModalOpen(false);
      setBookingToCancel(null);

      // Refresh lists
      fetchUserBookings();
      if (selectedAssetId) {
        fetchExistingBookings(selectedAssetId);
      }
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to cancel booking.');
      setIsCancelModalOpen(false);
    }
  };

  const getStatusClass = (status) => {
    const classes = {
      Upcoming: 'bg-purple-500/10 text-purple-400 border border-purple-500/25',
      Ongoing: 'bg-blue-500/10 text-blue-400 border border-blue-500/25',
      Completed: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
      Cancelled: 'bg-slate-800 text-slate-500 border border-slate-700/30',
    };
    return `inline-flex px-2 py-0.5 rounded text-xs font-semibold ${classes[status] || 'bg-slate-800'}`;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto text-slate-100 min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-sky-300">
          Resource Booking
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Reserve shared workspace resources, rooms, or equipment for specific slots.
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

      {/* Select Resource Section */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg mb-8">
        <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
          Select Bookable Resource
        </label>
        <select
          value={selectedAssetId}
          onChange={(e) => setSelectedAssetId(e.target.value)}
          className="w-full max-w-xl px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-100 outline-none cursor-pointer transition-colors"
        >
          <option value="">Choose a bookable resource (e.g. conference room, projector)...</option>
          {bookableAssets.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.tag} - {asset.name} ({asset.location})
            </option>
          ))}
        </select>
      </div>

      {/* Scheduler Dashboard (Columns visible only after selecting resource) */}
      {selectedAssetId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Column A: Booking Form */}
          <div className="lg:col-span-1 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
            <h2 className="text-xl font-bold text-slate-200 mb-4">Book Time Slot</h2>

            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Start Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={bookingForm.startTime}
                  onChange={(e) => {
                    setBookingForm({ ...bookingForm, startTime: e.target.value });
                    setConflictSlot(null);
                  }}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">End Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={bookingForm.endTime}
                  onChange={(e) => {
                    setBookingForm({ ...bookingForm, endTime: e.target.value });
                    setConflictSlot(null);
                  }}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-100 outline-none"
                />
              </div>

              {conflictSlot && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs space-y-2">
                  <p className="font-semibold flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Time Slot Overlap
                  </p>
                  <p className="text-slate-300">
                    This resource is already booked by <strong className="text-white">{conflictSlot.bookerName}</strong> during this slot:
                  </p>
                  <code className="block bg-slate-950 px-2 py-1 rounded text-red-300 font-mono text-[10px] text-center">
                    {new Date(conflictSlot.startTime).toLocaleString()} — {new Date(conflictSlot.endTime).toLocaleString()}
                  </code>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white text-sm font-semibold rounded-xl transition-all shadow-md active:scale-95"
              >
                Confirm Reservation
              </button>
            </form>
          </div>

          {/* Column B: Current Bookings List */}
          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-200 mb-4">Resource Schedule</h2>

            {loadingSchedule ? (
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : existingBookings.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
                <p className="text-slate-500 text-sm">No reservations logged for this resource yet.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {existingBookings.map((b) => (
                  <div key={b.id} className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center justify-between text-sm">
                    <div>
                      <p className="font-semibold text-slate-200">
                        {new Date(b.startTime).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} —{' '}
                        {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="text-right text-xs">
                      <span className="text-slate-500">Booked by</span>
                      <p className="font-medium text-indigo-400 mt-0.5">{b.employee?.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Directory Section: My Bookings */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-slate-200 mb-4">
          {user?.role === 'Admin' || user?.role === 'AssetManager' ? 'Active Bookings' : 'My Reservations'}
        </h2>

        {loadingMyBookings && userBookings.length === 0 ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : userBookings.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl">
            <p className="text-slate-500 text-sm">No reservations found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950/40 text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Resource</th>
                  <th className="px-4 py-3 font-semibold">Booker</th>
                  <th className="px-4 py-3 font-semibold">Start Time</th>
                  <th className="px-4 py-3 font-semibold">End Time</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {userBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/15 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-bold text-indigo-400 block text-xs">{b.asset?.tag}</span>
                      <span className="text-slate-200 font-medium">{b.asset?.name}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{b.employee?.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{new Date(b.startTime).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{new Date(b.endTime).toLocaleString()}</td>
                    <td className="px-4 py-3">{getStatusClass(b.status)}</td>
                    <td className="px-4 py-3 text-right">
                      {b.status === 'Upcoming' ? (
                        <button
                          onClick={() => handleOpenCancelModal(b)}
                          className="px-3 py-1.5 bg-red-950/20 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-semibold rounded-lg transition-colors"
                        >
                          Cancel Booking
                        </button>
                      ) : (
                        <span className="text-xs text-slate-600 italic">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CANCEL MODAL */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Reservation"
      >
        <div className="space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            Are you sure you want to cancel your reservation for resource{' '}
            <strong className="text-slate-100">"{bookingToCancel?.asset?.name}"</strong>?
          </p>
          <p className="text-xs text-slate-400">
            Cancellations are permanent. The reserved time slot will become available for other employees immediately.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsCancelModalOpen(false)}
              className="px-4 py-2 border border-slate-700 text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleCancelBooking}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Cancel Reservation
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
