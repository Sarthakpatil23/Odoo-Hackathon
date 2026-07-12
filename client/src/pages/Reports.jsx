import { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import api from '../api/axios';

// Curated Premium Theme Colors
const COLORS = {
  Available: '#10b981', // Emerald Green
  Allocated: '#3b82f6', // Blue
  Reserved: '#8b5cf6', // Purple
  UnderMaintenance: '#f59e0b', // Amber/Yellow
  Lost: '#6b7280', // Gray
  Retired: '#374151', // Dark Gray
  Disposed: '#ef4444', // Red

  // General Pie colors if status name not matched
  pieColors: ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']
};

export default function Reports() {
  const [statusData, setStatusData] = useState([]);
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [statusRes, maintenanceRes] = await Promise.all([
        api.get('/reports/asset-status-breakdown'),
        api.get('/reports/maintenance-by-category')
      ]);
      setStatusData(statusRes.data);
      setMaintenanceData(maintenanceRes.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to fetch reporting analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Custom tooltips for premium feel
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs font-semibold shadow-2xl">
          <p className="text-slate-400 uppercase tracking-wider">{payload[0].name}</p>
          <p className="text-slate-100 text-sm mt-0.5">
            Count: <span className="text-violet-400 font-bold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto text-slate-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-200">
          Analytics Reports
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          High-level metrics, status allocations breakdowns, and category maintenance tallies.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
          <span className="text-slate-400 text-sm">Compiling statistics...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart 1: Status Breakdown */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
            <h2 className="text-lg font-bold text-slate-200 mb-6">Asset Status Distribution</h2>
            {statusData.length === 0 ? (
              <div className="py-24 text-center text-slate-500 italic text-sm">No asset status data found.</div>
            ) : (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="48%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[entry.name] || COLORS.pieColors[index % COLORS.pieColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={10}
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Chart 2: Maintenance by Category */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
            <h2 className="text-lg font-bold text-slate-200 mb-6">Maintenance Requests by Category</h2>
            {maintenanceData.length === 0 ? (
              <div className="py-24 text-center text-slate-500 italic text-sm">No maintenance request counts registered.</div>
            ) : (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={maintenanceData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#475569"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#475569"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} />
                    <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={45}>
                      {maintenanceData.map((entry, index) => (
                        <Cell key={`bar-cell-${index}`} fill="#6366f1" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
