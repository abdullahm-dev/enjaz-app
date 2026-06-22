import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Wallet, 
  ChevronRight, 
  ChevronLeft,
  Search,
  Filter,
  Play,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: number;
  name: string;
  status: 'pending' | 'in_progress' | 'review' | 'completed';
  progress: number;
  start_date: string;
  client_description: string;
}

const AdminDashboard: React.FC = () => {
  const { t, lang } = useAppContext();
  const navigate = useNavigate();
  const isRTL = lang === 'AR';
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProjects(data);
        } else {
          setProjects([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setProjects([]);
        setLoading(false);
      });
  }, []);

  const handleStartProject = async (id: number) => {
    const res = await fetch(`/api/admin/projects/${id}/start`, { method: 'POST' });
    if (res.ok) {
      setProjects(prev => prev.map(p => p.id === id ? { ...p, status: 'in_progress', progress: 10 } : p));
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toString().includes(searchTerm)
  );

  if (loading) return <div className="p-8 animate-pulse space-y-8">
    <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>)}
    </div>
  </div>;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{t('admin_panel')}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">{t('welcome_back_admin')}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('total_projects')}</span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{projects.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-2xl">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('pending')}</span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{projects.filter(p => p.status === 'pending').length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl">
              <Play className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('in_progress')}</span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{projects.filter(p => p.status === 'in_progress').length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('completed')}</span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{projects.filter(p => p.status === 'completed').length}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text"
              placeholder={t('search_projects')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white font-medium"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/20">
                <th className="px-8 py-5 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('project')}</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('status')}</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('progress')}</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{project.name}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">#{project.id} • {new Date(project.start_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                      project.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                      project.status === 'in_progress' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                      'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {t(project.status)}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="w-32">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-black text-slate-900 dark:text-white">{project.progress}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${project.progress}%` }}
                          className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full"
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      {project.status === 'pending' && (
                        <button 
                          onClick={() => handleStartProject(project.id)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          {t('start_project')}
                        </button>
                      )}
                      <button 
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="p-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                      >
                        {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
