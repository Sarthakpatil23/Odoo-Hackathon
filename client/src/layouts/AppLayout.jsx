import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Logo } from '../components/shared/Logo';
import {
  LayoutDashboard,
  Building,
  Package,
  ArrowLeftRight,
  Calendar,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Bell,
  Search,
  ChevronDown,
  MoreHorizontal,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Organization Setup', to: '/organization', icon: Building, allowedRoles: ['Admin'] },
  { label: 'Assets', to: '/assets', icon: Package },
  { label: 'Allocation & Transfer', to: '/allocations', icon: ArrowLeftRight },
  { label: 'Resource Booking', to: '/bookings', icon: Calendar },
  { label: 'Maintenance', to: '/maintenance', icon: Wrench },
  { label: 'Audit', to: '/audits', icon: ClipboardCheck, allowedRoles: ['Admin', 'AssetManager'] },
  // divider will be placed here
  { label: 'Reports', to: '/reports', icon: BarChart3 },
  { label: 'Notifications', to: '/notifications', icon: Bell },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Section label based on current route path
  const getSectionLabel = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Overview';
    if (path.startsWith('/organization')) return 'Setup';
    if (path.startsWith('/assets')) return 'Assets';
    if (path.startsWith('/allocations')) return 'Transfers';
    if (path.startsWith('/bookings')) return 'Bookings';
    if (path.startsWith('/maintenance')) return 'Maintenance';
    if (path.startsWith('/audits')) return 'Audit';
    if (path.startsWith('/reports')) return 'Reports';
    if (path.startsWith('/notifications')) return 'Notifications';
    return 'Overview';
  };

  // Filter items by user role if required
  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.allowedRoles || item.allowedRoles.includes(user?.role || 'Admin')
  );

  const mainNavItems = visibleNavItems.filter(item => item.to !== '/reports' && item.to !== '/notifications');
  const secondaryNavItems = visibleNavItems.filter(item => item.to === '/reports' || item.to === '/notifications');

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-surface text-foreground select-none">
      {/* Workspace Switcher Row */}
      <div className="px-4 py-3 flex items-center justify-between hover:bg-card-hover cursor-pointer transition-colors border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <Logo className="h-5 w-5" />
          <span className="text-sm font-medium text-foreground truncate">AssetFlow</span>
          <span className="border border-border rounded-full px-1.5 py-0.5 text-[10px] text-muted-foreground shrink-0 font-sans tracking-wide">
            {user?.role || 'Hobby'}
          </span>
        </div>
        <ChevronDown size={14} className="text-muted-foreground shrink-0 ml-1" />
      </div>

      {/* Fake Search input styled as a real button */}
      <div className="px-3 py-4">
        <button className="w-full flex items-center justify-between bg-card border border-border rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-card-hover transition-colors">
          <div className="flex items-center gap-2">
            <Search size={14} className="text-muted-foreground" />
            <span>Find</span>
          </div>
          <span className="text-[10px] font-mono border border-border rounded px-1.5 py-0.5 bg-black/40">⌘K</span>
        </button>
      </div>

      {/* Navigation list */}
      <div className="flex-1 px-3 space-y-4 overflow-y-auto">
        <nav className="space-y-0.5">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                id={`nav-${item.to.replace('/', '')}`}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                    isActive
                      ? 'bg-card text-foreground font-medium border border-border-strong'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent'
                  }`
                }
              >
                <Icon size={16} className="shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Divider separating primary nav and secondary items */}
        <div className="border-t border-border my-2" />

        <nav className="space-y-0.5">
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                id={`nav-${item.to.replace('/', '')}`}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                    isActive
                      ? 'bg-card text-foreground font-medium border border-border-strong'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent'
                  }`
                }
              >
                <Icon size={16} className="shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Pinned Account Row */}
      <div className="p-4 border-t border-border mt-auto flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="h-6 w-6 rounded-full bg-card border border-border flex items-center justify-center font-bold text-[10px] shrink-0 text-foreground">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="text-xs font-medium text-foreground truncate leading-none">
            {user?.name || 'Vinit'}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0 text-muted-foreground">
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            className="p-1 hover:text-foreground hover:bg-white/5 rounded transition-colors"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button className="p-1 hover:text-foreground hover:bg-white/5 rounded transition-colors">
            <Bell size={14} />
          </button>
          <button 
            className="p-1 hover:text-foreground hover:bg-white/5 rounded transition-colors" 
            title="Sign out"
            onClick={handleLogout}
          >
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen bg-background text-foreground flex overflow-hidden font-sans">
      {/* Desktop Sidebar (visible on md+) */}
      <aside className="hidden md:block w-[240px] shrink-0 border-r border-border h-full bg-surface">
        {renderSidebarContent()}
      </aside>

      {/* Mobile drawer backdrop (visible when menu is open on mobile) */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-sm transition-opacity duration-200"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer (animates in on mobile below md) */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-[240px] border-r border-border h-full transform transition-transform duration-200 md:hidden bg-surface ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderSidebarContent()}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Understated top row */}
        <header className="flex items-center justify-between px-6 md:px-10 pt-6 pb-4 shrink-0 bg-background select-none">
          <div className="flex items-center gap-3">
            {/* Hamburger button (visible under md) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-md border border-border transition-colors"
              aria-label="Toggle Sidebar"
            >
              {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>

            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
              <span>Organization</span>
              <ChevronDown size={12} />
            </button>
          </div>
          
          <div className="text-sm text-muted-foreground font-medium font-sans">
            {getSectionLabel()}
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto px-6 md:px-10 pb-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
