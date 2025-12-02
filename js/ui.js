import { escapeHTML, getInitials } from './utils.js';
import { state } from './state.js';
import * as Repo from './firebase-repo.js';

// ==========================================
// NOTIFICATIONS & MODALS
// ==========================================

export function showNotification(msg, type) {
    const notif = document.getElementById('notification');
    if (!notif) return;

    const msgEl = document.getElementById('notif-message');
    if (msgEl) msgEl.textContent = msg;

    // Remove the class that pushes it down (so it slides UP)
    notif.classList.remove('translate-y-24', 'opacity-0');

    // Optional: Change color based on type (success/error)
    if (type === 'error') {
        notif.classList.remove('bg-slate-900');
        notif.classList.add('bg-red-600');
    } else {
        notif.classList.add('bg-slate-900');
        notif.classList.remove('bg-red-600');
    }

    setTimeout(() => {
        // Add the class back to push it down again
        notif.classList.add('translate-y-24', 'opacity-0');
    }, 3000);
}

export function openModal(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.remove('hidden');
        el.classList.add('flex');
    }
}

export function closeModal(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.add('hidden');
        el.classList.remove('flex');
    }
}

// ==========================================
// NAVIGATION & THEME
// ==========================================

export function initTheme() {
    const themeIcon = document.getElementById('theme-icon');
    if (!themeIcon) return;
    if (localStorage.getItem('dps_theme') === 'dark' || (!('dps_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    } else {
        document.documentElement.classList.remove('dark');
        themeIcon.classList.replace('fa-sun', 'fa-moon');
    }
}

export function toggleTheme() {
    const html = document.documentElement;
    const icon = document.getElementById('theme-icon');
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        localStorage.setItem('dps_theme', 'light');
        icon.classList.replace('fa-sun', 'fa-moon');
    } else {
        html.classList.add('dark');
        localStorage.setItem('dps_theme', 'dark');
        icon.classList.replace('fa-moon', 'fa-sun');
    }
}

export function renderSection(sectionId) {
    document.querySelectorAll('.section-content').forEach(el => {
        el.classList.remove('active');
        el.classList.add('hidden');
    });
    const targetId = document.getElementById(sectionId) ? sectionId : 'home';
    const target = document.getElementById(targetId);
    if (target) {
        target.classList.add('active');
        target.classList.remove('hidden');
    }
    window.scrollTo(0, 0);
    updateNavState(targetId);
}

function updateNavState(activeId) {
    // Desktop Nav
    document.querySelectorAll('.nav-link').forEach(btn => {
        const onClickText = btn.getAttribute('onclick');
        if (onClickText && onClickText.includes(activeId)) {
            btn.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-teal-600', 'dark:text-teal-400');
            btn.classList.remove('text-slate-600', 'dark:text-slate-400');
        } else {
            btn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-teal-600', 'dark:text-teal-400');
            btn.classList.add('text-slate-600', 'dark:text-slate-400');
        }
    });

    // Mobile Nav
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        const onClickText = link.getAttribute('onclick');
        if (onClickText && onClickText.includes(activeId)) {
            link.classList.add('bg-teal-50', 'dark:bg-teal-900/30', 'text-teal-700', 'dark:text-teal-300');
            link.classList.remove('text-slate-600', 'dark:text-slate-300');
        } else {
            link.classList.remove('bg-teal-50', 'dark:bg-teal-900/30', 'text-teal-700', 'dark:text-teal-300');
            link.classList.add('text-slate-600', 'dark:text-slate-300');
        }
    });
}

export function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const icon = document.querySelector('#mobile-menu-btn i');

    if (menu) {
        if (menu.classList.contains('hidden')) {
            menu.classList.remove('hidden');
            setTimeout(() => {
                menu.classList.remove('translate-x-full');
            }, 10);
            if (icon) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            }
        } else {
            menu.classList.add('translate-x-full');
            setTimeout(() => {
                menu.classList.add('hidden');
            }, 300);
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
    }
}

// ==========================================
// TOPICS
// ==========================================

const availableColors = [
    { name: "teal", hex: "bg-teal-500", light: "bg-teal-100", text: "text-teal-600" },
    { name: "blue", hex: "bg-blue-500", light: "bg-blue-100", text: "text-blue-600" },
    { name: "indigo", hex: "bg-indigo-500", light: "bg-indigo-100", text: "text-indigo-600" },
    { name: "purple", hex: "bg-purple-500", light: "bg-purple-100", text: "text-purple-600" },
    { name: "rose", hex: "bg-rose-500", light: "bg-rose-100", text: "text-rose-600" },
    { name: "amber", hex: "bg-amber-500", light: "bg-amber-100", text: "text-amber-600" }
];

export function renderTopics() {
    const container = document.getElementById('topics-container');
    if (!container) return;

    if (state.topicsData.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-10 text-slate-400">No topics found. Admin can add one.</div>`;
        return;
    }

    container.innerHTML = state.topicsData.map(topic => {
        const theme = availableColors.find(c => c.name === topic.color) || availableColors[0];
        let adminControls = state.currentUserRole === 'admin'
            ? `<button onclick="window.deleteTopic(event, '${topic.id}')" class="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition z-20"><i class="fas fa-trash-alt"></i></button>`
            : "";

        return `
            <div onclick="window.openTopicModal('${topic.id}')" class="cursor-pointer bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative">
                <div class="h-2 ${theme.hex}"></div> <div class="p-6">
                    ${adminControls}
                    <div class="flex justify-between items-start mb-3">
                        <h3 class="font-bold text-lg text-slate-800 dark:text-white group-hover:${theme.text} transition-colors">${escapeHTML(topic.title)}</h3>
                        <div class="${theme.text} text-xl"><i class="fas ${topic.icon}"></i></div>
                    </div>
                    <p class="text-slate-600 dark:text-slate-300 text-sm mb-6 h-10 overflow-hidden">${escapeHTML(topic.desc)}</p>
                    <span class="text-xs font-bold ${theme.text} uppercase tracking-wider flex items-center">
                        Read Guide <i class="fas fa-arrow-right ml-1 transform group-hover:translate-x-1 transition-transform"></i>
                    </span>
                </div>
            </div>`;
    }).join('');
}

// ==========================================
// MENTORS
// ==========================================

export function filterMentors(filter, btn) {
    // Update UI
    document.querySelectorAll('.mentor-filter-btn').forEach(b => {
        b.className = 'mentor-filter-btn px-4 py-1.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium hover:border-teal-500 transition';
    });

    if (btn) {
        btn.className = 'mentor-filter-btn px-4 py-1.5 bg-teal-600 text-white rounded-full text-sm font-medium shadow-md hover:bg-teal-700 transition';
    }

    renderMentors(filter);
}

export function renderMentors(filter = 'all') {
    const container = document.getElementById('mentors-container');
    if (!container) return;

    const filtered = filter === 'all'
        ? state.mentorsData
        : state.mentorsData.filter(m => m.tags.includes(filter) || m.year === filter);

    if (filtered.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-10 text-slate-400">No mentors found for this filter.</div>`;
        return;
    }

    container.innerHTML = filtered.map(m => {
        const isCurrentUser = state.currentUserData && state.currentUserData.email === m.email;
        const override = state.mentorOverrides[m.email] || {};
        const displayQuote = override.quote || m.quote;
        const displayTags = override.tags || m.tags;
        const photoURL = override.photoURL || (isCurrentUser ? state.currentUserData.photoURL : null);
        const canEdit = (state.currentUserData && state.currentUserData.role === 'admin') || isCurrentUser;

        return `
        <article class="bg-white dark:bg-slate-800 rounded-2xl border border-teal-100 dark:border-slate-700 shadow-sm hover:shadow-md transition flex flex-col justify-between p-6 animate-[fadeIn_0.3s_ease-out] relative group">
            ${canEdit ? `
                <button onclick="window.openEditMentorModal('${escapeHTML(m.email)}')" class="absolute top-4 right-4 text-slate-400 hover:text-teal-500 transition opacity-0 group-hover:opacity-100">
                    <i class="fas fa-pencil-alt"></i>
                </button>
            ` : ''}

            <header class="flex items-center justify-between mb-4">
                <div class="flex items-center">
                    <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mr-3 overflow-hidden">
                        ${photoURL
                ? `<img src="${photoURL}" class="w-full h-full object-cover">`
                : `<i class="fas fa-user-nurse text-slate-400"></i>`
            }
                    </div>
                    <div>
                        <h3 class="font-semibold text-slate-800 dark:text-white">${escapeHTML(m.name)}</h3>
                        <p class="text-xs text-slate-500 dark:text-slate-400">${escapeHTML(m.year)}</p>
                    </div>
                </div>
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            </header>
            <p class="text-sm text-slate-600 dark:text-slate-300 italic mb-4">"${escapeHTML(displayQuote)}"</p>
            <div class="flex flex-wrap gap-2 mb-4">
                ${displayTags.map(tag => `<span class="px-2 py-1 text-xs rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">${tag}</span>`).join('')}
            </div>
            <button onclick="window.showMentorEmail('${escapeHTML(m.email)}', '${escapeHTML(m.name)}')" class="mt-auto w-full border border-teal-500 text-teal-700 dark:text-teal-400 rounded-full py-2 text-sm font-semibold hover:bg-teal-500 hover:text-white transition flex items-center justify-center gap-2">
                <i class="far fa-envelope"></i> Contact Mentor
            </button>
        </article>
    `;
    }).join('');
}

// ==========================================
// SESSIONS
// ==========================================

function getSessionStatus(session) {
    const now = new Date();
    const sessionDate = new Date(session.date);
    let sessionTime = session.time;
    let hours, minutes;

    if (sessionTime.includes(':')) {
        const timeParts = sessionTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (timeParts) {
            hours = parseInt(timeParts[1]);
            minutes = parseInt(timeParts[2]);
            const period = timeParts[3];
            if (period && period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
            if (period && period.toUpperCase() === 'AM' && hours === 12) hours = 0;
        }
    } else {
        hours = parseInt(sessionTime);
        minutes = 0;
    }

    sessionDate.setHours(hours || 0, minutes || 0, 0, 0);
    const sessionEnd = new Date(sessionDate.getTime() + (parseInt(session.duration) || 60) * 60000);

    if (now > sessionEnd) {
        return { status: 'past', label: 'Past', class: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400' };
    } else if (now >= sessionDate && now <= sessionEnd) {
        return { status: 'live', label: 'Live Now', class: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse' };
    } else {
        return { status: 'upcoming', label: 'Upcoming', class: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' };
    }
}

export function renderSessions() {
    const container = document.getElementById('sessions-container');
    if (!container) return;

    if (state.sessionsData.length === 0) {
        container.innerHTML = `<div class="p-8 text-center text-slate-400">No upcoming sessions scheduled.</div>`;
        return;
    }

    container.innerHTML = state.sessionsData.map(session => {
        const dateObj = new Date(session.date);
        const day = dateObj.getDate();
        const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
        const sessionStatus = getSessionStatus(session);
        const [hours, minutes] = session.time.split(':');
        const timeObj = new Date();
        timeObj.setHours(hours);
        timeObj.setMinutes(minutes);
        const formattedTime = timeObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

        let platformLogo = '';
        if (session.platform === 'Google Meet') {
            platformLogo = `<img src="assets/google-meet.svg" alt="Meet" class="w-5 h-5 mr-2 inline-block">`;
        } else if (session.platform === 'Zoom') {
            platformLogo = `<i class="fas fa-video mr-2 text-blue-500 text-lg"></i>`;
        } else if (session.platform === 'Microsoft Teams') {
            platformLogo = `<i class="fas fa-users-rectangle mr-2 text-indigo-500 text-lg"></i>`;
        } else {
            platformLogo = `<i class="fas fa-video mr-2 text-slate-400"></i>`;
        }

        let adminControls = state.currentUserRole === 'admin'
            ? `<div class="flex gap-1">
                <button onclick="window.openEditSessionModal('${session.id}')" class="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <button onclick="window.deleteSession('${session.id}')" class="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                    <i class="fas fa-trash-alt"></i>
                </button>
               </div>`
            : "";

        let actionButton = '';
        if (sessionStatus.status === 'past') {
            actionButton = `<span class="px-5 py-2 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg text-sm font-medium cursor-not-allowed">Ended</span>`;
        } else if (sessionStatus.status === 'live') {
            actionButton = `<a href="${session.link}" target="_blank" class="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition shadow-md animate-pulse flex items-center gap-2"><span class="w-2 h-2 bg-white rounded-full"></span>Join Live</a>`;
        } else {
            actionButton = `<a href="${session.link}" target="_blank" class="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold hover:opacity-90 transition shadow-md">Join</a>`;
        }

        return `
        <!-- Mobile Card -->
        <div class="md:hidden flex flex-col p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-4 relative overflow-hidden">
            ${sessionStatus.status === 'past' ? '<div class="absolute inset-0 bg-white/50 dark:bg-slate-900/50 z-10 pointer-events-none"></div>' : ''}
            <div class="flex justify-between items-start mb-4">
                <div class="flex items-center gap-3">
                    <div class="bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-bold rounded-xl p-2.5 w-14 text-center border border-slate-200 dark:border-slate-600">
                        <div class="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">${month}</div>
                        <div class="text-xl leading-none font-extrabold">${day}</div>
                    </div>
                    <div>
                        <div class="font-bold text-slate-800 dark:text-white">${formattedTime}</div>
                        <div class="text-xs text-slate-500 dark:text-slate-400">${session.duration}m duration</div>
                    </div>
                </div>
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${sessionStatus.class}">
                    ${sessionStatus.status === 'live' ? '<span class="w-1.5 h-1.5 bg-current rounded-full mr-1"></span>' : ''}${sessionStatus.label}
                </span>
            </div>
            <div class="mb-5">
                <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">${escapeHTML(session.title)}</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">${escapeHTML(session.desc)}</p>
                <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-800">${escapeHTML(session.tag)}</span>
            </div>
            <div class="space-y-4">
                <div class="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-user-circle text-slate-400 text-xl"></i>
                        <span class="font-medium">${escapeHTML(session.host)}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        ${platformLogo}
                        <span class="font-medium">${session.platform}</span>
                    </div>
                </div>
                <div class="flex gap-2">
                     <div class="flex-1">
                        ${actionButton.replace('class="', 'class="w-full text-center justify-center py-3 text-base ')}
                    </div>
                    ${state.currentUserRole === 'admin' ? `
                    <div class="flex gap-2">
                        <button onclick="window.openEditSessionModal('${session.id}')" class="w-12 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button onclick="window.deleteSession('${session.id}')" class="w-12 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>` : ''}
                </div>
            </div>
        </div>

        <!-- Desktop Row -->
        <div class="hidden md:grid md:grid-cols-12 gap-4 px-6 py-5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition items-center group ${sessionStatus.status === 'past' ? 'opacity-60' : ''} border-b border-slate-100 dark:border-slate-800 last:border-0">
            <div class="md:col-span-2 flex items-center gap-3">
                <div class="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl p-2 w-14 text-center border border-slate-200 dark:border-slate-600 relative">
                    <div class="text-[10px] uppercase tracking-wider">${month}</div>
                    <div class="text-xl leading-none">${day}</div>
                </div>
                <div class="text-sm text-slate-500 dark:text-slate-400">
                    ${formattedTime}<br><span class="text-xs opacity-70">${session.duration}m</span>
                </div>
            </div>
            <div class="md:col-span-4">
                <div class="flex items-center gap-2 mb-1">
                    <h4 class="font-bold text-slate-800 dark:text-white text-lg">${escapeHTML(session.title)}</h4>
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${sessionStatus.class}">
                        ${sessionStatus.status === 'live' ? '<span class="w-1.5 h-1.5 bg-current rounded-full mr-1"></span>' : ''}${sessionStatus.label}
                    </span>
                </div>
                <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">${escapeHTML(session.desc)}</p>
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-800">${escapeHTML(session.tag)}</span>
            </div>
            <div class="md:col-span-3 flex flex-col justify-center text-sm">
                <div class="flex items-center text-slate-700 dark:text-slate-300 mb-1"><i class="fas fa-user-circle mr-2 text-slate-400 text-xl"></i> ${escapeHTML(session.host)}</div>
                <div class="flex items-center text-slate-600 dark:text-slate-400">
                    ${platformLogo}
                    <span>${session.platform}</span>
                </div>
            </div>
            <div class="md:col-span-3 flex items-center justify-end gap-3">
                ${actionButton}
                ${adminControls}
            </div>
        </div>`;
    }).join('');

    updateSessionBadge();
}

function updateSessionBadge() {
    const badge = document.getElementById('mobile-sessions-badge');
    if (!badge) return;

    const upcomingCount = state.sessionsData.filter(session => {
        const status = getSessionStatus(session).status;
        return status === 'upcoming' || status === 'live';
    }).length;

    if (upcomingCount > 0) {
        badge.textContent = upcomingCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// ==========================================
// INBOX
// ==========================================

export function renderInbox() {
    const container = document.getElementById('inbox-container');
    if (!container) return;
    const activeMessages = state.peerMessages.filter(msg => msg.status === 'pending');

    if (activeMessages.length === 0) {
        container.innerHTML = `<div class="p-12 text-center text-slate-400 flex flex-col items-center"><i class="fas fa-inbox text-3xl mb-4"></i><p>No new requests.</p></div>`;
        return;
    }

    container.innerHTML = activeMessages.map(msg => `
        <div class="flex flex-col md:flex-row gap-4 p-5 border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
            <div class="flex items-start gap-3 md:w-1/3">
                <div class="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex-shrink-0 flex items-center justify-center font-bold text-sm">${msg.name.charAt(0).toUpperCase()}</div>
                <div><h4 class="font-bold text-slate-800 dark:text-white text-sm">${escapeHTML(msg.name)}</h4><p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${escapeHTML(msg.year)}</p></div>
            </div>
            <div class="md:w-1/4 flex items-center"><span class="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 text-xs px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-600">${escapeHTML(msg.topic)}</span></div>
            <div class="flex-1 flex justify-end items-center"><button onclick="window.acceptRequest('${msg.id}')" class="bg-teal-600 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-teal-700 transition">Accept</button></div>
        </div>`).join('');
}

// ==========================================
// DASHBOARD & USER UI
// ==========================================

export function updateDashboard() {
    const statTopics = document.getElementById('stat-topics');
    const statRequests = document.getElementById('stat-requests');
    const statRequestsSub = document.getElementById('stat-requests-sub');
    const statSessions = document.getElementById('stat-sessions');

    if (statTopics) statTopics.textContent = state.topicsData.length;
    if (statRequests) statRequests.textContent = state.peerMessages.length;
    if (statRequestsSub) statRequestsSub.textContent = state.peerMessages.filter(m => m.status === 'pending').length;
    if (statSessions) statSessions.textContent = state.sessionsData.length;
}

export function updateUIForRole(role) {
    const navAdmin = document.getElementById('nav-admin-link');
    const navPeer = document.getElementById('nav-peer-link');
    const mobAdmin = document.getElementById('mobile-admin-link');
    const mobPeer = document.getElementById('mobile-peer-link');
    const adminControls = document.getElementById('admin-controls-btn');
    const sessionControls = document.getElementById('admin-session-controls');
    const profileDropdown = document.getElementById('user-profile-dropdown');

    [navAdmin, navPeer, mobAdmin, mobPeer, adminControls, sessionControls].forEach(el => el && el.classList.add('hidden'));

    if (!role) {
        if (profileDropdown) profileDropdown.classList.add('hidden');
        return;
    }

    if (profileDropdown) profileDropdown.classList.remove('hidden');

    if (role === 'admin') {
        if (navAdmin) navAdmin.classList.remove('hidden');
        if (mobAdmin) mobAdmin.classList.remove('hidden');
        if (adminControls) adminControls.classList.remove('hidden');
        if (sessionControls) sessionControls.classList.remove('hidden');
        initAdminPickers();
        showNotification("Admin Access Granted", "success");
    } else if (role === 'peer') {
        if (navPeer) navPeer.classList.remove('hidden');
        if (mobPeer) mobPeer.classList.remove('hidden');
        renderInbox();
        showNotification("Peer Mentor Access Granted", "success");
    }

    if (state.currentUserData) {
        const mobileName = document.getElementById('mobile-menu-name');
        const mobileEmail = document.getElementById('mobile-menu-email');
        const mobileAvatar = document.getElementById('mobile-menu-avatar');

        if (mobileName) mobileName.textContent = state.currentUserData.name;
        if (mobileEmail) mobileEmail.textContent = state.currentUserData.email;

        if (mobileAvatar) {
            if (state.currentUserData.photoURL) {
                mobileAvatar.innerHTML = `<img src="${state.currentUserData.photoURL}" style="width: 100%; height: 100%; object-fit: cover;">`;
            } else {
                const initials = getInitials(state.currentUserData.name);
                mobileAvatar.innerHTML = `<span id="mobile-menu-initials">${initials}</span>`;
            }
        }
    }
}

export function updateUserProfileDropdown() {
    if (!state.currentUserData) return;

    const userAvatar = document.getElementById('user-avatar');
    const userDisplayName = document.getElementById('user-display-name');
    const dropdownName = document.getElementById('dropdown-user-name');
    const dropdownEmail = document.getElementById('dropdown-user-email');
    const dropdownRole = document.getElementById('dropdown-user-role');
    const dropdownAvatar = document.getElementById('dropdown-avatar');

    const initials = getInitials(state.currentUserData.name);

    if (userAvatar) {
        if (state.currentUserData.photoURL) {
            userAvatar.innerHTML = `<img src="${state.currentUserData.photoURL}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
            userAvatar.textContent = initials;
        }
    }

    if (dropdownAvatar) {
        if (state.currentUserData.photoURL) {
            dropdownAvatar.innerHTML = `<img src="${state.currentUserData.photoURL}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
            dropdownAvatar.innerHTML = `<span id="dropdown-avatar-initials">${initials}</span>`;
        }
    }

    if (userDisplayName) userDisplayName.textContent = state.currentUserData.name.split(' ')[0];
    if (dropdownName) dropdownName.textContent = state.currentUserData.name;
    if (dropdownEmail) dropdownEmail.textContent = state.currentUserData.email;

    if (dropdownRole) {
        const roleLabels = {
            admin: { label: 'Administrator', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
            peer: { label: 'Peer Mentor', class: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
            student: { label: 'Student', class: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
            guest: { label: 'Guest', class: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' }
        };
        const roleInfo = roleLabels[state.currentUserData.role] || roleLabels.student;
        dropdownRole.textContent = roleInfo.label;
        dropdownRole.className = `inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${roleInfo.class}`;
    }
}

export function updateAllAvatars(photoURL) {
    const initials = getInitials(state.currentUserData?.name || 'U');

    const navAvatar = document.getElementById('user-avatar');
    if (navAvatar) {
        if (photoURL) {
            navAvatar.innerHTML = `<img src="${photoURL}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
            navAvatar.innerHTML = initials;
        }
    }

    const dropdownAvatar = document.getElementById('dropdown-avatar');
    if (dropdownAvatar) {
        if (photoURL) {
            dropdownAvatar.innerHTML = `<img src="${photoURL}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
            dropdownAvatar.innerHTML = `<span id="dropdown-avatar-initials">${initials}</span>`;
        }
    }

    const mobileAvatar = document.getElementById('mobile-menu-avatar');
    if (mobileAvatar) {
        if (photoURL) {
            mobileAvatar.innerHTML = `<img src="${photoURL}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
            mobileAvatar.innerHTML = `<span id="mobile-menu-initials">${initials}</span>`;
        }
    }

    renderMentors();
}

function initAdminPickers() {
    const iconContainer = document.getElementById('icon-selector');
    if (iconContainer && iconContainer.innerHTML === "") {
        const availableIcons = ["fa-lightbulb", "fa-heart-pulse", "fa-brain", "fa-user-nurse", "fa-coffee", "fa-bed", "fa-stopwatch", "fa-users", "fa-book-open", "fa-hand-holding-heart"];
        availableIcons.forEach(icon => {
            const div = document.createElement('div');
            div.className = `icon-option ${icon === 'fa-lightbulb' ? 'selected' : ''}`;
            div.innerHTML = `<i class="fas ${icon}"></i>`;
            div.onclick = () => {
                document.querySelectorAll('.icon-option').forEach(el => el.classList.remove('selected'));
                div.classList.add('selected');
                document.getElementById('selected-icon').value = icon;
            };
            iconContainer.appendChild(div);
        });
        const colorContainer = document.getElementById('color-selector');
        availableColors.forEach(c => {
            const div = document.createElement('div');
            div.className = `color-option ${c.hex} ${c.name === 'teal' ? 'selected' : ''}`;
            div.onclick = () => {
                document.querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));
                div.classList.add('selected');
                document.getElementById('selected-color').value = c.name;
            };
            colorContainer.appendChild(div);
        });
    }
}

// ==========================================
// MODALS & FORMS
// ==========================================

export function openSuggestTopicModal() {
    const overlay = document.createElement('div');
    overlay.id = 'suggest-topic-modal';
    overlay.className = 'fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]';

    // Theme-aware colors
    const isDark = document.documentElement.classList.contains('dark');
    const bg = isDark ? '#1e293b' : '#ffffff';
    const text = isDark ? '#f1f5f9' : '#1e293b';
    const border = isDark ? '#334155' : '#e2e8f0';

    overlay.innerHTML = `
        <div style="background: ${bg}; border-radius: 1rem; max-width: 28rem; width: 100%; position: relative; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden;">
            <div style="background: linear-gradient(135deg, #0d9488 0%, #115e59 100%); padding: 1.5rem; text-align: center;">
                <div style="width: 3rem; height: 3rem; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: white; font-size: 1.25rem;">
                    <i class="fas fa-lightbulb"></i>
                </div>
                <h3 style="color: white; font-weight: bold; font-size: 1.25rem; margin-bottom: 0.25rem;">Suggest a Topic</h3>
                <p style="color: rgba(255,255,255,0.8); font-size: 0.875rem;">Help us improve the learning hub.</p>
                <button onclick="window.closeSuggestTopicModal()" style="position: absolute; top: 1rem; right: 1rem; color: rgba(255,255,255,0.6); background: none; border: none; cursor: pointer; font-size: 1.25rem;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div style="padding: 1.5rem;">
                <form onsubmit="window.submitSuggestTopic(event)">
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; font-size: 0.875rem; font-weight: 500; color: ${text}; margin-bottom: 0.5rem;">Topic Title</label>
                        <input type="text" id="suggest-title" required placeholder="e.g. Pediatric Nursing" 
                            style="width: 100%; padding: 0.75rem; border-radius: 0.75rem; border: 1px solid ${border}; background: ${isDark ? '#0f172a' : '#f8fafc'}; color: ${text}; outline: none;">
                    </div>
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; font-size: 0.875rem; font-weight: 500; color: ${text}; margin-bottom: 0.5rem;">Why is this important?</label>
                        <textarea id="suggest-reason" rows="3" required placeholder="Briefly explain..." 
                            style="width: 100%; padding: 0.75rem; border-radius: 0.75rem; border: 1px solid ${border}; background: ${isDark ? '#0f172a' : '#f8fafc'}; color: ${text}; outline: none; resize: none;"></textarea>
                    </div>
                    <button type="submit" style="width: 100%; background: #0d9488; color: white; font-weight: bold; padding: 0.75rem; border-radius: 0.75rem; border: none; cursor: pointer; transition: background 0.2s;">
                        Submit Suggestion
                    </button>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

export function closeSuggestTopicModal() {
    document.getElementById('suggest-topic-modal')?.remove();
}

export async function submitSuggestTopic(e) {
    e.preventDefault();
    const title = document.getElementById('suggest-title').value;
    const reason = document.getElementById('suggest-reason').value;

    try {
        await Repo.addTopicSuggestion({
            title,
            reason,
            userEmail: state.currentUserData ? state.currentUserData.email : 'anonymous'
        });

        const container = document.querySelector('#suggest-topic-modal > div');
        container.innerHTML = `
            <div style="padding: 3rem 1.5rem; text-align: center;">
                <div style="width: 4rem; height: 4rem; background: #dcfce7; color: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 2rem;">
                    <i class="fas fa-check"></i>
                </div>
                <h3 style="color: #16a34a; font-weight: bold; font-size: 1.5rem; margin-bottom: 0.5rem;">Thank You!</h3>
                <p style="color: #64748b; margin-bottom: 1.5rem;">Your suggestion has been sent to the admins.</p>
                <button onclick="window.closeSuggestTopicModal()" style="background: #f1f5f9; color: #475569; font-weight: 600; padding: 0.75rem 2rem; border-radius: 0.75rem; border: none; cursor: pointer;">
                    Close
                </button>
            </div>
        `;
    } catch (error) {
        console.error("Error submitting suggestion:", error);
        alert("Failed to submit suggestion.");
    }
}

export function showDynamicModal(title, content) {
    const overlay = document.createElement('div');
    overlay.id = 'dynamic-modal';
    overlay.className = 'fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]';

    const isDark = document.documentElement.classList.contains('dark');
    const bg = isDark ? '#1e293b' : '#ffffff';
    const text = isDark ? '#f1f5f9' : '#1e293b';

    overlay.innerHTML = `
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-[popIn_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)]">
            <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <h3 class="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <span class="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center text-sm"><i class="fas fa-book-open"></i></span>
                    ${escapeHTML(title)}
                </h3>
                <button onclick="window.closeDynamicModal()" class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 transition">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="p-8 overflow-y-auto custom-scrollbar prose dark:prose-invert max-w-none">
                ${content}
            </div>
            <div class="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                <button onclick="window.closeDynamicModal()" class="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

export function closeDynamicModal() {
    document.getElementById('dynamic-modal')?.remove();
}

export function openTopicModal(id) {
    const topic = state.topicsData.find(t => String(t.id) === String(id));
    if (!topic) return;

    const availableColors = [
        { name: "teal", hex: "bg-teal-500", light: "bg-teal-100", text: "text-teal-600" },
        { name: "blue", hex: "bg-blue-500", light: "bg-blue-100", text: "text-blue-600" },
        { name: "indigo", hex: "bg-indigo-500", light: "bg-indigo-100", text: "text-indigo-600" },
        { name: "purple", hex: "bg-purple-500", light: "bg-purple-100", text: "text-purple-600" },
        { name: "rose", hex: "bg-rose-500", light: "bg-rose-100", text: "text-rose-600" },
        { name: "amber", hex: "bg-amber-500", light: "bg-amber-100", text: "text-amber-600" }
    ];
    const theme = availableColors.find(c => c.name === topic.color) || availableColors[0];

    const contentData = topic.content || {};
    let bulletsHTML = '';
    if (contentData.bullets && contentData.bullets.length > 0) {
        bulletsHTML = `
            <div class="mb-6">
                <h4 class="font-bold text-lg mb-2 text-slate-800 dark:text-white">Key Signs & Strategies</h4>
                <ul class="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
                    ${contentData.bullets.map(b => `<li>${escapeHTML(b)}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    const htmlContent = `
        <div class="space-y-6">
            <p class="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">${escapeHTML(contentData.intro || topic.desc)}</p>
            ${bulletsHTML}
            <div class="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-xl border border-teal-100 dark:border-teal-800">
                <h4 class="font-bold text-teal-800 dark:text-teal-300 mb-1">Action Step</h4>
                <p class="text-teal-700 dark:text-teal-400">${escapeHTML(contentData.action || "Contact a peer mentor for support.")}</p>
            </div>
        </div>
    `;

    showDynamicModal(topic.title, htmlContent);
}

// --- PROFILE PICTURE ---

let profileCropState = null;

export function openProfilePictureModal() {
    const overlay = document.createElement('div');
    overlay.id = 'profile-picture-modal';
    overlay.className = 'fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]';

    const isDark = document.documentElement.classList.contains('dark');
    const colors = {
        bg: isDark ? '#1e293b' : '#ffffff',
        text: isDark ? '#f1f5f9' : '#1e293b',
        textMuted: isDark ? '#94a3b8' : '#64748b',
        border: isDark ? '#334155' : '#e2e8f0',
        primary: '#0d9488'
    };

    overlay.innerHTML = `
        <div style="background: ${colors.bg}; border-radius: 1.5rem; max-width: 28rem; width: 100%; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
            <div style="padding: 1.5rem; border-bottom: 1px solid ${colors.border}; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="font-weight: bold; font-size: 1.25rem; color: ${colors.text};">Update Profile Photo</h3>
                <button onclick="window.closeProfilePictureModal()" style="color: ${colors.textMuted}; background: none; border: none; cursor: pointer; font-size: 1.25rem;"><i class="fas fa-times"></i></button>
            </div>
            
            <!-- Step 1: Upload -->
            <div id="profile-upload-step" style="padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 1.5rem;">
                <div style="width: 8rem; height: 8rem; border-radius: 50%; background: ${isDark ? '#334155' : '#f1f5f9'}; display: flex; align-items: center; justify-content: center; font-size: 3rem; color: ${colors.textMuted}; border: 2px dashed ${colors.border};">
                    <i class="fas fa-camera"></i>
                </div>
                <div style="text-align: center;">
                    <p style="color: ${colors.text}; font-weight: 500; margin-bottom: 0.5rem;">Upload a new photo</p>
                    <p style="color: ${colors.textMuted}; font-size: 0.875rem;">JPG or PNG, max 5MB</p>
                </div>
                <label style="background: ${colors.primary}; color: white; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 600; cursor: pointer; transition: transform 0.1s;">
                    Choose File
                    <input type="file" id="profile-file-input" accept="image/*" style="display: none;" onchange="window.handleProfileImageSelect(event)">
                </label>
                ${state.currentUserData?.photoURL ? `
                    <button onclick="window.removeProfilePicture()" style="color: #ef4444; font-size: 0.875rem; font-weight: 500; background: none; border: none; cursor: pointer; padding: 0.5rem;">
                        Remove Current Photo
                    </button>
                ` : ''}
            </div>

            <!-- Step 2: Crop (Hidden initially) -->
            <div id="profile-crop-step" style="display: none; flex-direction: column; height: 500px;">
                <div style="flex: 1; position: relative; background: #000; overflow: hidden; cursor: grab;" id="crop-container">
                    <img id="profile-crop-image" style="position: absolute; transform-origin: top left; pointer-events: none; user-select: none;">
                    <div style="position: absolute; inset: 0; pointer-events: none;">
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80%; padding-bottom: 80%; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 9999px rgba(0,0,0,0.5);"></div>
                    </div>
                </div>
                <div style="padding: 1.5rem; background: ${colors.bg}; border-top: 1px solid ${colors.border}; display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                    <button onclick="window.cancelProfileCrop()" style="padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 600; color: ${colors.textMuted}; background: transparent; border: 1px solid ${colors.border}; cursor: pointer;">Cancel</button>
                    <button onclick="window.saveProfilePicture()" style="padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 600; color: white; background: ${colors.primary}; border: none; cursor: pointer; flex: 1;">Save Photo</button>
                </div>
                <div style="padding: 0 1.5rem 1.5rem; background: ${colors.bg};">
                    <input type="range" id="profile-zoom-slider" min="1" max="3" step="0.01" value="1" style="width: 100%;">
                </div>
            </div>
            
            <!-- Saving Overlay -->
            <div id="profile-saving-overlay" style="display: none; position: absolute; inset: 0; background: rgba(255,255,255,0.9); align-items: center; justify-content: center; flex-direction: column; gap: 1rem; z-index: 50;">
                <div style="width: 3rem; height: 3rem; border: 3px solid ${colors.border}; border-top-color: ${colors.primary}; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="color: ${colors.text}; font-weight: 600;">Updating Profile...</p>
            </div>
            <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
        </div>
    `;
    document.body.appendChild(overlay);
}

export function closeProfilePictureModal() {
    profileCropState = null;
    document.getElementById('profile-picture-modal')?.remove();
}

export function handleProfileImageSelect(event) {
    const file = event.target.files[0];
    if (file) handleProfileImageFile(file);
}

export function handleProfileImageFile(file) {
    if (!file.type.startsWith('image/')) {
        showNotification('Please select an image file', 'error');
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Image must be less than 5MB', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('profile-upload-step').style.display = 'none';
        document.getElementById('profile-crop-step').style.display = 'flex';

        const cropImage = document.getElementById('profile-crop-image');
        const container = document.getElementById('crop-container');

        // Prevent default touch actions on container to stop scrolling
        container.style.touchAction = 'none';

        cropImage.onload = () => {
            // Use setTimeout to ensure the DOM has updated and container has width
            setTimeout(() => {
                const containerRect = container.getBoundingClientRect();

                // Safety check: if width is 0, try again shortly
                if (containerRect.width === 0) {
                    setTimeout(cropImage.onload, 50);
                    return;
                }

                const circleDiameter = containerRect.width * 0.8;

                // Calculate scale to cover the circle area
                const scaleWidth = circleDiameter / cropImage.naturalWidth;
                const scaleHeight = circleDiameter / cropImage.naturalHeight;
                const minScale = Math.max(scaleWidth, scaleHeight);

                // Initial scale (slightly larger than min to allow some movement)
                const scale = minScale * 1.1;

                // Center the image initially
                const scaledWidth = cropImage.naturalWidth * scale;
                const scaledHeight = cropImage.naturalHeight * scale;
                const x = (containerRect.width - scaledWidth) / 2;
                const y = (containerRect.height - scaledHeight) / 2;

                profileCropState = {
                    scale: scale,
                    minScale: minScale,
                    maxScale: minScale * 4,
                    x: x,
                    y: y,
                    isDragging: false,
                    startX: 0, startY: 0,
                    imgWidth: cropImage.naturalWidth,
                    imgHeight: cropImage.naturalHeight,
                    containerWidth: containerRect.width,
                    containerHeight: containerRect.height
                };

                updateCropImageTransform();

                // Mouse events
                container.onmousedown = startDrag;
                document.onmousemove = drag;
                document.onmouseup = endDrag;

                // Touch events
                container.ontouchstart = startDrag;
                document.ontouchmove = drag;
                document.ontouchend = endDrag;

                const slider = document.getElementById('profile-zoom-slider');
                if (slider) {
                    slider.value = 1.1; // Match initial scale multiplier
                    slider.min = 1;
                    slider.max = 4;
                    slider.oninput = (e) => adjustProfileZoom(e.target.value);
                }
            }, 50); // Small delay to allow layout reflow
        };
        cropImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function updateCropImageTransform() {
    if (!profileCropState) return;
    const img = document.getElementById('profile-crop-image');
    if (img) {
        img.style.transform = `translate(${profileCropState.x}px, ${profileCropState.y}px) scale(${profileCropState.scale})`;
    }
}

function startDrag(e) {
    if (!profileCropState) return;
    // Don't prevent default here to allow other interactions if needed, 
    // but usually for drag we want to.
    if (e.type === 'touchstart') {
        // e.preventDefault(); // Prevent scrolling
    }

    profileCropState.isDragging = true;
    const point = e.touches ? e.touches[0] : e;
    profileCropState.startX = point.clientX - profileCropState.x;
    profileCropState.startY = point.clientY - profileCropState.y;
}

function drag(e) {
    if (!profileCropState || !profileCropState.isDragging) return;
    e.preventDefault(); // Prevent scrolling while dragging
    const point = e.touches ? e.touches[0] : e;
    profileCropState.x = point.clientX - profileCropState.startX;
    profileCropState.y = point.clientY - profileCropState.startY;
    updateCropImageTransform();
}

function endDrag() {
    if (!profileCropState) return;
    profileCropState.isDragging = false;
}

function adjustProfileZoom(value) {
    if (!profileCropState) return;

    const oldScale = profileCropState.scale;
    const newScale = profileCropState.minScale * parseFloat(value);

    // Calculate center of container
    const cx = profileCropState.containerWidth / 2;
    const cy = profileCropState.containerHeight / 2;

    // Adjust x and y to zoom relative to center
    // New position = Center - (Center - OldPosition) * (NewScale / OldScale)
    profileCropState.x = cx - (cx - profileCropState.x) * (newScale / oldScale);
    profileCropState.y = cy - (cy - profileCropState.y) * (newScale / oldScale);

    profileCropState.scale = newScale;
    updateCropImageTransform();
}

export function cancelProfileCrop() {
    profileCropState = null;
    document.getElementById('profile-crop-step').style.display = 'none';
    document.getElementById('profile-upload-step').style.display = 'flex';
    document.getElementById('profile-file-input').value = '';
}

export async function saveProfilePicture() {
    if (!profileCropState) return;
    const savingOverlay = document.getElementById('profile-saving-overlay');
    savingOverlay.style.display = 'flex';

    try {
        const img = document.getElementById('profile-crop-image');
        const container = document.getElementById('crop-container');
        const containerRect = container.getBoundingClientRect();

        const outputSize = 256;
        const canvas = document.createElement('canvas');
        canvas.width = outputSize;
        canvas.height = outputSize;
        const ctx = canvas.getContext('2d');

        // Calculate the crop circle's position and size relative to the container
        const circleDiameter = containerRect.width * 0.8;
        const cropX = (containerRect.width - circleDiameter) / 2;
        const cropY = (containerRect.height - circleDiameter) / 2;

        // Calculate the source coordinates on the image
        // srcX = (CropBoxLeft - ImageLeft) / Scale
        const srcX = (cropX - profileCropState.x) / profileCropState.scale;
        const srcY = (cropY - profileCropState.y) / profileCropState.scale;
        const srcSize = circleDiameter / profileCropState.scale;

        ctx.beginPath();
        ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, outputSize, outputSize);

        canvas.toBlob(async (blob) => {
            const user = auth.currentUser;
            if (!user) return;

            const photoURL = await Repo.uploadProfilePicture(user.uid, blob);
            await Repo.updateUserProfile(user.uid, { photoURL });

            const isMentor = state.mentorsData.some(m => m.email === user.email);
            if (isMentor) {
                await Repo.updateMentorProfile(user.email, { photoURL });
            }

            if (state.currentUserData) state.currentUserData.photoURL = photoURL;
            updateAllAvatars(photoURL);
            showNotification('Profile picture updated!', 'success');
            closeProfilePictureModal();
            savingOverlay.style.display = 'none';
        }, 'image/jpeg', 0.9);

    } catch (error) {
        console.error('Error saving profile picture:', error);
        showNotification('Failed to save photo.', 'error');
        savingOverlay.style.display = 'none';
    }
}

export async function removeProfilePicture() {
    if (!confirm('Remove profile picture?')) return;
    try {
        const user = auth.currentUser;
        if (user) await Repo.deleteProfilePicture(user.uid);
        if (state.currentUserData) state.currentUserData.photoURL = null;
        updateAllAvatars(null);
        showNotification('Profile picture removed', 'success');
        closeProfilePictureModal();
    } catch (error) {
        console.error(error);
        showNotification('Failed to remove photo.', 'error');
    }
}

// --- MENTOR MODALS ---

export function openEditMentorModal(email) {
    const mentor = state.mentorsData.find(m => m.email === email);
    if (!mentor) return;
    const override = state.mentorOverrides[email] || {};
    const currentQuote = override.quote || mentor.quote;
    const currentTags = (override.tags || mentor.tags).join(', ');

    const overlay = document.createElement('div');
    overlay.id = 'edit-mentor-modal';
    overlay.className = 'fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]';

    const isDark = document.documentElement.classList.contains('dark');
    const bg = isDark ? '#1e293b' : '#ffffff';
    const text = isDark ? '#f1f5f9' : '#1e293b';

    overlay.innerHTML = `
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-[popIn_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)]">
            <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h3 class="text-xl font-bold text-slate-800 dark:text-white">Edit Mentor Profile</h3>
                <button onclick="document.getElementById('edit-mentor-modal').remove()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"><i class="fas fa-times text-xl"></i></button>
            </div>
            <div class="p-6 space-y-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message (Quote)</label>
                    <textarea id="edit-mentor-quote" rows="3" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition resize-none">${escapeHTML(currentQuote)}</textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tags (comma separated)</label>
                    <input type="text" id="edit-mentor-tags" value="${escapeHTML(currentTags)}" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition">
                </div>
            </div>
            <div class="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                <button onclick="document.getElementById('edit-mentor-modal').remove()" class="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition">Cancel</button>
                <button onclick="window.saveMentorDetails('${escapeHTML(email)}')" class="px-6 py-2 rounded-xl bg-teal-500 text-white font-bold hover:bg-teal-600 shadow-lg shadow-teal-500/30 transition transform hover:scale-105">Save Changes</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

export async function saveMentorDetails(email) {
    const quote = document.getElementById('edit-mentor-quote').value.trim();
    const tags = document.getElementById('edit-mentor-tags').value.split(',').map(t => t.trim()).filter(t => t.length > 0);

    if (!state.mentorOverrides[email]) state.mentorOverrides[email] = {};
    state.mentorOverrides[email].quote = quote;
    state.mentorOverrides[email].tags = tags;

    renderMentors();
    document.getElementById('edit-mentor-modal').remove();
    showNotification('Profile updated successfully!', 'success');

    try {
        await Repo.updateMentorProfile(email, { quote, tags });
    } catch (error) {
        console.error("Error saving mentor profile:", error);
        showNotification('Failed to save changes.', 'error');
    }
}

export function showMentorEmail(email, name) {
    const overlay = document.createElement('div');
    overlay.id = 'dynamic-mentor-modal';
    overlay.className = 'fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4';
    overlay.onclick = (e) => { if (e.target === overlay) closeMentorEmailModal(); };

    const isDark = document.documentElement.classList.contains('dark');
    const bg = isDark ? '#1e293b' : '#ffffff';
    const text = isDark ? '#f1f5f9' : '#1e293b';

    overlay.innerHTML = `
        <div style="background: ${bg}; border-radius: 1rem; max-width: 24rem; width: 100%; padding: 2rem; text-align: center; position: relative;">
            <button onclick="window.closeMentorEmailModal()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; cursor: pointer; color: ${text};"><i class="fas fa-times"></i></button>
            <div style="width: 4rem; height: 4rem; border-radius: 50%; background: rgba(20, 184, 166, 0.2); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: #14b8a6; font-size: 1.5rem;"><i class="fas fa-envelope"></i></div>
            <h2 style="font-size: 1.5rem; font-weight: bold; color: ${text}; margin-bottom: 0.5rem;">Contact ${escapeHTML(name.split(' ')[0])}</h2>
            <p style="color: #64748b; font-size: 0.875rem; margin-bottom: 1.5rem;">Copy the email address below.</p>
            <p style="font-family: monospace; font-weight: 600; color: ${text}; background: ${isDark ? '#334155' : '#f1f5f9'}; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 1rem; user-select: all;">${escapeHTML(email)}</p>
            <button onclick="window.copyMentorEmailDynamic('${escapeHTML(email)}')" id="copy-mentor-btn" style="width: 100%; background: #14b8a6; color: white; padding: 0.75rem; border-radius: 0.75rem; font-weight: bold; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                <i class="fas fa-copy"></i> Copy Email
            </button>
        </div>
    `;
    document.body.appendChild(overlay);
}

export function closeMentorEmailModal() {
    document.getElementById('dynamic-mentor-modal')?.remove();
}

export function copyMentorEmailDynamic(email) {
    navigator.clipboard.writeText(email).then(() => {
        const btn = document.getElementById('copy-mentor-btn');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => btn.innerHTML = '<i class="fas fa-copy"></i> Copy Email', 2000);
        }
    });
}

// --- SESSION MODALS ---

export function openEditSessionModal(id) {
    const session = state.sessionsData.find(s => s.id === id);
    if (!session) return;

    document.getElementById('new-session-id').value = session.id;
    document.getElementById('new-session-title').value = session.title;
    document.getElementById('new-session-host').value = session.host;
    document.getElementById('new-session-date').value = session.date;
    document.getElementById('new-session-time').value = session.time;
    document.getElementById('new-session-duration').value = session.duration;
    document.getElementById('new-session-platform').value = session.platform;
    document.getElementById('new-session-tag').value = session.tag;
    document.getElementById('new-session-link').value = session.link;
    document.getElementById('new-session-desc').value = session.desc;

    document.getElementById('session-modal-title').textContent = 'Edit Session';
    document.getElementById('session-modal-submit').textContent = 'Update Session';
    document.getElementById('admin-add-session').classList.remove('hidden');
}

export function resetSessionModal() {
    document.getElementById('new-session-id').value = '';
    document.querySelector('#admin-add-session form').reset();
    document.getElementById('session-modal-title').textContent = 'Schedule New Session';
    document.getElementById('session-modal-submit').textContent = 'Schedule Session';
    document.getElementById('admin-add-session').classList.remove('hidden');
}

export async function handleAddSession(e) {
    e.preventDefault();
    const sessionId = document.getElementById('new-session-id').value;
    const sessionData = {
        title: document.getElementById('new-session-title').value,
        host: document.getElementById('new-session-host').value,
        date: document.getElementById('new-session-date').value,
        time: document.getElementById('new-session-time').value,
        duration: document.getElementById('new-session-duration').value,
        platform: document.getElementById('new-session-platform').value,
        tag: document.getElementById('new-session-tag').value,
        link: document.getElementById('new-session-link').value,
        desc: document.getElementById('new-session-desc').value,
    };

    try {
        if (sessionId) {
            await Repo.updateSession(sessionId, sessionData);
            showNotification("Session Updated!", "success");
        } else {
            await Repo.addSession(sessionData);
            showNotification("Session Scheduled!", "success");
        }
        e.target.reset();
        document.getElementById('new-session-id').value = '';
        document.getElementById('admin-add-session').classList.add('hidden');
    } catch (error) {
        console.error("Error saving session: ", error);
        alert("Failed to save session.");
    }
}

// ==========================================
// BREATHING WIDGET
// ==========================================

let isBreathing = false;
let breathingTimeouts = [];

export function toggleBreathing() {
    const btn = document.getElementById('breath-btn');
    const widget = document.getElementById('breathing-widget');
    const text = document.getElementById('breath-text');
    const instruction = document.getElementById('breath-instruction');

    if (!isBreathing) {
        isBreathing = true;
        btn.textContent = "Stop Exercise";
        btn.classList.replace('bg-teal-600', 'bg-red-500');
        btn.classList.replace('hover:bg-teal-700', 'hover:bg-red-600');
        runBreathingCycle(widget, text, instruction);
    } else {
        isBreathing = false;
        breathingTimeouts.forEach(clearTimeout);
        breathingTimeouts = [];
        btn.textContent = "Start Exercise";
        btn.classList.replace('bg-red-500', 'bg-teal-600');
        btn.classList.replace('hover:bg-red-600', 'hover:bg-teal-700');
        widget.className = 'breathing-widget';
        text.textContent = "Ready?";
        instruction.textContent = "Tap Start";
        void widget.offsetWidth;
    }
}

function runBreathingCycle(widget, text, instruction) {
    if (!isBreathing) return;
    widget.className = 'breathing-widget inhaling';
    text.textContent = "Inhale...";
    instruction.textContent = "Breathe in slowly through nose (4s)";

    breathingTimeouts.push(setTimeout(() => {
        if (!isBreathing) return;
        widget.className = 'breathing-widget holding';
        text.textContent = "Hold...";
        instruction.textContent = "Keep lungs full (7s)";

        breathingTimeouts.push(setTimeout(() => {
            if (!isBreathing) return;
            widget.className = 'breathing-widget exhaling';
            text.textContent = "Exhale...";
            instruction.textContent = "Release slowly through mouth (8s)";

            breathingTimeouts.push(setTimeout(() => {
                if (!isBreathing) return;
                widget.className = 'breathing-widget resting';
                text.textContent = "Rest...";
                instruction.textContent = "Relax for a moment (3s)";
                breathingTimeouts.push(setTimeout(() => {
                    if (isBreathing) runBreathingCycle(widget, text, instruction);
                }, 3000));
            }, 8000));
        }, 7000));
    }, 4000));
}

// ==========================================
// AUTH UI
// ==========================================

let currentAuthMode = 'LOGIN';

export function setAuthMode(mode) {
    currentAuthMode = mode;

    const title = document.getElementById('auth-title');
    const desc = document.getElementById('auth-desc');
    const btn = document.getElementById('auth-submit-btn');
    const toggleText = document.getElementById('auth-switch-text');
    const toggleBtn = document.getElementById('auth-switch-btn');
    const nameField = document.getElementById('name-field-container');
    const passField = document.getElementById('password-field-container');
    const forgotBtn = document.getElementById('auth-forgot-btn');
    const guestBtn = document.getElementById('auth-guest-btn');

    nameField.classList.add('hidden');
    passField.classList.remove('hidden');
    forgotBtn.classList.remove('hidden');
    guestBtn.classList.remove('hidden');

    if (mode === 'SIGNUP') {
        title.textContent = "Create Account";
        desc.textContent = "Join the PeerCircle community.";
        btn.textContent = "Sign Up";
        toggleText.textContent = "Already have an account?";
        toggleBtn.textContent = "Sign In";
        toggleBtn.onclick = () => setAuthMode('LOGIN');
        nameField.classList.remove('hidden');
    } else if (mode === 'LOGIN') {
        title.textContent = "Welcome Back";
        desc.textContent = "Sign in to access resources.";
        btn.textContent = "Sign In";
        toggleText.textContent = "New here?";
        toggleBtn.textContent = "Create Account";
        toggleBtn.onclick = () => setAuthMode('SIGNUP');
    } else if (mode === 'RESET') {
        title.textContent = "Reset Password";
        desc.textContent = "Enter your email to receive a reset link.";
        btn.textContent = "Send Reset Link";
        passField.classList.add('hidden');
        forgotBtn.classList.add('hidden');
        guestBtn.classList.add('hidden');
        toggleText.textContent = "Remembered your password?";
        toggleBtn.textContent = "Back to Login";
        toggleBtn.onclick = () => setAuthMode('LOGIN');
    }
}

export function toggleAuthMode() {
    if (currentAuthMode === 'LOGIN') setAuthMode('SIGNUP');
    else setAuthMode('LOGIN');
}

export async function handleAuth(e) {
    e.preventDefault();
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const name = document.getElementById('auth-name').value;
    const btn = document.getElementById('auth-submit-btn');

    if (!email.endsWith('@rakmhsu.ac.ae')) {
        alert("Access Restricted: Please use your university email (@rakmhsu.ac.ae).");
        return;
    }

    btn.disabled = true;
    btn.textContent = "Processing...";

    try {
        if (currentAuthMode === 'SIGNUP') {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            await Repo.createUserProfile(user.uid, { name, email });
            await user.sendEmailVerification();
            alert("Account created! Please verify your email.");
            await auth.signOut();
            setAuthMode('LOGIN');
        } else if (currentAuthMode === 'LOGIN') {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            if (!user.emailVerified) {
                alert("Please verify your email address to log in.");
                await auth.signOut();
                btn.disabled = false;
                btn.textContent = "Sign In";
                return;
            }
        } else if (currentAuthMode === 'RESET') {
            await auth.sendPasswordResetEmail(email);
            alert("Password reset email sent!");
            setAuthMode('LOGIN');
        }
    } catch (error) {
        console.error(error);
        alert(error.message);
        btn.disabled = false;
        if (currentAuthMode === 'SIGNUP') btn.textContent = "Sign Up";
        else if (currentAuthMode === 'LOGIN') btn.textContent = "Sign In";
        else btn.textContent = "Send Reset Link";
    }
}

export function loginAsGuest() {
    console.log("Logging in as Guest (Dev Mode)");
    // We can't easily fake auth.currentUser, but we can fake the UI state.
    // However, repo functions rely on auth.currentUser.
    // Guest mode in script.js just set global vars.
    // Here we can try to set state.
    // But Repo functions might fail if they check auth.currentUser.
    // For now, we'll just update UI.

    // Ideally we should use anonymous auth: auth.signInAnonymously()
    // But the original script just mocked it.
    // We'll stick to mocking UI for now.

    document.getElementById('login-modal').classList.add('hidden');
    document.getElementById('loading-screen')?.classList.add('hidden');

    // We need to export a way to set guest mode in state?
    // state.currentUserData is read-only from outside (via setters).
    // We need to import setters in UI.js? No, UI.js imports state.
    // We should probably move loginAsGuest to main.js where we have access to state setters.
    // But we are here.
    // I'll leave a TODO or just do UI updates.
    // Actually, main.js imports setters. UI.js does not.
    // I'll move loginAsGuest to main.js.
    // I'll just export handleAuth and setAuthMode here.
}

export function toggleProfileDropdown() {
    const menu = document.getElementById('profile-dropdown-menu');
    if (menu) menu.classList.toggle('hidden');
}

// Close dropdown listener
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('user-profile-dropdown');
    const menu = document.getElementById('profile-dropdown-menu');
    if (dropdown && menu && !dropdown.contains(e.target)) {
        menu.classList.add('hidden');
    }
});

// ==========================================
// STUDENT REQUESTS
// ==========================================

export async function handleBooking(e) {
    e.preventDefault();

    const name = document.getElementById('chat-name').value;
    const email = document.getElementById('chat-email') ? document.getElementById('chat-email').value : "no-email@test.com";
    const year = document.getElementById('chat-year').value;
    const topic = document.getElementById('chat-topic').value;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (document.getElementById('chat-email') && !emailRegex.test(email)) {
        alert("Please enter a valid student email address.");
        return;
    }

    try {
        await Repo.sendRequest({
            name, year, topic, email,
            time: "Anytime"
        });

        document.getElementById('chat-form-container').classList.add('hidden');
        const successDiv = document.getElementById('chat-success-container');
        successDiv.classList.remove('hidden');
        successDiv.classList.add('flex');

        showNotification("Request Sent Successfully", "success");
    } catch (error) {
        console.error("Error sending request:", error);
        alert("Failed to send request. Please try again.");
    }
}

export function resetChatForm() {
    document.getElementById('chat-success-container').classList.add('hidden');
    document.getElementById('chat-success-container').classList.remove('flex');
    document.getElementById('chat-form-container').classList.remove('hidden');
    document.querySelector('#chat-form-container form').reset();
}

export async function acceptRequest(id) {
    try {
        const user = auth.currentUser;
        if (!user) return;

        await Repo.acceptRequest(id, user.uid);
        showNotification("Request Accepted!", "success");
    } catch (error) {
        console.error("Error accepting request:", error);
        alert("Failed to accept request.");
    }
}

