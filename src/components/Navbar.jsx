import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase-init';
import { toast } from 'react-toastify';
import ProfileSheet from './ProfileSheet';

const Navbar = ({ user, userData, toggleTheme, darkMode }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        signOut(auth).then(() => {
            toast.success("Logged Out");
            navigate('/');
        });
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const isActive = (path) => {
        if (path === '/' && location.pathname === '/') return true;
        if (path !== '/' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const navLinkClass = (path) => `nav-link px-3 py-2 rounded-lg font-medium transition text-sm ${isActive(path) ? 'bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`;
    const mobileNavLinkClass = (path) => `nav-item flex flex-col items-center gap-1 transition group w-14 ${isActive(path) ? 'text-teal-500 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500 hover:text-teal-500 dark:hover:text-teal-400'}`;


    return (
        <>
        <nav className="fixed w-full z-50 top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/60 shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    <div className="flex items-center cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="bg-teal-500 text-white p-2 rounded-xl mr-3 shadow-sm group-hover:scale-105 transition-transform">
                            <i className="fas fa-hands-helping text-lg"></i>
                        </div>
                        <span className="font-bold text-2xl text-slate-700 dark:text-white tracking-tight">PeerCircle</span>
                    </div>

                    <div className="hidden md:flex space-x-1 lg:space-x-4 items-center">
                        <Link to="/" className={navLinkClass('/')}>Home</Link>
                        <Link to="/education" className={navLinkClass('/education')}>Library</Link>
                        <Link to="/sessions" className={navLinkClass('/sessions')}>Sessions</Link>
                        <Link to="/directory" className={navLinkClass('/directory')}>Mentors</Link>
                        <Link to="/selfhelp" className={navLinkClass('/selfhelp')}>Toolkit</Link>

                        {userData?.role === 'admin' && (
                             <Link to="/admin-dashboard" className={`px-3 py-2 rounded-lg text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition text-sm border border-red-200 dark:border-red-900 ${isActive('/admin-dashboard') ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>Admin Panel</Link>
                        )}
                        {(userData?.role === 'peer' || userData?.role === 'admin') && (
                             <Link to="/peer-inbox" className={`px-3 py-2 rounded-lg text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition text-sm border border-indigo-200 dark:border-indigo-900 ${isActive('/peer-inbox') ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
                                Inbox <span className="ml-1 bg-indigo-600 text-white text-[10px] px-1.5 rounded-full">2</span>
                             </Link>
                        )}

                        <Link to="/chat" className="ml-2 px-5 py-2 bg-slate-800 dark:bg-teal-600 text-white rounded-full font-medium hover:bg-slate-700 dark:hover:bg-teal-500 transition shadow-md text-sm">Get Support</Link>

                        <div className="border-l border-slate-200 dark:border-slate-700 pl-3 ml-1 flex items-center space-x-2">
                            <button onClick={toggleTheme} className="w-9 h-9 rounded-full text-slate-500 dark:text-yellow-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center">
                                <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                            </button>

                            {/* User Profile Dropdown */}
                            <div className="relative">
                                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                                    <div className="w-7 h-7 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-bold overflow-hidden">
                                        {userData?.photoURL ? <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" /> : getInitials(userData?.name)}
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[100px] truncate">{userData?.name || 'User'}</span>
                                    <i className="fas fa-chevron-down text-[10px] text-slate-400"></i>
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                                        <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-700">
                                            <div className="flex items-center gap-4">
                                                <div className="relative group">
                                                    <div className="w-16 h-16 rounded-full bg-teal-500 text-white flex items-center justify-center text-xl font-bold overflow-hidden ring-4 ring-teal-100 dark:ring-teal-900/30">
                                                        {userData?.photoURL ? <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" /> : getInitials(userData?.name)}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-slate-800 dark:text-white truncate">{userData?.name || 'User Name'}</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{userData?.email || 'email@example.com'}</p>
                                                    <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 capitalize">
                                                        {userData?.role || 'Student'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="py-1">
                                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                                                <i className="fas fa-camera w-4 text-slate-400"></i> Change Profile Picture
                                            </button>
                                            <button onClick={() => {navigate('/'); setIsProfileOpen(false);}} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                                                <i className="fas fa-home w-4 text-slate-400"></i> Dashboard
                                            </button>
                                            <button onClick={() => {toggleTheme(); setIsProfileOpen(false);}} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                                                <i className="fas fa-palette w-4 text-slate-400"></i> Toggle Theme
                                            </button>
                                        </div>

                                        <div className="border-t border-slate-100 dark:border-slate-700 pt-1">
                                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                                                <i className="fas fa-sign-out-alt w-4"></i> Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="md:hidden flex items-center gap-3">
                        <button onClick={toggleTheme} className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-yellow-400 flex items-center justify-center transition-colors active:scale-95">
                            <i className={`fas ${darkMode ? 'fa-sun' : 'fa-adjust'} text-lg`}></i>
                        </button>
                        <button onClick={() => setIsMobileMenuOpen(true)} className="relative active:scale-95 transition-transform">
                            <div className="w-12 h-12 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-bold ring-2 ring-white dark:ring-slate-900 shadow-sm overflow-hidden">
                                {userData?.photoURL ? <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" /> : getInitials(userData?.name)}
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        {/* Bottom Navigation Bar (Mobile Only) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 px-6 py-3 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <Link to="/" className={mobileNavLinkClass('/')}>
                <i className="fas fa-home text-xl group-active:scale-90 transition-transform mb-0.5"></i>
                <span className="text-[10px] font-medium">Home</span>
            </Link>
            <Link to="/education" className={mobileNavLinkClass('/education')}>
                <i className="fas fa-book text-xl group-active:scale-90 transition-transform mb-0.5"></i>
                <span className="text-[10px] font-medium">Library</span>
            </Link>
            <Link to="/sessions" className={mobileNavLinkClass('/sessions')}>
                <i className="fas fa-video text-xl group-active:scale-90 transition-transform mb-0.5"></i>
                <span className="text-[10px] font-medium">Sessions</span>
            </Link>
            <Link to="/directory" className={mobileNavLinkClass('/directory')}>
                <i className="fas fa-user-friends text-xl group-active:scale-90 transition-transform mb-0.5"></i>
                <span className="text-[10px] font-medium">Mentors</span>
            </Link>
        </div>

        <ProfileSheet
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            user={user}
            userData={userData}
            toggleTheme={toggleTheme}
        />
        </>
    );
};

export default Navbar;
