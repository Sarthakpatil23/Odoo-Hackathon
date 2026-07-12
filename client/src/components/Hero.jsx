import { useState, useEffect } from 'react';
import heroBg from '../assets/hero.jpg';

/**
 * Hero Component for Landing Page
 * 
 * Features:
 * 1. Full-bleed background image with subtle zoom animation and dark overlay gradient.
 * 2. Sticky transparent navigation bar with brand logo, "Get started" pill button, and responsive mobile hamburger menu.
 * 3. Centered typography layout featuring a custom hand-drawn SVG scribble around an accent word.
 * 4. Micro-interactive double CTA button row with hover transitions.
 * 5. Muted SVG trust badges row at the bottom for partner logos.
 */
export default function Hero({
  brandName = "AssetFlow",
  headlinePreAccent = "Turn asset chaos into",
  headlineAccent = "structured flow",
  headlinePostAccent = "",
  subheading = "Digitize how your organization tracks, allocates, and maintains physical equipment, shared spaces, and team resources in a single centralized platform.",
  ctaText = "Get started",
  navLinks = [
    { label: "Features", href: "#features", id: "nav-link-features" },
    { label: "Asset Lifecycle", href: "#asset-lifecycle", id: "nav-link-lifecycle" },
    { label: "Resource Bookings", href: "#resource-bookings", id: "nav-link-bookings" },
    { label: "Maintenance", href: "#maintenance", id: "nav-link-maintenance" }
  ],
  onCtaClick = () => {},
  onNavGetStartedClick = () => {},
  onLogoClick = () => {}
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track page scroll to add a solid backdrop-blur/fill to the nav when scrolled past the hero
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight - 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for Escape key to close the mobile menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  return (
    <section 
      id="hero-section" 
      className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden text-white select-none bg-slate-950 border-none outline-none m-0 p-0"
    >
      {/* 1. Full-bleed Background Image with Zoom and Gradient Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={heroBg}
          alt="AssetFlow Reference Background"
          className="w-full h-full object-cover object-center scale-105 transform animate-subtle-zoom opacity-95"
          style={{ transformOrigin: 'center center' }}
        />
        {/* Gradients to guarantee high contrast: Subtle dark overlay on top, deep fade at the bottom */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0.1) 400px, rgba(15, 23, 42, 0.4) 80%, rgba(15, 23, 42, 0.85) 100%)`
          }}
        />
      </div>

      {/* 2. Navigation Bar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-slate-900 border-b border-slate-800/80 shadow-lg shadow-slate-950/20 py-4' 
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex items-center justify-between">
          {/* Logo Mark + Brand name */}
          <button 
            id="nav-logo-btn"
            onClick={onLogoClick} 
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-950 rounded-xl px-2 py-1"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              {/* AssetFlow Icon (Circular/flowing layout representing asset lifecycle flow) */}
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3M3 12a48.29 48.29 0 011.038-10m0 0a4.006 4.006 0 013.7-3.7m-.038 13.7l-3-3m3 3l3-3M21 12a48.29 48.29 0 01-1.038 10M19.962 12l3 3m-3-3l-3 3M3 12c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.038 12L1.038 15m3-3l3 3" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-sky-300 transition-colors duration-300">
              {brandName}
            </span>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                id={link.id}
                href={link.href}
                className="text-sm font-medium text-slate-200/90 hover:text-white relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-sky-400 after:scale-x-0 hover:after:scale-x-100 after:origin-right hover:after:origin-left after:transition-transform after:duration-300 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Nav Right Group */}
          <div className="flex items-center gap-3">
            {/* "Get started" Pill Button */}
            <button
              id="nav-get-started-btn"
              onClick={onNavGetStartedClick}
              className="bg-white hover:bg-slate-50 text-slate-900 text-[14px] font-semibold px-6 py-2.5 rounded-full shadow-md shadow-black/10 hover:shadow-lg hover:shadow-black/20 transform hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
            >
              {ctaText}
            </button>

            {/* Hamburger Button (Matches height of get started pill) */}
            <button
              id="nav-hamburger-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-[42px] h-[42px] rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/10 text-white focus:outline-none transition-colors duration-300"
              aria-label="Toggle navigation menu"
              aria-expanded={isMenuOpen}
            >
              <div className="w-5 h-4 flex flex-col justify-between items-center relative">
                <span className={`w-5 h-0.5 bg-white rounded-full transition-transform duration-300 ${isMenuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
                <span className={`w-5 h-0.5 bg-white rounded-full transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
                <span className={`w-5 h-0.5 bg-white rounded-full transition-transform duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Glassmorphic Navigation Menu */}
      <div 
        id="mobile-menu-overlay"
        className={`fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex flex-col justify-center items-center gap-8 transition-all duration-500 md:hidden ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        <nav 
          className="flex flex-col items-center gap-6 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          {navLinks.map((link, idx) => (
            <a
              key={link.label}
              id={`mobile-${link.id}`}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className={`text-2xl font-bold tracking-tight text-white hover:text-sky-400 transition-colors transform duration-300 delay-[${idx * 50}ms] ${
                isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              {link.label}
            </a>
          ))}
          <button
            id="mobile-nav-cta-btn"
            onClick={() => {
              setIsMenuOpen(false);
              onNavGetStartedClick();
            }}
            className={`mt-4 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white font-bold px-8 py-3.5 rounded-full shadow-lg transition-transform duration-300 ${
              isMenuOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
            }`}
          >
            {ctaText}
          </button>
        </nav>
      </div>

      {/* 3. Hero Text & CTA Block */}
      <div className="relative z-10 flex-grow flex flex-col items-center justify-center px-6 text-center mt-24 md:mt-28">
        <div className="max-w-4xl mx-auto flex flex-col items-center animate-fade-in-up">
          {/* Main Headline */}
          <h1 
            id="hero-headline" 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight max-w-3xl"
          >
            {headlinePreAccent}{" "}
            <span className="relative inline-block text-sky-300 font-serif italic font-medium px-2 py-1 select-text">
              {headlineAccent}
              {/* Hand-drawn scribble SVG encircling the accent word */}
              <svg 
                className="absolute -inset-x-3 -inset-y-1.5 w-[calc(100%+1.5rem)] h-[calc(100%+0.75rem)] pointer-events-none select-none text-sky-400 opacity-95 skew-x-2 -rotate-1"
                viewBox="0 0 100 100" 
                preserveAspectRatio="none"
              >
                <path 
                  d="M 4 52 C 4 16, 96 12, 96 48 C 96 84, 2 86, 6 52 C 8 36, 52 26, 94 36" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="animate-draw-scribble"
                />
              </svg>
            </span>
            {headlinePostAccent && ` ${headlinePostAccent}`}
          </h1>

          {/* Subheading */}
          <p 
            id="hero-subheading" 
            className="text-[17px] sm:text-[19px] md:text-[21px] font-light text-slate-100 max-w-2xl mx-auto leading-relaxed tracking-wide mt-8 drop-shadow-md text-center opacity-90"
          >
            {subheading}
          </p>

          {/* 4. Call-to-Action Row */}
          <div className="flex items-center justify-center gap-3 mt-10">
            {/* Pill CTA button */}
            <button
              id="hero-cta-btn"
              onClick={onCtaClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[15px] px-8 py-4 rounded-full shadow-lg shadow-indigo-600/30 transform hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-300 border border-indigo-500/25 flex items-center justify-center h-[52px]"
            >
              {ctaText}
            </button>

            {/* Circular Diagonal Arrow Icon Button (Adjacent with a small gap and matching height) */}
            <button
              id="hero-arrow-btn"
              onClick={onCtaClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30 transform hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-300 border border-indigo-500/25"
              aria-label="Proceed to get started"
            >
              {/* Diagonal Arrow Icon ↗ */}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Trust Badges Row (Bottom of the hero section) */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-10 pb-12 pt-16 flex flex-col items-center gap-5 mt-auto">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-300/60 text-center">
          Trusted by leading operators worldwide
        </p>
        
        {/* Logos container: Flex wrap on desktop, horizontal scroll on mobile */}
        <div 
          id="hero-trust-badges"
          className="w-full flex items-center justify-start md:justify-center gap-10 md:gap-14 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 scrollbar-none snap-x snap-mandatory animate-fade-in"
        >
          {/* Logo 1: Apex Logistics */}
          <div className="flex-shrink-0 snap-center opacity-70 hover:opacity-95 transition-opacity duration-300">
            <svg className="h-7 text-white" viewBox="0 0 145 28" fill="currentColor">
              <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.5L20 8v8l-8 4-8-4V8l8-3.5z" />
              <text x="28" y="19" className="font-sans font-extrabold tracking-widest text-[11px] uppercase">ApexLogistics</text>
            </svg>
          </div>

          {/* Logo 2: Vanguard Group */}
          <div className="flex-shrink-0 snap-center opacity-70 hover:opacity-95 transition-opacity duration-300">
            <svg className="h-7 text-white" viewBox="0 0 120 28" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              <text x="28" y="19" className="font-sans font-extrabold tracking-widest text-[11px] uppercase">Vanguard</text>
            </svg>
          </div>

          {/* Logo 3: Sentinel Systems */}
          <div className="flex-shrink-0 snap-center opacity-70 hover:opacity-95 transition-opacity duration-300">
            <svg className="h-7 text-white" viewBox="0 0 115 28" fill="currentColor">
              <path d="M12 2L4 22h16L12 2zm0 4.5l6 13.5H6l6-13.5z" />
              <text x="28" y="19" className="font-sans font-extrabold tracking-widest text-[11px] uppercase">Sentinel</text>
            </svg>
          </div>

          {/* Logo 4: SyncGroup */}
          <div className="flex-shrink-0 snap-center opacity-70 hover:opacity-95 transition-opacity duration-300">
            <svg className="h-7 text-white" viewBox="0 0 120 28" fill="currentColor">
              <path d="M4 4h7v16H4zm9 0h7v16h-7z" />
              <text x="28" y="19" className="font-sans font-extrabold tracking-widest text-[11px] uppercase">SyncGroup</text>
            </svg>
          </div>

          {/* Logo 5: CoreTech */}
          <div className="flex-shrink-0 snap-center opacity-70 hover:opacity-95 transition-opacity duration-300">
            <svg className="h-7 text-white" viewBox="0 0 115 28" fill="currentColor">
              <path d="M12 2L2 9h20L12 2zm0 4.5L17.5 10H6.5L12 6.5zm-10 5.5h20v2H2zm2 4h16v6H4v-6z" />
              <text x="28" y="19" className="font-sans font-extrabold tracking-widest text-[11px] uppercase">CoreTech</text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
