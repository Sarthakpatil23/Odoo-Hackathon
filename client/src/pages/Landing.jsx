import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/shared/Card';
import { StatusDot } from '../components/shared/StatusDot';
import { Button } from '../components/ui/button';
import ShapeGrid from '../components/ui/ShapeGrid';
import CardSwap, { Card as SwapCard } from '../components/ui/CardSwap';
import img1 from '../assets/image 1.png';
import img2 from '../assets/image 2.png';
import img3 from '../assets/image 3.png';
import {
  LayoutDashboard,
  Building,
  Package,
  ArrowLeftRight,
  Calendar,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Search,
  ChevronDown,
  Info,
  Clock,
  ArrowRight,
  Users,
  MoreHorizontal,
  Globe,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Sun,
  Moon
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleCtaClick = () => {
    navigate('/dashboard');
  };

  return (
    <div className={`${theme} min-h-screen bg-background text-foreground selection:bg-white/10 relative overflow-hidden font-sans antialiased`}>
      
      {/* ShapeGrid Animated Canvas Background */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <ShapeGrid 
          speed={0.5} 
          squareSize={40}
          direction="diagonal"
          borderColor={theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'}
          hoverFillColor={theme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'}
          shape="square"
          hoverTrailAmount={5}
        />
      </div>

      {/* Subtle radial white glow behind the hero canvas */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-white/[0.015] dark:bg-white/[0.01] rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Navigation Header */}
      <header className="px-6 md:px-10 py-4 flex items-center justify-between border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-50 select-none relative">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-foreground text-background flex items-center justify-center font-bold text-[10px] rounded-[3px] select-none">
            AF
          </div>
          <span className="font-semibold text-sm tracking-tight text-foreground select-none">AssetFlow</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#preview" className="hover:text-foreground transition-colors">Platform Preview</a>
          <a href="#testimonials" className="hover:text-foreground transition-colors">Customers</a>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Switcher Button */}
          <button 
            onClick={toggleTheme}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-md transition-colors mr-1"
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

      {/* Hero Section — two column: text left, CardSwap right */}
      <section className="px-6 md:px-10 pt-20 pb-10 max-w-[1200px] mx-auto z-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-16">

          {/* Left — headline + CTA */}
          <div className="lg:col-span-6 space-y-7 text-left max-w-[580px]">
            <div className="inline-flex items-center gap-1.5 border border-border rounded-full px-3 py-1 text-xs text-muted-foreground bg-card/30">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              <span>AssetFlow v2.0 Platform is Live</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-medium tracking-tight text-foreground leading-[1.05] font-sans">
              Track every asset.<br />Manage every space.
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-[520px] font-sans leading-relaxed">
              Digitize and streamline how your organization tracks, allocates, and maintains physical equipment, shared spaces, and team resources in a single unified system.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-3 pt-2">
              <Button size="lg" onClick={handleCtaClick} className="w-full sm:w-auto flex items-center gap-2">
                <span>{user ? 'Go to Dashboard' : 'Get Started Now'}</span>
                <ArrowRight size={14} />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="w-full sm:w-auto">
                Log In as Guest
              </Button>
            </div>
          </div>

          {/* Right — CardSwap stack with the 3 product screenshots */}
          <div
            className="lg:col-span-6 relative w-full h-[460px] lg:h-[540px] pointer-events-none select-none flex justify-center lg:justify-end"
            aria-hidden="true"
          >
            <CardSwap
              width={450}
              height={315}
              cardDistance={75}
              verticalDistance={75}
              delay={3500}
              pauseOnHover={false}
              skewAmount={5}
              easing="elastic"
            >
              <SwapCard>
                <img
                  src={img1}
                  alt="AssetFlow dashboard screenshot"
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </SwapCard>
              <SwapCard>
                <img
                  src={img2}
                  alt="AssetFlow asset registry screenshot"
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </SwapCard>
              <SwapCard>
                <img
                  src={img3}
                  alt="AssetFlow maintenance board screenshot"
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </SwapCard>
            </CardSwap>
          </div>

        </div>
      </section>

      {/* Platform Mockup Preview Section */}
      <section id="preview" className="px-6 md:px-10 py-12 max-w-[1200px] mx-auto border-t border-border/60 z-10 relative">
        <div className="text-center mb-10 space-y-2">
          <span className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground-2 uppercase">PLATFORM PREVIEW</span>
          <h2 className="text-2xl font-medium tracking-tight text-foreground">Interactive Interface Sandbox</h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">Click sidebar navigation tabs in the mockup below to explore the visual design system</p>
        </div>

        {/* Live CSS Interactive Dashboard Preview */}
        <div className="border border-border rounded-lg bg-surface shadow-2xl overflow-hidden aspect-[16/10] max-w-[960px] mx-auto flex select-none text-left">
          {/* Mock Sidebar */}
          <div className="w-[180px] sm:w-[220px] border-r border-border h-full flex flex-col p-3 shrink-0 bg-surface text-foreground font-sans justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-1.5 border-b border-border">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-4 w-4 bg-foreground text-background flex items-center justify-center font-bold text-[9px] rounded-[2px] shrink-0">
                    AF
                  </div>
                  <span className="text-xs font-semibold truncate text-foreground">AssetFlow</span>
                </div>
                <ChevronDown size={12} className="text-muted-foreground" />
              </div>

              {/* Fake Search bar */}
              <div className="px-0.5">
                <div className="flex items-center justify-between bg-card border border-border rounded-[4px] px-2 py-1 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Search size={10} className="text-muted-foreground" />
                    <span>Find</span>
                  </div>
                  <span className="font-mono text-[8px] border border-border rounded px-1 bg-black/40">⌘K</span>
                </div>
              </div>

              <div className="space-y-0.5">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-2.5 px-2 py-1.5 text-xs font-medium rounded transition-colors text-left ${
                    activeTab === 'dashboard'
                      ? 'bg-card border border-border-strong text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <LayoutDashboard size={13} />
                  <span>Dashboard</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('assets')}
                  className={`w-full flex items-center gap-2.5 px-2 py-1.5 text-xs font-medium rounded transition-colors text-left ${
                    activeTab === 'assets'
                      ? 'bg-card border border-border-strong text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Package size={13} />
                  <span>Assets</span>
                </button>

                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`w-full flex items-center gap-2.5 px-2 py-1.5 text-xs font-medium rounded transition-colors text-left ${
                    activeTab === 'bookings'
                      ? 'bg-card border border-border-strong text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Calendar size={13} />
                  <span>Bookings</span>
                </button>

                <button
                  onClick={() => setActiveTab('maintenance')}
                  className={`w-full flex items-center gap-2.5 px-2 py-1.5 text-xs font-medium rounded transition-colors text-left ${
                    activeTab === 'maintenance'
                      ? 'bg-card border border-border-strong text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Wrench size={13} />
                  <span>Maintenance</span>
                </button>
              </div>
            </div>

            {/* Bottom pinned account profile */}
            <div className="border-t border-border pt-2 flex items-center justify-between gap-1.5 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="h-5 w-5 bg-card border border-border flex items-center justify-center text-[8px] font-bold rounded-full text-foreground shrink-0">
                  V
                </div>
                <span className="text-[10px] font-medium truncate text-foreground">Vinit</span>
              </div>
              <MoreHorizontal size={12} className="text-muted-foreground" />
            </div>
          </div>

          {/* Mock Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 h-full bg-background overflow-hidden p-4 sm:p-6 space-y-6">
            <div className="flex justify-between items-center shrink-0">
              <span className="text-xs text-muted-foreground font-medium">Organization ⌄</span>
              <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                {activeTab}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-medium tracking-tight text-foreground capitalize">
                {activeTab === 'dashboard' ? 'Overview' : activeTab}
              </h3>
            </div>

            {/* Content Switcher depending on clicked tab */}
            <div className="flex-grow overflow-y-auto">
              {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* KPI Mock */}
                  <Card className="p-4 flex flex-col justify-between text-xs">
                    <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
                      <span className="font-medium text-foreground">Usage Stats</span>
                      <Info size={12} className="text-muted-foreground" />
                    </div>
                    <div className="space-y-2 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Assets Available</span>
                        <span className="font-mono text-foreground">128</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Assets Allocated</span>
                        <span className="font-mono text-foreground">76</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Active Bookings</span>
                        <span className="font-mono text-foreground">9</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Maintenance Tickets</span>
                        <span className="font-mono text-foreground">4</span>
                      </div>
                    </div>
                  </Card>

                  {/* Overdue Returns Mock */}
                  <Card className="p-4 flex flex-col justify-between text-xs">
                    <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
                      <span className="font-medium text-foreground">Overdue Returns</span>
                      <Info size={12} className="text-muted-foreground" />
                    </div>
                    <div className="space-y-2 text-[11px]">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5">
                          <StatusDot status="overdue" label="" className="h-1.5 w-1.5 shrink-0" />
                          <span className="font-mono text-foreground">AF-0043</span>
                        </span>
                        <span className="text-muted-foreground text-[10px]">Aarav Patel</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5">
                          <StatusDot status="overdue" label="" className="h-1.5 w-1.5 shrink-0" />
                          <span className="font-mono text-foreground">AF-0129</span>
                        </span>
                        <span className="text-muted-foreground text-[10px]">Sarah Connor</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5">
                          <StatusDot status="overdue" label="" className="h-1.5 w-1.5 shrink-0" />
                          <span className="font-mono text-foreground">AF-0098</span>
                        </span>
                        <span className="text-muted-foreground text-[10px]">John Doe</span>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'assets' && (
                <Card className="p-0 overflow-hidden border border-border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-card/50 text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                          <th className="py-2.5 px-3 font-normal">Tag</th>
                          <th className="py-2.5 px-3 font-normal">Name</th>
                          <th className="py-2.5 px-3 font-normal">Category</th>
                          <th className="py-2.5 px-3 font-normal">Status</th>
                          <th className="py-2.5 px-3 font-normal">Custodian</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-[11px]">
                        <tr className="hover:bg-white/[0.02]">
                          <td className="py-2 px-3 font-mono text-foreground">AF-0114</td>
                          <td className="py-2 px-3 text-muted-foreground">MacBook Pro 16"</td>
                          <td className="py-2 px-3 text-muted-foreground">IT Hardware</td>
                          <td className="py-2 px-3">
                            <StatusDot status="allocated" className="text-[11px]" />
                          </td>
                          <td className="py-2 px-3 text-muted-foreground">Priya Shah</td>
                        </tr>
                        <tr className="hover:bg-white/[0.02]">
                          <td className="py-2 px-3 font-mono text-foreground">AF-0052</td>
                          <td className="py-2 px-3 text-muted-foreground">Dell 27" Monitor</td>
                          <td className="py-2 px-3 text-muted-foreground">IT Hardware</td>
                          <td className="py-2 px-3">
                            <StatusDot status="available" className="text-[11px]" />
                          </td>
                          <td className="py-2 px-3 text-muted-foreground-2">—</td>
                        </tr>
                        <tr className="hover:bg-white/[0.02]">
                          <td className="py-2 px-3 font-mono text-foreground">AF-0081</td>
                          <td className="py-2 px-3 text-muted-foreground">Conference Room A</td>
                          <td className="py-2 px-3 text-muted-foreground">Space</td>
                          <td className="py-2 px-3">
                            <StatusDot status="available" className="text-[11px]" />
                          </td>
                          <td className="py-2 px-3 text-muted-foreground-2">—</td>
                        </tr>
                        <tr className="hover:bg-white/[0.02]">
                          <td className="py-2 px-3 font-mono text-foreground">AF-0142</td>
                          <td className="py-2 px-3 text-muted-foreground">Company Car</td>
                          <td className="py-2 px-3 text-muted-foreground">Vehicle</td>
                          <td className="py-2 px-3">
                            <StatusDot status="maintenance" label="Maintenance" className="text-[11px]" />
                          </td>
                          <td className="py-2 px-3 text-muted-foreground">Repair Shop</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {activeTab === 'bookings' && (
                <Card className="p-0 overflow-hidden border border-border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-card/50 text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                          <th className="py-2.5 px-3 font-normal">Resource</th>
                          <th className="py-2.5 px-3 font-normal">Scheduled Time</th>
                          <th className="py-2.5 px-3 font-normal">Status</th>
                          <th className="py-2.5 px-3 font-normal">Reserved By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-[11px]">
                        <tr className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-3 text-foreground font-medium">Room B2</td>
                          <td className="py-2.5 px-3 text-muted-foreground">Today, 2:00 PM – 3:00 PM</td>
                          <td className="py-2.5 px-3">
                            <StatusDot status="approved" label="Confirmed" className="text-[11px]" />
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground">John Doe</td>
                        </tr>
                        <tr className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-3 text-foreground font-medium">Projector Kit 1</td>
                          <td className="py-2.5 px-3 text-muted-foreground">Tomorrow, 9:00 AM – 12:00 PM</td>
                          <td className="py-2.5 px-3">
                            <StatusDot status="pending" className="text-[11px]" />
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground">Sarah Connor</td>
                        </tr>
                        <tr className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-3 text-foreground font-medium">Tesla Model Y</td>
                          <td className="py-2.5 px-3 text-muted-foreground">July 14, 10:00 AM – 4:00 PM</td>
                          <td className="py-2.5 px-3">
                            <StatusDot status="reserved" label="Upcoming" className="text-[11px]" />
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground">Aarav Patel</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {activeTab === 'maintenance' && (
                <Card className="p-0 overflow-hidden border border-border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-card/50 text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                          <th className="py-2.5 px-3 font-normal">Asset</th>
                          <th className="py-2.5 px-3 font-normal">Issue Description</th>
                          <th className="py-2.5 px-3 font-normal">Priority</th>
                          <th className="py-2.5 px-3 font-normal">Technician</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-[11px]">
                        <tr className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-3 font-mono text-foreground">AF-0142</td>
                          <td className="py-2.5 px-3 text-muted-foreground">AC Compressor Leak</td>
                          <td className="py-2.5 px-3">
                            <StatusDot status="high priority" label="High" className="text-[11px]" />
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground">John Tech</td>
                        </tr>
                        <tr className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-3 font-mono text-foreground">AF-0029</td>
                          <td className="py-2.5 px-3 text-muted-foreground">Cracked Laptop Screen</td>
                          <td className="py-2.5 px-3">
                            <StatusDot status="pending" label="Medium" className="text-[11px]" />
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground">Waiting for parts</td>
                        </tr>
                        <tr className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-3 font-mono text-foreground">AF-0062</td>
                          <td className="py-2.5 px-3 text-muted-foreground">Network Switch Offline</td>
                          <td className="py-2.5 px-3">
                            <StatusDot status="resolved" label="Completed" className="text-[11px]" />
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground">Completed Yesterday</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Metrics strip band */}
      <section className="px-6 md:px-10 py-10 max-w-[1200px] mx-auto z-10 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border border-border rounded-lg bg-card/30 p-6 text-left">
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">LIFECYCLE SCALE</div>
            <div className="text-xl font-medium text-foreground">12,000+ Assets</div>
            <div className="text-[11px] text-muted-foreground-2">Fully tracked with history</div>
          </div>
          <div className="space-y-1 border-t border-border pt-4 md:pt-0 md:border-t-0 md:border-l md:pl-6">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">SCHEDULING RATE</div>
            <div className="text-xl font-medium text-foreground">99.9% Uptime</div>
            <div className="text-[11px] text-muted-foreground-2">Conflict-free reservations</div>
          </div>
          <div className="space-y-1 border-t border-border pt-4 md:pt-0 md:border-t-0 md:border-l md:pl-6">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">AUDIT INTEGRITY</div>
            <div className="text-xl font-medium text-foreground">100% Trail</div>
            <div className="text-[11px] text-muted-foreground-2">Verifiable custody logging</div>
          </div>
          <div className="space-y-1 border-t border-border pt-4 md:pt-0 md:border-t-0 md:border-l md:pl-6">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">ENTERPRISE SYSTEM</div>
            <div className="text-xl font-medium text-foreground">Dark Only</div>
            <div className="text-[11px] text-muted-foreground-2">High density monochrome UI</div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="px-6 md:px-10 py-20 max-w-[1200px] mx-auto border-t border-border/60 z-10 relative">
        <div className="text-center mb-16 space-y-2">
          <span className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground-2 uppercase">FEATURES</span>
          <h2 className="text-3xl font-medium tracking-tight text-foreground">Structured workflows for physical operations</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="space-y-4 hover:bg-card-hover hover:border-strong cursor-pointer transition-colors duration-150 text-left">
            <div className="p-2 border border-border rounded-md bg-background w-fit">
              <Package size={18} className="text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium text-foreground">Asset Registry</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Maintain a detailed registry of physical assets, IT hardware, machines, and keys. Supports inline status dots and complete lifecycle tracking.
            </p>
          </Card>

          <Card className="space-y-4 hover:bg-card-hover hover:border-strong cursor-pointer transition-colors duration-150 text-left">
            <div className="p-2 border border-border rounded-md bg-background w-fit">
              <ArrowLeftRight size={18} className="text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium text-foreground">Allocation & Custody</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Easily assign assets to employees or departments. Handle custody handovers, transfer requests, and generate structured activity timelines.
            </p>
          </Card>

          <Card className="space-y-4 hover:bg-card-hover hover:border-strong cursor-pointer transition-colors duration-150 text-left">
            <div className="p-2 border border-border rounded-md bg-background w-fit">
              <Calendar size={18} className="text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium text-foreground">Resource Booking</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Prevent booking conflicts. Reserve meeting rooms, hot desks, projector kits, and company cars using custom scheduling rules.
            </p>
          </Card>

          <Card className="space-y-4 hover:bg-card-hover hover:border-strong cursor-pointer transition-colors duration-150 text-left">
            <div className="p-2 border border-border rounded-md bg-background w-fit">
              <Wrench size={18} className="text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium text-foreground">Maintenance Logs</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Raise maintenance tickets for damaged assets, assign service technicians, track tasks via a visual status board, and log resolution times.
            </p>
          </Card>

          <Card className="space-y-4 hover:bg-card-hover hover:border-strong cursor-pointer transition-colors duration-150 text-left">
            <div className="p-2 border border-border rounded-md bg-background w-fit">
              <ClipboardCheck size={18} className="text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium text-foreground">Compliance Audits</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Initiate audit cycles to verify custody states. Scan barcodes or check serial numbers to flag missing, retired, or damaged hardware.
            </p>
          </Card>

          <Card className="space-y-4 hover:bg-card-hover hover:border-strong cursor-pointer transition-colors duration-150 text-left">
            <div className="p-2 border border-border rounded-md bg-background w-fit">
              <BarChart3 size={18} className="text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium text-foreground">Enterprise Analytics</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Generate structured reports, audit logs, and status dashboards. Track allocation metrics, cost distribution, and space utilization rates.
            </p>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="px-6 md:px-10 py-20 max-w-[1200px] mx-auto border-t border-border/60 z-10 relative">
        <div className="text-center mb-16 space-y-2">
          <span className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground-2 uppercase">TRUSTED BY TEAMS</span>
          <h2 className="text-3xl font-medium tracking-tight text-foreground">Built for operational excellence</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="space-y-4 text-left border border-border">
            <p className="text-xs text-muted-foreground leading-relaxed italic">
              "AssetFlow solved our IT inventory and equipment handoff nightmare. The interface is clean, incredibly quick, and matches our Vercel-driven development flow perfectly."
            </p>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-[9px]">
                PS
              </div>
              <div>
                <p className="text-[11px] font-semibold text-foreground">Priya Shah</p>
                <p className="text-[9px] text-muted-foreground">IT Lead, TechScale Inc.</p>
              </div>
            </div>
          </Card>

          <Card className="space-y-4 text-left border border-border">
            <p className="text-xs text-muted-foreground leading-relaxed italic">
              "Managing physical rooms and shared hardware pools used to require three different Excel logs. Now our entire office runs on AssetFlow. Highly recommended."
            </p>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-[9px]">
                AP
              </div>
              <div>
                <p className="text-[11px] font-semibold text-foreground">Aarav Patel</p>
                <p className="text-[9px] text-muted-foreground">Operations Manager, Orbit Corp</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-6 md:px-10 py-24 max-w-[800px] mx-auto text-center space-y-6 border-t border-border/60 z-10 relative">
        <h2 className="text-3xl font-medium tracking-tight text-foreground">Deploy your asset portal today</h2>
        <p className="text-xs text-muted-foreground max-w-[500px] mx-auto leading-relaxed">
          Create a free workspace for your organization. Start tracking resources, booking spaces, and streamlining equipment allocations in minutes.
        </p>
        <div className="flex justify-center pt-2">
          <Button size="lg" onClick={handleCtaClick} className="flex items-center gap-2">
            <span>Get Started for Free</span>
            <ArrowRight size={14} />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-10 py-10 border-t border-border bg-black/40 text-[11px] text-muted-foreground-2 flex flex-col md:flex-row items-center justify-between gap-4 select-none shrink-0 z-10 relative">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-foreground text-background flex items-center justify-center font-bold text-[8px] rounded-[2px]">
            AF
          </div>
          <span className="text-foreground">AssetFlow Inc.</span>
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
