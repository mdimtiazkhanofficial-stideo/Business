import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) return;
    setIsSubmitted(true);
  };

  return (
    <div className="bg-[#FFFDF7] min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full bg-white border border-stone-200 p-6 sm:p-8 rounded-xs shadow-2xs space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 font-serif uppercase tracking-tight">
            Reset Password
          </h1>
          <p className="text-stone-500 text-xs">
            Enter your registered email or phone number to receive verification instructions.
          </p>
        </div>

        {isSubmitted ? (
          <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xs text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-emerald-900 text-sm">Reset Instructions Sent</h4>
            <p className="text-xs text-emerald-700">
              If an account matches <strong>{emailOrPhone}</strong>, we have sent password reset steps.
            </p>
            <Link
              to="/login"
              className="inline-block mt-2 text-xs font-bold text-[#1B4332] underline uppercase"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                Registered Email or Phone
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="e.g. 01700-000000 or you@email.com"
                  className="w-full bg-[#FFFDF7] border border-stone-300 pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-[#1B4332] rounded-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <Send className="w-4 h-4" />
              <span>Send Reset Link</span>
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-stone-200">
          <Link
            to="/login"
            className="text-xs text-stone-600 hover:text-[#1B4332] font-semibold inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
