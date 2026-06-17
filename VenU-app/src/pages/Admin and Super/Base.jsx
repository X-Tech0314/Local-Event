<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VenU Admin Dashboard</title>

  <!-- ── Google Fonts ── -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

  <!-- ── Bootstrap 5 (layout, modals, utilities) ── -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />

  <!-- ── Tailwind CSS (fine-grained utility classes) ── -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      // Prevent Tailwind from conflicting with Bootstrap's own reset
      corePlugins: { preflight: false },
      theme: {
        extend: {
          fontFamily: { sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'] },
          animation: {
            'fade-in':  'fadeIn  0.4s cubic-bezier(0.16,1,0.3,1) forwards',
            'scale-in': 'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
          },
          keyframes: {
            fadeIn:  { '0%': { opacity:'0', transform:'translateY(8px)'  }, '100%': { opacity:'1', transform:'translateY(0)'    } },
            scaleIn: { '0%': { opacity:'0', transform:'scale(0.95)'       }, '100%': { opacity:'1', transform:'scale(1)'         } },
          },
        },
      },
    };
  </script>

  <!-- ── React (UMD build — no bundler required) ── -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.2/babel.min.js"></script>

  <!-- ── App-level styles (inlined from styles/main.css) ── -->
  <style>
    /* ============================================================
       VenU Admin — Global Styles
       Philosophy: custom CSS for things Tailwind & Bootstrap can't
       express cleanly (CSS variables, scrollbar, base resets).
       All layout/spacing/color utilities live in the JSX via
       Tailwind classes; Bootstrap handles the grid & modal layer.
       ============================================================ */

    /* ── Base ── */
    *, *::before, *::after { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background-color: #F9F8FC;
      color: #0f172a; /* slate-900 */
    }

    /* ── CSS custom properties (design tokens) ── */
    :root {
      --color-brand:        #a855f7; /* purple-500  */
      --color-brand-dark:   #9333ea; /* purple-600  */
      --color-brand-light:  #f3e8ff; /* purple-100  */

      --color-surface:      #ffffff;
      --color-bg:           #F9F8FC;
      --color-border:       #f1f5f9; /* slate-100   */

      --radius-card:        1rem;    /* 16px rounded-2xl */
      --shadow-card:        0 1px 3px 0 rgb(0 0 0 / .06), 0 1px 2px -1px rgb(0 0 0 / .04);
    }

    /* ── Thin scrollbar for overflow panels ── */
    .scrollbar-thin {
      scrollbar-width: thin;
      scrollbar-color: #e2e8f0 transparent;
    }
    .scrollbar-thin::-webkit-scrollbar       { width: 4px; }
    .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
    .scrollbar-thin::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 9999px; }

    /* ── Sidebar stays fixed-height on all screens ── */
    .sidebar {
      width: 256px;       /* w-64 */
      height: 100vh;
      position: sticky;
      top: 0;
      flex-shrink: 0;
      overflow-y: auto;
    }

    /* ── Topbar frosted-glass effect ── */
    .topbar {
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      background-color: rgba(249, 248, 252, 0.80);
    }

    /* ── Stat card hover lift ── */
    .stat-card {
      transition: box-shadow 0.3s ease, transform 0.3s ease;
    }
    .stat-card:hover {
      box-shadow: 0 4px 12px rgb(0 0 0 / .08);
      transform: translateY(-2px);
    }

    /* ── Active nav pill ── */
    .nav-btn.active {
      background-color: #f3e8ff;
      color: #7e22ce;
      font-weight: 700;
      border-color: #e9d5ff;
    }

    /* ── Bootstrap modal backdrop tweak (keeps it above sidebar z-40) ── */
    .modal-backdrop { z-index: 1040; }
    .modal          { z-index: 1050; }
  </style>
</head>
<body>

  <div id="root"></div>
