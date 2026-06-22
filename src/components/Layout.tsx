import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAppContext } from '../context';

const Layout: React.FC = () => {
  const { theme, lang } = useAppContext();

  return (
    <div className={`${theme} min-h-screen font-sans`} dir={lang === 'AR' ? 'rtl' : 'ltr'}>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto relative">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
