import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Trash2
} from 'lucide-react';
import { Project } from '../types';
import { format } from 'date-fns';
import { ar, enUS, tr } from 'date-fns/locale';
import { useAppContext } from '../context';
import { getDynamicProject } from '../constants';

const MyProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { t, lang, user } = useAppContext();

  const dateLocale = lang === 'AR' ? ar : lang === 'TR' ? tr : enUS;
  useEffect(() => {
    let storedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    // Filter out 'تطبيق' project as requested
    const hasTateeq = storedProjects.some((p: any) => p.name === 'تطبيق' || p.name === 'تطبيق ');
    if (hasTateeq) {
      storedProjects = storedProjects.filter((p: any) => p.name !== 'تطبيق' && p.name !== 'تطبيق ');
      localStorage.setItem('projects', JSON.stringify(storedProjects));
      
      // Also clean up any orphan payments associated with the deleted project (if any)
      const storedPayments = JSON.parse(localStorage.getItem('payments') || '[]');
      const projectIds = new Set(storedProjects.map((p: any) => p.id));
      const validPayments = storedPayments.filter((p: any) => projectIds.has(p.project_id));
      localStorage.setItem('payments', JSON.stringify(validPayments));
    }

    // Seed or update demo project for committee review
    const demoIdx = storedProjects.findIndex((p: any) => p.id === 99);
    const demoName = lang === 'AR' ? 'تطوير متجر العطور الفاخرة' : lang === 'TR' ? 'Lüks Parfüm Mağazası Geliştirme' : 'Luxury Perfume E-Store Development';
    const demoDesc = lang === 'AR' ? 'مشروع برمجة وتطوير متجر إلكتروني متكامل لعرض وبيع العطور الفاخرة مع لوحة تحكم وإدارة المخزون وتكامل مع بوابات الدفع.' : 'Advanced dev package to build a fully functional ecommerce platform with payment gateways and order management.';
    const demoStages = [
      {
        id: '1',
        title: lang === 'AR' ? 'تحليل المتطلبات وتصميم الواجهات' : lang === 'TR' ? 'Gereksinim Analizi ve Arayüz Tasarımı' : 'Requirements Analysis & UI Design',
        status: 'completed',
        clientApproved: true,
        readyForApproval: true
      },
      {
        id: '2',
        title: lang === 'AR' ? 'تطوير قاعدة البيانات والنظام الخلفي' : lang === 'TR' ? 'Veritabanı ve Arka Uç Geliştirme' : 'Database & Backend Development',
        status: 'in_progress',
        clientApproved: false,
        readyForApproval: true // Client has the decision to move to next stage!
      },
      {
        id: '3',
        title: lang === 'AR' ? 'تطوير واجهات المستخدم والربط النهائي' : lang === 'TR' ? 'Arayüz Geliştirme ve API Entegrasyonu' : 'Frontend Development & Integration',
        status: 'pending',
        clientApproved: false,
        readyForApproval: false
      }
    ];

    if (demoIdx === -1) {
      const demoProject = {
        id: 99,
        name: demoName,
        package_id: 2, // Advanced Dev Package
        status: 'in_progress',
        progress: 50,
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
        description: demoDesc,
        budget: 1500,
        earned_points: 1500,
        stages: demoStages
      };
      storedProjects = [...storedProjects, demoProject];
      localStorage.setItem('projects', JSON.stringify(storedProjects));
    } else {
      storedProjects = storedProjects.map((p: any) => {
        if (p.id === 99) {
          return {
            ...p,
            name: demoName,
            description: demoDesc,
            stages: p.stages ? p.stages.map((s: any, sIdx: number) => ({
              ...s,
              title: demoStages[sIdx]?.title || s.title
            })) : demoStages
          };
        }
        return p;
      });
      localStorage.setItem('projects', JSON.stringify(storedProjects));
    }

    // Apply dynamic logic to calculate status/progress based on dates
    let updated = false;
    storedProjects = storedProjects.map((p: any) => {
      const dynamic = getDynamicProject(p);
      if (dynamic.progress !== p.progress || dynamic.status !== p.status) {
        updated = true;
        return dynamic;
      }
      return p;
    });
    if (updated) {
      localStorage.setItem('projects', JSON.stringify(storedProjects));
    }

    setProjects(storedProjects);
  }, [lang]);

  const packageCategories: { [key: number]: string } = {
    1: 'design',
    2: 'dev',
    3: 'marketing'
  };

  const filteredProjects = projects.filter(p => {
    if (user?.role === 'tech') {
      const category = packageCategories[p.package_id] || 'dev';
      if (category !== user.department) return false;
    }
    if (filter !== 'all' && p.status !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(query) || p.id.toString().includes(query);
    }
    return true;
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'in_review': return { label: t('project_status_in_review'), color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400', icon: AlertCircle };
      case 'in_progress': return { label: t('project_status_in_progress'), color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400', icon: TrendingUp };
      case 'completed': return { label: t('project_status_completed'), color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', icon: CheckCircle2 };
      default: return { label: status, color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300', icon: Clock };
    }
  };

  const TrendingUp = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {user?.role === 'admin' ? (lang === 'AR' ? 'المشاريع القائمة' : lang === 'TR' ? 'Mevcut Projeler' : 'Active Projects') : t('projects')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {user?.role === 'admin' 
              ? (lang === 'AR' ? 'متابعة ومراقبة سير العمل في كافة مشاريع الشركة الحالية' : lang === 'TR' ? 'Mevcut tüm şirket projelerinin iş akışını denetleyin' : 'Monitor and audit the workflow across all corporate active projects')
              : t('track_projects')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className={`absolute ${lang === 'AR' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_projects')} 
              className={`py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64 dark:text-white ${lang === 'AR' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
            />
          </div>
          <button className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        {[
          { id: 'all', label: t('all') },
          { id: 'in_review', label: t('project_status_in_review') },
          { id: 'in_progress', label: t('project_status_in_progress') },
          { id: 'completed', label: t('project_status_completed') },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-6 py-3 text-sm font-medium transition-all relative whitespace-nowrap ${
              filter === tab.id 
                ? 'text-indigo-600 dark:text-indigo-400' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
            {filter === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredProjects.map((project) => {
          const status = getStatusInfo(project.status);
          return (
            <div 
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500/50 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {project.name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${status.color}`}>
                      <status.icon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-400 dark:text-slate-500">{t('project_number')}</span>
                      <span className="font-mono">#{project.id.toString().padStart(5, '0')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{t('started_on')} {format(new Date(project.start_date || new Date()), 'MMMM yyyy', { locale: dateLocale })}</span>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-64 space-y-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{t('completion_rate')}</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{project.progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-1000"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                 <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all">
                    {lang === 'AR' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-10 h-10 text-slate-300 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {user?.role === 'admin' 
                ? (lang === 'AR' ? 'لا توجد مشاريع قائمة حالياً' : lang === 'TR' ? 'Mevcut Aktif Proje Bulunmuyor' : 'No Active Projects')
                : t('no_projects')}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
              {user?.role === 'admin' 
                ? (lang === 'AR' ? 'جميع مشاريع منصة إنجاز مكتملة أو لم تبدأ بعد، ولا توجد مشاريع جارية لمتابعتها في هذا القسم حالياً.' : lang === 'TR' ? 'Şu anda sistemde izlenmesi gereken aktif bir proje bulunmamaktadır.' : 'There are currently no active company projects available to monitor in this section.')
                : t('no_projects_desc')}
            </p>
            {user?.role !== 'admin' && (
              <button 
                onClick={() => navigate({ pathname: '/', hash: '#packages' })}
                className="mt-6 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
              >
                {t('browse_packages')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProjects;
