import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  LayoutDashboard, 
  Briefcase, 
  ReceiptText, 
  Settings, 
  LogOut,
  User,
  Moon,
  Sun,
  Globe,
  ChevronDown,
  ChevronUp,
  Network,
  HelpCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAppContext } from '../context';
import { LOGO_URL, SITE_NAME } from '../constants';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Sidebar: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { lang, setLang, theme, setTheme, t, user } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsProfileOpen(false);
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    navigate('/login');
  };

  const menuItems = [
    { icon: Home, label: t('home'), path: '/' },
    { icon: LayoutDashboard, label: t('dashboard'), path: '/dashboard' },
    { icon: Briefcase, label: user?.role === 'admin' ? (lang === 'AR' ? 'المشاريع القائمة' : lang === 'TR' ? 'Mevcut Projeler' : 'Existing Projects') : t('projects'), path: '/projects' },
    { icon: ReceiptText, label: t('invoices'), path: '/invoices' },
    { icon: HelpCircle, label: t('faq'), path: '/faq' },
  ];

  return (
    <motion.aside 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsProfileOpen(false); }}
      initial={false}
      animate={{ width: isHovered ? 280 : 80 }}
      className="bg-white dark:bg-slate-900 border-l dark:border-r dark:border-l-0 border-slate-200 dark:border-slate-800 flex flex-col h-screen sticky top-0 shadow-sm z-50 overflow-hidden group transition-all duration-300"
    >
      <div className="p-5 flex items-center gap-3 w-full overflow-hidden">
        <Network className="w-8 h-8 text-indigo-600 dark:text-indigo-400 shrink-0" />
        <motion.span 
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : (lang === 'AR' ? 10 : -10) }}
          className="text-xl font-bold text-slate-900 dark:text-white whitespace-nowrap"
        >
          {SITE_NAME}
        </motion.span>
      </div>

      <nav className="flex-1 px-3 space-y-2 mt-4 w-full overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group/item overflow-hidden",
              isActive 
                ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium" 
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <item.icon className={cn(
              "w-6 h-6 shrink-0 transition-colors",
              "group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400"
            )} />
            <motion.span 
              animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : (lang === 'AR' ? 10 : -10) }}
              className="whitespace-nowrap"
            >
              {item.label}
            </motion.span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-100 dark:border-slate-800 w-full flex flex-col gap-2">
        
        {/* Theme & Lang Toggles */}
        <div className={`flex items-center justify-center gap-2 px-2 transition-all duration-300 ${isHovered ? 'flex-row' : 'flex-col'}`}>
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors ${isHovered ? 'w-full h-10' : 'w-10 h-10'}`}
            title={t(theme === 'dark' ? 'light_mode' : 'dark_mode')}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {isHovered && <span className="ml-2 text-sm font-medium">{theme === 'dark' ? t('light_mode') : t('dark_mode')}</span>}
          </button>
          
          <button
            onClick={() => {
              const nextLang = lang === 'AR' ? 'EN' : lang === 'EN' ? 'TR' : 'AR';
              setLang(nextLang);
            }}
            className={`flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors ${isHovered ? 'w-full h-10 px-2' : 'w-10 h-10'}`}
            title="Change Language"
          >
            {isHovered ? (
              <>
                <Globe className="w-4 h-4" />
                <span className="font-bold text-sm">{lang === 'AR' ? 'Arabic' : lang === 'EN' ? 'English' : 'Türkçe'}</span>
              </>
            ) : (
              <span className="font-bold text-sm">{lang === 'AR' ? 'AR' : lang === 'EN' ? 'EN' : 'TR'}</span>
            )}
          </button>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center justify-between w-full p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <User className="w-5 h-5" />
              </div>
              <motion.div 
                animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : (lang === 'AR' ? 10 : -10) }}
                className="flex flex-col items-start overflow-hidden"
              >
                <span className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
                  {user ? `${user.firstName} ${user.lastName}` : t('user_name')}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {user?.role === 'admin' ? (lang === 'AR' ? 'المدير العام' : lang === 'TR' ? 'Genel Müdür' : 'General Manager') : t('user_role')}
                </span>
              </motion.div>
            </div>
            {isHovered && (
              isProfileOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isProfileOpen && isHovered && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full mb-2 w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-50"
              >
                <div className="p-2 space-y-1">
                  <button 
                    onClick={() => {
                      navigate('/settings');
                      setIsProfileOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    {t('account_settings')}
                  </button>
                  <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                  <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                    <LogOut className="w-4 h-4" />
                    {t('logout')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white/95 dark:bg-slate-900/90 rounded-[28px] w-full max-w-sm p-6 space-y-6 border border-slate-200/50 dark:border-slate-800/40 shadow-2xl backdrop-blur-xl relative overflow-hidden text-center"
            >
              {/* Subtle Glowing Background Accent */}
              <div className={`absolute -top-10 ${lang === 'AR' ? '-left-10' : '-right-10'} w-24 h-24 bg-red-500/15 dark:bg-rose-500/10 rounded-full blur-2xl pointer-events-none`} />

              {/* Corner Close Button */}
              <button 
                onClick={() => setShowLogoutConfirm(false)} 
                className={`absolute top-4 ${lang === 'AR' ? 'left-4' : 'right-4'} p-1.5 rounded-xl text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-250 transition-all`}
                title={t('cancel')}
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 bg-red-500/10 dark:bg-rose-500/10 text-red-500 dark:text-rose-400 rounded-2xl flex items-center justify-center border border-red-500/20 dark:border-rose-500/20 mx-auto">
                <LogOut className="w-5 h-5" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {lang === 'AR' ? 'تأكيد تسجيل الخروج' : lang === 'TR' ? 'Çıkış Yap' : 'Confirm Sign Out'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px] mx-auto">
                  {t('logout_confirm')}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={confirmLogout}
                  className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white py-3 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-red-500/10 hover:shadow-red-500/20 active:scale-[0.98] text-sm"
                >
                  {t('logout')}
                </button>
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-850/50 text-slate-600 dark:text-slate-350 py-3 rounded-xl font-bold transition-all duration-300 active:scale-[0.98] text-sm"
                >
                  {t('cancel')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
};

export default Sidebar;
