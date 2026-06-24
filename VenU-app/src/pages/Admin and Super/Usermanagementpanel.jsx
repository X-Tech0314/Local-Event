/* ============================================================
       UserManagementPanel.jsx
       Lists all registered users. Admins can suspend or reactivate
       any account via the toggle button in the Action column.
       ============================================================ */

    function UserManagementPanel() {
      const [users,  setUsers]  = React.useState(INITIAL_USERS);
      const [search, setSearch] = React.useState('');

      /* Toggle a user's Active ↔ Suspended status */
      const toggleStatus = (id) => {
        setUsers(prev =>
          prev.map(u =>
            u.id === id
              ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' }
              : u
          )
        );
      };

      /* Client-side search: matches name, role, or status */
      const filtered = users.filter(u =>
        [u.name, u.role, u.status].some(field =>
          field.toLowerCase().includes(search.toLowerCase())
        )
      );

      /* ── Shared class strings ── */
      const roleBadge = (role) =>
        role === 'Organizer'
          ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
          : 'bg-slate-100  text-slate-600  border border-slate-200';

      const statusBadge = (status) =>
        status === 'Active'
          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
          : 'bg-red-50     text-red-500     border border-red-100';

      return (
        <div className="animate-fade-in">

          {/* ── Page heading ── */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
            <p  className="text-sm text-slate-500 mt-1">View and manage registered platform users.</p>
          </div>

          {/* ── Main card ── */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">

            {/* Card toolbar: title + search */}
            <div className="p-4 border-bottom border-slate-100 d-flex flex-column flex-sm-row
              align-items-start align-items-sm-center justify-content-between gap-3">

              <div className="d-flex align-items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-xl border border-purple-100">
                  <Users size={18} className="text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-800 text-uppercase tracking-wider mb-0">
                    All Users
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mb-0">
                    {filtered.length} user{filtered.length !== 1 ? 's' : ''} found
                  </p>
                </div>
              </div>

              {/* Search input */}
              <div className="position-relative" style={{ width: '100%', maxWidth: 288 }}>
                <span className="position-absolute top-50 translate-middle-y ms-3">
                  <Search size={15} className="text-slate-400" />
                </span>
                <input
                  type="text"
                  placeholder="Search by name, role, or status…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="form-control form-control-sm ps-5 bg-slate-50 border-slate-200
                    rounded-xl text-sm text-slate-900"
                />
              </div>
            </div>

            {/* ── Responsive table ── */}
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-slate-50 border-bottom border-slate-100">
                  <tr>
                    {['Name', 'Email', 'Role', 'Status', 'Action'].map((h, i) => (
                      <th key={h}
                        className={`px-4 py-3 text-slate-500 fw-bold text-uppercase
                          ${i === 4 ? 'text-end' : 'text-start'}`}
                        style={{ fontSize: 11, letterSpacing: '0.05em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filtered.map(user => (
                    <tr key={user.id}>

                      {/* Name + avatar */}
                      <td className="px-4 py-3 align-middle">
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-circle bg-gradient-to-br from-purple-500
                            to-indigo-600 d-flex align-items-center justify-content-center
                            text-white fw-bold flex-shrink-0"
                            style={{ width: 36, height: 36, fontSize: 13 }}>
                            {user.name.charAt(0)}
                          </div>
                          <span className="text-sm fw-semibold text-slate-800">{user.name}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 align-middle text-sm text-slate-500 fw-medium">
                        {user.email}
                      </td>

                      {/* Role badge */}
                      <td className="px-4 py-3 align-middle">
                        <span className={`text-uppercase fw-bold rounded-pill px-2 py-1
                          ${roleBadge(user.role)}`} style={{ fontSize: 11 }}>
                          {user.role}
                        </span>
                      </td>

                      {/* Status badge with dot */}
                      <td className="px-4 py-3 align-middle">
                        <span className={`d-inline-flex align-items-center gap-1 fw-bold
                          rounded-pill px-2 py-1 text-uppercase ${statusBadge(user.status)}`}
                          style={{ fontSize: 11 }}>
                          <span className={`rounded-circle d-inline-block
                            ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}
                            style={{ width: 6, height: 6 }} />
                          {user.status}
                        </span>
                      </td>

                      {/* Toggle action button */}
                      <td className="px-4 py-3 align-middle text-end">
                        {user.status === 'Active' ? (
                          <button onClick={() => toggleStatus(user.id)}
                            className="btn btn-sm d-inline-flex align-items-center gap-1
                              text-red-600 bg-red-50 border border-red-100
                              hover:bg-red-100 rounded-lg fw-bold" style={{ fontSize: 12 }}>
                            <ShieldOff size={13} /> Suspend
                          </button>
                        ) : (
                          <button onClick={() => toggleStatus(user.id)}
                            className="btn btn-sm d-inline-flex align-items-center gap-1
                              text-emerald-600 bg-emerald-50 border border-emerald-100
                              hover:bg-emerald-100 rounded-lg fw-bold" style={{ fontSize: 12 }}>
                            <ShieldCheck size={13} /> Activate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {/* Empty state */}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-5 text-center text-sm
                        text-slate-400 fw-medium">
                        No users found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }