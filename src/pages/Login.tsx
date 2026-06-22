import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, Moon, Sun, Globe, Network, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAppContext } from '../context';
import { LOGO_URL, SITE_NAME } from '../constants';

const Login: React.FC = () => {
  const [email, setEmail] = useState('client@apptech.com');
  const [password, setPassword] = useState('AbnAziz1818');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const navigate = useNavigate();
  const { t, lang, setLang, theme, setTheme, setUser } = useAppContext();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error(t('validation_email_required'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t('validation_email_invalid'));
      return;
    }

    if (!password) {
      toast.error(t('validation_password_required'));
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        navigate('/');
      } else {
        toast.error(data.error === 'Invalid credentials' ? t('invalid_credentials') : (data.error || t('invalid_credentials')));
      }
    } catch (err) {
      toast.error(t('login_failed') || 'Login failed');
    }
  };

  const handleForgotPassword = () => {
    setIsForgotPasswordOpen(true);
  };

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetEmail) {
      try {
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: resetEmail }),
        });
        const data = await response.json();
        if (response.ok) {
          toast.success(data.message || t('password_reset_sent'));
          setIsForgotPasswordOpen(false);
          setResetEmail('');
        }
      } catch (err) {
        toast.error('Failed to send reset link');
      }
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
            {t('login_title')}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {t('login_subtitle')}
          </p>

          <div className="mt-8">
            <form className="space-y-6" onSubmit={handleLogin} noValidate>
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`block w-full ${lang === 'AR' ? 'pr-10' : 'pl-10'} py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-slate-50 dark:bg-slate-800 dark:text-white transition-colors`}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                  />
                  <label htmlFor="remember-me" className={`ml-2 block text-sm text-slate-900 dark:text-slate-300 ${lang === 'AR' ? 'mr-2' : ''}`}>
                    {t('remember_me')}
                  </label>
                </div>

                <div className="text-sm">
                  <button type="button" onClick={handleForgotPassword} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                    {t('forgot_password')}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  {t('sign_in')}
                </button>
              </div>


            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              {t('new_client')}{' '}
              <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                {t('create_account')}
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

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-100 dark:border-slate-800"
          >
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('forgot_password')}</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
              {t('enter_email_reset') || 'Enter your email address and we will send you a link to reset your password.'}
            </p>
            
            <form onSubmit={handleSendResetLink}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('email_address')}
                </label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="block w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-slate-50 dark:bg-slate-800 dark:text-white"
                  placeholder="you@example.com"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPasswordOpen(false);
                    setResetEmail('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  {t('cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  {t('send_reset_link') || 'Send Reset Link'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Login;
