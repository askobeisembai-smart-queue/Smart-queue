'use client'

import { useState, useEffect } from 'react'
import { 
  FiClock, FiCheckCircle, FiChevronRight, FiSliders, FiMessageSquare,
  FiTrendingDown, FiSmartphone, FiShield, FiCpu, FiMapPin, FiUserPlus, FiLock, FiCreditCard, 
  FiSend, FiUser, FiX, FiCheck, FiAlertTriangle, FiAward, FiActivity, FiZap, FiLogOut, FiPhone, FiMail, FiCalendar
} from 'react-icons/fi'

// База организаций
const ORGANIZATIONS = [
  { id: 'con-1', name: 'ЦОН Ауэзовского района', category: 'ЦОН', address: 'г. Алматы, ул. Жандосова, 51', avgTime: 12, load: 'Средняя', loadColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20', distance: '0.8 км', x: '35%', y: '55%' },
  { id: 'bank-2', name: 'Kaspi.kz (Флагманское отделение)', category: 'Банки', address: 'г. Алматы, ул. Толе би, 101', avgTime: 5, load: 'Низкая', loadColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', distance: '1.2 км', x: '50%', y: '40%' },
  { id: 'med-1', name: 'Городская поликлиника №5', category: 'Медицина', address: 'г. Алматы, ул. Макатаева, 141', avgTime: 22, load: 'Высокая', loadColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20', distance: '2.4 км', x: '65%', y: '30%' },
  { id: 'retail-1', name: 'Apple Premium Partner (iSpace Глобус)', category: 'Старт продаж iPhone', address: 'г. Алматы, пр. Абая, 109В', avgTime: 45, load: 'Экстремальная', loadColor: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20', distance: '3.1 км', x: '42%', y: '62%' }
]

const SERVICES_BY_CATEGORY: { [key: string]: string[] } = {
  'ЦОН': ['Выдача удостоверения личности и паспорта РК', 'Получение и обновление ЭЦП', 'Регистрация по месту жительства'],
  'Банки': ['Перевыпуск карт Kaspi Gold / Premium', 'Открытие счетов для ИП (Kaspi Pay)', 'Кассовые операции'],
  'Медицина': ['Прием врача-терапевта', 'Запись к Невропатологу', 'Консультация профильного специалиста'],
  'Старт продаж iPhone': ['Выдача предзаказов (Pre-order)', 'Живая электронная очередь (Launch Line)', 'Оформление рассрочки']
}

// Данные супер-администратора (Владельца)
const ADMIN_CREDENTIALS = {
  iin: '060621501916',
  phone: '87009522306',
  name: 'Асылжан Бейсембай'
}

export default function SmartQueueUltimate() {
  const [activeTab, setActiveTab] = useState('home')
  const [selectedCategory, setSelectedCategory] = useState('Все')
  const [selectedOrg, setSelectedOrg] = useState<any>(ORGANIZATIONS[0])
  const [windowType, setWindowType] = useState(SERVICES_BY_CATEGORY['ЦОН'][0])
  const [myTickets, setMyTickets] = useState<any[]>([])

  // База пользователей для админки
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([
    { name: 'Нурлан Ахметов', iin: '950812300456', phone: '87071112233' },
    { name: 'Алина Серикова', iin: '010322650987', phone: '87474445566' }
  ])

  // Текущая сессия
  const [userSession, setUserSession] = useState<any>(null) 
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authStep, setAuthStep] = useState(1) 
  
  // Поля формы с контролируемым вводом
  const [regIin, setRegIin] = useState('')
  const [regName, setRegName] = useState('')
  const [regPhone, setRegPhone] = useState('')

  // Платежи
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'card'>('qr')
  const [paymentStep, setPaymentStep] = useState(1)
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')

  // Чат-сервис поддержки
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<any[]>([
    { id: 1, text: 'Саламатсыз ба! Я ваш ИИ-ассистент SmartQueue. Могу помочь проверить очередь, подсказать по Kaspi QR или вызвать живого оператора.', sender: 'ai' }
  ])
  const [userMessage, setUserMessage] = useState('')
  const [isAiTyping, setIsAiTyping] = useState(false)
  const [isOperatorConnected, setIsOperatorConnected] = useState(false)

  // Жесткая проверка: доступ к админ-панели есть ТОЛЬКО у Асылжана
  const isAdmin = userSession?.iin === ADMIN_CREDENTIALS.iin && userSession?.phone?.replace(/\D/g, '') === ADMIN_CREDENTIALS.phone

  const calculatePrice = (minutes: number) => {
    return 1000 + (minutes * 50)
  }

  useEffect(() => {
    if (selectedOrg) {
      setWindowType(SERVICES_BY_CATEGORY[selectedOrg.category][0])
    }
  }, [selectedOrg])

  // Хэндлер ввода имени (Только Буквы и Пробелы)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const onlyLetters = value.replace(/[^a-zA-Zа-яА-ЯёЁәӘғҒқҚңҢөӨұҰүҮіІһҺ\s]/g, '')
    setRegName(onlyLetters)
  }

  // Хэндлер ввода телефона
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 11) {
      setRegPhone(value)
    }
  }

  const formatPhoneNumber = (digits: string) => {
    if (!digits) return ''
    if (digits.length <= 1) return `+7`
    if (digits.length <= 4) return `+7 (${digits.slice(1)}`
    if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 11)}`
  }

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (regIin.length !== 12) {
      alert('Ошибка: ИИН должен содержать ровно 12 цифр!')
      return
    }
    if (regPhone.length < 11) {
      alert('Ошибка: Неверный формат номера телефона!')
      return
    }

    setAuthStep(2)
    
    setTimeout(() => {
      const isLoggingAsAdmin = regIin === ADMIN_CREDENTIALS.iin && regPhone === ADMIN_CREDENTIALS.phone
      
      const newUser = {
        name: isLoggingAsAdmin ? ADMIN_CREDENTIALS.name : regName,
        iin: regIin,
        phone: regPhone
      }

      setUserSession(newUser)
      
      if (!registeredUsers.some(u => u.iin === regIin)) {
        setRegisteredUsers(prev => [newUser, ...prev])
      }

      setShowAuthModal(false)
      setAuthStep(1)
    }, 1500)
  }

  const handleLogout = () => {
    setUserSession(null)
    setRegIin('')
    setRegName('')
    setRegPhone('')
    setActiveTab('home')
  }

  const handleGetTicketClick = (org: any) => {
    if (!userSession) {
      setShowAuthModal(true)
      return
    }
    setPaymentStep(1)
    setShowPaymentModal(true)
  }

  const handleProcessPayment = () => {
    setPaymentStep(2)
    
    setTimeout(() => {
      const prefix = selectedOrg.category === 'ЦОН' ? 'Ц' : selectedOrg.category === 'Банки' ? 'Б' : selectedOrg.category === 'Медицина' ? 'М' : 'APL'
      const ticketNumber = `${prefix}-${Math.floor(100 + Math.random() * 900)}`
      const peopleAhead = Math.floor(2 + Math.random() * 6)
      
      const newTicket = {
        id: Date.now(),
        orgName: selectedOrg.name,
        number: ticketNumber,
        window: windowType,
        peopleAhead: peopleAhead,
        estimatedTime: selectedOrg.avgTime,
        pricePaid: calculatePrice(selectedOrg.avgTime)
      }
      
      setMyTickets([newTicket, ...myTickets])
      setShowPaymentModal(false)
      setCardNumber('')
      setCardExpiry('')
      setCardCvc('')
      setActiveTab('profile')
    }, 2000)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userMessage.trim()) return

    const userText = userMessage
    setChatMessages(prev => [...prev, { id: Date.now(), text: userText, sender: 'user' }])
    setUserMessage('')
    setIsAiTyping(true)

    setTimeout(() => {
      let aiText = 'Я обрабатываю ваш запрос. Если вам нужна реальная техническая помощь человека, напишите слово "Оператор".'
      const lowerText = userText.toLowerCase()

      if (isOperatorConnected) {
        aiText = 'Асылжан Бейсембай принял ваше обращение. Мы обрабатываем сбой интеграции с шлюзом оплаты. Ожидайте звонка на ваш номер.'
      } else if (lowerText.includes('оператор') || lowerText.includes('позови') || lowerText.includes('человек') || lowerText.includes('помощь')) {
        setIsOperatorConnected(true)
        aiText = 'Переключаю канал связи... На связи Главный системный оператор: Асылжан Бейсембай. Здравствуйте, чем могу помочь?'
      } else if (lowerText.includes('привет') || lowerText.includes('салам')) {
        aiText = 'Приветствую! Я могу помочь вам рассчитать стоимость брони ЦОна или объяснить, как сканировать Kaspi QR.'
      }

      setChatMessages(prev => [...prev, { id: Date.now() + 1, text: aiText, sender: isOperatorConnected || lowerText.includes('оператор') ? 'operator' : 'ai' }])
      setIsAiTyping(false)
    }, 1100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F19] via-[#111827] to-[#1A102F] text-slate-100 flex flex-col justify-between antialiased relative">
      
      <style jsx global>{`
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.98) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes pulseRing { 0% { transform: scale(0.95); opacity: 0.5; } 50% { transform: scale(1.15); opacity: 0.3; } 100% { transform: scale(0.95); opacity: 0.5; } }
        @keyframes scanLine { 0% { top: 0%; } 50% { top: 100%; } 100% { top: 0%; } }
        .animate-scale-up { animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-pulse-ring { animation: pulseRing 3s infinite ease-in-out; }
        .animate-scan { animation: scanLine 4s linear infinite; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ХЕДЕР С НОВЫМИ МЕНЮШКАМИ */}
      <header className="sticky top-0 z-40 bg-[#0B0F19]/80 border-b border-indigo-500/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-lg">SQ</div>
            <div>
              <span className="text-xl font-black tracking-tight text-white block">SmartQueue</span>
              <span className="text-[9px] text-purple-400 block font-bold tracking-widest uppercase">Система бронирования Асылжана</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
            <button onClick={() => setActiveTab('home')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'home' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>Главная</button>
            <button onClick={() => setActiveTab('about')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'about' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>О нас / История</button>
            <button onClick={() => setActiveTab('contacts')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'contacts' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>Контакты</button>
            <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all relative ${activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              Мои Талоны
              {myTickets.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">{myTickets.length}</span>}
            </button>
            
            {/* Доступ строго для Асылжана */}
            {userSession && isAdmin && (
              <button onClick={() => setActiveTab('admin')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'admin' ? 'bg-cyan-600 text-white animate-pulse' : 'text-cyan-400 hover:bg-slate-800'}`}>
                Панель Администратора
              </button>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {userSession ? (
              <div className="flex items-center gap-3 bg-indigo-950/40 border border-indigo-500/30 px-4 py-2 rounded-xl">
                <div className="text-xs font-mono text-right">
                  <span className="text-indigo-400 font-bold block">{userSession.name} {isAdmin && '👑'}</span>
                  <span className="text-slate-400 text-[10px]">ИИН: {userSession.iin}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white p-2 rounded-lg transition-all"
                  title="Выйти из аккаунта"
                >
                  <FiLogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { setAuthStep(1); setShowAuthModal(true); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all flex items-center gap-2"
              >
                <FiUserPlus /> Регистрация
              </button>
            )}
          </div>
        </div>
      </header>

      {/* МОБИЛЬНОЕ МЕНЮ */}
      <div className="md:hidden bg-slate-950 border-b border-slate-900 flex justify-around p-2 text-[10px] font-bold uppercase sticky top-20 z-30 overflow-x-auto">
        <button onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'text-indigo-400' : 'text-slate-400'}>Главная</button>
        <button onClick={() => setActiveTab('about')} className={activeTab === 'about' ? 'text-indigo-400' : 'text-slate-400'}>О нас</button>
        <button onClick={() => setActiveTab('contacts')} className={activeTab === 'contacts' ? 'text-indigo-400' : 'text-slate-400'}>Контакты</button>
        <button onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'text-indigo-400' : 'text-slate-400'}>Талоны ({myTickets.length})</button>
      </div>

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <main className="flex-grow">
        
        {activeTab === 'home' && (
          <div className="space-y-16 pb-20 animate-scale-up">
            
            {/* БАННЕР С АНИМАЦИЕЙ ЧЕЛОВЕКА В ОЧЕРЕДИ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 px-3 py-1 rounded-full text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                  🚀 Безопасный цифровой шлюз распределения времени
                </div>
                <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none">
                  Забирайте свой талон <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">дистанционно</span>
                </h1>
                <p className="text-slate-400 text-sm sm:text-base max-w-xl">
                  Интеллектуальная эмуляция очередей Алматы. Избавьте себя от необходимости стоять часами в душных помещениях.
                </p>
              </div>

              {/* АНИМАЦИЯ: Реальный человек в очереди */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <div className="relative w-full max-w-[340px] aspect-[4/5] bg-slate-900 rounded-3xl border border-indigo-500/20 overflow-hidden group shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80" 
                    alt="Гражданин в очереди" 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                  
                  {/* Сканирующий лазер */}
                  <div className="absolute left-0 right-0 h-[2px] bg-indigo-500/50 shadow-[0_0_15px_#6366f1] animate-scan"></div>
                  
                  {/* Статус-карточка человека */}
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold tracking-wider">Идентификация очереди</span>
                      <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-mono font-black text-xs text-white">Ц-41</div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Алина С. (Стоит в очереди)</h4>
                        <p className="text-[10px] text-slate-400">ЦОН Ауэзовского района • Окно №3</p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full w-[72%] animate-pulse"></div>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase">
                      <span>Прогресс: 72%</span>
                      <span>Осталось ~4 мин</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ГЕОЛОКАЦИЯ: ЦЕНТР СИНХРОНИЗАЦИИ И СИМУЛЯТОР КАРТЫ АЛМАТЫ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="border-l-4 border-indigo-500 pl-4">
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <FiMapPin className="text-indigo-400" /> СИНХРОНИЗАЦИЯ И КАРТА АЛМАТЫ
                </h2>
                <p className="text-slate-400 text-xs mt-1">Выберите точку на карте или из списка для мгновенного бронирования</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Список мест */}
                <div className="col-span-1 lg:col-span-6 bg-slate-900/60 border border-indigo-500/10 rounded-2xl p-6 space-y-4">
                  <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                    {['Все', 'ЦОН', 'Банки', 'Медицина'].map(cat => (
                      <button 
                        key={cat} 
                        onClick={() => setSelectedCategory(cat)} 
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                    {ORGANIZATIONS.filter(o => selectedCategory === 'Все' || o.category === selectedCategory).map(org => (
                      <div 
                        key={org.id} 
                        onClick={() => setSelectedOrg(org)}
                        className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${selectedOrg?.id === org.id ? 'border-purple-500 bg-purple-500/5' : 'border-slate-800 bg-slate-950/60'}`}
                      >
                        <span className="text-[9px] font-mono text-purple-400 uppercase font-bold">{org.category}</span>
                        <h4 className="font-bold text-white text-sm mt-0.5">{org.name}</h4>
                        <p className="text-slate-500 text-[10px] mt-1">{org.address}</p>
                        <div className="mt-4 pt-2 border-t border-slate-900 flex justify-between items-center">
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${org.loadColor}`}>{org.load}</span>
                          <span className="font-bold text-white">⏱ ~{org.avgTime} мин</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Интерактивная векторная карта Алматы */}
                <div className="col-span-1 lg:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between min-h-[350px]">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:30px_30px] opacity-20"></div>
                  
                  {/* Городские очертания контуров (Сетка) */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5"></div>

                  <div className="relative z-10 flex justify-between items-center bg-slate-900/80 backdrop-blur-sm p-3 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-[9px] text-indigo-400 font-mono font-bold uppercase block">Гео-сервер: Almaty_Core</span>
                      <h3 className="text-xs font-black text-white uppercase">Сетка распределения нагрузок</h3>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">Центр: 43.2389° N</span>
                  </div>

                  {/* Метки на карте */}
                  <div className="absolute inset-0 top-20 bottom-4 left-4 right-4">
                    {ORGANIZATIONS.map(org => (
                      <div 
                        key={org.id}
                        className="absolute transition-all duration-500"
                        style={{ left: org.x, top: org.y }}
                      >
                        <div 
                          onClick={() => setSelectedOrg(org)}
                          className={`relative group cursor-pointer flex items-center justify-center w-4 h-4 rounded-full transition-all ${selectedOrg?.id === org.id ? 'bg-purple-500 scale-125 z-20' : 'bg-slate-700 hover:bg-indigo-500'}`}
                        >
                          {/* Пульсирующий круг вокруг выбранной организации */}
                          {selectedOrg?.id === org.id && (
                            <div className="absolute w-10 h-10 border border-purple-500 rounded-full animate-pulse-ring"></div>
                          )}
                          <FiMapPin className="w-2.5 h-2.5 text-white" />
                          
                          {/* Всплывающая подсказка при наведении */}
                          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-[9px] text-slate-200 px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 font-bold">
                            {org.name} ({org.distance})
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="relative z-10 bg-slate-900/90 border border-purple-500/20 p-3 rounded-xl text-xs flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Выбранная локация:</span>
                      <span className="text-white font-black block text-xs">{selectedOrg?.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded">{selectedOrg?.distance} от вас</span>
                  </div>
                </div>
              </div>
            </section>

            {/* БИЛЛИНГ И ОФОРМЛЕНИЕ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gradient-to-r from-slate-900 via-[#15112B] to-slate-900 border border-purple-500/10 rounded-3xl p-8 grid lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-purple-300 uppercase tracking-widest flex items-center gap-2"><FiSliders /> Калькуляция пошлины талона</h3>
                  <div className="space-y-2 text-xs text-slate-400">
                    <div className="flex justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-900">
                      <span>Фиксированная пошлина системы:</span>
                      <strong className="text-white">1 000 ₸</strong>
                    </div>
                    <div className="flex justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-900">
                      <span>Нагрузка по времени ожидания (~{selectedOrg?.avgTime} мин):</span>
                      <strong className="text-white">+{selectedOrg ? selectedOrg.avgTime * 50 : 0} ₸</strong>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                    <span className="font-bold text-white text-sm">Итоговая сумма:</span>
                    <span className="text-2xl font-mono font-black text-emerald-400">{selectedOrg ? calculatePrice(selectedOrg.avgTime).toLocaleString('ru-RU') : 1000} ₸</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Необходимая государственная услуга:</label>
                  <select 
                    value={windowType} 
                    onChange={e => setWindowType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-3.5 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {SERVICES_BY_CATEGORY[selectedOrg?.category || 'ЦОН'].map((s, i) => (
                      <option key={i} value={s}>{s}</option>
                    ))}
                  </select>

                  <button 
                    onClick={() => handleGetTicketClick(selectedOrg)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-xs uppercase tracking-wider py-4 rounded-xl shadow-xl shadow-indigo-600/20 hover:from-indigo-500 hover:to-purple-500 transition-all"
                  >
                    {!userSession ? 'Пройти верификацию для брони' : 'Оплатить бронирование'}
                  </button>
                </div>
              </div>
            </section>

            {/* 3 ПРИЧИНЫ ПОЧЕМУ СТОИТ ВЫБИРАТЬ НАС */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-900 pt-16 space-y-8">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">Почему выбирают SmartQueue?</h2>
                <p className="text-slate-400 text-xs">Три фундаментальных правила архитектуры нашего сервиса</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl space-y-3 relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                  <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center text-lg font-bold">01</div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Экономия до 2 часов в день</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Вам больше не нужно физически сидеть в очередях. Система автоматически резервирует и продвигает ваш виртуальный слот на сервере, пока вы занимаетесь своими делами.
                  </p>
                </div>

                <div className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl space-y-3 relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                  <div className="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center text-lg font-bold">02</div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Прямая интеграция с шлюзами</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Мы взаимодействуем напрямую с API распределения нагрузки ЦОН и Kaspi QR. Данные синхронизируются мгновенно, исключая сбои кодов талонов.
                  </p>
                </div>

                <div className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl space-y-3 relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                  <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center text-lg font-bold">03</div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Опыт реальной логистики</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    В основе алгоритмов SmartQueue заложены принципы распределения потоков и тайм-менеджмента мегаполиса, отточенные основателем на практике.
                  </p>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* СЕКЦИЯ: О НАС И ИСТОРИЯ ОСНОВАТЕЛЯ */}
        {activeTab === 'about' && (
          <div className="max-w-3xl mx-auto py-16 px-4 space-y-12 animate-scale-up">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">История и Опыт команды</h2>
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-indigo-400 text-xs font-mono">
                <FiCalendar className="w-3 h-3" /> Нам исполнилось 3 года • Основано в Алматы
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl space-y-6">
              <div className="space-y-2 border-l-2 border-purple-500 pl-4">
                <h3 className="text-lg font-black text-white uppercase tracking-wide">Путь от курьера до разработчика</h3>
                <span className="text-xs text-purple-400 font-mono font-bold block">Личный манифест основателя — Асылжана Бейсембай</span>
              </div>
              
              <p className="text-slate-300 text-xs leading-relaxed">
                «Несколько лет назад я работал обычным курьером в <b>Яндексе</b> здесь, в Алматы. Каждый день я на своем опыте прочувствовал, что такое неэффективная логистика, километровые пробки, а главное — бесконечное, глупое ожидание в очередях при получении заказов или оформлении документов. Я понял, как дорого стоит время жителей нашего города».
              </p>

              <blockquote className="border-l-4 border-indigo-500 bg-indigo-950/20 p-4 rounded-xl text-xs text-indigo-200 italic leading-relaxed">
                "Работа в доставке научила меня видеть паттерны скопления людей и понимать, как устроены транспортные и гражданские потоки. Проведя сотни часов в ожидании, я решил, что создам инструмент, который навсегда избавит алматинцев от этой рутины."
              </blockquote>

              <p className="text-slate-300 text-xs leading-relaxed">
                Сегодня нашей компании уже <b>3 года</b>. Мы накопили колоссальный опыт в интеграции с государственными базами данных и фиксации платежей. SmartQueue — это результат переосмысления городской логистики, созданный человеком, который знает цену каждой минуте.
              </p>
            </div>

            {/* Карточка офиса */}
            <div className="bg-gradient-to-r from-slate-950 to-[#120F24] border border-slate-800 p-6 rounded-2xl grid sm:grid-cols-3 gap-6 items-center">
              <div className="text-center sm:text-left space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Штаб-квартира</span>
                <h4 className="text-sm font-black text-white uppercase">Главный офис</h4>
              </div>
              <div className="sm:col-span-2 text-xs text-slate-400 space-y-1">
                <p className="text-slate-200 font-bold">г. Алматы, Медеуский район, пр. Достык 132, БЦ "Grand", 4 этаж</p>
                <p>3 года непрерывного мониторинга городских очередей и оптимизации трафика.</p>
              </div>
            </div>
          </div>
        )}

        {/* СЕКЦИЯ: КОНТАКТЫ */}
        {activeTab === 'contacts' && (
          <div className="max-w-xl mx-auto py-16 px-4 space-y-8 animate-scale-up">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">Техническая поддержка</h2>
              <p className="text-slate-400 text-xs">Свяжитесь напрямую с операторами шлюза бронирования</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-900">
                <span className="text-slate-400 flex items-center gap-2"><FiPhone className="text-indigo-400" /> Телефон приемной:</span>
                <a href="tel:+77009522306" className="font-mono font-bold text-white hover:text-indigo-400 transition-colors">+7 (700) 952-2306</a>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-900">
                <span className="text-slate-400 flex items-center gap-2"><FiMail className="text-purple-400" /> Корпоративный Email:</span>
                <a href="mailto:support@smartqueue.kz" className="font-mono font-bold text-white hover:text-purple-400 transition-colors">support@smartqueue.kz</a>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-900">
                <span className="text-slate-400 flex items-center gap-2"><FiMapPin className="text-emerald-400" /> Адрес офиса разработки:</span>
                <span className="font-bold text-white text-right">г. Алматы, пр. Достык, 132</span>
              </div>
            </div>

            <div className="bg-indigo-950/20 border border-indigo-500/20 p-4 rounded-xl text-center text-xs text-indigo-300">
              Прием граждан и обработка писем по интеграции платежных шлюзов осуществляется круглосуточно.
            </div>
          </div>
        )}

        {/* МОИ ТАЛОНЫ */}
        {activeTab === 'profile' && (
          <div className="max-w-xl mx-auto py-12 px-4 space-y-6 animate-scale-up">
            <h2 className="text-xl font-black text-white text-center">Ваш личный кабинет талонов</h2>
            
            {userSession && (
              <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Авторизованный пользователь:</span>
                  <span className="text-white font-bold text-sm">{userSession.name}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  <FiLogOut /> Выйти из аккаунта
                </button>
              </div>
            )}

            {myTickets.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-12 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">Вы еще не приобрели ни одного билета времени.</p>
            ) : (
              <div className="space-y-4">
                {myTickets.map(ticket => (
                  <div key={ticket.id} className="bg-slate-900/80 border border-purple-500/20 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-4 bg-slate-950/60 border-b border-slate-900 flex justify-between items-center text-xs">
                      <div>
                        <h4 className="font-bold text-white">{ticket.orgName}</h4>
                        <span className="text-[10px] text-purple-400 block">{ticket.window}</span>
                      </div>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">{ticket.pricePaid} ₸</span>
                    </div>
                    <div className="p-6 text-center">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Номер в электронной очереди</span>
                      <div className="text-4xl font-mono font-black my-2 bg-slate-950 py-2 px-6 rounded-xl border border-slate-800 inline-block text-cyan-400 tracking-widest">{ticket.number}</div>
                      <p className="text-xs text-slate-400 mt-2">Людей перед вами: <b className="text-purple-400">{ticket.peopleAhead} чел.</b> | Ожидание: ~<b>{ticket.estimatedTime} мин</b></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ПАНЕЛЬ АДМИНИСТРАТОРА (СТРОГИЙ ДОСТУП ДЛЯ АСЫЛЖАНА) */}
        {activeTab === 'admin' && userSession && isAdmin && (
          <div className="max-w-4xl mx-auto py-12 px-4 space-y-10 animate-scale-up">
            <div className="bg-gradient-to-r from-cyan-950/30 to-indigo-950/30 border border-cyan-500/20 p-4 rounded-xl flex items-center gap-3">
              <div className="text-2xl text-cyan-400">👑</div>
              <div>
                <h2 className="text-sm font-black text-white uppercase">Авторизован главный супер-администратор</h2>
                <p className="text-slate-400 text-[11px]">Добро пожаловать, <b>{ADMIN_CREDENTIALS.name}</b>. Вам открыт защищенный доступ к реестру.</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-black text-white">Все зарегистрированные пользователи в системе</h3>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 font-bold uppercase text-[9px] border-b border-slate-800">
                      <th className="p-4">ФИО (Только буквы)</th>
                      <th className="p-4">ИИН</th>
                      <th className="p-4">Номер телефона</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-slate-300">
                    {registeredUsers.map((user, i) => (
                      <tr key={i} className="hover:bg-slate-900/40">
                        <td className="p-4 font-bold text-white flex items-center gap-2"><FiUser className="text-indigo-400" /> {user.name}</td>
                        <td className="p-4 font-mono text-purple-400">{user.iin}</td>
                        <td className="p-4 text-slate-400">{formatPhoneNumber(user.phone)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-black text-white">Симулятор продвижения очереди окошек</h3>
              {myTickets.length === 0 ? (
                <p className="text-slate-500 text-xs py-4 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-xl">Создайте талон на главной странице, чтобы увидеть его здесь.</p>
              ) : (
                <div className="bg-slate-950 border border-slate-800 rounded-xl divide-y divide-slate-900 text-xs">
                  {myTickets.map(t => (
                    <div key={t.id} className="p-4 flex justify-between items-center">
                      <div>
                        <span className="font-mono font-black text-cyan-400 text-sm block">{t.number}</span>
                        <span className="text-slate-400 block text-[11px]">{t.orgName}</span>
                      </div>
                      <button 
                        disabled={t.peopleAhead === 0}
                        onClick={() => {
                          setMyTickets(prev => prev.map(item => item.id === t.id ? { ...item, peopleAhead: Math.max(0, item.peopleAhead - 1) } : item))
                        }}
                        className="bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors"
                      >
                        <FiTrendingDown className="inline mr-1" /> Принять следующего (-1)
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* МОДАЛКА ВЕРИФИКАЦИИ */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F1322] border border-indigo-500/20 max-w-md w-full rounded-2xl p-6 space-y-4 relative animate-scale-up">
            <button 
              onClick={() => setShowAuthModal(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>

            {authStep === 1 ? (
              <>
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-black text-white flex items-center justify-center gap-2"><FiLock className="text-indigo-400" /> Верификация личности по ИИН</h3>
                  <p className="text-slate-400 text-xs">Заполните поля. Система распределит уровни доступа автоматически.</p>
                </div>
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">ИИН Гражданина (Строго 12 цифр)</label>
                    <input 
                      type="text" required placeholder="Введите 12 цифр" value={regIin}
                      onChange={e => setRegIin(e.target.value.replace(/\D/g, '').slice(0, 12))}
                      className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">ФИО (Только буквы)</label>
                    <input 
                      type="text" required placeholder="Например: Асылжан" value={regName}
                      onChange={handleNameChange}
                      className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">Номер телефона (Максимум 11 цифр)</label>
                    <input 
                      type="text" required placeholder="87009522306" value={regPhone}
                      onChange={handlePhoneChange}
                      className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    {regPhone && (
                      <span className="text-[10px] text-indigo-400 mt-1 block">Маска вывода: {formatPhoneNumber(regPhone)}</span>
                    )}
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all uppercase tracking-wider"
                  >
                    Подтвердить и войти
                  </button>
                </form>
              </>
            ) : (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-slate-300 font-medium">Безопасное подключение к реестрам ГБД ФЛ...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* МОДАЛКА ОПЛАТЫ */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F1322] border border-purple-500/20 max-w-md w-full rounded-2xl p-6 space-y-5 relative animate-scale-up">
            <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><FiX className="w-5 h-5" /></button>
            
            {paymentStep === 1 ? (
              <>
                <div className="text-center">
                  <h3 className="text-base font-black text-white uppercase tracking-wider">Шлюз безопасной оплаты</h3>
                  <p className="text-xs text-slate-400 mt-1">Выберите удобный способ проведения транзакции</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setPaymentMethod('qr')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${paymentMethod === 'qr' ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-slate-800 bg-slate-950 text-slate-400'}`}
                  >
                    <FiSmartphone className="w-5 h-5 text-purple-400" /> Kaspi QR Симулятор
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${paymentMethod === 'card' ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-slate-800 bg-slate-950 text-slate-400'}`}
                  >
                    <FiCreditCard className="w-5 h-5 text-indigo-400" /> Банковская карта
                  </button>
                </div>

                {paymentMethod === 'qr' ? (
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center space-y-3">
                    <div className="w-32 h-32 bg-white mx-auto rounded-lg flex items-center justify-center relative">
                      <div className="absolute inset-2 border-4 border-slate-950"></div>
                      <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center text-[10px] text-white font-black z-10">K</div>
                    </div>
                    <p className="text-[11px] text-slate-400">Нажмите кнопку ниже, чтобы сымитировать сканирование QR-кода.</p>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">Номер карты</label>
                      <input type="text" placeholder="4400 4300 0000 0000" value={cardNumber} onChange={e => setCardNumber(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Срок действия</label>
                        <input type="text" placeholder="MM/YY" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white focus:outline-none text-center" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">CVC/CVV</label>
                        <input type="password" placeholder="***" maxLength={3} value={cardCvc} onChange={e => setCardCvc(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white focus:outline-none text-center" />
                      </div>
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleProcessPayment}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all"
                >
                  Оплатить {selectedOrg ? calculatePrice(selectedOrg.avgTime) : 1000} ₸
                </button>
              </>
            ) : (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-slate-300 font-medium">Фиксация транзакции и эмиссия цифрового талона...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ПЛАВАЮЩИЙ ИИ-ЧАТ ПОДДЕРЖКИ С АСЫЛЖАНОМ */}
      <div className="fixed bottom-6 right-6 z-50">
        {isChatOpen ? (
          <div className="w-80 h-96 bg-[#0F1322] border border-indigo-500/20 rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden animate-scale-up">
            <div className="p-4 bg-indigo-950/60 border-b border-indigo-500/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${isOperatorConnected ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-400'}`}></div>
                <span className="text-xs font-bold text-white">{isOperatorConnected ? 'Служба поддержки' : 'ИИ-Ассистент SmartQueue'}</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white"><FiX className="w-4 h-4" /></button>
            </div>

            <div className="flex-grow p-4 overflow-y-auto space-y-3 scrollbar-none text-[11px]">
              {chatMessages.map(m => (
                <div key={m.id} className={`max-w-[85%] p-2.5 rounded-xl leading-relaxed ${m.sender === 'user' ? 'bg-indigo-600 text-white ml-auto rounded-tr-none' : m.sender === 'operator' ? 'bg-cyan-950/80 border border-cyan-500/30 text-cyan-200 rounded-tl-none' : 'bg-slate-900 text-slate-300 rounded-tl-none'}`}>
                  {m.text}
                </div>
              ))}
              {isAiTyping && (
                <div className="bg-slate-900 text-slate-400 max-w-[40%] p-2 rounded-xl rounded-tl-none animate-pulse">Печатает...</div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-indigo-500/10 bg-slate-950 flex gap-2">
              <input 
                type="text" placeholder="Введите ваш вопрос..." value={userMessage} onChange={e => setUserMessage(e.target.value)}
                className="flex-grow bg-slate-900 border border-slate-800 p-2 rounded-xl text-[11px] text-white focus:outline-none"
              />
              <button type="submit" className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-colors"><FiSend /></button>
            </form>
          </div>
        ) : (
          <button 
            onClick={() => setIsChatOpen(true)}
            className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-transform hover:scale-105"
          >
            <FiMessageSquare className="w-6 h-6" />
          </button>
        )}
      </div>

    </div>
  )
}