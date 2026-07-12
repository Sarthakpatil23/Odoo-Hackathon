/**
 * Stats Band Component
 * 
 * Renders a full-width deep navy band with 4 key capability statements
 * (instead of fake metrics) to present the product's value honestly and cleanly.
 */
export default function StatsBand() {
  const stats = [
    {
      title: "7 Core Modules",
      desc: "Departments, categories, assets, allocations, bookings, maintenance & audits.",
      icon: (
        <svg className="w-6 h-6 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      title: "Zero Double-Allocations",
      desc: "Conflict engine automatically locks already-held assets and offers transfers.",
      icon: (
        <svg className="w-6 h-6 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      )
    },
    {
      title: "Full Audit Trail",
      desc: "Complete chronological logs for every single action and state change.",
      icon: (
        <svg className="w-6 h-6 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: "Role-Based Access",
      desc: "Admin, Manager, Dept Head, and Employee scopes set by design.",
      icon: (
        <svg className="w-6 h-6 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      )
    }
  ];

  return (
    <section className="py-20 bg-slate-900 text-white border-t border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {stats.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center max-w-xs mx-auto group">
              {/* Stat Icon */}
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-5 border border-slate-700/60 shadow-inner group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
              
              {/* Stat Title */}
              <h4 className="text-xl font-bold text-slate-100 tracking-tight mb-2">
                {item.title}
              </h4>
              
              {/* Stat Description */}
              <p className="text-slate-400 text-xs leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
