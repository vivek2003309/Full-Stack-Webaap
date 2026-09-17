import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Users, 
  Wrench, 
  HeartPulse, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  Lightbulb, 
  Sparkles, 
  CheckSquare, 
  Layers,
  ArrowRight,
  ShieldCheck,
  Award,
  Download
} from 'lucide-react';
import { Language, translations } from '../translations';

interface CareerGuidanceProps {
  lang: Language;
}

interface TipCard {
  id: string;
  category: 'resume' | 'interview' | 'trade-test' | 'medical';
  title: string;
  titleHi: string;
  badge: string;
  badgeHi: string;
  summary: string;
  summaryHi: string;
  dos: string[];
  dosHi: string[];
  donts: string[];
  dontsHi: string[];
}

const guidanceData: TipCard[] = [
  {
    id: 'cv-format',
    category: 'resume',
    title: 'GCC & Multinational CV Formatting',
    titleHi: 'खाड़ी देश एवं बहुराष्ट्रीय कंपनियों हेतु CV प्रारूप',
    badge: 'Resume Essentials',
    badgeHi: 'रिज्यूमे अनिवार्य',
    summary: 'Foreign HR managers review hundreds of CVs in minutes. Highlight technical specifications, machine models, and GCC client project names prominently.',
    summaryHi: 'विदेशी एचआर प्रतिनिधि कुछ ही मिनटों में सैकड़ों रिज्यूमे देखते हैं। मशीन मॉडल, तकनीकी विनिर्देश और पुराने जीसीसी प्रोजेक्ट के नाम प्रमुखता से लिखें।',
    dos: [
      'Mention exact project names (e.g., ADNOC, Saudi Aramco, PDO Oman, Yamal LNG).',
      'List specific equipment/machines you operated (e.g., Miller 6G TIG/MIG, CAT 320, CNC Lathe).',
      'Clearly state Passport Number, Expiry Date (>8 months validity), and ECR/ECNR status.'
    ],
    dosHi: [
      'प्रोजेक्ट का सही नाम स्पष्ट लिखें (जैसे: ADNOC, Saudi Aramco, PDO Oman, Yamal LNG)।',
      'मशीन या उपकरण का सटीक मॉडल लिखें (जैसे: Miller 6G TIG/MIG, CAT 320, CNC Lathe)।',
      'पासपोर्ट नंबर, वैधता समाप्ति तिथि (>8 माह) और ECR/ECNR श्रेणी अवश्य लिखें।'
    ],
    donts: [
      'Do not submit generic or blurry photocopies without clear contact numbers.',
      'Avoid exaggerating trade experience—delegates conduct practical live tests.'
    ],
    dontsHi: [
      'धुंधली फोटोकॉपी या बिना सक्रिय मोबाइल नंबर वाला अधूरा बायोडाटा न दें।',
      'अनुभव को बढ़ा-चढ़ा कर न लिखें—क्लाइंट टेस्ट बे में व्यावहारिक जांच करते हैं।'
    ]
  },
  {
    id: 'interview-prep',
    category: 'interview',
    title: 'Delegation Face-to-Face Interview Protocol',
    titleHi: 'विदेशी प्रतिनिधिमंडल प्रत्यक्ष साक्षात्कार नियम',
    badge: 'Interview Strategy',
    badgeHi: 'साक्षात्कार रणनीति',
    summary: 'Visiting delegates value discipline, safety consciousness (HSE mindset), and honesty regarding your prior field duties and tooling expertise.',
    summaryHi: 'विदेशी प्रतिनिधि सुरक्षा जागरूकता (HSE), समय की पाबंदी और आपके काम करने के वास्तविक कौशल को सबसे अधिक महत्व देते हैं।',
    dos: [
      'Arrive 30 minutes early in neat formal or clean trade-appropriate clothing.',
      'Familiarize yourself with basic trade terms in English (e.g., Tolerance, Beveling, Hazard, Earthing).',
      'Demonstrate a safety-first mindset (HSE, Lockout/Tagout, PPE compliance).'
    ],
    dosHi: [
      'साक्षात्कार समय से 30 मिनट पूर्व साफ-सुथरे कपड़ों में केंद्र पर पहुंचें।',
      'अंग्रेजी में अपने ट्रेड से जुड़े बुनियादी शब्दों का अभ्यास करें (जैसे: Beveling, Hazard, PPE)।',
      'सुरक्षा नियमों (HSE) और कार्यस्थल सावधानी को प्राथमिकता दें।'
    ],
    donts: [
      'Never argue with the technical evaluator or give evasive answers.',
      'Do not carry mobile phones into the live interview or testing cubicle.'
    ],
    dontsHi: [
      'तकनीकी परीक्षक से बहस न करें और किसी प्रश्न का बनावटी उत्तर न दें।',
      'इंटरव्यू रूम या टेस्ट बे के अंदर मोबाइल फोन का उपयोग न करें।'
    ]
  },
  {
    id: 'trade-test-tips',
    category: 'trade-test',
    title: 'Practical Trade Bay & Workshop Test',
    titleHi: 'प्रैक्टिकल ट्रेड टेस्ट एवं वर्कशॉप मूल्यांकन',
    badge: 'Workshop Bay Test',
    badgeHi: 'वर्कशॉप प्रैक्टिकल टेस्ट',
    summary: 'The practical test is the decisive factor for Gulf and European selection. Evaluators grade edge preparation, precision, and tool care.',
    summaryHi: 'प्रैक्टिकल टेस्ट विदेश चयन का सबसे निर्णायक चरण है। परीक्षक आपके कार्य की सफाई, माप की शुद्धता और औजारों के उपयोग को जांचते हैं।',
    dos: [
      'Inspect your machine, cables, and earthing before starting the timed test piece.',
      'Wear complete PPE (Safety Helmet, Steel-Toe Shoes, Welding Goggles/Gloves).',
      'Clean your finished test weld/joint with wire brush and ensure zero spatter.'
    ],
    dosHi: [
      'काम शुरू करने से पहले मशीन, केबल और अर्थिंग की जांच करें।',
      'पूरा पीपीई (सेफ्टी हेलमेट, सेफ्टी शूज, वेल्डिंग ग्लास, ग्लव्स) अनिवार्य पहनें।',
      'तैयार पीस को वायर ब्रश से साफ करें और स्लैग/स्पैटर पूरी तरह हटाएं।'
    ],
    donts: [
      'Never bypass machine safety guards or rush through the edge preparation.',
      'Do not leave scrap metal or hot electrodes on the workshop floor.'
    ],
    dontsHi: [
      'सुरक्षा गार्ड हटाकर काम न करें और फिटिंग में जल्दबाजी न दिखाएं।',
      'वर्कशॉप में गर्म इलेक्ट्रोड या लोहे के टुकड़े फर्श पर बिखरे न छोड़ें।'
    ]
  },
  {
    id: 'medical-emigrate',
    category: 'medical',
    title: 'GAMCA Medical & e-Migrate Readiness',
    titleHi: 'GAMCA मेडिकल एवं ई-माइग्रेट (e-Migrate) तैयारी',
    badge: 'Clearance & Health',
    badgeHi: 'मेडिकल एवं सरकारी क्लीयरेंस',
    summary: 'Securing a Gulf or Russian visa requires unblemished GAMCA medical fitness and official Ministry of External Affairs clearance.',
    summaryHi: 'खाड़ी या रूसी वीजा के लिए GAMCA मेडिकल में पूर्ण स्वस्थ होना और विदेश मंत्रालय से वैध ई-माइग्रेट क्लीयरेंस आवश्यक है।',
    dos: [
      'Maintain stable blood pressure, clear chest X-ray habits, and adequate hydration.',
      'Ensure your original passport has at least 2 blank visa pages and 8+ months validity.',
      'Complete the mandatory 1-day Pre-Departure Orientation Training (PDOT) certificate.'
    ],
    dosHi: [
      'ब्लड प्रेशर सामान्य रखें, पर्याप्त पानी पिएं और चेस्ट एक्स-रे के लिए स्वस्थ रहें।',
      'पासपोर्ट में कम से कम 2 खाली पन्ने और 8 महीने से अधिक की वैधता सुनिश्चित करें।',
      'ईसीआर पासपोर्ट धारक पूर्व-प्रस्थान प्रशिक्षण (PDOT) प्रमाण पत्र प्राप्त करें।'
    ],
    donts: [
      'Never take unprescribed quick-fix medicines right before the blood test.',
      'Never pay cash to unauthorized middlemen for medical slips or visa stamps.'
    ],
    dontsHi: [
      'मेडिकल टेस्ट से ठीक पहले बिना डॉक्टर की सलाह के कोई दवा न लें।',
      'मेडिकल स्लिप या वीजा के नाम पर किसी अनाधिकृत दलाल को नकद पैसे न दें।'
    ]
  }
];

const checklistItems = [
  { id: 'chk-pass', labelEn: 'Original Passport with 8+ months validity and 2 blank pages', labelHi: 'मूल पासपोर्ट (8+ माह वैधता एवं 2 खाली पन्ने)' },
  { id: 'chk-cv', labelEn: '4 printed copies of updated CV highlighting machine & project details', labelHi: 'अद्यतन बायोडाटा की 4 प्रिंट प्रतियां (मशीन व प्रोजेक्ट विवरण सहित)' },
  { id: 'chk-photo', labelEn: '10 passport-size photos with clear white background (4x6 cm)', labelHi: 'सफेद बैकग्राउंड वाली 10 पासपोर्ट साइज फोटो (4x6 सेमी)' },
  { id: 'chk-cert', labelEn: 'Original ITI/Diploma certificates & previous Gulf experience letters', labelHi: 'मूल आईटीआई/डिप्लोमा एवं पिछले खाड़ी देश अनुभव प्रमाण पत्र' },
  { id: 'chk-ppe', labelEn: 'Safety shoes & comfortable trade attire for workshop test bays', labelHi: 'प्रैक्टिकल टेस्ट के लिए सेफ्टी शूज एवं उपयुक्त कामगार कपड़े' },
  { id: 'chk-docs', labelEn: 'Government photo ID (Aadhaar / Voter ID) + GAMCA slip if already done', labelHi: 'सरकारी पहचान पत्र (आधार कार्ड) एवं पूर्व मेडिकल रिपोर्ट (यदि उपलब्ध हो)' },
];

export const CareerGuidance: React.FC<CareerGuidanceProps> = ({ lang }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'resume' | 'interview' | 'trade-test' | 'medical'>('all');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    'chk-pass': true,
    'chk-cv': true,
  });

  const t = translations[lang] || translations.en;
  const isHi = lang === 'hi';

  const toggleChecklist = (id: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = checklistItems.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const filteredCards = selectedCategory === 'all' 
    ? guidanceData 
    : guidanceData.filter(item => item.category === selectedCategory);

  const categories = [
    { id: 'all', label: isHi ? 'सभी विषय' : 'All Guidance', icon: Layers },
    { id: 'resume', label: isHi ? 'रिज्यूमे व CV' : 'Resume & CV', icon: FileText },
    { id: 'interview', label: isHi ? 'क्लाइंट इंटरव्यू' : 'Client Interview', icon: Users },
    { id: 'trade-test', label: isHi ? 'ट्रेड टेस्ट बे' : 'Trade Test Bay', icon: Wrench },
    { id: 'medical', label: isHi ? 'GAMCA व मेडिकल' : 'GAMCA & Medical', icon: HeartPulse },
  ];

  return (
    <section id="career-guidance" className="py-20 bg-slate-50 dark:bg-slate-950/60 border-y border-slate-200/80 dark:border-slate-800 relative overflow-hidden transition-colors duration-200">
      
      {/* Decorative background blurs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 text-xs font-bold uppercase tracking-wider mb-3">
            <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{t.guidanceBadge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F2444] dark:text-white tracking-tight font-['Space_Grotesk']">
            {t.guidanceTitle}
          </h2>
          
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            {t.guidanceSubtitle}
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="flex items-center justify-center flex-wrap gap-2 mb-10"
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0F2444] dark:bg-amber-400 text-white dark:text-slate-950 shadow-md scale-105'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400 dark:text-slate-950' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Guidance Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {filteredCards.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: idx * 0.08, ease: "easeOut" }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-sm hover:shadow-lg dark:shadow-slate-950/60 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top Badge & Category */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 uppercase tracking-wide">
                    {isHi ? card.badgeHi : card.badge}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                    Trehan Technical Standards
                  </span>
                </div>

                {/* Title & Summary */}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 font-['Space_Grotesk']">
                  {isHi ? card.titleHi : card.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
                  {isHi ? card.summaryHi : card.summary}
                </p>

                {/* Do's List */}
                <div className="mb-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{isHi ? 'क्या करें (Recommended Best Practices)' : 'Recommended Best Practices'}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {(isHi ? card.dosHi : card.dos).map((doItem, dIdx) => (
                      <li key={dIdx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 leading-relaxed">
                        <span className="text-emerald-500 font-bold shrink-0 mt-0.5">•</span>
                        <span>{doItem}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Don'ts List */}
                <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>{isHi ? 'क्या न करें (Common Mistakes to Avoid)' : 'Common Mistakes to Avoid'}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {(isHi ? card.dontsHi : card.donts).map((dontItem, dtIdx) => (
                      <li key={dtIdx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 leading-relaxed">
                        <span className="text-rose-500 font-bold shrink-0 mt-0.5">•</span>
                        <span>{dontItem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </motion.div>
          ))}
        </div>

        {/* Interactive Walk-In Day Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
                <CheckSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{isHi ? 'वॉक-इन ड्राइव चेकलिस्ट' : 'Walk-In Drive Document Readiness'}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                {isHi ? 'इंटरव्यू के दिन साथ लाने योग्य आवश्यक दस्तावेज' : 'Documents & Gear to Carry on Interview Day'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                {isHi ? 'परीक्षण में जाने से पहले अपनी तैयारी जांच लें।' : 'Check off each item before arriving at the New Delhi or Mumbai center.'}
              </p>
            </div>

            {/* Progress Badge */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/80 min-w-[240px]">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                <span>{isHi ? 'दस्तावेज तैयारी' : 'Readiness Score'}</span>
                <span className="text-amber-600 dark:text-amber-400 font-extrabold">{completedCount} / {totalCount} ({progressPercent}%)</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Checklist Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-6">
            {checklistItems.map((chk) => {
              const isChecked = !!checkedItems[chk.id];
              return (
                <div
                  key={chk.id}
                  onClick={() => toggleChecklist(chk.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                    isChecked
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60 text-slate-900 dark:text-white'
                      : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isChecked
                      ? 'bg-emerald-600 text-white'
                      : 'border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                  }`}>
                    {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <span className={`text-xs sm:text-sm font-medium leading-relaxed ${isChecked ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                    {isHi ? chk.labelHi : chk.labelEn}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Help note */}
          <div className="mt-6 p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                {isHi 
                  ? 'निःशुल्क मार्गदर्शन: किसी भी ट्रेड टेस्ट या रिज्यूमे प्रारूप सहायता के लिए हमारे हेल्पलाइन +91 99100 44590 पर संपर्क करें।' 
                  : 'Free Preparation Support: Need CV templates or trade-specific practice advice? Call our counseling desk at +91 99100 44590.'}
              </span>
            </div>
            <a 
              href="#active-jobs"
              className="font-bold text-amber-800 dark:text-amber-300 hover:underline shrink-0 inline-flex items-center gap-1"
            >
              <span>{isHi ? 'खुली नौकरियां देखें' : 'View Open Jobs'}</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>

        </motion.div>

      </div>
    </section>
  );
};
