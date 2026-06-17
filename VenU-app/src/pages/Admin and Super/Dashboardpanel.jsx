/* ============================================================
       DashboardPanel.jsx
       Shows platform KPIs, activity counters, and a quick-view
       list of events pending approval.
       ============================================================ */

    function DashboardPanel() {
      return (
        <div className="animate-fade-in">

          {/* ── Page heading ── */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Dashboard Overview
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Monitor platform activity and manage pending requests.
            </p>
          </div>

          {/* ── Two-column layout: stats left, pending list right ── */}
          {/* Bootstrap grid for the outer split; Tailwind for spacing/colour */}
          <div className="row g-4">

            {/* Left column — stat cards + activity mini-stats */}
            <div className="col-12 col-xl-8 d-flex flex-column gap-4">

              {/* Stat cards row */}
              <div className="row g-3">
                {STAT_CARDS.map((card, i) => {
                  const Icon = ICON_MAP[card.iconName];
                  return (
                    <div key={i} className="col-12 col-md-4">
                      <div className="stat-card bg-white border border-slate-100 rounded-2xl p-4 shadow-sm overflow-hidden position-relative">

                        {/* Coloured top accent bar */}
                        <div className={`position-absolute top-0 start-0 end-0 bg-gradient-to-r ${card.gradient}`}
                          style={{ height: 4, opacity: 0.85 }} />

                        {/* Icon + change badge */}
                        <div className="d-flex align-items-start justify-content-between mb-3 mt-1">
                          <div className={`p-2 rounded-3 ${card.bgLight} border border-slate-100`}>
                            <Icon size={20} className={card.textColor} />
                          </div>
                          <span className={`text-xs fw-bold px-2 py-1 rounded-pill
                            ${card.positive
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-red-50    text-red-600'}`}>
                            {card.change}
                          </span>
                        </div>

                        <h3 className="text-2xl font-black text-slate-900 mb-1">{card.value}</h3>
                        <p  className="text-sm font-medium text-slate-500 mb-0">{card.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Platform activity mini-stats */}
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                <h2 className="text-xs font-bold text-slate-800 text-uppercase tracking-wider mb-4
                  d-flex align-items-center gap-2">
                  <TrendingUp size={16} className="text-purple-500" />
                  Platform Activity
                </h2>

                <div className="row g-3">
                  {ACTIVITY_STATS.map((stat, i) => (
                    <div key={i} className="col-6 col-md-3">
                      <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className={`text-2xl font-black mb-1 ${stat.color}`}>{stat.value}</p>
                        <p  className="text-xs font-medium text-slate-500 mb-0">{stat.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column — pending approvals quick-list */}
            <div className="col-12 col-xl-4">
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden h-100">

                {/* Card header */}
                <div className="p-4 border-bottom border-slate-100 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <Clock size={16} className="text-amber-600" />
                    </div>
                    <h2 className="text-xs font-bold text-slate-800 text-uppercase tracking-wider mb-0">
                      Pending Approvals
                    </h2>
                  </div>
                  <span className="text-xs fw-bold px-2 py-1 rounded-pill bg-amber-50 text-amber-600
                    border border-amber-100">
                    {PENDING_APPROVALS_PREVIEW.length}
                  </span>
                </div>

                {/* Approval items */}
                <div className="scrollbar-thin" style={{ maxHeight: 340, overflowY: 'auto' }}>
                  {PENDING_APPROVALS_PREVIEW.map(item => (
                    <div key={item.id}
                      className="p-4 border-bottom border-slate-50 cursor-pointer
                        hover:bg-purple-50 transition-colors" style={{ cursor: 'pointer' }}>
                      <div className="d-flex align-items-start justify-content-between">
                        <div className="flex-grow-1 overflow-hidden me-2">
                          <h4 className="text-sm font-bold text-slate-800 mb-1 text-truncate">
                            {item.eventName}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium mb-0">{item.organizer}</p>
                          <p className="text-xs text-slate-400 mb-0">{item.date}</p>
                        </div>
                        <div className="d-flex align-items-center gap-2 flex-shrink-0">
                          <span className="text-uppercase fw-bold rounded-pill px-2 py-1
                            bg-amber-100 text-amber-700" style={{ fontSize: 10 }}>
                            Pending
                          </span>
                          <ChevronRight size={14} className="text-slate-300" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer link */}
                <div className="p-3 border-top border-slate-100 bg-slate-50">
                  <button className="w-100 btn btn-sm text-purple-600 fw-bold
                    hover:bg-purple-50 transition-colors rounded-lg">
                    View All Approvals →
                  </button>
                </div>
              </div>
            </div>

          </div>{/* /row */}
        </div>
      );
    }
