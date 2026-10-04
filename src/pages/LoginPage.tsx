import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, currentUser, showToast } = useStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If already logged in, redirect to /account
  React.useEffect(() => {
    if (currentUser) {
      navigate('/account');
    }
  }, [currentUser, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email/phone and password.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const res = await login(identifier.trim(), password);
      if (res.success && res.user) {
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        navigate('/account');
      } else {
        setErrorMessage(res.error || 'Invalid credentials. Please check your email/phone and password.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FFFDF7] min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full bg-white border border-stone-200 p-6 sm:p-8 rounded-xs shadow-2xs space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#1B4332] text-white flex items-center justify-center mx-auto rounded-full font-serif font-black text-xl shadow-2xs">
            SS
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 font-serif uppercase tracking-tight">
            Sign In to SHAD SODAI
          </h1>
          <p className="text-stone-500 text-xs">
            Access your orders, saved addresses, delivery tracking & wishlist.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
              Email or Mobile Phone
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 01700-000000 or your@email.com"
                className="w-full bg-[#FFFDF7] border border-stone-300 pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-[#1B4332] rounded-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-[#1B4332] hover:underline font-medium"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your account password"
                className="w-full bg-[#FFFDF7] border border-stone-300 pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-[#1B4332] rounded-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-xs flex items-center justify-center gap-2 transition-colors shadow-2xs disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Register Link */}
        <div className="text-center pt-2 border-t border-stone-200">
          <p className="text-xs text-stone-600">
            Don't have a SHAD SODAI account yet?{' '}
            <Link to="/register" className="font-bold text-[#1B4332] hover:underline">
              Create New Account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};
