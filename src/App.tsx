import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const PRICE_BY_THICKNESS: Record<number, number> = {
  1: 840, // 20 мм
  2: 990  // 30 мм
};

const WEIGHT_MATRIX: Record<number, number> = {
  1: 16, 
  2: 24   
};

const PALLET_CAPACITY_MATRIX: Record<number, number> = {
  1: 60, 
  2: 40  
};

const COLORS = [
  { id: 'black', hex: '#1a1a1a' },
  { id: 'graphite', hex: '#3d3d3d' },
  { id: 'green', hex: '#294d24' },
];

export default function App() {
  const { t, i18n } = useTranslation();

  const [path, setPath] = useState<string>(window.location.pathname);
  const [area, setArea] = useState<number>(20);
  const [thickness, setThickness] = useState<number>(2);
  const [selectedColor, setSelectedColor] = useState<string>('black');
  const [baseType, setBaseType] = useState<string>('concrete'); 
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  const [phone, setPhone] = useState<string>('');
  const [footerPhone, setFooterPhone] = useState<string>('');

  // UTM parameters capture for analytics
  const [utmSource] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('utm_source') || 'direct';
    }
    return 'direct';
  });

  const [utmCampaign] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('utm_campaign') || 'organic';
    }
    return 'organic';
  });

  const [activityIndex, setActivityIndex] = useState(0);

  const activities = (t('header.ticker', { returnObjects: true }) as string[]) || [];
  const faqs = (t('faq.items', { returnObjects: true }) as Array<{ q: string, a: string }>) || [];
  const stepsItems = (t('steps.items', { returnObjects: true }) as Array<{ step: string, title: string, desc: string }>) || [];

  // Routing Effect: Sync language and page state from URL pathname
  useEffect(() => {
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      setPath(currentPath);
      const currentLang = currentPath.startsWith('/ru') ? 'ru' : 'uk';
      if (i18n.language !== currentLang) {
        i18n.changeLanguage(currentLang);
      }
    };

    handlePopState();

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [i18n]);

  useEffect(() => {
    if (activities.length > 0) {
      const interval = setInterval(() => {
        setActivityIndex((prev) => (prev + 1) % activities.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [activities.length]);

  const getThicknessMm = (level: number) => level === 1 ? '20 мм' : '30 мм';
  const pricePerMeter = PRICE_BY_THICKNESS[thickness] || 990;
  const total = area * pricePerMeter;
  
  const weightPerMeter = WEIGHT_MATRIX[thickness] || 24; 
  const totalWeightKg = area * weightPerMeter;
  
  const palletsNeeded = Math.ceil(area / PALLET_CAPACITY_MATRIX[thickness]);

  const handleThicknessChange = (id: number) => {
    setThickness(id);
    if (id === 1 && baseType === 'ground') setBaseType('concrete');
  };

  const handleBaseTypeChange = (id: string) => {
    setBaseType(id);
    if (id === 'ground' && thickness === 1) setThickness(2);
  };

  // Custom Phone Masking Logic
  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    
    // Clear field completely if the only digits are the "+38" prefix digits
    if (digits === '38' || digits === '3' || digits === '') {
      return '';
    }
    
    let local = digits;
    if (digits.startsWith('380')) {
      local = digits.slice(2); // slice off "38" to make it "0..."
    } else if (digits.startsWith('80') && digits.length > 2) {
      local = '0' + digits.slice(2); // replace "80..." with "0..."
    } else if (!digits.startsWith('0')) {
      local = '0' + digits; // prepend '0' if they type without it
    }
    
    // Cap at 10 digits
    local = local.slice(0, 10);
    
    const part0 = local.slice(0, 3); // 0XX
    const part1 = local.slice(3, 6); // XXX
    const part2 = local.slice(6, 8); // XX
    const part3 = local.slice(8, 10); // XX
    
    if (local.length === 0) return '';
    if (local.length <= 3) return `+38 (${part0}`;
    if (local.length <= 6) return `+38 (${part0}) ${part1}`;
    if (local.length <= 8) return `+38 (${part0}) ${part1}-${part2}`;
    return `+38 (${part0}) ${part1}-${part2}-${part3}`;
  };


  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const formatted = formatPhoneNumber(e.target.value);
    setter(formatted);
  };

  const validateUkrainianPhone = (phoneStr: string) => {
    const cleaned = phoneStr.replace(/\D/g, '');
    return /^(38)?0\d{9}$/.test(cleaned);
  };

  const handleLeadSubmit = (messenger: 'Telegram' | 'Viber', formType: 'Замовлення' | 'Зразок' | 'Опт' = 'Замовлення', isFooter = false) => {
    const currentPhone = isFooter ? footerPhone : phone;
    if (!currentPhone.trim()) return alert(t('validation.enterPhone'));
    if (!validateUkrainianPhone(currentPhone)) return alert(t('validation.invalidPhone'));
    
    const colorName = t(`colors.${selectedColor}`);
    
    // Формуємо текст повідомлення
    let messageText = '';
    
    if (formType === 'Зразок') {
      messageText = `📦 <b>${t('payload.sampleRequest')}</b>\n\n` +
                    `📱 <b>${t('payload.phone')}:</b> ${currentPhone}\n` +
                    `💬 <b>${t('payload.messenger')}:</b> ${messenger}\n\n` +
                    `<i>${t('payload.sampleNote')}</i>`;
    } else if (formType === 'Опт') {
      messageText = `🤝 <b>${t('payload.coopRequest')}</b>\n\n` +
                    `📱 <b>${t('payload.phone')}:</b> ${currentPhone}\n` +
                    `💬 <b>${t('payload.messenger')}:</b> ${messenger}\n\n` +
                    `<i>${t('payload.coopNote')}</i>`;
    } else {
      messageText = `🔥 <b>${t('payload.orderRequest')}</b>\n\n` +
                    `📱 <b>${t('payload.phone')}:</b> ${currentPhone}\n` +
                    `💬 <b>${t('payload.messenger')}:</b> ${messenger}\n\n` +
                    `📐 <b>${t('payload.area')}:</b> ${area} м²\n` +
                    `📐 <b>${t('payload.thickness')}:</b> ${getThicknessMm(thickness)}\n` +
                    `🎨 <b>${t('payload.color')}:</b> ${colorName}\n` +
                    `🏗️ <b>${t('payload.base')}:</b> ${baseType === 'concrete' ? t('payload.baseConcrete') : t('payload.baseGround')}\n` +
                    `💰 <b>${t('payload.cost')}:</b> ${total.toLocaleString('uk-UA')} ₴`;
    }

    // Додаємо UTM-мітки для аналітики
    messageText += `\n\n📊 <b>${t('payload.analytics')}</b>\n` +
                   `🔸 <b>Source:</b> ${utmSource}\n` +
                   `🔸 <b>Campaign:</b> ${utmCampaign}`;

    const redirectToThankYou = () => {
      const targetThankYouPath = i18n.language.startsWith('ru') ? '/ru/thank-you' : '/thank-you';
      window.history.pushState({}, '', targetThankYouPath);
      setPath(targetThankYouPath);
      
      // Reset fields
      setPhone('');
      setFooterPhone('');
    };

    // Відправка
    if (messenger === 'Telegram') {
      const TELEGRAM_TOKEN = "8738176172:AAGmNEziZBwzwV1Lfd0j2cLukMzExGCT6g4";
      const CHAT_ID = "1142060901";
      const URI_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

      fetch(URI_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: messageText,
          parse_mode: 'HTML'
        })
      })
      .then(response => {
        if (response.ok) {
          redirectToThankYou();
        } else {
          alert(t('notifications.telegramError'));
        }
      })
      .catch(error => {
        console.error("Помилка мережі:", error);
        alert(t('notifications.networkError'));
      });

    } else if (messenger === 'Viber') {
      const BOSS_VIBER_PHONE = "380632923975"; 
      const cleanTextForViber = messageText.replace(/<\/?[^>]+(>|$)/g, "");
      const encodedText = encodeURIComponent(cleanTextForViber);
      const viberUrl = `viber://chat?number=${BOSS_VIBER_PHONE}&draft=${encodedText}`;
      window.location.href = viberUrl;
      redirectToThankYou();
      alert(t('notifications.viberOpenAlert'));
    }
  };

  const currentColorObj = COLORS.find(c => c.id === selectedColor) || COLORS[0];
  const imageFileName = `/${selectedColor}_${thickness === 1 ? '20' : '30'}.jpg`;

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
    
    const currentHash = window.location.hash;
    const currentPath = window.location.pathname;
    
    if (lng === 'ru') {
      if (!currentPath.startsWith('/ru')) {
        const nextPath = currentPath.startsWith('/thank-you') ? '/ru/thank-you' : '/ru';
        window.history.pushState({}, '', nextPath + currentHash);
        setPath(nextPath);
      }
    } else {
      if (currentPath.startsWith('/ru')) {
        const nextPath = currentPath.startsWith('/ru/thank-you') ? '/thank-you' : '/';
        window.history.pushState({}, '', nextPath + currentHash);
        setPath(nextPath);
      }
    }
  };

  const isThankYouPage = path === '/thank-you' || path === '/ru/thank-you' || path.endsWith('/thank-you');

  // RENDER THANK YOU PAGE
  if (isThankYouPage) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased flex flex-col justify-between selection:bg-blue-600 selection:text-white">
        {/* HEADER Ticker */}
        <div className="hidden md:block bg-blue-700 text-white text-sm font-semibold py-2.5 px-4 text-center shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <span className="inline-block animate-pulse text-blue-200">⚡</span>
            <span className="transition-all duration-500 font-medium tracking-wide">
              {activities[activityIndex] || '...'}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow flex items-center justify-center p-4 py-16 relative overflow-hidden bg-slate-900">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
          
          <div className="max-w-xl w-full bg-slate-950/60 backdrop-blur-md p-8 md:p-12 rounded-[2rem] border border-white/10 text-center shadow-2xl relative z-10 transform hover:scale-[1.01] transition-transform duration-500">
            {/* Animated Checkmark Badge */}
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-blue-500/30 animate-[pulse_2s_infinite]">
              <span className="text-white text-4xl font-black">✓</span>
            </div>

            <div className="inline-block bg-blue-500/20 text-blue-300 border border-blue-400/30 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              {t('thankYou.badge')}
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-6 leading-tight drop-shadow-md">
              {t('thankYou.title')}
            </h1>

            <p className="text-slate-300 text-base md:text-lg font-medium leading-relaxed mb-10 max-w-md mx-auto">
              {t('thankYou.desc')}
            </p>

            <button 
              type="button"
              onClick={() => {
                const homePath = i18n.language.startsWith('ru') ? '/ru' : '/';
                window.history.pushState({}, '', homePath);
                setPath(homePath);
              }}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-base font-black py-4 px-8 rounded-2xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] transform active:scale-95 border border-blue-400/40"
            >
              {t('thankYou.btnBack')}
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-slate-950 text-white py-6 px-4 text-center border-t border-slate-900 text-xs text-slate-500">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="font-medium">{t('footer.copyright')}</div>
            <div className="font-bold text-slate-600 text-blue-900/50">White-Label Engine v4.15</div>
          </div>
        </footer>
      </div>
    );
  }

  // RENDER LANDING PAGE
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased selection:bg-blue-600 selection:text-white scroll-smooth">
      
      {/* HEADER Ticker */}
      <div className="hidden md:block bg-blue-700 text-white text-sm font-semibold py-2.5 px-4 text-center sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="inline-block animate-pulse text-blue-200">⚡</span>
          <span className="transition-all duration-500 font-medium tracking-wide">
            {activities[activityIndex] || '...'}
          </span>
        </div>
      </div>

      <header className="max-w-7xl mx-auto px-2 sm:px-6 py-5 flex justify-between items-center bg-transparent relative z-20">
        
        {/* ФІРМОВИЙ ЛОГОТИП */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="relative w-9 h-9 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
            <div className="absolute w-5 h-5 bg-[#3B82F6] rounded-[3px] transform rotate-45 -translate-x-1.5 shadow-sm"></div>
            <div className="absolute w-5 h-5 bg-[#1E3A8A] rounded-[3px] transform rotate-45 translate-x-1.5 shadow-md opacity-95 border border-white/10"></div>
          </div>
          <span className="font-black text-2xl tracking-tight text-slate-900 drop-shadow-sm uppercase">
            EURO<span className="text-blue-600">GUMA</span>
          </span>
        </div>

        <div className="hidden lg:flex gap-8 text-sm font-bold text-slate-600 bg-white/80 px-6 py-2.5 rounded-full backdrop-blur-md shadow-sm border border-slate-200/50">
          <a href="#applications" className="hover:text-blue-600 transition-colors">{t('header.nav.applications')}</a>
          <a href="#calculator" className="hover:text-blue-600 transition-colors">{t('header.nav.calculator')}</a>
          <a href="#gallery" className="hover:text-blue-600 transition-colors">{t('header.nav.gallery')}</a>
          <a href="#specs" className="hover:text-blue-600 transition-colors">{t('header.nav.specs')}</a>
        </div>

        <div className="flex gap-1.5 sm:gap-3 items-center">
          {/* LANGUAGE SWITCHER */}
          <div className="flex bg-white/95 border border-slate-200 rounded-xl p-1 shadow-sm text-[11px] font-black gap-0.5">
            <button 
              type="button"
              onClick={() => changeLanguage('uk')}
              className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg transition-all ${
                i18n.language.startsWith('uk')
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              UA
            </button>
            <button 
              type="button"
              onClick={() => changeLanguage('ru')}
              className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg transition-all ${
                i18n.language.startsWith('ru')
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              RU
            </button>
          </div>

          <button 
            type="button"
            onClick={() => document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' })}
            className="hidden md:block bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
          >
            {t('header.cooperation')}
          </button>
          
          <a href="tel:+380632923975" className="bg-slate-900 hover:bg-blue-600 text-white p-2.5 sm:px-5 sm:py-2 rounded-xl transition-all shadow-lg active:scale-95 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1.5 sm:gap-2 text-sm font-bold">
              <span>📞</span> <span className="hidden sm:inline">(063) 292-39-75</span>
            </div>
            <div className="hidden sm:block text-[9px] text-blue-300 font-medium uppercase tracking-wider mt-0.5">{t('header.bossLine')}</div>
          </a>
        </div>
      </header>

      {/* 🚀 HERO */}
      <section className="relative w-full pt-8 pb-8 md:pt-20 md:pb-32 px-4 text-center md:min-h-[75vh] flex flex-col justify-center border-b border-slate-900 overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transform scale-105 animate-[pulse_20s_ease-in-out_infinite]"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-slate-950/95"></div>

        <div className="relative z-10 max-w-5xl mx-auto space-y-8 mt-4">
          <div className="inline-flex items-center gap-2 bg-slate-800/80 backdrop-blur-md text-blue-400 px-5 py-2 rounded-full text-xs font-black border border-slate-700/50 uppercase tracking-widest shadow-2xl">
            {t('hero.tag')}
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight max-w-5xl mx-auto drop-shadow-2xl">
            {t('hero.title1')} <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">{t('hero.title2')}</span>
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto font-medium leading-relaxed drop-shadow-md">
            {t('hero.desc')}
          </p>
          <div className="pt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button 
              type="button"
              onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white text-base md:text-lg font-black px-10 py-5 rounded-2xl shadow-[0_0_40px_rgba(37,99,235,0.4)] transform hover:-translate-y-1 transition-all border border-blue-400/50 tracking-wide"
            >
              {t('hero.btnCalc')}
            </button>
            <button 
              type="button"
              onClick={() => document.getElementById('sample')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-base md:text-lg font-black px-10 py-5 rounded-2xl transition-all border border-white/20 shadow-xl"
            >
              {t('hero.btnSample')}
            </button>
          </div>
        </div>
      </section>

      {/* КОМПАКТНИЙ PREMIUM КАЛЬКУЛЯТОР */}
      <section id="calculator" className="bg-slate-900 py-16 px-4 relative overflow-hidden border-t border-slate-800">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>

        <div className="max-w-6xl mx-auto text-center mb-16 relative z-10">
          <div className="inline-block bg-white/5 backdrop-blur-sm text-blue-300 border border-white/10 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest mb-4">{t('calc.badge')}</div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white drop-shadow-md">{t('calc.heading')}</h2>
        </div>

        <div className="max-w-6xl mx-auto bg-slate-100 rounded-[2rem] shadow-2xl overflow-hidden grid lg:grid-cols-12 border border-slate-200 relative z-10 p-2 md:p-3">
          
          <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-1.5 px-4 text-center text-xs md:text-sm font-black rounded-full shadow-md z-10 flex items-center justify-center gap-2">
            <span>🔥</span>
            <span>{t('calc.ticker')}</span>
          </div>

          <div className="lg:col-span-7 p-6 md:p-8 space-y-6 mt-8">
            
            {/* Карточка 1: Визуализация и Цвет */}
            <div className="bg-white p-5 rounded-2xl shadow-lg border border-slate-100">
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{t('calc.visualCard')}</div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                   
                   {/* БЛОК ЖИВИХ ФОТО */}
                   <div 
                    className="w-full h-48 rounded-xl shadow-inner border border-black/10 relative overflow-hidden group"
                    style={{ backgroundColor: currentColorObj.hex }}
                  >
                    {/* Текстова заглушка (видно, якщо немає фото) */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60 font-bold z-0 mix-blend-overlay pointer-events-none">
                        <span className="text-[10px] uppercase tracking-widest mb-1">{t('calc.photoPlaceholder')}</span>
                        <span className="text-sm">{t(`colors.${currentColorObj.id}`)} {thickness === 1 ? '20мм' : '30мм'}</span>
                    </div>
                    
                    {/* Шум для текстури (видно, якщо немає фото) */}
                    <div className="absolute inset-0 opacity-[0.35] mix-blend-multiply pointer-events-none z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-black/30 pointer-events-none z-0"></div>

                    {/* Саме фото (перекриє заглушку, якщо файл існує) */}
                    <img 
                      src={imageFileName} 
                      alt={`Плитка ${t(`colors.${currentColorObj.id}`)} ${thickness === 1 ? '20мм' : '30мм'}`}
                      className="w-full h-full object-cover relative z-10"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {COLORS.map((c) => (
                      <button
                        key={c.id} type="button" onClick={() => setSelectedColor(c.id)}
                        className={`h-16 rounded-xl transition-all flex flex-col items-center justify-center relative overflow-hidden ${
                          selectedColor === c.id ? 'ring-4 ring-blue-500/50 scale-105 z-10 shadow-lg' : 'ring-1 ring-slate-300 hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={t(`colors.${c.id}`)}
                      >
                        <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
                        {selectedColor === c.id && <span className="text-white drop-shadow-md text-sm font-black relative z-10">✓</span>}
                        <span className={`text-[9px] font-bold mt-1 relative z-10 ${c.id === 'green' ? 'text-white' : 'text-slate-400'}`}>{t(`colors.${c.id}`)}</span>
                      </button>
                    ))}
                  </div>
               </div>
            </div>

            {/* Карточка 2: Метрики с умной логикой */}
            <div className="bg-white p-5 rounded-2xl shadow-lg border border-slate-100 space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">{t('calc.areaLabel')}</label>
                    <span className="text-sm font-black text-blue-600 bg-blue-50 px-4 py-1 rounded-lg border border-blue-100 shadow-inner">{area} м²</span>
                  </div>
                  <input 
                    type="range" min="5" max="300" value={area} 
                    onChange={(e) => setArea(Number(e.target.value))}
                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">{t('calc.thicknessLabel')}</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 1, label: '20 мм' },
                          { id: 2, label: '30 мм' }
                        ].map((tVal) => (
                          <button
                            key={tVal.id} type="button" onClick={() => handleThicknessChange(tVal.id)}
                            className={`w-full py-2.5 rounded-lg border text-center transition-all ${
                              thickness === tVal.id ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-500/30' : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <span className="text-xs font-black">{tVal.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">{t('calc.baseLabel')}</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'concrete', label: t('calc.baseConcrete') },
                          { id: 'ground', label: t('calc.baseGround') }
                        ].map((b) => (
                          <button
                            key={b.id} type="button" onClick={() => handleBaseTypeChange(b.id)}
                            className={`w-full py-2.5 rounded-lg border text-center transition-all ${
                              baseType === b.id ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-500/30' : 'border-slate-200 text-slate-500 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <span className="text-xs font-black">{b.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                </div>
                
                {/* Підказка експерта */}
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-[10px] text-slate-500 font-medium leading-relaxed">
                  <span className="font-bold text-blue-600">💡 {i18n.language.startsWith('uk') ? 'Зверніть увагу:' : 'Обратите внимание:'}</span> {t('calc.expertNote')}
                </div>
            </div>

          </div>

          {/* Правая сторона: Премиум темная с глубоким градиентом */}
          <div className="p-6 md:p-8 lg:p-10 text-white rounded-[1.5rem] lg:rounded-l-none lg:col-span-5
                          bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950
                          shadow-[0_0_60px_-15px_rgba(59,130,246,0.3)]
                          flex flex-col justify-between mt-8 lg:mt-0 relative overflow-hidden">
            
            <div className="space-y-6 z-10 relative">
              
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl transform hover:scale-[1.02] transition-all">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">{t('calc.totalCost')}</span>
                  <span className="bg-green-500/20 text-green-400 border border-green-400/50 px-3 py-1 rounded-md text-sm md:text-base font-black uppercase tracking-widest shadow-[0_0_20px_rgba(74,222,128,0.4)]">
                    {pricePerMeter} {t('calc.pricePerMeter')}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold text-white tracking-tight drop-shadow-md">{total.toLocaleString('uk-UA')}</span>
                  <span className="text-xl text-blue-400 font-extrabold">{t('calc.uah')}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-2">{t('calc.factoryPriceNote')}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl shadow-inner border border-slate-100 flex items-center gap-3">
                      <div className="text-2xl text-blue-600">⚖️</div>
                      <div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t('calc.weightLabel')}</div>
                          <div className="text-base font-black text-slate-900">{totalWeightKg.toLocaleString('uk-UA')} <span className="text-xs">{t('calc.kg')}</span></div>
                      </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-inner border border-slate-100 flex items-center gap-3">
                      <div className="text-2xl text-blue-600">📦</div>
                      <div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t('calc.volumeLabel')}</div>
                          <div className="text-base font-black text-slate-900">{palletsNeeded} <span className="text-xs">{t('calc.pallets')}</span></div>
                      </div>
                  </div>
              </div>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 shadow-xl space-y-3 relative z-10 mt-8">
              <h4 className="text-[11px] font-black text-white text-center uppercase tracking-wider mb-2">{t('calc.orderDirect')}</h4>
              <input 
                type="tel" placeholder={t('calc.phonePlaceholder')} value={phone} onChange={(e) => handlePhoneChange(e, setPhone)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner"
              />
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button type="button" onClick={() => handleLeadSubmit('Telegram')} className="bg-[#2AABEE] hover:bg-[#2298D6] py-3 rounded-xl font-black text-xs transition-all shadow-md hover:shadow-lg active:scale-95">✈️ Telegram</button>
                <button type="button" onClick={() => handleLeadSubmit('Viber')} className="bg-[#7360F2] hover:bg-[#5E4DCD] py-3 rounded-xl font-black text-xs transition-all shadow-md hover:shadow-lg active:scale-95">📞 Viber</button>
              </div>
            </div>
            
             <div className="absolute top-1/2 left-0 w-64 h-64 bg-sky-600/10 rounded-full blur-3xl opacity-50 z-0"></div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="bg-white border-b border-slate-200 py-10 relative z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100">
          {[
            { value: "10+", label: t('stats.years') },
            { value: "500+", label: t('stats.objects') },
            { value: "15 000", label: t('stats.produced') },
            { value: "100%", label: t('stats.dstu') }
          ].map((stat, i) => (
            <div key={i} className="text-center px-4">
              <div className="text-3xl md:text-4xl font-black text-slate-800 tracking-tighter mb-1">{stat.value}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* СФЕРИ ЗАСТОСУВАННЯ */}
      <section id="applications" className="max-w-6xl mx-auto px-4 py-12 md:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">{t('apps.heading')}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "⚽", title: t('apps.items.playgrounds.title'), desc: t('apps.items.playgrounds.desc') },
            { icon: "🏋️", title: t('apps.items.gyms.title'), desc: t('apps.items.gyms.desc') },
            { icon: "🏡", title: t('apps.items.terraces.title'), desc: t('apps.items.terraces.desc') },
            { icon: "🚗", title: t('apps.items.garages.title'), desc: t('apps.items.garages.desc') }
          ].map((app, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl text-center transform transition-all duration-300 hover:-translate-y-2 group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{app.icon}</div>
              <div className="font-black text-slate-900 text-base mb-2">{app.title}</div>
              <div className="text-sm text-slate-500 font-medium">{app.desc}</div>
            </div>
          ))}
        </div>
      </section>



      {/* LEAD MAGNET */}
      <section id="sample" className="bg-blue-600 text-white py-16 px-4 relative overflow-hidden border-t border-blue-500">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="md:w-1/2 space-y-6 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">{t('lead.sample.title')}</h2>
            <p className="text-blue-100 font-medium text-lg leading-relaxed">
              {t('lead.sample.desc')}
            </p>
            <ul className="text-sm font-bold text-blue-50 space-y-2">
              <li className="flex items-center gap-2 justify-center md:justify-start">
                <span className="bg-blue-500 p-1 rounded-full text-[10px]">✓</span> {t('lead.sample.item1')}
              </li>
              <li className="flex items-center gap-2 justify-center md:justify-start">
                <span className="bg-blue-500 p-1 rounded-full text-[10px]">✓</span> {t('lead.sample.item2')}
              </li>
              <li className="flex items-center gap-2 justify-center md:justify-start">
                <span className="bg-blue-500 p-1 rounded-full text-[10px]">✓</span> {t('lead.sample.item3')}
              </li>
            </ul>
          </div>
          <div className="md:w-1/2 w-full max-w-sm bg-white p-6 rounded-3xl shadow-2xl text-slate-800 mx-auto border-4 border-blue-400/30 transform hover:-translate-y-1 transition-transform duration-500">
             <h4 className="text-lg font-black text-center mb-4">{t('lead.sample.btnTitle')}</h4>
             <input 
                type="tel" placeholder={t('calc.phonePlaceholder')} value={footerPhone} onChange={(e) => handlePhoneChange(e, setFooterPhone)}
                className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 text-sm font-bold focus:outline-none focus:border-blue-500 bg-slate-50 mb-4 placeholder-slate-400 transition-colors"
              />
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => handleLeadSubmit('Telegram', 'Зразок', true)} className="bg-[#2AABEE] hover:bg-[#2298D6] text-white py-3 rounded-xl font-black text-sm transition-all active:scale-95 shadow-md">Telegram</button>
                <button type="button" onClick={() => handleLeadSubmit('Viber', 'Зразок', true)} className="bg-[#7360F2] hover:bg-[#5E4DCD] text-white py-3 rounded-xl font-black text-sm transition-all active:scale-95 shadow-md">Viber</button>
              </div>
              <div className="text-[10px] text-center text-slate-400 mt-4 font-medium">{t('lead.sample.note')}</div>
          </div>
        </div>
      </section>

      {/* ГАЛЕРЕЯ */}
      <section id="gallery" className="max-w-7xl mx-auto px-4 py-12 md:py-24 border-t border-slate-200">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">{t('gallery.title')}</h2>
          <p className="text-slate-500 font-medium mt-4 max-w-2xl mx-auto">{t('gallery.desc')}</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { src: "/1.webp", desc: t('gallery.cities.dnipro') },
            { src: "/2.webp", desc: t('gallery.cities.kamianske') },
            { src: "/3.webp", desc: t('gallery.cities.kryvyirih') },
            { src: "/4.webp", desc: t('gallery.cities.poltava') },
            { src: "/5.webp", desc: t('gallery.cities.kharkiv') },
            { src: "/6.webp", desc: t('gallery.cities.kyiv') }
          ].map((item, index) => (
            <div key={index} className="overflow-hidden rounded-2xl shadow-md border border-slate-200 bg-white flex flex-col group cursor-pointer hover:shadow-xl transition-all duration-300 relative">
              <div className="h-64 overflow-hidden relative bg-slate-100 flex items-center justify-center">
                <img 
                  src={item.src} 
                  alt={`Obj ${index + 1}`} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-slate-400 text-sm font-bold">${t('gallery.photoWait')} ${index + 1}.webp</span>`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity duration-300"></div>
              </div>
              <div className="absolute bottom-0 left-0 w-full p-4 z-10 flex items-center justify-center">
                <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl text-xs font-black text-slate-800 shadow-lg flex items-center gap-1.5 border border-white/20">
                  <span className="text-blue-600">📍</span> {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ТЕХНІЧНІ ХАРАКТЕРИСТИКИ */}
      <section id="specs" className="bg-slate-100 py-12 md:py-24 px-4 border-t border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">{t('specs.title')}</h2>
            <p className="text-slate-500 font-medium mt-4 max-w-2xl mx-auto">{t('specs.desc')}</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-0 border-r border-slate-200">
                <div className="bg-slate-50 py-4 px-6 font-black text-slate-800 border-b border-slate-200">{t('specs.generalParams')}</div>
                <ul className="divide-y divide-slate-100">
                  {[
                    { label: t('specs.labels.size'), value: t('specs.values.size') },
                    { label: t('specs.labels.thickness'), value: t('specs.values.thickness') },
                    { label: t('specs.labels.material'), value: t('specs.values.material') },
                    { label: t('specs.labels.property'), value: t('specs.values.property') },
                    { label: t('specs.labels.lifetime'), value: t('specs.values.lifetime') }
                  ].map((item, i) => (
                    <li key={i} className="py-4 px-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                      <span className="text-sm font-bold text-slate-500">{item.label}</span>
                      <span className="text-sm font-black text-slate-900 text-right w-1/2">{item.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-0">
                <div className="bg-slate-50 py-4 px-6 font-black text-slate-800 border-b border-slate-200">{t('specs.physicParams')}</div>
                <ul className="divide-y divide-slate-100">
                  {[
                    { label: t('specs.labels.density'), value: t('specs.values.density') },
                    { label: t('specs.labels.hardness'), value: t('specs.values.hardness') },
                    { label: t('specs.labels.strength'), value: t('specs.values.strength') },
                    { label: t('specs.labels.abrasion'), value: t('specs.values.abrasion') },
                    { label: t('specs.labels.tempMode'), value: t('specs.values.tempMode') }
                  ].map((item, i) => (
                    <li key={i} className="py-4 px-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                      <span className="text-sm font-bold text-slate-500">{item.label}</span>
                      <span className="text-sm font-black text-slate-900 text-right w-1/2">{item.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="bg-blue-50 p-6 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="text-3xl">📄</div>
                <div>
                  <div className="text-sm font-black text-blue-900">{t('specs.docTitle')}</div>
                  <div className="text-xs font-medium text-blue-800 mt-1">{t('specs.docDesc')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ЕТАПИ РОБОТИ */}
      <section className="bg-slate-900 text-white py-12 md:py-24 px-4 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">{t('steps.title')}</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {stepsItems.map((s, i) => (
              <div key={i} className="bg-slate-800 p-8 rounded-3xl border border-slate-700 relative overflow-hidden transform transition hover:-translate-y-2 group">
                <span className="text-7xl font-black text-white/5 absolute -top-2 -left-2 select-none z-0 group-hover:text-white/10 transition-colors">{s.step}</span>
                <div className="font-black text-xl mb-3 relative z-10">{s.title}</div>
                <p className="text-sm text-slate-400 font-medium leading-relaxed relative z-10">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-4xl mx-auto px-4 py-12 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">{t('faq.title')}</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <button 
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
              >
                <span className="font-black text-slate-800">{faq.q}</span>
                <span className={`text-blue-600 text-xl font-black transition-transform duration-300 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-6 text-sm text-slate-600 font-medium leading-relaxed border-t border-slate-100 pt-4 space-y-3">
                  {faq.a.split('\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ФУТЕР */}
      <footer id="footer" className="bg-slate-950 text-white pt-20 pb-10 px-4 text-center border-t border-slate-900 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl opacity-50 z-0"></div>
        
        <div className="max-w-4xl mx-auto space-y-10 relative z-10">
          <div className="space-y-4">
            <h3 className="text-3xl md:text-4xl font-black tracking-tight">{t('footer.title')}</h3>
            <p className="text-slate-400 text-sm font-medium max-w-xl mx-auto leading-relaxed">
              {t('footer.desc')}
            </p>
          </div>

          <div className="bg-slate-900/80 p-8 rounded-3xl border border-slate-800 max-w-md mx-auto space-y-4 shadow-2xl relative overflow-hidden transform hover:scale-[1.01] transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl opacity-50 z-0"></div>
            
            <input 
              type="tel" placeholder={t('calc.phonePlaceholder')} value={footerPhone} onChange={(e) => handlePhoneChange(e, setFooterPhone)}
              className="w-full px-5 py-4 rounded-xl border-2 border-slate-700 text-sm font-bold focus:outline-none focus:border-blue-500 bg-slate-800 text-white placeholder-slate-500 shadow-inner transition-colors relative z-10"
            />
            <div className="grid grid-cols-2 gap-3 relative z-10">
              <button type="button" onClick={() => handleLeadSubmit('Telegram', 'Опт', true)} className="bg-[#2AABEE] hover:bg-[#2298D6] py-3.5 rounded-xl font-black text-xs transition-all active:scale-95 shadow-lg">✈️ Telegram</button>
              <button type="button" onClick={() => handleLeadSubmit('Viber', 'Опт', true)} className="bg-[#7360F2] hover:bg-[#5E4DCD] py-3.5 rounded-xl font-black text-xs transition-all active:scale-95 shadow-lg">📞 Viber</button>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 font-medium z-10 relative">{t('footer.privacy')}</div>
          </div>

          <div className="pt-10 border-t border-slate-800/80 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10">
            <div className="font-medium text-left">{t('footer.copyright')}</div>
            <div className="font-bold text-slate-600 sm:text-right whitespace-nowrap text-blue-900/50">White-Label Engine v4.15</div>
          </div>
        </div>
      </footer>

      {/* MOBILE STICKY BOTTOM BAR */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-4 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.4)] flex justify-between items-center" style={{ paddingBottom: 'calc(max(env(safe-area-inset-bottom), 1rem))' }}>
        <div className="flex flex-col">
          <div className="text-2xl font-black text-green-400 tracking-tight drop-shadow-sm flex items-baseline gap-1">
            {pricePerMeter} <span className="text-sm font-bold text-green-400/80">{t('calc.pricePerMeter')}</span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-0.5">
            {i18n.language.startsWith('uk') ? `Разом за ${area} м²:` : `Итого за ${area} м²:`} <span className="text-slate-200 font-bold">{total.toLocaleString('uk-UA')} грн</span>
          </div>
        </div>
        <button 
          type="button"
          onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-blue-600 hover:bg-blue-500 text-white font-black text-sm py-3 px-6 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-95 transition-all border border-blue-500/50"
        >
          {t('calc.btnOrderSticky')}
        </button>
      </div>

    </div>
  );
}