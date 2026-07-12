/**
 * Features Section Component
 * 
 * Features a 3-column layout on desktop, showing the 6 core capabilities
 * of the AssetFlow platform with modern custom SVG icons.
 */
export default function Features() {
  const featuresList = [
    {
      title: "Full Asset Lifecycle",
      desc: "Track every asset from Available to Retired, with a complete allocation and maintenance history for each one.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      ),
      color: "text-indigo-600 bg-indigo-50 border-indigo-100"
    },
    {
      title: "Conflict-Free Allocation",
      desc: "Instantly see who holds an asset and request a transfer instead of a hard block — no more chasing spreadsheets to find out who has the laptop.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L17.5 12M21 7.5H7.5" />
        </svg>
      ),
      color: "text-sky-600 bg-sky-50 border-sky-100"
    },
    {
      title: "Resource Booking Without Overlaps",
      desc: "Book rooms, vehicles, and shared equipment by time slot, with automatic overlap detection so double-bookings never happen.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
      color: "text-violet-600 bg-violet-50 border-violet-100"
    },
    {
      title: "Approval-Gated Maintenance",
      desc: "Repairs are routed through approval before work begins, so nothing goes into the shop — or comes out of it — without a clear record.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A1.79 1.79 0 0020 18.25l-5.83-5.83m-2.75 2.75a2.25 2.25 0 01-3.18-3.18l8.6-8.6a6 6 0 00-8.49 8.49l-1.97 1.97m10.97-10.97l-1.97 1.97m-2.75 2.75l-3.47 3.47M20 4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      ),
      color: "text-emerald-600 bg-emerald-50 border-emerald-100"
    },
    {
      title: "Structured Audit Cycles",
      desc: "Run scheduled verification cycles with assigned auditors and auto-generated discrepancy reports, closing the loop on lost or damaged assets.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "text-amber-600 bg-amber-50 border-amber-100"
    },
    {
      title: "Real-Time Operational Dashboard",
      desc: "KPIs for availability, active bookings, pending transfers, and overdue returns — updated live, role-aware for every user.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
        </svg>
      ),
      color: "text-rose-600 bg-rose-50 border-rose-100"
    }
  ];

  return (
    <section id="features" className="py-24 bg-white text-slate-900">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest">
            Platform Capabilities
          </h2>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mt-3 tracking-tight text-slate-900 leading-tight">
            Everything your operations team needs,{" "}
            <span className="font-serif italic text-indigo-600 font-medium">in one place</span>.
          </h3>
          <p className="text-lg md:text-xl font-light text-slate-500 mt-6 leading-relaxed">
            AssetFlow replaces spreadsheets and paper logs with a single source of truth for every asset and resource you manage.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresList.map((item, idx) => (
            <div 
              key={idx}
              className="bg-slate-50/50 border border-slate-100 rounded-3xl p-8 hover:bg-white hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100/50 transform hover:-translate-y-1 transition-all duration-300 flex flex-col items-start"
            >
              {/* Icon Container */}
              <div className={`p-3.5 rounded-2xl border ${item.color} mb-6 shadow-sm`}>
                {item.icon}
              </div>
              
              {/* Title */}
              <h4 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">
                {item.title}
              </h4>
              
              {/* Description */}
              <p className="text-slate-500 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
