import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import LoginModal from './components/LoginModal';
import ProfileSheet from './components/ProfileSheet';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase-init';
import { getUserProfile } from './services/firebase-repo';

// Pages
import Home from './pages/Home';
import Education from './pages/Education';
import Sessions from './pages/Sessions';
import Directory from './pages/Directory';
import SelfHelp from './pages/SelfHelp';
import Chat from './pages/Chat';
import AdminDashboard from './pages/AdminDashboard';
import PeerInbox from './pages/PeerInbox';

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check local storage for theme
    const isDark = localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user profile
        try {
            let userDoc = await getUserProfile(firebaseUser.uid);
            let attempts = 0;
             while (!userDoc.exists() && attempts < 3) {
                await new Promise(r => setTimeout(r, 500));
                userDoc = await getUserProfile(firebaseUser.uid);
                attempts++;
            }

            if (userDoc.exists()) {
                const data = userDoc.data();
                setUserData({
                    ...data,
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                });
            } else {
                 setUserData({
                    name: 'Student',
                    email: firebaseUser.email,
                    role: 'student',
                    photoURL: null,
                    uid: firebaseUser.uid
                });
            }
            setUser(firebaseUser);
            setShowLogin(false);
        } catch (error) {
            console.error("Error fetching profile", error);
            // Fallback
             setUserData({
                name: 'Student',
                email: firebaseUser.email,
                role: 'student',
                photoURL: null,
                uid: firebaseUser.uid
            });
            setUser(firebaseUser);
        }
      } else {
        setUser(null);
        setUserData(null);
        setShowLogin(true);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className={`flex flex-col min-h-screen font-sans text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 transition-colors duration-300`}>
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-teal-400/20 dark:bg-teal-900/20 blur-[120px] opacity-50 mix-blend-multiply dark:mix-blend-normal animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 dark:bg-indigo-900/20 blur-[120px] opacity-50 mix-blend-multiply dark:mix-blend-normal"></div>
        </div>

        {user && (
            <Navbar
                user={user}
                userData={userData}
                toggleTheme={toggleTheme}
                darkMode={darkMode}
            />
        )}

        <main className="flex-grow pt-24 pb-8 px-4 sm:px-6 w-full z-10">
             <div className="relative z-10 max-w-7xl mx-auto bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-2xl dark:shadow-teal-900/20 border border-white/60 dark:border-white/10 p-5 md:p-10 min-h-[80vh] transition-all duration-500">
                <Routes>
                    <Route path="/" element={<Home user={user} userData={userData} />} />
                    <Route path="/education" element={<Education user={user} userData={userData} />} />
                    <Route path="/sessions" element={<Sessions user={user} userData={userData} />} />
                    <Route path="/directory" element={<Directory user={user} userData={userData} />} />
                    <Route path="/selfhelp" element={<SelfHelp user={user} userData={userData} />} />
                    <Route path="/chat" element={<Chat user={user} userData={userData} />} />
                    <Route path="/admin-dashboard" element={<AdminDashboard user={user} userData={userData} />} />
                    <Route path="/peer-inbox" element={<PeerInbox user={user} userData={userData} />} />
                </Routes>
             </div>
        </main>

        <Footer />

        {showLogin && <LoginModal onClose={() => {}} />}
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme={darkMode ? "dark" : "light"} />
    </div>
  );
}

export default App;
