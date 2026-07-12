/**
 * Final Call-to-Action Section Component
 * 
 * Invites users to start using the system, repeating the premium CTA button pattern.
 */
export default function FinalCTA({ onCtaClick = () => {} }) {
  return (
    <section className="py-24 bg-white text-slate-900 relative overflow-hidden">
      
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-50/40 blur-3xl pointer-events-none select-none z-0" />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        
        {/* Headline */}
        <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Ready to{" "}
          <span className="font-serif italic text-indigo-600 font-medium">bring order</span> to your asset operations?
        </h3>
        
        {/* Subheading */}
        <p className="text-lg md:text-xl font-light text-slate-500 mt-6 leading-relaxed max-w-2xl mx-auto">
          Set up your organization in minutes and get full visibility from day one.
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center justify-center gap-3 mt-10">
          <button
            id="final-cta-btn"
            onClick={onCtaClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[15px] px-8 py-4 rounded-full shadow-lg shadow-indigo-600/30 transform hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-300 border border-indigo-500/25 flex items-center justify-center h-[52px]"
          >
            Go to Dashboard
          </button>
          
          <button
            id="final-cta-arrow-btn"
            onClick={onCtaClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30 transform hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-300 border border-indigo-500/25"
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
