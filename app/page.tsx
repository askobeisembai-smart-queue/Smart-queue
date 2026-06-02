'use client'

import { useState, useEffect } from 'react'
import { 
  FiClock, FiCheckCircle, FiChevronRight, FiSliders, FiMessageSquare,
  FiTrendingDown, FiSmartphone, FiShield, FiCpu, FiMapPin, FiUserPlus, FiLock, FiCreditCard, 
  FiSend, FiUser, FiX, FiCheck, FiAlertTriangle, FiActivity, FiRadio, FiBell, FiTrash2, FiLogOut, FiMenu
} from 'react-icons/fi'

// --- ИМПОРТИРУЕМ ТВОЮ РОДНУЮ БАЗУ ДАННЫХ ИЗ ТВOЕГО ФАЙЛА ---
// Если твой файл называется firebase.js, Next.js сам поймет этот путь:
import { db } from './firebase' 
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore'

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
  
  // Состояния данных из Firebase
  const [myTickets, setMyTickets] = useState<any[]>([])
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([])
  const [systemLogs, setSystemLogs] = useState<string[]>([
    'Система SmartQueue успешно запущена.',
    'Связь с сервером Firebase 24/7 установлена стабильно.'
  ])

  // Состояния режимов
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false)
  const [isDdosAttack, setIsDdosAttack] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Сессия и авторизация
  const [userSession, setUserSession] = useState<any>(null) 
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authStep, setAuthStep] = useState(1) 
  
  const [regIin, setRegIin] = useState('')
  const [regName, setRegName] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [adminPasswordInput, setAdminPasswordInput] = useState('')

  // Оплата
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentStep, setPaymentStep] = useState(1)
  const [cardNumber, setCardNumber] = useState('')

  const isAdmin = userSession?.iin === ADMIN_CREDENTIALS.iin
  const calculatePrice = (minutes: number) => 1000 + (minutes * 50)

  // Синхронизация категории и услуг
  useEffect(() => {
    if (selectedOrg) setWindowType(SERVICES_BY_CATEGORY[selectedOrg.category][0])
  }, [selectedOrg])

  // ЗАГРУЗКА ДАННЫХ ИЗ FIREBASE ПРИ СТАРТЕ
  useEffect(() => {
    const loadFirebaseData = async () => {
      try {
        const ticketsSnapshot = await getDocs(query(collection(db, 'tickets'), orderBy('date', 'desc')))
        const ticketsList = ticketsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setMyTickets(ticketsList)

        const usersSnapshot = await getDocs(collection(db, 'users'))
        const usersList = usersSnapshot.docs.map(doc => doc.data())
        setRegisteredUsers(usersList)
      } catch (error) {
        console.error("Ошибка синхронизации с вашим файлом Firebase:", error)
      }
    }
    loadFirebaseData()
  }, [userSession])

  // Маска телефона (строго начинается с +7)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value
    if (input.length < 4) {
      setRegPhone('')
      return
    }
    let digits = input.substring(3).replace(/\D/g, '').substring(0, 10)
    let formatted = '+7 '
    if (digits.length > 0) formatted += '(' + digits.substring(0, 3)
    if (digits.length >= 3) formatted += ') ' + digits.substring(3, 6)
    if (digits.length >= 6) formatted += '-' + digits.substring(6, 8)
    if (digits.length >= 8) formatted += '-' + digits.substring(8, 10)

    setRegPhone(formatted)
  }

  const handlePhoneFocus = () => {
    if (!regPhone) setRegPhone('+7 ')
  }

  // Авторизация + запись в Firebase
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (regIin.length !== 12) { alert('Ошибка: ИИН должен содержать 12 цифр!'); return }
    if (!regName.trim()) { alert('Ошибка: Введите ФИО!'); return }
    if (regPhone.length < 18) { alert('Ошибка: Введите корректный номер телефона!'); return }

    if (regIin === ADMIN_CREDENTIALS.iin) {
      setAuthStep(3) 
    } else {
      setAuthStep(2)
      try {
        const newUser = { name: regName, iin: regIin, phone: regPhone, createdAt: new Date().toISOString() }
        await addDoc(collection(db, 'users'), newUser)
        
        setUserSession(newUser)
        setShowAuthModal(false)
        setAuthStep(1)
        setActiveTab('home')
      } catch (err) {
        alert("Ошибка Firebase при регистрации")
        setAuthStep(1)
      }
    }
  }

  // Пароль админа
  const handleAdminPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (adminPasswordInput === ADMIN_CREDENTIALS.password) {
      setAuthStep(2)
      setTimeout(() => {
        const adminUser = { name: ADMIN_CREDENTIALS.name, iin: ADMIN_CREDENTIALS.iin, phone: regPhone || '+7 (706) 000-00-00' }
        setUserSession(adminUser)
        setShowAuthModal(false)
        setAuthStep(1)
        setAdminPasswordInput('')
        setActiveTab('admin') 
      }, 1000)
    } else {
      alert('НЕВЕРНЫЙ ПАРОЛЬ АДМИНИСТРАТОРА!')
      setAdminPasswordInput('')
    }
  }

  const handleLogout = () => {
    setUserSession(null)
    setActiveTab('home')
  }

  // Покупка талона с отправкой в твой Firestore
  const handleProcessPayment = async () => {
    setPaymentStep(2)
    try {
      const ticketData = {
        orgName: selectedOrg.name,
        number: `SQ-${Math.floor(Math.random() * 899) + 100}`,
        window: windowType,
        pricePaid: calculatePrice(selectedOrg.avgTime),
        date: new Date().toLocaleTimeString(),
        userIin: userSession?.iin || 'guest'
      }

      await addDoc(collection(db, 'tickets'), ticketData)
      setMyTickets([ticketData, ...myTickets])
      setShowPaymentModal(false)
      setPaymentStep(1)
      setActiveTab('profile')
    } catch (error) {
      alert("Ошибка платежного шлюза Firebase")
      setPaymentStep(1)
    }
  }

  // --- АДМИН-ФУНКЦИИ ---
  const triggerClearTickets = async () => {
    if(confirm("Вы уверены, что хотите полностью очистить базу данных талонов в Firebase?")) {
      try {
        const querySnapshot = await getDocs(collection(db, "tickets"))
        querySnapshot.forEach(async (cameraDoc) => {
          await deleteDoc(doc(db, "tickets", cameraDoc.id))
        })
        setMyTickets([])
        setSystemLogs(prev => [`[${new Date().toLocaleTimeString()}] ⚠️ База Firestore успешно очищена суперадмином.`, ...prev])
        alert('Все талоны удалены из облака Firebase!')
      } catch (err) {
        alert("Ошибка удаления документов")
      }
    }
  }

  const triggerGenerateReport = () => {
    setSystemLogs(prev => [`[${new Date().toLocaleTimeString()}] 📊 Сформирован финансовый отчет по API Firebase.`, ...prev])
    alert('Отчет успешно сформирован.');
  }

  const triggerToggleMaintenance = () => {
    setIsMaintenanceMode(!isMaintenanceMode)
    setSystemLogs(prev => [`[${new Date().toLocaleTimeString()}] 🛠 Режим тех. работ изменен на: ${!isMaintenanceMode ? 'ВКЛ' : 'ВЫКЛ'}`, ...prev])
  }

  const triggerAddFakeUser = async () => {
    const fakeNames = ['Мадияр Оспанов', 'Жанель Султанова', 'Данияр Ибрагимов']
    const randomName = fakeNames[Math.floor(Math.random() * fakeNames.length)]
    const randomIin = Math.floor(100000000000 + Math.random() * 899999999999).toString()
    
    const mockUser = { name: randomName, iin: randomIin, phone: '+7 (777) 999-88-77' }
    await addDoc(collection(db, 'users'), mockUser)
    
    setRegisteredUsers([...registeredUsers, mockUser])
    setSystemLogs(prev => [`[${new Date().toLocaleTimeString()}] 👤 В Firebase добавлен бот: ${randomName}`, ...prev])
  }

  const triggerDdosSimulation = () => {
    setIsDdosAttack(true)
    setSystemLogs(prev => [
      `[${new Date().toLocaleTimeString()}] 🔥 ТРЕВОГА: Всплеск трафика симулирован!`,
      `[${new Date().toLocaleTimeString()}] 🛡 ЗАЩИТА 24/7: Cloud-фильтры отработали штатно.`,
      ...prev
    ])
    setTimeout(() => { setIsDdosAttack(false) }, 5000)
  }

  const triggerPushBroadcast = () => {
    setSystemLogs(prev => [`[${new Date().toLocaleTimeString()}] 🔔 Пуш-уведомления отправлены на устройства Алматы.`, ...prev])
    alert('Уведомления отправлены!')
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 font-sans flex flex-col justify-between">
      
      {/* HEADER & NAVIGATION */}
      <header className="sticky top-0 z-40 bg-[#0B0F19]/90 border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }}>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-600/30">SQ</div>
            <span className="text-xl font-black tracking-wider bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">SmartQueue</span>
          </div>

          {/* НАСТОЛЬНОЕ МЕНЮ */}
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

          {/* Блок профиля и мобильный бургер */}
          <div className="flex items-center gap-4">
            {userSession ? (
              <div className="hidden sm:flex items-center gap-3 bg-slate-900 border border-slate-800 py-1.5 px-3.5 rounded-xl">
                <div className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-cyan-400' : 'bg-indigo-500'}`}></div>
                <span className="text-xs font-bold text-slate-200">{userSession.name}</span>
                <button onClick={handleLogout} title="Выйти" className="text-slate-500 hover:text-rose-400 transition ml-1">
                  <FiLogOut size={14} />
                </button>
              </div>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider transition">
                Вход / Регистрация
              </button>
            )}

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-slate-400 hover:text-white transition">
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* МОБИЛЬНЫЙ БУРГЕР МЕНЮ */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#0D1322] border-b border-slate-800 px-6 py-6 space-y-4 absolute left-0 right-0 top-20 shadow-2xl">
            <button onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }} className={`block w-full text-left font-bold text-sm py-2 ${activeTab === 'home' ? 'text-indigo-500' : 'text-slate-300'}`}>Главная</button>
            <button onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }} className={`block w-full text-left font-bold text-sm py-2 ${activeTab === 'profile' ? 'text-indigo-500' : 'text-slate-300'}`}>Мои Талоны</button>
            <button onClick={() => { setActiveTab('about'); setIsMobileMenuOpen(false); }} className={`block w-full text-left font-bold text-sm py-2 ${activeTab === 'about' ? 'text-indigo-500' : 'text-slate-300'}`}>О нас</button>
            {isAdmin && (
              <button onClick={() => { setActiveTab('admin'); setIsMobileMenuOpen(false); }} className="block w-full text-left font-bold text-sm py-2 text-cyan-400">Админка</button>
            )}
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto py-12 px-6 flex-grow w-full">
        
        {isMaintenanceMode && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 mb-8 flex items-center gap-3 text-rose-400 text-sm">
            <FiAlertTriangle size={18} />
            <span><strong>Режим тех. работ:</strong> Администратор тестирует шлюзы синхронизации.</span>
          </div>
        )}

        {isDdosAttack && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-8 flex items-center gap-3 text-amber-400 text-sm animate-pulse">
            <FiRadio size={18} />
            <span><strong>Симуляция атаки:</strong> Система 24/7 фильтрует нежелательные запросы. Аптайм стабилен!</span>
          </div>
        )}

        {/* ВКЛАДКА: ГЛАВНАЯ */}
        {activeTab === 'home' && (
          <div className="grid lg:grid-cols-3 gap-10 items-start">
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none">
                  Управляйте временем, <br/><span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">а не живой очередью.</span>
                </h1>
                <p className="text-slate-400 text-sm max-w-xl">
                  Покупайте приоритетный талон в ЦОНы и банки Алматы онлайн через защищенные шлюзы.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 border-b border-slate-800 pb-4">
                {['Все', 'ЦОН', 'Банки', 'Медицина', 'Старт продаж iPhone'].map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-xl text-xs font-bold ${selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {ORGANIZATIONS.filter(o => selectedCategory === 'Все' || o.category === selectedCategory).map(org => (
                  <div key={org.id} onClick={() => setSelectedOrg(org)} className={`p-5 rounded-2xl border cursor-pointer flex flex-col justify-between h-44 ${selectedOrg.id === org.id ? 'border-indigo-500 bg-indigo-950/40' : 'border-slate-800 bg-slate-900/60'}`}>
                    <div>
                      <span className="text-[10px] uppercase font-extrabold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">{org.category}</span>
                      <h3 className="font-bold text-slate-100 text-sm sm:text-base mt-2">{org.name}</h3>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-800/60 pt-3">
                      <span className="text-xs text-slate-400">Ожидание: {org.avgTime} мин</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${org.loadColor}`}>{org.load}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Оформление */}
            <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2"><FiCreditCard className="text-indigo-500" /> Оформление</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-2">Филиал</label>
                  <div className="bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 text-xs text-slate-300">{selectedOrg.name}</div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-2">Тип услуги</label>
                  <select value={windowType} onChange={e => setWindowType(e.target.value)} className="w-full bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 text-xs text-slate-300 focus:outline-none">
                    {SERVICES_BY_CATEGORY[selectedOrg.category]?.map((service, index) => (
                      <option key={index} value={service}>{service}</option>
                    ))}
                  </select>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs flex justify-between font-bold">
                  <span>Итого:</span>
                  <span className="text-indigo-400">{calculatePrice(selectedOrg.avgTime)} ₸</span>
                </div>
                <button onClick={() => userSession ? setShowPaymentModal(true) : setShowAuthModal(true)} className="w-full bg-indigo-600 text-white font-bold text-xs py-4 rounded-xl uppercase tracking-wider">
                  {userSession ? 'Перейти к оплате' : 'Сначала войти'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ВКЛАДКА: МОИ ТАЛОНЫ */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl font-black">Ваши купленные талоны (Облако Firebase)</h2>
            {myTickets.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500 text-sm">У вас пока нет активных талонов.</div>
            ) : (
              myTickets.map((t, idx) => (
                <div key={t.id || idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-200">{t.orgName}</h4>
                    <p className="text-xs text-slate-400">{t.window}</p>
                  </div>
                  <div className="text-xl font-mono font-black text-indigo-400">{t.number}</div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ВКЛАДКА: О НАС */}
        {activeTab === 'about' && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-gradient-to-r from-indigo-950/40 to-slate-900 p-8 rounded-3xl border border-slate-800 space-y-4">
              <h2 className="text-2xl font-black text-indigo-400">О создателе и проекте</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Идея создания автоматизированной системы <strong>SmartQueue</strong> пришла ко мне не случайно. Раньше я сам работал курьером в Алматы (в том числе в Яндекс и других крупных сервисах доставки), развозил заказы и постоянно сталкивался со страшными, бесконечными очередями в банках, точках выдачи товаров и госучреждениях. Потеря драгоценных часов в залах ожидания натолкнула меня на мысль, что этот процесс нужно полностью цифровизировать.
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                Этот проект — моё инженерное решение, призванное избавить жителей города от необходимости стоять в «живых» очередях. Программа работает стабильно на удаленных серверах 24/7, обеспечивая моментальную бронь приоритетного прохода.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <h4 className="font-bold text-sm text-slate-200">Опыт из реальной жизни</h4>
                <p className="text-xs text-slate-500">Знание внутренней логистики Алматы помогло спроектировать удобные алгоритмы бронирования.</p>
              </div>
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <h4 className="font-bold text-sm text-slate-200">Аптайм инфраструктуры</h4>
                <p className="text-xs text-slate-500">Система развернута на облачных серверах, защищена от сбоев и перезагрузок круглосуточно.</p>
              </div>
            </div>
          </div>
        )}

        {/* ВКЛАДКА: АДМИНКА */}
        {activeTab === 'admin' && isAdmin && (
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-black text-cyan-400 flex items-center gap-2"><FiSliders /> Пульт управления системой</h2>
              <span className="text-xs bg-cyan-500/10 text-cyan-400 px-3 py-1.5 rounded-xl border border-cyan-500/20 font-bold">Корневой доступ: Асылжан</span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button onClick={triggerClearTickets} className="p-4 text-left bg-slate-900 border border-slate-800 hover:border-indigo-500 rounded-xl flex items-center gap-4 transition">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg"><FiTrash2 size={18}/></div>
                <div>
                  <h4 className="font-bold text-xs text-slate-200">Очистить БД Firebase</h4>
                  <p className="text-[10px] text-slate-500">Удалить талоны из Firestore</p>
                </div>
              </button>

              <button onClick={triggerGenerateReport} className="p-4 text-left bg-slate-900 border border-slate-800 hover:border-emerald-500 rounded-xl flex items-center gap-4 transition">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg"><FiCheckCircle size={18}/></div>
                <div>
                  <h4 className="font-bold text-xs text-slate-200">Выгрузить отчёт</h4>
                  <p className="text-[10px] text-slate-500">Аналитика транзакций</p>
                </div>
              </button>

              <button onClick={triggerToggleMaintenance} className={`p-4 text-left bg-slate-900 border rounded-xl flex items-center gap-4 transition ${isMaintenanceMode ? 'border-rose-500' : 'border-slate-800 hover:border-rose-500'}`}>
                <div className="p-3 bg-rose-500/10 text-rose-400 rounded-lg"><FiAlertTriangle size={18}/></div>
                <div>
                  <h4 className="font-bold text-xs text-slate-200">Тех. работы</h4>
                  <p className="text-[10px] text-slate-500">{isMaintenanceMode ? 'Выключить' : 'Включить режим'}</p>
                </div>
              </button>

              <button onClick={triggerDdosSimulation} className="p-4 text-left bg-slate-900 border border-slate-800 hover:border-amber-500 rounded-xl flex items-center gap-4 transition">
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg"><FiRadio size={18}/></div>
                <div>
                  <h4 className="font-bold text-xs text-slate-200">Имитация DDoS-атаки</h4>
                  <p className="text-[10px] text-slate-500">Проверить стойкость 24/7</p>
                </div>
              </button>

              <button onClick={triggerPushBroadcast} className="p-4 text-left bg-slate-900 border border-slate-800 hover:border-fuchsia-500 rounded-xl flex items-center gap-4 transition">
                <div className="p-3 bg-fuchsia-500/10 text-fuchsia-400 rounded-lg"><FiBell size={18}/></div>
                <div>
                  <h4 className="font-bold text-xs text-slate-200">Массовый Push</h4>
                  <p className="text-[10px] text-slate-500">Рассылка клиентам</p>
                </div>
              </button>

              <button onClick={triggerAddFakeUser} className="p-4 text-left bg-slate-900 border border-slate-800 hover:border-cyan-500 rounded-xl flex items-center gap-4 transition">
                <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-lg"><FiUserPlus size={18}/></div>
                <div>
                  <h4 className="font-bold text-xs text-slate-200">+ Тестовый юзер</h4>
                  <p className="text-[10px] text-slate-500">Генерация в Firestore</p>
                </div>
              </button>
            </div>

            {/* Логи */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase text-slate-300 flex items-center gap-2"><FiActivity size={14}/> Мониторинг ядра</h3>
              <div className="bg-slate-950 rounded-xl p-4 h-48 overflow-y-auto font-mono text-[11px] space-y-2 text-slate-400 border border-slate-800">
                {systemLogs.map((log, index) => <div key={index}><span className="text-cyan-500">&gt;</span> {log}</div>)}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* МОДАЛЬНОЕ ОКНО: АВТОРИЗАЦИЯ */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl max-w-sm w-full border border-slate-800 relative">
            <button onClick={() => { setShowAuthModal(false); setAuthStep(1); }} className="absolute top-4 right-4 text-slate-500 hover:text-white">
              <FiX size={18} />
            </button>

            {authStep === 1 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-black">Авторизация</h3>
                  <p className="text-xs text-slate-500 mt-1">Данные сохраняются в облако</p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">ИИН</label>
                    <input 
                      type="text" maxLength={12} required placeholder="12 цифр ИИН" value={regIin}
                      onChange={e => setRegIin(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">ФИО</label>
                    <input 
                      type="text" required placeholder="Имя Фамилия" value={regName} onChange={e => setRegName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Номер телефона</label>
                    <input 
                      type="text" required placeholder="+7 (707) 000-00-00" value={regPhone}
                      onFocus={handlePhoneFocus} onChange={handlePhoneChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-200 font-mono tracking-wide"
                    />
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 text-white font-bold text-xs py-3.5 rounded-xl uppercase tracking-wider mt-4">Войти</button>
                </form>
              </div>
            )}

            {authStep === 2 && (
              <div className="text-center py-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto animate-spin"><FiCpu size={24}/></div>
                <h4 className="font-bold text-sm text-slate-200">Подключение к Firebase...</h4>
              </div>
            )}

            {authStep === 3 && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto mb-2"><FiLock size={20}/></div>
                  <h3 className="text-base font-black text-cyan-400">Вход Суперадминистратора</h3>
                  <p className="text-xs text-slate-500 mt-1">Введите мастер-пароль.</p>
                </div>
                <form onSubmit={handleAdminPasswordSubmit} className="space-y-3 pt-2">
                  <input 
                    type="password" required autoFocus placeholder="Пароль" value={adminPasswordInput} onChange={e => setAdminPasswordInput(e.target.value)}
                    className="w-full bg-slate-950 border border-cyan-500/40 rounded-xl px-4 py-3 text-xs text-center font-mono tracking-widest focus:outline-none focus:border-cyan-400 text-slate-200"
                  />
                  <button type="submit" className="w-full bg-cyan-600 text-black font-extrabold text-xs py-3 rounded-xl uppercase">Войти</button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО ОПЛАТЫ */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl max-w-sm w-full border border-slate-800 relative">
            <button onClick={() => { setShowPaymentModal(false); setPaymentStep(1); }} className="absolute top-4 right-4 text-slate-500 hover:text-white">
              <FiX size={18} />
            </button>
            {paymentStep === 1 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-center">Оплата талона</h3>
                <input 
                  type="text" placeholder="Номер карты" maxLength={16} value={cardNumber} onChange={e => setCardNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-center font-mono tracking-widest text-slate-200"
                />
                <button onClick={handleProcessPayment} className="w-full bg-emerald-600 text-white font-bold text-xs py-3.5 rounded-xl uppercase">Оплатить</button>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto"><FiCheck size={24}/></div>
                <h4 className="font-bold text-sm text-slate-200">Талон сохранен в Firebase!</h4>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}