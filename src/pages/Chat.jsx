import React, { useState } from 'react';
import { handleBookingRequest } from '../services/firebase-repo';

const Chat = ({ user, userData }) => {
    const [name, setName] = useState(userData?.name || '');
    const [email, setEmail] = useState(userData?.email || '');
    const [year, setYear] = useState('BSN Year 1');
    const [topic, setTopic] = useState('General Stress');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await handleBookingRequest({
                name,
                email,
                year,
                topic
            });
            setSuccess(true);
        } catch (error) {
            console.error(error);
            alert("Failed to send request. Please try again.");
        }
    };

    const resetForm = () => {
        setSuccess(false);
        setTopic('General Stress');
    };

    return (
        <div className="section-content active">
             <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">Connect with a Peer</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                        Matched based on your topic. Confidential. Asynchronous.
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-slate-100 dark:border-slate-700">
                    <div className="bg-teal-600 p-8 md:p-12 text-white flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-6">How it works</h3>
                            <ul className="space-y-6 mb-8">
                                <li className="flex items-start"><i className="fas fa-check mt-1 mr-3 text-teal-300"></i><span className="text-teal-50 text-sm leading-relaxed">Fill out the request form.</span></li>
                                <li className="flex items-start"><i className="fas fa-check mt-1 mr-3 text-teal-300"></i><span className="text-teal-50 text-sm leading-relaxed">Matched within 24 hours.</span></li>
                                <li className="flex items-start"><i className="fas fa-check mt-1 mr-3 text-teal-300"></i><span className="text-teal-50 text-sm leading-relaxed">Receive secure chat link via email.</span></li>
                            </ul>
                        </div>
                    </div>

                    <div className="p-8 md:p-12 relative min-h-[400px] flex flex-col justify-center">
                        {!success ? (
                            <div className="transition-opacity duration-300">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Name / Alias</label>
                                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="input-field w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition" placeholder="e.g. Alex" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Student Email</label>
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-field w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition" placeholder="e.g. student@rakmhsu.ac.ae" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Year of Study</label>
                                        <div className="relative">
                                            <select value={year} onChange={e => setYear(e.target.value)} className="input-field appearance-none cursor-pointer w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition">
                                                <option>BSN Year 1</option>
                                                <option>BSN Year 2</option>
                                                <option>BSN Year 3</option>
                                                <option>BSN Year 4</option>
                                                <option>MSN Student</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                                <i className="fas fa-chevron-down text-xs"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Topic</label>
                                        <div className="relative">
                                            <select value={topic} onChange={e => setTopic(e.target.value)} className="input-field appearance-none cursor-pointer w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition">
                                                <option>General Stress</option>
                                                <option>Academic Struggles</option>
                                                <option>Clinical Placement</option>
                                                <option>Venting</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                                <i className="fas fa-chevron-down text-xs"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full bg-slate-800 dark:bg-teal-600 text-white py-3.5 rounded-lg font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center">
                                        <span>Send Request</span>
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center animate-[fadeIn_0.5s_ease-out]">
                                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                    <i className="fas fa-check text-4xl text-green-500"></i>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Request Received!</h3>
                                <button onClick={resetForm} className="text-teal-600 dark:text-teal-400 font-semibold hover:underline text-sm">Send another request</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
