// ==========================================
// 1. CONFIG & THEME
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    renderTopics();
    renderMentors(); // Load mentors
    
    const savedRole = localStorage.getItem('dps_user_role');
    if (savedRole) {
        loginAs(savedRole, true);
    } else {
        document.getElementById('login-modal').classList.remove('hidden');
    }
});

function initTheme() {
    const themeIcon = document.getElementById('theme-icon');
    if(!themeIcon) return;
    if (localStorage.getItem('dps_theme') === 'dark' || (!('dps_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    } else {
        document.documentElement.classList.remove('dark');
        themeIcon.classList.replace('fa-sun', 'fa-moon');
    }
}

function toggleTheme() {
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

// ==========================================
// 2. NAVIGATION
// ==========================================

function showSection(sectionId) {
    if(window.location.hash.substring(1) !== sectionId) {
        window.location.hash = sectionId;
    }
    renderSection(sectionId);
}

function renderSection(sectionId) {
    document.querySelectorAll('.section-content').forEach(el => {
        el.classList.remove('active');
        el.classList.add('hidden');
    });
    const targetId = document.getElementById(sectionId) ? sectionId : 'home';
    const target = document.getElementById(targetId);
    if(target) {
        target.classList.add('active');
        target.classList.remove('hidden');
    }
    window.scrollTo(0, 0);
    updateNavState(targetId);
}

function updateNavState(activeId) {
    document.querySelectorAll('.nav-link').forEach(btn => {
        const onClickText = btn.getAttribute('onclick');
        if(onClickText && onClickText.includes(activeId)) {
            btn.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-teal-600', 'dark:text-teal-400');
            btn.classList.remove('text-slate-600', 'dark:text-slate-400');
        } else {
            btn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-teal-600', 'dark:text-teal-400');
            btn.classList.add('text-slate-600', 'dark:text-slate-400');
        }
    });
}

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1) || 'home';
    renderSection(hash);
});

function toggleMobileMenu() {
    document.getElementById('mobile-menu').classList.toggle('hidden');
}

document.getElementById('mobile-menu-btn').addEventListener('click', toggleMobileMenu);

function showNotification(msg, type) {
    const notif = document.getElementById('notification');
    document.getElementById('notif-message').textContent = msg;
    notif.classList.remove('translate-y-24', 'opacity-0');
    setTimeout(() => {
        notif.classList.add('translate-y-24', 'opacity-0');
    }, 3000);
}

function openModal(id) {
    document.getElementById(id).classList.remove('hidden');
    document.getElementById(id).classList.add('flex');
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
    document.getElementById(id).classList.remove('flex');
}

// ==========================================
// 3. MENTOR DIRECTORY LOGIC (NEW)
// ==========================================

const mentorsData = [
    { name: "Sarah J.", role: "BSN Year 4", tags: ["Clinical", "Peds"], bio: "Happy to help with placement anxiety!", status: "online" },
    { name: "Mike T.", role: "MSN Student", tags: ["Exam Prep", "Pharm"], bio: "NCLEX tutor and former ER nurse.", status: "offline" },
    { name: "Priya K.", role: "BSN Year 3", tags: ["Burnout", "Balance"], bio: "Let's talk about work-life balance.", status: "online" },
    { name: "Alex R.", role: "BSN Year 4", tags: ["ICU", "Tech"], bio: "Tech nerd and ICU hopeful.", status: "offline" },
    { name: "Dana W.", role: "BSN Year 2", tags: ["Anatomy", "Stress"], bio: "Surviving first year together.", status: "online" },
    { name: "James L.", role: "RN Mentor", tags: ["Career", "Transition"], bio: "Helping you transition to practice.", status: "online" },
];

function renderMentors() {
    const container = document.getElementById('mentors-container');
    if(!container) return;
    
    container.innerHTML = mentorsData.map(mentor => `
        <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:border-teal-500 transition-all group">
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 text-xl">
                        <i class="fas fa-user-nurse"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-slate-800 dark:text-white">${mentor.name}</h3>
                        <p class="text-xs text-slate-500 dark:text-slate-400">${mentor.role}</p>
                    </div>
                </div>
                <span class="w-2 h-2 rounded-full ${mentor.status === 'online' ? 'bg-green-500' : 'bg-slate-300'}"></span>
            </div>
            <p class="text-sm text-slate-600 dark:text-slate-300 mb-4 italic">"${mentor.bio}"</p>
            <div class="flex flex-wrap gap-2 mb-6">
                ${mentor.tags.map(tag => `<span class="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md">${tag}</span>`).join('')}
            </div>
            <button onclick="showSection('chat')" class="w-full py-2 border border-teal-600 text-teal-600 dark:text-teal-400 dark:border-teal-500 rounded-lg text-sm font-bold hover:bg-teal-600 hover:text-white transition-colors">
                Connect
            </button>
        </div>
    `).join('');
}


// ==========================================
// 4. TOPICS & ADMIN LOGIC
// ==========================================

let topicsData = [
    { id: 1, title: "Stress & Burnout", desc: "Identifying signs of fatigue.", color: "red", icon: "fa-fire", modalId: "modal-burnout" },
    { id: 2, title: "Exam Anxiety", desc: "Handling NCLEX pressure.", color: "orange", icon: "fa-pen-alt", modalId: "modal-exams" },
    { id: 3, title: "Clinical Placement", desc: "Navigating hospital shifts.", color: "blue", icon: "fa-user-nurse", modalId: null },
    { id: 4, title: "Transition to Work", desc: "From student to RN.", color: "green", icon: "fa-briefcase", modalId: null }
];

function renderTopics() {
    const container = document.getElementById('topics-container');
    if(!container) return; 
    container.innerHTML = ""; 

    topicsData.forEach(topic => {
        let buttonHTML = topic.modalId 
            ? `<button onclick="openModal('${topic.modalId}')" class="text-teal-600 dark:text-teal-400 font-semibold text-sm hover:underline">Read Guide <i class="fas fa-arrow-right ml-1"></i></button>`
            : `<button class="text-slate-400 font-semibold text-sm cursor-not-allowed">Coming Soon</button>`;

        let adminControls = currentUserRole === 'admin' 
            ? `<button onclick="deleteTopic(${topic.id})" class="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition"><i class="fas fa-trash-alt"></i></button>` 
            : "";

        const cardHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative">
                <div class="h-2 bg-${topic.color}-400"></div>
                <div class="p-6">
                    ${adminControls}
                    <div class="flex justify-between items-start mb-3">
                        <h3 class="font-bold text-lg text-slate-800 dark:text-white">${topic.title}</h3>
                        <div class="text-${topic.color}-400 text-xl"><i class="fas ${topic.icon}"></i></div>
                    </div>
                    <p class="text-slate-600 dark:text-slate-300 text-sm mb-6 h-10 overflow-hidden">${topic.desc}</p>
                    ${buttonHTML}
                </div>
            </div>`;
        container.innerHTML += cardHTML;
    });
}

function handleAddTopic(event) {
    event.preventDefault();
    const title = document.getElementById('new-topic-title').value;
    const desc = document.getElementById('new-topic-desc').value;
    const color = document.getElementById('new-topic-color').value;
    topicsData.push({ id: Date.now(), title, desc, color, icon: "fa-lightbulb", modalId: null });
    renderTopics();
    updateDashboard();
    event.target.reset();
    document.getElementById('admin-add-topic').classList.add('hidden');
    showNotification("New Topic Published!", "success");
}

function deleteTopic(id) {
    if(confirm("Delete this topic?")) {
        topicsData = topicsData.filter(topic => topic.id !== id);
        renderTopics();
        updateDashboard();
        showNotification("Topic deleted.", "success");
    }
}

// ==========================================
// 5. INBOX & MESSAGES
// ==========================================

let peerMessages = [
    { id: 101, name: "NervousStudent22", year: "BSN Year 1", topic: "Academic Struggles", time: "Weekends", status: "pending" }
];

function handleBooking(e) {
    e.preventDefault();
    const inputs = e.target.querySelectorAll('input, select');
    const newMessage = {
        id: Date.now(),
        name: inputs[0].value || "Anonymous",
        year: inputs[1].value,
        topic: inputs[2].value,
        time: "Anytime",
        status: "pending"
    };
    peerMessages.push(newMessage);
    updateDashboard();
    e.target.reset();
    showNotification("Request Sent! Peer will reply via email.", "success");
}

function renderInbox() {
    const container = document.getElementById('inbox-container');
    if(!container) return;

    const activeMessages = peerMessages.filter(msg => msg.status === 'pending');

    if (activeMessages.length === 0) {
        container.innerHTML = `
            <div class="p-12 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center">
                <div class="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-300">
                    <i class="fas fa-inbox text-3xl"></i>
                </div>
                <p>No new requests.</p>
            </div>`;
        return;
    }

    container.innerHTML = activeMessages.map(msg => `
        <div class="flex flex-col md:flex-row gap-4 p-5 border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
            <div class="flex items-start gap-3 md:w-1/3">
                <div class="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex-shrink-0 flex items-center justify-center font-bold text-sm">
                    ${msg.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h4 class="font-bold text-slate-800 dark:text-white text-sm">${msg.name}</h4>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${msg.year}</p>
                </div>
            </div>
            <div class="md:w-1/4 flex items-center">
                <span class="inline-block bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 text-xs px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-600">
                    ${msg.topic}
                </span>
            </div>
            <div class="flex-1 flex justify-end items-center">
                <button onclick="acceptRequest(${msg.id})" class="bg-teal-600 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-teal-700 transition">
                    Accept
                </button>
            </div>
        </div>`).join('');
}

function acceptRequest(id) {
    const msgIndex = peerMessages.findIndex(m => m.id === id);
    if(msgIndex > -1) {
        peerMessages[msgIndex].status = 'accepted';
        renderInbox();
        updateDashboard();
        showNotification("Request Accepted!", "success");
    }
}

// ==========================================
// 6. UTILS & DASHBOARD
// ==========================================

function updateDashboard() {
    if(document.getElementById('stat-topics')) {
        document.getElementById('stat-topics').textContent = topicsData.length;
        document.getElementById('stat-requests').textContent = peerMessages.length;
        if(document.getElementById('stat-requests-sub')) {
             document.getElementById('stat-requests-sub').textContent = peerMessages.filter(m => m.status === 'pending').length;
        }
    }
}

let currentUserRole = 'student';

function loginAs(role, isAutoLogin = false) {
    localStorage.setItem('dps_user_role', role);
    currentUserRole = role;
    document.getElementById('login-modal').classList.add('hidden');

    // Reset Views
    const navAdmin = document.getElementById('nav-admin-link');
    const navPeer = document.getElementById('nav-peer-link');
    const mobAdmin = document.getElementById('mobile-admin-link');
    const mobPeer = document.getElementById('mobile-peer-link');
    const adminControls = document.getElementById('admin-controls-btn');
    
    // Hide all role specific
    [navAdmin, navPeer, mobAdmin, mobPeer, adminControls].forEach(el => el && el.classList.add('hidden'));
    document.getElementById('logout-btn').classList.remove('hidden');

    // Show role specific
    if (role === 'admin') {
        if(navAdmin) navAdmin.classList.remove('hidden');
        if(mobAdmin) mobAdmin.classList.remove('hidden');
        if(adminControls) adminControls.classList.remove('hidden');
        updateDashboard();
        if(!isAutoLogin) {
            showSection('admin-dashboard');
            showNotification("Admin Mode Active", "success");
        }
    } else if (role === 'peer') {
        if(navPeer) navPeer.classList.remove('hidden');
        if(mobPeer) mobPeer.classList.remove('hidden');
        renderInbox();
        if(!isAutoLogin) {
            showSection('peer-inbox');
            showNotification("Welcome Mentor", "success");
        }
    } else {
        if(!isAutoLogin) {
            showSection('home');
            showNotification("Welcome Student", "success");
        }
    }
    
    // Handle hash on refresh
    if(isAutoLogin) {
         const hash = window.location.hash.substring(1) || 'home';
         renderSection(hash);
    }
    renderTopics();
}

function logout() {
    localStorage.removeItem('dps_user_role');
    window.location.hash = '';
    window.location.reload();
}

// BREATHING LOGIC
function toggleBreathing() {
    const btn = document.getElementById('breath-btn');
    const widget = document.getElementById('breathing-widget');
    const text = document.getElementById('breath-text');
    
    if (!isBreathing) {
        isBreathing = true;
        btn.textContent = "Stop";
        btn.classList.replace('bg-teal-600', 'bg-red-500');
        widget.classList.add('inhaling');
        text.textContent = "Inhale...";
        breathingInterval = setInterval(() => {
            if(widget.classList.contains('inhaling')) {
                widget.classList.remove('inhaling');
                widget.classList.add('exhaling');
                text.textContent = "Exhale...";
            } else {
                widget.classList.remove('exhaling');
                widget.classList.add('inhaling');
                text.textContent = "Inhale...";
            }
        }, 4000);
    } else {
        isBreathing = false;
        clearInterval(breathingInterval);
        btn.textContent = "Start Exercise";
        btn.classList.replace('bg-red-500', 'bg-teal-600');
        widget.classList.remove('inhaling', 'exhaling');
        text.textContent = "Ready?";
    }
}