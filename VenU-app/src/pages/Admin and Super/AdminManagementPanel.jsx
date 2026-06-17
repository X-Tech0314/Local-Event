/* ============================================================
       AdminManagementPanel.jsx — Superadmin exclusive
       Create new admin accounts and delete existing ones.
       Uses Bootstrap's modal component for the delete confirmation.
       ============================================================ */

    function AdminManagementPanel() {
      const [admins,          setAdmins]          = React.useState(INITIAL_ADMINS);
      const [form,            setForm]            = React.useState({ name: '', email: '', password: '' });
      const [errors,          setErrors]          = React.useState({});
      const [pendingDelete,   setPendingDelete]   = React.useState(null);  // admin staged for deletion
      const [successMessage,  setSuccessMessage]  = React.useState('');

      /* ── Validation ── */
      const validate = () => {
        const e = {};

        if (!form.name.trim())
          e.name = 'Name is required.';

        if (!form.email.trim())
          e.email = 'Email is required.';
        else if (!/\S+@\S+\.\S+/.test(form.email))
          e.email = 'Please enter a valid email address.';
        else if (admins.some(a => a.email.toLowerCase() === form.email.toLowerCase()))
          e.email = 'An admin with this email already exists.';

        if (!form.password.trim())
          e.password = 'Temporary password is required.';
        else if (form.password.length < 8)
          e.password = 'Password must be at least 8 characters.';

        setErrors(e);
        return Object.keys(e).length === 0;
      };

      /* ── Create new admin ── */
      const handleCreate = (e) => {
        e.preventDefault();
        if (!validate()) return;

        const newAdmin = {
          id:        Date.now(),
          name:      form.name.trim(),
          email:     form.email.trim(),
          createdAt: new Date().toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          }),
        };

        setAdmins(prev => [...prev, newAdmin]);
        setForm({ name: '', email: '', password: '' });
        setErrors({});
        showSuccess(`Admin "${newAdmin.name}" created successfully!`);
      };

      /* ── Delete admin (called after modal confirmation) ── */
      const handleDelete = () => {
        if (!pendingDelete) return;
        setAdmins(prev => prev.filter(a => a.id !== pendingDelete.id));
        showSuccess(`Admin "${pendingDelete.name}" has been removed.`);
        setPendingDelete(null);
      };

      /* ── Auto-dismiss success toast ── */
      const showSuccess = (msg) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(''), 4000);
      };

      /* ── Reusable class strings for the form ── */
      const inputClass  = (field) =>
        `form-control bg-slate-50 border-slate-200 rounded-xl text-sm
         ${errors[field] ? 'is-invalid border-red-300' : ''}`;
      const labelClass  = 'form-label text-xs fw-bold text-slate-600 text-uppercase tracking-wider';

      return (
        <div className="animate-fade-in">

          {/* ── Page heading ── */}
          <div className="mb-8">
            <div className="d-flex align-items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-0">
                Admin Management
              </h1>
              <span style={{ fontSize: 22 }}>👑</span>
            </div>
            <p className="text-sm text-slate-500">
              Manage administrators who run the platform. Superadmin exclusive.
            </p>
          </div>

          {/* ── Success toast ── */}
          {successMessage && (
            <div className="mb-4 d-flex align-items-center gap-3 p-3
              bg-emerald-50 border border-emerald-200 rounded-xl animate-fade-in">
              <div className="p-1 bg-emerald-100 rounded-lg">
                <Shield size={16} className="text-emerald-600" />
              </div>
              <span className="text-sm fw-semibold text-emerald-700 flex-grow-1">
                {successMessage}
              </span>
              <button onClick={() => setSuccessMessage('')}
                className="btn btn-sm p-0 text-emerald-400 border-0 bg-transparent">
                <X size={16} />
              </button>
            </div>
          )}

          {/* ── Two-column layout: form left, table right ── */}
          <div className="row g-4">

            {/* Create form */}
            <div className="col-12 col-xl-4">
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4">

                {/* Form header */}
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-50 rounded-xl border border-purple-100">
                    <UserPlus size={18} className="text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-800 text-uppercase tracking-wider mb-0">
                      Create New Admin
                    </h2>
                    <p className="text-xs text-slate-500 fw-medium mb-0">
                      Add a new administrator account
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCreate} noValidate>

                  {/* Full Name */}
                  <div className="mb-3">
                    <label className={labelClass}>Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Admin Delta"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className={inputClass('name')}
                    />
                    {errors.name && (
                      <div className="invalid-feedback d-block text-xs text-red-500 mt-1">
                        {errors.name}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label className={labelClass}>Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. delta@venu.ph"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className={inputClass('email')}
                    />
                    {errors.email && (
                      <div className="invalid-feedback d-block text-xs text-red-500 mt-1">
                        {errors.email}
                      </div>
                    )}
                  </div>

                  {/* Temporary password */}
                  <div className="mb-4">
                    <label className={labelClass}>Temporary Password</label>
                    <input
                      type="password"
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      className={inputClass('password')}
                    />
                    {errors.password && (
                      <div className="invalid-feedback d-block text-xs text-red-500 mt-1">
                        {errors.password}
                      </div>
                    )}
                  </div>

                  <button type="submit"
                    className="btn w-100 d-flex align-items-center justify-content-center
                      gap-2 fw-bold text-white rounded-xl py-3"
                    style={{ background: 'var(--color-brand)', fontSize: 14 }}>
                    <UserPlus size={16} /> Create Admin
                  </button>
                </form>
              </div>
            </div>

            {/* Admins table */}
            <div className="col-12 col-xl-8">
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">

                {/* Table header bar */}
                <div className="p-4 border-bottom border-slate-100 d-flex align-items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-100">
                    <Crown size={18} className="text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-800 text-uppercase tracking-wider mb-0">
                      Existing Admins
                    </h2>
                    <p className="text-xs text-slate-500 fw-medium mb-0">
                      {admins.length} administrator{admins.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="bg-slate-50 border-bottom border-slate-100">
                      <tr>
                        {['Name', 'Email', 'Created', 'Action'].map((h, i) => (
                          <th key={h}
                            className={`px-4 py-3 fw-bold text-slate-500 text-uppercase
                              ${i === 3 ? 'text-end' : 'text-start'}`}
                            style={{ fontSize: 11, letterSpacing: '0.05em' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {admins.map(admin => (
                        <tr key={admin.id}>

                          {/* Name + avatar */}
                          <td className="px-4 py-3 align-middle">
                            <div className="d-flex align-items-center gap-2">
                              <div className="rounded-circle bg-gradient-to-br from-indigo-500
                                to-purple-600 d-flex align-items-center justify-content-center
                                text-white fw-bold flex-shrink-0"
                                style={{ width: 36, height: 36, fontSize: 13 }}>
                                {admin.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm fw-semibold text-slate-800 mb-0">{admin.name}</p>
                                <p className="text-slate-400 fw-medium mb-0" style={{ fontSize: 11 }}>
                                  Administrator
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3 align-middle text-sm text-slate-500 fw-medium">
                            {admin.email}
                          </td>

                          <td className="px-4 py-3 align-middle text-sm text-slate-400 fw-medium">
                            {admin.createdAt}
                          </td>

                          {/* Delete trigger — opens confirmation modal */}
                          <td className="px-4 py-3 align-middle text-end">
                            <button onClick={() => setPendingDelete(admin)}
                              className="btn btn-sm d-inline-flex align-items-center gap-1
                                text-red-600 bg-red-50 border border-red-100
                                hover:bg-red-100 rounded-lg fw-bold" style={{ fontSize: 12 }}>
                              <Trash2 size={13} /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}

                      {admins.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-5 text-center text-sm
                            text-slate-400 fw-medium">
                            No admins found. Create one using the form.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ Delete confirmation modal ═══
               Uses a plain CSS/React overlay (no Bootstrap JS dependency).
               Swap for <div class="modal"> + Bootstrap modal JS if preferred. */}
          {pendingDelete && (
            <div className="position-fixed inset-0 d-flex align-items-center
              justify-content-center p-3 animate-fade-in"
              style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>

              <div className="bg-white rounded-2xl shadow-lg border border-slate-100
                w-100 p-5 animate-scale-in" style={{ maxWidth: 420 }}>

                {/* Modal header */}
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="p-2 bg-red-50 rounded-xl border border-red-100">
                    <AlertTriangle size={22} className="text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg fw-bold text-slate-900 mb-0">Delete Admin</h3>
                    <p className="text-sm text-slate-500 mb-0">This action cannot be undone.</p>
                  </div>
                </div>

                {/* Body */}
                <p className="text-sm text-slate-600 mb-4 lh-base">
                  Are you sure you want to remove{' '}
                  <strong className="text-slate-900">{pendingDelete.name}</strong>{' '}
                  ({pendingDelete.email}) from the admin list? They will lose all
                  administrative access immediately.
                </p>

                {/* Actions */}
                <div className="d-flex gap-3">
                  <button onClick={() => setPendingDelete(null)}
                    className="btn flex-fill py-2 border border-slate-200
                      text-sm fw-bold text-slate-600 hover:bg-slate-50 rounded-xl">
                    Cancel
                  </button>
                  <button onClick={handleDelete}
                    className="btn flex-fill py-2 text-white fw-bold rounded-xl
                      d-flex align-items-center justify-content-center gap-2"
                    style={{ background: '#ef4444', fontSize: 14 }}>
                    <Trash2 size={14} /> Delete Admin
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
