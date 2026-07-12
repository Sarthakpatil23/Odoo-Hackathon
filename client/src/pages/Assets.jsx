import React, { useState, useEffect, useCallback } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { Search, Plus, ChevronDown, LayoutList, LayoutGrid, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '../components/ui/popover';
import { Checkbox } from '../components/ui/checkbox';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet';
import { StatusDot } from '../components/shared/StatusDot';
import { Skeleton } from '../components/shared/Skeleton';
import { cn } from '../lib/utils';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/shared/Toast';

// ─── MOCK DATASETS FOR OFFLINE TESTING ──────────────────────────────────────────
const MOCK_ASSETS = [
  {
    id: 'ast-1',
    tag: 'AF-0012',
    name: 'Dell Laptop',
    category: { name: 'Electronics' },
    status: 'Allocated',
    department: 'Engineering',
    location: 'Bengaluru',
    condition: 'Good',
    acquisitionCost: 1200,
    acquisitionDate: '2026-01-10T00:00:00.000Z',
  },
  {
    id: 'ast-2',
    tag: 'AF-0062',
    name: 'Projector',
    category: { name: 'Electronics' },
    status: 'Under Maintenance',
    department: 'Operations',
    location: 'HQ Floor 2',
    condition: 'Fair',
    acquisitionCost: 800,
    acquisitionDate: '2026-03-05T00:00:00.000Z',
  },
  {
    id: 'ast-3',
    tag: 'AF-0201',
    name: 'Office Chair',
    category: { name: 'Furniture' },
    status: 'Available',
    department: 'Facilities',
    location: 'Warehouse',
    condition: 'Good',
    acquisitionCost: 150,
    acquisitionDate: '2026-05-15T00:00:00.000Z',
  },
];

// Shared Form Input Classes (design.md §5.8)
const fieldCls =
  'w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground ' +
  'placeholder:text-muted-foreground focus:outline-none focus:border-border-strong focus:ring-1 focus:ring-white/10 transition-shadow';

// Shared Button Classes (design.md §5.1)
const btnPrimary =
  'px-4 py-2 rounded-md text-sm font-medium bg-foreground text-background ' +
  'hover:bg-foreground/90 focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors';
const btnOutline =
  'px-4 py-2 rounded-md text-sm font-medium border border-border text-foreground bg-transparent ' +
  'hover:bg-white/5 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors';

// ─── PLAIN DIALOG CONTAINER ────────────────────────────────────────────────────
function Dialog({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px] transition-opacity duration-150 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-sm bg-popover border border-border rounded-lg shadow-sm animate-fade-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-medium text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-white/5 focus:outline-none focus:ring-1 focus:ring-white/20"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Body */}
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

// ─── REGISTER ASSET DIALOG ─────────────────────────────────────────────────────
function RegisterAssetDialog({ open, onClose, categories, onSubmit }) {
  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    serialNumber: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    acquisitionCost: '',
    condition: 'Good',
    location: '',
    isBookable: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({
        name: '',
        categoryId: categories[0]?.id || '',
        serialNumber: '',
        acquisitionDate: new Date().toISOString().split('T')[0],
        acquisitionCost: '',
        condition: 'Good',
        location: '',
        isBookable: false,
      });
      setError('');
    }
  }, [open, categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.categoryId || !form.location || !form.acquisitionCost) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register asset.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Register Asset">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-xs text-danger border border-danger/30 rounded-md px-3 py-2">{error}</div>}
        
        <div>
          <label className="block text-xs text-muted-foreground mb-1 font-medium">Name *</label>
          <input
            type="text"
            required
            className={fieldCls}
            placeholder="e.g. Dell Monitor"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs text-muted-foreground mb-1 font-medium">Category *</label>
          <select
            className={fieldCls}
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-muted-foreground mb-1 font-medium">Serial Number</label>
          <input
            type="text"
            className={fieldCls}
            placeholder="SN-123456"
            value={form.serialNumber}
            onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-muted-foreground mb-1 font-medium">Acquisition Cost ($) *</label>
            <input
              type="number"
              required
              className={fieldCls}
              placeholder="100"
              value={form.acquisitionCost}
              onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1 font-medium">Condition *</label>
            <select
              className={fieldCls}
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
            >
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
              <option value="New">New</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-muted-foreground mb-1 font-medium">Location *</label>
            <input
              type="text"
              required
              className={fieldCls}
              placeholder="Bengaluru"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1 font-medium">Acquisition Date *</label>
            <input
              type="date"
              required
              className={fieldCls}
              value={form.acquisitionDate}
              onChange={(e) => setForm({ ...form, acquisitionDate: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isBookable"
            className="rounded bg-card border-border text-foreground focus:ring-0 focus:ring-offset-0"
            checked={form.isBookable}
            onChange={(e) => setForm({ ...form, isBookable: e.target.checked })}
          />
          <label htmlFor="isBookable" className="text-xs text-muted-foreground cursor-pointer select-none">
            Mark as Bookable Resource
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
          <button type="button" className={btnOutline} onClick={onClose}>Cancel</button>
          <button type="submit" className={btnPrimary} disabled={submitting}>
            {submitting ? 'Registering…' : 'Register'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

// ─── MAIN ASSETS PAGE ──────────────────────────────────────────────────────────
export default function Assets() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isManager = user?.role === 'Admin' || user?.role === 'AssetManager';

  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  
  const [columnVisibility, setColumnVisibility] = useState({ cost: false });

  // ─── FETCH CORE DATA ─────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    const tokenVal = localStorage.getItem('token');
    const isMockMode = tokenVal?.startsWith('mock-token-') || !tokenVal;

    if (isMockMode) {
      setAssets(MOCK_ASSETS);
      setCategories([
        { id: 'cat-1', name: 'Electronics' },
        { id: 'cat-2', name: 'Furniture' },
        { id: 'cat-3', name: 'Infrastructure' }
      ]);
      setLoading(false);
      return;
    }

    try {
      const [aRes, cRes] = await Promise.all([
        api.get('/assets'),
        api.get('/asset-categories').catch(() => ({ data: [] })),
      ]);
      setAssets(aRes.data);
      if (cRes.data && cRes.data.length > 0) {
        setCategories(cRes.data);
      } else {
        setCategories([
          { id: 'cat-1', name: 'Electronics' },
          { id: 'cat-2', name: 'Furniture' },
          { id: 'cat-3', name: 'Infrastructure' }
        ]);
      }
    } catch {
      toast('Failed to load assets data.');
      setAssets(MOCK_ASSETS);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ─── FILTER / SEARCH ASSETS ──────────────────────────────────────────────────
  const filteredAssets = assets.filter((asset) => {
    const s = search.toLowerCase();
    const tagMatch = (asset.tag || '').toLowerCase().includes(s);
    const nameMatch = (asset.name || '').toLowerCase().includes(s);
    const serialMatch = (asset.serialNumber || '').toLowerCase().includes(s);
    return tagMatch || nameMatch || serialMatch;
  });

  const columns = [
    {
      accessorKey: 'tag',
      header: 'Tag',
      cell: ({ row }) => <span className="font-mono text-sm text-foreground">{row.original.tag}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <span className="text-sm text-foreground font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.category?.name || row.original.category || 'Uncategorized'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusDot status={row.original.status} />,
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.department || '—'}</span>,
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.location}</span>,
    },
    {
      accessorKey: 'condition',
      header: 'Condition',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.condition}</span>,
    },
    {
      accessorKey: 'cost',
      header: () => <div className="text-right">Acquisition Cost</div>,
      cell: ({ row }) => {
        const costVal = row.original.acquisitionCost || row.original.cost || 0;
        const formatted = typeof costVal === 'number' ? `$${costVal.toLocaleString()}` : costVal;
        return <div className="text-right font-mono text-sm text-muted-foreground">{formatted}</div>;
      },
    },
  ];

  const table = useReactTable({
    data: filteredAssets,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
  });

  const handleRowClick = (asset) => {
    setSelectedAsset(asset);
    setIsSheetOpen(true);
  };

  const handleRegister = async (form) => {
    const tokenVal = localStorage.getItem('token');
    const isMockMode = tokenVal?.startsWith('mock-token-') || !tokenVal;

    if (isMockMode) {
      const catObj = categories.find((c) => c.id === form.categoryId) || { name: 'Electronics' };
      const newAsset = {
        id: `ast-${Date.now()}`,
        tag: `AF-${String(assets.length + 1).padStart(4, '0')}`,
        name: form.name,
        category: { name: catObj.name },
        status: 'Available',
        department: 'Engineering',
        location: form.location,
        condition: form.condition,
        acquisitionCost: Number(form.acquisitionCost),
        acquisitionDate: form.acquisitionDate,
      };
      setAssets((prev) => [newAsset, ...prev]);
      toast('Asset registered successfully.');
      return;
    }

    try {
      await api.post('/assets', form);
      await fetchAll();
      toast('Asset registered successfully.');
    } catch (err) {
      toast(err.response?.data?.error ?? 'Failed to register asset.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Dynamic Keyframes Animation Injection */}
      <style>{`
        @keyframes pure-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: pure-fade-in 150ms ease forwards;
        }
      `}</style>

      {/* 1. Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium tracking-tight text-foreground">Assets</h1>
        {isManager && (
          <Button variant="default" className="gap-2" onClick={() => setRegisterOpen(true)}>
            <Plus className="h-4 w-4" />
            Register Asset
          </Button>
        )}
      </div>

      {/* 2. Search & filter row */}
      <div className="flex flex-col gap-4">
        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            className="w-full bg-card border border-border rounded-md text-sm pl-9 pr-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-border-strong focus:ring-1 focus:ring-white/10 transition-shadow"
            placeholder="Search by tag or name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filters & View Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {['Category', 'Status', 'Department', 'Location'].map((filter) => (
              <Popover key={filter}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-8 text-xs gap-2 bg-transparent text-foreground">
                    {filter}
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" align="start">
                  <div className="space-y-2">
                    <h4 className="font-medium text-xs text-muted-foreground uppercase px-2 py-1">{filter}</h4>
                    <div className="space-y-1">
                      {['Option 1', 'Option 2', 'Option 3'].map((opt) => (
                        <div key={opt} className="flex items-center gap-2 px-2 py-1 hover:bg-white/5 rounded-sm transition-colors">
                          <Checkbox id={`${filter}-${opt}`} />
                          <label htmlFor={`${filter}-${opt}`} className="text-sm text-foreground cursor-pointer flex-1">
                            {opt}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", viewMode === 'list' ? "text-foreground bg-white/5" : "text-muted-foreground")}
              onClick={() => setViewMode('list')}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", viewMode === 'grid' ? "text-foreground bg-white/5" : "text-muted-foreground")}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Asset Table / Grid View */}
      {loading ? (
        <div className="border border-border rounded-lg p-6 space-y-4 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-white/5 rounded-md" />
          ))}
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="border border-border rounded-lg py-16 text-center text-sm text-muted-foreground">
          No assets found.
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => handleRowClick(asset)}
              className="border border-border rounded-lg p-4 bg-card hover:bg-card-hover cursor-pointer transition-colors space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted-foreground">{asset.tag}</span>
                <StatusDot status={asset.status} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">{asset.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {asset.category?.name || asset.category || 'Uncategorized'}
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/40 pt-2">
                <span>{asset.location}</span>
                <span>{asset.condition}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden animate-fade-in">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => handleRowClick(row.original)}
                  className="cursor-pointer hover:bg-white/[0.02]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 4. Row click → detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Asset Details</SheetTitle>
            <SheetDescription>
              {selectedAsset ? selectedAsset.tag : ''}
            </SheetDescription>
          </SheetHeader>
          {selectedAsset && (
            <div className="mt-6 flex flex-col gap-4">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Name</div>
                <div className="text-sm text-foreground font-medium">{selectedAsset.name}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Status</div>
                <div><StatusDot status={selectedAsset.status} /></div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Category</div>
                <div className="text-sm text-muted-foreground">
                  {selectedAsset.category?.name || selectedAsset.category || 'Uncategorized'}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Department</div>
                <div className="text-sm text-muted-foreground">{selectedAsset.department || '—'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Location</div>
                <div className="text-sm text-muted-foreground">{selectedAsset.location}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Condition</div>
                <div className="text-sm text-muted-foreground">{selectedAsset.condition}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Acquisition Cost</div>
                <div className="font-mono text-sm text-muted-foreground">
                  {typeof (selectedAsset.acquisitionCost || selectedAsset.cost) === 'number'
                    ? `$${(selectedAsset.acquisitionCost || selectedAsset.cost).toLocaleString()}`
                    : (selectedAsset.acquisitionCost || selectedAsset.cost)}
                </div>
              </div>
              {selectedAsset.serialNumber && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Serial Number</div>
                  <div className="font-mono text-sm text-muted-foreground">{selectedAsset.serialNumber}</div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* 5. Register Asset Dialog */}
      <RegisterAssetDialog
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        categories={categories}
        onSubmit={handleRegister}
      />
    </div>
  );
}
