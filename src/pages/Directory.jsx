import React, { useEffect, useState } from 'react';
import { fetchMentorOverrides } from '../services/firebase-repo';
import { state } from '../services/state';
import { toast } from 'react-toastify';

const Directory = ({ user, userData }) => {
    const [mentors, setMentors] = useState([]);
    const [filter, setFilter] = useState('all');
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [selectedMentorEmail, setSelectedMentorEmail] = useState('');

    useEffect(() => {
        // Fetch mentor data from state + overrides
        const loadMentors = async () => {
             // Basic static data from state.js or fetch from repo if migrated completely
             // For now assume state.mentorsData is available or we fetch it
             // Actually state.mentorsData is imported from state.js which is static.
             // We need to apply overrides.
             try {
                await fetchMentorOverrides(state.mentorsData);
                setMentors([...state.mentorsData]);
             } catch (e) {
                 console.error(e);
             }
        };
        loadMentors();
    }, []);

    const filteredMentors = filter === 'all'
        ? mentors
        : mentors.filter(m => m.role === filter || m.specialties.includes(filter));

    const handleContact = (email) => {
        setSelectedMentorEmail(email);
        setShowEmailModal(true);
    };

    const copyEmail = () => {
        navigator.clipboard.writeText(selectedMentorEmail);
        toast.success("Email copied to clipboard!");
        setShowEmailModal(false);
    };

    return (
        <div className="section-content active">
             <div className="mb-8 text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">Meet the Mentors</h2>
                <p className="text-slate-500 dark:text-slate-400">Senior students who have volunteered to support you.</p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-8">
                {['all', 'BSN Year 4', 'Clinical Support', 'Exam Prep'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`mentor-filter-btn px-4 py-1.5 rounded-full text-sm font-medium shadow-md transition ${filter === f ? 'bg-teal-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-teal-500'}`}
                    >
                        {f === 'all' ? 'All' : f}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMentors.map(mentor => (
                    <div key={mentor.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col items-center text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-teal-50 to-transparent dark:from-teal-900/20"></div>

                        <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 shadow-lg mb-4 relative z-10 overflow-hidden bg-slate-200">
                             <img src={mentor.img} alt={mentor.name} className="w-full h-full object-cover" />
                        </div>

                        <div className="relative z-10 w-full">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{mentor.name}</h3>
                            <p className="text-sm font-medium text-teal-600 dark:text-teal-400 mb-3">{mentor.role}</p>

                            <div className="flex flex-wrap justify-center gap-2 mb-6">
                                {mentor.specialties.map(spec => (
                                    <span key={spec} className="px-2 py-1 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-[10px] uppercase font-bold tracking-wide rounded-md">
                                        {spec}
                                    </span>
                                ))}
                            </div>

                            <button onClick={() => handleContact(mentor.email)} className="w-full py-2.5 rounded-xl bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-lg shadow-slate-200 dark:shadow-none hover:scale-[1.02] active:scale-95 transition-transform">
                                Contact
                            </button>
                        </div>
                    </div>
                ))}
            </div>

             {/* Email Modal */}
            {showEmailModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center transform scale-100 transition-transform">
                        <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-teal-600 dark:text-teal-400 text-2xl">
                            <i className="fas fa-envelope-open-text"></i>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Contact Mentor</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Send an email to connect.</p>

                        <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl mb-6 flex items-center justify-between border border-slate-200 dark:border-slate-700">
                            <span className="text-slate-800 dark:text-white font-mono text-sm truncate mr-2">{selectedMentorEmail}</span>
                            <button onClick={copyEmail} className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-bold text-xs uppercase tracking-wider">
                                Copy
                            </button>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setShowEmailModal(false)} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                                Close
                            </button>
                            <a href={`mailto:${selectedMentorEmail}`} className="flex-1 py-3 rounded-xl bg-teal-600 text-white font-bold shadow-lg shadow-teal-500/30 hover:bg-teal-700 transition flex items-center justify-center">
                                Open Mail
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Directory;
