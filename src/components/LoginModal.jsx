import React, { useState } from 'react';
import { signUp, signIn, resetPassword } from '../services/firebase-init';
import { toast } from 'react-toastify';

const LoginModal = ({ onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [isReset, setIsReset] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isReset) {
                await resetPassword(email);
                toast.success('Password reset email sent!');
                setIsReset(false);
                setIsLogin(true);
            } else if (isLogin) {
                await signIn(email, password);
                toast.success('Logged in successfully!');
                onClose();
            } else {
                if (!name) {
                    toast.error('Please enter your name.');
                    return;
                }
                await signUp(email, password, name);
                toast.success('Account created! Please verify your email.');
                // Don't close immediately, maybe wait for verification
                 setIsLogin(true);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform scale-100 transition-transform duration-300">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-teal-50 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-teal-600 dark:text-teal-400 text-3xl shadow-sm">
                            <i className="fas fa-graduation-cap"></i>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                            {isReset ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Create Account')}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 text-base">
                            {isReset ? 'Enter email to receive reset link.' : 'Sign in to access resources.'}
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6 text-left">
                            {!isLogin && !isReset && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        className="input-field w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                                        placeholder="Jane Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="input-field w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                                    placeholder="student@rakmhsu.ac.ae"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            {!isReset && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            className="input-field w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition pr-10"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-teal-600 transition"
                                        >
                                            <i className={`far ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button type="submit" className="w-full bg-teal-600 text-white py-3.5 rounded-xl font-bold hover:bg-teal-700 transition shadow-lg shadow-teal-200 dark:shadow-none mb-4 text-lg">
                                {isReset ? 'Send Reset Link' : (isLogin ? 'Sign In' : 'Sign Up')}
                            </button>

                            <div className="text-center mb-4">
                                {isLogin && !isReset && (
                                    <button type="button" onClick={() => setIsReset(true)} className="text-xs text-slate-500 hover:text-teal-600 transition">
                                        Forgot Password?
                                    </button>
                                )}
                                {isReset && (
                                    <button type="button" onClick={() => {setIsReset(false); setIsLogin(true);}} className="text-xs text-slate-500 hover:text-teal-600 transition">
                                        Back to Login
                                    </button>
                                )}
                            </div>
                        </form>

                        {!isReset && (
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                <span>{isLogin ? 'New here?' : 'Already have an account?'}</span>
                                <button
                                    type="button"
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="text-teal-600 dark:text-teal-400 font-bold hover:underline ml-1 text-base"
                                >
                                    {isLogin ? 'Create Account' : 'Sign In'}
                                </button>
                            </p>
                        )}

                         <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 text-center">
                            <p className="text-slate-400 text-xs mb-2">© 2025 PeerCircle. Created by <span className="font-bold text-slate-500 dark:text-slate-300">Khalid Said</span>.</p>
                             <div className="flex justify-center space-x-4">
                                <a href="#" className="text-slate-400 hover:text-teal-500 transition"><i className="fab fa-instagram text-lg"></i></a>
                                <a href="#" className="text-slate-400 hover:text-teal-500 transition"><i className="fab fa-github text-lg"></i></a>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
