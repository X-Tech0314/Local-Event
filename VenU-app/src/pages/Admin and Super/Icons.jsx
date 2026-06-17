<!-- ════════════════════════════════════════════════
       All app code lives in ONE babel-transpiled script
       so load order is guaranteed (no separate <script
       src> files to fetch / 404 on a local filesystem).
       Internal order mirrors the original project:
         Icons → mockData → panels → layout → App
  ════════════════════════════════════════════════ -->
  <script type="text/babel" data-presets="react">

    /* ============================================================
       Icons.jsx — Lightweight inline SVG icon set.
       All icons accept { size, className } props.
       Using inline SVGs keeps this dependency-free (no icon lib).
       ============================================================ */

    const Shield = ({ size = 16, className = '' }) => (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );

    const ShieldCheck = ({ size = 14, className = '' }) => (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    );

    const ShieldOff = ({ size = 14, className = '' }) => (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M19.69 14a6.9 6.9 0 0 0 .31-2V5l-8-3-3.16 1.18" />
        <path d="M4.73 4.73L4 5v7c0 6 8 10 8 10a20.29 20.29 0 0 0 5.62-4.38" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    );

    const Crown = ({ size = 18, className = '' }) => (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20h20M5 20L3 8l4.5 4L12 4l4.5 8L21 8l-2 12" />
      </svg>
    );

    const Bell = ({ size = 16, className = '' }) => (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    );

    const LogOut = ({ size = 15, className = '' }) => (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    );

    const LayoutDashboard = ({ size = 18, className = '' }) => (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3"   width="7" height="7" />
        <rect x="14" y="3"  width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14"  width="7" height="7" />
      </svg>
    );

    const Users = ({ size = 18, className = '' }) => (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );

    const CalendarCheck = ({ size = 18, className = '' }) => (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2"  x2="16" y2="6" />
        <line x1="8"  y1="2"  x2="8"  y2="6" />
        <line x1="3"  y1="10" x2="21" y2="10" />
        <path d="M9 16l2 2 4-4" />
      </svg>
    );

    const TrendingUp = ({ size = 16, className = '' }) => (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    );

    const Clock = ({ size = 16, className = '' }) => (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    );

    const ChevronRight = ({ size = 14, className = '' }) => (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    );

    const Search = ({ size = 16, className = '' }) => (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    );

    const CheckCircle2 = ({ size = 14, className = '' }) => (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );

    const XCircle = ({ size = 14, className = '' }) => (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9"  x2="9"  y2="15" />
        <line x1="9"  y1="9"  x2="15" y2="15" />
      </svg>
    );

    const Filter = ({ size = 18, className = '' }) => (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
      </svg>
    );

    const UserPlus = ({ size = 16, className = '' }) => (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <line x1="20" y1="8"  x2="20" y2="14" />
        <line x1="23" y1="11" x2="17" y2="11" />
      </svg>
    );

    const Trash2 = ({ size = 14, className = '' }) => (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
    );

    const AlertTriangle = ({ size = 22, className = '' }) => (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9"  x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );

    const X = ({ size = 16, className = '' }) => (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6"  x2="6"  y2="18" />
        <line x1="6"  y1="6"  x2="18" y2="18" />
      </svg>
    );

    // Map icon name strings (used in mockData) to components
    const ICON_MAP = { Users, CalendarCheck, TrendingUp };


    /* ============================================================
       mockData.js — Static seed data for the VenU Admin dashboard.
       Replace each array with an API call (fetch / axios) when
       you wire up a real backend.
       ============================================================ */

    // ── Dashboard: stat cards shown at the top ──────────────────
    const STAT_CARDS = [
      {
        label:     'Total Users',
        value:     '2,847',
        change:    '+12.5%',
        positive:  true,
        iconName:  'Users',
        gradient:  'from-purple-500 to-indigo-600',
        bgLight:   'bg-purple-50',
        textColor: 'text-purple-600',
      },
      {
        label:     'Active Events',
        value:     '38',
        change:    '+8.2%',
        positive:  true,
        iconName:  'CalendarCheck',
        gradient:  'from-emerald-500 to-teal-600',
        bgLight:   'bg-emerald-50',
        textColor: 'text-emerald-600',
      },
      {
        label:     'Simulated Sales',
        value:     '₱124,500',
        change:    '+23.1%',
        positive:  true,
        iconName:  'TrendingUp',
        gradient:  'from-amber-500 to-orange-600',
        bgLight:   'bg-amber-50',
        textColor: 'text-amber-600',
      },
    ];

    // ── Dashboard: mini activity counters ───────────────────────
    const ACTIVITY_STATS = [
      { label: 'New Signups Today',  value: '24',  color: 'text-purple-600' },
      { label: 'Events This Week',   value: '12',  color: 'text-emerald-600' },
      { label: 'Pending Reviews',    value: '4',   color: 'text-amber-600' },
      { label: 'Active Organizers',  value: '156', color: 'text-blue-600' },
    ];

    // ── Dashboard: quick-view pending approvals list ─────────────
    const PENDING_APPROVALS_PREVIEW = [
      { id: 1, eventName: 'Summer Rhythm Music Festival', organizer: 'Juan Dela Cruz', date: 'Aug 3, 2026'  },
      { id: 2, eventName: 'Barangay Basketball Open',     organizer: 'Maria Santos',   date: 'Jul 20, 2026' },
      { id: 3, eventName: 'Tech Startup Expo 2026',       organizer: 'Carlo Reyes',    date: 'Sep 15, 2026' },
      { id: 4, eventName: 'Fiesta Cultural Night',        organizer: 'Ana Bautista',   date: 'Jul 28, 2026' },
    ];

    // ── User Management: registered platform users ───────────────
    const INITIAL_USERS = [
      { id: 1, name: 'Juan Dela Cruz',  email: 'juan@email.com',  role: 'Attendee',  status: 'Active'    },
      { id: 2, name: 'Maria Santos',    email: 'maria@email.com', role: 'Organizer', status: 'Active'    },
      { id: 3, name: 'Carlo Reyes',     email: 'carlo@email.com', role: 'Attendee',  status: 'Suspended' },
      { id: 4, name: 'Ana Bautista',    email: 'ana@email.com',   role: 'Organizer', status: 'Active'    },
      { id: 5, name: 'Pedro Mendoza',   email: 'pedro@email.com', role: 'Attendee',  status: 'Active'    },
      { id: 6, name: 'Liza Fernandez',  email: 'liza@email.com',  role: 'Attendee',  status: 'Suspended' },
    ];

    // ── Event Approvals: events awaiting review ──────────────────
    const INITIAL_PENDING_EVENTS = [
      { id: 1, eventName: 'Summer Rhythm Music Festival', organizer: 'Juan Dela Cruz', date: 'Aug 3, 2026',  category: 'Concert'    },
      { id: 2, eventName: 'Barangay Basketball Open',     organizer: 'Maria Santos',   date: 'Jul 20, 2026', category: 'Sports'     },
      { id: 3, eventName: 'Tech Startup Expo 2026',       organizer: 'Carlo Reyes',    date: 'Sep 15, 2026', category: 'Technology' },
      { id: 4, eventName: 'Fiesta Cultural Night',        organizer: 'Ana Bautista',   date: 'Jul 28, 2026', category: 'Cultural'   },
      { id: 5, eventName: 'Charity Fun Run 2026',         organizer: 'Pedro Mendoza',  date: 'Aug 12, 2026', category: 'Sports'     },
    ];

    // ── Admin Management: existing admin accounts ────────────────
    const INITIAL_ADMINS = [
      { id: 1, name: 'Admin Alpha',   email: 'alpha@venu.ph',   createdAt: 'Jun 1, 2026'  },
      { id: 2, name: 'Admin Bravo',   email: 'bravo@venu.ph',   createdAt: 'Jun 5, 2026'  },
      { id: 3, name: 'Admin Charlie', email: 'charlie@venu.ph', createdAt: 'Jun 10, 2026' },
    ];

    // ── Notifications: seeded per role ──────────────────────────
    const NOTIFICATIONS_SUPERADMIN = [
      { id: 1, title: 'Welcome, Superadmin!',  message: 'You have full platform control including admin management.', read: false, time: '1m ago'  },
      { id: 2, title: '5 Events Pending',      message: 'Review and approve pending event submissions from organizers.', read: false, time: '10m ago' },
      { id: 3, title: 'New Admin Created',     message: 'Admin Bravo was added to the system successfully.',           read: true,  time: '2h ago'  },
    ];

    const NOTIFICATIONS_ADMIN = [
      { id: 1, title: 'Welcome, Admin!',  message: 'You have access to manage users and approve events.', read: false, time: '2m ago'  },
      { id: 2, title: '3 Events Pending', message: 'Review and approve pending event submissions.',        read: false, time: '15m ago' },
    ];
