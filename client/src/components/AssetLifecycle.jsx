import { useEffect, useRef } from 'react';

/**
 * Asset Lifecycle Section Component - Redesigned
 * 
 * Spacing: Generous padding (py-32)
 * Color: Off-white background (#FAFBFD) alternating from the features section.
 * Timeline: Premium product timeline design with a smooth multi-stop gradient connector,
 *           glowing nested nodes, and hover-triggered accent states.
 * Animations: Scroll-reveal using IntersectionObserver.
 */
export default function AssetLifecycle() {
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

  const steps = [
    {
      number: "1",
      state: "Available",
      desc: "Ready to be allocated or booked"
    },
    {
      number: "2",
      state: "Allocated",
      desc: "In use by an employee or department"
    },
    {
      number: "3",
      state: "Reserved",
      desc: "Held for an upcoming booking slot"
    },
    {
      number: "4",
      state: "Under Maintenance",
      desc: "Approved for repair, temporarily out of rotation"
    },
    {
      number: "5",
      state: "Retired",
      desc: "Reached end of life, removed from active inventory"
    },
    {
      number: "6",
      state: "Disposed",
      desc: "Scrapped or sold, transaction records archived"
    }
  ];

  return (
    <section 
      id="asset-lifecycle" 
      ref={containerRef}
      className="py-32 bg-[#FAFBFD] text-slate-900 relative overflow-hidden"
    >
      {/* Decorative gradient light */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-sky-200/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-200/10 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-28 reveal-el reveal">
          <h2 className="text-[11px] font-bold text-indigo-600 uppercase tracking-[0.2em] mb-4">
            Structured Operations
          </h2>
          <h3 className="text-4xl sm:text-5xl font-extrabold mt-3 tracking-tight text-slate-900 leading-[1.15]">
            One asset, one{" "}
            <span className="font-serif italic text-indigo-600 font-semibold">clear story</span>.
          </h3>
          <p className="text-lg md:text-xl font-light text-slate-600 mt-8 leading-relaxed">
            From the moment it's registered to the day it's retired, every asset carries its full history with it.
          </p>
        </div>

        {/* Timeline Flow */}
        <div className="relative mt-12 px-4 reveal-el reveal-scale">
          {/* Desktop connecting line with a modern multi-stop gradient */}
          <div className="hidden lg:block absolute top-[56px] left-[8%] right-[8%] h-[3px] bg-gradient-to-r from-indigo-100 via-sky-300 to-indigo-100 z-0" />

          {/* Steps Container */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-6">
            {steps.map((step, idx) => (
              <div 
                key={idx}
                className="flex flex-col items-center text-center group"
              >
                {/* Number Circle Node */}
                <div className="w-28 h-28 rounded-full bg-white border-2 border-indigo-100/60 flex items-center justify-center shadow-lg shadow-indigo-100/30 group-hover:border-indigo-300 group-hover:shadow-indigo-200/50 transition-all duration-350 relative shrink-0">
                  <div className="w-16 h-16 rounded-full bg-indigo-50/70 flex items-center justify-center text-indigo-600 text-2xl font-black group-hover:bg-indigo-600 group-hover:text-white transition-all duration-350 shadow-inner">
                    {step.number}
                  </div>
                  
                  {/* Subtle link arrow indicator on desktop */}
                  {idx < steps.length - 1 && (
                    <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 text-sky-300 group-hover:text-indigo-500 transition-colors z-20">
                      <svg className="w-6 h-6 transform translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* State Label */}
                <h4 className="text-xl font-extrabold text-slate-900 mt-8 mb-3 tracking-tight group-hover:text-indigo-600 transition-colors">
                  {step.state}
                </h4>

                {/* Description */}
                <p className="text-slate-500 text-sm px-2 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
