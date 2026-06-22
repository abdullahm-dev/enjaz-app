import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Star, Check, ArrowLeftRight, ShoppingCart, Play, X, SlidersHorizontal, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Package } from '../types';
import { useAppContext } from '../context';

const Home: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([]);
  const [category, setCategory] = useState('all');
  const [priceRange, setPriceRange] = useState(2000);
  const [searchQuery, setSearchQuery] = useState('');
  const [compareList, setCompareList] = useState<Package[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const navigate = useNavigate();
  const offersRef = useRef<HTMLDivElement>(null);
  const { t, lang, user } = useAppContext();

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'tech') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (window.location.hash === '#packages') {
      setTimeout(() => {
        offersRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);

  useEffect(() => {
    fetch('/api/packages')
      .then(res => res.json())
      .then(data => {
        setPackages(data);
        setFilteredPackages(data);
      });
  }, []);

  useEffect(() => {
    let result = [...packages];
    if (category !== 'all') {
      result = result.filter(p => p.category === category);
    }
    result = result.filter(p => p.price <= priceRange);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        t(p.name_key || p.name).toLowerCase().includes(query) || 
        t(p.desc_key || p.description).toLowerCase().includes(query)
      );
    }
    
    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);

    setFilteredPackages(result);
  }, [category, priceRange, packages, sortBy, searchQuery, t]);

  const scrollToOffers = () => {
    offersRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleCompare = (pkg: Package) => {
    if (compareList.find(p => p.id === pkg.id)) {
      setCompareList(compareList.filter(p => p.id !== pkg.id));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, pkg]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-indigo-600 rounded-3xl p-8 md:p-16 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight">
              {t('turn_ideas')} <span className="text-indigo-200">{t('reality')}</span> {t('with_experts')}
            </h1>
            <p className="text-indigo-100 text-xl mb-10 max-w-xl leading-relaxed">
              {t('home_subtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={scrollToOffers}
                className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                {t('browse_offers')}
              </button>
              <button 
                onClick={() => setShowVideo(true)}
                className="bg-indigo-500/30 backdrop-blur-md text-white border border-indigo-400/30 px-8 py-4 rounded-2xl font-bold hover:bg-indigo-500/50 transition-all flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-indigo-600">
                  <Play className={`w-4 h-4 fill-current ${lang === 'AR' ? 'ml-0.5' : 'mr-0.5'}`} />
                </div>
                {t('how_we_work')}
              </button>
            </div>
          </motion.div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-400 rounded-full blur-[150px]"></div>
        </div>
      </section>

      {/* Redesigned Filtering System */}
      <section id="packages" ref={offersRef} className="space-y-8">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white whitespace-nowrap">{t('available_packages')}</h2>
            
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {[
                { id: 'all', label: t('all') },
                { id: 'design', label: t('design') },
                { id: 'dev', label: t('development') },
                { id: 'marketing', label: t('marketing') }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap border ${
                    category === cat.id 
                      ? 'bg-slate-900 dark:bg-indigo-600 text-white border-slate-900 dark:border-indigo-600 shadow-md' 
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            <div className="relative group w-full sm:w-auto">
              <Search className={`absolute ${lang === 'AR' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors`} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_package')}
                className={`${lang === 'AR' ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full sm:w-72 transition-all shadow-sm dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500`}
              />
            </div>
            <div className="relative w-full sm:w-auto">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`appearance-none w-full sm:w-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl ${lang === 'AR' ? 'pr-10 pl-10' : 'pl-10 pr-10'} py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer shadow-sm dark:text-white`}
              >
                <option value="popular">{t('most_popular')}</option>
                <option value="rating">{t('highest_rated')}</option>
                <option value="price-asc">{t('price_low_high')}</option>
                <option value="price-desc">{t('price_high_low')}</option>
              </select>
              <SlidersHorizontal className={`absolute ${lang === 'AR' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none`} />
            </div>
          </div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.map((pkg) => (
          <motion.div 
            layout
            key={pkg.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl dark:hover:shadow-indigo-900/10 transition-all group"
          >
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full uppercase tracking-wider">
                  {pkg.category === 'design' ? t('design') : pkg.category === 'dev' ? t('development') : t('marketing')}
                </span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-bold">{pkg.rating}</span>
                  <span className="text-slate-400 dark:text-slate-500 text-xs">({pkg.reviews_count})</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{t(pkg.name_key || pkg.name)}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 line-clamp-2">{t(pkg.desc_key || pkg.description)}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-lg border border-amber-100 dark:border-amber-500/20">
                  <Star className="w-3 h-3 fill-current" />
                  {Math.floor(pkg.price)} {t('loyalty_points')}
                </div>
              </div>

              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{pkg.price} {t('sar')}</span>
                {pkg.old_price && (
                  <span className="text-slate-400 dark:text-slate-500 line-through text-sm mb-1">{pkg.old_price} {t('sar')}</span>
                )}
              </div>

              <ul className="space-y-2 py-4 border-y border-slate-50 dark:border-slate-800/50">
                {pkg.features_keys ? pkg.features_keys.map((featureKey, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    {t(featureKey)}
                  </li>
                )) : pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="flex gap-3 pt-2">
                {user?.role === 'admin' || user?.role === 'tech' ? (
                  <button 
                    onClick={() => alert(user?.role === 'admin'
                      ? (lang === 'AR' ? 'صلاحية مشاهد فقط: بصفتك المدير العام، يمكنك تتبع ومتابعة عمل الشركة واستعراض العقود والملفات الفنية والمالية فقط.' : lang === 'TR' ? 'Gözlemci Yetkisi: Genel Müdür olarak, yalnızca şirket projelerini izleme, faturaları görüntüleme ve her belgeyi kontrol etme yetkiniz vardır.' : 'Viewer Access Only: As General Manager, you can only track ongoing projects, view invoices and download digital agreements.')
                      : (lang === 'AR' ? 'صلاحية القسم المختص: بصفتك عضواً في الفريق التقني، يقتصر دورك على إدارة وتنفيذ المشاريع التابعة لقسمك فقط.' : lang === 'TR' ? 'Departman Yetkisi: Teknik ekip üyesi olarak, yalnızca kendi departmanınızdaki projeleri yönetme ve yürütme yetkiniz vardır.' : 'Department Access Only: As a technical team member, your access is limited to managing and executing projects belonging to your department.')
                    )}
                    className="flex-1 bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-xs"
                  >
                    <Star className="w-4 h-4 text-amber-400 fill-current" />
                    <span>
                      {lang === 'AR' ? 'مواصفات الباقة المعتمدة' : lang === 'TR' ? 'Onaylanan Paket Özellikleri' : 'Approved Package Details'}
                    </span>
                  </button>
                ) : (
                  <button 
                    onClick={() => navigate(`/order/${pkg.id}`)}
                    className="flex-1 bg-indigo-600 dark:bg-indigo-500 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {t('order_now')}
                  </button>
                )}
                <button 
                  onClick={() => toggleCompare(pkg)}
                  className={`p-3 rounded-xl border transition-all ${
                    compareList.find(p => p.id === pkg.id)
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-indigo-200 dark:hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                  title={t('add_compare')}
                >
                  <ArrowLeftRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Comparison Bar */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-6"
          >
            <div className="flex items-center gap-3">
              {compareList.map(pkg => (
                <div key={pkg.id} className="relative">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 p-2 text-center leading-tight">
                    {t(pkg.name_key || pkg.name).split(' ')[1] || t(pkg.name_key || pkg.name).substring(0, 4)}
                  </div>
                  <button 
                    onClick={() => toggleCompare(pkg)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px]"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {[...Array(3 - compareList.length)].map((_, i) => (
                <div key={i} className="w-12 h-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-600">
                  +
                </div>
              ))}
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
            <button 
              onClick={() => setShowCompare(true)}
              className="bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
            >
              {t('view_compare')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Modal */}
      <AnimatePresence>
        {showCompare && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowCompare(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ArrowLeftRight className="w-5 h-5 text-indigo-600" />
                  {t('compare_packages')}
                </h2>
                <button 
                  onClick={() => setShowCompare(false)} 
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {compareList.map(pkg => (
                    <div key={pkg.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-center">
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1 break-words">{t(pkg.name_key || pkg.name)}</h3>
                        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{pkg.price} {t('sar')}</div>
                      </div>
                      
                      <div className="p-5 space-y-6 flex-1">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 dark:text-slate-400">{t('execution_time')}</span>
                            <span className="font-bold text-slate-900 dark:text-white">{pkg.delivery_days} {t('working_days')}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 dark:text-slate-400">{t('rating')}</span>
                            <div className="flex items-center gap-1 text-amber-500 font-bold">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              {pkg.rating}
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 dark:text-slate-400">{t('loyalty_points')}</span>
                            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              {Math.floor(pkg.price)}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('features')}</p>
                          <ul className="space-y-2">
                            {pkg.features_keys ? pkg.features_keys.map((featureKey, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                                <span className="leading-tight break-words">{t(featureKey)}</span>
                              </li>
                            )) : pkg.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                                <span className="leading-tight break-words">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="p-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 mt-auto">
                        <button 
                          onClick={() => {
                            setShowCompare(false);
                            navigate(`/order/${pkg.id}`);
                          }}
                          className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all shadow-lg shadow-slate-200 dark:shadow-none flex items-center justify-center gap-2"
                        >
                          {t('choose_package')}
                          {lang === 'AR' ? <ArrowLeftRight className="w-4 h-4 rotate-180" /> : <ArrowLeftRight className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add Placeholder if less than 3 */}
                  {compareList.length < 3 && (
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center p-8 text-center space-y-4 min-h-[400px]">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                        <Plus className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('add_more_to_compare')}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('select_another_package')}</p>
                      </div>
                      <button 
                        onClick={() => setShowCompare(false)}
                        className="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                      >
                        {t('browse_packages')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Video Modal */}
      <AnimatePresence>
        {showVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black rounded-3xl w-full max-w-5xl aspect-video overflow-hidden relative shadow-2xl"
            >
              <button 
                onClick={() => setShowVideo(false)}
                className="absolute top-6 right-6 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all"
              >
                <X className="w-6 h-6" />
              </button>
              <video 
                className="w-full h-full object-cover"
                controls
                autoPlay
                playsInline
                src="https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-his-laptop-34440-large.mp4"
              >
                {t('video_not_supported')}
              </video>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
