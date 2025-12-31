import React, { useState, useEffect } from 'react';

const SelfHelp = ({ user, userData }) => {
    const [breathingActive, setBreathingActive] = useState(false);
    const [timerText, setTimerText] = useState('');
    const [instruction, setInstruction] = useState('Tap Start');
    const [progress, setProgress] = useState(0);

    // Breathing Logic
    useEffect(() => {
        let interval;
        if (breathingActive) {
            let phase = 0; // 0: inhale, 1: hold, 2: exhale
            let count = 0;
            const cycle = () => {
                if (!breathingActive) return;

                if (phase === 0) { // Inhale 4s
                    setInstruction("Inhale...");
                    if (count < 4) {
                        count++;
                        setTimerText(count);
                        setProgress((count / 4) * 100);
                    } else {
                        phase = 1;
                        count = 0;
                    }
                } else if (phase === 1) { // Hold 7s
                    setInstruction("Hold...");
                    if (count < 7) {
                        count++;
                        setTimerText(count);
                        setProgress((count / 7) * 100); // Visual indicator might need adjustment for hold
                    } else {
                        phase = 2;
                        count = 0;
                    }
                } else if (phase === 2) { // Exhale 8s
                    setInstruction("Exhale...");
                    if (count < 8) {
                        count++;
                        setTimerText(count);
                        setProgress(100 - (count / 8) * 100);
                    } else {
                        phase = 0;
                        count = 0;
                    }
                }
            };
            // Initial call
            cycle();
            interval = setInterval(cycle, 1000);
        } else {
            setTimerText('');
            setInstruction('Tap Start');
            setProgress(0);
        }

        return () => clearInterval(interval);
    }, [breathingActive]);

    const toggleBreathing = () => {
        setBreathingActive(!breathingActive);
    };

    return (
        <div className="section-content active">
             <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Self-Help Toolkit</h2>
                <p className="text-slate-500 dark:text-slate-400">Quick tools you can use anytime.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-blue-500"></div>
                    <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">Box Breathing</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Regulate your nervous system in 30 seconds.</p>

                    <div className={`breathing-widget ${breathingActive ? 'active' : ''}`}>
                         <div className="relative w-[108px] h-[108px] flex items-center justify-center">
                            <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90" width="108" height="108" viewBox="0 0 108 108">
                                <circle cx="54" cy="54" r="52" fill="none" stroke="#e2e8f0" strokeWidth="4" className="dark:stroke-slate-700" />
                                <circle cx="54" cy="54" r="52" fill="none" stroke="#0d9488" strokeWidth="4" strokeDasharray="327" strokeDashoffset={327 - (327 * progress) / 100} className={`transition-all duration-1000 ease-linear ${breathingActive ? '' : 'hidden'}`} />
                            </svg>
                            <div className={`w-20 h-20 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-2xl font-bold text-teal-600 dark:text-teal-400 transition-all duration-1000 ${breathingActive ? 'scale-110' : ''}`}>
                                {timerText}
                            </div>
                        </div>
                    </div>

                    <div className="text-center mb-6 h-16 mt-4">
                        <div className="text-2xl font-bold text-slate-800 dark:text-white transition-opacity duration-300">
                            {breathingActive ? instruction : 'Ready?'}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-opacity duration-300">
                             {breathingActive ? 'Focus on your breath' : 'Tap Start'}
                        </div>
                    </div>

                    <button onClick={toggleBreathing} className="mt-6 bg-teal-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-teal-700 transition shadow-lg hover:shadow-teal-500/30">
                        {breathingActive ? 'Stop Exercise' : 'Start Exercise'}
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800">
                        <div className="flex items-center mb-4">
                            <div className="bg-indigo-100 dark:bg-indigo-800 p-2 rounded-lg mr-3 text-indigo-600 dark:text-indigo-300">
                                <i className="fas fa-moon"></i>
                            </div>
                            <h3 className="font-bold text-lg text-indigo-900 dark:text-indigo-100">Sleep Hygiene</h3>
                        </div>
                        <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                            <li className="flex items-center"><i className="fas fa-check-circle text-indigo-500 mr-3"></i> No screens 30 mins before bed</li>
                            <li className="flex items-center"><i className="fas fa-check-circle text-indigo-500 mr-3"></i> Room temp cool (18-20°C)</li>
                            <li className="flex items-center"><i className="fas fa-check-circle text-indigo-500 mr-3"></i> No caffeine after 2 PM</li>
                        </ul>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200">Quick Coping Strategies</div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                            <details className="group p-4 cursor-pointer">
                                <summary className="flex justify-between items-center font-medium text-slate-700 dark:text-slate-300 list-none">
                                    <span><i className="fas fa-walking mr-2 text-teal-500"></i> 5-4-3-2-1 Method</span>
                                    <span className="transition group-open:rotate-180"><i className="fas fa-chevron-down text-slate-400"></i></span>
                                </summary>
                                <p className="text-slate-600 dark:text-slate-400 text-sm mt-3 pl-6 leading-relaxed">
                                    Acknowledge 5 things you see, 4 you can touch, 3 you hear, 2 you can smell, and 1 you can taste.
                                </p>
                            </details>
                            <details className="group p-4 cursor-pointer">
                                <summary className="flex justify-between items-center font-medium text-slate-700 dark:text-slate-300 list-none">
                                    <span><i className="fas fa-pencil-alt mr-2 text-teal-500"></i> Brain Dump</span>
                                    <span className="transition group-open:rotate-180"><i className="fas fa-chevron-down text-slate-400"></i></span>
                                </summary>
                                <p className="text-slate-600 dark:text-slate-400 text-sm mt-3 pl-6 leading-relaxed">
                                    Set a timer for 3 minutes. Write down everything worrying you on paper. Then rip it up.
                                </p>
                            </details>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelfHelp;
