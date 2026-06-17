 /* ============================================================
       App.jsx — Root entry point for the VenU Admin dashboard.

       `userRole` controls which navigation items and features are
       visible. In a real app, derive this from your auth provider
       (e.g. Firebase Auth claims, a JWT payload, or a session API).

       Accepted values:
         'admin'       — standard admin: Users + Event Approvals
         'superadmin'  — full access: adds Admin Management panel
       ============================================================ */

    function App() {
      // TODO: Replace the hardcoded value with your auth-derived role.
      // Example (Firebase):  const userRole = currentUser?.customClaims?.role;
      // Example (context):   const { role: userRole } = useAuthContext();
      const [userRole] = React.useState('superadmin');

      // `key={userRole}` fully remounts the layout when the role changes,
      // resetting all panel state (active tab, notifications, etc.).
      return <DashboardLayout key={userRole} mode={userRole} />;
    }

    ReactDOM.render(<App />, document.getElementById('root'));
  </script>

</body>
</html>
