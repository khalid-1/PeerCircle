import React, { useEffect, useState } from 'react';
import { subscribeToTopics, subscribeToSessions, subscribeToInbox } from '../services/firebase-repo';

const AdminDashboard = ({ user, userData }) => {
    const [topicCount, setTopicCount] = useState(0);
    const [sessionCount, setSessionCount] = useState(0);
    const [requestCount, setRequestCount] = useState(0);

    useEffect(() => {
        if (userData?.role !== 'admin') return;

        const unsubTopics = subscribeToTopics(topics => setTopicCount(topics.length));
        const unsubSessions = subscribeToSessions(sessions => setSessionCount(sessions.length));
        const unsubRequests = subscribeToInbox(requests => {
             const pending = requests.filter(r => r.status === 'pending');
             setRequestCount(pending.length);
        });

        return () => {
            unsubTopics();
            unsubSessions();
            unsubRequests();
        };
    }, [userData]);

    if (userData?.role !== 'admin') {
        return <div className="p-10 text-center">Access Denied</div>;
    }

    return (
        <div className="section-content active">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Admin Dashboard</h2>
                <p className="text-slate-500">Overview of platform activity.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Active Mentors</p>
                    <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-2">13</h3>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Topics Published</p>
                    <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-2">{topicCount}</h3>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Pending Requests</p>
                    <h3 className="text-3xl font-bold text-teal-600 dark:text-teal-400 mt-2">{requestCount}</h3>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Sessions</p>
                    <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-2">{sessionCount}</h3>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
