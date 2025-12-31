import React, { useEffect, useState } from 'react';
import { subscribeToSessions, addSession, deleteSession } from '../services/firebase-repo';
import { toast } from 'react-toastify';

const Sessions = ({ user, userData }) => {
    const [sessions, setSessions] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [host, setHost] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [duration, setDuration] = useState('60');
    const [platform, setPlatform] = useState('Zoom');
    const [tag, setTag] = useState('');
    const [link, setLink] = useState('');
    const [desc, setDesc] = useState('');

    useEffect(() => {
        const unsubscribe = subscribeToSessions((fetchedSessions) => {
            // Sort by date
            const sorted = fetchedSessions.sort((a, b) => new Date(a.date) - new Date(b.date));
            setSessions(sorted);
        });
        return () => unsubscribe();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await addSession({
                title,
                host,
                date,
                time,
                duration,
                platform,
                tag,
                link,
                desc
            });
            toast.success("Session scheduled successfully");
            setShowAddModal(false);
            resetForm();
        } catch (error) {
            console.error(error);
            toast.error("Failed to schedule session");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Cancel and delete this session?")) {
            try {
                await deleteSession(id);
                toast.success("Session cancelled");
            } catch (error) {
                console.error(error);
                toast.error("Failed to delete session");
            }
        }
    };

    const resetForm = () => {
        setTitle('');
        setHost('');
        setDate('');
        setTime('');
        setDuration('60');
        setPlatform('Zoom');
        setTag('');
        setLink('');
        setDesc('');
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString('en-US', options);
    };

    return (
        <div className="section-content active">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Virtual Sessions</h2>
                    <p className="text-slate-500 dark:text-slate-400">Live workshops via Zoom, Google Meet, or Teams.</p>
                </div>

                {userData?.role === 'admin' && (
                    <button onClick={() => setShowAddModal(!showAddModal)} className="bg-slate-800 dark:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 shadow-sm transition-all">
                        <i className="fas fa-calendar-plus mr-2"></i>Schedule Session
                    </button>
                )}
            </div>

            {showAddModal && (
                <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 mb-8 shadow-lg animate-[fadeIn_0.3s_ease-out]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Schedule New Session</h3>
                        <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-red-500 p-2"><i className="fas fa-times text-xl"></i></button>
                    </div>

                    <form onSubmit={handleAdd} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Session Title</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. NCLEX Prep Strategy" required className="input-field w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Host / Facilitator</label>
                                <input type="text" value={host} onChange={e => setHost(e.target.value)} placeholder="e.g. Dr. Sarah" required className="input-field w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Date</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="input-field cursor-pointer w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Time</label>
                                <input type="time" value={time} onChange={e => setTime(e.target.value)} required className="input-field cursor-pointer w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Duration</label>
                                <select value={duration} onChange={e => setDuration(e.target.value)} className="input-field appearance-none cursor-pointer w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition">
                                    <option value="30">30 Minutes</option>
                                    <option value="45">45 Minutes</option>
                                    <option value="60">1 Hour</option>
                                    <option value="90">1.5 Hours</option>
                                    <option value="120">2 Hours</option>
                                </select>
                            </div>
                        </div>

                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Platform</label>
                                <select value={platform} onChange={e => setPlatform(e.target.value)} className="input-field appearance-none cursor-pointer w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition">
                                    <option value="Zoom">Zoom</option>
                                    <option value="Google Meet">Google Meet</option>
                                    <option value="Microsoft Teams">Microsoft Teams</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Tag / Label</label>
                                <input type="text" value={tag} onChange={e => setTag(e.target.value)} placeholder="e.g. Study Skills" className="input-field w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Meeting Link</label>
                                <input type="url" value={link} onChange={e => setLink(e.target.value)} placeholder="https://zoom.us/j/..." required className="input-field w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Short Description</label>
                            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows="2" placeholder="Briefly describe what students will learn in this session..." className="input-field resize-none w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"></textarea>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button type="submit" className="px-8 py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/30 transition transform hover:-translate-y-0.5">
                                Schedule Session
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 text-sm">
                    <div className="col-span-2">Date & Time</div>
                    <div className="col-span-4">Session Details</div>
                    <div className="col-span-3">Host & Platform</div>
                    <div className="col-span-3 text-right">Action</div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {sessions.length === 0 ? (
                         <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                            <i className="fas fa-calendar-times text-4xl mb-3 opacity-30"></i>
                            <p>No upcoming sessions.</p>
                        </div>
                    ) : (
                        sessions.map(session => (
                            <div key={session.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                <div className="col-span-2 flex md:block items-center gap-3">
                                    <div className="md:hidden w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center text-teal-600 dark:text-teal-400">
                                        <i className="fas fa-calendar-day"></i>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-white">{formatDate(session.date)}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{session.time}</p>
                                    </div>
                                </div>
                                <div className="col-span-4">
                                    {session.tag && (
                                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 mb-1">
                                            {session.tag.toUpperCase()}
                                        </span>
                                    )}
                                    <h4 className="font-bold text-lg text-slate-800 dark:text-white mb-1">{session.title}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{session.desc}</p>
                                </div>
                                <div className="col-span-3 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                                        {session.host?.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{session.host}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                            <i className="fas fa-video"></i> {session.platform}
                                        </p>
                                    </div>
                                </div>
                                <div className="col-span-3 flex items-center justify-end gap-3 mt-4 md:mt-0">
                                    {userData?.role === 'admin' && (
                                        <button onClick={() => handleDelete(session.id)} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition">
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    )}
                                    <a href={session.link} target="_blank" rel="noopener noreferrer" className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md shadow-teal-500/20 transition transform active:scale-95">
                                        Join
                                    </a>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sessions;
