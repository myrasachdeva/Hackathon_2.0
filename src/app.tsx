/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import GameOverlay from './gameoverlay';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  LayoutGrid, 
  Users, 
  User, 
  ChevronDown, 
  Gamepad2, 
  BookOpen, 
  Trophy, 
  Menu,
  X,
  LifeBuoy,
  Activity
} from 'lucide-react';


// --- Types ---
type Subject = 'Math & Computer Science' | 'Science' | 'Initial';
type Page = 'home' | 'about' | 'profile' | 'community' | 'support' | 'activity' | 'missions';

// --- Components ---

const GameCard = ({ title, desc, img, difficulty, onPlay }: { title: string, desc: string, img: string, difficulty: string, onPlay: () => void }) => (
  <motion.div whileHover={{ y: -10 }} className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-6 border border-white/10 group relative overflow-hidden text-left">
    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/5 rounded-full blur-3xl -mr-16 -mt-16" />
    <div className="aspect-video bg-white/5 rounded-3xl mb-6 overflow-hidden border border-white/5">
      <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" alt={title} />
    </div>
    <div className="flex justify-between items-start mb-4">
      <h4 className="text-xl font-mono font-black text-white uppercase tracking-tighter">{title}</h4>
      <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${
        difficulty === 'HARD' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
        difficulty === 'MEDIUM' ? 'bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/20' : 
        'bg-green-500/10 text-green-400 border-green-500/20'
      }`}>
        {difficulty}
      </span>
    </div>
    <p className="font-mono text-[11px] text-white/50 whitespace-pre-line mb-8 leading-relaxed uppercase font-bold tracking-tight">
      {desc}
    </p>
    <button 
      onClick={onPlay} 
      className="w-full bg-white text-black py-4 rounded-2xl font-black font-mono text-xs hover:bg-[#FFD700] transition-colors"
    >
      PLAY NOW
    </button>
  </motion.div>
);

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[#4b0082] flex flex-col items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-32 h-32 rounded-full border-8 border-[#FFD700] border-t-transparent flex items-center justify-center"
        >
          <div className="w-20 h-20 bg-[#FFD700] rounded-full shadow-lg flex items-center justify-center">
             <Gamepad2 className="text-[#87CEFA] w-10 h-10" />
          </div>
        </motion.div>
      </motion.div>
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-4xl font-bold text-white tracking-widest font-mono uppercase"
      >
        Lazarus
      </motion.h1>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: 150 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="h-1 bg-[#FFD700] mt-2 rounded-full"
      />
    </div>
  );
};

const Sidebar = ({
  isOpen,
  setIsOpen,
  currentPage,
  onNavigate,
}: {
  isOpen: boolean,
  setIsOpen: (o: boolean) => void,
  currentPage: Page,
  onNavigate: (page: Page) => void,
}) => {
  const menuItems: { id: Page; icon: any; label: string }[] = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'about', icon: BookOpen, label: 'About Me' },
    { id: 'community', icon: Users, label: 'Community' },
    { id: 'support', icon: LifeBuoy, label: 'Support' },
    { id: 'activity', icon: Activity, label: 'Activity Tracker' },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 h-full w-80 z-50 flex flex-col p-8 border-r border-white/20"
        style={{
          background: 'linear-gradient(135deg, rgba(75,0,130,0.95), rgba(0,0,0,0.9))',
          backdropFilter: 'blur(30px)',
        }}
      >
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#FFD700] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(255,215,0,0.3)]">
              <Gamepad2 className="text-[#4b0082] w-6 h-6" />
            </div>
            <span className="font-black text-white text-2xl tracking-tighter font-mono">LAZARUS</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6 text-[#FFD700]" />
          </button>
        </div>

        <nav className="flex-1 space-y-3">
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ x: 8 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                onNavigate(item.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl text-white font-mono transition-all group ${
                currentPage === item.id
                  ? 'bg-white/15 text-[#FFD700] border border-white/20'
                  : 'hover:bg-white/5 opacity-80 hover:opacity-100'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform ${currentPage === item.id ? 'text-[#FFD700]' : 'text-white'}`} />
              <span className="font-bold text-sm uppercase tracking-widest">{item.label}</span>
            </motion.button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="p-5 bg-white/5 rounded-3xl border border-white/10 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full border-2 border-[#FFD700] p-1">
              <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center">
                <User className="text-white w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-sm font-mono font-bold text-white uppercase">Kiara</p>
              <p className="text-[10px] font-mono text-[#FFD700] opacity-80 tracking-widest">SXS-LEVEL-12</p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

// --- Login Page ---
const LoginPage = ({ onLogin, reducedMotion }: { onLogin: () => void, reducedMotion: boolean }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!username.trim() || !studentCode.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (mode === 'login') {
      if (username.trim() !== 'kiara' || studentCode.trim() !== '2026') {
        setError('Invalid username or school code.');
        return;
      }
    }
    setError('');
    onLogin();
  };

  const inputClass = "w-full bg-white/90 border border-[#4b0082]/20 rounded-2xl px-5 py-3.5 text-[#4b0082]/80 placeholder-[#4b0082]/40 focus:outline-none focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/30 transition font-mono text-sm";

  return (
    <div className="min-h-screen bg-gradient-to-l from-[#4b0082] to-[#FFD700] flex items-center justify-center relative overflow-hidden p-4 font-mono">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#6C3082]/70 to-[#87CEFA]/40 rounded-full translate-x-24 -translate-y-24" />
      <div className="absolute top-24 right-32 w-44 h-44 bg-[#FFD700]/60 rounded-full" />
      <div className="absolute top-40 right-16 w-24 h-24 bg-[#87CEFA]/70 rounded-full" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#87CEFA]/30 rounded-full -translate-x-20 translate-y-20" />
      <div className="absolute bottom-20 left-20 w-16 h-16 bg-[#FFD700]/50 rounded-full" />

      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-10 h-10 bg-[#FFD700] rounded-xl flex items-center justify-center">
            <Gamepad2 className="text-[#87CEFA] w-6 h-6" />
          </div>
          <span className="font-black text-black text-2xl tracking-tighter">LAZARUS</span>
        </div>

        <h1 className="text-4xl font-black text-black mb-1">
          {mode === 'login' ? 'Login' : 'Sign Up'}
        </h1>
        <div className="h-1 w-14 bg-gradient-to-r from-[#FFD700] to-[#6C3082] mb-6 rounded-full" />

        <p className="text-black/80 text-sm mb-8">
          {mode === 'login'
            ? 'Welcome back! Login to access Lazarus.'
            : 'Create your account to start playing.'}
        </p>

        <div className="space-y-4">
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              className={inputClass}
            />
          )}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className={inputClass}
            text-black
          />
          <input
            type="text"
            placeholder="School Code"
            value={studentCode}
            onChange={e => setStudentCode(e.target.value)}
            className={inputClass}
          />
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="School Name"
              value={school}
              onChange={e => setSchool(e.target.value)}
              className={inputClass}
            />
          )}
        </div>

        {error && <p className="text-red-400 text-sm mt-3 ml-1">{error}</p>}

        {mode === 'login' && (
          <div className="text-right mt-3">
            <button type="button" className="text-black text-sm font-semibold hover:underline">
              Forgot your password?
            </button>
          </div>
        )}

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          className="w-full mt-6 bg-gradient-to-r from-[#4b0082] to-[#ffd700] text-white font-black py-4 rounded-2xl text-base tracking-wider shadow hover:shadow-lg transition-all"
        >
          {mode === 'login' ? 'CONTINUE →' : 'CREATE ACCOUNT →'}
        </motion.button>

        <p className="text-center text-black/80 text-sm mt-6">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button type="button" onClick={() => { setMode('signup'); setError(''); }} className="text-black font-bold hover:underline">Sign up</button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" onClick={() => { setMode('login'); setError(''); }} className="text-black font-bold hover:underline">Log in</button>
            </>
          )}
        </p>
      </motion.div>
    </div>
  );
};

export default function App() {
  const AUTH_KEY = 'lazarus-authenticated';
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [postLoginLoading, setPostLoginLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedSubject, setSelectedSubject] = useState<Subject | 'Popular Games' | 'Initial'>('Initial');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [insightView, setInsightView] = useState<'leaderboard' | 'progress'>('progress');
  const [activeGameUrl, setActiveGameUrl] = useState<string | null>(null);

  // --- Accessibility States ---
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [largeText, setLargeText] = useState(false);

  // --- Browser Back Navigation Fix ---
  useEffect(() => {
    const handlePopState = () => {
      if (activeGameUrl) {
        setActiveGameUrl(null);
        // We stay on the current page, so we push the current URL back into history
        // to prevent the user from actually leaving the site on the next back press.
        window.history.pushState(null, '', window.location.pathname);
      }
    };

    if (activeGameUrl) {
      window.history.pushState(null, '', window.location.pathname);
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [activeGameUrl]);

  const subjects: (Subject | 'Initial')[] = ['Initial', 'Math & Computer Science', 'Science'];
  const tetrisBlocks = [
    { id: 1, left: '4%', duration: '14s', delay: '-3s', color: 'rgba(255,215,0,0.36)', path: 'M0 0H80V20H0Z' },
    { id: 2, left: '13%', duration: '18s', delay: '-7s', color: 'rgba(255,255,255,0.24)', path: 'M0 0H20V60H60V80H0Z' },
    { id: 3, left: '22%', duration: '16s', delay: '-11s', color: 'rgba(255,215,0,0.30)', path: 'M0 20H20V0H60V20H80V40H20V60H0Z' },
    { id: 4, left: '31%', duration: '15s', delay: '-5s', color: 'rgba(255,255,255,0.20)', path: 'M20 0H60V20H80V60H60V40H20V20H0V0Z' },
    { id: 5, left: '40%', duration: '20s', delay: '-13s', color: 'rgba(255,215,0,0.34)', path: 'M0 0H40V20H60V60H40V40H0V20H20V0Z' },
    { id: 6, left: '49%', duration: '17s', delay: '-9s', color: 'rgba(255,255,255,0.22)', path: 'M20 0H60V20H80V40H60V60H20V40H0V20H20Z' },
    { id: 7, left: '58%', duration: '13s', delay: '-4s', color: 'rgba(255,215,0,0.32)', path: 'M0 0H40V40H0Z' },
    { id: 8, left: '67%', duration: '19s', delay: '-12s', color: 'rgba(255,255,255,0.21)', path: 'M0 0H60V20H80V60H60V40H0V20H20V0Z' },
    { id: 9, left: '76%', duration: '15s', delay: '-6s', color: 'rgba(255,215,0,0.30)', path: 'M0 0H80V20H0Z' },
    { id: 10, left: '85%', duration: '18s', delay: '-10s', color: 'rgba(255,255,255,0.20)', path: 'M0 20H20V0H60V20H80V40H20V60H0Z' },
    { id: 11, left: '93%', duration: '14s', delay: '-8s', color: 'rgba(255,215,0,0.28)', path: 'M20 0H60V20H80V40H60V60H20V40H0V20H20Z' },
  ];

  useEffect(() => {
    const savedAuth = localStorage.getItem(AUTH_KEY);
    if (savedAuth === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  if (postLoginLoading) {
    return <LoadingScreen onComplete={() => {
      localStorage.setItem(AUTH_KEY, 'true');
      setPostLoginLoading(false);
      setIsLoggedIn(true);
    }} />;
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setPostLoginLoading(true)} reducedMotion={reducedMotion} />;
  }

  return (
    /* 1. Root wrapper remains black/dark */
    <div className={`min-h-screen bg-[#4B0082] font-mono text-white flex flex-col lg:flex-row overflow-x-hidden ${highContrast ? 'contrast-125 saturate-150' : ''} ${largeText ? 'text-lg' : ''}`}>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* 2. Main content area centered on big screens */}
      <main className="flex-1 flex flex-col items-start h-screen overflow-y-auto relative bg-[#4B0082]">

        {/* 3. This Inner Container (max-w-5xl) prevents the stretching */}
        <div className="w-full flex flex-col min-h-full relative isolate">
          
          {/* Top Bar */}
          <header className="sticky top-0 mt-0 mx-0 w-full bg-[#8806CE]/45 backdrop-blur-xl px-6 py-8 flex flex-col z-30 border-b border-white/35 rounded-none">
            <div className="flex justify-between items-center">
              <button type="button" onClick={() => setCurrentPage('about')} className="flex flex-col text-left font-mono">
                <h1 className="text-4xl font-black text-white tracking-tighter leading-none">
                  LAZARUS
                </h1>
                <div className="h-1 w-12 bg-lazarus-purple mt-2" />
                <p className="text-[10px] uppercase font-bold text-white/70 tracking-[0.3em] mt-2">
                  gaming, redefined.
                </p>
              </button>
              
              <div className="hidden md:block">
                <p className="text-2xl italic relative top-5 font-mono text-white">
                  Get. Set. Lazarus.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem(AUTH_KEY);
                    setIsLoggedIn(false);
                    setCurrentPage('home');
                    setSidebarOpen(false);
                  }}
                  className="px-4 py-3 bg-white/25 rounded-2xl border border-white/35 hover:bg-white/35 transition-colors text-white font-bold text-sm"
                >
                  LOG OUT
                </button>
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="p-3 bg-white/25 rounded-2xl border border-white/35 hover:bg-white/35 transition-colors"
                  aria-label="Open sidebar menu"
                >
                  <Menu className="text-white w-6 h-6" />
                </button>
              </div>
            </div>
          </header>

          {/* Retro falling blocks background */}
          <style>{`
            @keyframes tetrisFall {
              0% {
                transform: translateY(-140px) rotate(0deg);
                opacity: 0;
              }
              12% {
                opacity: 0.35;
              }
              88% {
                opacity: 0.35;
              }
              100% {
                transform: translateY(120vh) rotate(280deg);
                opacity: 0;
              }
            }
            .tetris-block {
              position: absolute;
              top: -120px;
              animation-name: tetrisFall;
              animation-timing-function: linear;
              animation-iteration-count: infinite;
              mix-blend-mode: screen;
              filter: drop-shadow(0 0 6px rgba(255, 215, 0, 0.35)) drop-shadow(0 0 14px rgba(255, 255, 255, 0.18));
            }
          `}</style>

          <div aria-hidden="true" className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
            {!reducedMotion && tetrisBlocks.map((block) => (
              <svg
                key={block.id}
                className="tetris-block"
                style={{
                  left: block.left,
                  animationDuration: block.duration,
                  animationDelay: block.delay,
                  opacity: 0.28,
                }}
                width="84"
                height="84"
                viewBox="0 0 80 80"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d={block.path} fill={block.color} stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
              </svg>
            ))}
          </div>

          {/* Main Body Content */}
          <div className="relative z-20 px-6 pb-24 lg:pb-12 text-left">
            {currentPage === 'home' ? (
              <>
                <section className="mt-12 mb-12">
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                    <div className="xl:col-span-2">
                      <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                        <h2 className="text-4xl font-bold text-[#FFD700] mb-2">Hi Kiara!</h2>
                        <p className="text-xl font-medium text-white/90">St Xaviers School</p>
                        <p className="text-[10px] font-bold text-[#FFD700] tracking-widest mt-1 uppercase">
                          CODE: SXS-2026-X
                        </p>
                      </motion.div>

                      <div className="mt-10 relative max-w-md">
                        <label className="block text-xs font-bold text-white/80 uppercase tracking-widest mb-4 ml-1">
                          Choose your mission
                        </label>
                        <button
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="w-full bg-white/20 backdrop-blur-md p-5 rounded-3xl flex items-center justify-between border border-white/35 hover:bg-white/30 transition-all font-sans"
                        >
                          <div className="flex items-center space-x-4 text-[#FFD700]">
                            <BookOpen className="text-white/90 w-6 h-6" />
                            <span className="text-xl font-bold font-sans">{selectedSubject === 'Initial' ? 'POPULAR GAMES' : selectedSubject}</span>
                          </div>
                          <ChevronDown className={`text-white/80 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {isDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.2 }}
                              className="absolute left-0 right-0 mt-3 bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/40 shadow-2xl overflow-hidden z-50"
                            >
                              {subjects.map((subject) => (
                                <button
                                  key={subject}
                                  type="button"
                                  onClick={() => {
                                    setSelectedSubject(subject);
                                    setIsDropdownOpen(false);
                                  }}
                                  className={`w-full px-5 py-4 text-left font-semibold transition-colors font-sans ${
                                    selectedSubject === subject
                                      ? 'bg-[#FFD700]/20 text-[#FFD700]'
                                      : 'text-white hover:bg-white/70'
                                  }`}
                                >
                                  {subject === 'Initial' ? 'POPULAR GAMES' : subject}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <motion.aside
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="bg-white/12 backdrop-blur-xl border border-[#FFD700]/35 rounded-3xl p-6 shadow-[0_10px_36px_rgba(255,215,0,0.18)]"
                    >
                      <div className="flex items-center gap-2 mb-6 bg-white/10 rounded-2xl p-1 border border-white/20">
                        <button
                          type="button"
                          onClick={() => setInsightView('progress')}
                          className={`flex-1 rounded-xl py-2 text-xs font-bold uppercase tracking-wider transition-colors font-sans ${
                            insightView === 'progress' ? 'bg-white/30 text-[#FFD700]' : 'text-white/80 hover:text-white'
                          }`}
                        >
                          Topic Progress
                        </button>
                        <button
                          type="button"
                          onClick={() => setInsightView('leaderboard')}
                          className={`flex-1 rounded-xl py-2 text-xs font-bold uppercase tracking-wider transition-colors font-sans ${
                            insightView === 'leaderboard' ? 'bg-white/30 text-[#FFD700]' : 'text-white/80 hover:text-white'
                          }`}
                        >
                          Leaderboard
                        </button>
                      </div>

                      {insightView === 'progress' ? (
                        <div className="space-y-5">
                          {selectedSubject === 'Science' ? (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-white font-semibold font-sans">Science</span>
                                <span className="text-[#FFD700] text-sm font-bold font-sans">89%</span>
                              </div>
                              <div className="h-2.5 rounded-full bg-white/15 overflow-hidden">
                                <div className="h-full w-[89%] rounded-full bg-gradient-to-r from-[#FFD700] to-white" />
                              </div>
                            </div>
                          ) : (
                            <>
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-white font-semibold font-sans">Mathematics</span>
                                  <span className="text-[#FFD700] text-sm font-bold font-sans">72%</span>
                                </div>
                                <div className="h-2.5 rounded-full bg-white/15 overflow-hidden">
                                  <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-[#FFD700] to-white" />
                                </div>
                              </div>

                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-white font-semibold font-sans">Computer Science</span>
                                  <span className="text-[#FFD700] text-sm font-bold font-sans">54%</span>
                                </div>
                                <div className="h-2.5 rounded-full bg-white/15 overflow-hidden">
                                  <div className="h-full w-[54%] rounded-full bg-gradient-to-r from-[#FFD700] to-white" />
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {[
                            { rank: 1, name: 'Kiara', score: 980 },
                            { rank: 2, name: 'Ahaan', score: 925 },
                            { rank: 3, name: 'Alex', score: 890 }
                          ].map((user) => (
                            <div key={user.rank} className="flex items-center justify-between bg-white/10 rounded-xl px-3 py-2 border border-white/15">
                              <span className="text-white font-semibold font-sans">{user.rank}. {user.name}</span>
                              <span className="text-[#FFD700] font-bold font-sans">{user.score}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.aside>
                  </div>
                </section>

                <section className="mb-16">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <Gamepad2 className="w-8 h-8 text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]" />
                      <h3 className="text-2xl font-mono font-bold text-[#FFD700]">
                        Select a Game to Reboot
                      </h3>
                    </div>
                    <button className="text-sm font-mono text-white hover:text-[#FFD700] flex items-center space-x-2 transition-colors">
                      <span>View All</span>
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {selectedSubject === 'Initial' ? (
                      <>
                        <GameCard 
                          title="Math Ninja" 
                          desc={"Arithmetic-Action Challenge\n\nSector: Alpha-1\nSkill: Rapid Calculation"}
                          img="/images/Math-ninja.jpeg"
                          difficulty="HARD"
                          onPlay={() => setActiveGameUrl('file:///Users/myra/Documents/hackathon%20revised/math-ninja.html')}
                        />
                        <GameCard 
                          title="Flappy Bird" 
                          desc={"Eco-Reflex Challenge\n\nSector: Beta-3\nSkill: Biology Basics"}
                          img="/images/flappy-bird.png"
                          difficulty="EASY"
                          onPlay={() => setActiveGameUrl('https://myrasachdeva.github.io/Hackathon_2.0/game.html')}
                        />
                        <GameCard 
                          title="Bio Bloom" 
                          desc={"Genetic-Strategy Challenge\n\nSector: Gamma-2\nSkill: Natural Sciences"}
                          img="/images/bio-bloom.png"
                          difficulty="MEDIUM"
                          onPlay={() => setActiveGameUrl('https://myrasachdeva.github.io/Hackathon_2.0/BioBloom/')}
                        />
                      </>
                    ) : selectedSubject === 'Science' ? (
                      <>
                        <GameCard 
                          title="Flappy Bird" 
                          desc={"Eco-Reflex Challenge\n\nSector: Beta-3\nSkill: Biology Basics"}
                          img="/images/flappy-bird.png"
                          difficulty="EASY"
                          onPlay={() => setActiveGameUrl('https://myrasachdeva.github.io/Hackathon_2.0/game.html')}
                        />
                        <GameCard 
                          title="Bio Bloom" 
                          desc={"Genetic-Strategy Challenge\n\nSector: Gamma-2\nSkill: Natural Sciences"}
                          img="/images/bio-bloom.png"
                          difficulty="MEDIUM"
                          onPlay={() => setActiveGameUrl('https://myrasachdeva.github.io/Hackathon_2.0/BioBloom/')}
                        />
                      </>
                    ) : (
                      <>
                        <GameCard 
                          title="Math Ninja" 
                          desc={"Arithmetic-Action Challenge\n\nSector: Alpha-1\nSkill: Rapid Calculation"}
                          img="/images/Math-ninja.jpeg"
                          difficulty="HARD"
                          onPlay={() => setActiveGameUrl('file:///Users/myra/Documents/hackathon%20revised/math-ninja.html')}
                        />
                        <GameCard 
                          title="Cyber Run" 
                          desc={"Logic-Platformer Challenge\n\nSector: Delta-4\nSkill: Algorithm Logic"}
                          img="/images/cyber-run.png"
                          difficulty="MEDIUM"
                          onPlay={() => setActiveGameUrl('https://myrasachdeva.github.io/Hackathon_2.0/games/cyber dino/')}
                        />
                      </>
                    )}
                  </div>
                </section>

                {/* Quiz Section */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="p-10 rounded-[3.5rem] flex flex-col md:flex-row items-center justify-between gap-8 mb-20"
                  style={{ backgroundImage: 'linear-gradient(135deg, #4B0082, #FFD700)' }}
                >
                  <div className="text-center md:text-left">
                    <h2 className="text-4xl font-black font-mono text-white mb-2 underline decoration-white decoration-4 underline-offset-8">Are you ready for a quiz?</h2>
                    <p className="text-white font-mono font-medium">Test your knowledge on {selectedSubject === 'Initial' ? 'Popular Games' : selectedSubject}.</p>
                  </div>
                  <button className="bg-white text-black px-12 py-5 rounded-3xl font-black text-lg hover:shadow-2xl transition-all font-mono uppercase tracking-widest">
                    START QUIZ
                  </button>
                </motion.div>
              </>
            ) : currentPage === 'profile' ? (
              <section className="mt-12 mb-20 max-w-5xl text-left">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex flex-col md:flex-row items-end gap-8 mb-16 border-b border-white/10 pb-12">
                     <div className="w-40 h-40 bg-white/10 rounded-[3rem] border-2 border-[#FFD700] p-2">
                        <div className="w-full h-full bg-[#FFD700]/20 rounded-[2.5rem] flex items-center justify-center">
                          <User className="w-16 h-16 text-[#FFD700]" />
                        </div>
                     </div>
                     <div className="mb-2">
                        <h2 className="text-5xl font-black text-white font-mono uppercase tracking-tighter">Kiara</h2>
                        <p className="text-[#FFD700] font-mono font-bold tracking-[0.4em] uppercase text-xs mt-2">Senior Developer • Level 12</p>
                     </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                      <h3 className="text-[#FFD700] font-black font-mono text-[10px] uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Archive Credentials</h3>
                      <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-white/40 font-mono text-[9px] uppercase">Registry Name</span>
                          <span className="text-white font-mono font-bold">Kiara Phoenix</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-white/40 font-mono text-[9px] uppercase">Node Location</span>
                          <span className="text-white font-mono font-bold">St Xaviers • Sector 7</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-white/40 font-mono text-[9px] uppercase">Security Level</span>
                          <span className="text-white font-mono font-bold">Class-A Access</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                      <h3 className="text-[#FFD700] font-black font-mono text-[10px] uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Accessibility Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-mono font-bold text-xs uppercase">High Contrast</span>
                          <button 
                            onClick={() => setHighContrast(!highContrast)}
                            className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${highContrast ? 'bg-[#FFD700]' : 'bg-white/20'}`}
                          >
                            <div className={`w-4 h-4 rounded-full bg-black transition-transform ${highContrast ? 'translate-x-4' : ''}`} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white font-mono font-bold text-xs uppercase">Reduced Motion</span>
                          <button 
                            onClick={() => setReducedMotion(!reducedMotion)}
                            className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${reducedMotion ? 'bg-[#FFD700]' : 'bg-white/20'}`}
                          >
                            <div className={`w-4 h-4 rounded-full bg-black transition-transform ${reducedMotion ? 'translate-x-4' : ''}`} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white font-mono font-bold text-xs uppercase">Large Text</span>
                          <button 
                            onClick={() => setLargeText(!largeText)}
                            className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${largeText ? 'bg-[#FFD700]' : 'bg-white/20'}`}
                          >
                            <div className={`w-4 h-4 rounded-full bg-black transition-transform ${largeText ? 'translate-x-4' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:col-span-1">
                      <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-2">
                        <h3 className="text-[#FFD700] font-black font-mono text-[10px] uppercase tracking-widest">Skill Matrix</h3>
                        <Trophy className="text-[#FFD700] w-4 h-4" />
                      </div>
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <p className="text-white/80 font-mono text-xs font-bold mb-3 uppercase tracking-tighter">Logic Grid [MATH]</p>
                          <div className="h-6 bg-white/5 rounded-lg border border-white/10 relative">
                             <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} className="h-full bg-[#FFD700] rounded-lg" />
                             <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white mix-blend-difference">75% DATA RESTORED</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-white/80 font-mono text-xs font-bold mb-3 uppercase tracking-tighter">Binary Module [CS]</p>
                          <div className="h-6 bg-white/5 rounded-lg border border-white/10 relative">
                             <motion.div initial={{ width: 0 }} animate={{ width: '54%' }} className="h-full bg-white rounded-lg" />
                             <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-black font-mono tracking-tighter whitespace-nowrap">54% COMPILING...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </section>
            ) : currentPage === 'community' ? (
              <section className="mt-12 mb-20 max-w-5xl text-left">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="mb-16">
                     <h2 className="text-4xl font-black text-[#FFD700] font-mono uppercase tracking-tighter mb-4">Legacy Network</h2>
                     <p className="text-white/60 font-mono text-sm max-w-2xl leading-relaxed uppercase font-bold tracking-tight">Connect with other architects of the old world. Share restoration patterns, swap logic modules, and maintain system integrity together.</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] group hover:bg-white/10 transition-all cursor-pointer">
                         <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                               <Users className="text-[#FFD700]/80 w-6 h-6" />
                            </div>
                            <div>
                               <p className="text-white font-mono font-black uppercase text-sm">ARCHIVE CLUSTER {i * 1024}</p>
                               <p className="text-[#FFD700]/40 font-mono text-[10px] font-bold uppercase">Active Nodes: {i * 12}</p>
                            </div>
                         </div>
                         <p className="text-white/40 text-[11px] font-mono mb-6 leading-relaxed uppercase font-bold">Discussing restoration patterns for legacy cores and maintaining high-parity logic synchronization.</p>
                         <button className="text-[10px] font-mono font-black text-[#FFD700] tracking-widest uppercase hover:underline">ACCESS PROTOCOL →</button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </section>
            ) : currentPage === 'activity' ? (
              <section className="mt-12 mb-20 max-w-5xl text-left">
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="mb-16 border-b border-white/10 pb-8">
                     <h2 className="text-4xl font-black text-white font-mono uppercase tracking-tighter mb-4 underline decoration-[#FFD700] underline-offset-8">Activity Logs</h2>
                     <p className="text-[#FFD700]/60 font-mono text-sm max-w-2xl uppercase font-bold tracking-widest mt-6">System restoration timeline • Kiara Phoenix</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { action: 'MATH_NINJA SECURED', time: '14:22', status: 'SUCCESS', details: 'High-score parity achieved in Sector Alpha.' },
                      { action: 'LOGIC_UPLINK INITIATED', time: '12:05', status: 'PENDING', details: 'Binary sequence matching in progress.' },
                      { action: 'SCIENCE_RESTORED', time: '09:44', status: 'SUCCESS', details: 'Bio-bloom core updated successfully.' },
                      { action: 'UNAUTHORIZED_ACCESS', time: '01:12', status: 'DENIED', details: 'Firewall maintained system integrity.' }
                    ].map((log, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between group font-mono transition-colors hover:bg-white/5">
                         <div className="flex items-center gap-6 text-left">
                            <span className="text-white/20 text-xs font-bold w-12">{log.time}</span>
                            <div>
                               <p className="text-white font-black text-sm uppercase">{log.action}</p>
                               <p className="text-white/40 text-[10px] mt-1 uppercase tracking-tighter font-bold">{log.details}</p>
                            </div>
                         </div>
                         <div className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest ${
                           log.status === 'SUCCESS' ? 'bg-[#FFD700] text-black' : 
                           log.status === 'PENDING' ? 'bg-white/20 text-white' : 'bg-red-500/20 text-red-500'
                         }`}>
                           {log.status}
                         </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </section>
            ) : currentPage === 'support' ? (
               <section className="mt-12 mb-20 max-w-5xl text-left">
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="grid md:grid-cols-2 gap-16">
                       <div className="text-left">
                          <h2 className="text-4xl font-black text-[#FFD700] font-mono uppercase tracking-tighter mb-8">System Uplink</h2>
                          <p className="text-white/60 font-mono text-sm leading-relaxed mb-12 uppercase font-bold tracking-tight">Encountered an anomaly in the restoration? Report system failures or request data modules from the lead architects.</p>
                          
                          <div className="space-y-8">
                             <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
                                <h4 className="text-white font-mono font-black text-xs uppercase mb-4 tracking-[0.2em]">Emergency Broadcast</h4>
                                <button className="w-full py-4 bg-white/10 text-white font-mono font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:bg-[#FFD700] hover:text-black transition-all border border-white/10">OPEN_COMMS</button>
                             </div>
                             <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
                                <h4 className="text-white font-mono font-black text-xs uppercase mb-4 tracking-[0.2em]">Data Manual</h4>
                                <p className="text-white/40 font-mono text-[9px] mb-6 leading-relaxed uppercase font-bold">Access the complete maintenance manual for level 12 and above architects.</p>
                                <button className="text-[#FFD700] font-mono font-black text-[10px] uppercase tracking-widest hover:underline">READ_DOCS →</button>
                             </div>
                          </div>
                       </div>
                       
                       <div className="bg-white/5 border border-white/10 p-10 rounded-[3.5rem] shadow-2xl">
                          <h3 className="text-white font-mono font-black text-xl mb-8 uppercase tracking-tighter border-b border-white/10 pb-4 text-left">Anomaly Report</h3>
                          <div className="space-y-6 text-left">
                             <div>
                                <label className="block text-[10px] font-mono font-black text-white/40 uppercase mb-3 tracking-[0.2em]">Target Sector</label>
                                <input className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-white font-mono text-sm focus:border-[#FFD700] outline-none transition-all" placeholder="E.G. ALPHA-1" />
                             </div>
                             <div>
                                <label className="block text-[10px] font-mono font-black text-white/40 uppercase mb-3 tracking-[0.2em]">Anomaly Description</label>
                                <textarea className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-white font-mono text-sm focus:border-[#FFD700] outline-none h-32 transition-all resize-none" placeholder="DESCRIBE STATUS..." />
                             </div>
                             <button className="w-full py-6 bg-[#FFD700] text-black font-mono font-black uppercase text-sm tracking-[0.2em] rounded-[2rem] shadow-[0_0_30px_rgba(255,215,0,0.2)] hover:scale-[1.02] transition-all">SUBMIT_LOG</button>
                          </div>
                       </div>
                    </div>
                 </motion.div>
               </section>
            ) : (
              <section className="mt-12 mb-20 max-w-4xl text-left">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <h2 className="text-4xl font-black text-[#FFD700] mb-4 font-mono uppercase tracking-tighter">About Us</h2>
                  <p className="text-white text-lg mb-8 font-mono leading-relaxed uppercase font-bold tracking-tight text-white/80">
                    Welcome to Project Lazarus. We don't just play games; we resurrect legends. This is your personal Command Center—a digital footprint of your triumphs.
                  </p>
                  <div className="grid md:grid-cols-2 gap-8 text-left">
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 font-mono text-left">
                      <h3 className="text-[#FFD700] font-black text-xs mb-8 uppercase tracking-[0.3em] border-b border-white/10 pb-4">Status Report</h3>
                      <div className="space-y-4 uppercase text-[12px] font-black tracking-tight">
                        <p className="text-white/40 flex justify-between uppercase"><span>Identifier</span> <span className="text-white font-mono">Kiara</span></p>
                        <p className="text-white/40 flex justify-between uppercase"><span>Deployment</span> <span className="text-white font-mono">St Xaviers</span></p>
                        <p className="text-white/40 flex justify-between uppercase"><span>Registry</span> <span className="text-white font-mono">SXS-2026-X</span></p>
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 font-mono text-left">
                      <h3 className="text-[#FFD700] font-black text-xs mb-8 uppercase tracking-[0.3em] border-b border-white/10 pb-4">Authorization</h3>
                      <div className="space-y-3 font-black">
                        <p className="text-[#FFD700] bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-3 tracking-[0.2em] text-[10px] uppercase">LOGIC_MATHEMATICS</p>
                        <p className="text-[#FFD700] bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-3 tracking-[0.2em] text-[10px] uppercase">BIO_SCIENCES</p>
                        <p className="text-[#FFD700] bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-3 tracking-[0.2em] text-[10px] uppercase">BINARY_COMPUTERS</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </section>
            )}

            {/* Footer */}
            <footer className="mt-8 ml-0 mr-6 mb-8 pb-12 text-left border border-white/10 bg-white/5 rounded-2xl px-6 pt-8 font-mono">
              <p className="text-white/40 text-[10px] font-bold tracking-[0.4em] uppercase">
                SYSTEM CORE: LAZARUS .CO // RESTORATION IN PROGRESS
              </p>
            </footer>
          </div>
        </div>

{activeGameUrl && (
        <GameOverlay 
          url={activeGameUrl} 
          onExit={() => setActiveGameUrl(null)} 
        />
      )}
        {/* Mobile Navigation */}
        <div className="lg:hidden fixed bottom-6 left-6 right-6 bg-black/80 backdrop-blur-2xl border border-white/20 px-10 py-5 flex justify-between items-center z-40 rounded-[2rem] shadow-2xl">
           <Home className={`w-6 h-6 ${currentPage === 'home' ? 'text-[#FFD700]' : 'text-white/40'}`} onClick={() => setCurrentPage('home')} />
           <div className="w-14 h-14 bg-[#FFD700] rounded-2xl -mt-12 shadow-[0_0_20px_rgba(255,215,0,0.3)] flex items-center justify-center border-4 border-black">
             <Gamepad2 className="text-black w-8 h-8" />
           </div>
           <User className={`w-6 h-6 ${currentPage === 'profile' ? 'text-[#FFD700]' : 'text-white/40'}`} onClick={() => setCurrentPage('profile')} />
        </div>
      </main>
    </div>
  );
}