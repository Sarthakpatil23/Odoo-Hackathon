/**
 * Maintenance Section Component
 * 
 * Shows the maintenance workflow as a step flow, using the same
 * style as the Asset Lifecycle component to maintain consistency.
 */
export default function Maintenance() {
  const steps = [
    {
      number: "1",
      state: "Pending",
      desc: "Ticket raised by employee with description & priority"
    },
    {
      number: "2",
      state: "Approved",
      desc: "Asset Manager approves, asset status updates to Under Maintenance"
    },
    {
      number: "3",
      state: "Technician Assigned",
      desc: "Internal technician or vendor assigned to the ticket"
    },
    {
      number: "4",
      state: "In Progress",
      desc: "Repair works underway, parts and labor recorded"
    },
    {
      number: "5",
      state: "Resolved",
      desc: "Work completed, asset status reverts to Available automatically"
    }
  ];

  return (
    <section id="maintenance" className="py-24 bg-sky-50/40 text-slate-900">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest">
            Structured Workflows
          </h2>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mt-3 tracking-tight text-slate-900 leading-tight">
            Nothing goes into the shop without a{" "}
            <span className="font-serif italic text-indigo-600 font-medium">paper trail</span>.
          </h3>
          <p className="text-lg md:text-xl font-light text-slate-500 mt-6 leading-relaxed">
            Every repair request is raised, approved, tracked, and resolved — so maintenance history is never a mystery.
          </p>
        </div>

        {/* Timeline Flow */}
        <div className="relative">
          {/* Desktop connecting line */}
          <div className="hidden lg:block absolute top-[52px] left-[7%] right-[7%] h-0.5 bg-indigo-100 z-0" />

          {/* Steps Container */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-4">
            {steps.map((step, idx) => (
              <div 
                key={idx}
                className="flex flex-col items-center text-center group"
              >
                {/* Number Circle */}
                <div className="w-[104px] h-[104px] rounded-full bg-white border-4 border-sky-100/50 flex items-center justify-center shadow-md group-hover:border-indigo-500/30 group-hover:shadow-lg transition-all duration-300 relative">
                  <div className="w-16 h-16 rounded-full bg-indigo-600/5 flex items-center justify-center text-indigo-600 text-2xl font-black group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                    {step.number}
                  </div>
                  {/* Subtle link arrow indicator on desktop */}
                  {idx < steps.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-indigo-200 group-hover:text-indigo-400 transition-colors">
                      <svg className="w-5 h-5 transform translate-x-1" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* State Label */}
                <h4 className="text-lg font-bold text-slate-900 mt-6 mb-2 tracking-tight group-hover:text-indigo-600 transition-colors">
                  {step.state}
                </h4>

                {/* Description */}
                <p className="text-slate-500 text-xs px-2 leading-relaxed">
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
