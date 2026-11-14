import React, { useState } from 'react';
import { X, User, Lock, Mail, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  if (!isOpen) return null;

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister ? { name, email, phone } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Authentication failed');

      onLoginSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: 'admin', password: 'admin' }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        onLoginSuccess(data.user);
        onClose();
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-cocoa-950 border border-gold-500/40 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-fadeIn">
        
        {/* Top Header */}
        <div className="p-6 bg-cocoa-900 border-b border-gold-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gold-500/20 text-gold-300 flex items-center justify-center border border-gold-500/40">
              <User className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">
                {isRegister ? 'Join Melvi Circle' : 'Welcome to Melvi'}
              </h3>
              <p className="text-xs text-zinc-400">
                {isRegister ? 'Create your chocolate connoisseur account' : 'Sign in to access custom boxes and orders'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-cocoa-950 border border-zinc-700 text-zinc-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Quick 1-Click Demo Login Shortcuts */}
          <div className="bg-cocoa-900/60 p-3.5 rounded-2xl border border-gold-500/20 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gold-400 block text-center">
              Quick 1-Click Sign-in
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin()}
                className="p-2.5 rounded-xl bg-cocoa-950 border border-gold-500/40 hover:bg-gold-500/20 text-left transition-all group col-span-2"
              >
                <div className="flex items-center space-x-1.5 text-gold-300 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Portal Login</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-0.5">Master Chocolatier</p>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-zinc-800 w-full" />
            <span className="bg-cocoa-950 px-3 text-[11px] uppercase tracking-widest text-zinc-500 shrink-0">
              Or with email
            </span>
            <div className="border-t border-zinc-800 w-full" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-gold-200 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full bg-cocoa-900 border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-400"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gold-200 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-cocoa-900 border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gold-200 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-cocoa-900 border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-500/40">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-400 via-gold-500 to-amber-600 text-cocoa-950 font-bold text-xs uppercase tracking-wider hover:scale-[1.01] transition-all shadow-lg flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle between Login and Register */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-gold-300 hover:text-white underline underline-offset-4"
            >
              {isRegister ? 'Already have an account? Sign In' : 'New to Melvi? Create an Account'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
