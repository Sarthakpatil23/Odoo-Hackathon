import { useEffect, useRef } from 'react';

/**
 * Stats Band Component - Redesigned
 * 
 * Spacing: Generous padding (py-24)
 * Color: Deep Navy theme (bg-slate-900) matching the design system specifications.
 * Background: Ambient top lighting glow and subtle dot grid overlay to add modern depth.
 * Card/Item: Hover-glowing border/background icon containers.
 * Animations: Scroll-reveal using IntersectionObserver.
 */
export default function StatsBand() {
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

    const elements = containerRef.current?.querySelectorAll('.reveal-el');
    elements?.forEach((el) => observer.observe(el));

    return () => {
      elements?.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const stats = [
    {
      title: "7 Core Modules",
      desc: "Departments, categories, assets, allocations, bookings, maintenance & audits.",
      icon: (
        <svg className="w-6 h-6 text-sky-400 transition-colors duration-300 group-hover:text-sky-300" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      title: "Zero Double-Allocations",
      desc: "Conflict engine automatically locks already-held assets and offers transfers.",
      icon: (
        <svg className="w-6 h-6 text-sky-400 transition-colors duration-300 group-hover:text-sky-300" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      )
    },
    {
      title: "Full Audit Trail",
      desc: "Complete chronological logs for every single action and state change.",
      icon: (
        <svg className="w-6 h-6 text-sky-400 transition-colors duration-300 group-hover:text-sky-300" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: "Role-Based Access",
      desc: "Admin, Manager, Dept Head, and Employee scopes set by design.",
      icon: (
        <svg className="w-6 h-6 text-sky-400 transition-colors duration-300 group-hover:text-sky-300" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      )
    }
  ];

  return (
    <section 
      ref={containerRef}
      className="py-24 bg-slate-900 text-white border-t border-b border-slate-800/80 relative overflow-hidden bg-dot-grid"
    >
      {/* Ambient lighting at the top of the dark band */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-24 bg-indigo-500/10 blur-[60px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-sky-500/[0.02] blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center reveal-el reveal-scale">
          {stats.map((item, idx) => (
            <div 
              key={idx} 
              className="flex flex-col items-center max-w-xs mx-auto group"
            >
              {/* Stat Icon Container with glowing hover states */}
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center mb-6 border border-slate-700/60 shadow-inner group-hover:scale-110 group-hover:border-sky-500/30 group-hover:bg-sky-500/10 transition-all duration-300">
                {item.icon}
              </div>
              
              {/* Stat Title */}
              <h4 className="text-xl font-bold text-slate-100 tracking-tight mb-3 transition-colors duration-300 group-hover:text-white">
                {item.title}
              </h4>
              
              {/* Stat Description */}
              <p className="text-slate-400 text-xs leading-relaxed px-1">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
