import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/shared/Card';
import { StatusDot } from '../components/shared/StatusDot';
import { Skeleton } from '../components/shared/Skeleton';
import { Button } from '../components/ui/button';
import {
  Info,
  Inbox,
  Package,
  UserCheck,
  Wrench,
  Calendar,
  ArrowLeftRight,
  Clock,
  Plus,
  RefreshCw
} from 'lucide-react';

const DATA_BY_ROLE = {
  Admin: {
    kpis: [
      { label: 'Assets Available', value: 128, icon: Package },
      { label: 'Assets Allocated', value: 76, icon: UserCheck },
      { label: 'Maintenance Today', value: 4, icon: Wrench },
      { label: 'Active Bookings', value: 9, icon: Calendar },
      { label: 'Pending Transfers', value: 3, icon: ArrowLeftRight },
      { label: 'Upcoming Returns', value: 12, icon: Clock },
    ],
    overdue: [
      { tag: 'AF-0043', name: 'Aarav Patel', days: 5 },
      { tag: 'AF-0129', name: 'Sarah Connor', days: 3 },
      { tag: 'AF-0098', name: 'John Doe', days: 1 },
    ],
    activity: [
      { tag: 'AF-0114', status: 'info', text: 'allocated to Priya Shah, IT Department', time: '10:42 AM' },
      { tag: 'Room B2', status: 'info', text: 'booking confirmed, 2:00–3:00 PM', time: '09:15 AM' },
      { tag: 'AF-0062', status: 'success', text: 'maintenance resolved', time: 'Yesterday' },
    ]
  },
  AssetManager: {
    kpis: [
      { label: 'Assets Available', value: 128, icon: Package },
      { label: 'Assets Allocated', value: 76, icon: UserCheck },
      { label: 'Maintenance Today', value: 4, icon: Wrench },
      { label: 'Active Bookings', value: 9, icon: Calendar },
      { label: 'Pending Transfers', value: 3, icon: ArrowLeftRight },
      { label: 'Upcoming Returns', value: 12, icon: Clock },
    ],
    overdue: [
      { tag: 'AF-0043', name: 'Aarav Patel', days: 5 },
      { tag: 'AF-0129', name: 'Sarah Connor', days: 3 },
      { tag: 'AF-0098', name: 'John Doe', days: 1 },
    ],
    activity: [
      { tag: 'AF-0114', status: 'info', text: 'allocated to Priya Shah, IT Department', time: '10:42 AM' },
      { tag: 'Room B2', status: 'info', text: 'booking confirmed, 2:00–3:00 PM', time: '09:15 AM' },
      { tag: 'AF-0062', status: 'success', text: 'maintenance resolved', time: 'Yesterday' },
    ]
  },
  DepartmentHead: {
    kpis: [
      { label: 'Assets Available', value: 42, icon: Package },
      { label: 'Assets Allocated', value: 24, icon: UserCheck },
      { label: 'Maintenance Today', value: 1, icon: Wrench },
      { label: 'Active Bookings', value: 2, icon: Calendar },
      { label: 'Pending Transfers', value: 1, icon: ArrowLeftRight },
      { label: 'Upcoming Returns', value: 3, icon: Clock },
    ],
    overdue: [
      { tag: 'AF-0043', name: 'Aarav Patel', days: 5 },
    ],
    activity: [
      { tag: 'AF-0114', status: 'info', text: 'allocated to Priya Shah, IT Department', time: '10:42 AM' },
      { tag: 'Room B2', status: 'info', text: 'booking confirmed, 2:00–3:00 PM', time: '09:15 AM' },
    ]
  },
  Employee: {
    kpis: [
      { label: 'Assets Available', value: 3, icon: Package },
      { label: 'Assets Allocated', value: 2, icon: UserCheck },
      { label: 'Maintenance Today', value: 0, icon: Wrench },
      { label: 'Active Bookings', value: 1, icon: Calendar },
      { label: 'Pending Transfers', value: 0, icon: ArrowLeftRight },
      { label: 'Upcoming Returns', value: 1, icon: Clock },
    ],
    overdue: [],
    activity: [
      { tag: 'Room B2', status: 'info', text: 'booking confirmed, 2:00–3:00 PM', time: '09:15 AM' },
    ]
  }
};

export default function Dashboard() {
  const { user } = useAuth();
  const [currentRole, setCurrentRole] = useState(user?.role || 'Admin');
  const [loading, setLoading] = useState(false);
  const [simulatedData, setSimulatedData] = useState(DATA_BY_ROLE[currentRole] || DATA_BY_ROLE.Admin);

  // Sync role selector when context updates
  useEffect(() => {
    if (user?.role) {
      setCurrentRole(user.role);
    }
  }, [user]);

  // Handle role change with a simulated skeleton loading experience
  const handleRoleChange = (role) => {
    setLoading(true);
    setCurrentRole(role);
    setTimeout(() => {
      setSimulatedData(DATA_BY_ROLE[role]);
      setLoading(false);
    }, 600); // 600ms linear ease pulse feel
  };

  const triggerReload = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-foreground">Overview</h1>
        </div>
        
        {/* Interactive role simulator - very premium for client-side review */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-card border border-border p-1 rounded-lg">
          <span className="text-[10px] uppercase font-mono text-muted-foreground-2 px-2">Role SIM:</span>
          {Object.keys(DATA_BY_ROLE).map((role) => (
            <button
              key={role}
              onClick={() => handleRoleChange(role)}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                currentRole === role
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
            >
              {role === 'AssetManager' ? 'Asset Mgr' : role === 'DepartmentHead' ? 'Dept Head' : role}
            </button>
          ))}
          <button 
            onClick={triggerReload}
            className="p-1 hover:text-foreground hover:bg-white/5 rounded text-muted-foreground transition-colors"
            title="Reload State"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Primary KPI & Overdue Section Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* KPI Section */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-foreground">Usage</h2>
              <Info size={14} className="text-muted-foreground" />
            </div>
            
            <div className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-4 w-8" />
                  </div>
                ))
              ) : (
                simulatedData.kpis.map((kpi, idx) => {
                  const Icon = kpi.icon;
                  return (
                    <div key={idx} className="py-3 flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3 text-foreground">
                        <Icon size={16} className="text-muted-foreground" />
                        <span>{kpi.label}</span>
                      </div>
                      <span className="font-mono text-foreground">{kpi.value}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Card>

        {/* Overdue Section */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h2 className="text-sm font-medium text-foreground">Overdue Returns</h2>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Info size={14} />
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {loading ? (
              <div className="space-y-4 py-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-3 rounded-full" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            ) : simulatedData.overdue.length === 0 ? (
              /* Empty state (e.g. employee role has 0 overdue returns) */
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <Inbox size={32} className="text-muted-foreground-2 mb-2 stroke-[1.5px]" />
                <p className="text-sm text-muted-foreground">No overdue returns.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {simulatedData.overdue.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <StatusDot status="overdue" label="" className="shrink-0" />
                      <span className="font-mono text-foreground">{item.tag}</span>
                      <span className="text-muted-foreground truncate max-w-[120px] sm:max-w-none">{item.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.days} {item.days === 1 ? 'day' : 'days'} overdue</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Actions Panel */}
        <div className="md:col-span-1 space-y-3 flex flex-col justify-start">
          <h3 className="text-sm font-medium text-muted-foreground px-0.5">Quick Actions</h3>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 hover:bg-white/5 active:bg-white/10"
          >
            <Plus size={16} />
            <span>Register Asset</span>
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 hover:bg-white/5 active:bg-white/10"
          >
            <Calendar size={16} />
            <span>Book Resource</span>
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 hover:bg-white/5 active:bg-white/10"
          >
            <Wrench size={16} />
            <span>Raise Maintenance Request</span>
          </Button>
        </div>

        {/* Recent Activity Panel */}
        <div className="md:col-span-2 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground px-0.5">Recent Activity</h3>
          <Card className="p-0 border border-border">
            <div className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-2 w-2 rounded-full" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))
              ) : (
                simulatedData.activity.map((act, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between text-sm hover:bg-card-hover transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <StatusDot status={act.status} label="" className="shrink-0" />
                      <div className="truncate text-foreground">
                        <span className="font-mono mr-1.5">{act.tag}</span>
                        <span className="text-muted-foreground">{act.text}</span>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground-2 shrink-0 ml-2">{act.time}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
