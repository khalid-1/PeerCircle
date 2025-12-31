import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase-init';
import { toast } from 'react-toastify';

const ProfileSheet = ({ isOpen, onClose, user, userData, toggleTheme }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleLogout = () => {
        signOut(auth).then(() => {
            toast.success("Logged Out");
            onClose();
            navigate('/');
        });
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <>
            <div onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300 opacity-100"></div>
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-[2rem] z-[70] transform translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.2)] pb-[env(safe-area-inset-bottom)] animate-[slideUp_0.3s_ease-out]">
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-3 mb-6"></div>

                <div className="px-6 pb-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-teal-500 text-white flex items-center justify-center text-2xl font-bold ring-4 ring-slate-50 dark:ring-slate-800 overflow-hidden">
                                {userData?.photoURL ? <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" /> : getInitials(userData?.name)}
                            </div>
                            <button className="absolute bottom-0 right-0 w-6 h-6 bg-slate-800 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center text-[10px] shadow-md hover:scale-110 transition-transform">
                                <i className="fas fa-camera"></i>
                            </button>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-xl text-slate-800 dark:text-white truncate">{userData?.name || 'User Name'}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{userData?.email || 'email@example.com'}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button onClick={() => { toggleTheme(); onClose(); }} className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 font-medium active:scale-[0.98] transition-transform">
                            <span className="flex items-center gap-3"><i className="fas fa-moon text-indigo-500 text-lg w-6"></i> Dark Mode</span>
                            <div className="w-10 h-6 bg-slate-200 dark:bg-teal-500 rounded-full relative transition-colors">
                                <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 dark:left-5 transition-all shadow-sm"></div>
                            </div>
                        </button>

                        <button className="w-full flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 font-medium active:scale-[0.98] transition-transform">
                            <i className="fas fa-user-edit text-teal-500 text-lg w-6"></i> Edit Profile
                        </button>

                        <button onClick={() => { navigate('/selfhelp'); onClose(); }} className="w-full flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 font-medium active:scale-[0.98] transition-transform">
                            <i className="fas fa-question-circle text-blue-500 text-lg w-6"></i> Help & Support
                        </button>

                        <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold active:scale-[0.98] transition-transform">
                            <i className="fas fa-sign-out-alt text-lg w-6"></i> Log Out
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProfileSheet;
