import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [kpis, setKpis] = useState(null);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      setErrorMsg(null);
      const [kpiRes, overdueRes] = await Promise.all([
        api.get('/dashboard/kpis'),
        api.get('/dashboard/overdue-returns')
      ]);
      setKpis(kpiRes.data);
      setOverdue(overdueRes.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="dark min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto text-slate-100 min-h-screen">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-sky-300">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Here is the status of organization assets, bookings, and active maintenance checks.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 mb-8">
        {/* Metric 1 */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available Assets</span>
          <span className="text-3xl font-extrabold text-slate-200 mt-2 block">{kpis?.available ?? 0}</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Allocated Assets</span>
          <span className="text-3xl font-extrabold text-slate-200 mt-2 block">{kpis?.allocated ?? 0}</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Maintenance Today</span>
          <span className="text-3xl font-extrabold text-amber-400 mt-2 block">{kpis?.maintenanceToday ?? 0}</span>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Bookings</span>
          <span className="text-3xl font-extrabold text-purple-400 mt-2 block">{kpis?.activeBookings ?? 0}</span>
        </div>

        {/* Metric 5 */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Transfers</span>
          <span className="text-3xl font-extrabold text-blue-400 mt-2 block">{kpis?.pendingTransfers ?? 0}</span>
        </div>

        {/* Metric 6 */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Upcoming Returns</span>
          <span className="text-3xl font-extrabold text-slate-200 mt-2 block">{kpis?.upcomingReturns ?? 0}</span>
        </div>
      </div>

      {/* Main Grid: Overdue Returns and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Overdue Returns */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-red-500/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-3xl rounded-full" />
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-400 shrink-0 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Overdue Returns Alert
          </h2>

          {overdue.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
              <p className="text-emerald-400 font-semibold text-sm">Perfect! No asset returns are currently overdue.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {overdue.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate('/allocations')}
                  className="p-4 bg-slate-950/40 border border-red-500/10 hover:border-red-500/30 rounded-xl flex items-center justify-between transition-all cursor-pointer text-sm"
                >
                  <div>
                    <span className="text-xs font-bold text-red-400">{item.assetTag}</span>
                    <h3 className="font-semibold text-slate-200 mt-0.5">{item.assetName}</h3>
                    <p className="text-xs text-slate-500 mt-1">Holder: {item.holderName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-red-500/80 block">Due Date</span>
                    <span className="text-xs font-medium text-red-400">{new Date(item.expectedReturnDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Quick Actions */}
        <div className="lg:col-span-1 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
          <h2 className="text-lg font-bold text-slate-200 mb-4">Quick Workflows</h2>
          <div className="space-y-3">
            <Link
              to="/assets"
              className="w-full flex items-center justify-between p-3.5 bg-slate-950 border border-slate-850 hover:border-indigo-500/45 rounded-xl transition-all font-medium text-sm text-slate-200"
            >
              <span>Register Assets</span>
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              to="/bookings"
              className="w-full flex items-center justify-between p-3.5 bg-slate-950 border border-slate-850 hover:border-indigo-500/45 rounded-xl transition-all font-medium text-sm text-slate-200"
            >
              <span>Book Resources</span>
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              to="/maintenance"
              className="w-full flex items-center justify-between p-3.5 bg-slate-950 border border-slate-850 hover:border-indigo-500/45 rounded-xl transition-all font-medium text-sm text-slate-200"
            >
              <span>Raise Maintenance Ticket</span>
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
