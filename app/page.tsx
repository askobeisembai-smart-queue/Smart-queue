'use client'

import { useState, useEffect } from 'react'
import { 
  FiClock, FiCheckCircle, FiChevronRight, FiSliders, FiMessageSquare,
  FiTrendingDown, FiSmartphone, FiShield, FiCpu, FiMapPin, FiUserPlus, FiLock, FiCreditCard, 
  FiSend, FiUser, FiX, FiCheck, FiAlertTriangle, FiAward, FiActivity, FiZap
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

// Данные супер-администратора
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

  // Проверка: является ли текущий юзер Асылжаном (Админом)
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

  // Хэндлер ввода телефона (Только цифры, максимум 11)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 11) {
      setRegPhone(value)
    }
  }

  // Красивое форматирование телефона для вывода на экран
  const formatPhoneNumber = (digits: string) => {
    if (!digits) return ''
    if (digits.length <= 1) return `+7`
    if (digits.length <= 4) return `+7 (${digits.slice(1)}`
    if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 11)}`
  }

  // Логика отправки формы регистрации
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

  // Умный ИИ-робот + Вызов оператора Асылжана
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
        aiText = 'Приветствую! Я могу помочь вам рассчитать стоимость брони ЦОНа или объяснить, как сканировать Kaspi QR.'
      } else if (lowerText.includes('оплат') || lowerText.includes('каспи') || lowerText.includes('qr') || lowerText.includes('карт')) {
        aiText = 'Оплата полностью автоматизирована. При выборе организации система считает базовую ставку 1000 ₸ + 50 ₸ за минуту ожидания. Оплатить можно через встроенный симулятор Kaspi QR.'
      } else if (lowerText.includes('очередь') || lowerText.includes('талон') || lowerText.includes('номер')) {
        if (myTickets.length > 0) {
          aiText = `У вас есть активный талон ${myTickets[0].number} в "${myTickets[0].orgName}". Время ожидания примерно ${myTickets[0].estimatedTime} минут.`
        } else {
          aiText = 'В данный момент у вас нет забронированных талонов. Выберите учреждение на карте и нажмите "Занять очередь".'
        }
      } else if (lowerText.includes('цон')) {
        aiText = 'ЦОНы г. Алматы работают в штатном режиме. Наименьшая загруженность сейчас наблюдается в ЦОНе Ауэзовского района.'
      }

      setChatMessages(prev => [...prev, { id: Date.now() + 1, text: aiText, sender: isOperatorConnected || lowerText.includes('оператор') ? 'operator' : 'ai' }])
      setIsAiTyping(false)
    }, 1100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F19] via-[#111827] to-[#1A102F] text-slate-100 flex flex-col justify-between antialiased relative">
      
      <style jsx global>{`
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.98) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-scale-up { animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ХЕДЕР */}
      <header className="sticky top-0 z-40 bg-[#0B0F19]/80 border-b border-indigo-500/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-lg">SQ</div>
            <div>
              <span className="text-xl font-black tracking-tight text-white block">SmartQueue</span>
              <span className="text-[9px] text-purple-400 block font-bold tracking-widest uppercase">Государственная система бронирования</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
            <button onClick={() => setActiveTab('home')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'home' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>Главная</button>
            <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all relative ${activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              Мои Талоны
              {myTickets.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">{myTickets.length}</span>}
            </button>
            
            {isAdmin && (
              <button onClick={() => setActiveTab('admin')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'admin' ? 'bg-cyan-600 text-white animate-pulse' : 'text-cyan-400 hover:bg-slate-800'}`}>
                Панель Администратора
              </button>
            )}
          </nav>

          <div>
            {userSession ? (
              <div className="text-xs font-mono bg-indigo-950/40 border border-indigo-500/30 px-4 py-2 rounded-xl text-right">
                <span className="text-indigo-400 font-bold block">{userSession.name} {isAdmin && '👑 (Админ)'}</span>
                <span className="text-slate-400 text-[10px]">ИИН: {userSession.iin}</span>
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

      {/* МОБИЛЬНОЕ МЕНЮ НАВИГАЦИИ */}
      <div className="md:hidden bg-slate-950 border-b border-slate-900 flex justify-around p-2 text-[11px] font-bold uppercase sticky top-20 z-30">
        <button onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'text-indigo-400' : 'text-slate-400'}>Главная</button>
        <button onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'text-indigo-400' : 'text-slate-400'}>Талоны ({myTickets.length})</button>
        {isAdmin && <button onClick={() => setActiveTab('admin')} className="text-cyan-400">Админка</button>}
      </div>

      {/* ОСНОВНОЕ ТЕЛО СТРАНИЦЫ */}
      <main className="flex-grow">
        
        {activeTab === 'home' && (
          <div className="space-y-20 pb-20 animate-scale-up">
            
            {/* БАННЕР */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 px-3 py-1 rounded-full text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                  🚀 Безопасный шлюз гражданских очередей
                </div>
                <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none">
                  Забирайте свой талон <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">дистанционно</span>
                </h1>
                <p className="text-slate-400 text-sm sm:text-base max-w-xl">
                  Интеллектуальная эмуляция распределения очередей в городе Алматы. Введите ИИН, пройдите верификацию и забронируйте время.
                </p>
              </div>
            </section>

            {/* ВЕРНУЛИ БЛОК ОПИСАНИЯ НАДЕЖНОСТИ И БЕЗОПАСНОСТИ ПРОЕКТА */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl space-y-3">
                  <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center text-lg font-bold">
                    <FiShield />
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Абсолютная надежность</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Все транзакции и персональные данные шифруются по протоколу SSL. Платформа сквозной авторизации проверяет ИИН через защищенные криптографические реестры.
                  </p>
                </div>

                <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl space-y-3">
                  <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center text-lg font-bold">
                    <FiCheckCircle />
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Официальный статус</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Интегрировано со структурами распределения нагрузки ЦОН и крупнейшими банковскими API Казахстана. Гарантия 100% фиксации вашего времени в системе.
                  </p>
                </div>

                <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl space-y-3">
                  <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center text-lg font-bold">
                    <FiZap />
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Мгновенный процессинг</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Никаких задержек. Генерация уникального буквенно-цифрового кода талона происходит сразу после подтверждения платежного шлюза Kaspi QR.
                  </p>
                </div>
              </div>
            </section>

            {/* ИНТЕРФЕЙС ВЫБОРА ОРГАНИЗАЦИИ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="border-l-4 border-indigo-500 pl-4">
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <FiMapPin className="text-indigo-400" /> ЦЕНТР СИНХРОНИЗАЦИИ ГОРОДСКИХ ТОЧЕК
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* Левая часть: список мест */}
                <div className="col-span-1 lg:col-span-7 bg-slate-900/60 border border-indigo-500/10 rounded-2xl p-6 space-y-4">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                {/* Правая часть: Расчет стоимости и Биллинг */}
                <div className="col-span-1 lg:col-span-5 bg-gradient-to-b from-slate-900/80 to-[#15112B] border border-purple-500/10 rounded-2xl p-6 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-purple-300 uppercase tracking-widest flex items-center gap-2"><FiSliders /> Оформление электронного чека</h3>
                    
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                      <span className="text-[9px] text-slate-500 block">Куда:</span>
                      <span className="text-white font-bold block mt-0.5">{selectedOrg?.name}</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">Выберите тип необходимой государственной услуги:</label>
                      <select 
                        value={windowType} 
                        onChange={e => setWindowType(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs font-bold text-slate-200 focus:outline-none"
                      >
                        {SERVICES_BY_CATEGORY[selectedOrg?.category || 'ЦОН'].map((s, i) => (
                          <option key={i} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div className="p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-xl text-xs space-y-2">
                      <div className="flex justify-between text-slate-400">
                        <span>Фиксированная пошлина системы:</span>
                        <span className="font-bold">1 000 ₸</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Нагрузка по времени (~{selectedOrg?.avgTime} мин):</span>
                        <span className="font-bold">+{selectedOrg ? selectedOrg.avgTime * 50 : 0} ₸</span>
                      </div>
                      <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm">
                        <span className="font-bold text-white">Сумма к оплате:</span>
                        <span className="text-base font-mono font-black text-emerald-400">
                          {selectedOrg ? calculatePrice(selectedOrg.avgTime).toLocaleString('ru-RU') : 1000} ₸
                        </span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleGetTicketClick(selectedOrg)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-xs uppercase tracking-wider py-4 rounded-xl shadow-lg shadow-indigo-600/10"
                  >
                    {!userSession ? 'Пройти регистрацию для брони' : 'Оплатить через Kaspi / Card'}
                  </button>
                </div>

              </div>
            </section>

          </div>
        )}

        {/* МОИ ТАЛОНЫ */}
        {activeTab === 'profile' && (
          <div className="max-w-xl mx-auto py-12 px-4 space-y-6 animate-scale-up">
            <h2 className="text-xl font-black text-white text-center">Ваш личный кабинет талонов</h2>
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

        {/* АДМИНКА */}
        {activeTab === 'admin' && isAdmin && (
          <div className="max-w-4xl mx-auto py-12 px-4 space-y-10 animate-scale-up">
            <div className="bg-gradient-to-r from-cyan-950/30 to-indigo-950/30 border border-cyan-500/20 p-4 rounded-xl flex items-center gap-3">
              <div className="text-2xl text-cyan-400">👑</div>
              <div>
                <h2 className="text-sm font-black text-white uppercase">Авторизован главный супер-администратор</h2>
                <p className="text-slate-400 text-[11px]">Добро пожаловать, <b>{ADMIN_CREDENTIALS.name}</b>. Вам открыт доступ к реестру ядра базы данных.</p>
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

            {/* Симулятор оператора окон */}
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

      {/* МОДАЛКА ВЕРИФИКАЦИИ С ПРАВИЛАМИ ВВОДА */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F1322] border border-indigo-500/20 max-w-md w-full rounded-2xl p-6 space-y-4 relative animate-scale-up">
            {authStep === 1 ? (
              <>
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-black text-white flex items-center justify-center gap-2"><FiLock className="text-indigo-400" /> Верификация личности по ИИН</h3>
                  <p className="text-slate-400 text-xs">Заполните поля. Система проверяет права администратора автоматически.</p>
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
                    <div className="relative">
                      <input 
                        type="text" required placeholder="87009522306" value={regPhone}
                        onChange={handlePhoneChange}
                        className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    {regPhone && (
                      <span className="text-[10px] text-indigo-400 mt-1 block">Маска вывода: {formatPhoneNumber(regPhone)}</span>
                    )}
                  </div>
                  
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-900 text-[10px] text-slate-500 flex items-center gap-2">
                    <FiShield className="text-indigo-500 shrink-0" />
                    <span>Ввод номера ограничен длиной 11 символов (как в 8 700 952 2306). Больше ввести нельзя.</span>
                  </div>

                  <button type="submit" className="w-full bg-indigo-600 text-white font-bold p-3 rounded-xl text-xs uppercase tracking-wider mt-2">
                    Войти в шлюз синхронизации
                  </button>
                </form>
              </>
            ) : (
              <div className="py-12 text-center space-y-4">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-slate-400 font-mono">Проверка криптографической подписи ИИН в базе РК...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ШЛЮЗ ОПЛАТЫ KASPI QR / БАНК КАРТА */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0C101F] border border-purple-500/20 max-w-md w-full rounded-2xl overflow-hidden shadow-2xl relative animate-scale-up">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-xs">
              <span className="font-black uppercase text-slate-200 tracking-wider flex items-center gap-1">💳 Защищенный шлюз оплаты</span>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white"><FiX size={16} /></button>
            </div>

            {paymentStep === 1 ? (
              <div className="p-6 space-y-5 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">К оплате:</span>
                  <span className="text-xl font-mono font-black text-emerald-400">
                    {selectedOrg ? calculatePrice(selectedOrg.avgTime).toLocaleString('ru-RU') : 1000} ₸
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button onClick={() => setPaymentMethod('qr')} className={`py-2 rounded-lg text-xs font-bold transition-all ${paymentMethod === 'qr' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Kaspi QR</button>
                  <button onClick={() => setPaymentMethod('card')} className={`py-2 rounded-lg text-xs font-bold transition-all ${paymentMethod === 'card' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Банковская карта</button>
                </div>

                {paymentMethod === 'qr' ? (
                  <div className="space-y-4 text-center">
                    <p className="text-slate-400 text-[11px]">Откройте приложение <b>Kaspi.kz</b> → нажмите <b>«QR»</b> и отсканируйте код:</p>
                    <div className="bg-white p-3 rounded-xl w-40 h-40 mx-auto flex flex-col justify-between items-center shadow-inner relative">
                      <svg viewBox="0 0 100 100" className="w-full h-full text-slate-950">
                        <path d="M0,0 h30 v10 h-20 v20 h-10 z M70,0 h30 v30 h-10 v-20 h-20 z M0,70 h10 v20 h-20 v-30 h10 z M100,100 h-30 v-10 h20 v-20 h10 z" fill="currentColor" />
                        <rect x="15" y="15" width="20" height="20" fill="currentColor" />
                        <rect x="65" y="15" width="20" height="20" fill="currentColor" />
                        <rect x="15" y="65" width="20" height="20" fill="currentColor" />
                        <circle cx="50" cy="50" r="8" fill="currentColor" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-red-600 text-white font-black text-[8px] px-1 py-0.5 rounded">kaspi</div>
                      </div>
                    </div>
                    <button onClick={handleProcessPayment} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl">Я подтверждаю оплату в Kaspi</button>
                  </div>
                ) : (
                  <div className="space-y-4 text-left">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">Номер банковской карты</label>
                      <input 
                        type="text" placeholder="4400 4321 5678 9012" value={cardNumber}
                        onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                        maxLength={19} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Срок (ММ/ГГ)" maxLength={5} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-center font-mono text-white" />
                      <input type="password" placeholder="CVC" maxLength={3} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-center font-mono text-white" />
                    </div>
                    <button onClick={handleProcessPayment} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl">Списать средства</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center space-y-4 px-6">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-slate-300 font-mono">Процессинг банка. Ожидаем ответа платежного шлюза...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ИИ-РОБОТ И СИМУЛЯЦИЯ ВЫЗОВА АСЫЛЖАНА БЕЙСЕМБАЯ */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        
        {isChatOpen && (
          <div className="w-80 h-96 bg-[#0E1324] border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col justify-between mb-3 animate-scale-up text-[11px]">
            {/* Хедер чата */}
            <div className={`p-3 border-b border-slate-800 flex justify-between items-center ${isOperatorConnected ? 'bg-gradient-to-r from-cyan-900 to-indigo-900' : 'bg-slate-900'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${isOperatorConnected ? 'bg-cyan-400' : 'bg-emerald-400'}`}></div>
                <div>
                  <span className="text-xs font-black text-white block">
                    {isOperatorConnected ? 'Оператор: Асылжан' : 'Умная ИИ-Поддержка'}
                  </span>
                  <span className="text-[8px] text-slate-400 block font-mono">
                    {isOperatorConnected ? 'Прямой защищенный канал' : 'Автоматический бот'}
                  </span>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white"><FiX size={14} /></button>
            </div>

            {/* Окно сообщений */}
            <div className="flex-grow p-3 overflow-y-auto space-y-2.5 bg-slate-950/40 scrollbar-none">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-2.5 rounded-xl max-w-[85%] leading-snug ${
                    msg.sender === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : msg.sender === 'operator'
                      ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/30 rounded-tl-none font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAiTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
            </div>

            {/* Ввод текста */}
            <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-800 bg-slate-950 flex gap-2">
              <input 
                type="text" placeholder="Напишите вопрос или слово 'Оператор'..." value={userMessage} onChange={e => setUserMessage(e.target.value)}
                className="flex-grow bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-indigo-500 text-[11px]"
              />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg flex items-center justify-center"><FiSend size={12} /></button>
            </form>
          </div>
        )}

        {/* Кнопка открытия виджета */}
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          <FiMessageSquare size={20} />
        </button>

      </div>

    </div>
  )
}