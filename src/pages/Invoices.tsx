import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Download, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  History,
  FileText,
  ExternalLink,
  Eye,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Invoice } from '../types';
import { format } from 'date-fns';
import { ar, enUS, tr } from 'date-fns/locale';
import { useAppContext } from '../context';

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

import { useNavigate } from 'react-router-dom';

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState('invoices');
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const { t, lang, user } = useAppContext();
  const contentRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'tech') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const dateLocale = lang === 'AR' ? ar : lang === 'TR' ? tr : enUS;

  const handleViewDocument = (doc: any) => {
    setSelectedDocument(doc);
  };

  const handleDownload = async (doc: any) => {
    if (!contentRef.current) return;

    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2, // Higher quality
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

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${doc.title || 'document'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  useEffect(() => {
    let storedPayments = JSON.parse(localStorage.getItem('payments') || '[]');
    let storedProjects = JSON.parse(localStorage.getItem('projects') || '[]');

    const hasTateeq = storedProjects.some((p: any) => p.name === 'تطبيق' || p.name === 'تطبيق ');
    if (hasTateeq) {
      storedProjects = storedProjects.filter((p: any) => p.name !== 'تطبيق' && p.name !== 'تطبيق ');
      localStorage.setItem('projects', JSON.stringify(storedProjects));
      storedPayments = storedPayments.filter((p: any) => storedProjects.some((proj: any) => proj.id === p.project_id));
      localStorage.setItem('payments', JSON.stringify(storedPayments));
    }

    const projectIds = new Set(storedProjects.map((p: any) => p.id));
    const validPayments = storedPayments.filter((p: any) => projectIds.has(p.project_id));
    
    // Assign a fallback name to any payment whose project name is empty or ends in 60
    const processedPayments = validPayments.map((p: any) => {
      const isEndingIn60 = p.id.toString().endsWith('60') || (p.project_id && p.project_id.toString().endsWith('60'));
      if (!p.project_name || isEndingIn60) {
        return {
          ...p,
          project_name: p.project_name || (lang === 'AR' ? 'تطوير تطبيق جوال متكامل' : lang === 'TR' ? 'Mobil Uygulama Geliştirme' : 'Mobile App Development')
        };
      }
      return p;
    });

    setInvoices(processedPayments);
  }, [lang]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('invoices')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t('invoices_desc')}</p>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        {[
          { id: 'invoices', label: t('invoices_tab'), icon: Receipt },
          { id: 'documents', label: t('contracts_documents'), icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative whitespace-nowrap ${
              activeTab === tab.id 
                ? 'text-indigo-600 dark:text-indigo-400' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'invoices' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className={`w-full text-${lang === 'AR' ? 'right' : 'left'}`}>
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">{t('invoice_number')}</th>
                  <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">{t('project')}</th>
                  <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">{t('amount')}</th>
                  <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">{t('date')}</th>
                  <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">{t('status')}</th>
                  <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">{t('invoices_tab')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-mono text-sm text-slate-900 dark:text-white whitespace-nowrap">#INV-{invoice.id.toString().padStart(5, '0')}</td>
                    <td className="p-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{invoice.project_name}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">{invoice.amount} {t('currency')}</td>
                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {format(new Date(invoice.date || new Date()), 'MMMM yyyy', { locale: dateLocale })}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        {t('paid_status')}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewDocument({ ...invoice, type: 'invoice', title: t('invoice_title') })}
                          className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                          title={t('view_invoice')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {invoices.length === 0 && (
            <div className="p-12 text-center text-slate-400 dark:text-slate-500">{t('no_invoices')}</div>
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: t('commercial_contract'), type: t('project_contract'), date: `10 ${lang === 'AR' ? 'مارس' : lang === 'TR' ? 'Mart' : 'March'} 2024`, content: t('contract_intro') + '...' },
            { title: t('sla_agreement'), type: t('agreement'), date: `05 ${lang === 'AR' ? 'مارس' : lang === 'TR' ? 'Mart' : 'March'} 2024`, content: t('sla_agreement') + '...' },
          ].map((doc, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 group hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-all">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <FileText className="w-6 h-6" />
                </div>
                <button 
                  onClick={() => handleViewDocument(doc)}
                  className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">{doc.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{doc.type} • {doc.date}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Viewer Modal */}
      <AnimatePresence>
        {selectedDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedDocument(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  {selectedDocument.title}
                </h3>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900/50">
                <div ref={contentRef} className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm min-h-[400px]">
                  {selectedDocument.type === 'invoice' ? (
                    <div className="space-y-8">
                      {/* Invoice Header */}
                      <div className="flex justify-between items-start border-b-2 border-slate-100 dark:border-slate-700 pb-8">
                        <div>
                          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('company_name')}</h2>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{t('company_address_tr')}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{t('vat_label')}: {t('vat_number')}</p>
                        </div>
                        <div className="text-right">
                          <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2 uppercase">{t('invoice_title')}</h1>
                          <p className="text-sm text-slate-500 dark:text-slate-400">#{selectedDocument.id}</p>
                        </div>
                      </div>

                      {/* Bill To & Details */}
                      <div className="flex justify-between items-start py-4">
                        <div>
                          <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">{t('bill_to')}</h3>
                          <p className="font-bold text-slate-900 dark:text-white text-lg">{user?.name || t('guest')}</p>
                          <p className="text-slate-500 dark:text-slate-400">{selectedDocument.project_name}</p>
                        </div>
                        <div className="text-right">
                          <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">{t('invoice_details')}</h3>
                          <div className="space-y-1">
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              <span className="font-medium">{t('date')}:</span> {format(new Date(selectedDocument.date || new Date()), 'MMMM yyyy', { locale: dateLocale })}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              <span className="font-medium">{t('status')}:</span> <span className="text-emerald-600 font-bold">{t('paid_status')}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Table */}
                      <div className="border rounded-lg border-slate-200 dark:border-slate-700 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                              <th className={`p-4 text-slate-600 dark:text-slate-300 font-bold ${lang === 'AR' ? 'text-right' : 'text-left'}`}>{t('project')}</th>
                              <th className={`p-4 text-slate-600 dark:text-slate-300 font-bold ${lang === 'AR' ? 'text-left' : 'text-right'}`}>{t('amount')}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            <tr>
                              <td className="p-4 text-slate-900 dark:text-white font-medium">{selectedDocument.project_name}</td>
                              <td className={`p-4 text-slate-900 dark:text-white font-bold ${lang === 'AR' ? 'text-left' : 'text-right'}`}>{selectedDocument.amount} {t('currency')}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Totals */}
                      <div className="flex justify-end">
                        <div className="w-full max-w-xs space-y-3">
                          <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>{t('subtotal')}</span>
                            <span>{selectedDocument.amount} {t('currency')}</span>
                          </div>
                          <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>{t('vat')}</span>
                            <span>{(selectedDocument.amount * 0.15).toFixed(2)} {t('currency')}</span>
                          </div>
                          <div className="flex justify-between text-slate-900 dark:text-white font-bold text-lg pt-3 border-t border-slate-200 dark:border-slate-700">
                            <span>{t('grand_total')}</span>
                            <span className="text-indigo-600 dark:text-indigo-400">{(selectedDocument.amount * 1.15).toFixed(2)} {t('currency')}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Footer */}
                      <div className="pt-8 border-t border-slate-100 dark:border-slate-700 text-center">
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {t('company_name')} - {t('company_address_tr')} - {t('cr_label')}: {t('cr_number')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {t('contract_intro')}
                        {'\n\n'}
                        {t('contract_clause1_title')}
                        {'\n'}
                        {t('contract_clause1_desc')}
                        {'\n\n'}
                        {t('contract_clause2_title')}
                        {'\n'}
                        {t('contract_clause2_desc')}
                        {'\n\n'}
                        {t('contract_clause3_title')}
                        {'\n'}
                        {t('contract_clause3_desc1')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="px-6 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {t('back')}
                </button>
                <button
                  onClick={() => handleDownload(selectedDocument)}
                  className="px-6 py-2 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white font-bold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {t('download')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Invoices;
