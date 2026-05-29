'use client'

import { useState, useEffect } from 'react'
import { 
  FiClock, FiCheckCircle, FiChevronRight, FiSliders, FiMessageSquare, FiInstagram,
  FiTrendingDown, FiSmartphone, FiShield, FiCpu, FiMapPin, FiUserPlus, FiLock, FiCreditCard, FiGlobe
} from 'react-icons/fi'

// Расширенная база организаций с координатами и таймингами
const ORGANIZATIONS = [
  { id: 'con-1', name: 'ЦОН Ауэзовского района', category: 'ЦОН', address: 'г. Алматы, ул. Жандосова, 51', avgTime: 12, load: 'Средняя', loadColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20', distance: '0.8 км' },
  { id: 'bank-2', name: 'Kaspi.kz (Флагманское отделение)', category: 'Банки', address: 'г. Алматы, ул. Толе би, 101', avgTime: 5, load: 'Низкая', loadColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', distance: '1.2 км' },
  { id: 'med-1', name: 'Городская поликлиника №5', category: 'Медицина', address: 'г. Алматы, ул. Макатаева, 141', avgTime: 22, load: 'Высокая', loadColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20', distance: '2.4 км' },
  { id: 'retail-1', name: 'Apple Premium Partner (iSpace Глобус)', category: 'Старт продаж iPhone', address: 'г. Алматы, пр. Абая, 109В', avgTime: 45, load: 'Экстремальная', loadColor: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20', distance: '3.1 км' }
]

const SERVICES_BY_CATEGORY: { [key: string]: string[] } = {
  'ЦОН': ['Выдача удостоверения личности и паспорта РК', 'Получение и обновление ЭЦП', 'Регистрация по месту жительства'],
  'Банки': ['Перевыпуск карт Kaspi Gold / Premium', 'Открытие счетов для ИП (Kaspi Pay)', 'Кассовые операции'],
  'Медицина': ['Прием врача-терапевта', 'Запись к Невропатологу', 'Консультация профильного специалиста'],
  'Старт продаж iPhone': ['Выдача предзаказов (Pre-order)', 'Живая электронная очередь (Launch Line)', 'Оформление рассрочки']
}

export default function SmartQueueUltimate() {
  const [activeTab, setActiveTab] = useState('home')
  const [selectedCategory, setSelectedCategory] = useState('Все')
  const [selectedOrg, setSelectedOrg] = useState<any>(ORGANIZATIONS[0])
  const [windowType, setWindowType] = useState(SERVICES_BY_CATEGORY['ЦОН'][0])
  const [myTickets, setMyTickets] = useState<any[]>([])

  // Состояние авторизации
  const [userSession, setUserSession] = useState<any>(null) // null значит не авторизован
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authStep, setAuthStep] = useState(1) // 1: Ввод данных, 2: Анимация проверки
  
  // Поля формы регистрации
  const [regIin, setRegIin] = useState('')
  const [regName, setRegName] = useState('')
  const [regPhone, setRegPhone] = useState('')

  // Динамический расчет цены: 1000 ₸ базово + 50 ₸ за каждую минуту ожидания
  const calculatePrice = (minutes: number) => {
    const base = 1000
    const perMinuteCost = 50
    return base + (minutes * perMinuteCost)
  }

  // Синхронизация услуг при смене организации
  useEffect(() => {
    if (selectedOrg) {
      setWindowType(SERVICES_BY_CATEGORY[selectedOrg.category][0])
    }
  }, [selectedOrg])

  // Логика симуляции регистрации
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (regIin.length !== 12) {
      alert('ИИН должен состоять из 12 цифр!')
      return
    }
    setAuthStep(2) // Запуск анимации проверки
    
    setTimeout(() => {
      setUserSession({
        name: regName || 'Гражданин РК',
        iin: regIin,
        phone: regPhone
      })
      setShowAuthModal(false)
      setAuthStep(1)
    }, 2000) // 2 секунды "проверка по базам данных"
  };

  const handleGetTicket = (org: any) => {
    // Если пользователь не зарегистрирован — принудительно открываем регистрацию
    if (!userSession) {
      setShowAuthModal(true)
      return
    }

    const prefix = org.category === 'ЦОН' ? 'Ц' : org.category === 'Банки' ? 'Б' : org.category === 'Медицина' ? 'М' : 'APL'
    const ticketNumber = `${prefix}-${Math.floor(100 + Math.random() * 900)}`
    const peopleAhead = Math.floor(3 + Math.random() * 8)
    const cost = calculatePrice(org.avgTime)
    
    const newTicket = {
      id: Date.now(),
      orgName: org.name,
      number: ticketNumber,
      window: windowType,
      peopleAhead: peopleAhead,
      estimatedTime: org.avgTime,
      pricePaid: cost
    }
    setMyTickets([newTicket, ...myTickets])
    setActiveTab('profile')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F19] via-[#111827] to-[#1A102F] text-slate-100 flex flex-col justify-between antialiased font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* ГЛОБАЛЬНЫЕ ТЕХНОЛОГИЧНЫЕ АНИМАЦИИ */}
      <style jsx global>{`
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.98) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulseGlow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }
        .animate-scale-up { animation: scaleUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-spin-slow { animation: spinSlow 20s linear infinite; }
        .animate-pulse-glow { animation: pulseGlow 3s ease-in-out infinite; }
      `}</style>

      {/* ОФИЦИАЛЬНЫЙ ХЕДЕР */}
      <header className="sticky top-0 z-40 bg-[#0B0F19]/80 border-b border-indigo-500/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/20">SQ</div>
            <div>
              <span className="text-xl font-black tracking-tight text-white block">SmartQueue</span>
              <span className="text-[9px] text-purple-400 block font-bold tracking-widest uppercase">Государственная система бронирования</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
            <button onClick={() => setActiveTab('home')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'home' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>Главная</button>
            <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all relative ${activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              Мои Талоны
              {myTickets.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold animate-bounce">{myTickets.length}</span>}
            </button>
            <button onClick={() => setActiveTab('admin')} className="px-4 py-2 rounded-lg text-xs font-bold text-cyan-400 uppercase tracking-wider hover:bg-slate-800 transition-all">Эмулятор Окон</button>
          </nav>

          {/* ИНДИКАТОР РЕГИСТРАЦИИ В ХЕДЕРЕ */}
          <div>
            {userSession ? (
              <div className="text-xs font-mono bg-indigo-950/40 border border-indigo-500/30 px-4 py-2 rounded-xl text-right">
                <span className="text-indigo-400 font-bold block">{userSession.name}</span>
                <span className="text-slate-400 text-[10px]">ИИН: {userSession.iin}</span>
              </div>
            ) : (
              <button 
                onClick={() => { setAuthStep(1); setShowAuthModal(true); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                <FiUserPlus /> Регистрация в Системе
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <main className="flex-grow">
        
        {activeTab === 'home' && (
          <div className="space-y-20 pb-20 animate-scale-up">
            
            {/* ГЛАВНЫЙ БАННЕР */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 grid lg:grid-cols-12 gap-12 items-center relative">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl animate-pulse-glow pointer-events-none"></div>
              
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 px-3 py-1 rounded-full text-indigo-300 text-xs font-semibold uppercase tracking-wider animate-bounce">
                  ⚡ Экосистема динамического биллинга времени
                </div>
                <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none">
                  Забирайте свой талон <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">дистанционно</span>
                </h1>
                <p className="text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed">
                  SmartQueue автоматически вычисляет нагрузку ведомств Алматы, рассчитывает справедливую стоимость резерва и регистрирует вас по ИИН.
                </p>
                
                {/* КНОПКА СКАЧИВАНИЯ С МАРКЕРОМ БУДУЩЕГО ПРИЛОЖЕНИЯ */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
                  <button className="group relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-xs uppercase tracking-wider px-8 py-4 rounded-xl shadow-xl shadow-indigo-600/20 hover:scale-[1.02] transition-all flex items-center gap-3">
                    <FiSmartphone className="text-lg group-hover:rotate-12 transition-transform" />
                    Скачать приложение
                    <span className="absolute -top-2.5 -right-3 bg-pink-500 text-white font-black px-2 py-0.5 rounded-full text-[8px] uppercase">В разработке</span>
                  </button>
                  <p className="text-[11px] text-slate-500 max-w-[220px] leading-tight">
                    *В данный момент вы используете веб-портал синхронизации. Нативный софт iOS/Android пишется.
                  </p>
                </div>
              </div>

              {/* ИЛЛЮСТРАЦИЯ: ЧЕЛОВЕК И ОЧЕРЕДЬ */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-[380px] aspect-square rounded-3xl bg-slate-900/60 border border-indigo-500/10 p-8 shadow-2xl flex items-center justify-center overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-indigo-500/10"></div>
                  
                  <svg viewBox="0 0 200 200" className="w-full h-full text-indigo-500/20">
                    <rect x="20" y="20" width="160" height="70" rx="12" fill="#0E1324" stroke="#312E81" strokeWidth="2" />
                    <line x1="20" y1="55" x2="180" y2="55" stroke="#1E1B4B" strokeWidth="1.5" />
                    <text x="35" y="42" fill="#38BDF8" fontSize="12" fontWeight="bold" fontFamily="monospace">ЦОН A-12  Окно 3</text>
                    <text x="35" y="78" fill="#F472B6" fontSize="12" fontWeight="bold" fontFamily="monospace">KASPI B-04 Окно 1</text>
                    <circle cx="100" cy="145" r="14" fill="#8B5CF6" className="opacity-80 group-hover:scale-110 transition-transform origin-center" />
                    <path d="M72,195 C72,168 128,168 128,195" fill="#6366F1" />
                    <circle cx="100" cy="145" r="30" stroke="#A855F7" strokeWidth="1" strokeDasharray="3 3" fill="none" className="animate-spin-slow" />
                  </svg>
                  
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-950/90 backdrop-blur border border-purple-500/20 p-3 rounded-xl flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium">Мониторинг залов:</span>
                    <span className="text-[11px] font-bold text-pink-400 font-mono">Шлюз 1414 Активен</span>
                  </div>
                </div>
              </div>
            </section>

            {/* БЛОК "ПОЧЕМУ ВЫБИРАЮТ НАС" */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Почему выбирают нас</h2>
                <p className="text-slate-400 text-xs sm:text-sm">Автоматизация процессов распределения граждан Алматы.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-slate-900/40 p-6 rounded-2xl border border-indigo-500/5 hover:border-indigo-500/30 transition-all hover:translate-y-[-4px] duration-300">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-lg mb-4">
                    <FiClock />
                  </div>
                  <h3 className="font-black text-base text-white mb-2">Экономия времени</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Умный подсчет времени. Больше не нужно сидеть часами в душных помещениях — алгоритм пригласит вас в здание ровно за 15 минут до вашей очереди.
                  </p>
                </div>

                <div className="bg-slate-900/40 p-6 rounded-2xl border border-indigo-500/5 hover:border-purple-500/30 transition-all hover:translate-y-[-4px] duration-300">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center text-lg mb-4">
                    <FiShield />
                  </div>
                  <h3 className="font-black text-base text-white mb-2">Надежность</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Каждый талон жестко привязывается к вашему верифицированному ИИН в процессе регистрации. Никаких проходов «по знакомству» мимо электронного табло.
                  </p>
                </div>

                <div className="bg-slate-900/40 p-6 rounded-2xl border border-indigo-500/5 hover:border-pink-500/30 transition-all hover:translate-y-[-4px] duration-300">
                  <div className="w-10 h-10 rounded-xl bg-pink-600/20 text-pink-400 flex items-center justify-center text-lg mb-4">
                    <FiGlobe />
                  </div>
                  <h3 className="font-black text-base text-white mb-2">Экологичность распределения</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Мы распределяем потоки людей, предотвращая скопление сотен граждан в одном зале. Это снижает транспортную нагрузку на дорожные узлы города.
                  </p>
                </div>
              </div>
            </section>

            {/* БЛОК "КАК ЭТО РАБОТАЕТ" */}
            <section className="bg-slate-900/20 border-y border-indigo-500/10 py-16 backdrop-blur-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-4 space-y-3">
                  <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest block font-mono">Процесс взаимодействия</span>
                  <h2 className="text-3xl font-black text-white tracking-tight">Три шага к чистому графику</h2>
                  <p className="text-slate-400 text-xs leading-relaxed">Система SmartQueue сводит личное присутствие к абсолютному минимуму.</p>
                </div>

                <div className="lg:col-span-8 grid sm:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <div className="text-4xl font-mono font-black text-indigo-500/30">01</div>
                    <h4 className="font-bold text-sm text-white">Создайте заявку</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">Зайдите в систему, выберите организацию, пройдите моментальную крипто-регистрацию по ИИН.</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-4xl font-mono font-black text-purple-500/30">02</div>
                    <h4 className="font-bold text-sm text-white">Оставьте зал ожидания</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">Вам не нужно находиться внутри. Занимайтесь делами, пейте кофе или работайте. Вы в очереди удаленно.</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-4xl font-mono font-black text-pink-500/30">03</div>
                    <h4 className="font-bold text-sm text-white">Готово к приему</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">Система пришлет пуш-уведомление с номером окна, как только оператор освободится для вас.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* ГИГАНТСКИЙ БЛОК ГЕОЛОКАЦИИ И РЕГИСТРАЦИИ ОЧЕРЕДИ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="border-l-4 border-indigo-500 pl-4">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  <FiMapPin className="text-indigo-400 animate-pulse" /> ЦЕНТР ГЕОЛОКАЦИОННОГО ИНТЕЛЛЕКТУАЛЬНОГО БРОНИРОВАНИЯ
                </h2>
                <p className="text-slate-400 text-xs mt-1">Определите ближайшую точку, выберите услугу и рассчитайте автоматический тариф.</p>
              </div>

              <div className="grid lg:grid-cols-12 gap-8 items-stretch">
                
                {/* Левая огромная панель: Сетка гео-локаций учреждений */}
                <div className="lg:col-span-7 bg-slate-900/60 border border-indigo-500/10 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex gap-1.5 overflow-x-auto pb-3 border-b border-slate-800">
                      {['Все', 'ЦОН', 'Банки', 'Медицина', 'Старт продаж iPhone'].map(cat => (
                        <button 
                          key={cat} 
                          onClick={() => setSelectedCategory(cat)} 
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'bg-slate-950 text-slate-400 hover:text-white'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 pt-4">
                      {ORGANIZATIONS.filter(o => selectedCategory === 'Все' || o.category === selectedCategory).map(org => (
                        <div 
                          key={org.id} 
                          onClick={() => setSelectedOrg(org)}
                          className={`p-4 rounded-xl border text-xs cursor-pointer transition-all relative overflow-hidden group ${selectedOrg?.id === org.id ? 'border-purple-500 bg-purple-500/5 shadow-xl shadow-purple-500/5' : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'}`}
                        >
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <span className="text-[9px] font-mono text-purple-400 uppercase font-black tracking-wider">{org.category}</span>
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">📍 {org.distance}</span>
                          </div>
                          <h4 className="font-bold text-white text-sm tracking-tight leading-tight group-hover:text-indigo-400 transition-colors">{org.name}</h4>
                          <p className="text-slate-500 text-[10px] mt-1 truncate">{org.address}</p>
                          
                          <div className="mt-4 pt-2.5 border-t border-slate-900 flex justify-between items-center">
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${org.loadColor}`}>{org.load} нагрузка</span>
                            <span className="text-[11px] font-mono font-bold text-white">⏱ ~{org.avgTime} мин</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Визуальная симуляция мини-карты */}
                  <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2 mt-4">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                    Гео-локация: <b>Алматы, Медеуский район</b> (Автоматический поиск в радиусе 5 км)
                  </div>
                </div>

                {/* Правая панель: Специфика, Динамический биллинг и кнопка брони */}
                <div className="lg:col-span-5 bg-gradient-to-b from-slate-900/80 to-[#15112B] border border-purple-500/10 rounded-2xl p-6 flex flex-col justify-between space-y-6">
                  
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-purple-300 uppercase tracking-widest flex items-center gap-2"><FiSliders /> Настройка параметров талона</h3>
                    
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[9px] text-slate-500 block uppercase font-mono">Выбранный узел связи:</span>
                      <span className="text-white font-black block text-sm leading-tight mt-0.5">{selectedOrg?.name}</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Что именно вам требуется?</label>
                      <select 
                        value={windowType} 
                        onChange={e => setWindowType(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                      >
                        {SERVICES_BY_CATEGORY[selectedOrg?.category || 'ЦОН'].map((s, i) => (
                          <option key={i} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* АВТОМАТИЧЕСКИЙ РАСЧЕТ ДЕНЕГ */}
                    <div className="p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-xl space-y-3">
                      <span className="text-[10px] text-indigo-400 font-black uppercase tracking-wider block flex items-center gap-1"><FiCreditCard /> Расчет стоимости услуги</span>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Базовый сбор SmartQueue:</span>
                        <span className="font-bold text-slate-200">1 000 ₸</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Тариф за минуты (~{selectedOrg?.avgTime} мин):</span>
                        <span className="font-bold text-slate-200">+{selectedOrg ? selectedOrg.avgTime * 50 : 0} ₸</span>
                      </div>
                      <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                        <span className="text-xs font-bold text-white">Итого к списанию:</span>
                        <span className="text-lg font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                          {selectedOrg ? calculatePrice(selectedOrg.avgTime).toLocaleString('ru-RU') : 1000} ₸
                        </span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleGetTicket(selectedOrg)}
                    className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-black text-xs uppercase tracking-wider py-4 rounded-xl transition-all shadow-xl shadow-purple-600/20 hover:opacity-90 active:scale-[0.99]"
                  >
                    {!userSession ? 'Зарегистрироваться и занять очередь' : 'Оплатить и подтвердить бронь'}
                  </button>

                </div>

              </div>
            </section>

            {/* БЛОК СВЯЗИ */}
            <section className="max-w-md mx-auto text-center space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-widest">Официальные шлюзы граждан</h4>
              <div className="flex gap-2 justify-center">
                <a href="https://wa.me/77071234567" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-emerald-400"><FiMessageSquare /> WhatsApp</a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-pink-400"><FiInstagram /> Instagram</a>
              </div>
            </section>

          </div>
        )}

        {/* РАЗДЕЛ: ЦИФРОВОЙ КОШЕЛЕК ТАЛОНОВ */}
        {activeTab === 'profile' && (
          <div className="max-w-xl mx-auto py-12 px-4 space-y-6 animate-scale-up">
            <h2 className="text-xl font-black text-white text-center">Ваш криптографический реестр билетов</h2>
            {myTickets.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-12 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">Активных электронных билетов не найдено.</p>
            ) : (
              <div className="space-y-4">
                {myTickets.map(ticket => (
                  <div key={ticket.id} className="bg-slate-900/80 border border-purple-500/20 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-4 bg-slate-950/60 border-b border-slate-900 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-white text-xs">{ticket.orgName}</h4>
                        <span className="text-[10px] text-purple-400 block mt-0.5">Кабинет: {ticket.window}</span>
                      </div>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">Оплачено: {ticket.pricePaid} ₸</span>
                    </div>
                    <div className="p-6 text-center bg-slate-950/20">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Номер вашей очереди</span>
                      <div className="text-4xl font-mono font-black text-white my-2 bg-slate-950 py-2 px-6 rounded-xl border border-slate-800 inline-block tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{ticket.number}</div>
                      {ticket.peopleAhead > 0 ? (
                        <p className="text-xs text-slate-400 mt-2">Перед вами: <b className="text-purple-400">{ticket.peopleAhead} чел.</b> | Будьте на месте через ~<b>{ticket.estimatedTime} мин</b></p>
                      ) : (
                        <p className="text-xs text-emerald-400 font-bold bg-emerald-950/40 p-2 rounded-xl mt-2 animate-pulse">Ваш черед! Пройдите к нужному окну.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ЭМУЛЯТОР ПРОДВИЖЕНИЯ ОЧЕРЕДИ */}
        {activeTab === 'admin' && (
          <div className="max-w-md mx-auto py-12 px-4 space-y-4 animate-scale-up">
            <h2 className="text-xl font-black text-white">Пульт симулятора продвижения очередей</h2>
            <p className="text-slate-400 text-xs">Используйте для демонстрации защиты проекта: сдвигайте людей вперед.</p>
            {myTickets.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-6 bg-slate-900/40 border border-dashed border-slate-800 rounded-xl">Создайте талон на главной вкладке, чтобы протестировать симулятор.</p>
            ) : (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden text-xs">
                {myTickets.map(t => (
                  <div key={t.id} className="p-4 flex justify-between items-center border-b border-slate-900">
                    <div>
                      <span className="font-mono font-black text-cyan-400 block">{t.number}</span>
                      <span className="text-slate-400 text-[11px] block truncate max-w-[180px]">{t.orgName}</span>
                    </div>
                    <button 
                      disabled={t.peopleAhead === 0}
                      onClick={() => {
                        setMyTickets(prev => prev.map(item => item.id === t.id ? { ...item, peopleAhead: Math.max(0, item.peopleAhead - 1), estimatedTime: Math.max(0, item.estimatedTime - 4) } : item))
                      }}
                      className="bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white font-bold px-3 py-1.5 rounded-lg text-[11px] transition-all flex items-center gap-1"
                    >
                      <FiTrendingDown /> Сдвинуть (-1 человек)
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* ОФИЦИАЛЬНОЕ МОДАЛЬНОЕ ОКНО РЕГИСТРАЦИИ ПО ИИН */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F1322] border border-indigo-500/20 max-w-md w-full rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4 relative animate-scale-up">
            
            {authStep === 1 ? (
              <>
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-black text-white flex items-center justify-center gap-2"><FiLock className="text-indigo-400" /> Регистрация в шлюзе SmartQueue</h3>
                  <p className="text-slate-400 text-xs">Для бронирования места введите ваши официальные данные РК.</p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">ИИН Гражданина (12 цифр)</label>
                    <input 
                      type="text" 
                      required 
                      maxLength={12}
                      placeholder="020405500123" 
                      value={regIin}
                      onChange={e => setRegIin(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">Полное ФИО</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Бейсембай Асылжан" 
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">Номер телефона</label>
                    <input 
                      type="tel" 
                      required 
                      placeholder="+7 (707) 123-4567" 
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setShowAuthModal(false)}
                      className="w-1/3 bg-slate-900 hover:bg-slate-800 text-slate-400 font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all"
                    >
                      Отмена
                    </button>
                    <button 
                      type="submit" 
                      className="w-2/3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-black text-xs uppercase tracking-wider py-3 rounded-xl transition-all"
                    >
                      Подтвердить данные
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* ШАГ 2: КРАСИВАЯ АНИМАЦИЯ ПРОВЕРКИ */
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full mx-auto animate-spin"></div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-white">Криптографическая верификация личности...</h4>
                  <p className="text-slate-400 text-[11px] animate-pulse">Сверяем ИИН {regIin} с базами данных NITEC РК</p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ФУТЕР */}
      <footer className="bg-slate-950/80 border-t border-indigo-500/10 py-6 text-center text-[10px] text-slate-500 font-medium">
        &copy; 2026 АО «Национальные информационные технологии». Единая база шлюзов SmartQueue РК.
      </footer>

    </div>
  )
}