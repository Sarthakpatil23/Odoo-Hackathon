import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/shared/Card';
import { StatusDot } from '../components/shared/StatusDot';
import { Button } from '../components/ui/button';
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
  Sun,
  Moon,
  Search,
  ChevronDown,
  Info,
  Clock,
  ArrowRight,
  CheckCircle2,
  Users,
  MoreHorizontal
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleCtaClick = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-white/10 relative overflow-hidden font-sans transition-colors duration-200">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-primary/[0.03] rounded-full blur-[100px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="px-6 md:px-10 py-5 flex items-center justify-between border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-50 select-none">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-foreground text-background flex items-center justify-center font-bold text-xs rounded-sm">
            AF
          </div>
          <span className="font-semibold text-sm tracking-tight text-foreground">AssetFlow</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#preview" className="hover:text-foreground transition-colors">Platform Preview</a>
          <a href="#testimonials" className="hover:text-foreground transition-colors">Customers</a>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Switcher */}
          <button 
            onClick={toggleTheme}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-md transition-colors"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          
          <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
            Log In
          </Button>
          <Button variant="default" size="sm" onClick={handleCtaClick}>
            {user ? 'Dashboard' : 'Get Started'}
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 md:px-10 py-20 max-w-[1200px] mx-auto text-center space-y-8 z-10 relative">
        <div className="space-y-4 max-w-[800px] mx-auto">
          <div className="inline-flex items-center gap-1.5 border border-border rounded-full px-3 py-1 text-xs text-muted-foreground bg-card/30">
            <span className="h-1.5 w-1.5 rounded-full bg-success"></span>
            <span>AssetFlow v2.0 Platform is Live</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-foreground leading-[1.1]">
            Track every asset.<br />Manage every space.
          </h1>
          
          <p className="text-base md:text-lg text-muted-foreground max-w-[620px] mx-auto font-sans leading-relaxed">
            Digitize and streamline how your organization tracks, allocates, and maintains physical equipment, shared spaces, and team resources in a single unified system.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="lg" onClick={handleCtaClick} className="w-full sm:w-auto flex items-center gap-2">
            <span>{user ? 'Go to Dashboard' : 'Get Started Now'}</span>
            <ArrowRight size={14} />
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="w-full sm:w-auto">
            Log In as Guest
          </Button>
        </div>
      </section>

      {/* Platform Mockup Preview Section */}
      <section id="preview" className="px-6 md:px-10 py-10 max-w-[1200px] mx-auto">
        <div className="text-center mb-10">
          <span className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground uppercase">PLATFORM PREVIEW</span>
          <h2 className="text-2xl font-medium tracking-tight mt-1">Grounded in Monochrome Aesthetics</h2>
        </div>

        {/* Live CSS Interactive Dashboard Preview */}
        <div className="border border-border rounded-lg bg-surface shadow-2xl overflow-hidden aspect-[16/10] max-w-[960px] mx-auto flex select-none text-left">
          {/* Mock Sidebar */}
          <div className="w-[180px] sm:w-[220px] border-r border-border h-full flex flex-col p-3 shrink-0 bg-surface text-foreground font-sans">
            <div className="flex items-center justify-between p-1.5 border-b border-border mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-4 w-4 bg-foreground text-background flex items-center justify-center font-bold text-[9px] rounded-sm shrink-0">
                  A
                </div>
                <span className="text-xs font-semibold truncate">AssetFlow</span>
              </div>
              <ChevronDown size={12} className="text-muted-foreground" />
            </div>

            <div className="flex-1 space-y-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2.5 px-2 py-1.5 bg-card border border-border-strong text-xs font-medium rounded">
                  <LayoutDashboard size={13} />
                  <span>Dashboard</span>
                </div>
                <div className="flex items-center gap-2.5 px-2 py-1.5 text-muted-foreground text-xs rounded">
                  <Package size={13} />
                  <span>Assets</span>
                </div>
                <div className="flex items-center gap-2.5 px-2 py-1.5 text-muted-foreground text-xs rounded">
                  <Calendar size={13} />
                  <span>Bookings</span>
                </div>
                <div className="flex items-center gap-2.5 px-2 py-1.5 text-muted-foreground text-xs rounded">
                  <Wrench size={13} />
                  <span>Maintenance</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-2 mt-auto flex items-center justify-between gap-1.5 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="h-5 w-5 bg-card border border-border flex items-center justify-center text-[8px] font-bold rounded-full text-foreground shrink-0">
                  V
                </div>
                <span className="text-[10px] font-medium truncate">Vinit</span>
              </div>
              <MoreHorizontal size={12} className="text-muted-foreground" />
            </div>
          </div>

          {/* Mock Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 h-full bg-background overflow-hidden p-4 sm:p-6 space-y-6">
            <div className="flex justify-between items-center shrink-0">
              <span className="text-xs text-muted-foreground font-medium">Organization ⌄</span>
              <span className="text-xs text-muted-foreground font-mono">Overview</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-medium tracking-tight">Overview</h3>
            </div>

            {/* Content Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow overflow-hidden">
              {/* KPI Mock */}
              <Card className="p-4 flex flex-col justify-between text-xs h-fit sm:h-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">Usage</span>
                  <Info size={12} className="text-muted-foreground" />
                </div>
                <div className="divide-y divide-border text-[11px]">
                  <div className="py-2 flex justify-between">
                    <span className="text-muted-foreground">Assets Available</span>
                    <span className="font-mono text-foreground">128</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-muted-foreground">Assets Allocated</span>
                    <span className="font-mono text-foreground">76</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-muted-foreground">Maintenance Today</span>
                    <span className="font-mono text-foreground">4</span>
                  </div>
                </div>
              </Card>

              {/* Overdue Mock */}
              <Card className="p-4 flex flex-col justify-between text-xs h-fit sm:h-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">Overdue Returns</span>
                  <Info size={12} className="text-muted-foreground" />
                </div>
                <div className="divide-y divide-border text-[11px] flex-1 flex flex-col justify-center">
                  <div className="py-2 flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <StatusDot status="overdue" label="" className="h-1.5 w-1.5 shrink-0" />
                      <span className="font-mono text-foreground">AF-0043</span>
                    </span>
                    <span className="text-muted-foreground text-[10px]">Aarav Patel</span>
                  </div>
                  <div className="py-2 flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <StatusDot status="overdue" label="" className="h-1.5 w-1.5 shrink-0" />
                      <span className="font-mono text-foreground">AF-0129</span>
                    </span>
                    <span className="text-muted-foreground text-[10px]">Sarah Connor</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="px-6 md:px-10 py-20 max-w-[1200px] mx-auto border-t border-border">
        <div className="text-center mb-16 space-y-2">
          <span className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground uppercase">FEATURES</span>
          <h2 className="text-3xl font-medium tracking-tight">Structured workflow for physical resources</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="space-y-4 hover:bg-card-hover cursor-pointer transition-colors duration-150">
            <div className="p-2 border border-border rounded-md bg-background w-fit">
              <Package size={20} className="text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium">Asset Registry</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Maintain a detailed registry of physical assets, IT hardware, machines, and keys. Support inline status dots and complete lifecycle tracking.
            </p>
          </Card>

          <Card className="space-y-4 hover:bg-card-hover cursor-pointer transition-colors duration-150">
            <div className="p-2 border border-border rounded-md bg-background w-fit">
              <ArrowLeftRight size={20} className="text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium">Allocation & Custody</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Easily assign assets to employees or departments. Handle custody handovers, transfer requests, and generate structured activity timelines.
            </p>
          </Card>

          <Card className="space-y-4 hover:bg-card-hover cursor-pointer transition-colors duration-150">
            <div className="p-2 border border-border rounded-md bg-background w-fit">
              <Calendar size={20} className="text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium">Resource Booking</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Prevent booking conflicts. Reserve meeting rooms, hot desks, projector kits, and company cars using custom scheduling rules.
            </p>
          </Card>

          <Card className="space-y-4 hover:bg-card-hover cursor-pointer transition-colors duration-150">
            <div className="p-2 border border-border rounded-md bg-background w-fit">
              <Wrench size={20} className="text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium">Maintenance Logs</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Raise maintenance tickets for damaged assets, assign service technicians, track tasks via a visual status board, and log resolution times.
            </p>
          </Card>

          <Card className="space-y-4 hover:bg-card-hover cursor-pointer transition-colors duration-150">
            <div className="p-2 border border-border rounded-md bg-background w-fit">
              <ClipboardCheck size={20} className="text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium">Compliance Audits</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Initiate audit cycles to verify custody states. Scan barcodes or check serial numbers to flag missing, retired, or damaged hardware.
            </p>
          </Card>

          <Card className="space-y-4 hover:bg-card-hover cursor-pointer transition-colors duration-150">
            <div className="p-2 border border-border rounded-md bg-background w-fit">
              <BarChart3 size={20} className="text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium">Enterprise Analytics</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Generate structured reports, audit logs, and status dashboards. Track allocation metrics, cost distribution, and space utilization rates.
            </p>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="px-6 md:px-10 py-20 max-w-[1200px] mx-auto border-t border-border">
        <div className="text-center mb-16 space-y-2">
          <span className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground uppercase">TRUSTED BY TEAMS</span>
          <h2 className="text-3xl font-medium tracking-tight">Built for operational excellence</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed italic">
              "AssetFlow solved our IT inventory and equipment handoff nightmare. The interface is clean, incredibly quick, and matches our Vercel-driven development flow perfectly."
            </p>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-[10px]">
                PS
              </div>
              <div>
                <p className="text-xs font-semibold">Priya Shah</p>
                <p className="text-[10px] text-muted-foreground">IT Lead, TechScale Inc.</p>
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed italic">
              "Managing physical rooms and shared hardware pools used to require three different Excel logs. Now our entire office runs on AssetFlow. Highly recommended."
            </p>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-[10px]">
                AP
              </div>
              <div>
                <p className="text-xs font-semibold">Aarav Patel</p>
                <p className="text-[10px] text-muted-foreground">Operations Manager, Orbit Corp</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-6 md:px-10 py-20 max-w-[800px] mx-auto text-center space-y-6">
        <h2 className="text-3xl font-medium tracking-tight">Deploy your asset portal today</h2>
        <p className="text-sm text-muted-foreground max-w-[500px] mx-auto leading-relaxed">
          Create a free workspace for your organization. Start tracking resources, booking spaces, and streamlining equipment allocations in minutes.
        </p>
        <div className="flex justify-center">
          <Button size="lg" onClick={handleCtaClick} className="flex items-center gap-2">
            <span>Get Started for Free</span>
            <ArrowRight size={14} />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-10 py-10 border-t border-border bg-black/40 text-xs text-muted-foreground-2 flex flex-col md:flex-row items-center justify-between gap-4 select-none shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-foreground text-background flex items-center justify-center font-bold text-[9px] rounded-sm">
            AF
          </div>
          <span>AssetFlow Inc.</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">Security</span>
        </div>
        <div>
          © {new Date().getFullYear()} AssetFlow. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
