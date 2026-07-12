import React, { useState } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { Search, Plus, ChevronDown, LayoutList, LayoutGrid } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '../components/ui/popover';
import { Checkbox } from '../components/ui/checkbox';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet';
import { StatusDot } from '../components/shared/StatusDot';
import { cn } from '../lib/utils';

const data = [
  {
    tag: 'AF-0012',
    name: 'Dell Laptop',
    category: 'Electronics',
    status: 'Allocated',
    department: 'Engineering',
    location: 'Bengaluru',
    condition: 'Good',
    cost: '$1,200',
  },
  {
    tag: 'AF-0062',
    name: 'Projector',
    category: 'Electronics',
    status: 'Under Maintenance',
    department: 'Operations',
    location: 'HQ Floor 2',
    condition: 'Fair',
    cost: '$800',
  },
  {
    tag: 'AF-0201',
    name: 'Office Chair',
    category: 'Furniture',
    status: 'Available',
    department: 'Facilities',
    location: 'Warehouse',
    condition: 'Good',
    cost: '$150',
  },
];

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
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.category}</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusDot status={row.original.status} />,
  },
  {
    accessorKey: 'department',
    header: 'Department',
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.department}</span>,
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
    cell: ({ row }) => <div className="text-right font-mono text-sm text-muted-foreground">{row.original.cost}</div>,
  },
];

export default function Assets() {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  
  const [columnVisibility, setColumnVisibility] = useState({ cost: false });

  const table = useReactTable({
    data,
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

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium tracking-tight text-foreground">Assets</h1>
        <Button variant="default" className="gap-2">
          <Plus className="h-4 w-4" />
          Register Asset
        </Button>
      </div>

      {/* 2. Search & filter row */}
      <div className="flex flex-col gap-4">
        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            className="w-full bg-card border border-border rounded-md text-sm pl-9 pr-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-border-strong focus:ring-1 focus:ring-white/10 transition-shadow"
            placeholder="Search by tag, serial, or QR code…"
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

      {/* 3. Asset table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => handleRowClick(row.original)}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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
                <div className="text-sm text-muted-foreground">{selectedAsset.category}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Department</div>
                <div className="text-sm text-muted-foreground">{selectedAsset.department}</div>
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
                <div className="font-mono text-sm text-muted-foreground">{selectedAsset.cost}</div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
