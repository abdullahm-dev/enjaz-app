import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Wallet, 
  AlertCircle,
  Plus,
  MessageSquare,
  FileText,
  ArrowUpRight,
  Award,
  Star,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Zap,
  X,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Stats, Project } from '../types';
import { useAppContext } from '../context';
import { getDynamicProject } from '../constants';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [ongoingProject, setOngoingProject] = useState<Project | null>(null);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const navigate = useNavigate();
  const { t, lang, user } = useAppContext();
  const isRTL = lang === 'AR';

  const chartData = [
    { name: 'يناير', projects: 4, spending: 1200 },
    { name: 'فبراير', projects: 7, spending: 2100 },
    { name: 'مارس', projects: 5, spending: 1500 },
    { name: 'أبريل', projects: 8, spending: 2800 },
    { name: 'مايو', projects: 12, spending: 4200 },
    { name: 'يونيو', projects: 10, spending: 3500 },
  ];

  useEffect(() => {
    let storedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    let storedPayments = JSON.parse(localStorage.getItem('payments') || '[]');
    const storedPoints = Number(localStorage.getItem('userPoints') || 3500);

    const hasTateeq = storedProjects.some((p: any) => p.name === 'تطبيق' || p.name === 'تطبيق ');
    if (hasTateeq) {
      storedProjects = storedProjects.filter((p: any) => p.name !== 'تطبيق' && p.name !== 'تطبيق ');
      localStorage.setItem('projects', JSON.stringify(storedProjects));
      storedPayments = storedPayments.filter((p: any) => storedProjects.some((proj: any) => proj.id === p.project_id));
      localStorage.setItem('payments', JSON.stringify(storedPayments));
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

      // Also seed an invoice payment for statistics consistency
      const hasDemoPayment = storedPayments.some((pay: any) => pay.project_id === 99);
      if (!hasDemoPayment) {
        const demoPayment = {
          id: 9901,
          project_id: 99,
          amount: 1500,
          method: 'Credit Card',
          status: 'success',
          date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
        };
        storedPayments = [...storedPayments, demoPayment];
        localStorage.setItem('payments', JSON.stringify(storedPayments));
      }
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

    const projectIds = new Set(storedProjects.map((p: any) => p.id));
    const validPayments = storedPayments.filter((p: any) => projectIds.has(p.project_id));

    const totalProjects = storedProjects.length;
    const currentProjects = storedProjects.filter((p: any) => p.status === 'in_progress' || p.status === 'pending').length;
    const completedProjects = storedProjects.filter((p: any) => p.status === 'completed').length;
    const totalPayments = validPayments.reduce((acc: number, curr: any) => acc + curr.amount, 0);

    setStats({
      totalProjects,
      currentProjects,
      completedProjects,
      totalPayments,
      totalPoints: storedPoints
    });

    const inProgress = storedProjects.find((p: any) => p.status === 'in_progress' || p.status === 'pending');
    setOngoingProject(inProgress || null);
  }, [lang]);

  if (!stats) return <div className="animate-pulse space-y-8">
    <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
    <div className="grid grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>)}
    </div>
  </div>;

  const points = stats.totalPoints || 0;
  
  let levelName = t('bronze');
  let badgeIconColor = 'text-orange-600 dark:text-orange-400';
  let badgeBgColor = 'bg-orange-50 dark:bg-orange-500/10';
  let badgeBorderColor = 'border-orange-100 dark:border-orange-500/20';
  let progressPercent = 0;

  if (points <= 1000) {
    levelName = t('bronze');
    badgeIconColor = 'text-orange-600 dark:text-orange-400';
    badgeBgColor = 'bg-orange-50 dark:bg-orange-500/10';
    badgeBorderColor = 'border-orange-100 dark:border-orange-500/20';
    progressPercent = (points / 1000) * 100;
  } else if (points <= 3000) {
    levelName = t('silver');
    badgeIconColor = 'text-slate-500 dark:text-slate-400';
    badgeBgColor = 'bg-slate-50 dark:bg-slate-800';
    badgeBorderColor = 'border-slate-200 dark:border-slate-700';
    progressPercent = ((points - 1000) / 2000) * 100;
  } else if (points <= 5000) {
    levelName = t('gold');
    badgeIconColor = 'text-amber-500 dark:text-amber-400';
    badgeBgColor = 'bg-amber-50 dark:bg-amber-500/10';
    badgeBorderColor = 'border-amber-100 dark:border-amber-500/20';
    progressPercent = ((points - 3000) / 2000) * 100;
  } else {
    levelName = t('platinum');
    badgeIconColor = 'text-indigo-600 dark:text-indigo-400';
    badgeBgColor = 'bg-indigo-50 dark:bg-indigo-500/10';
    badgeBorderColor = 'border-indigo-100 dark:border-indigo-500/20';
    progressPercent = 100;
  }

  const cards = [
    { label: t('total_projects'), value: stats.totalProjects, icon: TrendingUp, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { label: t('current_projects'), value: stats.currentProjects, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    { label: t('completed_projects'), value: stats.completedProjects, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { label: t('total_payments'), value: `${stats.totalPayments.toFixed(2)} ${t('sar')}`, icon: Wallet, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-10 pb-12"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            {user?.role === 'admin' ? (lang === 'AR' ? 'لوحة تحكم المدير العام' : lang === 'TR' ? 'Genel Müdür Paneli' : 'General Manager Dashboard') : t('dashboard')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
            {user?.role === 'admin' 
              ? (lang === 'AR' ? 'مرحباً بك مجدداً، سيادة المدير العام' : lang === 'TR' ? 'Tekrar hoş geldiniz, Sayın Genel Müdür' : 'Welcome back, General Manager')
              : t('welcome_back')}
          </p>
        </div>
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-base bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
          <Calendar className="w-5 h-5" />
          <span>
            {new Intl.DateTimeFormat(
              lang === 'AR' ? 'ar-SA' : lang === 'TR' ? 'tr-TR' : 'en-US',
              { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
            ).format(new Date())}
          </span>
        </div>
      </header>

      {/* Stats Row - Now at the Top */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <div 
            key={idx}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-start text-start justify-between"
          >
            <div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div className="mt-4">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{card.label}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Active Project - Minimalist Redesign */}
        <div className="xl:col-span-2">
          {ongoingProject ? (
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-8 md:p-10 flex-1">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
                  <div className="space-y-4">
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${ongoingProject.status === 'pending' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20'}`}>
                      <Zap className="w-3 h-3 fill-current" />
                      {ongoingProject.status === 'pending' ? t('pending') : t('in_progress_badge')}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight">{ongoingProject.name}</h2>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-6 rounded-2xl border border-slate-100 dark:border-slate-700 text-center min-w-[160px]">
                    <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{t('deadline')}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {ongoingProject.end_date ? (
                        <span dir={isRTL ? 'rtl' : 'ltr'}>
                          {Math.max(0, Math.ceil((new Date(ongoingProject.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} {t('days_remaining')}
                        </span>
                      ) : t('not_specified')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-10">
                  <div className="space-y-2">
                    <p className="text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-wider">{t('current_stage')}</p>
                    <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{t('coding_testing')}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-wider">{t('budget')}</p>
                    <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{ongoingProject.budget ? ongoingProject.budget.toLocaleString() : '0'} {t('sar')}</p>
                  </div>
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <p className="text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-wider">{t('department')}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {lang === 'AR' ? 'ت.و' : lang === 'TR' ? 'WG' : 'WD'}
                      </div>
                      <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{t('web_dev')}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-wider">{t('progress')}</p>
                    <p className="text-4xl font-bold text-slate-900 dark:text-white">{ongoingProject.progress}%</p>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${ongoingProject.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full"
                    ></motion.div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/50 dark:bg-slate-800/50 px-8 py-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-xs font-medium">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> 12 {t('tasks_completed')}</span>
                  <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></span>
                  <span>4 {t('tasks_remaining')}</span>
                </div>
                <button 
                  onClick={() => navigate(`/projects/${ongoingProject.id}`)}
                  className="w-full sm:w-auto bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm"
                >
                  {user?.role === 'admin' 
                    ? (lang === 'AR' ? 'تتبع ومراقبة سير المشروع' : lang === 'TR' ? 'Projeyi İzle ve Denetle' : 'Track & Monitor Project')
                    : t('manage_project')}
                  {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center h-full p-12 text-center">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {user?.role === 'admin' 
                  ? (lang === 'AR' ? 'لا توجد مشاريع قائمة حالياً' : lang === 'TR' ? 'Mevcut Aktif Proje Bulunmuyor' : 'No active projects')
                  : t('no_active_projects')}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                {user?.role === 'admin'
                  ? (lang === 'AR' ? 'لا توجد مشاريع جارية في حساب الشركة بحاجة لمتابعتها في الوقت الحالي.' : lang === 'TR' ? 'Şu anda sistemde izlenmesi gereken aktif bir proje bulunmamaktadır.' : 'There are currently no active company projects uploaded to track.')
                  : t('no_active_projects_desc')}
              </p>
              {user?.role !== 'admin' && (
                <button 
                  onClick={() => navigate({ pathname: '/', hash: '#packages' })}
                  className="bg-indigo-600 dark:bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                >
                  {t('browse_offers')}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Loyalty & Status OR Admin Permissions Panel */}
        <div className="space-y-6">
          {user?.role === 'admin' ? (
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-full text-start">
              <div className="flex justify-between items-start mb-8">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
                  <CheckCircle2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <p className="text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-1">
                    {lang === 'AR' ? 'صلاحيات الوصول' : lang === 'TR' ? 'ERİŞİM YETKİLERİ' : 'ACCESS LEVEL'}
                  </p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {lang === 'AR' ? 'إشراف ومتابعة' : lang === 'TR' ? 'GÖZLEMCİ' : 'READ & AUDIT'}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-6 text-start">
                <p className="text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-wider">
                  {lang === 'AR' ? 'الدور المعتمد' : lang === 'TR' ? 'Atanan Rol' : 'Assigned Role'}
                </p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                  {lang === 'AR' ? 'المدير العام' : lang === 'TR' ? 'Genel Müdür' : 'General Manager'}
                </h3>
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed text-start">
                {lang === 'AR' 
                  ? 'بصفتك المدير العام، تم تفعيل مستوى المشاهدة الآمنة لك للاطلاع الكامل والتدقيق في كافة المشاريع والفواتير والعقود دون إحداث تعديلات.' 
                  : lang === 'TR' 
                  ? 'Genel Müdür olarak, herhangi bir değişiklik yapmadan tüm projeleri, faturaları ve sözleşmeleri tam olarak incelemeniz ve denetlemeniz için güvenli gözlemci modu etkinleştirildi.' 
                  : 'As General Manager, secure viewer access is activated for comprehensive auditing and tracking of all corporate projects, invoices, and legal contracts.'}
              </p>

              <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 flex-1 text-start">
                <div className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{lang === 'AR' ? 'متابعة حية للمشاريع وتفاصيلها' : lang === 'TR' ? 'Canlı Proje İzleme ve Detaylar' : 'Live project tracking & details'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{lang === 'AR' ? 'الاطلاع على الملفات الفنية والأكواد' : lang === 'TR' ? 'Teknik Kod ve Tasarımları İnceleme' : 'Inspect technical files & code'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{lang === 'AR' ? 'مراجعة كافة الفواتير والحسابات' : lang === 'TR' ? 'Finansal Fatura ve Hesap Kontrolü' : 'Invoices & financial accounts control'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{lang === 'AR' ? 'تحميل اتفاقيات ومستندات العمل' : lang === 'TR' ? 'Hizmet Sözleşmelerini İndirme' : 'Service level agreement downloads'}</span>
                </div>
              </div>


            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-full">
              <div className="flex justify-between items-start mb-10">
                <div className={`p-4 ${badgeBgColor} rounded-2xl border ${badgeBorderColor}`}>
                  <Award className={`w-8 h-8 ${badgeIconColor}`} />
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <p className="text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-1">{t('membership')}</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">PREMIUM</p>
                </div>
              </div>

              <div className="space-y-2 mb-10">
                <p className="text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-wider">{t('current_level')}</p>
                <h3 className="text-5xl font-bold text-slate-900 dark:text-white">{levelName}</h3>
              </div>

              <div className="space-y-8 bg-slate-50 dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 flex-1">
                <div className="flex justify-between items-end">
                  <div className="space-y-2">
                    <p className="text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-wider">{t('collected_points')}</p>
                    <p className="text-5xl font-bold text-slate-900 dark:text-white">{points.toLocaleString()}</p>
                  </div>
                  <Star className={`w-8 h-8 ${badgeIconColor} fill-current`} />
                </div>
                
                <div className="space-y-4">
                  <div className="w-full h-2 bg-white dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${badgeBgColor.replace('50', '500')} rounded-full`} style={{ width: `${progressPercent}%` }}></div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowRewardsModal(true)}
                className="mt-8 w-full py-3.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm"
              >
                {t('explore_rewards')}
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Support Banner */}
      {user?.role !== 'admin' && (
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
              <MessageSquare className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">{t('support_title')}</h3>
              <p className="text-indigo-100 max-w-md">{t('support_desc')}</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 relative z-10">
            <div className="bg-white text-indigo-600 px-10 py-5 rounded-2xl font-bold shadow-xl shadow-indigo-900/10 whitespace-nowrap text-center">
              {t('talk_to_consultant')}
            </div>
            <div className="flex items-center gap-4">
              <a href="mailto:info@apptech.com.tr" className="w-14 h-14 bg-white text-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-900/10" title="info@apptech.com.tr">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </a>
              <a href="https://wa.me/902125490304" target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-white text-green-600 rounded-full flex items-center justify-center hover:bg-green-50 transition-all shadow-xl shadow-indigo-900/10" title="WhatsApp">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
              </a>
            </div>
          </div>
        </div>
      )}
      <AnimatePresence>
        {showRewardsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" dir={isRTL ? "rtl" : "ltr"}>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowRewardsModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <Award className="w-7 h-7 text-indigo-600" />
                    {t('loyalty_program')}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{t('loyalty_desc')}</p>
                </div>
                <button 
                  onClick={() => setShowRewardsModal(false)}
                  className="p-2 bg-white dark:bg-slate-800 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 sm:p-8 overflow-y-auto space-y-8">
                {/* How to earn points */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800/30">
                  <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    {t('how_to_earn')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-3">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1">{t('on_payment')}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{t('on_payment_desc')}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
                      <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mb-3">
                        <Star className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1">{t('special_offers')}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{t('special_offers_desc')}</p>
                    </div>
                  </div>
                </div>

                {/* Tiers */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('membership_levels')}</h3>
                  <div className="space-y-4">
                    {/* Bronze */}
                    <div className={`flex items-center gap-4 p-4 border rounded-2xl relative overflow-hidden transition-all ${levelName === t('bronze') ? 'bg-white dark:bg-slate-800 border-indigo-500 shadow-md ring-1 ring-indigo-500/20' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-70'}`}>
                      <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {t('bronze')} 
                          {levelName === t('bronze') && <span className="text-[10px] bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">{t('your_current_level')}</span>}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{t('bronze_points')}</p>
                      </div>
                      <div className={isRTL ? "text-left" : "text-right"}>
                        <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold">{t('bronze_benefit')}</span>
                      </div>
                    </div>

                    {/* Silver */}
                    <div className={`flex items-center gap-4 p-4 border rounded-2xl relative overflow-hidden transition-all ${levelName === t('silver') ? 'bg-white dark:bg-slate-800 border-indigo-500 shadow-md ring-1 ring-indigo-500/20' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-70'}`}>
                      <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-600/30 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {t('silver')}
                          {levelName === t('silver') && <span className="text-[10px] bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">{t('your_current_level')}</span>}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{t('silver_points')}</p>
                      </div>
                      <div className={isRTL ? "text-left" : "text-right"}>
                        <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold">{t('silver_benefit')}</span>
                      </div>
                    </div>

                    {/* Gold */}
                    <div className={`flex items-center gap-4 p-4 border rounded-2xl relative overflow-hidden transition-all ${levelName === t('gold') ? 'bg-white dark:bg-slate-800 border-indigo-500 shadow-md ring-1 ring-indigo-500/20' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-70'}`}>
                      <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {t('gold')}
                          {levelName === t('gold') && <span className="text-[10px] bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">{t('your_current_level')}</span>}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{t('gold_points')}</p>
                      </div>
                      <div className={isRTL ? "text-left" : "text-right"}>
                        <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold">{t('gold_benefit')}</span>
                      </div>
                    </div>

                    {/* Platinum */}
                    <div className={`flex items-center gap-4 p-4 border rounded-2xl relative overflow-hidden transition-all ${levelName === t('platinum') ? 'bg-white dark:bg-slate-800 border-indigo-500 shadow-md ring-1 ring-indigo-500/20' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-70'}`}>
                      <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {t('platinum')}
                          {levelName === t('platinum') && <span className="text-[10px] bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">{t('your_current_level')}</span>}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{t('platinum_points')}</p>
                      </div>
                      <div className={isRTL ? "text-left" : "text-right"}>
                        <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold">{t('platinum_benefit')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <button 
                  onClick={() => setShowRewardsModal(false)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
                >
                  {t('got_it')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dashboard;
