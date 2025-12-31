import React, { useEffect, useState } from 'react';
import { subscribeToTopics, addTopic, deleteTopic } from '../services/firebase-repo';
import { toast } from 'react-toastify';

const Education = ({ user, userData }) => {
    const [topics, setTopics] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [intro, setIntro] = useState('');
    const [bullets, setBullets] = useState('');
    const [action, setAction] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('fa-lightbulb');
    const [selectedColor, setSelectedColor] = useState('teal');

    useEffect(() => {
        const unsubscribe = subscribeToTopics((fetchedTopics) => {
            setTopics(fetchedTopics);
        });
        return () => unsubscribe();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await addTopic({
                title,
                desc,
                icon: selectedIcon,
                color: selectedColor,
                content: {
                    intro,
                    bullets: bullets.split('\n').filter(b => b.trim()),
                    action
                }
            });
            toast.success("Topic added successfully");
            setShowAddModal(false);
            resetForm();
        } catch (error) {
            console.error(error);
            toast.error("Failed to add topic");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this topic?")) {
            try {
                await deleteTopic(id);
                toast.success("Topic deleted");
            } catch (error) {
                console.error(error);
                toast.error("Failed to delete topic");
            }
        }
    };

    const resetForm = () => {
        setTitle('');
        setDesc('');
        setIntro('');
        setBullets('');
        setAction('');
    };

    const icons = ['fa-lightbulb', 'fa-book-medical', 'fa-heartbeat', 'fa-user-md', 'fa-stethoscope', 'fa-hospital'];
    const colors = ['teal', 'blue', 'indigo', 'purple', 'pink', 'red', 'orange', 'yellow', 'green'];

    return (
        <div className="section-content active">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Wellbeing Library</h2>
                    <p className="text-slate-500 dark:text-slate-400">Practical guides for the nursing journey.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-teal-500 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition">
                        <i className="fas fa-lightbulb"></i>
                        <span className="hidden sm:inline">Suggest a Topic</span>
                    </button>
                    {userData?.role === 'admin' && (
                        <button onClick={() => setShowAddModal(!showAddModal)} className="bg-slate-800 dark:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
                            <i className="fas fa-plus mr-2"></i>Manage Topics
                        </button>
                    )}
                </div>
            </div>

            {showAddModal && (
                <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 mb-8 shadow-lg animate-[fadeIn_0.3s_ease-out]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Create New Resource</h3>
                        <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-red-500 p-2"><i className="fas fa-times text-xl"></i></button>
                    </div>

                    <form onSubmit={handleAdd} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Topic Title</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Night Shift Survival" required className="input-field w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Short Description (Card)</label>
                                <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. Tips for staying awake and healthy." required className="input-field w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Select Icon</label>
                                <div className="grid grid-cols-6 gap-2">
                                    {icons.map(icon => (
                                        <div key={icon} onClick={() => setSelectedIcon(icon)} className={`cursor-pointer w-10 h-10 rounded-lg flex items-center justify-center transition border ${selectedIcon === icon ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 border-transparent' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                                            <i className={`fas ${icon}`}></i>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Theme Color</label>
                                <div className="flex flex-wrap gap-3">
                                    {colors.map(color => (
                                        <div key={color} onClick={() => setSelectedColor(color)} className={`cursor-pointer w-8 h-8 rounded-full transition ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ${selectedColor === color ? 'ring-2 ring-slate-400 scale-110' : 'hover:scale-110'}`} style={{ backgroundColor: color === 'white' ? '#f8fafc' : `var(--color-${color}-500, ${color})` }}></div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <hr className="border-slate-100 dark:border-slate-700" />

                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-white mb-4"><i className="fas fa-pen-nib mr-2 text-teal-500"></i>Guide Content</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Introduction Paragraph</label>
                                    <textarea value={intro} onChange={e => setIntro(e.target.value)} rows="3" className="input-field w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition" placeholder="Explain the concept..."></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Key Points (One per line)</label>
                                    <textarea value={bullets} onChange={e => setBullets(e.target.value)} rows="3" className="input-field w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition" placeholder="- First point&#10;- Second point&#10;- Third point"></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Actionable Tip (Colored Box)</label>
                                    <input type="text" value={action} onChange={e => setAction(e.target.value)} placeholder="e.g. Try the 4-7-8 breathing method right now." className="input-field w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition" />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-slate-800 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-bold hover:opacity-90 transition shadow-lg">
                            Publish Topic
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topics.map(topic => (
                    <div key={topic.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow relative group">
                         {userData?.role === 'admin' && (
                            <button onClick={(e) => {e.stopPropagation(); handleDelete(topic.id);}} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 z-10">
                                <i className="fas fa-trash"></i>
                            </button>
                        )}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 bg-${topic.color || 'teal'}-100 dark:bg-${topic.color || 'teal'}-900/30 text-${topic.color || 'teal'}-600 dark:text-${topic.color || 'teal'}-400`}>
                            <i className={`fas ${topic.icon || 'fa-book'}`}></i>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{topic.title}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">{topic.desc}</p>
                        <button className="text-teal-600 dark:text-teal-400 font-bold text-sm hover:underline">Read Guide</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Education;
