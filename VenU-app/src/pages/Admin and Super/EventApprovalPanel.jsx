/* ============================================================
       EventApprovalsPanel.jsx
       Admins review submitted events and approve or reject them.
       Processed events move to a session-log table below.
       ============================================================ */

    function EventApprovalsPanel() {
      const [pending,   setPending]   = React.useState(INITIAL_PENDING_EVENTS);
      const [processed, setProcessed] = React.useState([]);

      /* Move an event from pending → processed with a decision stamp */
      const decide = (ev, decision) => {
        setPending(prev  => prev.filter(e => e.id !== ev.id));
        setProcessed(prev => [
          ...prev,
          { ...ev, decision, decidedAt: new Date().toLocaleTimeString() },
        ]);
      };

      return (
        <div className="animate-fade-in">

          {/* ── Page heading ── */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Event Approvals</h1>
            <p  className="text-sm text-slate-500 mt-1">
              Review and approve or reject submitted events from organizers.
            </p>
          </div>

          {/* ═══ Pending events table ═══ */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden mb-5">

            {/* Table header bar */}
            <div className="p-4 border-bottom border-slate-100 d-flex
              align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-xl border border-amber-100">
                  <Clock size={18} className="text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-800 text-uppercase tracking-wider mb-0">
                    Pending Events
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mb-0">
                    {pending.length} event{pending.length !== 1 ? 's' : ''} awaiting review
                  </p>
                </div>
              </div>
              <span className="fw-bold rounded-pill px-3 py-1 bg-amber-50
                text-amber-600 border border-amber-100" style={{ fontSize: 12 }}>
                {pending.length} Pending
              </span>
            </div>

            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-slate-50 border-bottom border-slate-100">
                  <tr>
                    {['Event Name', 'Organizer', 'Category', 'Date', 'Actions'].map((h, i) => (
                      <th key={h}
                        className={`px-4 py-3 fw-bold text-slate-500 text-uppercase
                          ${i === 4 ? 'text-end' : 'text-start'}`}
                        style={{ fontSize: 11, letterSpacing: '0.05em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {pending.map(ev => (
                    <tr key={ev.id}>

                      {/* Event name + icon */}
                      <td className="px-4 py-3 align-middle">
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-3 bg-gradient-to-br from-purple-100
                            to-indigo-100 d-flex align-items-center justify-content-center
                            flex-shrink-0" style={{ width: 36, height: 36 }}>
                            <CalendarCheck size={16} className="text-purple-600" />
                          </div>
                          <span className="text-sm fw-semibold text-slate-800">{ev.eventName}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 align-middle text-sm text-slate-600 fw-medium">
                        {ev.organizer}
                      </td>

                      {/* Category badge */}
                      <td className="px-4 py-3 align-middle">
                        <span className="fw-bold rounded-pill px-2 py-1 bg-slate-100
                          text-slate-600 text-uppercase" style={{ fontSize: 11 }}>
                          {ev.category}
                        </span>
                      </td>

                      <td className="px-4 py-3 align-middle text-sm text-slate-500 fw-medium">
                        {ev.date}
                      </td>

                      {/* Approve / Reject buttons */}
                      <td className="px-4 py-3 align-middle text-end">
                        <div className="d-flex align-items-center justify-content-end gap-2">
                          <button onClick={() => decide(ev, 'Approved')}
                            className="btn btn-sm d-inline-flex align-items-center gap-1
                              text-emerald-600 bg-emerald-50 border border-emerald-100
                              hover:bg-emerald-100 rounded-lg fw-bold" style={{ fontSize: 12 }}>
                            <CheckCircle2 size={13} /> Approve
                          </button>
                          <button onClick={() => decide(ev, 'Rejected')}
                            className="btn btn-sm d-inline-flex align-items-center gap-1
                              text-red-600 bg-red-50 border border-red-100
                              hover:bg-red-100 rounded-lg fw-bold" style={{ fontSize: 12 }}>
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* All-clear empty state */}
                  {pending.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-5 text-center">
                        <div className="d-flex flex-column align-items-center gap-2">
                          <div className="p-3 bg-emerald-50 rounded-circle">
                            <CheckCircle2 size={24} className="text-emerald-500" />
                          </div>
                          <p className="text-sm fw-semibold text-slate-700 mb-0">All caught up!</p>
                          <p className="text-xs text-slate-400 mb-0">No pending events to review.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ═══ Processed events log (only rendered after first action) ═══ */}
          {processed.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">

              <div className="p-4 border-bottom border-slate-100 d-flex align-items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-xl">
                  <Filter size={18} className="text-slate-500" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-800 text-uppercase tracking-wider mb-0">
                    Processed Events
                  </h2>
                  <p className="text-xs text-slate-500 fw-medium mb-0">
                    {processed.length} event{processed.length !== 1 ? 's' : ''} processed this session
                  </p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-slate-50 border-bottom border-slate-100">
                    <tr>
                      {['Event Name', 'Organizer', 'Date', 'Decision', 'Time'].map(h => (
                        <th key={h} className="px-4 py-3 text-start fw-bold text-slate-500 text-uppercase"
                          style={{ fontSize: 11, letterSpacing: '0.05em' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {processed.map(ev => (
                      <tr key={ev.id}>
                        <td className="px-4 py-3 align-middle text-sm fw-semibold text-slate-700">
                          {ev.eventName}
                        </td>
                        <td className="px-4 py-3 align-middle text-sm text-slate-500 fw-medium">
                          {ev.organizer}
                        </td>
                        <td className="px-4 py-3 align-middle text-sm text-slate-500 fw-medium">
                          {ev.date}
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <span className={`d-inline-flex align-items-center gap-1 fw-bold
                            rounded-pill px-2 py-1 text-uppercase
                            ${ev.decision === 'Approved'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : 'bg-red-50     text-red-500     border border-red-100'}`}
                            style={{ fontSize: 11 }}>
                            {ev.decision === 'Approved'
                              ? <CheckCircle2 size={12} />
                              : <XCircle      size={12} />}
                            {ev.decision}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-middle text-xs text-slate-400 fw-medium">
                          {ev.decidedAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      );
    }