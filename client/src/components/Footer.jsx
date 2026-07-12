import { useEffect, useRef } from 'react';

/**
 * Footer Component - Redesigned
 * 
 * Spacing: Generous padding (py-24)
 * Color: Deep Navy solid (bg-slate-950) matching the landing page end section.
 * Design: High-fidelity border-t transition gradient divider, subtle top background glow,
 *         and high-contrast links with smooth transitions.
 * Animations: Scroll-reveal using IntersectionObserver.
 */
export default function Footer({ onLogoClick = () => {} }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const element = containerRef.current?.querySelector('.reveal-el');
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  return (
    <footer 
      ref={containerRef}
      className="bg-slate-950 text-slate-400 text-sm relative overflow-hidden py-24 border-none"
    >
      {/* Premium top separator gradient line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/25 to-transparent pointer-events-none" />
      
      {/* Soft atmospheric ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-32 bg-indigo-500/[0.04] blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10 reveal-el reveal">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Logo and Brand Info */}
          <div className="md:col-span-1 flex flex-col items-start gap-4">
            <button 
              onClick={onLogoClick} 
              className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-sky-400/80 focus:ring-offset-2 focus:ring-offset-slate-950 rounded-xl px-2 py-1 -ml-2 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3M3 12a48.29 48.29 0 011.038-10m0 0a4.006 4.006 0 013.7-3.7m-.038 13.7l-3-3m3 3l3-3M21 12a48.29 48.29 0 01-1.038 10M19.962 12l3 3m-3-3l-3 3M3 12c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.038 12L1.038 15m3-3l3 3" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-sky-300 transition-colors duration-300">
                AssetFlow
              </span>
            </button>
            <p className="text-xs text-slate-500 leading-relaxed mt-2 pr-4">
              Next-generation Enterprise Asset & Resource Management ERP platform. Streamlining operations across physical hardware, spaces, and scheduling.
            </p>
          </div>

          {/* Column 1: Product (scroll anchors) */}
          <div className="flex flex-col gap-3.5">
            <h4 className="font-extrabold text-slate-200 tracking-wider text-xs uppercase mb-3">Product</h4>
            <a href="#features" className="hover:text-white transition-colors text-xs py-0.5 w-fit">Features</a>
            <a href="#asset-lifecycle" className="hover:text-white transition-colors text-xs py-0.5 w-fit">Asset Lifecycle</a>
            <a href="#resource-bookings" className="hover:text-white transition-colors text-xs py-0.5 w-fit">Resource Bookings</a>
            <a href="#maintenance" className="hover:text-white transition-colors text-xs py-0.5 w-fit">Maintenance</a>
          </div>

          {/* Column 2: Company */}
          <div className="flex flex-col gap-3.5">
            <h4 className="font-extrabold text-slate-200 tracking-wider text-xs uppercase mb-3">Company</h4>
            <a href="#" className="hover:text-white transition-colors text-xs py-0.5 w-fit">About Us</a>
            <a href="#" className="hover:text-white transition-colors text-xs py-0.5 w-fit">Contact</a>
            <a href="#" className="hover:text-white transition-colors text-xs py-0.5 w-fit">Careers</a>
            <a href="#" className="hover:text-white transition-colors text-xs py-0.5 w-fit">Partners</a>
          </div>

          {/* Column 3: Resources */}
          <div className="flex flex-col gap-3.5">
            <h4 className="font-extrabold text-slate-200 tracking-wider text-xs uppercase mb-3">Resources</h4>
            <a href="#" className="hover:text-white transition-colors text-xs py-0.5 w-fit">Documentation</a>
            <a href="#" className="hover:text-white transition-colors text-xs py-0.5 w-fit">Support Center</a>
            <a href="#" className="hover:text-white transition-colors text-xs py-0.5 w-fit">API Reference</a>
            <a href="#" className="hover:text-white transition-colors text-xs py-0.5 w-fit">Status</a>
          </div>

        </div>

        {/* Divider and Copyright */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <p>© 2026 AssetFlow Enterprise. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
