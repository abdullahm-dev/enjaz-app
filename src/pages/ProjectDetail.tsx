import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Download, 
  Upload, 
  MessageSquare,
  Send,
  User,
  History,
  Star,
  Eye,
  X,
  Paperclip,
  Check,
  MoreVertical
} from 'lucide-react';
import { Project, ProjectStage, ChatMessage, ProjectFile } from '../types';
import { format } from 'date-fns';
import { ar, enUS, tr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context';
import { getDynamicProject } from '../constants';
import { toast } from 'react-hot-toast';

const STAGE_TRANSLATIONS: Record<string, Record<string, Array<{ title: string; completed: string; in_progress: string; pending: string }>>> = {
  AR: {
    dev: [
      {
        title: 'تحليل المتطلبات وتصميم الواجهات',
        completed: 'تم الانتهاء من دراسة جميع متطلبات النظام الأساسية وتصميم واجهات تجربة المستخدم بالكامل واعتمادها.',
        in_progress: 'جاري العمل على تحليل المتطلبات الأساسية وتصميم هيكلية الواجهات الأولية.',
        pending: 'ستبدأ مرحلة تحليل المتطلبات والتصميم قريباً.'
      },
      {
        title: 'تطوير قاعدة البيانات والنظام الخلفي',
        completed: 'تم الانتهاء من بناء هيكل قاعدة البيانات وتطوير وبرمجة النظام الخلفي بالكامل وربط لوحة التحكم.',
        in_progress: 'جاري العمل على بناء هيكل قاعدة البيانات وتطوير الخدمات الخلفية وربط بوابات الدفع.',
        pending: 'ستبدأ البرمجة وتطوير النظام الخلفي فور الانتهاء من اعتماد الواجهات.'
      },
      {
        title: 'تطوير واجهات المستخدم والربط النهائي',
        completed: 'تم تطوير واجهات المستخدم وتكاملها مع الخدمات الخلفية بالكامل وتجربة النظام وتسليم المشروع بنجاح.',
        in_progress: 'جاري العمل على تطوير الواجهات الأمامية التفاعلية وربطها مع خادم البيانات.',
        pending: 'ستبدأ برمجة الواجهات الأمامية والربط بمجرد جاهزية الخدمات الخلفية.'
      }
    ],
    design: [
      {
        title: 'دراسة الهوية البصرية وتحليل المتطلبات',
        completed: 'تم دراسة هوية العلامة التجارية بالكامل ووضع الأساس الفني والاتجاه البصري المعتمد للمشروع.',
        in_progress: 'جاري دراسة العلامة التجارية والجمهور المستهدف وتحديد الاتجاهات البصرية المقترحة.',
        pending: 'ستبدأ دراسة الهوية والتحليل قريباً.'
      },
      {
        title: 'تصميم الشعار وتطوير الهوية البصرية',
        completed: 'تم تصميم الشعار المعتمد وجميع الأصول البصرية والمطبوعات الملحقة وفق المواصفات المحددة.',
        in_progress: 'جاري العمل على ابتكار وتصميم خيارات الشعار الأساسي وعناصر الهوية البصرية.',
        pending: 'سيبدأ العمل على تصميم الشعار بعد اعتماد مرحلة دراسة الهوية البصرية.'
      },
      {
        title: 'تجهيز وتسليم ملفات المصدر',
        completed: 'تم مراجعة وتجهيز كافة ملفات الهوية المعتمدة وتصدير ملفات المصدر الأصلية وتسليمها للعميل بنجاح.',
        in_progress: 'جاري إجراء التعديلات المطلوبة وتجهيز الملفات المصدرية المفتوحة للتصدير والتسليم.',
        pending: 'سيتم تجهيز وتسليم ملفات المصدر فور اعتماد التصميم النهائي للشعار والهوية.'
      }
    ],
    marketing: [
      {
        title: 'تحليل السوق والمنافسين وتحديد الجمهور',
        completed: 'تم الانتهاء من تحليل السوق والمنافسين ودراسة الجمهور المستهدف ورسم خطة التسويق المعتمدة.',
        in_progress: 'جاري إجراء بحوث التسويق وتحليل المنافسين وتحديد القنوات والمنصات المناسبة.',
        pending: 'سيبدأ تحليل السوق وتحديد الجمهور المستهدف قريباً.'
      },
      {
        title: 'صياغة المحتوى وتجهيز خطة النشر',
        completed: 'تم صياغة وكتابة المنشورات وتصميم الإعلانات وجدولة خطة النشر المعتمدة بالكامل على المنصات.',
        in_progress: 'جاري إعداد محتوى المنشورات وتصميم الصور الإعلانية وكتابة نصوص الحملة التسويقية.',
        pending: 'ستبدأ صياغة المحتوى وجدولته فور الانتهاء من مرحلة تحليل السوق واختيار المنصات.'
      },
      {
        title: 'إطلاق الحملات وإعداد تقارير الأداء',
        completed: 'تم إطلاق الحملات التسويقية بنجاح ومراقبة الأداء وإعداد التقرير الختامي للأداء والنتائج.',
        in_progress: 'جاري إطلاق وإدارة الحملات الإعلانية ومراقبة التفاعل وجمع بيانات التحليل والأداء.',
        pending: 'سيبدأ إطلاق الحملات الإعلانية وجدولتها بعد اعتماد المحتوى والتصاميم.'
      }
    ]
  },
  EN: {
    dev: [
      {
        title: 'Requirements Analysis & UI Design',
        completed: 'All requirements have been analyzed and UI/UX designs have been fully completed and approved.',
        in_progress: 'Analyzing requirements and designing initial user interface layouts.',
        pending: 'Requirements analysis and UI design stage will start soon.'
      },
      {
        title: 'Database & Backend Development',
        completed: 'Database structures and backend services have been fully developed, integrated, and verified.',
        in_progress: 'Building database schemas, backend services, and setting up payment integrations.',
        pending: 'Backend development will begin immediately after UI design approval.'
      },
      {
        title: 'Frontend Development & Integration',
        completed: 'Frontend interfaces have been fully developed, integrated with backend APIs, and delivered successfully.',
        in_progress: 'Developing interactive UI views and integrating API endpoints.',
        pending: 'Frontend development will start once backend service components are ready.'
      }
    ],
    design: [
      {
        title: 'Identity Research & Requirements Analysis',
        completed: 'Brand identity research and visual requirements analysis have been fully completed and approved.',
        in_progress: 'Analyzing competitor brands, target audience, and preparing moodboards.',
        pending: 'Identity research and discovery stage will start soon.'
      },
      {
        title: 'Logo Design & Visual Identity Development',
        completed: 'The primary logo and core visual identity system elements have been designed and approved.',
        in_progress: 'Crafting unique logo concepts and visual identity components.',
        pending: 'Logo and identity design will begin after the discovery stage approval.'
      },
      {
        title: 'Packaging & Source Files Delivery',
        completed: 'All brand design assets and open source files have been packaged, exported, and delivered successfully.',
        in_progress: 'Applying client feedback revisions and compiling high-resolution open source assets.',
        pending: 'Source files preparation and packaging will start after final logo approval.'
      }
    ],
    marketing: [
      {
        title: 'Market & Competitor Analysis',
        completed: 'Market and competitor research has been completed and the marketing strategy is finalized and approved.',
        in_progress: 'Analyzing market opportunities, competitors, and selecting optimal target platforms.',
        pending: 'Market and competitor analysis will start soon.'
      },
      {
        title: 'Content Creation & Posting Strategy',
        completed: 'Marketing copy has been written, visual posts designed, and the content schedule fully approved.',
        in_progress: 'Drafting advertising copy, designing post graphics, and planning content calendar.',
        pending: 'Content creation will start after market and platform analysis approval.'
      },
      {
        title: 'Campaign Deployment & Reporting',
        completed: 'Marketing campaigns have been launched successfully and final performance reports delivered.',
        in_progress: 'Deploying campaigns, managing budgets, and aggregating performance metrics.',
        pending: 'Campaign launch and performance reporting will start after content approval.'
      }
    ]
  },
  TR: {
    dev: [
      {
        title: 'Gereksinim Analizi ve UI Tasarımı',
        completed: 'Tüm sistem gereksinimleri analiz edildi ve kullanıcı arayüzü tasarımları eksiksiz şekilde onaylandı.',
        in_progress: 'Sistem gereksinimleri analiz ediliyor ve ilk arayüz prototipleri tasarlanıyor.',
        pending: 'Gereksinim analizi ve arayüz tasarım aşaması yakında başlayacak.'
      },
      {
        title: 'Veritabanı ve Arka Uç Geliştirme',
        completed: 'Veritabanı yapısı ve arka uç servisleri başarıyla geliştirildi, entegre edildi ve onaylandı.',
        in_progress: 'Veritabanı şemaları oluşturuluyor, arka uç servisleri kodlanıyor ve ödeme entegrasyonları yapılıyor.',
        pending: 'Arka uç geliştirmeleri, arayüz tasarımlarının onaylanmasının ardından başlayacaktır.'
      },
      {
        title: 'Ön Uç Geliştirme ve API Entegrasyonu',
        completed: 'Ön uç kullanıcı arayüzleri geliştirildi, API entegrasyonları tamamlandı ve başarıyla teslim edildi.',
        in_progress: 'Etkileşimli ön uç sayfaları kodlanıyor ve veri API uç noktaları entegre ediliyor.',
        pending: 'Ön uç kodlama aşaması, arka uç servisleri hazır olduğunda başlayacaktır.'
      }
    ],
    design: [
      {
        title: 'Kimlik Araştırması ve Gereksinim Analizi',
        completed: 'Marka kimliği araştırması ve tasarım gereksinimleri analizi tamamlanarak görsel yön belirlendi.',
        in_progress: 'Rakip markalar ve hedef kitle analiz ediliyor, görsel fikir panoları hazırlanıyor.',
        pending: 'Görsel kimlik araştırma ve analiz aşaması yakında başlayacak.'
      },
      {
        title: 'Logo Tasarımı ve Görsel Kimlik Geliştirme',
        completed: 'Ana logo tasarımı ve kurumsal görsel kimlik sistemi öğeleri tasarlanarak onaylandı.',
        in_progress: 'Özgün logo konseptleri ve görsel kimlik kılavuzu bileşenleri tasarlanıyor.',
        pending: 'Logo ve kimlik tasarımı, marka araştırma aşaması onaylandıktan sonra başlayacaktır.'
      },
      {
        title: 'Paketleme ve Kaynak Dosya Teslimatı',
        completed: 'Tüm kurumsal tasarım kaynak dosyaları paketlendi, dışa aktarıldı ve başarıyla teslim edildi.',
        in_progress: 'Geri bildirim revizyonları uygulanıyor ve yüksek çözünürlüklü açık kaynak dosyalar hazırlanıyor.',
        pending: 'Kaynak dosyaların hazırlanması ve teslimatı, logo onayının ardından başlayacaktır.'
      }
    ],
    marketing: [
      {
        title: 'Pazar ve Rakip Analizi',
        completed: 'Pazar ve rakip araştırmaları tamamlandı, hedef kitle profili ve pazarlama stratejisi onaylandı.',
        in_progress: 'Pazar fırsatları ve rakipler analiz ediliyor, en uygun hedef platformlar belirleniyor.',
        pending: 'Pazar ve rakip analizi aşaması yakında başlayacak.'
      },
      {
        title: 'İçerik Üretimi ve Yayınlama Stratejisi',
        completed: 'Pazarlama metinleri yazıldı, görsel gönderiler tasarlandı ve yayın planı tamamen onaylandı.',
        in_progress: 'Reklam metinleri taslağı hazırlanıyor, gönderi grafikleri tasarlanıyor ve yayın takvimi planlanıyor.',
        pending: 'İçerik üretimi, pazar ve platform analizi onaylandıktan sonra başlayacaktır.'
      },
      {
        title: 'Kampanya Yayını ve Performans Raporlama',
        completed: 'Pazarlama kampanyaları başarıyla başlatıldı ve nihai performans raporları hazırlanıp iletildi.',
        in_progress: 'Kampanyalar yayına alınıyor, bütçeler yönetiliyor ve performans metrikleri analiz ediliyor.',
        pending: 'Kampanya yayını ve raporlama aşaması, içerik onayından sonra başlayacaktır.'
      }
    ]
  }
};

const getStageInfo = (category: string, stageIdx: number, status: string, lang: string) => {
  const catKey = (category === 'design' || category === 'marketing') ? category : 'dev';
  const langKey = (lang === 'AR' || lang === 'TR') ? lang : 'EN';
  const stageData = STAGE_TRANSLATIONS[langKey]?.[catKey]?.[stageIdx] || STAGE_TRANSLATIONS['EN']['dev'][stageIdx];
  
  let suggestion = stageData.pending;
  if (status === 'completed') {
    suggestion = stageData.completed;
  } else if (status === 'in_progress') {
    suggestion = stageData.in_progress;
  }
  
  return {
    title: stageData.title,
    suggestions: suggestion
  };
};

const getStageStatus = (stageIdx: number, progress: number, projectStatus: string) => {
  if (projectStatus === 'completed' || progress === 100) return 'completed';
  if (stageIdx === 0) {
    return progress >= 33 ? 'completed' : 'in_progress';
  }
  if (stageIdx === 1) {
    if (progress < 33) return 'pending';
    return progress >= 66 ? 'completed' : 'in_progress';
  }
  if (stageIdx === 2) {
    if (progress < 66) return 'pending';
    return progress >= 100 ? 'completed' : 'in_progress';
  }
  return 'pending';
};

const getStageFiles = (category: string, stageIdx: number) => {
  const dateStr = '2024-03-0' + (stageIdx + 1);
  if (category === 'design') {
    if (stageIdx === 0) return [{ id: 'f1', name: 'Brand_Research.pdf', url: '#', type: 'document' as const, uploadedBy: 'technical' as const, date: dateStr }];
    if (stageIdx === 1) return [{ id: 'f2', name: 'Logo_Concepts.pdf', url: '#', type: 'document' as const, uploadedBy: 'technical' as const, date: dateStr }];
    return [{ id: 'f3', name: 'Source_Files.zip', url: '#', type: 'document' as const, uploadedBy: 'technical' as const, date: dateStr }];
  } else if (category === 'marketing') {
    if (stageIdx === 0) return [{ id: 'f1', name: 'Market_Analysis.pdf', url: '#', type: 'document' as const, uploadedBy: 'technical' as const, date: dateStr }];
    if (stageIdx === 1) return [{ id: 'f2', name: 'Content_Calendar.pdf', url: '#', type: 'document' as const, uploadedBy: 'technical' as const, date: dateStr }];
    return [{ id: 'f3', name: 'Campaign_Assets.zip', url: '#', type: 'document' as const, uploadedBy: 'technical' as const, date: dateStr }];
  } else {
    if (stageIdx === 0) return [{ id: 'f1', name: 'Wireframes.pdf', url: '#', type: 'document' as const, uploadedBy: 'technical' as const, date: dateStr }];
    if (stageIdx === 1) return [{ id: 'f2', name: 'Database_Schema.pdf', url: '#', type: 'document' as const, uploadedBy: 'technical' as const, date: dateStr }];
    return [{ id: 'f3', name: 'Frontend_Prototype.zip', url: '#', type: 'document' as const, uploadedBy: 'technical' as const, date: dateStr }];
  }
};

const getLocalizedFeatures = (category: string, lang: string) => {
  if (lang === 'AR') {
    if (category === 'design') return ["شعار واحد وحصري", "ثلاث تعديلات مجانية", "الملفات المصدرية الكاملة"];
    if (category === 'marketing') return ["إدارة ثلاث منصات اجتماعية", "12 منشوراً تفاعلياً شهرياً", "تقارير أداء وتحليل شهرية"];
    return ["متجر إلكتروني متكامل", "دعم فني وضمان لمدة 3 أشهر", "ربط كامل مع بوابات الدفع الإلكترونية"];
  } else if (lang === 'TR') {
    if (category === 'design') return ["Tek özgün logo", "3 revizyon hakkı", "Kaynak dosyalar"];
    if (category === 'marketing') return ["3 sosyal medya yönetimi", "Aylık 12 gönderi", "Performans raporları"];
    return ["Tam entegre e-ticaret", "3 ay teknik destek", "Ödeme geçidi entegrasyonu"];
  } else {
    if (category === 'design') return ["Single unique logo concept", "3 free revisions", "Full source files"];
    if (category === 'marketing') return ["Manage 3 social platforms", "12 posts per month", "Performance reports"];
    return ["Fully integrated e-store", "3 months technical support", "Payment gateway integration"];
  }
};

const getDepartmentInfo = (category: string, lang: string) => {
  if (lang === 'AR') {
    if (category === 'design') return { name: 'قسم التصميم والهوية البصرية', title: 'شعبة تطوير الهوية والشعارات' };
    if (category === 'marketing') return { name: 'قسم التسويق والإعلانات', title: 'شعبة الحملات وإدارة المنصات' };
    return { name: 'القسم التقني والبرمجة', title: 'شعبة تطوير المواقع وتطبيقات الموبايل' };
  } else if (lang === 'TR') {
    if (category === 'design') return { name: 'Görsel Kimlik ve Tasarım Departmanı', title: 'Logo ve Kimlik Geliştirme Bölümü' };
    if (category === 'marketing') return { name: 'Pazarlama ve Reklam Departmanı', title: 'Kampanyalar ve Platform Yönetim Bölümü' };
    return { name: 'Teknik Departman ve Yazılım', title: 'Web ve Mobil Uygulama Geliştirme Bölümü' };
  } else {
    if (category === 'design') return { name: 'Visual Identity & Design Department', title: 'Logo & Branding Division' };
    if (category === 'marketing') return { name: 'Marketing & Advertising Department', title: 'Campaigns & Platform Management' };
    return { name: 'Technical & Coding Department', title: 'Web & Mobile App Development' };
  }
};

const ProjectDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang, user } = useAppContext();
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);
  const [review, setReview] = useState({
    quality: 0,
    speed: 0,
    comm: 0,
    commitment: 0,
    comment: '',
    recommend: true
  });
  const [revisionText, setRevisionText] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isTechnicalView, setIsTechnicalView] = useState(false); // For simulation
  
  const handleDownloadFile = (fileName: string) => {
    const content = `Mock content for file: ${fileName}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const dateLocale = lang === 'AR' ? ar : lang === 'TR' ? tr : enUS;

  // Resolve category from currently active project and packages list
  const pkg = packages.find(p => p.id === project?.package_id);
  const category = pkg ? pkg.category : 'dev';

  useEffect(() => {
    fetch('/api/packages')
      .then(res => res.json())
      .then(data => setPackages(data))
      .catch(err => console.error("Error fetching packages:", err));
  }, []);

  useEffect(() => {
    const storedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    const foundProjectRaw = storedProjects.find((p: any) => p.id === Number(id));
    
    if (foundProjectRaw) {
      const foundProject = getDynamicProject(foundProjectRaw);
      // Save back if dynamic calculation modified progress/status
      if (foundProject.progress !== foundProjectRaw.progress || foundProject.status !== foundProjectRaw.status) {
        const updatedProjects = storedProjects.map((p: any) => p.id === foundProject.id ? foundProject : p);
        localStorage.setItem('projects', JSON.stringify(updatedProjects));
      }

      // Resolve category inside loading effect to prepare dynamic elements
      const activePkg = packages.find(p => p.id === foundProject.package_id);
      const activeCategory = activePkg ? activePkg.category : 'dev';

      const defaultStages = [0, 1, 2].map((idx) => {
        const currentStatus = getStageStatus(idx, foundProject.progress, foundProject.status);
        const stageInfo = getStageInfo(activeCategory, idx, currentStatus, lang);
        return {
          id: (idx + 1).toString(),
          title: stageInfo.title,
          status: currentStatus,
          suggestions: stageInfo.suggestions,
          files: getStageFiles(activeCategory, idx),
          clientApproved: currentStatus === 'completed'
        };
      });

      const dept = getDepartmentInfo(activeCategory, lang);

      const projectData: Project = {
        ...foundProject,
        department: {
          name: dept.name,
          title: dept.title,
          online: true,
          lastSeen: '2024-03-03T10:00:00Z',
          workingHours: '09:00 - 18:00'
        },
        stages: (foundProject.stages && foundProject.stages.length > 0) 
          ? foundProject.stages.map((s: any, idx: number) => {
              const currentStatus = foundProject.status === 'completed' ? 'completed' : s.status;
              const stageInfo = getStageInfo(activeCategory, idx, currentStatus, lang);
              return {
                ...s,
                status: currentStatus,
                clientApproved: foundProject.status === 'completed' ? true : s.clientApproved,
                title: stageInfo.title,
                suggestions: stageInfo.suggestions,
                files: (s.files && s.files.length > 0) ? s.files : getStageFiles(activeCategory, idx)
              };
            })
          : defaultStages,
        files: (foundProject.files && foundProject.files.source_code) ? foundProject.files : {
          source_code: [
            { id: 'sc1', name: 'Backend_Source.zip', url: '#', type: 'document', uploadedBy: 'technical', date: '2024-03-02' }
          ],
          design: [
            { id: 'ds1', name: 'UI_Design_Figma.pdf', url: '#', type: 'document', uploadedBy: 'technical', date: '2024-03-01' }
          ],
          database: [
            { id: 'db1', name: 'Schema_Diagram.png', url: '#', type: 'image', uploadedBy: 'technical', date: '2024-03-02' }
          ],
          others: [
            { id: 'ot1', name: 'API_Documentation.pdf', url: '#', type: 'document', uploadedBy: 'technical', date: '2024-03-02' }
          ],
          client: foundProject.client_files ? foundProject.client_files.map((name: string, i: number) => ({
             id: `cf${i}`, name, url: '#', type: 'document', uploadedBy: 'client', date: new Date().toISOString().split('T')[0]
          })) : []
        },
        chat: foundProject.chat || {
          messages: [
            { id: 'm1', sender: 'technical', text: t('chat_msg_1'), timestamp: '2024-03-03T10:30:00Z', seen: true },
            { id: 'm2', sender: 'client', text: t('chat_msg_2'), timestamp: '2024-03-03T10:32:00Z', seen: true }
          ]
        }
      };
      setProject(projectData);
      if (projectData.status === 'completed') {
        setShowReview(true);
      }
    }
  }, [id, t, lang, packages]);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, project?.chat.messages]);

  if (!project) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">{t('loading')}</div>;

  const handleStartExecution = () => {
    setProject(prev => {
      if (!prev) return null;
      const nextProgress = 10;
      const nextStatus = 'in_progress' as const;
      const nextStages = prev.stages.map((s, idx) => {
        const currentStatus = getStageStatus(idx, nextProgress, nextStatus);
        const stageInfo = getStageInfo(category, idx, currentStatus, lang);
        return {
          ...s,
          status: currentStatus,
          clientApproved: currentStatus === 'completed',
          title: stageInfo.title,
          suggestions: stageInfo.suggestions
        };
      });
      const updated = { ...prev, status: nextStatus, progress: nextProgress, stages: nextStages };
      const stored = JSON.parse(localStorage.getItem('projects') || '[]');
      const updatedStored = stored.map((p: any) => p.id === updated.id ? { ...p, status: nextStatus, progress: nextProgress, stages: nextStages } : p);
      localStorage.setItem('projects', JSON.stringify(updatedStored));
      return updated;
    });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'client',
      text: newMessage,
      timestamp: new Date().toISOString(),
      seen: false
    };
    setProject(prev => prev ? {
      ...prev,
      chat: { ...prev.chat, messages: [...prev.chat.messages, msg] }
    } : null);
    setNewMessage('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newFile: ProjectFile = {
      id: Date.now().toString(),
      name: file.name,
      url: '#',
      type: file.type.startsWith('image/') ? 'image' : 'document',
      uploadedBy: 'client',
      date: new Date().toISOString().split('T')[0]
    };

    const msg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'client',
      text: `أرسل ملفاً: ${file.name}`,
      files: [newFile],
      timestamp: new Date().toISOString(),
      seen: false
    };

    setProject(prev => prev ? {
      ...prev,
      chat: { ...prev.chat, messages: [...prev.chat.messages, msg] }
    } : null);
  };

  const handleApproveStage = (stageId: string) => {
    setProject(prev => {
      if (!prev) return null;
      const currentStageIdx = prev.stages.findIndex(s => s.id === stageId);
      const newStages = prev.stages.map((s, idx) => {
        let newStatus = s.status;
        let approved = s.clientApproved;
        if (s.id === stageId) {
          newStatus = 'completed';
          approved = true;
        } else if (idx === currentStageIdx + 1) {
          newStatus = 'in_progress';
          approved = false;
        }
        const stageInfo = getStageInfo(category, idx, newStatus, lang);
        return { 
          ...s, 
          status: newStatus, 
          clientApproved: approved,
          title: stageInfo.title,
          suggestions: stageInfo.suggestions,
          readyForApproval: idx === currentStageIdx + 1 ? false : s.readyForApproval
        };
      });
      
      const progress = Math.min(100, Math.round(((currentStageIdx + 1) / prev.stages.length) * 100));
      const newStatus = progress === 100 ? 'completed' as const : prev.status;
      
      const finalStages = newStages.map((s, idx) => {
        const finalStatus = newStatus === 'completed' ? 'completed' : s.status;
        const stageInfo = getStageInfo(category, idx, finalStatus, lang);
        return {
          ...s,
          status: finalStatus,
          clientApproved: newStatus === 'completed' ? true : s.clientApproved,
          title: stageInfo.title,
          suggestions: stageInfo.suggestions
        };
      });

      const updated = { 
        ...prev, 
        stages: finalStages,
        progress: progress,
        status: newStatus
      };

      // Persist to localStorage
      const stored = JSON.parse(localStorage.getItem('projects') || '[]');
      const updatedStored = stored.map((p: any) => p.id === updated.id ? { ...p, stages: finalStages, progress: progress, status: newStatus } : p);
      localStorage.setItem('projects', JSON.stringify(updatedStored));
      
      return updated;
    });
    toast.success(t('stage_approved'));
  };

  const handleRequestRevision = () => {
    setShowRevisionModal(false);
    setRevisionText('');
    toast.success(t('revision_submitted'));
  };

  const submitReview = async () => {
    // Mock API call
    console.log('Submitting review:', review);
    
    // Award 50 points
    const storedPoints = Number(localStorage.getItem('userPoints') || 3500);
    const newPoints = storedPoints + 50;
    localStorage.setItem('userPoints', newPoints.toString());

    setShowReview(false);
    toast.success(t('rating_thanks') || 'Thank you for your rating! You got 50 reward points.');
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/projects')}
          className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{project.name}</h1>
            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold">
              #{project.id.toString().padStart(5, '0')}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              project.status === 'in_review' ? 'bg-amber-50 text-amber-600' :
              project.status === 'in_progress' ? 'bg-blue-50 text-blue-600' :
              'bg-emerald-50 text-emerald-600'
            }`}>
              {t(`project_status_${project.status}`)}
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('start_date')}: {format(new Date(project.start_date || new Date()), 'MMMM yyyy', { locale: dateLocale })}</p>
        </div>
        
        {isTechnicalView && user?.role !== 'admin' && project.status === 'in_review' && (
          <button 
            onClick={handleStartExecution}
            className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
          >
            {t('start_execution')}
          </button>
        )}
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        {[
          { id: 'overview', label: t('overview_tab'), icon: FileText },
          { id: 'timeline', label: t('project_tracking'), icon: History },
          { id: 'files', label: t('files_tab'), icon: Download },
          { id: 'chat', label: t('technical_chat'), icon: MessageSquare },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t('project_description_title')}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{project.description || t('no_desc_available')}</p>
                
                <div className="pt-6 border-t border-slate-50 dark:border-slate-800/50">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-4">{t('responsible_department')}</h4>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{project.department.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{project.department.title}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50 dark:border-slate-800/50">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-4">{t('budget')}</h4>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{project.budget ? project.budget.toLocaleString() : '0'} {t('sar')}</p>
                </div>

                <div className="pt-6 border-t border-slate-50 dark:border-slate-800/50">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-4">{t('points_and_discounts')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{t('earned_points')}</p>
                      <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">+{project.earned_points || 0}</p>
                    </div>
                    {project.used_discount && (
                      <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{t('used_discount')}</p>
                        <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300 mt-1">{project.used_discount.code} (-{project.used_discount.discount}%)</p>
                        <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1">-{project.used_discount.points} {t('point')}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50 dark:border-slate-800/50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-900 dark:text-white">{t('progress_percentage')}</h3>
                    {user?.role === 'admin' ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={project.progress} 
                          onChange={(e) => {
                            const newProgress = Number(e.target.value);
                            setProject(prev => {
                              if (!prev) return null;
                              const newStatus = newProgress === 100 ? 'completed' as const : (prev.status === 'completed' ? 'in_progress' as const : prev.status);
                              const newStages = prev.stages.map((s, idx) => {
                                const currentStatus = getStageStatus(idx, newProgress, newStatus);
                                const stageInfo = getStageInfo(category, idx, currentStatus, lang);
                                return {
                                  ...s,
                                  status: currentStatus,
                                  clientApproved: newStatus === 'completed' ? true : (currentStatus === 'completed' ? true : s.clientApproved),
                                  title: stageInfo.title,
                                  suggestions: stageInfo.suggestions
                                };
                              });
                              const updated = { 
                                ...prev, 
                                progress: newProgress,
                                status: newStatus,
                                stages: newStages
                              };
                              const stored = JSON.parse(localStorage.getItem('projects') || '[]');
                              const updatedStored = stored.map((p: any) => p.id === updated.id ? { ...p, progress: newProgress, status: updated.status, stages: newStages } : p);
                              localStorage.setItem('projects', JSON.stringify(updatedStored));
                              return updated;
                            });
                          }}
                          className="w-32 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">{project.progress}%</span>
                      </div>
                    ) : (
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">{project.progress}%</span>
                    )}
                  </div>
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-1000"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50 dark:border-slate-800/50">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-4">
                    {lang === 'AR' ? 'مواصفات الباقة المعتمدة' : lang === 'TR' ? 'Onaylanan Paket Özellikleri' : 'Approved Package Specifications'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {getLocalizedFeatures(category, lang).map((feat, idx) => (
                      <div key={idx} className="p-3 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-xl border border-indigo-100/30 dark:border-indigo-500/10 flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-6">
              {project.stages.map((stage, idx) => (
                <div key={stage.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        stage.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                        stage.status === 'in_progress' ? 'bg-blue-100 text-blue-600 animate-pulse' :
                        'bg-slate-100 text-slate-400'
                      }`}>
                        {stage.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">
                          {stage.title}
                        </h4>
                        <p className="text-xs text-slate-500">{t(`stage_${stage.status}`)}</p>
                      </div>
                    </div>
                    {user?.role === 'admin' ? (
                      <div className="flex flex-col gap-2 items-end border border-slate-100 dark:border-slate-800/80 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{lang === 'AR' ? 'حالة المرحلة:' : 'Stage Status:'}</span>
                          <select 
                            value={stage.status}
                            onChange={(e) => {
                              const newStatus = e.target.value as any;
                              setProject(prev => {
                                if (!prev) return null;
                                const newStages = prev.stages.map((s, idx) => {
                                  if (s.id === stage.id) {
                                    const stageInfo = getStageInfo(category, idx, newStatus, lang);
                                    return { 
                                      ...s, 
                                      status: newStatus,
                                      title: stageInfo.title,
                                      suggestions: stageInfo.suggestions
                                    };
                                  }
                                  return s;
                                });
                                const updated = { ...prev, stages: newStages };
                                const stored = JSON.parse(localStorage.getItem('projects') || '[]');
                                localStorage.setItem('projects', JSON.stringify(stored.map((p: any) => p.id === updated.id ? { ...p, stages: newStages } : p)));
                                return updated;
                              });
                              toast.success(lang === 'AR' ? 'تم تحديث حالة المرحلة' : 'Stage status updated');
                            }}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold py-1 px-2 text-slate-800 dark:text-slate-200 outline-none"
                          >
                            <option value="pending">{t('stage_pending') || 'Pending'}</option>
                            <option value="in_progress">{t('stage_in_progress') || 'In Progress'}</option>
                            <option value="completed">{t('stage_completed') || 'Completed'}</option>
                          </select>
                        </div>
                        
                        {stage.status === 'in_progress' && !stage.clientApproved && (
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input 
                              type="checkbox"
                              checked={!!stage.readyForApproval}
                              onChange={(e) => {
                                const newReady = e.target.checked;
                                setProject(prev => {
                                  if (!prev) return null;
                                  const newStages = prev.stages.map(s => s.id === stage.id ? { ...s, readyForApproval: newReady } : s);
                                  const updated = { ...prev, stages: newStages };
                                  const stored = JSON.parse(localStorage.getItem('projects') || '[]');
                                  localStorage.setItem('projects', JSON.stringify(stored.map((p: any) => p.id === updated.id ? { ...p, stages: newStages } : p)));
                                  return updated;
                                });
                                toast.success(newReady ? (lang === 'AR' ? 'أُرسلت المراجعة للعميل' : 'Sent for client review') : (lang === 'AR' ? 'تم إلغاء المراجعة' : 'Review cancelled'));
                              }}
                              className="w-3.5 h-3.5 rounded text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500 dark:bg-slate-800"
                            />
                            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">
                              {lang === 'AR' ? 'إتاحة للعميل للاعتماد والتقييم' : 'Allow client to approve'}
                            </span>
                          </label>
                        )}
                      </div>
                    ) : (
                      project.status !== 'completed' && stage.status === 'in_progress' && !stage.clientApproved && (
                        stage.readyForApproval ? (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleApproveStage(stage.id)}
                              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors"
                            >
                              {t('approve_stage')}
                            </button>
                            <button 
                              onClick={() => setShowRevisionModal(true)}
                              className="px-4 py-2 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors"
                            >
                              {t('request_stage_revision')}
                            </button>
                          </div>
                        ) : (
                          <div className="px-3.5 py-2 bg-indigo-50/50 dark:bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-indigo-100/30 dark:border-indigo-500/10 shadow-sm">
                            <Clock className="w-3.5 h-3.5 animate-spin shrink-0" />
                            <span>
                              {lang === 'AR' ? 'جاري العمل على هذه المرحلة وتحديثها من قبل الفريق التقني' : lang === 'TR' ? 'Bu aşama teknik ekip tarafından geliştiriliyor' : 'This stage is currently under development by the tech team'}
                            </span>
                          </div>
                        )
                      )
                    )}
                  </div>

                  {stage.suggestions && (
                    <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-500/5 rounded-xl border border-indigo-100 dark:border-indigo-500/10">
                      <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-3 h-3" />
                        {t('stage_suggestions')}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {stage.suggestions}
                      </p>
                    </div>
                  )}

                  {stage.files.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                      <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">{t('technical_dept_files')}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {stage.files.map(file => (
                          <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                              <FileText className="w-4 h-4 text-indigo-600" />
                              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{file.name}</span>
                            </div>
                            <button onClick={() => handleDownloadFile(file.name)} className="p-1.5 text-slate-400 hover:text-indigo-600" title={t('download')}>
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-8">
              {/* Technical Files Categorized */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                  {t('technical_dept_files')}
                </h3>
                
                <div className="space-y-8">
                  {[
                    { key: 'source_code', label: t('source_code_files'), icon: FileText },
                    { key: 'design', label: t('design_files'), icon: Eye },
                    { key: 'database', label: t('database_files'), icon: History },
                    { key: 'others', label: t('other_files'), icon: FileText },
                  ].map((cat) => (
                    <div key={cat.key} className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <cat.icon className="w-3 h-3" />
                        {cat.label}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(project.files as any)[cat.key].map((file: ProjectFile) => (
                          <div key={file.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 group hover:border-indigo-200 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                <FileText className="w-5 h-5 text-indigo-600" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{file.name}</p>
                                <p className="text-xs text-slate-500">{file.date}</p>
                              </div>
                            </div>
                            <button onClick={() => handleDownloadFile(file.name)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all" title={t('download')}>
                              <Download className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                        {(project.files as any)[cat.key].length === 0 && (
                          <p className="text-xs text-slate-400 italic py-2">{t('no_files')}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Client Files */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-600" />
                    {t('client_files')}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.files.client.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 group hover:border-indigo-200 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                          <FileText className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{file.name}</p>
                          <p className="text-xs text-slate-500">{file.date}</p>
                        </div>
                      </div>
                      <button onClick={() => handleDownloadFile(file.name)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all" title={t('download')}>
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  {project.files.client.length === 0 && (
                    <p className="text-xs text-slate-400 italic">{t('no_files')}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-[650px] overflow-hidden">
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <User className="w-7 h-7" />
                    </div>
                    {project.department.online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{project.department.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${project.department.online ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {project.department.online ? t('online_now') : `${t('last_seen')} ${format(new Date(project.department.lastSeen!), 'HH:mm')}`}
                      </span>
                      <span className="text-[10px] text-slate-400">•</span>
                      <span className="text-[10px] text-slate-400">{t('working_hours')}: {project.department.workingHours}</span>
                    </div>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-800/30">
                {project.chat.messages.map((msg, idx) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] space-y-1 ${msg.sender === 'client' ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                        msg.sender === 'client' 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700'
                      }`}>
                        {msg.text}
                        {msg.files && msg.files.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {msg.files.map(f => (
                              <div key={f.id} className={`flex items-center gap-2 p-2 rounded-lg ${msg.sender === 'client' ? 'bg-white/10' : 'bg-slate-50 dark:bg-slate-700'}`}>
                                <FileText className="w-4 h-4" />
                                <span className="text-xs truncate max-w-[150px]">{f.name}</span>
                                <Download className="w-3 h-3 ml-auto cursor-pointer" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-[10px] text-slate-400">
                          {format(new Date(msg.timestamp), 'HH:mm')}
                        </span>
                        {msg.sender === 'client' && (
                          <span className={`text-[10px] font-bold ${msg.seen ? 'text-blue-500' : 'text-slate-300'}`}>
                            {msg.seen ? t('seen') : t('unseen')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                {user?.role === 'admin' ? (
                  <div className="flex items-center justify-center gap-2 py-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 border-dashed text-slate-500 dark:text-slate-400 text-sm font-medium">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <span>
                      {lang === 'AR' 
                        ? 'وضع المشاهدة الآمنة: لا توجد صلاحيات لإرسال رسائل أو تعديل المحادثة الفنية.' 
                        : lang === 'TR' 
                        ? 'Güvenli Gözlem Modu: Teknik sohbete mesaj gönderme yetkiniz bulunmamaktadır.' 
                        : 'Secure Viewer Mode: You do not have permission to send messages or modify the technical chat.'}
                    </span>
                  </div>
                ) : (
                  <div className="flex gap-3 items-center">
                    <label className="p-2 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer">
                      <Paperclip className="w-5 h-5" />
                      <input type="file" className="hidden" onChange={handleFileUpload} />
                    </label>
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder={t('message_placeholder')} 
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white dark:placeholder:text-slate-500"
                    />
                    <button 
                      onClick={handleSendMessage}
                      className="bg-indigo-600 dark:bg-indigo-500 text-white p-3 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          {/* Removed Quick Actions Revision button as requested */}
        </div>
      </div>

      {/* Revision Modal */}
      <AnimatePresence>
        {showRevisionModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg p-8 space-y-6 border border-slate-200 dark:border-slate-800"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('request_revision')}</h2>
                <button onClick={() => setShowRevisionModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('revision_reason')}</label>
                <textarea 
                  value={revisionText}
                  onChange={(e) => setRevisionText(e.target.value)}
                  placeholder={t('write_comment')}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white dark:placeholder:text-slate-500 h-32 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={handleRequestRevision}
                  className="flex-1 bg-indigo-600 dark:bg-indigo-500 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                >
                  {t('send_request')}
                </button>
                <button 
                  onClick={() => setShowRevisionModal(false)}
                  className="px-6 py-3 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  {t('back')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Modal (Existing) */}
      <AnimatePresence>
        {showReview && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg p-8 space-y-6 border border-slate-200 dark:border-slate-800"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 fill-current" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('rate_experience')}</h2>
                <p className="text-slate-500 dark:text-slate-400">{t('project_completed_success')}</p>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'quality', label: t('execution_quality') },
                  { key: 'speed', label: t('speed_rating') },
                  { key: 'comm', label: t('comm_rating') },
                  { key: 'commitment', label: t('commitment_rating') },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star}
                          onClick={() => setReview({ ...review, [item.key]: star })}
                          className={`p-1 transition-colors ${
                            (review as any)[item.key] >= star ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'
                          }`}
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('describe_experience')}</label>
                <textarea 
                  value={review.comment}
                  onChange={(e) => setReview({ ...review, comment: e.target.value })}
                  placeholder={t('write_comment')}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white dark:placeholder:text-slate-500 h-24 resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={review.recommend}
                  onChange={(e) => setReview({ ...review, recommend: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-slate-800 dark:border-slate-700" 
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">{t('recommend_service')}</span>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={submitReview}
                  className="flex-1 bg-indigo-600 dark:bg-indigo-500 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                >
                  {t('send_request')}
                </button>
                <button 
                  onClick={() => setShowReview(false)}
                  className="px-6 py-3 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  {t('later')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectDetail;
