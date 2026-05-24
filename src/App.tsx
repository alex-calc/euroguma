import { useState, useEffect } from 'react';

const PRICE_BY_THICKNESS: Record<number, number> = {
  1: 790, // 20 мм
  2: 940  // 30 мм
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
  { id: 'black', name: 'Чорний', hex: '#1a1a1a' },
  { id: 'graphite', name: 'Графіт', hex: '#3d3d3d' },
  { id: 'green', name: 'Зелений', hex: '#294d24' },
];

const FAQS = [
  { q: "Як доглядати за гумовим покриттям?", a: "Прибирання на вулиці можливе за допомогою мітел, шлангів для поливу або повітродувок. Взимку рекомендуємо чистити дерев'яними або пластиковими лопатами без гострих країв. У приміщенні можна використовувати пилосос та робити сухе/вологе прибирання." },
  { q: "Чи безпечна плитка для дітей?", a: "Абсолютно. Плитка має висновок санітарно-епідеміологічної експертизи МОЗ України. Вона екологічна, не виділяє токсичних речовин та має високі амортизаційні властивості, що захищає від травм при падінні (травмобезпека)." },
  { q: "Який термін служби покриття?", a: "При правильному укладанні та експлуатації термін служби становить не менше 10 років. Плитка стійка до перепадів температур (від -40°C до +50°C), ультрафіолету та високих механічних навантажень." },
  { q: "Що робити, якщо пошкодилась одна плитка?", a: "Однією з головних переваг модульного гумового покриття є його висока ремонтопридатність. У разі сильного пошкодження вам не потрібно міняти весь майданчик – достатньо легко замінити лише один пошкоджений елемент." }
];

export default function App() {
  const [area, setArea] = useState<number>(40);
  const [thickness, setThickness] = useState<number>(2);
  const [selectedColor, setSelectedColor] = useState<string>('black');
  const [baseType, setBaseType] = useState<string>('concrete'); 
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [footerPhone, setFooterPhone] = useState<string>('');

  const [activityIndex, setActivityIndex] = useState(0);
  const activities = [
    "🚚 Відвантажено 40 м² плитки для гаража у Кам'янському",
    "✅ Отримано замовлення на покриття (60 м²) для майданчика у Дніпрі",
    "🔥 Завод Euroguma запустив нову лінію пресування!",
    "📐 Керівництво особисто прораховує вартість логістики для великого об'єкту",
    "🏢 Підписано контракт на постачання плитки для фітнес-клубу"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActivityIndex((prev) => (prev + 1) % activities.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const getThicknessMm = (level: number) => level === 1 ? '20 мм' : '30 мм';
  const pricePerMeter = PRICE_BY_THICKNESS[thickness] || 940;
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

  const validateUkrainianPhone = (phoneStr: string) => {
    const cleaned = phoneStr.replace(/\D/g, '');
    return /^(38)?0\d{9}$/.test(cleaned);
  };

  const handleLeadSubmit = (messenger: 'Telegram' | 'Viber', formType: 'Замовлення' | 'Зразок' | 'Опт' = 'Замовлення', isFooter = false) => {
    const currentPhone = isFooter ? footerPhone : phone;
    if (!currentPhone.trim()) return alert('⚠️ Будь ласка, введіть номер телефону!');
    if (!validateUkrainianPhone(currentPhone)) return alert('❌ Некоректний формат номеру! Введіть, будь ласка, діючий номер (наприклад: 0632923975).');
    
    const colorName = COLORS.find(c => c.id === selectedColor)?.name || 'Чорний';
    
    if (formType === 'Зразок') {
      alert(`📦 Заявку на ЗРАЗОК сформовано!\n\nТелефон: ${currentPhone}\nМесенджер: ${messenger}\n\nЯ особисто зателефоную вам найближчим часом для уточнення деталей відправки Новою Поштою.\n\nЗ повагою, керівник виробництва.`);
    } else if (formType === 'Опт') {
      alert(`🤝 Запит на співпрацю відправлено!\n\nТелефон: ${currentPhone}\nМесенджер: ${messenger}\n\nЯ особисто зв'яжусь з вами, щоб обговорити ваш об'єкт та надати найкращі умови.\n\nЗ повагою, керівник виробництва.`);
    } else {
      alert(`🔥 Заявка для EUROGUMA успішно надійшла керівнику!\n\nКлієнт: ${name || 'Не вказано'}\nТелефон: ${currentPhone}\nМесенджер: ${messenger}\n\nПлоща: ${area} м²\nТовщина плитки: ${getThicknessMm(thickness)}\nКолір: ${colorName}\nОснова: ${baseType === 'concrete' ? 'Тверда (Бетон/Асфальт)' : 'Сипуча (Відсів/Шлак)'}\nВартість: ${total.toLocaleString('uk-UA')} ₴\n\nЯ особисто зателефоную вам для підтвердження замовлення!`);
    }
  };

  const currentColorObj = COLORS.find(c => c.id === selectedColor) || COLORS[0];
  const imageFileName = `/${selectedColor}_${thickness === 1 ? '20' : '30'}.jpg`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased selection:bg-blue-600 selection:text-white scroll-smooth">
      
      {/* HEADER Ticker */}
      <div className="bg-blue-700 text-white text-xs md:text-sm font-semibold py-2.5 px-4 text-center sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="inline-block animate-pulse text-blue-200">⚡</span>
          <span className="transition-all duration-500 font-medium tracking-wide">{activities[activityIndex]}</span>
        </div>
      </div>

      <header className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex justify-between items-center bg-transparent relative z-20">
        
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
          <a href="#applications" className="hover:text-blue-600 transition-colors">Застосування</a>
          <a href="#calculator" className="hover:text-blue-600 transition-colors">Калькулятор</a>
          <a href="#gallery" className="hover:text-blue-600 transition-colors">Галерея</a>
          <a href="#specs" className="hover:text-blue-600 transition-colors">Характеристики</a>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' })}
            className="hidden md:block bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
          >
            Співпраця
          </button>
          
          <a href="tel:+380632923975" className="bg-slate-900 hover:bg-blue-600 text-white px-5 py-2 rounded-xl transition-all shadow-lg active:scale-95 flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 text-sm font-bold">
              <span>📞</span> <span>(063) 292-39-75</span>
            </div>
            <div className="text-[9px] text-blue-300 font-medium uppercase tracking-wider mt-0.5">Пряма лінія керівника</div>
          </a>
        </div>
      </header>

      {/* 🚀 HERO */}
      <section className="relative w-full pt-20 pb-32 px-4 text-center min-h-[75vh] flex flex-col justify-center border-b border-slate-900 overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transform scale-105 animate-[pulse_20s_ease-in-out_infinite]"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-slate-950/95"></div>

        <div className="relative z-10 max-w-5xl mx-auto space-y-8 mt-4">
          <div className="inline-flex items-center gap-2 bg-slate-800/80 backdrop-blur-md text-blue-400 px-5 py-2 rounded-full text-xs font-black border border-slate-700/50 uppercase tracking-widest shadow-2xl">
            🇺🇦 Український завод-виробник
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight max-w-5xl mx-auto drop-shadow-2xl">
            Гумова плитка напряму від заводу: <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">без переплат посередникам</span>
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto font-medium leading-relaxed drop-shadow-md">
            Виробляємо в Кам'янському. Відвантажуємо будь-які об'єми за ціною опту. Створіть ідеальне покриття та розрахуйте вартість за 1 хвилину.
          </p>
          <div className="pt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button 
              onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white text-base md:text-lg font-black px-10 py-5 rounded-2xl shadow-[0_0_40px_rgba(37,99,235,0.4)] transform hover:-translate-y-1 transition-all border border-blue-400/50 tracking-wide"
            >
              Розрахувати вартість ⏱️
            </button>
            <button 
              onClick={() => document.getElementById('sample')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-base md:text-lg font-black px-10 py-5 rounded-2xl transition-all border border-white/20 shadow-xl"
            >
              📦 Отримати зразок
            </button>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="bg-white border-b border-slate-200 py-10 relative z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100">
          {[
            { value: "10+", label: "Років на ринку" },
            { value: "500+", label: "Реалізованих об'єктів" },
            { value: "15 000", label: "м² вироблено за рік" },
            { value: "100%", label: "Відповідність ДСТУ" }
          ].map((stat, i) => (
            <div key={i} className="text-center px-4">
              <div className="text-3xl md:text-4xl font-black text-slate-800 tracking-tighter mb-1">{stat.value}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* СФЕРИ ЗАСТОСУВАННЯ */}
      <section id="applications" className="max-w-6xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Ідеально підходить для</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "⚽", title: "Дитячі майданчики", desc: "Амортизує удари при падінні" },
            { icon: "🏋️", title: "Спортивні зали", desc: "Захищає основу та ізолює шум" },
            { icon: "🏡", title: "Тераси та зони відпочинку", desc: "Не ковзає, пропускає воду" },
            { icon: "🚗", title: "Гаражі та СТО", desc: "Стійкість до великих навантажень" }
          ].map((app, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl text-center transform transition-all duration-300 hover:-translate-y-2 group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{app.icon}</div>
              <div className="font-black text-slate-900 text-base mb-2">{app.title}</div>
              <div className="text-sm text-slate-500 font-medium">{app.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* КОМПАКТНИЙ PREMIUM КАЛЬКУЛЯТОР */}
      <section id="calculator" className="bg-slate-900 py-16 px-4 relative overflow-hidden border-t border-slate-800">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>

        <div className="max-w-6xl mx-auto text-center mb-16 relative z-10">
          <div className="inline-block bg-white/5 backdrop-blur-sm text-blue-300 border border-white/10 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest mb-4">Онлайн-калькулятор</div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white drop-shadow-md">Створіть свій майданчик</h2>
        </div>

        <div className="max-w-6xl mx-auto bg-slate-100 rounded-[2rem] shadow-2xl overflow-hidden grid lg:grid-cols-12 border border-slate-200 relative z-10 p-2 md:p-3">
          
          <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-1.5 px-4 text-center text-xs md:text-sm font-black rounded-full shadow-md z-10 flex items-center justify-center gap-2">
            <span>🔥</span>
            <span>Відвантаження від 50 м² за 2 дні!</span>
          </div>

          <div className="lg:col-span-7 p-6 md:p-8 space-y-6 mt-8">
            
            {/* Карточка 1: Визуализация и Цвет */}
            <div className="bg-white p-5 rounded-2xl shadow-lg border border-slate-100">
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Візуалізація та вибір кольору</div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                   
                   {/* БЛОК ЖИВИХ ФОТО */}
                   <div 
                    className="w-full h-48 rounded-xl shadow-inner border border-black/10 relative overflow-hidden group"
                    style={{ backgroundColor: currentColorObj.hex }}
                  >
                    {/* Текстова заглушка (видно, якщо немає фото) */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60 font-bold z-0 mix-blend-overlay pointer-events-none">
                        <span className="text-[10px] uppercase tracking-widest mb-1">Місце для фото</span>
                        <span className="text-sm">{currentColorObj.name} {thickness === 1 ? '20мм' : '30мм'}</span>
                    </div>
                    
                    {/* Шум для текстури (видно, якщо немає фото) */}
                    <div className="absolute inset-0 opacity-[0.35] mix-blend-multiply pointer-events-none z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-black/30 pointer-events-none z-0"></div>

                    {/* Саме фото (перекриє заглушку, якщо файл існує) */}
                    <img 
                      src={imageFileName} 
                      alt={`Плитка ${currentColorObj.name} ${thickness === 1 ? '20мм' : '30мм'}`}
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
                        title={c.name}
                      >
                        <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
                        {selectedColor === c.id && <span className="text-white drop-shadow-md text-sm font-black relative z-10">✓</span>}
                        <span className={`text-[9px] font-bold mt-1 relative z-10 ${c.id === 'green' ? 'text-white' : 'text-slate-400'}`}>{c.name}</span>
                      </button>
                    ))}
                  </div>
               </div>
            </div>

            {/* Карточка 2: Метрики с умной логикой */}
            <div className="bg-white p-5 rounded-2xl shadow-lg border border-slate-100 space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Необхідна площа</label>
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
                      <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">Товщина плитки</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 1, label: '20 мм' },
                          { id: 2, label: '30 мм' }
                        ].map((t) => (
                          <button
                            key={t.id} type="button" onClick={() => handleThicknessChange(t.id)}
                            className={`w-full py-2.5 rounded-lg border text-center transition-all ${
                              thickness === t.id ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-500/30' : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <span className="text-xs font-black">{t.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">Основа майданчика</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'concrete', label: 'Тверда (Бетон)' },
                          { id: 'ground', label: 'Сипуча (Відсів)' }
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
                  <span className="font-bold text-blue-600">💡 Зверніть увагу:</span> Гумова плитка товщиною 20 мм укладається виключно на тверду основу (асфальт, бетонна стяжка). Для підготовленої сипучої основи (відсів, шлакова відсипка) необхідна товщина плитки від 30 мм.
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
                  <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">Загальна вартість:</span>
                  <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider">
                    {pricePerMeter} грн / м²
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold text-white tracking-tight drop-shadow-md">{total.toLocaleString('uk-UA')}</span>
                  <span className="text-xl text-blue-400 font-extrabold">грн</span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-2">Ціна напряму від заводу виробника.</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl shadow-inner border border-slate-100 flex items-center gap-3">
                      <div className="text-2xl text-blue-600">⚖️</div>
                      <div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Загальна вага</div>
                          <div className="text-base font-black text-slate-900">{totalWeightKg.toLocaleString('uk-UA')} <span className="text-xs">кг</span></div>
                      </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-inner border border-slate-100 flex items-center gap-3">
                      <div className="text-2xl text-blue-600">📦</div>
                      <div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Об'єм</div>
                          <div className="text-base font-black text-slate-900">{palletsNeeded} <span className="text-xs">піддонів</span></div>
                      </div>
                  </div>
              </div>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 shadow-xl space-y-3 relative z-10 mt-8">
              <h4 className="text-[11px] font-black text-white text-center uppercase tracking-wider mb-2">Замовити без посередників</h4>
              <input 
                type="text" placeholder="Ім'я" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner"
              />
              <input 
                type="tel" placeholder="Ваш телефон" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner"
              />
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button onClick={() => handleLeadSubmit('Telegram')} className="bg-[#2AABEE] hover:bg-[#2298D6] py-3 rounded-xl font-black text-xs transition-all shadow-md hover:shadow-lg active:scale-95">✈️ Telegram</button>
                <button onClick={() => handleLeadSubmit('Viber')} className="bg-[#7360F2] hover:bg-[#5E4DCD] py-3 rounded-xl font-black text-xs transition-all shadow-md hover:shadow-lg active:scale-95">📞 Viber</button>
              </div>
            </div>
            
             <div className="absolute top-1/2 left-0 w-64 h-64 bg-sky-600/10 rounded-full blur-3xl opacity-50 z-0"></div>
          </div>
        </div>
      </section>

      {/* LEAD MAGNET */}
      <section id="sample" className="bg-blue-600 text-white py-16 px-4 relative overflow-hidden border-t border-blue-500">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="md:w-1/2 space-y-6 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Сумніваєтесь у якості? <br/> Відчуйте її на дотик!</h2>
            <p className="text-blue-100 font-medium text-lg leading-relaxed">
              Замовляйте набір зразків нашої гумової плитки. Ми відправимо його Новою Поштою, щоб ви могли особисто переконатися у міцності та амортизації продукції перед покупкою.
            </p>
            <ul className="text-sm font-bold text-blue-50 space-y-2">
              <li className="flex items-center gap-2 justify-center md:justify-start">
                <span className="bg-blue-500 p-1 rounded-full text-[10px]">✓</span> Всі 3 кольори у наборі
              </li>
              <li className="flex items-center gap-2 justify-center md:justify-start">
                <span className="bg-blue-500 p-1 rounded-full text-[10px]">✓</span> Зразки 20 мм та 30 мм
              </li>
              <li className="flex items-center gap-2 justify-center md:justify-start">
                <span className="bg-blue-500 p-1 rounded-full text-[10px]">✓</span> Оцінка щільності наживо
              </li>
            </ul>
          </div>
          <div className="md:w-1/2 w-full max-w-sm bg-white p-6 rounded-3xl shadow-2xl text-slate-800 mx-auto border-4 border-blue-400/30 transform hover:-translate-y-1 transition-transform duration-500">
             <h4 className="text-lg font-black text-center mb-4">Отримати зразки 📦</h4>
             <input 
                type="tel" placeholder="Ваш телефон" value={footerPhone} onChange={(e) => setFooterPhone(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 text-sm font-bold focus:outline-none focus:border-blue-500 bg-slate-50 mb-4 placeholder-slate-400 transition-colors"
              />
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleLeadSubmit('Telegram', 'Зразок', true)} className="bg-[#2AABEE] hover:bg-[#2298D6] text-white py-3 rounded-xl font-black text-sm transition-all active:scale-95 shadow-md">Telegram</button>
                <button onClick={() => handleLeadSubmit('Viber', 'Зразок', true)} className="bg-[#7360F2] hover:bg-[#5E4DCD] text-white py-3 rounded-xl font-black text-sm transition-all active:scale-95 shadow-md">Viber</button>
              </div>
              <div className="text-[10px] text-center text-slate-400 mt-4 font-medium">Керівник виробництва зателефонує вам для уточнення даних відправки.</div>
          </div>
        </div>
      </section>

      {/* ГАЛЕРЕЯ (Без масивних заголовків) */}
      <section id="gallery" className="max-w-7xl mx-auto px-4 py-24 border-t border-slate-200">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Реалізовані об'єкти</h2>
          <p className="text-slate-500 font-medium mt-4 max-w-2xl mx-auto">Приклади використання нашої гумової плитки на об'єктах клієнтів по всій Україні.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { src: "/1.webp", desc: "м. Дніпро • 120 м²" },
            { src: "/2.webp", desc: "м. Кам'янське • 85 м²" },
            { src: "/3.webp", desc: "м. Кривий Ріг • 35 м²" },
            { src: "/4.webp", desc: "м. Полтава • 45 м²" },
            { src: "/5.webp", desc: "м. Харків • 150 м²" },
            { src: "/6.webp", desc: "м. Київ • 60 м²" }
          ].map((item, index) => (
            <div key={index} className="overflow-hidden rounded-2xl shadow-md border border-slate-200 bg-white flex flex-col group cursor-pointer hover:shadow-xl transition-all duration-300 relative">
              <div className="h-64 overflow-hidden relative bg-slate-100 flex items-center justify-center">
                <img 
                  src={item.src} 
                  alt={`Об'єкт ${index + 1}`} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-slate-400 text-sm font-bold">Чекає на фото ${index + 1}.webp</span>`;
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
      <section id="specs" className="bg-slate-100 py-24 px-4 border-t border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Технічні характеристики плитки</h2>
            <p className="text-slate-500 font-medium mt-4 max-w-2xl mx-auto">Наша продукція виготовляється відповідно до державних стандартів та має всі необхідні сертифікати якості.</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-0 border-r border-slate-200">
                <div className="bg-slate-50 py-4 px-6 font-black text-slate-800 border-b border-slate-200">Загальні параметри</div>
                <ul className="divide-y divide-slate-100">
                  {[
                    { label: "Геометричний розмір", value: "500 x 500 мм" },
                    { label: "Варіанти товщини", value: "20 мм, 30 мм" },
                    { label: "Матеріал плитки", value: "Гумова крихта, поліуретан" },
                    { label: "Властивість", value: "Водопроникне (дренажне)" },
                    { label: "Термін експлуатації", value: "Не менше 10 років" }
                  ].map((item, i) => (
                    <li key={i} className="py-4 px-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                      <span className="text-sm font-bold text-slate-500">{item.label}</span>
                      <span className="text-sm font-black text-slate-900 text-right w-1/2">{item.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-0">
                <div className="bg-slate-50 py-4 px-6 font-black text-slate-800 border-b border-slate-200">Фізико-технічні властивості</div>
                <ul className="divide-y divide-slate-100">
                  {[
                    { label: "Щільність покриття", value: "780 кг/м³ (до 1110 кг/м³)" },
                    { label: "Твердість (Шор А)", value: "50 - 70 од." },
                    { label: "Міцність при 10% деформ.", value: "13,05 кг/см²" },
                    { label: "Стиранність", value: "0,05 г/см²" },
                    { label: "Температурний режим", value: "від -40˚С до +50˚С" }
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
                  <div className="text-sm font-black text-blue-900">Офіційна документація</div>
                  <div className="text-xs font-medium text-blue-800 mt-1">ТУ У 25.1-35591478-002:2010 • Висновок СЕС МОЗ України № 05.03.02-04/31010</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ЕТАПИ РОБОТИ */}
      <section className="bg-slate-900 text-white py-24 px-4 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Етапи роботи</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Конфігурація", text: "Обираєте товщину та колір плитки під ваш об'єкт." },
              { step: "02", title: "Пресування", text: "Виготовляємо плитку під високим тиском." },
              { step: "03", title: "Якість", text: "Кожна партія суворо тестується за ДСТУ." },
              { step: "04", title: "Відвантаження", text: "Самовивіз з Кам'янського або доставка по Україні." }
            ].map((s, i) => (
              <div key={i} className="bg-slate-800 p-8 rounded-3xl border border-slate-700 relative overflow-hidden transform transition hover:-translate-y-2 group">
                <span className="text-7xl font-black text-white/5 absolute -top-2 -left-2 select-none z-0 group-hover:text-white/10 transition-colors">{s.step}</span>
                <div className="font-black text-xl mb-3 relative z-10">{s.title}</div>
                <p className="text-sm text-slate-400 font-medium leading-relaxed relative z-10">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-4xl mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Поширені запитання</h2>
        </div>
        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <button 
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
              >
                <span className="font-black text-slate-800">{faq.q}</span>
                <span className={`text-blue-600 text-xl font-black transition-transform duration-300 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-6 text-sm text-slate-600 font-medium leading-relaxed border-t border-slate-100 pt-4">
                  {faq.a}
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
            <h3 className="text-3xl md:text-4xl font-black tracking-tight">Прямий зв'язок з керівництвом</h3>
            <p className="text-slate-400 text-sm font-medium max-w-xl mx-auto leading-relaxed">
              Спілкуйтесь напряму з керівником виробництва. Жодних менеджерів-посередників та очікувань. Залиште номер, і я особисто проконсультую вас щодо вашого об'єкту та умов співпраці.
            </p>
          </div>

          <div className="bg-slate-900/80 p-8 rounded-3xl border border-slate-800 max-w-md mx-auto space-y-4 shadow-2xl relative overflow-hidden transform hover:scale-[1.01] transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl opacity-50 z-0"></div>
            
            <input 
              type="tel" placeholder="Ваш телефон" value={footerPhone} onChange={(e) => setFooterPhone(e.target.value)}
              className="w-full px-5 py-4 rounded-xl border-2 border-slate-700 text-sm font-bold focus:outline-none focus:border-blue-500 bg-slate-800 text-white placeholder-slate-500 shadow-inner transition-colors relative z-10"
            />
            <div className="grid grid-cols-2 gap-3 relative z-10">
              <button onClick={() => handleLeadSubmit('Telegram', 'Опт', true)} className="bg-[#2AABEE] hover:bg-[#2298D6] py-3.5 rounded-xl font-black text-xs transition-all active:scale-95 shadow-lg">✈️ Telegram</button>
              <button onClick={() => handleLeadSubmit('Viber', 'Опт', true)} className="bg-[#7360F2] hover:bg-[#5E4DCD] py-3.5 rounded-xl font-black text-xs transition-all active:scale-95 shadow-lg">📞 Viber</button>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 font-medium z-10 relative">Я гарантую конфіденційність ваших даних.</div>
          </div>

          <div className="pt-10 border-t border-slate-800/80 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10">
            <div className="font-medium text-left">© 2026 Завод гумових покриттів EUROGUMA. м. Кам'янське. Телефон: (063) 292-39-75</div>
            <div className="font-bold text-slate-600 sm:text-right whitespace-nowrap text-blue-900/50">White-Label Engine v4.15</div>
          </div>
        </div>
      </footer>

    </div>
  );
}
