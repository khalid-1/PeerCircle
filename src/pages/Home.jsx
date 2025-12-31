import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = ({ user, userData }) => {
    const navigate = useNavigate();
    const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="section-content active">
            {/* Greeting Header */}
            <div className="mb-8 pt-2 md:pt-8">
                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-bold uppercase tracking-wider mb-1">
                    {date.toUpperCase()}
                </p>
                <h1 className="text-2xl md:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                    Welcome Back, {userData?.name?.split(' ')[0] || 'Student'}
                </h1>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <button onClick={() => navigate('/directory')} className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl text-left hover:scale-[1.02] transition-transform active:scale-95 border border-blue-100 dark:border-blue-800/30 group">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 mb-3 text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <i className="fas fa-user-friends"></i>
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white">Find Mentor</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Connect with seniors</p>
                </button>

                <button onClick={() => navigate('/education')} className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-2xl text-left hover:scale-[1.02] transition-transform active:scale-95 border border-indigo-100 dark:border-indigo-800/30 group">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300 mb-3 text-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <i className="fas fa-book"></i>
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white">Library</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Study guides</p>
                </button>

                <button onClick={() => navigate('/sessions')} className="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-2xl text-left hover:scale-[1.02] transition-transform active:scale-95 border border-purple-100 dark:border-purple-800/30 group">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-300 mb-3 text-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <i className="fas fa-video"></i>
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white">Sessions</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Live workshops</p>
                </button>

                <button onClick={() => navigate('/chat')} className="bg-teal-50 dark:bg-teal-900/20 p-5 rounded-2xl text-left hover:scale-[1.02] transition-transform active:scale-95 border border-teal-100 dark:border-teal-800/30 group">
                    <div className="w-10 h-10 bg-teal-100 dark:bg-teal-800 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-300 mb-3 text-lg group-hover:bg-teal-600 group-hover:text-white transition-colors">
                        <i className="fas fa-comment-medical"></i>
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white">Get Support</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Chat with a peer</p>
                </button>
            </div>

            {/* Featured Card */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Daily Insight</h2>
                    <button onClick={() => navigate('/selfhelp')} className="text-teal-600 dark:text-teal-400 text-sm font-bold hover:underline">View All</button>
                </div>
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-800 dark:to-slate-900 dark:border dark:border-slate-700 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-slate-200 dark:shadow-none">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500 rounded-full blur-[80px] opacity-20"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500 rounded-full blur-[60px] opacity-20"></div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold mb-4 backdrop-blur-md border border-white/10">
                            <i className="fas fa-star text-yellow-400"></i> TIP OF THE DAY
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold mb-3 leading-tight">The 4-7-8 Breathing Technique</h3>
                        <p className="text-slate-300 text-sm md:text-base mb-6 max-w-lg leading-relaxed">
                            Feeling overwhelmed? Try this simple breathing exercise to reset your nervous system in minutes. It helps reduce anxiety and aids sleep.
                        </p>
                        <button onClick={() => navigate('/selfhelp')} className="bg-white text-slate-900 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-100 transition shadow-lg active:scale-95 transform">
                            Try It Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
