'use client'

import { useState, useEffect } from 'react'
import { 
  FiClock, FiCheckCircle, FiChevronRight, FiSliders, FiMessageSquare,
  FiTrendingDown, FiSmartphone, FiShield, FiCpu, FiMapPin, FiUserPlus, FiLock, FiCreditCard, 
  FiSend, FiUser, FiX, FiCheck, FiAlertTriangle, FiAward, FiActivity, FiZap, FiLogOut, FiPhone, FiMail, FiCalendar, FiMenu
} from 'react-icons/fi'

// --- ИНИЦИАЛИЗАЦИЯ FIREBASE ---
import { initializeApp, getApps, getApp } from 'firebase/app'
import { 
  getFirestore, doc, getDoc, setDoc, updateDoc, collection, 
  getDocs, deleteDoc, onSnapshot 
} from 'firebase/firestore'

// ТВОИ РЕАЛЬНЫЕ КЛЮЧИ FIREBASE ВНЕДРЕНЫ СЮДА:
const firebaseConfig = {
  apiKey: "AIzaSyDj_z3Tl7AHKx3T7INzqh6gIjLF8Q4lfgQ",
  authDomain: "queue-for-you-26f13.firebaseapp.com",
  projectId: "queue-for-you-26f13",
  storageBucket: "queue-for-you-26f13.firebasestorage.app",
  messagingSenderId: "989123949112",
  appId: "1:989123949112:web:51d758bd0ddfcc4353accd",
  measurementId: "G-VDWNGKBXGG"
}

// Подключение к Firebase (без повторной инициализации)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
const db = getFirestore(app)

// Статическая база организаций
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

export default function SmartQueueUltimate() {
  const [activeTab, setActiveTab] = useState('home')
  const [selectedCategory, setSelectedCategory] = useState('Все')
  const [selectedOrg, setSelectedOrg] = useState<any>(ORGANIZATIONS[0])
  const [windowType, setWindowType] = useState(SERVICES_BY_CATEGORY['ЦОН'][0])
  const [myTickets, setMyTickets] = useState<any[]>([])
  
  // Состояния для Бургер-меню
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Глобальные настройки админки (Синхронизируются с Firebase)
  const [isSystemActive, setIsSystemActive] = useState(true)
  const [systemLogs, setSystemLogs] = useState<string[]>(['Система инициализирована', 'Шлюз Алматы активен'])

  // База пользователей для админки (CRUD из Firestore)
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([])

  // Текущая сессия пользователя
  const [userSession, setUserSession] = useState<any>(null) 
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authStep, setAuthStep] = useState(1) 
  
  // Поля формы регистрации / входа
  const [regIin, setRegIin] = useState('')
  const [regName, setRegName] = useState('')
  const [regPhone, setRegPhone] = useState('') 
  const [regPassword, setRegPassword] = useState('') 

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

  const isAdmin = userSession?.role === 'admin'

  // --- СИНХРОНИЗАЦИЯ С FIREBASE В РЕАЛЬНОМ ВРЕМЕНИ (READ / LISTEN) ---
  useEffect(() => {
    // 1. Прослушивание статуса шлюза системы
    const systemDocRef = doc(db, 'system_settings', 'global')
    const unsubSystem = onSnapshot(systemDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setIsSystemActive(docSnap.data().isSystemActive)
      }
    })

    // 2. Получение списка пользователей (для админки)
    const unsubUsers = onSnapshot(collection(db, 'users'), (querySnapshot) => {
      const usersList: any[] = []
      querySnapshot.forEach((doc) => {
        usersList.push({ id: doc.id, ...doc.data() })
      })
      setRegisteredUsers(usersList)
    })

    // 3. Получение талонов в реальном времени
    const unsubTickets = onSnapshot(collection(db, 'tickets'), (querySnapshot) => {
      const ticketsList: any[] = []
      querySnapshot.forEach((doc) => {
        ticketsList.push({ id: doc.id, ...doc.data() })
      })
      if (userSession?.role === 'admin') {
        setMyTickets(ticketsList)
      } else if (userSession) {
        setMyTickets(ticketsList.filter(t => t.userIin === userSession.iin))
      }
    })

    return () => {
      unsubSystem()
      unsubUsers()
      unsubTickets()
    }
  }, [userSession])

  const calculatePrice = (minutes: number) => {
    return 1000 + (minutes * 50)
  }

  useEffect(() => {
    if (selectedOrg) {
      setWindowType(SERVICES_BY_CATEGORY[selectedOrg.category][0])
    }
  }, [selectedOrg])

  const getMaskedPhone = (rawDigits: string) => {
    if (!rawDigits) return '+7 ('
    const digits = rawDigits.replace(/\D/g, '')
    let result = '+7 ('
    if (digits.length > 1) result += digits.slice(1, 4)
    if (digits.length >= 5) result += ') ' + digits.slice(4, 7)
    if (digits.length >= 8) result += '-' + digits.slice(7, 9)
    if (digits.length >= 10) result += '-' + digits.slice(9, 11)
    return result
  }

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value
    let digits = inputVal.replace(/\D/g, '')
    if (digits.length === 0) {
      setRegPhone('')
      return
    }
    if (!digits.startsWith('7') && digits.length > 0) {
      digits = '7' + digits
    }
    if (digits.length <= 11) {
      setRegPhone(digits)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const onlyLetters = value.replace(/[^a-zA-Zа-яА-ЯёЁәӘғҒқҚңҢөӨұҰүҮіІһҺ\s]/g, '')
    setRegName(onlyLetters)
  }

  // --- ФУНКЦИЯ АВТОРИЗАЦИИ И РЕГИСТРАЦИИ ---
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (regIin.length !== 12) {
      alert('Ошибка: ИИН должен содержать ровно 12 цифр!')
      return
    }
    if (regIin !== '060621501916' && regPhone.length < 11) {
      alert('Ошибка: Заполните номер телефона полностью!')
      return
    }

    setAuthStep(2)

    try {
      const userDocRef = doc(db, 'users', regIin)
      const userDocSnap = await getDoc(userDocRef)

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data()
        
        if (userData.role === 'admin') {
          if (regPassword !== userData.password) {
            alert('Ошибка: Неверный секретный ключ администратора!')
            setAuthStep(1)
            return
          }
        }
        
        setUserSession({ iin: regIin, ...userData })
      } else {
        const newUserData = {
          name: regName,
          phone: regPhone,
          role: 'user'
        }
        await setDoc(userDocRef, newUserData)
        setUserSession({ iin: regIin, ...newUserData })
      }

      setShowAuthModal(false)
      setAuthStep(1)
      setRegPassword('')
    } catch (error) {
      console.error("Ошибка Firebase Auth: ", error)
      alert('Ошибка соединения с базой данных Firebase.')
      setAuthStep(1)
    }
  }

  const handleLogout = () => {
    setUserSession(null)
    setRegIin('')
    setRegName('')
    setRegPhone('')
    setRegPassword('')
    setActiveTab('home')
  }

  const handleGetTicketClick = (org: any) => {
    if (!isSystemActive) {
      alert('Внимание: Прием заявок временно приостановлен администратором системы.')
      return
    }
    if (!userSession) {
      setShowAuthModal(true)
      return
    }
    setPaymentStep(1)
    setShowPaymentModal(true)
  }

  // --- ФУНКЦИЯ СОЗДАНИЯ ТАЛОНА ---
  const handleProcessPayment = async () => {
    setPaymentStep(2)
    
    const prefix = selectedOrg.category === 'ЦОН' ? 'Ц' : selectedOrg.category === 'Банки' ? 'Б' : selectedOrg.category === 'Медицина' ? 'М' : 'APL'
    const ticketNumber = `${prefix}-${Math.floor(100 + Math.random() * 900)}`
    const peopleAhead = Math.floor(2 + Math.random() * 6)
    const ticketId = Date.now().toString()

    const newTicket = {
      orgName: selectedOrg.name,
      number: ticketNumber,
      window: windowType,
      peopleAhead: peopleAhead,
      estimatedTime: selectedOrg.avgTime,
      pricePaid: calculatePrice(selectedOrg.avgTime),
      userIin: userSession.iin,
      createdAt: new Date().toISOString()
    }

    try {
      await setDoc(doc(db, 'tickets', ticketId), newTicket)
      
      setSystemLogs(prev => [`Эмиссия талона ${ticketNumber} для ИИН ${userSession.iin}`, ...prev])
      setShowPaymentModal(false)
      setCardNumber('')
      setCardExpiry('')
      setCardCvc('')
      setActiveTab('profile')
    } catch (e) {
      alert('Ошибка при генерации талона в Firebase')
    }
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

  // --- УПРАВЛЕНИЕ FIRESTORE АДМИНОМ ---
  const toggleSystemStatus = async () => {
    const nextStatus = !isSystemActive
    try {
      await updateDoc(doc(db, 'system_settings', 'global'), { isSystemActive: nextStatus })
      setSystemLogs(prev => [`Статус шлюза в Firestore изменен на: ${nextStatus ? 'АКТИВЕН' : 'ЗАБЛОКИРОВАН'}`, ...prev])
    } catch (e) {
      alert('Не удалось обновить конфигурацию шлюза. Проверьте, создана ли коллекция system_settings.')
    }
  }

  const clearAllTickets = async () => {
    if(confirm('Вы действительно хотите обнулить все активные талоны в Firebase Firestore?')) {
      try {
        const querySnapshot = await getDocs(collection(db, 'tickets'))
        querySnapshot.forEach(async (ticketDoc) => {
          await deleteDoc(doc(db, 'tickets', ticketDoc.id))
        })
        setSystemLogs(prev => ['База активных талонов полностью очищена в Firestore', ...prev])
        alert('Все талоны успешно удалены из облачной базы данных.')
      } catch (e) {
        alert('Ошибка при очистке реестра Firestore.')
      }
    }
  }

  const triggerMockError = () => {
    setSystemLogs(prev => ['⚠️ Имитация критического сбоя API Kaspi... Автоматическое восстановление шлюза.', ...prev])
    alert('Симуляция запущена. Система успешно перенаправила трафик на резервный сервер Алматы.')
  }

  const downloadRegistryLogs = () => {
    setSystemLogs(prev => ['Выгрузка логов безопасности осуществлена в файл формата .log', ...prev])
    alert('Логи успешно сформированы и отправлены на ваш защищенный терминал.')
  }

  const handleAdvanceTicket = async (ticketId: string, currentPeople: number) => {
    try {
      if (currentPeople <= 1) {
        await deleteDoc(doc(db, 'tickets', ticketId))
        setSystemLogs(prev => [`Талон ${ticketId} успешно обслужен и архивирован`, ...prev])
      } else {
        await updateDoc(doc(db, 'tickets', ticketId), { peopleAhead: currentPeople - 1 })
        setSystemLogs(prev => [`Продвинута очередь по талону ID: ${ticketId}`, ...prev])
      }
    } catch (e) {
      alert('Ошибка изменения статуса талона.')
    }
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

      {/* ХЕДЕР С ДЕСКТОПНЫМ МЕНЮ И КНОПКОЙ БУРГЕРА */}
      <header className="sticky top-0 z-40 bg-[#0B0F19]/80 border-b border-indigo-500/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-lg">SQ</div>
            <div>
              <span className="text-xl font-black tracking-tight text-white block">SmartQueue</span>
              <span className="text-[9px] text-purple-400 block font-bold tracking-widest uppercase">Система бронирования Асылжана</span>
            </div>
          </div>
          
          {/* Навигация для Десктопа */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
            <button onClick={() => setActiveTab('home')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'home' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>Главная</button>
            <button onClick={() => setActiveTab('about')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'about' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>О нас / История</button>
            <button onClick={() => setActiveTab('contacts')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'contacts' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>Контакты</button>
            <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all relative ${activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              Мои Талоны
              {myTickets.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">{myTickets.length}</span>}
            </button>
            
            {userSession && isAdmin && (
              <button onClick={() => setActiveTab('admin')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'admin' ? 'bg-cyan-600 text-white animate-pulse' : 'text-cyan-400 hover:bg-slate-800'}`}>
                Панель Администратора
              </button>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-3">
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
                <FiUserPlus /> Регистрация / Вход
              </button>
            )}
          </div>

          {/* Кнопка мобильного бургер-меню */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="text-slate-400 hover:text-white p-2 bg-slate-900 rounded-xl border border-slate-800"
            >
              <FiMenu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* МОБИЛЬНОЕ ПОЛНОЭКРАННОЕ БУРГЕР-МЕНЮ */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#0B0F19] flex flex-col justify-between p-6 md:hidden animate-scale-up">
          <div className="space-y-8">
            <div className="flex items-center justify-between pb-6 border-b border-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">SQ</div>
                <span className="text-base font-black text-white">Навигация</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="text-slate-400 hover:text-white p-2 bg-slate-900 rounded-lg"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-3">
              <button 
                onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }} 
                className={`w-full p-4 rounded-xl text-left text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'home' ? 'bg-indigo-600 text-white' : 'bg-slate-900/50 text-slate-400'}`}
              >
                Главная страница
              </button>
              <button 
                onClick={() => { setActiveTab('about'); setIsMobileMenuOpen(false); }} 
                className={`w-full p-4 rounded-xl text-left text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'about' ? 'bg-indigo-600 text-white' : 'bg-slate-900/50 text-slate-400'}`}
              >
                О нас / История основателя
              </button>
              <button 
                onClick={() => { setActiveTab('contacts'); setIsMobileMenuOpen(false); }} 
                className={`w-full p-4 rounded-xl text-left text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'contacts' ? 'bg-indigo-600 text-white' : 'bg-slate-900/50 text-slate-400'}`}
              >
                Контакты компании
              </button>
              <button 
                onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }} 
                className={`w-full p-4 rounded-xl text-left text-sm font-bold uppercase tracking-wider transition-all relative ${activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'bg-slate-900/50 text-slate-400'}`}
              >
                Мои Выданные Талоны
                {myTickets.length > 0 && <span className="ml-2 bg-pink-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{myTickets.length}</span>}
              </button>

              {userSession && isAdmin && (
                <button 
                  onClick={() => { setActiveTab('admin'); setIsMobileMenuOpen(false); }} 
                  className={`w-full p-4 rounded-xl text-left text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'admin' ? 'bg-cyan-600 text-white border border-cyan-400/40' : 'bg-cyan-950/20 text-cyan-400 border border-cyan-900/50'}`}
                >
                  👑 Панель Администратора
                </button>
              )}
            </nav>
          </div>

          <div className="pt-6 border-t border-slate-900">
            {userSession ? (
              <div className="space-y-3">
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Вы вошли как:</span>
                  <span className="text-white font-bold text-sm block">{userSession.name}</span>
                  <span className="text-indigo-400 font-mono text-xs block mt-0.5">ИИН: {userSession.iin}</span>
                </div>
                <button 
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <FiLogOut /> Выйти из аккаунта
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { setIsMobileMenuOpen(false); setAuthStep(1); setShowAuthModal(true); }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <FiUserPlus /> Пройти регистрацию
              </button>
            )}
          </div>
        </div>
      )}

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <main className="flex-grow">
        
        {activeTab === 'home' && (
          <div className="space-y-16 pb-20 animate-scale-up">
            
            {/* БАННЕР С АНИМАЦИЕЙ ЧЕЛОВЕКА В ОЧЕРЕДИ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                {!isSystemActive && (
                  <div className="inline-flex items-center gap-2 bg-rose-500/20 border border-rose-500/30 px-4 py-2 rounded-xl text-rose-300 text-xs font-bold uppercase tracking-wider animate-pulse">
                    <FiAlertTriangle /> Прием новых броней временно заблокирован админом
                  </div>
                )}
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

              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <div className="relative w-full max-w-[340px] aspect-[4/5] bg-slate-900 rounded-3xl border border-indigo-500/20 overflow-hidden group shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80" 
                    alt="Гражданин в очереди" 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                  <div className="absolute left-0 right-0 h-[2px] bg-indigo-500/50 shadow-[0_0_15px_#6366f1] animate-scan"></div>
                  
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

            {/* ГЕОЛОКАЦИЯ И СИМУЛЯТОР КАРТЫ АЛМАТЫ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="border-l-4 border-indigo-500 pl-4">
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <FiMapPin className="text-indigo-400" /> СИНХРОНИЗАЦИЯ И КАРТА АЛМАТЫ
                </h2>
                <p className="text-slate-400 text-xs mt-1">Выберите точку на карте или из списка для мгновенного бронирования</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
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
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${org.loadColor}`}>
                            Загрузка: {org.load}
                          </span>
                          <span className="text-slate-400 font-mono text-[10px] flex items-center gap-1">
                            <FiClock className="text-indigo-400" /> ~{org.avgTime} мин
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ИНТЕРАКТИВНАЯ КАРТА АЛМАТЫ (СИМУЛЯТОР) */}
                <div className="col-span-1 lg:col-span-6 bg-slate-900/60 border border-indigo-500/10 rounded-2xl p-6 flex flex-col justify-between min-h-[400px] relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                  
                  <div className="relative flex-grow bg-slate-950 rounded-xl border border-slate-800 p-4 overflow-hidden min-h-[250px]">
                    <div className="absolute top-2 left-2 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-md text-[9px] font-mono text-indigo-300 z-10">
                      СЕТКА КОРРЕКЦИИ GPS: АЛМАТЫ
                    </div>

                    {/* Точки организаций на карте */}
                    {ORGANIZATIONS.map(org => (
                      <button
                        key={`map-${org.id}`}
                        onClick={() => setSelectedOrg(org)}
                        style={{ left: org.x, top: org.y }}
                        className={`absolute w-3.5 h-3.5 -ml-1.5 -mt-1.5 rounded-full transition-all flex items-center justify-center ${selectedOrg?.id === org.id ? 'bg-pink-500 scale-125 z-20 shadow-[0_0_12px_#ec4899]' : 'bg-indigo-500 hover:scale-110'}`}
                        title={org.name}
                      >
                        <span className="absolute w-full h-full rounded-full bg-inherit animate-ping opacity-40"></span>
                      </button>
                    ))}

                    {/* Информация о выбранной точке */}
                    {selectedOrg && (
                      <div className="absolute bottom-3 left-3 right-3 bg-slate-900/95 border border-purple-500/30 p-3 rounded-xl flex items-center justify-between backdrop-blur-md animate-scale-up">
                        <div className="space-y-0.5">
                          <h5 className="text-xs font-bold text-white truncate max-w-[180px]">{selectedOrg.name}</h5>
                          <p className="text-[10px] text-slate-400 font-mono">Дистанция: {selectedOrg.distance}</p>
                        </div>
                        <button 
                          onClick={() => handleGetTicketClick(selectedOrg)}
                          className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg transition-all"
                        >
                          Выбрать
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Окно конфигурации услуги */}
                  {selectedOrg && (
                    <div className="mt-4 pt-4 border-t border-slate-800 grid sm:grid-cols-12 gap-4 items-center">
                      <div className="sm:col-span-7 space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400 block">Выберите тип услуги:</label>
                        <select 
                          value={windowType}
                          onChange={(e) => setWindowType(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                        >
                          {SERVICES_BY_CATEGORY[selectedOrg.category]?.map((service, i) => (
                            <option key={i} value={service}>{service}</option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-5">
                        <button
                          onClick={() => handleGetTicketClick(selectedOrg)}
                          className="w-full h-10 mt-5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5"
                        >
                          <FiZap /> Получить талон
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* СТРАНИЦА: О НАС */}
        {activeTab === 'about' && (
          <div className="max-w-4xl mx-auto px-4 py-12 animate-scale-up space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-black text-white">История создания SmartQueue</h2>
              <div className="h-1 w-20 bg-indigo-500 mx-auto rounded-full"></div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-6 sm:p-8 rounded-2xl space-y-4 text-slate-300 text-sm leading-relaxed">
              <p>
                Идея создания интеллектуального шлюза <strong>SmartQueue</strong> родилась в Алматы как ответ на бесконечные очереди и несовершенство старых систем распределения времени клиентов.
              </p>
              <p>
                Основатель проекта, <strong>Асылжан Бейсембай</strong>, разработал эту платформу с целью полностью оцифровать процесс бронирования. Интеграция с Firebase Firestore в реальном времени позволила создать надежную архитектуру.
              </p>
              <blockquote className="border-l-4 border-purple-500 bg-purple-500/5 px-4 py-3 rounded-r-xl text-xs italic text-purple-300">
                «Наша миссия — превратить хаос очередей в упорядоченный цифровой поток, где время каждого гражданина Казахстана ценится превыше всего.» — Асылжан Бейсембай.
              </blockquote>
            </div>
          </div>
        )}

        {/* СТРАНИЦА: КОНТАКТЫ */}
        {activeTab === 'contacts' && (
          <div className="max-w-4xl mx-auto px-4 py-12 animate-scale-up space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-black text-white">Контакты компании</h2>
              <div className="h-1 w-20 bg-indigo-500 mx-auto rounded-full"></div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto text-lg"><FiPhone /></div>
                <h4 className="text-xs font-bold uppercase text-slate-400">Телефон</h4>
                <p className="text-sm font-mono text-white">+7 (700) 952-23-06</p>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto text-lg"><FiMail /></div>
                <h4 className="text-xs font-bold uppercase text-slate-400">Email техподдержки</h4>
                <p className="text-sm font-mono text-white">support@smartqueue.kz</p>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mx-auto text-lg"><FiCalendar /></div>
                <h4 className="text-xs font-bold uppercase text-slate-400">Шлюз Алматы</h4>
                <p className="text-sm text-white">Круглосуточно 24/7</p>
              </div>
            </div>
          </div>
        )}

        {/* СТРАНИЦА: МОИ ТАЛОНЫ */}
        {activeTab === 'profile' && (
          <div className="max-w-4xl mx-auto px-4 py-12 animate-scale-up space-y-8">
            <div className="border-l-4 border-pink-500 pl-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Ваш личный кабинет</h2>
              <p className="text-slate-400 text-xs mt-0.5">Список выданных активных талонов в облаке Firestore</p>
            </div>

            {!userSession ? (
              <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl text-center space-y-4">
                <p className="text-slate-400 text-sm">Пожалуйста, авторизуйтесь для просмотра ваших талонов.</p>
                <button onClick={() => setShowAuthModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all">Авторизоваться</button>
              </div>
            ) : myTickets.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl text-center space-y-2">
                <p className="text-slate-400 text-sm">У вас пока нет активных талонов.</p>
                <button onClick={() => setActiveTab('home')} className="text-indigo-400 hover:underline text-xs font-bold">Получить свой первый талон на главной ➔</button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {myTickets.map(ticket => (
                  <div key={ticket.id} className="bg-slate-900 border border-indigo-500/20 p-5 rounded-2xl relative overflow-hidden space-y-4 shadow-xl">
                    <div className="absolute top-0 right-0 bg-indigo-600/10 text-indigo-400 text-[10px] font-mono font-bold px-3 py-1 rounded-bl-xl border-l border-b border-indigo-500/10">
                      ID: {ticket.id.slice(-6)}
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-purple-400 block bg-purple-500/5 border border-purple-500/10 px-2 py-0.5 rounded w-fit">ACTIVE TICKET</span>
                    <div>
                      <h3 className="text-base font-black text-white">{ticket.orgName}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">{ticket.window}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl text-center font-mono border border-slate-800">
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase font-bold">Ваш Номер</span>
                        <span className="text-xl font-black text-pink-400">{ticket.number}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase font-bold">Очередь перед вами</span>
                        <span className="text-xl font-black text-white">{ticket.peopleAhead} чел.</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[11px] pt-1 text-slate-400 font-medium">
                      <span>Ориентировочно: ~{ticket.estimatedTime} мин</span>
                      <span className="text-emerald-400 font-bold">Оплачено: {ticket.pricePaid} ₸</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* СТРАНИЦА: ПАНЕЛЬ АДМИНИСТРАТОРА */}
        {activeTab === 'admin' && userSession && isAdmin && (
          <div className="max-w-6xl mx-auto px-4 py-12 animate-scale-up space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">🔥 ТЕРМИНАЛ УПРАВЛЕНИЯ FIRESTORE</h2>
                <p className="text-slate-400 text-xs mt-1">Главный операционный пульт: Асылжан Бейсембай</p>
              </div>
              
              <button 
                onClick={toggleSystemStatus}
                className={`px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 border ${isSystemActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${isSystemActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></div>
                Шлюз Приема Заявок: {isSystemActive ? 'АКТИВЕН' : 'ЗАБЛОКИРОВАН'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button onClick={clearAllTickets} className="p-4 bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 text-rose-400 hover:text-white rounded-xl text-left transition-all space-y-1">
                <FiX className="w-5 h-5" />
                <h4 className="text-xs font-bold uppercase tracking-wider block">Обнулить Firestore</h4>
                <p className="text-[9px] opacity-70 block">Полное удаление талонов</p>
              </button>
              <button onClick={triggerMockError} className="p-4 bg-amber-500/10 hover:bg-amber-600 border border-amber-500/20 text-amber-400 hover:text-white rounded-xl text-left transition-all space-y-1">
                <FiAlertTriangle className="w-5 h-5 animate-bounce" />
                <h4 className="text-xs font-bold uppercase tracking-wider block">Сбой API Kaspi</h4>
                <p className="text-[9px] opacity-70 block">Имитировать ошибку сети</p>
              </button>
              <button onClick={downloadRegistryLogs} className="p-4 bg-cyan-500/10 hover:bg-cyan-600 border border-cyan-500/20 text-cyan-400 hover:text-white rounded-xl text-left transition-all space-y-1">
                <FiSliders className="w-5 h-5" />
                <h4 className="text-xs font-bold uppercase tracking-wider block">Выгрузить логи</h4>
                <p className="text-[9px] opacity-70 block">Скачать защищенный файл</p>
              </button>
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-xl text-left space-y-1">
                <FiUser className="w-5 h-5" />
                <h4 className="text-xs font-bold uppercase tracking-wider block">База Системы</h4>
                <p className="text-[9px] text-indigo-400 font-mono font-bold block">Зарегистрировано: {registeredUsers.length} ИИН</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <FiActivity className="text-pink-400" /> Оперативный реестр талонов (Живой поток)
                </h3>
                {myTickets.length === 0 ? (
                  <p className="text-xs text-slate-500 font-mono italic">В настоящий момент активных заявок в базе данных нет...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                          <th className="pb-3 font-bold">Талон</th>
                          <th className="pb-3 font-bold">Организация / Услуга</th>
                          <th className="pb-3 font-bold">ИИН Клиента</th>
                          <th className="pb-3 font-bold text-center">Очередь</th>
                          <th className="pb-3 font-bold text-right">Действие</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {myTickets.map(ticket => (
                          <tr key={ticket.id} className="hover:bg-slate-950/40 transition-all">
                            <td className="py-3 font-black text-pink-400">{ticket.number}</td>
                            <td className="py-3 max-w-[200px] truncate">
                              <span className="text-white block font-sans font-bold">{ticket.orgName}</span>
                              <span className="text-[10px] text-slate-400 block truncate">{ticket.window}</span>
                            </td>
                            <td className="py-3 text-slate-300">{ticket.userIin}</td>
                            <td className="py-3 text-center text-white font-bold">{ticket.peopleAhead} чел.</td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => handleAdvanceTicket(ticket.id, ticket.peopleAhead)}
                                className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                              >
                                {ticket.peopleAhead <= 1 ? 'Обслужить' : 'Продвинуть'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Системный журнал */}
              <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 font-mono text-[11px]">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-900 pb-2">
                  Системный Журнал Ядра
                </h4>
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 text-slate-400 scrollbar-none">
                  {systemLogs.map((log, index) => (
                    <div key={index} className="p-1.5 rounded bg-slate-900/60 border border-slate-900 text-[10px] flex gap-2 items-start">
                      <span className="text-indigo-500 font-bold">[{new Date().toLocaleTimeString()}]</span>
                      <span className="break-all">{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ФУТЕР КАЗАХСТАНА */}
      <footer className="bg-slate-950/80 border-t border-slate-900 py-6 text-center text-[10px] font-mono text-slate-500 tracking-wider">
        © 2026 SmartQueue Ultimate v4.1. Разработано в городе Алматы. Все права защищены.
      </footer>

      {/* ОКОШКО ЧАТА ПОДДЕРЖКИ (ИИ-АССИСТЕНТ) */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
        {isChatOpen && (
          <div className="w-[320px] sm:w-[360px] h-[420px] bg-slate-900/95 backdrop-blur-md border border-indigo-500/20 rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden mb-3 animate-scale-up">
            <div className="bg-indigo-950/60 border-b border-indigo-500/10 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    {isOperatorConnected ? 'Оператор: Асылжан' : 'ИИ-Ассистент'}
                  </h4>
                  <p className="text-[9px] text-slate-400 font-mono">Цифровой шлюз Алматы</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white p-1 bg-slate-950 rounded-lg"><FiX /></button>
            </div>

            <div className="flex-grow p-4 overflow-y-auto space-y-3 text-xs scrollbar-none">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : msg.sender === 'operator' ? 'bg-purple-600 text-white border border-purple-400/30 rounded-bl-none' : 'bg-slate-950 text-slate-300 rounded-bl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAiTyping && (
                <div className="text-[10px] text-slate-500 font-mono italic animate-pulse">ИИ-ассистент печатает ответ...</div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-900 flex gap-2">
              <input 
                type="text" 
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="Задайте ваш вопрос..." 
                className="flex-grow bg-slate-900 border border-slate-800 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button type="submit" className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition-all"><FiSend /></button>
            </form>
          </div>
        )}

        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-full shadow-xl flex items-center justify-center text-white text-lg transition-all transform hover:scale-110 relative"
        >
          <FiMessageSquare />
          {!isChatOpen && <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0B0F19]"></span>}
        </button>
      </div>

      {/* МОДАЛЬНОЕ ОКНО: РЕГИСТРАЦИЯ / ВХОД */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-indigo-500/20 p-6 rounded-2xl space-y-4 relative overflow-hidden animate-scale-up">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 bg-slate-950 rounded-lg"><FiX /></button>
            
            <div className="text-center">
              <h3 className="text-lg font-black text-white uppercase tracking-wider">Единый шлюз авторизации</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Введите ваш 12-значный ИИН для безопасного входа</p>
            </div>

            {authStep === 1 ? (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">ИИН гражданина (12 цифр):</label>
                  <input 
                    type="text" 
                    required
                    maxLength={12}
                    value={regIin}
                    onChange={(e) => setRegIin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Например: 060621501916" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Поле секретного пароля только для ИИН админа */}
                {regIin === '060621501916' && (
                  <div className="space-y-1 animate-scale-up bg-cyan-950/20 border border-cyan-500/20 p-3 rounded-xl">
                    <label className="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1">
                      <FiLock /> Ключ Системного Администратора:
                    </label>
                    <input 
                      type="password" 
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Вставьте секретный пароль админа" 
                      className="w-full bg-slate-950 border border-cyan-800 rounded-xl px-3 py-2.5 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-500 transition-all"
                    />
                  </div>
                )}

                {/* Поля регистрации для обычных пользователей */}
                {regIin !== '060621501916' && regIin.length === 12 && (
                  <div className="space-y-3 animate-scale-up">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">ФИО полностью (Только буквы):</label>
                      <input 
                        type="text" 
                        required
                        value={regName}
                        onChange={handleNameChange}
                        placeholder="Имя Фамилия" 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Номер телефона:</label>
                      <input 
                        type="text" 
                        required
                        value={getMaskedPhone(regPhone)}
                        onChange={handlePhoneInputChange}
                        placeholder="+7 (700) 952-23-06" 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg">
                  Подтвердить шлюз ➔
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto"></div>
                <p className="text-xs font-mono text-slate-400">Синхронизация токена безопасности с облаком Firebase...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО: ОПЛАТА ТАЛОНА */}
      {showPaymentModal && selectedOrg && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-indigo-500/20 p-6 rounded-2xl space-y-4 relative overflow-hidden animate-scale-up">
            <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 bg-slate-950 rounded-lg"><FiX /></button>
            
            <div className="text-center">
              <h3 className="text-base font-black text-white uppercase tracking-wider">Касса бронирования</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">К оплате: <span className="text-emerald-400 font-bold font-mono">{calculatePrice(selectedOrg.avgTime)} ₸</span></p>
            </div>

            {paymentStep === 1 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button onClick={() => setPaymentMethod('qr')} className={`py-2 text-xs font-bold uppercase rounded-lg transition-all ${paymentMethod === 'qr' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Kaspi QR</button>
                  <button onClick={() => setPaymentMethod('card')} className={`py-2 text-xs font-bold uppercase rounded-lg transition-all ${paymentMethod === 'card' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Банковская карта</button>
                </div>

                {paymentMethod === 'qr' ? (
                  <div className="bg-slate-950 p-6 rounded-xl text-center space-y-3 border border-slate-800">
                    <div className="w-36 h-36 bg-white mx-auto p-2 rounded-xl flex items-center justify-center relative group">
                      <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center font-mono text-[9px] font-bold text-indigo-400">МГНОВЕННЫЙ ШЛЮЗ</div>
                      <div className="w-full h-full border-4 border-slate-950 flex flex-wrap p-1 gap-1">
                        {[...Array(16)].map((_, i) => <div key={i} className={`flex-grow min-w-[20%] h-6 ${i % 3 === 0 || i % 7 === 0 ? 'bg-slate-950' : 'bg-transparent'}`}></div>)}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400">Наведите камеру смартфона для подтверждения оплаты в приложении.</p>
                    <button onClick={handleProcessPayment} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all">
                      Я оплатил заявку
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Номер вашей карты:</label>
                      <input 
                        type="text" 
                        maxLength={16}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="4400 4300 5500 1122" 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Срок (ММ/ГГ):</label>
                        <input 
                          type="text" 
                          maxLength={4}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value.replace(/\D/g, ''))}
                          placeholder="12/28" 
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">CVC / CVV:</label>
                        <input 
                          type="password" 
                          maxLength={3}
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                          placeholder="***" 
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <button onClick={handleProcessPayment} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all">
                      Оплатить и сгенерировать талон
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto"></div>
                <p className="text-xs font-mono text-slate-400">Формирование документа в распределенном реестре Firestore...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}