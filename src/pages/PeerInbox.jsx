import React, { useEffect, useState } from 'react';
import { subscribeToInbox, acceptPeerRequest } from '../services/firebase-repo';
import { toast } from 'react-toastify';

const PeerInbox = ({ user, userData }) => {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        if (!userData || (userData.role !== 'peer' && userData.role !== 'admin')) return;

        const unsubscribe = subscribeToInbox((fetchedRequests) => {
             // Sort by date desc
             const sorted = fetchedRequests.sort((a, b) => b.timestamp - a.timestamp);
             setRequests(sorted);
        });
        return () => unsubscribe();
    }, [userData]);

    const handleAccept = async (id) => {
        try {
            await acceptPeerRequest(id);
            toast.success("Request accepted!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to accept request");
        }
    };

    const formatDate = (ts) => {
        if (!ts) return '';
        const date = ts.toDate ? ts.toDate() : new Date(ts);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    if (userData?.role !== 'peer' && userData?.role !== 'admin') {
        return <div className="p-10 text-center">Access Denied</div>;
    }

    return (
        <div className="section-content active">
             <div className="mb-6">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white">My Inbox</h2>
                <p className="text-slate-500">Students matched with you.</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {requests.length === 0 ? (
                         <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                            <i className="fas fa-inbox text-4xl mb-3 opacity-30"></i>
                            <p>No messages yet.</p>
                        </div>
                    ) : (
                        requests.map(req => (
                            <div key={req.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition relative">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-block w-2 h-2 rounded-full ${req.status === 'pending' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                                        <h4 className="font-bold text-lg text-slate-800 dark:text-white">{req.name}</h4>
                                        <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">{req.year}</span>
                                    </div>
                                    <span className="text-xs text-slate-400">{formatDate(req.timestamp)}</span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4"><span className="font-bold">Topic:</span> {req.topic}</p>

                                {req.status === 'pending' ? (
                                    <div className="flex gap-3">
                                        <button onClick={() => handleAccept(req.id)} className="px-4 py-2 bg-teal-600 text-white text-sm font-bold rounded-lg hover:bg-teal-700 transition shadow-sm">
                                            Accept Request
                                        </button>
                                        <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                                            Pass
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold text-sm">
                                        <i className="fas fa-check-circle"></i> Accepted
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default PeerInbox;
