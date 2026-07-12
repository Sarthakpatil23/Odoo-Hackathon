import { useEffect, useRef } from 'react';

/**
 * Final Call-to-Action Section Component - Redesigned
 * 
 * Spacing: Generous padding (py-32)
 * Color: Clean white section background (#FFFFFF) with multiple layered ambient radial highlights.
 * Button: Impeccable UI premium styling with a subtle gradient, glow shadow, 
 *         adjacent companion button, and hover lift/scale animations.
 * Animations: Scroll-reveal using IntersectionObserver.
 */
export default function FinalCTA({ onCtaClick = () => {} }) {
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
      ref={containerRef}
      className="py-32 bg-white text-slate-900 relative overflow-hidden"
    >
      {/* Dynamic ambient radial highlights to ensure depth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-indigo-100/25 blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-sky-100/15 blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-indigo-50/20 blur-[100px] pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        
        {/* Headline */}
        <h3 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15] reveal-el reveal">
          Ready to{" "}
          <span className="font-serif italic text-indigo-600 font-semibold">bring order</span> to your asset operations?
        </h3>
        
        {/* Subheading */}
        <p className="text-lg md:text-xl font-light text-slate-500 mt-8 leading-relaxed max-w-2xl mx-auto reveal-el reveal">
          Set up your organization in minutes and get full visibility from day one.
        </p>

        {/* CTA Buttons - Premium Double Button Standard Grouping */}
        <div className="flex items-center justify-center gap-3 mt-12 reveal-el reveal-scale">
          <button
            id="final-cta-btn"
            onClick={onCtaClick}
            className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-[15px] px-8 py-3.5 rounded-full shadow-lg shadow-indigo-600/35 transform hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-300 border border-indigo-500/20 flex items-center justify-center h-[52px]"
          >
            Go to Dashboard
          </button>
          
          <button
            id="final-cta-arrow-btn"
            onClick={onCtaClick}
            className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/35 transform hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-300 border border-indigo-500/20"
            aria-label="Go to Dashboard"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </button>
        </div>

      </div>
    </section>
  );
}
