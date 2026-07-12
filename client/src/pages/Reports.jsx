import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  Download,
  ChevronDown,
  Inbox,
  RefreshCw,
  Calendar,
  Building,
  SlidersHorizontal,
  FileSpreadsheet,
  FileText
} from 'lucide-react';

import { Card } from '../components/shared/Card';
import { StatusDot } from '../components/shared/StatusDot';
import { Skeleton } from '../components/shared/Skeleton';
import { EmptyState } from '../components/shared/EmptyState';
import { Button } from '../components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '../components/ui/popover';
import { Checkbox } from '../components/ui/checkbox';
import { useToast } from '../components/shared/Toast';
import { useTheme } from '../context/ThemeContext';

// ----------------------------------------------------
// Base Datasets & Options
// ----------------------------------------------------
const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'Operations', 'Sales'];
const CATEGORIES = ['Electronics', 'Furniture', 'Vehicles', 'Real Estate', 'Office Supplies'];
const DATE_RANGES = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Year'];

// Detailed mock data that can be filtered and subsetted dynamically
const BASE_UTILIZATION = {
  Engineering: { Electronics: 88, Furniture: 50, Vehicles: 0, 'Real Estate': 0, 'Office Supplies': 60 },
  Design: { Electronics: 82, Furniture: 65, Vehicles: 0, 'Real Estate': 0, 'Office Supplies': 45 },
  Marketing: { Electronics: 68, Furniture: 40, Vehicles: 0, 'Real Estate': 0, 'Office Supplies': 70 },
  Operations: { Electronics: 72, Furniture: 55, Vehicles: 92, 'Real Estate': 85, 'Office Supplies': 50 },
  Sales: { Electronics: 60, Furniture: 30, Vehicles: 80, 'Real Estate': 0, 'Office Supplies': 80 },
};

const BASE_ALLOCATION_COUNTS = {
  Engineering: { Electronics: 32, Furniture: 10, Vehicles: 0, 'Real Estate': 0, 'Office Supplies': 3 },
  Design: { Electronics: 16, Furniture: 5, Vehicles: 0, 'Real Estate': 0, 'Office Supplies': 1 },
  Marketing: { Electronics: 12, Furniture: 8, Vehicles: 0, 'Real Estate': 0, 'Office Supplies': 4 },
  Operations: { Electronics: 10, Furniture: 12, Vehicles: 14, 'Real Estate': 2, 'Office Supplies': 0 },
  Sales: { Electronics: 8, Furniture: 2, Vehicles: 5, 'Real Estate': 0, 'Office Supplies': 0 },
};

const BASE_MAINTENANCE_DATA = {
  'Last 7 Days': [
    { label: 'Mon', count: 2 },
    { label: 'Tue', count: 4 },
    { label: 'Wed', count: 3 },
    { label: 'Thu', count: 5 },
    { label: 'Fri', count: 3 },
    { label: 'Sat', count: 1 },
    { label: 'Sun', count: 0 },
  ],
  'Last 30 Days': [
    { label: 'Week 1', count: 12 },
    { label: 'Week 2', count: 18 },
    { label: 'Week 3', count: 15 },
    { label: 'Week 4', count: 22 },
  ],
  'Last 90 Days': [
    { label: 'Month 1', count: 45 },
    { label: 'Month 2', count: 58 },
    { label: 'Month 3', count: 52 },
  ],
  'This Year': [
    { label: 'Jan', count: 35 },
    { label: 'Feb', count: 42 },
    { label: 'Mar', count: 38 },
    { label: 'Apr', count: 48 },
    { label: 'May', count: 50 },
    { label: 'Jun', count: 55 },
    { label: 'Jul', count: 49 },
    { label: 'Aug', count: 52 },
    { label: 'Sep', count: 60 },
    { label: 'Oct', count: 58 },
    { label: 'Nov', count: 64 },
    { label: 'Dec', count: 70 },
  ],
};

const BASE_MOST_USED = [
  { tag: 'Room B2', desc: '34 bookings this month', depts: ['Design', 'Engineering'], cats: ['Real Estate'] },
  { tag: 'Laptop AF-0012', desc: '28 checkouts this quarter', depts: ['Engineering'], cats: ['Electronics'] },
  { tag: 'Projector AF-0062', desc: '19 bookings this month', depts: ['Marketing', 'Sales'], cats: ['Electronics'] },
  { tag: 'Meeting Room A1', desc: '18 bookings this month', depts: ['Sales', 'Marketing', 'Engineering'], cats: ['Real Estate'] },
  { tag: 'Forklift AF-0087', desc: '15 allocations this month', depts: ['Operations'], cats: ['Vehicles'] },
];

const BASE_IDLE_ASSETS = [
  { tag: 'Camera AF-0301', desc: 'unused 60+ days', depts: ['Design'], cats: ['Electronics'] },
  { tag: 'Tablet AF-0044', desc: 'unused 45+ days', depts: ['Sales'], cats: ['Electronics'] },
  { tag: 'Monitor AF-0091', desc: 'unused 30+ days', depts: ['Engineering'], cats: ['Electronics'] },
  { tag: 'Printer AF-0102', desc: 'unused 28+ days', depts: ['Operations'], cats: ['Electronics'] },
  { tag: 'Desk D-04', desc: 'unused 25+ days', depts: ['Design', 'Marketing'], cats: ['Furniture'] },
];

const BASE_MAINTENANCE_DUE = [
  { tag: 'Forklift AF-0087', desc: 'service due in 5 days', daysLeft: 5, totalDays: 30, depts: ['Operations'], cats: ['Vehicles'] },
  { tag: 'Laptop AF-0020', desc: '4 years old, nearing retirement', daysLeft: 90, totalDays: 365, depts: ['Engineering'], cats: ['Electronics'] },
  { tag: 'Projector AF-0062', desc: 'service due in 12 days', daysLeft: 12, totalDays: 30, depts: ['Marketing'], cats: ['Electronics'] },
  { tag: 'Server Rack SR-09', desc: '5 years old, nearing retirement', daysLeft: 45, totalDays: 365, depts: ['Engineering'], cats: ['Electronics'] },
];

// Helper to determine weekday letters for heatmap
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function Reports() {
  const { toast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const themeColors = {
    text: isDark ? '#EDEDED' : '#0F172A',
    mutedText: isDark ? '#888888' : '#64748B',
    border: isDark ? '#232323' : '#E2E8F0',
    barFill: isDark ? 'rgba(237, 237, 237, 0.7)' : 'rgba(15, 23, 42, 0.65)',
    barHover: isDark ? '#EDEDED' : '#0F172A',
    tooltipBg: isDark ? '#171717' : '#FFFFFF',
    tooltipBorder: isDark ? '#232323' : '#E2E8F0',
    lineColor: isDark ? '#EDEDED' : '#0F172A',
  };

  const getHeatmapColor = (value) => {
    const baseColor = isDark ? '255, 255, 255' : '15, 23, 42';
    if (value === 0) return `rgba(${baseColor}, 0.05)`;
    if (value <= 2) return `rgba(${baseColor}, 0.15)`;
    if (value <= 4) return `rgba(${baseColor}, 0.35)`;
    if (value <= 6) return `rgba(${baseColor}, 0.55)`;
    if (value <= 8) return `rgba(${baseColor}, 0.75)`;
    return `rgba(${baseColor}, 0.9)`;
  };

  // ----------------------------------------------------
  // Shared Filter States
  // ----------------------------------------------------
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [selectedDepts, setSelectedDepts] = useState(['All']);
  const [selectedCats, setSelectedCats] = useState(['All']);
  const [isLoading, setIsLoading] = useState(false);

  // Trigger loading animation on filter change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [dateRange, selectedDepts, selectedCats]);

  // Handlers for checkboxes
  const handleDeptToggle = (dept) => {
    if (dept === 'All') {
      setSelectedDepts(['All']);
      return;
    }
    setSelectedDepts((prev) => {
      const filtered = prev.filter((d) => d !== 'All');
      if (filtered.includes(dept)) {
        const next = filtered.filter((d) => d !== dept);
        return next.length === 0 ? ['All'] : next;
      } else {
        return [...filtered, dept];
      }
    });
  };

  const handleCatToggle = (cat) => {
    if (cat === 'All') {
      setSelectedCats(['All']);
      return;
    }
    setSelectedCats((prev) => {
      const filtered = prev.filter((c) => c !== 'All');
      if (filtered.includes(cat)) {
        const next = filtered.filter((c) => c !== cat);
        return next.length === 0 ? ['All'] : next;
      } else {
        return [...filtered, cat];
      }
    });
  };

  const handleClearFilters = () => {
    setIsLoading(true);
    setDateRange('Last 30 Days');
    setSelectedDepts(['All']);
    setSelectedCats(['All']);
    toast('Filters cleared and report reset.');
  };

  // ----------------------------------------------------
  // Filter Data Calculations
  // ----------------------------------------------------
  const getFilteredData = () => {
    const activeDepts = selectedDepts.includes('All') ? DEPARTMENTS : selectedDepts;
    const activeCats = selectedCats.includes('All') ? CATEGORIES : selectedCats;

    // Check if the combination has any intersection
    const hasIntersection = activeDepts.some(dept => 
      activeCats.some(cat => BASE_ALLOCATION_COUNTS[dept]?.[cat] !== undefined)
    );

    if (!hasIntersection || activeDepts.length === 0 || activeCats.length === 0) {
      return {
        utilizationData: [],
        allocationData: [],
        maintenanceData: [],
        heatmapData: [],
        mostUsed: [],
        idleAssets: [],
        dueMaintenance: [],
        isEmpty: true
      };
    }

    // 1. Utilization by Department (vertical bar chart)
    const utilizationData = activeDepts.map((dept) => {
      // average utilization of selected categories in this department
      let total = 0;
      let count = 0;
      activeCats.forEach((cat) => {
        const val = BASE_UTILIZATION[dept]?.[cat];
        if (val !== undefined && val > 0) {
          total += val;
          count++;
        }
      });
      const avgUtil = count > 0 ? Math.round(total / count) : 0;
      return {
        department: dept,
        utilization: avgUtil
      };
    }).filter(d => d.utilization > 0);

    // 2. Department-wise Allocation (horizontal bar chart)
    const allocationData = activeDepts.map((dept) => {
      let count = 0;
      activeCats.forEach((cat) => {
        const val = BASE_ALLOCATION_COUNTS[dept]?.[cat];
        if (val !== undefined) {
          count += val;
        }
      });
      return {
        department: dept,
        count
      };
    }).filter(d => d.count > 0);

    // 3. Maintenance frequency (line chart) - scales with filters
    const mFactor = (activeDepts.length / DEPARTMENTS.length) * (activeCats.length / CATEGORIES.length);
    const maintenanceData = (BASE_MAINTENANCE_DATA[dateRange] || BASE_MAINTENANCE_DATA['Last 30 Days']).map(item => ({
      ...item,
      count: Math.max(0, Math.round(item.count * mFactor))
    }));

    // 4. Heatmap generator (calendar grid)
    const heatmapData = [];
    let seed = dateRange.length + activeDepts.join(',').length + activeCats.join(',').length;
    const deterministicRandom = () => {
      let x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    // Generate 18 weeks (cols) x 7 days (rows)
    for (let col = 0; col < 18; col++) {
      for (let row = 0; row < 7; row++) {
        let baseVal = Math.floor(deterministicRandom() * 9);
        // reduce on weekends
        if (row === 0 || row === 6) baseVal = Math.floor(baseVal * 0.15);
        
        // Scale factor
        const finalVal = Math.round(baseVal * mFactor);
        heatmapData.push({ col, row, value: finalVal });
      }
    }

    // 5. Lists
    const mostUsed = BASE_MOST_USED.filter(
      (item) =>
        item.depts.some((d) => activeDepts.includes(d)) &&
        item.cats.some((c) => activeCats.includes(c))
    );

    const idleAssets = BASE_IDLE_ASSETS.filter(
      (item) =>
        item.depts.some((d) => activeDepts.includes(d)) &&
        item.cats.some((c) => activeCats.includes(c))
    );

    const dueMaintenance = BASE_MAINTENANCE_DUE.filter(
      (item) =>
        item.depts.some((d) => activeDepts.includes(d)) &&
        item.cats.some((c) => activeCats.includes(c))
    );

    const isEmpty = utilizationData.length === 0 && allocationData.length === 0;

    return {
      utilizationData,
      allocationData,
      maintenanceData,
      heatmapData,
      mostUsed,
      idleAssets,
      dueMaintenance,
      isEmpty
    };
  };

  const {
    utilizationData,
    allocationData,
    maintenanceData,
    heatmapData,
    mostUsed,
    idleAssets,
    dueMaintenance,
    isEmpty
  } = getFilteredData();

  // ----------------------------------------------------
  // Export Handlers
  // ----------------------------------------------------
  const handleExport = (format) => {
    toast(`Successfully generated and downloaded Full Report as ${format}.`);
  };

  const handleExportChart = (chartName, format) => {
    toast(`Successfully exported "${chartName}" chart data as ${format}.`);
  };

  // ----------------------------------------------------
  // Custom Heatmap Tooltip State
  // ----------------------------------------------------
  const [hoveredCell, setHoveredCell] = useState(null);

  // ----------------------------------------------------
  // Skeletons
  // ----------------------------------------------------
  const ChartSkeleton = () => (
    <div className="space-y-4 w-full h-[240px] flex flex-col justify-end">
      <div className="flex items-end justify-between gap-4 h-full pt-4 px-2 select-none">
        <Skeleton className="w-[12%] h-[60%]" />
        <Skeleton className="w-[12%] h-[80%]" />
        <Skeleton className="w-[12%] h-[40%]" />
        <Skeleton className="w-[12%] h-[90%]" />
        <Skeleton className="w-[12%] h-[70%]" />
        <Skeleton className="w-[12%] h-[50%]" />
        <Skeleton className="w-[12%] h-[85%]" />
      </div>
    </div>
  );

  const LineSkeleton = () => (
    <div className="w-full h-[240px] relative overflow-hidden flex flex-col justify-between p-2 select-none">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="w-full border-b border-border h-0" />
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <Skeleton className="w-4/5 h-[3px] rounded-full" />
      </div>
    </div>
  );

  const HeatmapSkeleton = () => (
    <div className="grid gap-1 w-full py-4 select-none" style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))' }}>
      {Array.from({ length: 18 * 7 }).map((_, i) => (
        <Skeleton
          key={i}
          className="aspect-square w-full"
          style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.05)' }}
        />
      ))}
    </div>
  );

  const ListSkeleton = () => (
    <div className="space-y-3 py-2 select-none">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex justify-between items-center">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  );

  const MaintenanceSkeleton = () => (
    <div className="space-y-4 py-2 select-none">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-2 w-24 rounded-full" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ----------------------------------------------------
          1. PAGE HEADER & FILTER BAR
          ---------------------------------------------------- */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-foreground">Reports & Analytics</h1>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Date Range Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-8 text-xs gap-2 bg-transparent text-foreground">
                <Calendar size={13} className="text-muted-foreground" />
                <span>Range: {dateRange}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="start">
              <div className="space-y-2">
                <h4 className="font-medium text-xs text-muted-foreground uppercase px-2 py-1">Select Range</h4>
                <div className="space-y-1">
                  {DATE_RANGES.map((range) => (
                    <button
                      key={range}
                      onClick={() => setDateRange(range)}
                      className={`w-full text-left px-2 py-1 text-sm rounded transition-colors ${
                        dateRange === range
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'text-foreground hover:bg-white/5'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Department Popover (Multi-Select) */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-8 text-xs gap-2 bg-transparent text-foreground">
                <Building size={13} className="text-muted-foreground" />
                <span>
                  Dept:{' '}
                  {selectedDepts.includes('All')
                    ? 'All'
                    : selectedDepts.length === 1
                    ? selectedDepts[0]
                    : `${selectedDepts.length} Selected`}
                </span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52 p-2" align="start">
              <div className="space-y-2">
                <h4 className="font-medium text-xs text-muted-foreground uppercase px-2 py-1">Departments</h4>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  <div
                    onClick={() => handleDeptToggle('All')}
                    className="flex items-center gap-2 px-2 py-1 hover:bg-white/5 rounded-sm transition-colors cursor-pointer"
                  >
                    <Checkbox id="dept-all" checked={selectedDepts.includes('All')} readOnly />
                    <label htmlFor="dept-all" className="text-sm text-foreground cursor-pointer flex-1">
                      All Departments
                    </label>
                  </div>
                  {DEPARTMENTS.map((dept) => (
                    <div
                      key={dept}
                      onClick={() => handleDeptToggle(dept)}
                      className="flex items-center gap-2 px-2 py-1 hover:bg-white/5 rounded-sm transition-colors cursor-pointer"
                    >
                      <Checkbox id={`dept-${dept}`} checked={selectedDepts.includes(dept)} readOnly />
                      <label htmlFor={`dept-${dept}`} className="text-sm text-foreground cursor-pointer flex-1">
                        {dept}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Category Popover (Multi-Select) */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-8 text-xs gap-2 bg-transparent text-foreground">
                <SlidersHorizontal size={13} className="text-muted-foreground" />
                <span>
                  Category:{' '}
                  {selectedCats.includes('All')
                    ? 'All'
                    : selectedCats.length === 1
                    ? selectedCats[0]
                    : `${selectedCats.length} Selected`}
                </span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52 p-2" align="start">
              <div className="space-y-2">
                <h4 className="font-medium text-xs text-muted-foreground uppercase px-2 py-1">Categories</h4>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  <div
                    onClick={() => handleCatToggle('All')}
                    className="flex items-center gap-2 px-2 py-1 hover:bg-white/5 rounded-sm transition-colors cursor-pointer"
                  >
                    <Checkbox id="cat-all" checked={selectedCats.includes('All')} readOnly />
                    <label htmlFor="cat-all" className="text-sm text-foreground cursor-pointer flex-1">
                      All Categories
                    </label>
                  </div>
                  {CATEGORIES.map((cat) => (
                    <div
                      key={cat}
                      onClick={() => handleCatToggle(cat)}
                      className="flex items-center gap-2 px-2 py-1 hover:bg-white/5 rounded-sm transition-colors cursor-pointer"
                    >
                      <Checkbox id={`cat-${cat}`} checked={selectedCats.includes(cat)} readOnly />
                      <label htmlFor={`cat-${cat}`} className="text-sm text-foreground cursor-pointer flex-1">
                        {cat}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Active filter badges indicator */}
          {(!selectedDepts.includes('All') || !selectedCats.includes('All') || dateRange !== 'Last 30 Days') && (
            <Button
              variant="ghost"
              onClick={handleClearFilters}
              className="h-8 text-xs px-2.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* ----------------------------------------------------
          EMPTY STATE
          ---------------------------------------------------- */}
      {isEmpty && !isLoading ? (
        <Card className="border border-border">
          <EmptyState
            icon={<Inbox />}
            message="No reports or analytics data matches your selected filters."
            action={
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear filters
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          {/* ----------------------------------------------------
              2. CHART CARDS GRID (2-column layout)
              ---------------------------------------------------- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 2.1 Utilization by Department */}
            <Card className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-foreground">Utilization by Department</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <Download size={14} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-40 p-1" align="end">
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleExportChart('Utilization by Department', 'CSV')}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-foreground hover:bg-white/5 rounded-md transition-colors"
                      >
                        <FileSpreadsheet size={13} className="text-muted-foreground" />
                        <span>Export CSV</span>
                      </button>
                      <button
                        onClick={() => handleExportChart('Utilization by Department', 'PDF')}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-foreground hover:bg-white/5 rounded-md transition-colors"
                      >
                        <FileText size={13} className="text-muted-foreground" />
                        <span>Export PDF</span>
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex-1 min-h-[240px] flex items-center justify-center">
                {isLoading ? (
                  <ChartSkeleton />
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={utilizationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={themeColors.border} vertical={false} />
                      <XAxis
                        dataKey="department"
                        stroke={themeColors.mutedText}
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke={themeColors.mutedText}
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `${val}%`}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: themeColors.tooltipBg,
                          borderColor: themeColors.tooltipBorder,
                          color: themeColors.text,
                          fontSize: '12px',
                          borderRadius: '6px',
                        }}
                        cursor={{ fill: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)' }}
                        formatter={(val) => [`${val}%`, 'Avg Utilization']}
                      />
                      <Bar
                        dataKey="utilization"
                        fill={themeColors.barFill}
                        radius={[4, 4, 0, 0]}
                        activeBar={{ fill: themeColors.barHover }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            {/* 2.2 Maintenance Frequency */}
            <Card className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-foreground">Maintenance Frequency</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <Download size={14} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-40 p-1" align="end">
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleExportChart('Maintenance Frequency', 'CSV')}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-foreground hover:bg-white/5 rounded-md transition-colors"
                      >
                        <FileSpreadsheet size={13} className="text-muted-foreground" />
                        <span>Export CSV</span>
                      </button>
                      <button
                        onClick={() => handleExportChart('Maintenance Frequency', 'PDF')}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-foreground hover:bg-white/5 rounded-md transition-colors"
                      >
                        <FileText size={13} className="text-muted-foreground" />
                        <span>Export PDF</span>
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex-1 min-h-[240px] flex items-center justify-center">
                {isLoading ? (
                  <LineSkeleton />
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={maintenanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={themeColors.border} vertical={false} />
                      <XAxis
                        dataKey="label"
                        stroke={themeColors.mutedText}
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke={themeColors.mutedText}
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: themeColors.tooltipBg,
                          borderColor: themeColors.tooltipBorder,
                          color: themeColors.text,
                          fontSize: '12px',
                          borderRadius: '6px',
                        }}
                        formatter={(val) => [val, 'Resolved Tickets']}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke={themeColors.lineColor}
                        strokeWidth={1.5}
                        dot={{ r: 3, fill: themeColors.lineColor }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            {/* 2.3 Department-wise Allocation */}
            <Card className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-foreground">Department-wise Allocation</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <Download size={14} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-40 p-1" align="end">
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleExportChart('Department-wise Allocation', 'CSV')}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-foreground hover:bg-white/5 rounded-md transition-colors"
                      >
                        <FileSpreadsheet size={13} className="text-muted-foreground" />
                        <span>Export CSV</span>
                      </button>
                      <button
                        onClick={() => handleExportChart('Department-wise Allocation', 'PDF')}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-foreground hover:bg-white/5 rounded-md transition-colors"
                      >
                        <FileText size={13} className="text-muted-foreground" />
                        <span>Export PDF</span>
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex-1 min-h-[240px] flex items-center justify-center">
                {isLoading ? (
                  <ChartSkeleton />
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart layout="vertical" data={allocationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={themeColors.border} horizontal={false} />
                      <XAxis
                        type="number"
                        stroke={themeColors.mutedText}
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="department"
                        stroke={themeColors.mutedText}
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        width={80}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: themeColors.tooltipBg,
                          borderColor: themeColors.tooltipBorder,
                          color: themeColors.text,
                          fontSize: '12px',
                          borderRadius: '6px',
                        }}
                        cursor={{ fill: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)' }}
                        formatter={(val) => [val, 'Allocated Assets']}
                      />
                      <Bar
                        dataKey="count"
                        fill={themeColors.barFill}
                        radius={[0, 4, 4, 0]}
                        activeBar={{ fill: themeColors.barHover }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            {/* 2.4 Booking Heatmap */}
            <Card className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-foreground">Booking Heatmap</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <Download size={14} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-40 p-1" align="end">
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleExportChart('Booking Heatmap', 'CSV')}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-foreground hover:bg-white/5 rounded-md transition-colors"
                      >
                        <FileSpreadsheet size={13} className="text-muted-foreground" />
                        <span>Export CSV</span>
                      </button>
                      <button
                        onClick={() => handleExportChart('Booking Heatmap', 'PDF')}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-foreground hover:bg-white/5 rounded-md transition-colors"
                      >
                        <FileText size={13} className="text-muted-foreground" />
                        <span>Export PDF</span>
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex-1 min-h-[240px] flex flex-col justify-center">
                {isLoading ? (
                  <HeatmapSkeleton />
                ) : (
                  <div className="relative">
                    {/* Month labels on top */}
                    <div className="flex pl-8 pr-1 mb-1 text-[9px] text-muted-foreground justify-between select-none">
                      <span>Mar</span>
                      <span>Apr</span>
                      <span>May</span>
                      <span>Jun</span>
                    </div>

                    <div className="flex gap-2">
                      {/* Weekday labels left */}
                      <div className="flex flex-col justify-between text-[9px] text-muted-foreground h-28 py-0.5 select-none w-6">
                        <span>Sun</span>
                        <span>Tue</span>
                        <span>Thu</span>
                        <span>Sat</span>
                      </div>

                      {/* Heatmap calendar grid */}
                      <div className="flex-1 grid gap-1 h-28" style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))' }}>
                        {heatmapData.map((cell, idx) => {
                          return (
                            <div
                              key={idx}
                              className="aspect-square w-full rounded-[2px] transition-colors cursor-pointer hover:ring-1 hover:ring-white"
                              style={{ backgroundColor: getHeatmapColor(cell.value) }}
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setHoveredCell({
                                  value: cell.value,
                                  top: rect.top - 40,
                                  left: rect.left + rect.width / 2,
                                });
                              }}
                              onMouseLeave={() => setHoveredCell(null)}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Simple legend */}
                    <div className="flex items-center justify-end gap-1.5 mt-3 text-[10px] text-muted-foreground select-none">
                      <span>Less</span>
                      <div className="w-2.5 h-2.5 rounded-[1px]" style={{ backgroundColor: getHeatmapColor(0) }} />
                      <div className="w-2.5 h-2.5 rounded-[1px]" style={{ backgroundColor: getHeatmapColor(2) }} />
                      <div className="w-2.5 h-2.5 rounded-[1px]" style={{ backgroundColor: getHeatmapColor(4) }} />
                      <div className="w-2.5 h-2.5 rounded-[1px]" style={{ backgroundColor: getHeatmapColor(6) }} />
                      <div className="w-2.5 h-2.5 rounded-[1px]" style={{ backgroundColor: getHeatmapColor(8) }} />
                      <div className="w-2.5 h-2.5 rounded-[1px]" style={{ backgroundColor: getHeatmapColor(10) }} />
                      <span>More</span>
                    </div>

                    {/* Heatmap Tooltip */}
                    {hoveredCell && (
                      <div
                        className="fixed z-50 bg-popover border border-border px-2 py-1 text-[11px] text-foreground rounded shadow-sm pointer-events-none transform -translate-x-1/2 transition-opacity"
                        style={{
                          top: `${hoveredCell.top}px`,
                          left: `${hoveredCell.left}px`,
                        }}
                      >
                        {hoveredCell.value} bookings
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* ----------------------------------------------------
              3 & 4. TEXT-BASED INSIGHT LISTS & MAINTENANCE
              ---------------------------------------------------- */}
          <Card className="p-0 border border-border">
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
              {/* 3.1 Most Used Assets */}
              <div className="p-6">
                <h3 className="text-sm font-medium text-foreground mb-4">Most Used Assets</h3>
                {isLoading ? (
                  <ListSkeleton />
                ) : mostUsed.length === 0 ? (
                  <div className="py-8 flex flex-col items-center justify-center text-center">
                    <Inbox size={24} className="text-muted-foreground-2 mb-2 stroke-[1.5px]" />
                    <p className="text-xs text-muted-foreground">No data matches filters</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {mostUsed.map((item, idx) => (
                      <div key={idx} className="flex items-baseline justify-between text-sm py-0.5">
                        <span className="font-mono text-foreground text-[13px] bg-white/[0.02] border border-border px-1.5 py-0.5 rounded leading-none">
                          {item.tag}
                        </span>
                        <span className="text-sm text-muted-foreground text-right">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3.2 Idle Assets */}
              <div className="p-6">
                <h3 className="text-sm font-medium text-foreground mb-4">Idle Assets</h3>
                {isLoading ? (
                  <ListSkeleton />
                ) : idleAssets.length === 0 ? (
                  <div className="py-8 flex flex-col items-center justify-center text-center">
                    <Inbox size={24} className="text-muted-foreground-2 mb-2 stroke-[1.5px]" />
                    <p className="text-xs text-muted-foreground">No data matches filters</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {idleAssets.map((item, idx) => (
                      <div key={idx} className="flex items-baseline justify-between text-sm py-0.5">
                        <span className="font-mono text-foreground text-[13px] bg-white/[0.02] border border-border px-1.5 py-0.5 rounded leading-none">
                          {item.tag}
                        </span>
                        <span className="text-sm text-muted-foreground text-right">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 4. Assets due for maintenance / nearing retirement */}
            <div className="border-t border-border p-6">
              <h3 className="text-sm font-medium text-foreground mb-4">Assets Due for Maintenance / Nearing Retirement</h3>
              {isLoading ? (
                <MaintenanceSkeleton />
              ) : dueMaintenance.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center text-center">
                  <Inbox size={24} className="text-muted-foreground-2 mb-2 stroke-[1.5px]" />
                  <p className="text-xs text-muted-foreground">No records match current filters</p>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {dueMaintenance.map((item, idx) => {
                    // Calc fill percentage based on days remaining vs total
                    const pct = Math.max(4, Math.min(100, Math.round((item.daysLeft / item.totalDays) * 100)));

                    return (
                      <div key={idx} className="flex items-center justify-between py-3 text-sm first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-foreground text-[13px] bg-white/[0.02] border border-border px-1.5 py-0.5 rounded leading-none shrink-0">
                            {item.tag}
                          </span>
                          <span className="text-muted-foreground truncate max-w-[200px] sm:max-w-none">
                            {item.desc}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-2">
                          <span className="text-xs text-muted-foreground-2 font-mono">
                            {item.daysLeft}d left
                          </span>
                          <div className="w-20 sm:w-24 h-1 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full bg-foreground/70 rounded-full transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </>
      )}

      {/* ----------------------------------------------------
          5. BOTTOM EXPORT REPORT ACTION
          ---------------------------------------------------- */}
      <div className="flex items-center justify-start pt-4 border-t border-border/40 select-none">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 text-sm h-9">
              <Download size={14} className="text-muted-foreground" />
              <span>Export Report</span>
              <ChevronDown size={14} className="text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-1" align="start">
            <div className="flex flex-col">
              <button
                onClick={() => handleExport('CSV')}
                className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-foreground hover:bg-white/5 rounded-md transition-colors"
              >
                <FileSpreadsheet size={14} className="text-muted-foreground" />
                <span>Export as CSV</span>
              </button>
              <button
                onClick={() => handleExport('PDF')}
                className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-foreground hover:bg-white/5 rounded-md transition-colors"
              >
                <FileText size={14} className="text-muted-foreground" />
                <span>Export as PDF</span>
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
