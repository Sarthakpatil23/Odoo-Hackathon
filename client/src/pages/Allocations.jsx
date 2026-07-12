import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/shared/Toast';
import { Card } from '../components/shared/Card';
import { StatusDot } from '../components/shared/StatusDot';
import { Skeleton } from '../components/shared/Skeleton';
import { Button } from '../components/ui/button';
import {
  X,
  Plus,
  MoreHorizontal,
  AlertTriangle,
  Calendar,
  Search,
  ChevronDown,
  Info,
  Clock,
  ArrowRight,
  Users,
  CheckCircle2,
  Package,
  ArrowLeftRight,
  ClipboardList,
  User
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Local Micro-primitives (design.md compliant)
// ─────────────────────────────────────────────────────────────────────────────

function PrimaryButton({ children, onClick, type = 'button', disabled, id, className = '' }) {
  return (
    <button
      id={id}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5
        rounded-md px-3 py-1.5
        bg-[#EDEDED] text-[#0A0A0A]
        text-sm font-medium
        hover:bg-white
        disabled:opacity-40 disabled:pointer-events-none
        transition-colors
        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:ring-offset-1 focus-visible:ring-offset-background
        ${className}
      `}
    >
      {children}
    </button>
  );
}

function OutlineButton({ children, onClick, type = 'button', disabled, id, className = '' }) {
  return (
    <button
      id={id}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5
        rounded-md px-3 py-1.5
        border border-border bg-transparent text-foreground
        text-sm font-medium
        hover:bg-white/5
        disabled:opacity-40 disabled:pointer-events-none
        transition-colors
        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:ring-offset-1 focus-visible:ring-offset-background
        ${className}
      `}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, id, 'aria-label': ariaLabel, className = '' }) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`
        inline-flex items-center justify-center p-1.5
        rounded text-muted-foreground hover:text-foreground hover:bg-white/5
        transition-colors
        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20
        ${className}
      `}
    >
      {children}
    </button>
  );
}

function Dialog({ open, onClose, title, description, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const handle = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-md rounded-lg border border-border bg-popover p-6 shadow-xl animate-fade-in text-left">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 id="dialog-title" className="text-sm font-medium text-foreground">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <GhostButton onClick={onClose} aria-label="Close dialog">
            <X className="h-4 w-4" />
          </GhostButton>
        </div>
        <div className="space-y-4">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

function AlertDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirm' }) {
  useEffect(() => {
    if (!open) return;
    const handle = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alert-title"
      aria-describedby="alert-desc"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-sm rounded-lg border border-border bg-popover p-6 shadow-xl animate-fade-in text-left">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
          <div>
            <h2 id="alert-title" className="text-sm font-medium text-foreground">{title}</h2>
            <p id="alert-desc" className="mt-1 text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <OutlineButton onClick={onClose}>Cancel</OutlineButton>
          <PrimaryButton onClick={() => { onConfirm(); onClose(); }}>
            {confirmLabel}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function Sheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const handle = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [open, onClose]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-surface border-l border-border flex flex-col shadow-xl text-left"
        style={{
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 260ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-sm font-medium text-foreground">{title}</h2>
          <GhostButton onClick={onClose} aria-label="Close sheet">
            <X className="h-4 w-4" />
          </GhostButton>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">{children}</div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Initial Seed Data
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_EMPLOYEES = [
  { id: 'emp-1', name: 'Priya Shah', email: 'priya@assetflow.com', dept: 'Engineering' },
  { id: 'emp-2', name: 'Aarav Patel', email: 'aarav@assetflow.com', dept: 'Marketing' },
  { id: 'emp-3', name: 'Sarah Connor', email: 'sarah@assetflow.com', dept: 'Operations' },
  { id: 'emp-4', name: 'Arjun Nair', email: 'arjun@assetflow.com', dept: 'Design' },
];

const INITIAL_ASSETS = [
  { id: 'asset-1', tag: 'AF-0114', name: 'Dell Laptop', category: 'IT Hardware', status: 'Allocated' },
  { id: 'asset-2', tag: 'AF-0052', name: 'Dell 27" Monitor', category: 'IT Hardware', status: 'Available' },
  { id: 'asset-3', tag: 'AF-0081', name: 'Conference Room A', category: 'Space', status: 'Available' },
  { id: 'asset-4', tag: 'AF-0142', name: 'Tesla Model Y', category: 'Vehicle', status: 'Allocated' },
  { id: 'asset-5', tag: 'AF-0099', name: 'iPhone 15 Pro', category: 'IT Hardware', status: 'Available' },
];

const INITIAL_ALLOCATIONS = [
  {
    id: 'alloc-1',
    assetId: 'asset-1',
    holderId: 'emp-1',
    allocatedDate: '2026-03-12',
    expectedReturn: '2026-07-01', // Past date, will trigger Overdue status
  },
  {
    id: 'alloc-2',
    assetId: 'asset-4',
    holderId: 'emp-3',
    allocatedDate: '2026-06-10',
    expectedReturn: '2026-08-10', // Future date
  }
];

const INITIAL_TRANSFERS = [
  {
    id: 'transfer-1',
    assetId: 'asset-1',
    fromId: 'emp-1',
    toId: 'emp-2',
    requestedDate: '2026-07-10',
    reason: 'Priya Shah is moving to remote work and does not need the office laptop. Transferring ownership to Aarav Patel.',
    status: 'Requested'
  }
];

const INITIAL_HISTORIES = {
  'asset-1': [
    { date: '2026-03-12', action: 'Allocated to Priya Shah – Engineering' },
    { date: '2026-01-04', action: 'Returned by Arjun Nair – Condition: Good' }
  ],
  'asset-4': [
    { date: '2026-06-10', action: 'Allocated to Sarah Connor – Operations' },
    { date: '2026-05-15', action: 'Returned by Priya Shah – Condition: Fair' }
  ]
};

export default function Allocations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isManagerOrAdmin = user?.role === 'Admin' || user?.role === 'AssetManager';

  // State managers
  const [activeTab, setActiveTab] = useState('allocations');
  const [loading, setLoading] = useState(false);
  
  const [allocations, setAllocations] = useState(INITIAL_ALLOCATIONS);
  const [transfers, setTransfers] = useState(INITIAL_TRANSFERS);
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [histories, setHistories] = useState(INITIAL_HISTORIES);

  // Dialog and Sheet States
  const [allocOpen, setAllocOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);

  // Focus items
  const [selectedAssetForReturn, setSelectedAssetForReturn] = useState(null);
  const [selectedAllocationDetail, setSelectedAllocationDetail] = useState(null);
  const [selectedTransferForAction, setSelectedTransferForAction] = useState(null);

  // Form states for Allocate/Transfer
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [transferToId, setTransferToId] = useState('');
  const [transferReason, setTransferReason] = useState('');

  // Row menus
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);

  // Close menus on clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Simulate loading state on mount
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, [activeTab]);

  // Derived assets database helpers
  const getAsset = (id) => assets.find(a => a.id === id);
  const getEmployee = (id) => INITIAL_EMPLOYEES.find(e => e.id === id);

  // Detect allocation state
  const getAllocationForAsset = (assetId) => {
    return allocations.find(a => a.assetId === assetId);
  };

  const isAssetAllocated = (assetId) => {
    return allocations.some(a => a.assetId === assetId);
  };

  // Status mapping
  const getAllocationStatus = (alloc) => {
    const today = new Date('2026-07-12'); // Mock local date from metadata
    const returnDate = new Date(alloc.expectedReturn);
    return returnDate < today ? 'overdue' : 'allocated';
  };

  // Handlers
  const handleOpenAllocate = () => {
    setSelectedAssetId('');
    setSelectedEmployeeId('');
    setExpectedReturnDate('');
    setTransferToId('');
    setTransferReason('');
    setAllocOpen(true);
  };

  const submitAllocationOrTransfer = (e) => {
    e.preventDefault();

    if (!selectedAssetId) return;

    const asset = getAsset(selectedAssetId);
    const isCurrentlyAllocated = isAssetAllocated(selectedAssetId);

    if (isCurrentlyAllocated) {
      // Create a Transfer Request
      if (!transferToId || !transferReason.trim()) {
        toast('Please fill in all transfer fields.');
        return;
      }

      const activeAlloc = getAllocationForAsset(selectedAssetId);
      
      const newTransfer = {
        id: `transfer-${Date.now()}`,
        assetId: selectedAssetId,
        fromId: activeAlloc.holderId,
        toId: transferToId,
        requestedDate: '2026-07-12',
        reason: transferReason,
        status: 'Requested'
      };

      setTransfers([newTransfer, ...transfers]);
      
      // Update history
      const prevHist = histories[selectedAssetId] || [];
      setHistories({
        ...histories,
        [selectedAssetId]: [
          { date: '2026-07-12', action: `Transfer request submitted for ${getEmployee(transferToId)?.name}` },
          ...prevHist
        ]
      });

      toast(`Transfer request for ${asset.name} submitted successfully.`);
    } else {
      // Create regular Allocation
      if (!selectedEmployeeId) {
        toast('Please select an employee.');
        return;
      }

      const newAlloc = {
        id: `alloc-${Date.now()}`,
        assetId: selectedAssetId,
        holderId: selectedEmployeeId,
        allocatedDate: '2026-07-12',
        expectedReturn: expectedReturnDate || '2026-08-12'
      };

      setAllocations([newAlloc, ...allocations]);

      // Update asset status
      setAssets(assets.map(a => a.id === selectedAssetId ? { ...a, status: 'Allocated' } : a));

      // Add history
      const prevHist = histories[selectedAssetId] || [];
      const employeeName = getEmployee(selectedEmployeeId)?.name;
      const employeeDept = getEmployee(selectedEmployeeId)?.dept;
      setHistories({
        ...histories,
        [selectedAssetId]: [
          { date: '2026-07-12', action: `Allocated to ${employeeName} – ${employeeDept}` },
          ...prevHist
        ]
      });

      toast(`Successfully allocated ${asset.name} to ${employeeName}.`);
    }

    setAllocOpen(false);
  };

  const handleReturn = (alloc) => {
    setSelectedAssetForReturn(alloc);
    setReturnOpen(true);
  };

  const submitReturn = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const condition = data.get('condition');
    const notes = data.get('notes');

    if (!selectedAssetForReturn) return;

    const { assetId, holderId } = selectedAssetForReturn;
    const asset = getAsset(assetId);
    const holder = getEmployee(holderId);

    // Remove from active allocations
    setAllocations(allocations.filter(a => a.id !== selectedAssetForReturn.id));

    // Update asset status in database
    setAssets(assets.map(a => a.id === assetId ? { ...a, status: 'Available' } : a));

    // Append to allocation history
    const prevHist = histories[assetId] || [];
    setHistories({
      ...histories,
      [assetId]: [
        { date: '2026-07-12', action: `Returned by ${holder.name} – Condition: ${condition}${notes ? ` (${notes})` : ''}` },
        ...prevHist
      ]
    });

    toast(`${asset.name} successfully marked returned.`);
    setReturnOpen(false);
  };

  const handleApproveTransfer = () => {
    if (!selectedTransferForAction) return;

    const { assetId, toId, fromId } = selectedTransferForAction;
    const asset = getAsset(assetId);
    const toEmployee = getEmployee(toId);

    // Re-allocate asset: update holder on allocation row
    setAllocations(allocations.map(a => {
      if (a.assetId === assetId) {
        return {
          ...a,
          holderId: toId,
          allocatedDate: '2026-07-12' // Reset allocation date to today
        };
      }
      return a;
    }));

    // Update transfer status
    setTransfers(transfers.map(t => {
      if (t.id === selectedTransferForAction.id) {
        return { ...t, status: 'Approved' };
      }
      return t;
    }));

    // Append to history
    const prevHist = histories[assetId] || [];
    setHistories({
      ...histories,
      [assetId]: [
        { date: '2026-07-12', action: `Transfer approved. Custody re-allocated to ${toEmployee.name}` },
        ...prevHist
      ]
    });

    toast(`Transfer request for ${asset.name} approved.`);
  };

  const handleRejectTransfer = () => {
    if (!selectedTransferForAction) return;

    const asset = getAsset(selectedTransferForAction.assetId);

    // Update transfer status
    setTransfers(transfers.map(t => {
      if (t.id === selectedTransferForAction.id) {
        return { ...t, status: 'Rejected' };
      }
      return t;
    }));

    toast(`Transfer request for ${asset.name} rejected.`);
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Page Header and Allocate Trigger */}
      <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-foreground">Allocation & Transfer</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage physical asset custody, assign items, and process handover requests</p>
        </div>
        
        {isManagerOrAdmin && (
          <PrimaryButton onClick={handleOpenAllocate}>
            <Plus className="h-4 w-4" />
            <span>Allocate Asset</span>
          </PrimaryButton>
        )}
      </div>

      {/* Underline Tabs */}
      <div className="flex border-b border-border select-none">
        <button
          onClick={() => setActiveTab('allocations')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'allocations'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Active Allocations
        </button>
        <button
          onClick={() => setActiveTab('transfers')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'transfers'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Transfer Requests
        </button>
      </div>

      {/* Tab Contents */}
      <div className="min-h-[300px]">
        {loading ? (
          <Card className="p-0 border border-border overflow-hidden">
            <div className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </Card>
        ) : activeTab === 'allocations' ? (
          allocations.length === 0 ? (
            <div className="flex justify-center py-20">
              <div className="text-center max-w-sm space-y-4">
                <div className="flex justify-center text-muted-foreground">
                  <ClipboardList size={36} className="text-muted-foreground-2" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">No active allocations</h3>
                  <p className="text-xs text-muted-foreground mt-1">Assign hardware or workspaces to your team to begin tracking custody logs.</p>
                </div>
                {isManagerOrAdmin && (
                  <div className="flex justify-center">
                    <OutlineButton onClick={handleOpenAllocate}>Allocate your first asset</OutlineButton>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Card className="p-0 border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-card/50 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      <th className="py-3 px-4 font-normal">Asset</th>
                      <th className="py-3 px-4 font-normal">Holder</th>
                      <th className="py-3 px-4 font-normal">Department</th>
                      <th className="py-3 px-4 font-normal">Allocated Date</th>
                      <th className="py-3 px-4 font-normal">Expected Return</th>
                      <th className="py-3 px-4 font-normal">Status</th>
                      {isManagerOrAdmin && <th className="py-3 px-4 text-right"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {allocations.map((alloc) => {
                      const asset = getAsset(alloc.assetId);
                      const holder = getEmployee(alloc.holderId);
                      const status = getAllocationStatus(alloc);

                      return (
                        <tr 
                          key={alloc.id} 
                          className="hover:bg-white/[0.03] cursor-pointer transition-colors group"
                          onClick={() => {
                            setSelectedAllocationDetail(alloc);
                            setDetailOpen(true);
                          }}
                        >
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="font-mono text-foreground text-sm font-medium">{asset?.tag}</span>
                              <span className="text-xs text-muted-foreground mt-0.5">{asset?.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-foreground">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-card border border-border flex items-center justify-center font-bold text-[9px] text-muted-foreground shrink-0 uppercase">
                                {holder?.name?.[0]}
                              </div>
                              <span className="text-sm">{holder?.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground text-sm">{holder?.dept}</td>
                          <td className="py-3 px-4 text-muted-foreground font-mono text-sm">{alloc.allocatedDate}</td>
                          <td className="py-3 px-4 text-muted-foreground font-mono text-sm">{alloc.expectedReturn}</td>
                          <td className="py-3 px-4">
                            <StatusDot status={status} className="text-xs" />
                          </td>
                          {isManagerOrAdmin && (
                            <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="relative inline-block text-left" ref={activeMenuId === alloc.id ? menuRef : null}>
                                <GhostButton 
                                  onClick={() => setActiveMenuId(activeMenuId === alloc.id ? null : alloc.id)}
                                  aria-label="Actions"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </GhostButton>
                                {activeMenuId === alloc.id && (
                                  <div className="absolute right-0 mt-1 w-36 origin-top-right rounded-md border border-border bg-popover py-1 shadow-lg z-20">
                                    <button
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        handleReturn(alloc);
                                      }}
                                      className="w-full px-3 py-1.5 text-left text-xs text-foreground hover:bg-white/5 transition-colors"
                                    >
                                      Mark Returned
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )
        ) : (
          transfers.length === 0 ? (
            <div className="flex justify-center py-20">
              <div className="text-center max-w-sm space-y-4">
                <div className="flex justify-center text-muted-foreground">
                  <ArrowLeftRight size={36} className="text-muted-foreground-2" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">No transfer requests</h3>
                  <p className="text-xs text-muted-foreground mt-1">Handovers and departmental transfers will be listed here when submitted.</p>
                </div>
              </div>
            </div>
          ) : (
            <Card className="p-0 border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-card/50 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      <th className="py-3 px-4 font-normal">Asset</th>
                      <th className="py-3 px-4 font-normal">From</th>
                      <th className="py-3 px-4 font-normal">To</th>
                      <th className="py-3 px-4 font-normal">Requested Date</th>
                      <th className="py-3 px-4 font-normal">Status</th>
                      {isManagerOrAdmin && <th className="py-3 px-4 text-right"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {transfers.map((t) => {
                      const asset = getAsset(t.assetId);
                      const fromEmp = getEmployee(t.fromId);
                      const toEmp = getEmployee(t.toId);

                      return (
                        <tr 
                          key={t.id} 
                          className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                          onClick={() => {
                            const matchingAlloc = getAllocationForAsset(t.assetId) || {
                              allocatedDate: '—',
                              expectedReturn: '—'
                            };
                            setSelectedAllocationDetail({
                              ...matchingAlloc,
                              assetId: t.assetId,
                              holderId: t.fromId,
                              transferDetail: t
                            });
                            setDetailOpen(true);
                          }}
                        >
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="font-mono text-foreground text-sm font-medium">{asset?.tag}</span>
                              <span className="text-xs text-muted-foreground mt-0.5">{asset?.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-foreground">
                            <span className="text-sm font-normal">{fromEmp?.name}</span>
                          </td>
                          <td className="py-3 px-4 text-foreground">
                            <span className="text-sm font-normal">{toEmp?.name}</span>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground font-mono text-sm">{t.requestedDate}</td>
                          <td className="py-3 px-4">
                            <StatusDot status={t.status === 'Requested' ? 'warning' : t.status === 'Approved' ? 'success' : 'info'} label={t.status} className="text-xs" />
                          </td>
                          {isManagerOrAdmin && t.status === 'Requested' && (
                            <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="relative inline-block text-left" ref={activeMenuId === t.id ? menuRef : null}>
                                <GhostButton 
                                  onClick={() => setActiveMenuId(activeMenuId === t.id ? null : t.id)}
                                  aria-label="Actions"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </GhostButton>
                                {activeMenuId === t.id && (
                                  <div className="absolute right-0 mt-1 w-32 origin-top-right rounded-md border border-border bg-popover py-1 shadow-lg z-20">
                                    <button
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        setSelectedTransferForAction(t);
                                        setConfirmApproveOpen(true);
                                      }}
                                      className="w-full px-3 py-1.5 text-left text-xs text-foreground hover:bg-white/5 transition-colors"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        setSelectedTransferForAction(t);
                                        setConfirmRejectOpen(true);
                                      }}
                                      className="w-full px-3 py-1.5 text-left text-xs text-danger hover:bg-white/5 transition-colors"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )
        )}
      </div>

      {/* Allocate Asset / Conflict Flow Dialog */}
      <Dialog
        open={allocOpen}
        onClose={() => setAllocOpen(false)}
        title={selectedAssetId && isAssetAllocated(selectedAssetId) ? 'Submit Transfer Request' : 'Allocate Asset'}
      >
        <form onSubmit={submitAllocationOrTransfer} className="space-y-4">
          {/* Asset Selection */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="assetSelect">
              Select Asset
            </label>
            <select
              id="assetSelect"
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="w-full bg-card border border-border focus:border-border-strong focus:ring-1 focus:ring-white/10 rounded-md px-3 py-2 text-sm text-foreground outline-none transition-all"
            >
              <option value="">-- Choose Asset --</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.tag} – {a.name} ({a.status})
                </option>
              ))}
            </select>
          </div>

          {/* Conditional rendering based on allocation conflict */}
          {selectedAssetId && isAssetAllocated(selectedAssetId) ? (
            <div className="space-y-4 animate-fade-in">
              {/* Conflict Message: Clean Bordered Alert (design.md Compliant) */}
              <div className="p-3 border border-danger/30 rounded bg-transparent text-danger text-xs leading-relaxed flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Already allocated to <strong>{getEmployee(getAllocationForAsset(selectedAssetId)?.holderId)?.name}</strong> ({getEmployee(getAllocationForAsset(selectedAssetId)?.holderId)?.dept}). Direct re-allocation is blocked — submit a transfer request below.
                </span>
              </div>

              {/* History preview within the conflict panel */}
              <div className="space-y-2 border-t border-border pt-3">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">Allocation History</span>
                <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                  {(histories[selectedAssetId] || []).map((h, i) => (
                    <div key={i} className="flex gap-2 text-xs leading-normal py-1 border-t border-border/40 first:border-t-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#5C5C5C] mt-1.5 shrink-0" />
                      <div className="flex-1 flex justify-between">
                        <span className="text-muted-foreground">{h.action}</span>
                        <span className="font-mono text-[10px] text-muted-foreground-2 shrink-0">{h.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transfer Request Fields */}
              <div className="space-y-4 border-t border-border pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">From</label>
                    <input
                      type="text"
                      readOnly
                      value={getEmployee(getAllocationForAsset(selectedAssetId)?.holderId)?.name || ''}
                      className="w-full bg-black/30 border border-border rounded-md px-3 py-1.5 text-xs text-muted-foreground outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="transferTo">To</label>
                    <select
                      id="transferTo"
                      value={transferToId}
                      onChange={(e) => setTransferToId(e.target.value)}
                      className="w-full bg-card border border-border focus:border-border-strong focus:ring-1 focus:ring-white/10 rounded-md px-3 py-1.5 text-xs text-foreground outline-none transition-all"
                    >
                      <option value="">-- Target Holder --</option>
                      {INITIAL_EMPLOYEES.filter(e => e.id !== getAllocationForAsset(selectedAssetId)?.holderId).map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name} ({e.dept})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground" htmlFor="reason">
                    Reason for Transfer
                  </label>
                  <textarea
                    id="reason"
                    required
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    rows="3"
                    placeholder="Enter justification for reallocation..."
                    className="w-full bg-card border border-border focus:border-border-strong focus:ring-1 focus:ring-white/10 rounded-md px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground-2 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <OutlineButton onClick={() => setAllocOpen(false)}>Cancel</OutlineButton>
                <PrimaryButton type="submit">Submit Request</PrimaryButton>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Normal Allocation Fields */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="employeeSelect">
                  Allocate to Employee
                </label>
                <select
                  id="employeeSelect"
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full bg-card border border-border focus:border-border-strong focus:ring-1 focus:ring-white/10 rounded-md px-3 py-2 text-sm text-foreground outline-none transition-all"
                >
                  <option value="">-- Choose Employee --</option>
                  {INITIAL_EMPLOYEES.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.dept})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="returnDate">
                  Expected Return Date
                </label>
                <input
                  id="returnDate"
                  type="date"
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  className="w-full bg-card border border-border focus:border-border-strong focus:ring-1 focus:ring-white/10 rounded-md px-3 py-2 text-sm text-foreground outline-none transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <OutlineButton onClick={() => setAllocOpen(false)}>Cancel</OutlineButton>
                <PrimaryButton type="submit">Allocate</PrimaryButton>
              </div>
            </div>
          )}
        </form>
      </Dialog>

      {/* Return Flow Dialog */}
      <Dialog
        open={returnOpen}
        onClose={() => setReturnOpen(false)}
        title="Check-In / Return Asset"
      >
        <form onSubmit={submitReturn} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="conditionSelect">
              Asset Condition
            </label>
            <select
              id="conditionSelect"
              name="condition"
              required
              className="w-full bg-card border border-border focus:border-border-strong focus:ring-1 focus:ring-white/10 rounded-md px-3 py-2 text-sm text-foreground outline-none transition-all"
            >
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Damaged">Damaged</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="notesArea">
              Return Notes (Optional)
            </label>
            <textarea
              id="notesArea"
              name="notes"
              rows="3"
              placeholder="e.g. Returned power brick; screen clean..."
              className="w-full bg-card border border-border focus:border-border-strong focus:ring-1 focus:ring-white/10 rounded-md px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground-2 outline-none transition-all"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <OutlineButton onClick={() => setReturnOpen(false)}>Cancel</OutlineButton>
            <PrimaryButton type="submit">Confirm Return</PrimaryButton>
          </div>
        </form>
      </Dialog>

      {/* Right Detail Sheet */}
      <Sheet
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedAllocationDetail(null);
        }}
        title="Allocation Details"
      >
        {selectedAllocationDetail && (() => {
          const asset = getAsset(selectedAllocationDetail.assetId);
          const holder = getEmployee(selectedAllocationDetail.holderId);
          const transfer = selectedAllocationDetail.transferDetail;

          return (
            <div className="space-y-6 text-left">
              {/* Asset Box */}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Asset Identity</span>
                <div className="mt-1 flex items-center justify-between border border-border rounded-md p-3 bg-card/40">
                  <div>
                    <p className="font-mono text-sm text-foreground font-semibold">{asset?.tag}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{asset?.name}</p>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground bg-black/35 border border-border px-1.5 py-0.5 rounded">
                    {asset?.category}
                  </span>
                </div>
              </div>

              {/* Custody Box */}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  {transfer ? 'Sender Profile' : 'Custodian Info'}
                </span>
                <div className="mt-1 border border-border rounded-md p-3 bg-card/40 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-card border border-border flex items-center justify-center font-bold text-[9px] text-muted-foreground uppercase">
                      {holder?.name?.[0]}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">{holder?.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{holder?.email}</p>
                    </div>
                  </div>
                  <div className="border-t border-border/40 pt-2 flex justify-between text-xs">
                    <span className="text-muted-foreground">Department</span>
                    <span className="text-foreground">{holder?.dept}</span>
                  </div>
                </div>
              </div>

              {/* Transfer request details */}
              {transfer && (
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Target Recipient</span>
                  <div className="mt-1 border border-border rounded-md p-3 bg-card/40 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-card border border-border flex items-center justify-center font-bold text-[9px] text-muted-foreground uppercase">
                        {getEmployee(transfer.toId)?.name?.[0]}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">{getEmployee(transfer.toId)?.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{getEmployee(transfer.toId)?.dept} Department</p>
                      </div>
                    </div>
                    
                    <div className="border-t border-border/40 pt-2 space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground-2 block">Transfer Justification</span>
                      <p className="text-xs text-muted-foreground bg-black/20 p-2 rounded border border-border/50 italic leading-relaxed">
                        "{transfer.reason}"
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Dates */}
              {!transfer && (
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Schedule</span>
                  <div className="mt-1 border border-border rounded-md p-3 bg-card/40 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Allocation Date</span>
                      <span className="text-foreground font-mono">{selectedAllocationDetail.allocatedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expected Return</span>
                      <span className="text-foreground font-mono">{selectedAllocationDetail.expectedReturn}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline History */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">Allocation Log History</span>
                <div className="relative border-l border-border pl-3 ml-1.5 space-y-4">
                  {(histories[selectedAllocationDetail.assetId] || []).map((log, index) => (
                    <div key={index} className="relative text-xs">
                      {/* Timeline Node Dot */}
                      <span className="absolute -left-[16px] top-1 h-2 w-2 rounded-full bg-[#5C5C5C] border-2 border-surface shrink-0" />
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-muted-foreground leading-normal">{log.action}</span>
                        <span className="font-mono text-[10px] text-muted-foreground-2 shrink-0">{log.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transfer approval actions footer */}
              {transfer && transfer.status === 'Requested' && isManagerOrAdmin && (
                <div className="border-t border-border pt-4 flex gap-2 justify-end">
                  <OutlineButton 
                    onClick={() => {
                      setDetailOpen(false);
                      setSelectedTransferForAction(transfer);
                      setConfirmRejectOpen(true);
                    }}
                    className="text-danger border-danger/30 hover:bg-danger/10"
                  >
                    Reject Transfer
                  </OutlineButton>
                  <PrimaryButton 
                    onClick={() => {
                      setDetailOpen(false);
                      setSelectedTransferForAction(transfer);
                      setConfirmApproveOpen(true);
                    }}
                  >
                    Approve Transfer
                  </PrimaryButton>
                </div>
              )}
            </div>
          );
        })()}
      </Sheet>

      {/* Confirmation Dialogs */}
      <AlertDialog
        open={confirmApproveOpen}
        onClose={() => setConfirmApproveOpen(false)}
        onConfirm={handleApproveTransfer}
        title="Approve Transfer Request"
        description="Are you sure you want to approve this transfer? Custody of the asset will be immediately re-allocated to the recipient employee."
        confirmLabel="Approve"
      />

      <AlertDialog
        open={confirmRejectOpen}
        onClose={() => setConfirmRejectOpen(false)}
        onConfirm={handleRejectTransfer}
        title="Reject Transfer Request"
        description="Are you sure you want to reject this transfer request? The current custodian will retain control of the asset."
        confirmLabel="Reject"
      />
    </div>
  );
}
