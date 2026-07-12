import { useEffect, useRef } from 'react';

/**
 * Testimonials Section Component - Redesigned
 * 
 * Spacing: Generous padding (py-32)
 * Color: Very soft off-white background (#FAFBFD) to transition naturally.
 * Cards: Translucent white glassmorphism with delicate borders, rich drop shadows, 
 *        watermark quote decorations, and lift-on-hover micro-animations.
 * Animations: Staggered scroll-reveal entrance.
 */
export default function Testimonials() {
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

  const reviews = [
    {
      quote: "We stopped losing laptops to 'who has this' spreadsheet threads within the first week.",
      author: "David Vance",
      role: "Operations Lead",
      company: "ApexLogistics"
    },
    {
      quote: "The booking overlap rule alone paid for the rollout — no more double-booked conference rooms.",
      author: "Sarah Jenkins",
      role: "Facilities Manager",
      company: "CareNet Health"
    },
    {
      quote: "Audit cycles used to take us days. Now auditors just walk through a list and mark it done.",
      author: "Marcus Aurelius",
      role: "Asset Manager",
      company: "Vanguard Mfg."
    }
  ];

  return (
    <section 
      id="testimonials" 
      ref={containerRef}
      className="py-32 bg-[#FAFBFD] text-slate-900 relative overflow-hidden"
    >
      {/* Decorative background light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-100/10 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-24 reveal-el reveal">
          <h2 className="text-[11px] font-bold text-indigo-600 uppercase tracking-[0.2em] mb-4">
            Customer Success
          </h2>
          <h3 className="text-4xl sm:text-5xl font-extrabold mt-3 tracking-tight text-slate-900 leading-[1.15]">
            Built for teams{" "}
            <span className="font-serif italic text-indigo-600 font-semibold">tired of spreadsheets</span>.
          </h3>
          <p className="text-lg md:text-xl font-light text-slate-600 mt-8 leading-relaxed">
            Here's how operations and facilities managers are streamlining resource lifecycles with AssetFlow.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <div 
              key={idx}
              style={{ transitionDelay: `${idx * 100}ms` }}
              className="reveal-el reveal-scale bg-white/75 backdrop-blur-md rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-indigo-500/[0.06] flex flex-col justify-between hover:shadow-2xl hover:shadow-indigo-100/60 hover:-translate-y-1.5 hover:border-indigo-200/40 transition-all duration-300 relative overflow-hidden min-h-[260px] group"
            >
              {/* Quote Mark Decoration with refined color */}
              <div className="absolute -top-3 -right-2 text-indigo-100/30 select-none pointer-events-none transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                <svg className="w-28 h-28" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>

              {/* Quote Body */}
              <p className="text-slate-700 italic text-base leading-relaxed mb-10 relative z-10">
                "{rev.quote}"
              </p>

              {/* Author Footer */}
              <div className="flex items-center gap-4 relative z-10">
                {/* Visual Avatar with beautiful gradient */}
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white font-extrabold text-sm shadow-md shrink-0">
                  {rev.author[0]}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-none">{rev.author}</h4>
                  <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">
                    {rev.role}, <span className="text-indigo-600 font-extrabold">{rev.company}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
