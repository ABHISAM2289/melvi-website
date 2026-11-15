import React, { useState } from 'react';
import { apiFetch } from '../lib/api';
import { Sparkles, ShieldCheck, User, ArrowRight, Lock, Mail, Snowflake, Phone, AlertCircle, CheckCircle2, AtSign } from 'lucide-react';
import ChocolateCanvasAnimation from './ChocolateCanvasAnimation';

export default function AnimatedEntryLoginPage({ onCustomerLogin, onAdminLogin, initialRole = 'customer' }) {
  const [authRole, setAuthRole] = useState(initialRole); // 'customer' | 'admin'
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [identifier, setIdentifier] = useState(''); // Email or Username for Login
  const [email, setEmail] = useState(''); // Email for Register
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister
      ? { name, username, email, password, phone }
      : { identifier, password, role: authRole };

    try {
      const res = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data = {};
      try {
        data = await res.json();
      } catch (e) {
        throw new Error('Connection error. Please try again.');
      }

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed. Please verify your details.');
      }

      if (data.token) {
        localStorage.setItem('melvi_jwt', data.token);
      }

      setSuccess(isRegister ? 'Account registered successfully! Entering Melvi...' : 'Signed in successfully! Entering Melvi...');

      setTimeout(() => {
        if (data.user.role === 'admin') {
          onAdminLogin(data.user);
        } else {
          onCustomerLogin(data.user);
        }
      }, 600);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#241c18] flex flex-col justify-between relative overflow-hidden font-sans">
      
      {/* Upgraded Canvas Background Animation */}
      <ChocolateCanvasAnimation />

      {/* Top Brand Header with Official Logo */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between relative z-20">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500/40 shadow-md p-1 bg-white flex items-center justify-center shrink-0">
            <img src="/images/melvi-logo-square.png" alt="Melvi Official Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-serif text-2xl font-black tracking-widest text-[#241c18] uppercase">
              MELVI
            </span>
            <p className="text-[9px] tracking-[0.3em] text-[#8c5d19] font-bold uppercase -mt-1">
              Haute Chocolaterie
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-[#8c5d19] bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-amber-200 shadow-2xs">
          <Snowflake className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />
          <span className="font-bold">16°C Cold-Chain Certified Delivery</span>
        </div>
      </header>

      {/* Center Form Card */}
      <main className="max-w-md mx-auto w-full px-4 py-4 relative z-20 flex-1 flex flex-col justify-center">
        
        <div className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-10 border border-[#eae4d8] shadow-[0_30px_70px_rgba(45,28,20,0.08)] relative space-y-6">
          
          {/* Official Emblem Showcase */}
          <div className="text-center space-y-3">
            <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-[#d4af37] shadow-xl p-1 bg-white flex items-center justify-center group hover:scale-105 transition-transform duration-300">
              <img src="/images/melvi-logo-square.png" alt="Melvi Trademark Registered Logo" className="w-full h-full object-contain" />
            </div>

            <div>
              <span className="inline-flex items-center space-x-1.5 bg-[#f5ede0] text-[#7c5119] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-1">
                <Sparkles className="w-3 h-3 text-[#b57a26]" />
                <span>The Signature of Premium Sweetness</span>
              </span>

              <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#241c18] tracking-tight">
                {authRole === 'admin' 
                  ? (isRegister ? 'Register Platform Admin' : 'Platform Admin Login')
                  : (isRegister ? 'Create Connoisseur Account' : 'Welcome to Melvi')}
              </h1>
              <p className="text-xs text-[#7d7065] font-light mt-0.5">
                {isRegister
                  ? 'Register with your username, email, and password to start.'
                  : authRole === 'admin'
                    ? 'Sign in with the administrator account configured for this deployment.'
                    : 'Sign in with your email or username to access your account.'}
              </p>
            </div>
          </div>

          {/* Minimal Switcher: Customer vs Admin */}
          <div className="grid grid-cols-2 p-1.5 bg-[#f4efe6] rounded-2xl border border-[#e4dbcd]">
            <button
              type="button"
              onClick={() => {
                setAuthRole('customer');
                setError(null);
                setSuccess(null);
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                authRole === 'customer'
                  ? 'bg-white text-[#241c18] shadow-sm'
                  : 'text-[#7d7065] hover:text-[#241c18]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer Portal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthRole('admin');
                setIsRegister(false);
                setError(null);
                setSuccess(null);
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                authRole === 'admin'
                  ? 'bg-[#241c18] text-white shadow-sm'
                  : 'text-[#7d7065] hover:text-[#241c18]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Platform Admin</span>
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* REGISTER FIELDS */}
            {isRegister ? (
              <>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#54463d] mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#a39587] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#faf7f2] border border-[#e5dcce] text-zinc-900 placeholder-[#a6998c] focus:bg-white focus:border-[#8c5d19] focus:ring-2 focus:ring-[#8c5d19]/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#54463d] mb-1">
                    Username *
                  </label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 text-[#a39587] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="Choose a username"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#faf7f2] border border-[#e5dcce] text-zinc-900 placeholder-[#a6998c] focus:bg-white focus:border-[#8c5d19] focus:ring-2 focus:ring-[#8c5d19]/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#54463d] mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#a39587] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#faf7f2] border border-[#e5dcce] text-zinc-900 placeholder-[#a6998c] focus:bg-white focus:border-[#8c5d19] focus:ring-2 focus:ring-[#8c5d19]/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#54463d] mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#a39587] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a secure password"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#faf7f2] border border-[#e5dcce] text-zinc-900 placeholder-[#a6998c] focus:bg-white focus:border-[#8c5d19] focus:ring-2 focus:ring-[#8c5d19]/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#54463d] mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#a39587] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#faf7f2] border border-[#e5dcce] text-zinc-900 placeholder-[#a6998c] focus:bg-white focus:border-[#8c5d19] focus:ring-2 focus:ring-[#8c5d19]/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </>
            ) : (
              /* LOGIN FIELDS: Email OR Username + Password */
              <>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#54463d] mb-1">
                    Email Address or Username *
                  </label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 text-[#a39587] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Enter your email or @username"
                      className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-[#faf7f2] border border-[#e5dcce] text-zinc-900 placeholder-[#a6998c] focus:bg-white focus:border-[#8c5d19] focus:ring-2 focus:ring-[#8c5d19]/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#54463d] mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#a39587] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-[#faf7f2] border border-[#e5dcce] text-zinc-900 placeholder-[#a6998c] focus:bg-white focus:border-[#8c5d19] focus:ring-2 focus:ring-[#8c5d19]/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 ${
                authRole === 'admin'
                  ? 'bg-[#241c18] hover:bg-[#3d2f28] text-white'
                  : 'bg-gradient-to-r from-[#a5731b] to-[#7c5119] hover:from-[#8c5d19] hover:to-[#67411b] text-white'
              }`}
            >
              <span>
                {loading
                  ? 'Authenticating...'
                  : isRegister
                  ? `Create ${authRole === 'admin' ? 'Admin' : 'Customer'} Account`
                  : `Sign In to ${authRole === 'admin' ? 'Platform Admin' : 'Melvi Store'}`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {authRole === 'customer' && (
            <div className="text-center pt-2 border-t border-[#f0ebd9]">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError(null);
                  setSuccess(null);
                }}
                className="text-xs text-[#7c5119] hover:underline font-bold"
              >
                {isRegister
                  ? 'Already have an account? Sign In with Email/Username'
                  : "New here? Register with Username & Password"}
              </button>
            </div>
          )}

        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-4 text-center text-[11px] text-[#9c8e80] relative z-20">
        <p>© {new Date().getFullYear()} Melvi Haute Chocolaterie • Officially Trademark Registered TM</p>
      </footer>

    </div>
  );
}
