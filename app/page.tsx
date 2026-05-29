'use client'

import { useState, useEffect } from 'react'
import { 
  FiClock, FiCheckCircle, FiChevronRight, FiSliders, FiMessageSquare, FiInstagram,
  FiTrendingDown, FiSmartphone, FiShield, FiCpu, FiMapPin, FiUserPlus, FiLock, FiCreditCard, 
  FiGlobe, FiSend, FiUser, FiX, FiCheck
} from 'react-icons/fi'

// База организаций
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

  // Глобальная база зарегистрированных пользователей (для Админки)
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([
    { name: 'Нурлан Ахметов', iin: '950812300456', phone: '+7 (777) 111-2233' },
    { name: 'Алина Серикова', iin: '010322650987', phone: '+7 (705) 444-5566' }
  ])

  // Состояние авторизации текущего пользователя
  const [userSession, setUserSession] = useState<any>(null) 
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authStep, setAuthStep] = useState(1) 
  
  // Поля формы регистрации
  const [regIin, setRegIin] = useState('')
  const [regName, setRegName] = useState('')
  const [regPhone, setRegPhone] = useState('')

  // Состояния для платежного шлюза
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'card'>('qr')
  const [paymentStep, setPaymentStep] = useState(1) // 1: Выбор/Ввод, 2: Обработка платежа
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')

  // Состояния ИИ-поддержки (виджет чата)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<any[]>([
    { id: 1, text: 'Саламатсыз ба! Я ваш ИИ-ассистент SmartQueue. Чем могу помочь? Задайте вопрос о билетах, оплате или ЦОНах.', sender: 'ai' }
  ])
  const [userMessage, setUserMessage] = useState('')
  const [isAiTyping, setIsAiTyping] = useState(false)

  const calculatePrice = (minutes: number) => {
    const base = 1000
    const perMinuteCost = 50
    return base + (minutes * perMinuteCost)
  }

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
    setAuthStep(2)
    
    setTimeout(() => {
      const newUser = {
        name: regName || 'Гражданин РК',
        iin: regIin,
        phone: regPhone
      }
      setUserSession(newUser)
      // Добавляем пользователя в общую админ-базу, если его там нет
      setRegisteredUsers(prev => [newUser, ...prev])
      setShowAuthModal(false)
      setAuthStep(1)
    }, 1800)
  };

  // Клик на кнопку занять очередь
  const handleGetTicketClick = (org: any) => {
    if (!userSession) {
      setShowAuthModal(true)
      return
    }
    // Открываем платежный шлюз вместо моментальной выдачи
    setPaymentStep(1)
    setShowPaymentModal(true)
  }

  // Подтверждение и симуляция оплаты
  const handleProcessPayment = () => {
    setPaymentStep(2) // Запуск анимации списания денег
    
    setTimeout(() => {
      // Генерация билета после успешной оплаты
      const prefix = selectedOrg.category === 'ЦОН' ? 'Ц' : selectedOrg.category === 'Банки' ? 'Б' : selectedOrg.category === 'Медицина' ? 'М' : 'APL'
      const ticketNumber = `${prefix}-${Math.floor(100 + Math.random() * 900)}`
      const peopleAhead = Math.floor(3 + Math.random() * 8)
      const cost = calculatePrice(selectedOrg.avgTime)
      
      const newTicket = {
        id: Date.now(),
        orgName: selectedOrg.name,
        number: ticketNumber,
        window: windowType,
        peopleAhead: peopleAhead,
        estimatedTime: selectedOrg.avgTime,
        pricePaid: cost
      }
      
      setMyTickets([newTicket, ...myTickets])
      setShowPaymentModal(false)
      // Сброс полей карты
      setCardNumber('')
      setCardExpiry('')
      setCardCvc('')
      // Перекидываем на талоны
      setActiveTab('profile')
    }, 2500)
  }

  // Логика ответов ИИ робота
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userMessage.trim()) return

    const userText = userMessage
    const newMsg = { id: Date.now(), text: userText, sender: 'user' }
    setChatMessages(prev => [...prev, newMsg])
    setUserMessage('')
    setIsAiTyping(true)

    // Имитация размышления робота
    setTimeout(() => {
      let aiText = 'Я зафиксировал ваш запрос. Перевожу на главного оператора SmartQueue системы автоматизации Алматы.'
      const lowerText = userText.toLowerCase()

      if (lowerText.includes('привет') || lowerText.includes('салам')) {
        aiText = 'Приветствую! Чем могу помочь? Я умею рассчитывать тарифы очередей и проверять статусы ИИН.'
      } else if (lowerText.includes('оплат') || lowerText.includes('каспи') || lowerText.includes('qr') || lowerText.includes('карт')) {
        aiText = 'Оплата производится безопасно через Kaspi QR или банковскую карту встроенного шлюза при нажатии на кнопку бронирования.'
      } else if (lowerText.includes('вернуть') || lowerText.includes('возврат')) {
        aiText = 'Возврат средств за отмененный талон осуществляется автоматически в течение 5 минут обратно на вашу карту или Kaspi.'
      } else if (lowerText.includes('цон')) {
        aiText = 'ЦОНы работают с 09:00 до 18:00. Наш ИИ рекомендует выбирать Ауэзовский район, там сейчас средняя нагрузка.'
      } else if (lowerText.includes('иин')) {
        aiText = 'Ваш ИИН шифруется по стандарту SHA-256 и передается только в государственную систему для подтверждения личности.'
      }

      setChatMessages(prev => [...prev, { id: Date.now() + 1, text: aiText, sender: 'ai' }])
      setIsAiTyping(false)
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F19] via-[#111827] to-[#1A102F] text-slate-100 flex flex-col justify-between antialiased font-sans selection:bg-indigo-500 selection:text-white relative">
      
      {/* КЛЮЧЕВЫЕ СТИЛИ */}
      <style jsx global>{`
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.98) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulseGlow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }
        .animate-scale-up { animation: scaleUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-spin-slow { animation: spinSlow 20s linear infinite; }
        .animate-pulse-glow { animation: pulseGlow 3s ease-in-out infinite; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ХЕДЕР */}
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
            <button onClick={() => setActiveTab('admin')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'admin' ? 'bg-indigo-600 text-white' : 'text-cyan-400 hover:bg-slate-800'}`}>Панель Администратора ({registeredUsers.length})</button>
          </nav>

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
                <FiUserPlus /> Регистрация
              </button>
            )}
          </div>
        </div>
      </header>

      {/* НАВИГАЦИОННОЕ МЕНЮ ДЛЯ МОБИЛОК */}
      <div className="md:hidden bg-slate-950 border-b border-slate-900 flex justify-around p-2 text-[11px] font-bold uppercase sticky top-20 z-30">
        <button onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'text-indigo-400' : 'text-slate-400'}>Главная</button>
        <button onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'text-indigo-400' : 'text-slate-400'}>Талоны ({myTickets.length})</button>
        <button onClick={() => setActiveTab('admin')} className={activeTab === 'admin' ? 'text-cyan-400' : 'text-slate-400'}>Админка</button>
      </div>

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <main className="flex-grow">
        
        {activeTab === 'home' && (
          <div className="space-y-20 pb-20 animate-scale-up">
            
            {/* ГЛАВНЫЙ БАННЕР */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 grid lg:grid-cols-12 gap-12 items-center relative">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl animate-pulse-glow pointer-events-none"></div>
              
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 px-3 py-1 rounded-full text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                  ⚡ Экосистема динамического биллинга времени
                </div>
                <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none">
                  Забирайте свой талон <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">дистанционно</span>
                </h1>
                <p className="text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed">
                  SmartQueue автоматически вычисляет нагрузку ведомств Алматы, рассчитывает справедливую стоимость резерва и регистрирует вас по ИИН.
                </p>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
                  <button className="group relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-xs uppercase tracking-wider px-8 py-4 rounded-xl shadow-xl shadow-indigo-600/20 hover:scale-[1.02] transition-all flex items-center gap-3">
                    <FiSmartphone className="text-lg" />
                    Скачать приложение
                    <span className="absolute -top-2.5 -right-3 bg-pink-500 text-white font-black px-2 py-0.5 rounded-full text-[8px] uppercase">В разработке</span>
                  </button>
                  <p className="text-[11px] text-slate-500 max-w-[220px] leading-tight">
                    *В данный момент вы используете веб-портал синхронизации. Нативный софт iOS/Android пишется.
                  </p>
                </div>
              </div>

              {/* ИЛЛЮСТРАЦИЯ */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-[380px] aspect-square rounded-3xl bg-slate-900/60 border border-indigo-500/10 p-8 shadow-2xl flex items-center justify-center overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-indigo-500/10"></div>
                  <svg viewBox="0 0 200 200" className="w-full h-full text-indigo-500/20">
                    <rect x="20" y="20" width="160" height="70" rx="12" fill="#0E1324" stroke="#312E81" strokeWidth="2" />
                    <line x1="20" y1="55" x2="180" y2="55" stroke="#1E1B4B" strokeWidth="1.5" />
                    <text x="35" y="42" fill="#38BDF8" fontSize="12" fontWeight="bold" fontFamily="monospace">ЦОН A-12  Окно 3</text>
                    <text x="35" y="78" fill="#F472B6" fontSize="12" fontWeight="bold" fontFamily="monospace">KASPI B-04 Окно 1</text>
                    <circle cx="100" cy="145" r="14" fill="#8B5CF6" />
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

            {/* ГЕОЛОКАЦИЯ И ОЧЕРЕДЬ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="border-l-4 border-indigo-500 pl-4">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  <FiMapPin className="text-indigo-400 animate-pulse" /> ЦЕНТР ГЕОЛОКАЦИОННОГО ИНТЕЛЛЕКТУАЛЬНОГО БРОНИРОВАНИЯ
                </h2>
                <p className="text-slate-400 text-xs mt-1">Определите ближайшую точку, выберите услугу и рассчитайте автоматический тариф.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* Сетка гео-локаций */}
                <div className="col-span-1 lg:col-span-7 bg-slate-900/60 border border-indigo-500/10 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex gap-1.5 overflow-x-auto pb-3 border-b border-slate-800 scrollbar-none">
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                      {ORGANIZATIONS.filter(o => selectedCategory === 'Все' || o.category === selectedCategory).map(org => (
                        <div 
                          key={org.id} 
                          onClick={() => setSelectedOrg(org)}
                          className={`p-4 rounded-xl border text-xs cursor-pointer transition-all relative overflow-hidden group ${selectedOrg?.id === org.id ? 'border-purple-500 bg-purple-500/5 shadow-xl shadow-purple-500/5' : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'}`}
                        >
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <span className="text-[9px] font-mono text-purple-400 uppercase font-black tracking-wider">{org.category}</span>
                            <span className="text-[10px] font-bold text-slate-400">📍 {org.distance}</span>
                          </div>
                          <h4 className="font-bold text-white text-sm tracking-tight leading-tight group-hover:text-indigo-400">{org.name}</h4>
                          <p className="text-slate-500 text-[10px] mt-1 truncate">{org.address}</p>
                          <div className="mt-4 pt-2.5 border-t border-slate-900 flex justify-between items-center">
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${org.loadColor}`}>{org.load} нагрузка</span>
                            <span className="text-[11px] font-mono font-bold text-white">⏱ ~{org.avgTime} мин</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2 mt-4">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                    Гео-локация: <b>Алматы</b> (Автоматический поиск в радиусе 5 км)
                  </div>
                </div>

                {/* Настройка и Динамический биллинг */}
                <div className="col-span-1 lg:col-span-5 bg-gradient-to-b from-slate-900/80 to-[#15112B] border border-purple-500/10 rounded-2xl p-6 flex flex-col justify-between space-y-6">
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
                        className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-purple-500"
                      >
                        {SERVICES_BY_CATEGORY[selectedOrg?.category || 'ЦОН'].map((s, i) => (
                          <option key={i} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* Расчет стоимости */}
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
                    onClick={() => handleGetTicketClick(selectedOrg)}
                    className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-black text-xs uppercase tracking-wider py-4 rounded-xl transition-all shadow-xl shadow-purple-600/20 hover:opacity-90"
                  >
                    {!userSession ? 'Зарегистрироваться и занять очередь' : 'Перейти к оплате талона'}
                  </button>
                </div>

              </div>
            </section>

            {/* ССЫЛКИ И ИНФОРМАЦИЯ О ПОДДЕРЖКЕ */}
            <section className="max-w-md mx-auto text-center space-y-3 px-4">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-widest">Официальные шлюзы граждан</h4>
              <p className="text-slate-500 text-[11px]">Кликните на иконку ИИ Робота в правом нижнем углу экрана для мгновенной консультации.</p>
            </section>

          </div>
        )}

        {/* РАЗДЕЛ: РЕЕСТР БИЛЕТОВ */}
        {activeTab === 'profile' && (
          <div className="max-w-xl mx-auto py-12 px-4 space-y-6 animate-scale-up">
            <h2 className="text-xl font-black text-white text-center">Ваш реестр билетов</h2>
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
                      <div className="text-4xl font-mono font-black my-2 bg-slate-950 py-2 px-6 rounded-xl border border-slate-800 inline-block tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{ticket.number}</div>
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

        {/* АДМИНКА И ЭМУЛЯТОР */}
        {activeTab === 'admin' && (
          <div className="max-w-4xl mx-auto py-12 px-4 space-y-10 animate-scale-up">
            
            {/* БЛОК 1: БАЗА ПОЛЬЗОВАТЕЛЕЙ */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h2 className="text-xl font-black text-white">Реестр зарегистрированных пользователей</h2>
                  <p className="text-slate-400 text-xs">Здесь вы как Администратор видите всех, кто заполнил форму регистрации по ИИН.</p>
                </div>
                <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs px-3 py-1 rounded-xl font-bold">Всего: {registeredUsers.length}</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-4">ФИО Пользователя</th>
                        <th className="p-4">ИИН</th>
                        <th className="p-4">Номер телефона</th>
                        <th className="p-4 text-center">Статус шлюза</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-slate-300">
                      {registeredUsers.map((user, i) => (
                        <tr key={i} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-4 font-bold text-white flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-[10px] font-mono"><FiUser /></div>
                            {user.name}
                          </td>
                          <td className="p-4 font-mono text-purple-400">{user.iin}</td>
                          <td className="p-4 text-slate-400">{user.phone}</td>
                          <td className="p-4 text-center">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">Верифицирован</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* БЛОК 2: УПРАВЛЕНИЕ ОЧЕРЕДЬЮ */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-black text-white">Управление активными талонами</h3>
                <p className="text-slate-400 text-xs">Продвигайте людей вперед для симуляции работы реального оператора окошка.</p>
              </div>

              {myTickets.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-6 bg-slate-900/40 border border-dashed border-slate-800 rounded-xl">Создайте и оплатите талон на главной вкладке, чтобы протестировать симулятор окон.</p>
              ) : (
                <div className="bg-slate-950 border border-slate-800 rounded-xl divide-y divide-slate-900 text-xs">
                  {myTickets.map(t => (
                    <div key={t.id} className="p-4 flex justify-between items-center">
                      <div>
                        <span className="font-mono font-black text-cyan-400 block text-sm">{t.number}</span>
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

          </div>
        )}

      </main>

      {/* МОДАЛКА РЕГИСТРАЦИИ ПО ИИН */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F1322] border border-indigo-500/20 max-w-md w-full rounded-2xl p-6 space-y-4 relative animate-scale-up">
            {authStep === 1 ? (
              <>
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-black text-white flex items-center justify-center gap-2"><FiLock className="text-indigo-400" /> Регистрация в шлюзе SmartQueue</h3>
                  <p className="text-slate-400 text-xs">Для бронирования места введите ваши данные.</p>
                </div>
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">ИИН Гражданина (12 цифр)</label>
                    <input 
                      type="text" required maxLength={12} placeholder="020405500123" value={regIin}
                      onChange={e => setRegIin(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">ФИО</label>
                    <input 
                      type="text" required placeholder="Асылжан Кобейсембай" value={regName} onChange={e => setRegName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">Номер телефона</label>
                    <input 
                      type="text" required placeholder="+7 (707) 123-4567" value={regPhone} onChange={e => setRegPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 text-white font-bold p-3 rounded-xl text-xs uppercase tracking-wider mt-2">
                    Верифицировать профиль
                  </button>
                </form>
              </>
            ) : (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-slate-400 font-mono">Проверка подлинности ИИН по базам данных гос. шлюзов...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ИНТЕРАКТИВНЫЙ ПЛАТЕЖНЫЙ ШЛЮЗ (KASPI QR / КАРТА) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0C101F] border border-purple-500/20 max-w-md w-full rounded-2xl overflow-hidden shadow-2xl relative animate-scale-up">
            
            {/* Хедер модалки */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
              <span className="text-xs font-black uppercase text-slate-200 tracking-wider flex items-center gap-1">💳 Безопасный эквайринг SmartQueue</span>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white"><FiX size={16} /></button>
            </div>

            {paymentStep === 1 ? (
              <div className="p-6 space-y-6">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Сумма к оплате:</span>
                  <span className="text-2xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                    {selectedOrg ? calculatePrice(selectedOrg.avgTime).toLocaleString('ru-RU') : 1000} ₸
                  </span>
                </div>

                {/* Табы выбора оплаты */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button 
                    onClick={() => setPaymentMethod('qr')}
                    className={`py-2.5 rounded-lg text-xs font-bold transition-all ${paymentMethod === 'qr' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Kaspi QR
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2.5 rounded-lg text-xs font-bold transition-all ${paymentMethod === 'card' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Банковская карта
                  </button>
                </div>

                {/* Контент для Kaspi QR */}
                {paymentMethod === 'qr' && (
                  <div className="space-y-4 text-center">
                    <p className="text-xs text-slate-400 leading-tight">Откройте приложение <b>Kaspi.kz</b> → Нажмите на кнопку <b>«QR»</b> и отсканируйте код ниже:</p>
                    <div className="bg-white p-4 rounded-xl w-44 h-44 mx-auto flex flex-col justify-between items-center shadow-inner relative group">
                      {/* Эмуляция QR-кода при помощи SVG */}
                      <svg viewBox="0 0 100 100" className="w-full h-full text-slate-950">
                        <path d="M0,0 h30 v10 h-20 v20 h-10 z M70,0 h30 v30 h-10 v-20 h-20 z M0,70 h10 v20 h-20 v-30 h10 z M100,100 h-30 v-10 h20 v-20 h10 z" fill="currentColor" />
                        <rect x="15" y="15" width="20" height="20" fill="currentColor" />
                        <rect x="65" y="15" width="20" height="20" fill="currentColor" />
                        <rect x="15" y="65" width="20" height="20" fill="currentColor" />
                        {/* Рандомные точки типа QR */}
                        <rect x="45" y="25" width="10" height="10" fill="currentColor" />
                        <rect x="45" y="45" width="10" height="15" fill="currentColor" />
                        <rect x="25" y="45" width="15" height="10" fill="currentColor" />
                        <rect x="65" y="45" width="10" height="10" fill="currentColor" />
                        <rect x="65" y="65" width="15" height="15" fill="currentColor" />
                      </svg>
                      <div className="absolute inset-0 bg-slate-950/5 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-lg bg-red-600 text-white font-black text-[9px] flex items-center justify-center">kaspi</div>
                      </div>
                    </div>
                    <button 
                      onClick={handleProcessPayment}
                      className="w-full bg-emerald-600 text-white font-black text-xs uppercase tracking-wider py-3 rounded-xl flex items-center justify-center gap-2"
                    >
                      <FiCheckCircle /> Я отсканировал и оплатил в приложении
                    </button>
                  </div>
                )}

                {/* Контент для Карты */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4 text-left">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">Номер карты</label>
                      <input 
                        type="text" placeholder="4400 4321 5678 9012" value={cardNumber}
                        onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                        maxLength={19}
                        className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold uppercase">Срок (ММ/ГГ)</label>
                        <input 
                          type="text" placeholder="12/28" value={cardExpiry}
                          onChange={e => setCardExpiry(e.target.value.replace(/\D/g, '').replace(/(.{2})/, '$1/').trim())}
                          maxLength={5}
                          className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-white focus:outline-none text-center font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold uppercase">CVC / CVV</label>
                        <input 
                          type="password" placeholder="***" value={cardCvc}
                          onChange={e => setCardCvc(e.target.value.replace(/\D/g, ''))}
                          maxLength={3}
                          className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-white focus:outline-none text-center font-mono"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={handleProcessPayment}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider py-3 rounded-xl mt-2"
                    >
                      Подтвердить списание средств
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center space-y-4 px-6">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div>
                  <p className="text-xs text-slate-200 font-bold font-mono">Шлюз Банка обрабатывает транзакцию...</p>
                  <p className="text-[10px] text-slate-500 mt-1">Ожидаем сигнатуру подтверждения со стороны эмитента Алматы</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* КНОПКА И ИНТЕРФЕЙС ИИ-РОБОТА (ПОДДЕРЖКА) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        
        {isChatOpen && (
          <div className="w-80 h-96 bg-[#0E1324] border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col justify-between mb-3 animate-scale-up">
            {/* Шапка чата */}
            <div className="p-3 bg-gradient-to-r from-indigo-900 to-purple-900 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <div>
                  <span className="text-xs font-black text-white block">ИИ-Поддержка</span>
                  <span className="text-[8px] text-indigo-300 block font-mono">SmartQueue Bot v1.4</span>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white"><FiX size={14} /></button>
            </div>

            {/* Тело чата с сообщениями */}
            <div className="flex-grow p-3 overflow-y-auto space-y-2.5 text-[11px] scrollbar-none bg-slate-950/40">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-2.5 rounded-xl max-w-[85%] leading-snug ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAiTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-800 text-slate-500 p-2 rounded-xl flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
            </div>

            {/* Подвал с формой */}
            <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-800 bg-slate-950 flex gap-2">
              <input 
                type="text" placeholder="Задайте вопрос роботу (напр. цон)..." value={userMessage} onChange={e => setUserMessage(e.target.value)}
                className="flex-grow bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-indigo-500"
              />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors flex items-center justify-center"><FiSend size={12} /></button>
            </form>
          </div>
        )}

        {/* Сама круглая плавающая кнопка */}
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-12 h-12 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all relative group"
        >
          <FiMessageSquare size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -left-1 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full"></span>
        </button>

      </div>

    </div>
  )
}