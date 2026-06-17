/* ============================================================
       DashboardLayout.jsx
       The persistent shell around every panel:
         • Left sidebar  — logo, user card, nav links, sign-out
         • Top bar       — breadcrumb, page title, notification bell
         • Main area     — renders the active panel

       Props:
         mode  'admin' | 'superadmin'
       ============================================================ */

    function DashboardLayout({ mode }) {
      const isSuperadmin = mode === 'superadmin';

      /* ── Navigation definitions ── */
      const adminNav = [
        { id: 'dashboard',    label: 'Dashboard',        Icon: LayoutDashboard },
        { id: 'users',        label: 'User Management',   Icon: Users           },
        { id: 'events',       label: 'Event Approvals',   Icon: CalendarCheck   },
      ];
      const superNav = [
        ...adminNav,
        // `special: true` marks this as a superadmin-only section with a divider above it
        { id: 'admin-manage', label: 'Admin Management', Icon: Crown, special: true },
      ];
      const navItems = isSuperadmin ? superNav : adminNav;

      /* ── State ── */
      const [activePanel,        setActivePanel]        = React.useState('dashboard');
      const [showNotifications,  setShowNotifications]  = React.useState(false);
      const [notifications,      setNotifications]      = React.useState(
        isSuperadmin ? NOTIFICATIONS_SUPERADMIN : NOTIFICATIONS_ADMIN
      );

      const unreadCount  = notifications.filter(n => !n.read).length;
      const markAllRead  = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      const username     = isSuperadmin ? 'Superadmin' : 'Admin';
      const activeLabel  = navItems.find(n => n.id === activePanel)?.label || 'Dashboard';

      /* Close notification dropdown on outside click */
      const notifRef = React.useRef(null);
      React.useEffect(() => {
        const handler = (e) => {
          if (notifRef.current && !notifRef.current.contains(e.target)) {
            setShowNotifications(false);
          }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
      }, []);

      /* ── Panel router ── */
      const renderPanel = () => {
        switch (activePanel) {
          case 'dashboard':    return <DashboardPanel />;
          case 'users':        return <UserManagementPanel />;
          case 'events':       return <EventApprovalsPanel />;
          case 'admin-manage': return <AdminManagementPanel />;
          default:             return <DashboardPanel />;
        }
      };

      return (
        <div className="d-flex" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>

          {/* ══════════ SIDEBAR ══════════ */}
          <aside className="sidebar bg-white border-end border-slate-200 shadow-sm
            d-flex flex-column justify-content-between p-4" style={{ zIndex: 40 }}>

            {/* Top section: logo + user card + nav */}
            <div className="d-flex flex-column gap-4">

              {/* Logo */}
              <div className="d-flex align-items-center gap-2 px-2 user-select-none">
                <div className="rounded-2 bg-gradient-to-br from-purple-500 to-indigo-600
                  d-flex align-items-center justify-content-center"
                  style={{ width: 32, height: 32 }}>
                  <Shield size={16} className="text-white" />
                </div>
                <span className="fs-5 fw-black text-slate-900">
                  Ven<span style={{ color: 'var(--color-brand)' }}>U</span>
                </span>
              </div>

              {/* User card */}
              <div className={`d-flex align-items-center gap-3 p-3 rounded-3 border
                ${isSuperadmin
                  ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-100'
                  : 'bg-slate-50 border-slate-200'}`}>
                <div className={`rounded-circle d-flex align-items-center justify-content-center
                  text-white fw-bold flex-shrink-0 shadow
                  ${isSuperadmin
                    ? 'bg-gradient-to-br from-amber-400 to-purple-600'
                    : 'bg-gradient-to-br from-purple-500 to-indigo-600'}`}
                  style={{ width: 40, height: 40, fontSize: 15 }}>
                  {username.charAt(0)}
                </div>
                <div>
                  <p className="text-sm fw-bold text-slate-900 mb-0 lh-1">{username}</p>
                  <div className="d-flex align-items-center gap-1 mt-1">
                    {isSuperadmin && <span style={{ fontSize: 12 }}>👑</span>}
                    <p className={`mb-0 fw-semibold ${isSuperadmin ? 'text-purple-600' : 'text-slate-500'}`}
                      style={{ fontSize: 12 }}>
                      {isSuperadmin ? 'Superadmin' : 'Admin'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="d-flex flex-column gap-1">
                {navItems.map(({ id, label, Icon, special }) => {
                  const isActive = activePanel === id;

                  return (
                    <React.Fragment key={id}>
                      {/* Divider + label before superadmin-only items */}
                      {special && (
                        <div className="pt-3 pb-1">
                          <hr className="border-slate-100 my-0" />
                          <p className="text-slate-400 fw-bold text-uppercase mt-3 mb-1 px-3"
                            style={{ fontSize: 10, letterSpacing: '0.1em' }}>
                            👑 Superadmin
                          </p>
                        </div>
                      )}

                      <button
                        onClick={() => setActivePanel(id)}
                        className={`btn nav-btn d-flex align-items-center gap-2 rounded-3
                          px-3 py-2 text-sm fw-medium text-start border w-100
                          ${isActive
                            ? `active ${special
                                ? 'bg-gradient-to-r from-purple-50 to-amber-50 text-purple-700 border-purple-100'
                                : 'bg-purple-50 text-purple-700 border-purple-100'}`
                            : `bg-transparent border-transparent
                               ${special
                                 ? 'text-amber-600 hover:bg-amber-50'
                                 : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}`}>
                        <Icon size={17}
                          className={
                            isActive
                              ? special ? 'text-amber-500' : 'text-purple-400'
                              : special ? 'text-amber-400' : ''
                          } />
                        <span>{label}</span>
                        {isActive && (
                          <span className={`ms-auto rounded-circle
                            ${special ? 'bg-amber-400' : 'bg-purple-400'}`}
                            style={{ width: 6, height: 6 }} />
                        )}
                      </button>
                    </React.Fragment>
                  );
                })}
              </nav>
            </div>

            {/* Bottom: sign out */}
            <button className="btn d-flex align-items-center gap-2 px-3 py-2 rounded-3
              text-slate-500 hover:text-red-400 border-0 bg-transparent w-100 text-start"
              style={{ fontSize: 13 }}>
              <LogOut size={15} /> Sign Out
            </button>
          </aside>

          {/* ══════════ MAIN AREA ══════════ */}
          <main className="flex-grow-1 overflow-y-auto" style={{ minHeight: '100vh' }}>

            {/* Sticky topbar */}
            <div className="topbar sticky-top border-bottom border-slate-200
              px-4 py-3 d-flex align-items-center justify-content-between" style={{ zIndex: 30 }}>

              {/* Breadcrumb + page title */}
              <div>
                <div className="d-flex align-items-center gap-2">
                  <p className="text-slate-500 fw-bold text-uppercase mb-0"
                    style={{ fontSize: 11, letterSpacing: '0.1em' }}>
                    {isSuperadmin ? 'Superadmin Dashboard' : 'Admin Dashboard'}
                  </p>
                  {isSuperadmin && <span style={{ fontSize: 12 }}>👑</span>}
                </div>
                <h1 className="fw-black text-slate-900 mb-0 lh-1 mt-1" style={{ fontSize: 18 }}>
                  {activeLabel}
                </h1>
              </div>

              {/* Notification bell + dropdown */}
              <div className="position-relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(prev => !prev)}
                  className="btn p-2 rounded-3 bg-white border border-slate-200
                    text-slate-400 position-relative"
                  style={{ lineHeight: 1 }}>
                  <Bell size={16} />
                  {/* Unread dot */}
                  {unreadCount > 0 && (
                    <span className="position-absolute top-0 end-0 rounded-circle bg-danger
                      border border-white" style={{ width: 8, height: 8, marginTop: 4, marginRight: 4 }} />
                  )}
                </button>

                {/* Notification dropdown */}
                {showNotifications && (
                  <div className="position-absolute end-0 mt-2 bg-white rounded-3
                    shadow-lg border border-slate-100 overflow-hidden animate-fade-in"
                    style={{ width: 320, top: '100%', zIndex: 50 }}>

                    {/* Dropdown header */}
                    <div className="d-flex align-items-center justify-content-between
                      p-3 border-bottom border-slate-100">
                      <h3 className="text-sm fw-bold text-slate-800 mb-0">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead}
                          className="btn btn-sm p-0 border-0 bg-transparent
                            text-purple-600 fw-semibold" style={{ fontSize: 12 }}>
                          Mark all as read
                        </button>
                      )}
                    </div>

                    {/* Notification items */}
                    <div className="scrollbar-thin" style={{ maxHeight: 320, overflowY: 'auto' }}>
                      {notifications.map(n => (
                        <div key={n.id}
                          className={`p-3 border-bottom border-slate-50 cursor-pointer
                            hover:bg-slate-50 transition-colors ${n.read ? 'opacity-50' : ''}`}
                          style={{ cursor: 'pointer' }}>
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <h4 className="text-sm fw-semibold text-slate-800 mb-0">{n.title}</h4>
                            <span className="text-slate-400 fw-medium ms-2 flex-shrink-0"
                              style={{ fontSize: 10 }}>
                              {n.time}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mb-0 lh-base">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Panel content */}
            <div className="p-4 p-lg-5">
              {renderPanel()}
            </div>
          </main>
        </div>
      );
    }
