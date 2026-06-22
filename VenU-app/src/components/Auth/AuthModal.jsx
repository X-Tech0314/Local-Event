import React from 'react';
import LoginForm from './LoginForm.jsx';
import RegisterForm from './RegisterForm.jsx';

export default function AuthModal({
  showAuth,
  onClose,
  authView,
  setAuthView,
  createRole,
  setCreateRole,
  onLoginSubmit,
  onRegisterSubmit,
  loginError, // <--- ADDED THIS PROP
}) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`transition-all duration-700 ease-in-out overflow-hidden flex items-start justify-center shrink-0 ${showAuth ? 'auth-panel-auth-open' : ''
        }`}
      style={{
        width: showAuth ? (authView === 'login' ? '45%' : '65%') : '0%',
        opacity: showAuth ? 1 : 0,
        paddingTop: '2rem',
      }}
    >
      {authView === 'login' ? (
        <LoginForm
          onClose={onClose}
          onToggleMode={() => setAuthView('register')}
          onSubmit={onLoginSubmit}
          loginError={loginError} // <--- PASSING IT TO LOGIN FORM
        />
      ) : (
        <RegisterForm
          onClose={onClose}
          onToggleMode={() => setAuthView('login')}
          onSubmit={onRegisterSubmit}
          createRole={createRole}
          setCreateRole={setCreateRole}
        />
      )}
    </div>
  );
}