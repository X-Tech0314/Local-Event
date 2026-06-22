import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';

export default function LoginForm({ onSubmit, onClose, onToggleMode, loginError }) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ email: loginEmail, password: loginPassword });
    }
  };

  return (
    <div className="w-full max-w-lg mx-4 lg:mx-8 bg-[#111827] border border-slate-800 rounded-2xl p-8 shadow-xl relative transition-all duration-300 text-white">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.15em] text-[#A855F7] uppercase">
            Welcome back to VenU
          </p>
          <h2 className="text-xl font-semibold text-white mt-1">
            Welcome back
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-white/50 hover:text-white transition-colors pt-1 cursor-pointer"
        >
          Close
        </button>
      </div>

      <form className="space-y-6" onSubmit={handleFormSubmit}>
        {/* Email */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-white/90 mb-2">
            <Mail className="h-4 w-4 text-white/50" /> Email Address
          </label>
          <input
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white text-sm outline-none focus:border-[#A855F7] transition-colors placeholder:text-white/25"
            placeholder="you@example.com"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-white/90 mb-2">
            <Lock className="h-4 w-4 text-white/50" /> Password
          </label>
          <div className="flex items-center rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 focus-within:border-[#A855F7] transition-colors">
            <input
              type={showLoginPassword ? 'text' : 'password'}
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full bg-transparent text-white text-sm outline-none placeholder:text-white/25"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowLoginPassword(!showLoginPassword)}
              className="ml-2 text-white/40 hover:text-white/70 transition-colors"
            >
              {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* ERROR MESSAGE DISPLAY (Attempts Left / Lockout Warning) */}
        {loginError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium rounded-lg p-3 flex items-start gap-2 animate-fadeIn">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-[#A855F7] hover:bg-[#9333EA] py-2.5 text-white text-sm font-semibold transition-colors cursor-pointer"
        >
          Login
        </button>

        {/* Bottom Toggle Option */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onToggleMode}
            className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            New to VENU? <span className="text-[#A855F7] font-semibold">Create an account</span>
          </button>
        </div>
      </form>
    </div>
  );
}