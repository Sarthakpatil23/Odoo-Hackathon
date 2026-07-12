/**
 * Testimonials Section Component
 * 
 * Renders three testimonials from plausible customers.
 * NOTE: These quotes are placeholders (as requested) and should
 * be replaced with actual customer quotes before production launch.
 */
export default function Testimonials() {
  const reviews = [
    {
      // PLACEHOLDER: Operations Lead Testimonial
      quote: "We stopped losing laptops to 'who has this' spreadsheet threads within the first week.",
      author: "David Vance",
      role: "Operations Lead",
      company: "ApexLogistics"
    },
    {
      // PLACEHOLDER: Facilities Manager Testimonial
      quote: "The booking overlap rule alone paid for the rollout — no more double-booked conference rooms.",
      author: "Sarah Jenkins",
      role: "Facilities Manager",
      company: "CareNet Health"
    },
    {
      // PLACEHOLDER: Asset Manager Testimonial
      quote: "Audit cycles used to take us days. Now auditors just walk through a list and mark it done.",
      author: "Marcus Aurelius",
      role: "Asset Manager",
      company: "Vanguard Mfg."
    }
  ];

  return (
    <section id="testimonials" className="py-24 bg-sky-50/80 text-slate-900">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest">
            Customer Success
          </h2>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mt-3 tracking-tight text-slate-900 leading-tight">
            Built for teams{" "}
            <span className="font-serif italic text-indigo-600 font-medium">tired of spreadsheets</span>.
          </h3>
          <p className="text-lg md:text-xl font-light text-slate-500 mt-6 leading-relaxed">
            Here's how operations and facilities managers are streamlining resource lifecycles with AssetFlow.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col justify-between hover:shadow-2xl hover:shadow-slate-200/60 transform hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden"
            >
              {/* Quote Mark Decoration */}
              <div className="absolute -top-4 -right-2 text-indigo-50/70 select-none pointer-events-none">
                <svg className="w-28 h-28 transform rotate-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>

              {/* Quote Body */}
              <p className="text-slate-700 italic text-[15px] sm:text-base leading-relaxed mb-8 relative z-10">
                "{rev.quote}"
              </p>

              {/* Author Footer */}
              <div className="flex items-center gap-3 relative z-10">
                {/* Visual Avatar Placeholder */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {rev.author[0]}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-none">{rev.author}</h4>
                  <p className="text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                    {rev.role}, <span className="text-indigo-600 font-bold">{rev.company}</span>
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
