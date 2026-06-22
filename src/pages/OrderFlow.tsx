import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Check, 
  Upload, 
  CreditCard, 
  ShieldCheck, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  FileText,
  Lock,
  Plus,
  Trash2,
  X,
  Download
} from 'lucide-react';
import { Package } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext, translations } from '../context';

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const formatCurrency = (amount: number) => {
  return amount.toFixed(2);
};

const OrderFlow: React.FC = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { t, lang, theme } = useAppContext();
  const [contractLang, setContractLang] = useState<'AR' | 'EN' | 'TR'>(lang as 'AR' | 'EN' | 'TR');
  const contractRef = useRef<HTMLDivElement>(null);
  
  const tContract = (key: string) => {
    return (translations[contractLang] as any)[key] || key;
  };

  const handleDownloadContract = async () => {
    if (!contractRef.current) return;

    try {
      const canvas = await html2canvas(contractRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // If content is longer than one page, we might need to handle pagination manually or just scale it.
      // For simplicity in this context, we'll scale it or just add it.
      // If it's very long, it might be cut off.
      // But html2canvas captures the full scroll height if we target the scrollable element's content.
      
      if (imgHeight > 297) {
        // Multi-page handling is complex with just an image.
        // We'll just add the image and let it be (it might be cut off or scaled).
        // Alternatively, we can slice the image.
        let heightLeft = imgHeight;
        let position = 0;
        const pageHeight = 295;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      } else {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }

      pdf.save('contract.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };
  const [pkg, setPkg] = useState<Package | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [agreedToContract, setAgreedToContract] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Mock user points
  const [userPoints, setUserPoints] = useState(3500);
  const [appliedDiscount, setAppliedDiscount] = useState<{code: string, discount: number, points: number} | null>(null);

  const finalPrice = pkg ? pkg.price - (appliedDiscount ? (pkg.price * appliedDiscount.discount / 100) : 0) : 0;

  useEffect(() => {
    const storedPoints = Number(localStorage.getItem('userPoints') || 3500);
    setUserPoints(storedPoints);
  }, []);

  const availableDiscounts = [
    { points: 1000, discount: 5, code: 'POINTS5' },
    { points: 3000, discount: 10, code: 'POINTS10' },
    { points: 5000, discount: 15, code: 'POINTS15' },
  ];

  const handleApplyDiscount = (discount: {code: string, discount: number, points: number}) => {
    if (appliedDiscount?.code === discount.code) {
      setAppliedDiscount(null);
    } else {
      if (discount.points <= userPoints) {
        setAppliedDiscount(discount);
      }
    }
  };

  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    designNotes: '',
    files: [] as File[],
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({ ...prev, files: [...prev.files, ...newFiles] }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const openFile = (file: File) => {
    const url = URL.createObjectURL(file);
    if (file.type.startsWith('image/')) {
      setPreviewImage(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setFormData({ ...formData, expiry: value.substring(0, 5) });
  };

  useEffect(() => {
    fetch('/api/packages')
      .then(res => res.json())
      .then(data => {
        const found = data.find((p: Package) => p.id === Number(packageId));
        setPkg(found);
      });
  }, [packageId]);

  if (!pkg) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">{t('loading')}</div>;

  const handleOrder = async () => {
    setLoading(true);
    try {
      // 1. Create Project
      const newProject = {
        id: Date.now(),
        name: formData.projectName,
        package_id: pkg.id,
        description: formData.description,
        status: 'in_progress',
        progress: 0,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + pkg.delivery_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        client_files: formData.files.map(f => f.name),
        earned_points: pkg.price,
        used_discount: appliedDiscount,
        budget: finalPrice
      };

      const storedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
      localStorage.setItem('projects', JSON.stringify([...storedProjects, newProject]));

      // 2. Process Payment and Deduct Points
      const newPayment = {
        id: Date.now(),
        amount: finalPrice,
        method: 'Credit Card',
        date: new Date().toISOString(),
        project_id: newProject.id,
        project_name: newProject.name,
        status: 'paid'
      };

      const storedPayments = JSON.parse(localStorage.getItem('payments') || '[]');
      localStorage.setItem('payments', JSON.stringify([...storedPayments, newPayment]));
      
      // Update User Points
      const earnedPoints = Math.floor(finalPrice);
      const currentPoints = userPoints - (appliedDiscount ? appliedDiscount.points : 0) + earnedPoints;
      localStorage.setItem('userPoints', currentPoints.toString());
      setUserPoints(currentPoints);

      setLoading(false);
      setPaymentStatus('success');
    } catch (err) {
      setLoading(false);
      setPaymentStatus('failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => paymentStatus === 'success' ? navigate('/') : navigate(-1)}
            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-100 dark:hover:border-indigo-500/50 transition-all shadow-sm"
          >
            <ArrowRight className={`w-5 h-5 ${lang === 'EN' ? 'rotate-180' : ''}`} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {paymentStatus === 'success' ? t('back_home') : t('order_completion')}
            </h1>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-medium mt-0.5">{t(pkg.name_key || pkg.name)}</p>
          </div>
        </div>
      </header>

      {/* Progress Steps - Refined */}
      <div className="flex items-center justify-center gap-10 relative px-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-3 relative z-10">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step >= s ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
            }`}>
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
            <span className={`text-sm font-bold tracking-tight ${step >= s ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
              {s === 1 ? t('project_details') : s === 2 ? t('confirm_order') : t('payment')}
            </span>
            {s < 3 && <div className={`w-10 h-0.5 rounded-full ${step > s ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-100 dark:bg-slate-800'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-10 space-y-8"
            >
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">{t('project_name')}</label>
                  <input 
                    type="text" 
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    placeholder={t('project_name_placeholder')}
                    className={`w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl px-5 py-4 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-${lang === 'AR' ? 'right' : 'left'} dark:text-white placeholder:text-slate-400`}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">{t('project_desc')}</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t('project_desc_placeholder')}
                    className={`w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl p-5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all h-40 resize-none text-${lang === 'AR' ? 'right' : 'left'} dark:text-white placeholder:text-slate-400`}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">{t('design_notes')}</label>
                  <textarea 
                    value={formData.designNotes}
                    onChange={(e) => setFormData({ ...formData, designNotes: e.target.value })}
                    placeholder={t('design_notes_placeholder')}
                    className={`w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl p-5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all h-32 resize-none text-${lang === 'AR' ? 'right' : 'left'} dark:text-white placeholder:text-slate-400`}
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">{t('upload_files')}</label>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    multiple
                  />
                  
                  {formData.files.length === 0 ? (
                    <div 
                      onClick={handleFileClick}
                      className="border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-2xl p-10 text-center hover:border-indigo-200 dark:hover:border-indigo-500/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-all cursor-pointer bg-slate-50/30 dark:bg-slate-800/30 group"
                    >
                      <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <p className="text-base font-bold text-slate-900 dark:text-white mb-1">{t('drag_drop')}</p>
                      <p className="text-sm text-slate-400 dark:text-slate-500">{t('upload_hint')}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        {formData.files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl group hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-all">
                            <div 
                              onClick={() => openFile(file)}
                              className="flex items-center gap-4 overflow-hidden cursor-pointer flex-1"
                            >
                              <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-100 dark:border-slate-700 shrink-0 group-hover:border-indigo-100 dark:group-hover:border-indigo-500/50 transition-all">
                                <FileText className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                              </div>
                              <div className="overflow-hidden">
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{file.name}</p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => removeFile(index)}
                              className="p-2 text-slate-300 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={handleFileClick}
                        className="w-full py-4 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-100 dark:hover:border-indigo-500/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        {t('add_more_files')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-6">
                <button 
                  disabled={!formData.projectName || !formData.description}
                  onClick={() => setStep(2)}
                  className="w-full bg-slate-900 dark:bg-indigo-500 text-white py-5 rounded-xl font-bold text-lg hover:bg-indigo-600 dark:hover:bg-indigo-600 transition-all shadow-lg shadow-slate-100 dark:shadow-none disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {t('next_step')}
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-0 flex flex-col"
            >
              <div className="p-10 space-y-8">
                  <div className="bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-8 rounded-2xl space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('order_summary')}</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase">{t('selected_package')}</p>
                      <p className="text-base font-bold text-slate-900 dark:text-white">{t(pkg.name_key || pkg.name)}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase">{t('project_name')}</p>
                      <p className="text-base font-bold text-slate-900 dark:text-white">{formData.projectName}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase">{t('execution_time')}</p>
                      <p className="text-base font-bold text-slate-900 dark:text-white">{pkg.delivery_days} {t('working_days')}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase">{t('earned_points')}</p>
                      <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        {pkg.price} {t('point')}
                      </p>
                    </div>
                  </div>
                  
                    <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                        <span className="text-sm font-medium">{t('price_before_discount')}</span>
                        <span className="text-base font-medium line-through">{pkg.price} {t('currency')}</span>
                      </div>
                      {appliedDiscount && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                            <span className="text-sm font-bold">{t('discount')} ({appliedDiscount.discount}%)</span>
                            <span className="text-base font-bold">-{(pkg.price * appliedDiscount.discount / 100).toFixed(2)} {t('currency')}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-indigo-600 dark:text-indigo-400">
                        <span className="text-sm font-bold">{t('price_after_discount')}</span>
                        <span className="text-lg font-bold">
                          {(pkg.price - (appliedDiscount ? (pkg.price * appliedDiscount.discount / 100) : 0)).toFixed(2)} {t('currency')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-lg font-bold text-slate-900 dark:text-white">{t('final_total')}</span>
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">
                          {(pkg.price - (appliedDiscount ? (pkg.price * appliedDiscount.discount / 100) : 0)).toFixed(2)} {t('currency')}
                        </span>
                      </div>
                    </div>

                  {/* Discount Code Section */}
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">{t('available_discounts')}</label>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-lg">
                        {t('you_have_points').replace('{points}', (userPoints - (appliedDiscount ? appliedDiscount.points : 0)).toString())}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {availableDiscounts.map((discount, idx) => {
                        const isApplied = appliedDiscount?.code === discount.code;
                        const isAvailable = isApplied || userPoints >= discount.points;
                        
                        return (
                          <div key={idx} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                            isApplied 
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30' 
                              : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
                          }`}>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                {discount.discount}% {t('discount')}
                                {isApplied && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {t('use_points_discount').replace('{points}', discount.points.toString()).replace('{discount}', discount.discount.toString())}
                              </p>
                            </div>
                            <button
                              onClick={() => handleApplyDiscount(discount)}
                              disabled={!isAvailable && !isApplied}
                              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                isApplied
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                  : isAvailable
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              {isApplied 
                                ? t('remove_discount') 
                                : isAvailable 
                                  ? t('apply_discount') 
                                  : t('not_enough_points')}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="flex items-center gap-4 cursor-pointer group p-5 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-xl border border-indigo-100 dark:border-indigo-500/20 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-500/10">
                    <div className={`w-7 h-7 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                      agreedToContract ? 'bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 group-hover:border-indigo-400 dark:group-hover:border-indigo-500'
                    }`}>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={agreedToContract}
                        onChange={() => setAgreedToContract(!agreedToContract)}
                      />
                      {agreedToContract && <Check className="w-5 h-5 text-white" />}
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {t('accept_contract')} <button type="button" onClick={(e) => { e.preventDefault(); setShowContractModal(true); }} className="text-indigo-600 dark:text-indigo-400 hover:underline">{t('contract_title')}</button>
                    </span>
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-5 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-base"
                  >
                    {t('back_to_edit')}
                  </button>
                  <button 
                    disabled={!agreedToContract}
                    onClick={() => setStep(3)}
                    className="flex-[2] bg-slate-900 dark:bg-indigo-500 text-white py-5 rounded-xl font-bold text-lg hover:bg-indigo-600 dark:hover:bg-indigo-600 transition-all shadow-lg shadow-slate-100 dark:shadow-none disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {t('confirm_and_pay')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-10 space-y-10"
            >
              {paymentStatus === 'idle' || paymentStatus === 'processing' ? (
                <div className="max-w-md mx-auto space-y-10">
                  <div className="text-center space-y-3">
                    <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <CreditCard className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{t('secure_payment')}</h3>
                    <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">{t('enter_card_details')}</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">{t('card_name')}</label>
                      <input 
                        type="text"
                        value={formData.cardName}
                        onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                        placeholder="MOHAMMED AHMED"
                        className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-5 py-4 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-${lang === 'AR' ? 'right' : 'left'} dark:text-white`}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">{t('card_number')}</label>
                      <div className="relative">
                        <input 
                          type="text"
                          value={formData.cardNumber}
                          onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value.replace(/\D/g, '').substring(0, 16) })}
                          placeholder="**** **** **** ****"
                          className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-5 py-4 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all ${lang === 'AR' ? 'pl-14 text-right' : 'pr-14 text-left'} dark:text-white`}
                          dir="ltr"
                        />
                        <CreditCard className={`w-6 h-6 text-slate-300 dark:text-slate-500 absolute top-1/2 -translate-y-1/2 ${lang === 'AR' ? 'left-5' : 'right-5'}`} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">{t('expiry_date')}</label>
                        <input 
                          type="text"
                          value={formData.expiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-5 py-4 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-${lang === 'AR' ? 'right' : 'left'} dark:text-white`}
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">{t('cvv')}</label>
                        <div className="relative">
                          <input 
                            type="password"
                            autoComplete="new-password"
                            value={formData.cvv}
                            onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '').substring(0, 3) })}
                            placeholder="***"
                            className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-5 py-4 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all ${lang === 'AR' ? 'pl-14 text-right' : 'pr-14 text-left'} dark:text-white`}
                            dir="ltr"
                          />
                          <Lock className={`w-5 h-5 text-slate-300 dark:text-slate-500 absolute top-1/2 -translate-y-1/2 ${lang === 'AR' ? 'left-5' : 'right-5'}`} />
                        </div>
                      </div>
                    </div>
                    
                  </div>

                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setStep(2)}
                        className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-5 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-base"
                      >
                        {t('back')}
                      </button>
                      <button 
                        disabled={loading || !formData.cardNumber || !formData.cvv || !formData.cardName || !formData.expiry}
                        onClick={handleOrder}
                        className="flex-[2] bg-slate-900 dark:bg-indigo-500 text-white py-5 rounded-xl font-bold text-lg hover:bg-indigo-600 dark:hover:bg-indigo-600 transition-all shadow-lg shadow-slate-100 dark:shadow-none disabled:opacity-30"
                      >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : t('pay_securely_total').replace('{price}', formatCurrency(finalPrice))}
                      </button>
                    </div>
                    <div className="flex items-center justify-center gap-5">
                      {/* Visa Text Logo */}
                      <div className="text-[#1a1f71] dark:text-white font-black text-xl italic tracking-tighter select-none" style={{ fontFamily: 'Arial, sans-serif' }}>
                        VISA
                      </div>
                      {/* Mastercard SVG with Text */}
                      <svg className="h-7 w-auto" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="35" cy="25" r="20" fill="#eb001b" fillOpacity="0.8"/>
                        <circle cx="65" cy="25" r="20" fill="#f79e1b" fillOpacity="0.8"/>
                        <path d="M50 10.5c4.7 3.7 7.7 9.4 7.7 15.8s-3 12.1-7.7 15.8c-4.7-3.7-7.7-9.4-7.7-15.8s3-12.1 7.7-15.8z" fill="#ff5f00"/>
                        <text x="50" y="58" fill={theme === 'dark' ? '#fff' : '#000'} fontFamily="Arial, sans-serif" fontSize="14" textAnchor="middle" fontWeight="bold">mastercard</text>
                      </svg>
                      <div className="h-5 w-px bg-slate-200 dark:bg-slate-700"></div>
                      <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                        <ShieldCheck className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{t('encrypted_payment')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : paymentStatus === 'success' ? (
                <div className="space-y-8 py-12 text-center flex flex-col items-center justify-center">
                  <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-50 dark:shadow-none">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{t('success_title')}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-sm mx-auto leading-relaxed">{t('success_desc')}</p>
                  </div>
                  <button 
                    onClick={() => navigate('/projects')}
                    className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none hover:scale-105"
                  >
                    {t('go_to_projects')}
                  </button>
                </div>
              ) : (
                <div className="space-y-6 py-8 text-center">
                  <div className="w-20 h-20 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{t('fail_title')}</h3>
                  <p className="text-slate-500 dark:text-slate-400">{t('fail_desc')}</p>
                  <button 
                    onClick={() => setPaymentStatus('idle')}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                  >
                    {t('retry')}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full text-slate-900 hover:bg-white transition-all z-10 shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>
              <img 
                src={previewImage} 
                alt="Preview" 
                className="w-full h-auto max-h-[80vh] object-contain"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contract Modal */}
      <AnimatePresence>
        {showContractModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm"
            onClick={() => setShowContractModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white">{t('contract_title')}</h4>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select 
                    value={contractLang} 
                    onChange={(e) => setContractLang(e.target.value as any)}
                    className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-3 py-2 text-sm font-medium border-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="AR">{lang === 'AR' ? 'العربية' : 'Arabic'}</option>
                    <option value="EN">{lang === 'AR' ? 'الإنجليزية' : 'English'}</option>
                    <option value="TR">{lang === 'AR' ? 'التركية' : 'Türkçe'}</option>
                  </select>
                  <button 
                    onClick={handleDownloadContract}
                    className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-full text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all flex items-center gap-2 px-4 whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-bold">{t('download_contract')}</span>
                  </button>
                  <button 
                    onClick={() => setShowContractModal(false)}
                    className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-900/80 p-6 flex flex-col items-center">
                <div ref={contractRef} className="bg-white text-slate-800 p-12 rounded shadow-md w-full max-w-[210mm] flex-grow space-y-8 leading-relaxed text-base font-serif" dir={contractLang === 'AR' ? 'rtl' : 'ltr'}>
                  <div className="text-center mb-12 border-b-2 border-slate-800 pb-6">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2 uppercase tracking-wide">{tContract('contract_doc_title')}</h2>
                    <p className="text-slate-500 font-sans text-sm">{tContract('contract_doc_no')} {Math.floor(Math.random() * 100000)}-{new Date().getFullYear()}</p>
                  </div>

                  <div className="space-y-6 text-justify">
                    <p>
                      {tContract('contract_intro')}
                      <br/>
                      <strong>{tContract('contract_party1')}</strong> {tContract('contract_party1_name')}
                      <br/>
                      <strong>{tContract('contract_party2')}</strong> {formData.projectName ? `${tContract('contract_party2_name')} "${formData.projectName}"` : '______________________'}.
                    </p>

                    {/* Package Details Section */}
                    <div className="bg-slate-50 p-4 rounded border border-slate-200">
                      <h5 className="font-bold text-lg text-slate-900 mb-2">{tContract('package_details') || 'Package Details'}</h5>
                      <p><strong>{tContract('package_name') || 'Package Name'}:</strong> {t(pkg.name_key || pkg.name)}</p>
                      <p><strong>{tContract('price') || 'Price'}:</strong> {pkg.price} {t('currency')}</p>
                      <p><strong>{tContract('duration') || 'Duration'}:</strong> {pkg.delivery_days} {t('working_days')}</p>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-bold text-lg text-slate-900">{tContract('contract_clause1_title')}</h5>
                      <p>{tContract('contract_clause1_desc')}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="font-bold text-lg text-slate-900">{tContract('contract_clause2_title')}</h5>
                      <p>{tContract('contract_clause2_desc')}</p>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-bold text-lg text-slate-900">{tContract('contract_clause3_title')}</h5>
                      <ul className={`list-disc list-inside space-y-1 ${contractLang === 'AR' ? 'ml-4' : 'mr-4'}`}>
                        <li>{tContract('contract_clause3_desc1')}</li>
                        <li>{tContract('contract_clause3_desc2')}</li>
                        <li>{tContract('contract_clause3_desc3')}</li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-bold text-lg text-slate-900">{tContract('contract_clause4_title')}</h5>
                      <p>{tContract('contract_clause4_desc')}</p>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-bold text-lg text-slate-900">{tContract('contract_clause5_title')}</h5>
                      <p>{tContract('contract_clause5_desc')}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 sticky bottom-0 shrink-0">
                <button 
                  onClick={() => {
                    setAgreedToContract(true);
                    setShowContractModal(false);
                  }}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
                >
                  {t('contract_agree')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderFlow;
