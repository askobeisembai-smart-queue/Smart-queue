'use client'

import { useState, useEffect } from 'react'
import { 
  FiClock, FiCheckCircle, FiChevronRight, FiSliders, FiMessageSquare,
  FiTrendingDown, FiSmartphone, FiShield, FiCpu, FiMapPin, FiUserPlus, FiLock, FiCreditCard, 
  FiSend, FiUser, FiX, FiCheck, FiAlertTriangle, FiAward, FiActivity, FiZap, FiLogOut, FiMenu, FiMinimize2
} from 'react-icons/fi'

// --- БАЗА ОРГАНИЗАЦИЙ ---
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

// --- ДАННЫЕ СУПЕР-АДМИНИСТРАТОРА ---
const ADMIN_CREDENTIALS = {
  iin: '060621501916',
  password: '1234112341',
  name: 'Асылжан Бейсембай'
}

export default function SmartQueueUltimate() {
  const [activeTab, setActiveTab] = useState('home')
  const [selectedCategory, setSelectedCategory] = useState('Все')
  const [selectedOrg, setSelectedOrg] = useState<any>(ORGANIZATIONS[0])
  const [windowType, setWindowType] = useState(SERVICES_BY_CATEGORY['ЦОН'][0])
  const [myTickets, setMyTickets] = useState<any[]>([])
  
  // Состояния для админки
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([
    { name: 'Нурлан Ахметов', iin: '950812300456', phone: '+7 (707) 111-22-33' },
    { name: 'Алина Серикова', iin: '010322650987', phone: '+7 (747) 444-55-66' }
  ])
  const [systemLogs, setSystemLogs] = useState<string[]>([
    'Система SmartQueue успешно запущена.',
    'Связь с сервером 24/7 установлена стабильно.'
  ])
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false)

  // Мобильное меню
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Сессия и авторизация
  const [userSession, setUserSession] = useState<any>(null) 
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authStep, setAuthStep] = useState(1) // 1: Ввод данных, 2: Проверка/Загрузка, 3: Запрос пароля для админа
  
  const [regIin, setRegIin] = useState('')
  const [regName, setRegName] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [adminPasswordInput, setAdminPasswordInput] = useState('')

  // Оплата
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentStep, setPaymentStep] = useState(1)
  const [cardNumber, setCardNumber] = useState('')

  // Чат поддержки
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<any[]>([
    { id: 1, text: 'Саламатсыз ба! Я ваш ИИ-ассистент SmartQueue. Могу помочь проверить очередь, подсказать по Kaspi QR или вызвать живого оператора.', sender: 'ai' }
  ])
  const [userMessage, setUserMessage] = useState('')
  const [isAiTyping, setIsAiTyping] = useState(false)

  const isAdmin = userSession?.iin === ADMIN_CREDENTIALS.iin

  const calculatePrice = (minutes: number) => 1000 + (minutes * 50)

  useEffect(() => {
    if (selectedOrg) setWindowType(SERVICES_BY_CATEGORY[selectedOrg.category][0])
  }, [selectedOrg])

  // Кастомная маска для ввода номера телефона прямо в инпуте (+7 (XXX) XXX-XX-XX)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, '') // Только цифры
    if (input.startsWith('7') || input.startsWith('8')) {
      input = input.substring(1)
    }
    input = input.substring(0, 10) // Ограничение длины

    let formatted = '+7 '
    if (input.length > 0) formatted += '(' + input.substring(0, 3)
    if (input.length >= 3) formatted += ') ' + input.substring(3, 6)
    if (input.length >= 6) formatted += '-' + input.substring(6, 8)
    if (input.length >= 8) formatted += '-' + input.substring(8, 10)

    setRegPhone(input.length === 0 ? '' : formatted)
  }

  // Логика авторизации
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (regIin.length !== 12) { alert('Ошибка: ИИН должен содержать 12 цифр!'); return }
    if (!regName.trim()) { alert('Ошибка: Введите ФИО!'); return }
    if (regPhone.length < 18) { alert('Ошибка: Введите корректный номер телефона!'); return }

    // Если пытается войти админ — требуем секретный пароль
    if (regIin === ADMIN_CREDENTIALS.iin) {
      setAuthStep(3) // Переключаем на шаг ввода пароля
    } else {
      // Обычный пользователь
      setAuthStep(2)
      setTimeout(() => {
        const newUser = { name: regName, iin: regIin, phone: regPhone }
        setUserSession(newUser)
        setShowAuthModal(false)
        setAuthStep(1)
        setActiveTab('home')
      }, 1200)
    }
  }

  // Проверка пароля админа
  const handleAdminPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (adminPasswordInput === ADMIN_CREDENTIALS.password) {
      setAuthStep(2)
      setTimeout(() => {
        const adminUser = { name: ADMIN_CREDENTIALS.name, iin: ADMIN_CREDENTIALS.iin, phone: regPhone }
        setUserSession(adminUser)
        setShowAuthModal(false)
        setAuthStep(1)
        setAdminPasswordInput('')
        setActiveTab('admin') // Сразу перенаправляем в админку
      }, 1000)
    } else {
      alert('НЕВЕРНЫЙ ПАРОЛЬ АДМИНИСТРАТОРА! Доступ заблокирован.')
      setAdminPasswordInput('')
    }
  }

  // Выход из системы
  const handleLogout = () => {
    setUserSession(null)
    setActiveTab('home')
  }

  const handleProcessPayment = () => {
    setPaymentStep(2)
    setTimeout(() => {
      const newTicket = { 
        id: Date.now(), 
        orgName: selectedOrg.name, 
        number: `SQ-${Math.floor(Math.random() * 899) + 100}`, 
        window: windowType, 
        pricePaid: calculatePrice(selectedOrg.avgTime),
        date: new Date().toLocaleTimeString()
      }
      setMyTickets([newTicket, ...myTickets])
      setShowPaymentModal(false)
      setPaymentStep(1)
      setActiveTab('profile')
    }, 2000)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userMessage.trim()) return
    setChatMessages(prev => [...prev, { id: Date.now(), text: userMessage, sender: 'user' }])
    const currentMsg = userMessage
    setUserMessage('')
    setIsAiTyping(true)

    setTimeout(() => {
      let aiText = 'Понял вас. Ваше обращение зафиксировано в системе SmartQueue.'
      if (currentMsg.toLowerCase().includes('талон') || currentMsg.toLowerCase().includes('очередь')) {
        aiText = 'Вы можете приобрести приоритетный электронный талон во вкладке Бронирования на Главной странице.'
      }
      setChatMessages(prev => [...prev, { id: Date.now() + 1, text: aiText, sender: 'ai' }])
      setIsAiTyping(false)
    }, 1200)
  }

  // --- ФУНКЦИИ АДМИН-ПАНЕЛИ ---
  const triggerClearTickets = () => {
    setMyTickets([])
    setSystemLogs(prev => [`[${new Date().toLocaleTimeString()}] Администратор сбросил базу активных талонов пользователей.`, ...prev])
    alert('Все активные талоны в системе успешно аннулированы.')
  }

  const triggerGenerateReport = () => {
    setSystemLogs(prev => [`[${new Date().toLocaleTimeString()}] Сгенерирован полный аналитический отчет по нагрузке ЦОН/Банков.`, ...prev])
    alert('Отчет успешно сгенерирован и отправлен на ваш e-mail: asylzhan@smartqueue.kz')
  }

  const triggerToggleMaintenance = () => {
    setIsMaintenanceMode(!isMaintenanceMode)
    setSystemLogs(prev => [`[${new Date().toLocaleTimeString()}] Режим тех. работ переключен в состояние: ${!isMaintenanceMode ? 'ВКЛ' : 'ВЫКЛ'}`, ...prev])
  }

  const triggerAddFakeUser = () => {
    const fakeNames = ['Мадияр Оспанов', 'Жанель Султанова', 'Данияр Ибрагимов']
    const randomName = fakeNames[Math.floor(Math.random() * fakeNames.length)]
    const randomIin = Math.floor(100000000000 + Math.random() * 899999999999).toString()
    const newUser = { name: randomName, iin: randomIin, phone: '+7 (777) 999-88-77' }
    setRegisteredUsers([...registeredUsers, newUser])
    setSystemLogs(prev => [`[${new Date().toLocaleTimeString()}] В систему добавлен новый тестовый клиент: ${randomName}`, ...prev])
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 font-sans selection:bg-indigo-500/30 flex flex-col justify-between">
      
      {/* HEADER & NAVIGATION WITH BURGER MENU */}
      <header className="sticky top-0 z-40 bg-[#0B0F19]/90 border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }}>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-600/30">SQ</div>
            <span className="text-xl font-black tracking-wider bg-gradient-to-r innovators from-white to-slate-400 bg-clip-text text-transparent">SmartQueue</span>
          </div>

          {/* Настольное меню */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest">
            <button onClick={() => setActiveTab('home')} className={`hover:text-indigo-400 transition ${activeTab === 'home' ? 'text-indigo-500' : 'text-slate-300'}`}>Главная</button>
            <button onClick={() => setActiveTab('profile')} className={`hover:text-indigo-400 transition ${activeTab === 'profile' ? 'text-indigo-500' : 'text-slate-300'}`}>Мои Талоны</button>
            <button onClick={() => setActiveTab('about')} className={`hover:text-indigo-400 transition ${activeTab === 'about' ? 'text-indigo-500' : 'text-slate-300'}`}>О нас</button>
            {isAdmin && (
              <button onClick={() => setActiveTab('admin')} className={`hover:text-cyan-400 transition flex items-center gap-1 ${activeTab === 'admin' ? 'text-cyan-400' : 'text-cyan-500/80'}`}>
                <FiSliders /> Админка
              </button>
            )}
          </nav>

          {/* Правая часть: Профиль / Вход и кнопка Бургера для мобилок */}
          <div className="flex items-center gap-4">
            {userSession ? (
              <div className="hidden sm:flex items-center gap-3 bg-slate-900 border border-slate-800 py-1.5 px-3.5 rounded-xl">
                <div className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-cyan-400' : 'bg-indigo-500'}`}></div>
                <span className="text-xs font-bold tracking-wide text-slate-200">{userSession.name}</span>
                <button onClick={handleLogout} title="Выйти" className="text-slate-500 hover:text-rose-400 transition ml-1">
                  <FiLogOut size={14} />
                </button>
              </div>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all shadow-lg shadow-indigo-600/20">
                <FiUserPlus size={14} /> Вход / Регистрация
              </button>
            )}

            {/* Иконка мобильного меню (Бургер) */}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-slate-400 hover:text-white transition focus:outline-none">
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Выпадающее Бургер-меню для мобильных устройств */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#0D1322] border-b border-slate-800 px-6 py-6 space-y-4 absolute left-0 right-0 top-20 shadow-2xl animate-fade-in">
            <button onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }} className={`block w-full text-left font-bold text-sm py-2 ${activeTab === 'home' ? 'text-indigo-500' : 'text-slate-300'}`}>Главная</button>
            <button onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }} className={`block w-full text-left font-bold text-sm py-2 ${activeTab === 'profile' ? 'text-indigo-500' : 'text-slate-300'}`}>Мои Талоны</button>
            <button onClick={() => { setActiveTab('about'); setIsMobileMenuOpen(false); }} className={`block w-full text-left font-bold text-sm py-2 ${activeTab === 'about' ? 'text-indigo-500' : 'text-slate-300'}`}>О нас</button>
            {isAdmin && (
              <button onClick={() => { setActiveTab('admin'); setIsMobileMenuOpen(false); }} className={`block w-full text-left font-bold text-sm py-2 text-cyan-400 ${activeTab === 'admin' ? 'underline' : ''}`}>Админка</button>
            )}
            
            <div className="border-t border-slate-800 pt-4 mt-2">
              {userSession ? (
                <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl">
                  <span className="text-xs font-bold text-slate-300">{userSession.name}</span>
                  <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-rose-400 font-bold text-xs flex items-center gap-1">
                    Выйти <FiLogOut size={12} />
                  </button>
                </div>
              ) : (
                <button onClick={() => { setShowAuthModal(true); setIsMobileMenuOpen(false); }} className="w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-xs font-bold tracking-wider transition">
                  Войти в аккаунт
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto py-12 px-6 flex-grow w-full">
        
        {/* ИНДИКАТОР ТЕХ. РАБОТ */}
        {isMaintenanceMode && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 mb-8 flex items-center gap-3 text-rose-400 text-sm">
            <FiAlertTriangle className="flex-shrink-0" size={18} />
            <span><strong>Внимание:</strong> Администратор перевёл систему в демонстрационный режим технического обслуживания. Бронирование может работать нестабильно.</span>
          </div>
        )}

        {/* ВКЛАДКА: ГЛАВНАЯ */}
        {activeTab === 'home' && (
          <div className="grid lg:grid-cols-3 gap-10 items-start">
            
            {/* Описание и выбор организации */}
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-xs font-bold uppercase tracking-wider">
                  <FiZap size={12} /> Умная Алматинская Электронная Очередь
                </div>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none">
                  Экономьте часы. <br/>Управляйте временем, <br/><span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">а не живой очередью.</span>
                </h1>
                <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
                  Покупайте цифровой приоритетный талон, отслеживайте движение клиентов в реальном времени и подходите строго к назначенному времени в ЦОНы и банки без ожидания.
                </p>
              </div>

              {/* Категории фильтров */}
              <div className="flex flex-wrap gap-2.5 border-b border-slate-800 pb-4">
                {['Все', 'ЦОН', 'Банки', 'Медицина', 'Старт продаж iPhone'].map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
                    {cat}
                  </button>
                ))}
              </div>

              {/* Сетка заведений */}
              <div className="grid sm:grid-cols-2 gap-4">
                {ORGANIZATIONS.filter(o => selectedCategory === 'Все' || o.category === selectedCategory).map(org => (
                  <div key={org.id} onClick={() => setSelectedOrg(org)} className={`p-5 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between h-44 ${selectedOrg.id === org.id ? 'border-indigo-500 bg-indigo-950/40 shadow-xl shadow-indigo-600/5' : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900/90'}`}>
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="text-[10px] uppercase font-extrabold tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">{org.category}</span>
                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1"><FiMapPin size={12}/> {org.distance}</span>
                      </div>
                      <h3 className="font-bold text-slate-100 group-hover:text-indigo-400 transition text-sm sm:text-base line-clamp-2">{org.name}</h3>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-slate-800/60 pt-3 mt-2">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <FiClock size={13} className="text-slate-500" /> Ср. ожидание: <strong className="text-slate-200">{org.avgTime} мин</strong>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${org.loadColor}`}>{org.load}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Карточка Настройки Бронирования */}
            <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/10 rounded-full filter blur-3xl pointer-events-none"></div>
              <h2 className="text-lg font-black tracking-wide text-white mb-6 flex items-center gap-2">
                <FiCreditCard className="text-indigo-500" /> Оформление талона
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Выбранный филиал</label>
                  <div className="bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300">
                    {selectedOrg.name}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Выберите тип услуги / окно</label>
                  <select value={windowType} onChange={e => setWindowType(e.target.value)} className="w-full bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none focus:border-indigo-500 transition">
                    {SERVICES_BY_CATEGORY[selectedOrg.category]?.map((service, index) => (
                      <option key={index} value={service}>{service}</option>
                    ))}
                  </select>
                </div>

                {/* Расчет стоимости за приоритет */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Базовый сервисный сбор:</span>
                    <span>1 000 ₸</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Коэффициент загруженности ({selectedOrg.load}):</span>
                    <span>+{selectedOrg.avgTime * 50} ₸</span>
                  </div>
                  <div className="border-t border-slate-800/80 pt-2 flex justify-between font-bold text-slate-200 text-sm">
                    <span>Итого к оплате:</span>
                    <span className="text-indigo-400 font-extrabold">{calculatePrice(selectedOrg.avgTime)} ₸</span>
                  </div>
                </div>

                <button onClick={() => {
                  if (!userSession) {
                    setShowAuthModal(true)
                  } else {
                    setShowPaymentModal(true)
                  }
                }} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs tracking-wider uppercase py-4 rounded-xl transition-all shadow-lg shadow-indigo-600/10 active:scale-[0.98]">
                  {userSession ? 'Перейти к оплате приоритета' : 'Сначала авторизуйтесь'}
                </button>
                <p className="text-[10px] text-center text-slate-500 leading-normal">Нажимая кнопку, вы подтверждаете согласие на обработку ИИН и проведение электронного платежа.</p>
              </div>
            </div>
          </div>
        )}

        {/* ВКЛАДКА: МОИ ТАЛОНЫ */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Ваш цифровой кошелек талонов</h2>
                <p className="text-slate-400 text-xs mt-1">Покажите этот экран или QR-код (внутри талона) терминалу самообслуживания в зале ожидания.</p>
              </div>
              <span className="text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-bold text-indigo-400">{myTickets.length} шт</span>
            </div>

            {myTickets.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/40 border border-slate-800/60 rounded-3xl space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500"><FiActivity size={20}/></div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-slate-300">Активных билетов не найдено</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">Вы еще не оформляли приоритетные пропуска. Выберите организацию на главной странице.</p>
                </div>
                <button onClick={() => setActiveTab('home')} className="bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-600/20 transition">Забронировать сейчас</button>
              </div>
            ) : (
              <div className="space-y-4">
                {myTickets.map(ticket => (
                  <div key={ticket.id} className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl flex flex-col sm:flex-row justify-between gap-6 items-start sm:items-center">
                    <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-b from-indigo-500 to-purple-500"></div>
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{ticket.date} — Оформлено через систему SmartQueue</span>
                      <h3 className="font-black text-slate-100 text-base sm:text-lg">{ticket.orgName}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1"><FiChevronRight size={14} className="text-indigo-500"/> {ticket.window}</p>
                    </div>
                    <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
                      <div className="text-3xl font-black text-indigo-400 tracking-wider font-mono">{ticket.number}</div>
                      <div className="text-[11px] text-emerald-400 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 mt-1">Оплачено {ticket.pricePaid} ₸</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ВКЛАДКА: О НАС */}
        {activeTab === 'about' && (
          <div className="max-w-3xl mx-auto space-y-10">
            <div className="space-y-4 text-center">
              <h2 className="text-3xl font-black tracking-tight">О проекте SmartQueue</h2>
              <p className="text-slate-400 text-sm max-w-lg mx-auto">Инновационное решение для цифровизации городских процессов Алматы. Мы связываем государственные учреждения и клиентов в единую бесшовную экосистему.</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto"><FiShield size={18}/></div>
                <h4 className="font-bold text-sm">Абсолютная безопасность</h4>
                <p className="text-xs text-slate-500">Защита транзакций и шифрование персональных данных ИИН на банковском уровне.</p>
              </div>
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto"><FiCpu size={18}/></div>
                <h4 className="font-bold text-sm">Доступность 24/7</h4>
                <p className="text-xs text-slate-500">Отказоустойчивые распределенные облачные сервера гарантируют стабильный аптайм.</p>
              </div>
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto"><FiAward size={18}/></div>
                <h4 className="font-bold text-sm">Приоритетный пропуск</h4>
                <p className="text-xs text-slate-500">Умные алгоритмы распределения динамически выделяют свободные окна операторов.</p>
              </div>
            </div>
          </div>
        )}

        {/* ВКЛАДКА: АДМИНКА (ДОСТУП ТОЛЬКО ПО ПАРОЛЮ) */}
        {activeTab === 'admin' && isAdmin && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-2xl font-black text-cyan-400 flex items-center gap-2">
                  <FiSliders /> Ручной пульт супер-администратора
                </h2>
                <p className="text-slate-400 text-xs mt-1">Уровень доступа: Разработчик / Владелец системы (Root Account).</p>
              </div>
              <div className="text-xs font-semibold bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-4 py-2 rounded-xl">
                Авторизован: {ADMIN_CREDENTIALS.name}
              </div>
            </div>

            {/* БЛОК ДЕЙСТВИЙ (КНОПКИ КЛИКАБЕЛЬНЫ И РАБОТАЮТ) */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button onClick={triggerClearTickets} className="p-5 text-left bg-slate-900 border border-slate-800 hover:border-indigo-500 rounded-2xl group transition space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition"><FiX size={18}/></div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-200">Очистить очереди</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Сбросить все созданные талоны клиентов во всех базах данных.</p>
                </div>
              </button>

              <button onClick={triggerGenerateReport} className="p-5 text-left bg-slate-900 border border-slate-800 hover:border-emerald-500 rounded-2xl group transition space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition"><FiCheckCircle size={18}/></div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-200">Выгрузить отчёт</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Сформировать CSV/PDF сводку по финансовым транзакциям за день.</p>
                </div>
              </button>

              <button onClick={triggerToggleMaintenance} className={`p-5 text-left bg-slate-900 border rounded-2xl group transition space-y-3 ${isMaintenanceMode ? 'border-rose-500 bg-rose-950/20' : 'border-slate-800 hover:border-rose-500'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${isMaintenanceMode ? 'bg-rose-600 text-white' : 'bg-rose-500/10 text-rose-400 group-hover:bg-rose-600 group-hover:text-white'}`}><FiAlertTriangle size={18}/></div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-200">{isMaintenanceMode ? 'Выключить тех. работы' : 'Режим тех. работ'}</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Имитация аварийной блокировки проведения платежей.</p>
                </div>
              </button>

              <button onClick={triggerAddFakeUser} className="p-5 text-left bg-slate-900 border border-slate-800 hover:border-cyan-500 rounded-2xl group transition space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white flex items-center justify-center transition"><FiUserPlus size={18}/></div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-200">+ Тестовый клиент</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Сгенерировать случайного пользователя в реальном времени.</p>
                </div>
              </button>
            </div>

            {/* ДВЕ ТАБЛИЦЫ ВНУТРИ АДМИНКИ */}
            <div className="grid lg:grid-cols-3 gap-6">
              
              {/* Логирование */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <FiActivity size={14} className="text-cyan-400"/> Системные логи консоли ядра (24/7)
                </h3>
                <div className="bg-slate-950 rounded-xl p-4 h-60 overflow-y-auto font-mono text-[11px] space-y-2 text-slate-400 border border-slate-800">
                  {systemLogs.map((log, index) => (
                    <div key={index} className="leading-relaxed border-b border-slate-900 pb-1 last:border-0">
                      <span className="text-cyan-500">&gt;</span> {log}
                    </div>
                  ))}
                </div>
              </div>

              {/* База зарегистрированных пользователей */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <FiUser size={14} className="text-cyan-400"/> Зарегистрированы ({registeredUsers.length})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {registeredUsers.map((u, i) => (
                    <div key={i} className="bg-slate-950 p-3 rounded-xl border border-slate-800/60 text-xs">
                      <div className="font-bold text-slate-200">{u.name}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">ИИН: {u.iin}</div>
                      <div className="text-slate-400 text-[10px] mt-0.5">{u.phone}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© 2026 SmartQueue. Все права защищены. Разработано в г. Алматы.</div>
          <div className="flex gap-4 text-[11px] font-semibold">
            <span className="text-emerald-500 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Uptime 100% (24/7)</span>
          </div>
        </div>
      </footer>

      {/* МОДАЛЬНОЕ ОКНО: ВХОД / РЕГИСТРАЦИЯ С МАСКОЙ */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl max-w-sm w-full border border-slate-800 shadow-2xl relative animate-scale-up">
            <button onClick={() => { setShowAuthModal(false); setAuthStep(1); }} className="absolute top-4 right-4 text-slate-500 hover:text-white transition">
              <FiX size={18} />
            </button>

            {/* Шаг 1: Форма заполнения */}
            {authStep === 1 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-black tracking-tight">Вход в систему</h3>
                  <p className="text-xs text-slate-500 mt-1">Заполните данные для генерации талона.</p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">ИИН</label>
                    <input 
                      type="text"
                      maxLength={12}
                      required
                      placeholder="Введите 12 цифр ИИН"
                      value={regIin}
                      onChange={e => setRegIin(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-200 placeholder:text-slate-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">ФИО</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Имя Фамилия"
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-200 placeholder:text-slate-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Номер мобильного телефона</label>
                    <input 
                      type="text" 
                      required
                      placeholder="+7 (700) 000-00-00"
                      value={regPhone}
                      onChange={handlePhoneChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-200 placeholder:text-slate-600 font-mono tracking-wide"
                    />
                  </div>

                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-wider uppercase py-3.5 rounded-xl transition mt-4 shadow-lg shadow-indigo-600/10">
                    Авторизоваться
                  </button>
                </form>
              </div>
            )}

            {/* Шаг 2: Имитация шифрования сессии */}
            {authStep === 2 && (
              <div className="text-center py-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto animate-spin"><FiCpu size={24}/></div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-200">Создание защищенной сессии</h4>
                  <p className="text-xs text-slate-500">Проверка подлинности ИИН в базе SmartQueue...</p>
                </div>
              </div>
            )}

            {/* Шаг 3: Секретная проверка админа (ЕСЛИ ВВЕДЕН ТВОЙ ИИН) */}
            {authStep === 3 && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto mb-2"><FiLock size={20}/></div>
                  <h3 className="text-base font-black text-cyan-400">Обнаружен профиль Суперадмина</h3>
                  <p className="text-xs text-slate-500 mt-1">Введите секретный пароль разработчика для входа.</p>
                </div>

                <form onSubmit={handleAdminPasswordSubmit} className="space-y-3 pt-2">
                  <input 
                    type="password" 
                    required
                    autoFocus
                    placeholder="Введите защитный пароль"
                    value={adminPasswordInput}
                    onChange={e => setAdminPasswordInput(e.target.value)}
                    className="w-full bg-slate-950 border border-cyan-500/40 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-cyan-400 text-slate-200 placeholder:text-slate-700 font-mono text-center tracking-widest"
                  />
                  <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-extrabold text-xs tracking-wider uppercase py-3 rounded-xl transition">
                    Подтвердить Root-доступ
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО: ОПЛАТА ТАЛОНА */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl max-w-sm w-full border border-slate-800 shadow-2xl relative">
            <button onClick={() => { setShowPaymentModal(false); setPaymentStep(1); }} className="absolute top-4 right-4 text-slate-500 hover:text-white transition">
              <FiX size={18} />
            </button>

            {paymentStep === 1 ? (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-black tracking-wide">Шлюз защищенных транзакций</h3>
                  <p className="text-xs text-slate-500 mt-1">К оплате спишется: <strong className="text-indigo-400">{calculatePrice(selectedOrg.avgTime)} ₸</strong></p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Номер банковской карты</label>
                    <input 
                      type="text" 
                      placeholder="4000 0000 0000 0000"
                      maxLength={16}
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-200 text-center tracking-widest font-mono"
                    />
                  </div>
                  <button onClick={handleProcessPayment} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wider uppercase py-3.5 rounded-xl transition shadow-lg shadow-emerald-600/10">
                    Подтвердить и списать средства
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto animate-bounce"><FiCheck size={24}/></div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-200">Платеж успешно обработан</h4>
                  <p className="text-xs text-slate-500">Генерируем уникальный токен талона {windowType}...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ЧАТ-ПОДДЕРЖКА (ИИ-АССИСТЕНТ) */}
      <div className="fixed bottom-6 right-6 z-40 font-sans">
        {!isChatOpen ? (
          <button onClick={() => setIsChatOpen(true)} className="w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all relative group">
            <FiMessageSquare size={22} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0B0F19] flex items-center justify-center text-[8px] font-bold text-white">1</span>
          </button>
        ) : (
          <div className="w-80 sm:w-96 h-[450px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-up">
            {/* Шапка чата */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <div>
                  <div className="text-xs font-black tracking-wide text-slate-200">SmartQueue AI Ассистент</div>
                  <div className="text-[10px] text-slate-500">Система автоматической помощи</div>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-slate-500 hover:text-white transition">
                <FiMinimize2 size={16} />
              </button>
            </div>

            {/* Тело чата с сообщениями */}
            <div className="flex-grow p-4 overflow-y-auto space-y-3.5 bg-slate-900/40">
              {chatMessages.map(m => (
                <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${m.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-950 border border-slate-800 text-slate-300 rounded-tl-none'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isAiTyping && (
                <div className="text-[11px] text-slate-500 font-medium animate-pulse flex items-center gap-1">
                  SmartQueue ИИ печатает ответ...
                </div>
              )}
            </div>

            {/* Поле ввода сообщения */}
            <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
              <input 
                type="text"
                value={userMessage}
                onChange={e => setUserMessage(e.target.value)}
                placeholder="Задайте вопрос по очередям в Алматы..." 
                className="flex-grow bg-slate-900 text-slate-200 px-3 py-2.5 rounded-xl text-xs border border-slate-800 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 font-medium"
              />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition flex items-center justify-center">
                <FiSend size={14} />
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  )
}