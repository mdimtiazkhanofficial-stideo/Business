import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { User, Phone, Mail, Lock, MapPin, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, currentUser, showToast } = useStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Dhaka');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  React.useEffect(() => {
    if (currentUser) {
      navigate('/account');
    }
  }, [currentUser, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !password.trim()) {
      setErrorMessage('Full Name, Phone Number, and Password are required.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const res = await register({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || '',
        password: password.trim(),
        address: address.trim(),
        city: city.trim()
      });

      if (res.success && res.user) {
        showToast('Account created successfully! Welcome to SHAD SODAI.', 'success');
        navigate('/account');
      } else {
        setErrorMessage(res.error || 'Registration failed. Please check your information.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FFFDF7] min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-lg w-full bg-white border border-stone-200 p-6 sm:p-8 rounded-xs shadow-2xs space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#1B4332] text-white flex items-center justify-center mx-auto rounded-full font-serif font-black text-xl shadow-2xs">
            SS
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 font-serif uppercase tracking-tight">
            Create Customer Account
          </h1>
          <p className="text-stone-500 text-xs">
            Join SHAD SODAI for easy ordering, verified reviews, address saving, and order tracking.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mahfuzur Rahman"
                  className="w-full bg-[#FFFDF7] border border-stone-300 pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-[#1B4332] rounded-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                Mobile Phone *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 01700-000000"
                  className="w-full bg-[#FFFDF7] border border-stone-300 pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-[#1B4332] rounded-xs"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                Email Address (Optional)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@shadsodai.com"
                  className="w-full bg-[#FFFDF7] border border-stone-300 pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-[#1B4332] rounded-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-[#FFFDF7] border border-stone-300 pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-[#1B4332] rounded-xs"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                Default Delivery Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House, Road, Area, Landmark"
                  className="w-full bg-[#FFFDF7] border border-stone-300 pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-[#1B4332] rounded-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                City / Region
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#FFFDF7] border border-stone-300 px-3 py-2 text-xs text-stone-900 rounded-xs"
              >
                <option value="Dhaka">Dhaka</option>
                <option value="Chattogram">Chattogram</option>
                <option value="Sylhet">Sylhet</option>
                <option value="Rajshahi">Rajshahi</option>
                <option value="Khulna">Khulna</option>
                <option value="Barishal">Barishal</option>
                <option value="Rangpur">Rangpur</option>
                <option value="Mymensingh">Mymensingh</option>
                <option value="Outside Dhaka">Other Districts</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-xs flex items-center justify-center gap-2 transition-colors shadow-2xs disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Creating Account...' : 'Register Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-stone-200">
          <p className="text-xs text-stone-600">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#1B4332] hover:underline">
              Sign In Here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};
