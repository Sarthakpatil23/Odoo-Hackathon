import { useEffect, useRef } from 'react';

/**
 * Resource Bookings Section Component - Redesigned
 * 
 * Spacing: Generous padding (py-32)
 * Color: White background (#FFFFFF) to contrast against the off-white sections.
 * Layout: An elevated high-fidelity schedule monitor widget wrapped in an atmospheric glow container.
 * Animations: Viewport entry triggers for the header and visual scheduler.
 */
export default function ResourceBookings() {
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

  return (
    <section 
      id="resource-bookings" 
      ref={containerRef}
      className="py-32 bg-white text-slate-900 relative overflow-hidden"
    >
      {/* Ambient decorative lighting */}
      <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full bg-sky-200/10 blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 reveal-el reveal">
          <h2 className="text-[11px] font-bold text-indigo-600 uppercase tracking-[0.2em] mb-4">
            Conflict Prevention
          </h2>
          <h3 className="text-4xl sm:text-5xl font-extrabold mt-3 tracking-tight text-slate-900 leading-[1.15]">
            Book shared resources without the{" "}
            <span className="font-serif italic text-indigo-600 font-semibold">double-booking headache</span>.
          </h3>
          <p className="text-lg md:text-xl font-light text-slate-600 mt-8 leading-relaxed">
            See existing bookings at a glance, and let the system reject overlapping requests automatically.
          </p>
        </div>

        {/* Visual Mock Container */}
        <div className="relative max-w-4xl mx-auto reveal-el reveal-scale">
          {/* Ambient drop shadow/glow behind the dashboard wrapper */}
          <div className="absolute -inset-4 bg-indigo-500/[0.04] rounded-[2.5rem] blur-2xl pointer-events-none" />
          
          <div className="relative bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-800/80 overflow-hidden">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-8">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Validation Engine</span>
                </div>
                <h4 className="text-lg font-bold mt-2 text-slate-100">Overlap Check: Room B2 Schedule</h4>
              </div>
              
              {/* Legend with styled indicators */}
              <div className="flex flex-wrap gap-4 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700" />
                  <span className="text-slate-400">Existing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-rose-500/10 border border-rose-500/30" />
                  <span className="text-rose-400">Rejected (Overlap)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-emerald-500/10 border border-emerald-500/30" />
                  <span className="text-emerald-400">Accepted</span>
                </div>
              </div>
            </div>

            {/* Time scale headers */}
            <div className="grid grid-cols-5 text-center text-[10px] font-bold text-slate-500 mb-3 px-4 uppercase tracking-wider">
              <div>09:00</div>
              <div>09:30</div>
              <div>10:00</div>
              <div>10:30</div>
              <div>11:00</div>
            </div>

            {/* Schedule Grid */}
            <div className="space-y-6 relative">
              
              {/* Row 1: Existing Booking */}
              <div className="relative bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden group hover:border-slate-700/60 transition-all duration-300">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-600" />
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Room B2 — Confirmed Slot</span>
                  <p className="text-base font-bold text-slate-200 mt-1">Marketing Sync (Priya Patel)</p>
                </div>
                <div className="bg-slate-800/80 border border-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold text-center md:text-right min-w-[140px] shadow-sm">
                  09:00 – 10:00
                </div>
              </div>

              {/* Row 2: Overlapping Attempt (Rejected) */}
              <div className="relative bg-rose-500/[0.02] border border-rose-500/20 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden group hover:border-rose-500/40 transition-all duration-300">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Attempted Booking — Overlap Blocked</span>
                    <span className="bg-rose-500/10 text-rose-400 text-[9px] px-2 py-0.5 rounded-full font-bold border border-rose-500/20 uppercase tracking-wider">Rejected</span>
                  </div>
                  <p className="text-base font-bold text-slate-400 mt-1 line-through decoration-slate-600 decoration-2">Product Demo (Raj Kumar)</p>
                  <p className="text-xs text-rose-400/85 mt-2.5 flex items-center gap-2">
                    <svg className="w-4 h-4 text-rose-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                    Overlap check failed: starts before 10:00
                  </p>
                </div>
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-2.5 rounded-xl text-xs font-bold text-center md:text-right min-w-[140px] shadow-sm">
                  09:30 – 10:30
                </div>
              </div>

              {/* Row 3: Consecutive Attempt (Accepted) */}
              <div className="relative bg-emerald-500/[0.02] border border-emerald-500/20 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Attempted Booking — Back-to-Back</span>
                    <span className="bg-emerald-500/10 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full font-bold border border-emerald-500/20 uppercase tracking-wider">Accepted</span>
                  </div>
                  <p className="text-base font-bold text-slate-200 mt-1">Design Review (Sarah Jenkins)</p>
                  <p className="text-xs text-emerald-400/85 mt-2.5 flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    Valid: Starts exactly at previous booking end time (10:00)
                  </p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2.5 rounded-xl text-xs font-bold text-center md:text-right min-w-[140px] shadow-sm">
                  10:00 – 11:00
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
