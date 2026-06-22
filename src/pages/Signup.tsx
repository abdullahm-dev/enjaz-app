import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, User, Phone, Moon, Sun, Globe, Network, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAppContext } from '../context';
import { LOGO_URL, SITE_NAME } from '../constants';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+966',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { t, lang, setLang, theme, setTheme } = useAppContext();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim()) {
      toast.error(t('validation_first_name_required'));
      return;
    }

    if (!formData.lastName.trim()) {
      toast.error(t('validation_last_name_required'));
      return;
    }

    if (!formData.email.trim()) {
      toast.error(t('validation_email_required'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error(t('validation_email_invalid'));
      return;
    }

    if (!formData.phone.trim()) {
      toast.error(t('validation_phone_required'));
      return;
    }

    if (!formData.password) {
      toast.error(t('validation_password_required'));
      return;
    }

    if (formData.password.length < 6) {
      toast.error(t('validation_password_length'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error(t('passwords_do_not_match') || 'Passwords do not match');
      return;
    }
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(t('account_created_successfully') || 'Account created successfully');
        navigate('/login');
      } else {
        const errorKey = data.error === 'user_already_exists' ? 'user_already_exists' : 'signup_failed';
        toast.error(t(errorKey) || data.error || 'Signup failed');
      }
    } catch (err) {
      toast.error(t('signup_failed') || 'Signup failed');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleLang = () => {
    const nextLang = lang === 'AR' ? 'EN' : lang === 'EN' ? 'TR' : 'AR';
    setLang(nextLang);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-200 relative" dir={lang === 'AR' ? 'rtl' : 'ltr'}>
      {/* Logo - Extreme Corner */}
      <div className={`absolute top-6 z-50 flex items-center gap-2 ${lang === 'AR' ? 'right-6' : 'left-6'}`}>
        <Network className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        <span className="text-2xl font-bold text-slate-900 dark:text-white">{SITE_NAME}</span>
      </div>
      
      {/* Toggles - Extreme Corner */}
      <div className={`absolute top-6 z-50 flex items-center gap-2 ${lang === 'AR' ? 'left-6' : 'right-6'}`}>
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title={t(theme === 'dark' ? 'light_mode' : 'dark_mode')}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button 
          onClick={toggleLang}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title={t('language')}
        >
          <Globe className="w-5 h-5" />
          <span className="text-sm font-bold">{lang}</span>
        </button>
      </div>

      {/* Left Side: Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 relative">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900 dark:text-white">
            {t('signup_title')}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {t('signup_subtitle')}
          </p>

          <div className="mt-8">
            <form className="space-y-6" onSubmit={handleSignup} noValidate>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('first_name')}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className={`absolute inset-y-0 ${lang === 'AR' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      autoComplete="given-name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className={`block w-full ${lang === 'AR' ? 'pr-10' : 'pl-10'} py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-slate-50 dark:bg-slate-800 dark:text-white transition-colors`}
                      placeholder="Mohammed"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('last_name')}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className={`absolute inset-y-0 ${lang === 'AR' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      autoComplete="family-name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className={`block w-full ${lang === 'AR' ? 'pr-10' : 'pl-10'} py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-slate-50 dark:bg-slate-800 dark:text-white transition-colors`}
                      placeholder="Ahmed"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('email_address')}
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className={`absolute inset-y-0 ${lang === 'AR' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`block w-full ${lang === 'AR' ? 'pr-10' : 'pl-10'} py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-slate-50 dark:bg-slate-800 dark:text-white transition-colors`}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('phone_number')}
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <select
                    value={formData.countryCode}
                    onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                    className={`block ${lang === 'AR' ? 'rounded-r-xl' : 'rounded-l-xl'} border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white py-3 px-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  >
                    <option value="+966">+966</option>
                    <option value="+971">+971</option>
                    <option value="+965">+965</option>
                    <option value="+973">+973</option>
                    <option value="+968">+968</option>
                    <option value="+974">+974</option>
                    <option value="+90">+90</option>
                    <option value="+1">+1</option>
                  </select>
                  <input
                    type="tel"
                    required
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`block w-full ${lang === 'AR' ? 'rounded-l-xl' : 'rounded-r-xl'} py-3 border border-slate-300 dark:border-slate-700 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-slate-50 dark:bg-slate-800 dark:text-white transition-colors`}
                    placeholder="50 000 0000"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('password')}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className={`absolute inset-y-0 ${lang === 'AR' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`block w-full ${lang === 'AR' ? 'pr-10' : 'pl-10'} py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-slate-50 dark:bg-slate-800 dark:text-white transition-colors`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className={`absolute inset-y-0 ${lang === 'AR' ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center`}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5 text-slate-400" /> : <Eye className="h-5 w-5 text-slate-400" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('confirm_password')}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className={`absolute inset-y-0 ${lang === 'AR' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      required
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className={`block w-full ${lang === 'AR' ? 'pr-3' : 'pl-10'} py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-slate-50 dark:bg-slate-800 dark:text-white transition-colors`}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  {t('create_account')}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              {t('already_have_account')}{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                {t('sign_in')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Decorative */}
      <div className="hidden lg:block relative w-0 flex-1 bg-indigo-600">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-white text-center">
            <Network className="w-64 h-64 mx-auto mb-8 opacity-80" />
            <h3 className="text-4xl font-bold mb-4">{SITE_NAME}</h3>
            <p className="text-xl opacity-90">{t('tagline')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
