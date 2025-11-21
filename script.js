// ==========================================
// 1. CONFIG & THEME
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    renderTopics();
    renderSessions();
    initPlatformSelector();
    
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
// 4. TOPICS & ADMIN LOGIC (ENHANCED)
// ==========================================

// 1. Predefined Assets
const availableIcons = [
    "fa-lightbulb", "fa-heart-pulse", "fa-brain", "fa-user-nurse", 
    "fa-coffee", "fa-bed", "fa-stopwatch", "fa-users", "fa-book-open", "fa-hand-holding-heart"
];

const availableColors = [
    { name: "teal", hex: "bg-teal-500", light: "bg-teal-100", text: "text-teal-600" },
    { name: "blue", hex: "bg-blue-500", light: "bg-blue-100", text: "text-blue-600" },
    { name: "indigo", hex: "bg-indigo-500", light: "bg-indigo-100", text: "text-indigo-600" },
    { name: "purple", hex: "bg-purple-500", light: "bg-purple-100", text: "text-purple-600" },
    { name: "rose", hex: "bg-rose-500", light: "bg-rose-100", text: "text-rose-600" },
    { name: "amber", hex: "bg-amber-500", light: "bg-amber-100", text: "text-amber-600" }
];

// 2. Enhanced Data Structure
let topicsData = [
    { 
        id: 1, 
        title: "Stress & Burnout", 
        desc: "Identifying signs of fatigue and emotional exhaustion.", 
        color: "rose", 
        icon: "fa-heart-pulse", 
        content: {
            intro: "Nursing burnout is physical, mental, and emotional exhaustion caused by chronic workplace stress.",
            bullets: ["Dreading clinicals or work shifts.", "Feeling cynical or irritable with patients.", "Physical fatigue even after sleeping."],
            action: "Step into a supply room. Drink water slowly. Do one cycle of box breathing."
        }
    },
    { 
        id: 2, 
        title: "Exam Anxiety", 
        desc: "Handling NCLEX pressure and test-taking panic.", 
        color: "amber", 
        icon: "fa-brain", 
        content: {
            intro: "The NCLEX tests critical thinking, not just memory. Anxiety blocks that pathway. You need to calm the amygdala to access the frontal cortex.",
            bullets: ["Green Light: You know it. Mark it.", "Yellow Light: Narrowed to two. Trust your gut.", "Red Light: No idea. Breathe, guess, move on."],
            action: "Use the Stop Light Method for every question."
        }
    },
    { 
        id: 3, 
        title: "Clinical Placement", 
        desc: "Navigating hospital hierarchy and shift anxiety.", 
        color: "blue", 
        icon: "fa-user-nurse", 
        content: {
            intro: "Your first clinical rotation can feel overwhelming. Remember that you are there to learn, not to be perfect.",
            bullets: ["Ask questions when unsure—it shows safety awareness.", "Find a 'safe nurse' to shadow.", "Bring snacks and stay hydrated."],
            action: "Introduce yourself to the charge nurse at the start of the shift."
        }
    }
];

// 3. Render Function
function renderTopics() {
    const container = document.getElementById('topics-container');
    if(!container) return; 
    container.innerHTML = ""; 

    topicsData.forEach(topic => {
        // Determine styles based on color name
        const theme = availableColors.find(c => c.name === topic.color) || availableColors[0];

        let adminControls = currentUserRole === 'admin' 
            ? `<button onclick="deleteTopic(event, ${topic.id})" class="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition z-20"><i class="fas fa-trash-alt"></i></button>` 
            : "";

        // NOTE: onclick passes the topic ID to open the dynamic modal
        const cardHTML = `
            <div onclick="openTopicModal(${topic.id})" class="cursor-pointer bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative">
                <div class="h-2 ${theme.hex}"></div> <div class="p-6">
                    ${adminControls}
                    <div class="flex justify-between items-start mb-3">
                        <h3 class="font-bold text-lg text-slate-800 dark:text-white group-hover:${theme.text} transition-colors">${topic.title}</h3>
                        <div class="${theme.text} text-xl"><i class="fas ${topic.icon}"></i></div>
                    </div>
                    <p class="text-slate-600 dark:text-slate-300 text-sm mb-6 h-10 overflow-hidden">${topic.desc}</p>
                    <span class="text-xs font-bold ${theme.text} uppercase tracking-wider flex items-center">
                        Read Guide <i class="fas fa-arrow-right ml-1 transform group-hover:translate-x-1 transition-transform"></i>
                    </span>
                </div>
            </div>`;
        container.innerHTML += cardHTML;
    });
}

// 4. Dynamic Modal Logic (The "Universal Modal")
function openTopicModal(id) {
    const topic = topicsData.find(t => t.id === id);
    if(!topic) return;

    const modal = document.getElementById('modal-dynamic-topic');
    const theme = availableColors.find(c => c.name === topic.color) || availableColors[0];

    // Inject Colors
    document.getElementById('modal-header-bar').className = `h-4 w-full ${theme.hex}`;
    document.getElementById('modal-icon-box').className = `w-12 h-12 rounded-xl flex items-center justify-center text-xl ${theme.light} ${theme.text} dark:bg-opacity-20`;
    
    // Inject Content
    document.getElementById('modal-icon').className = `fas ${topic.icon}`;
    document.getElementById('modal-title').textContent = topic.title;
    document.getElementById('modal-title').className = `text-2xl font-bold text-slate-800 dark:text-white`;
    
    // Handle Rich Content
    const content = topic.content || { intro: topic.desc, bullets: [], action: "" };
    
    document.getElementById('modal-intro').textContent = content.intro;
    
    // Bullets
    const bulletsList = document.getElementById('modal-bullets');
    const bulletsContainer = document.getElementById('modal-bullets-container');
    bulletsList.innerHTML = "";
    if(content.bullets && content.bullets.length > 0) {
        bulletsContainer.classList.remove('hidden');
        content.bullets.forEach(b => {
            const li = document.createElement('li');
            li.textContent = b;
            bulletsList.appendChild(li);
        });
    } else {
        bulletsContainer.classList.add('hidden');
    }

    // Action Box
    const actionBox = document.getElementById('modal-action-box');
    if(content.action) {
        actionBox.classList.remove('hidden');
        actionBox.className = `p-4 rounded-xl border-l-4 mt-6 ${theme.light} border-${theme.name}-500 dark:bg-opacity-10`;
        document.getElementById('modal-action-title').className = `font-bold mb-1 ${theme.text}`;
        document.getElementById('modal-action-text').textContent = content.action;
        document.getElementById('modal-action-text').className = "text-sm text-slate-700 dark:text-slate-300";
    } else {
        actionBox.classList.add('hidden');
    }

    // Show Modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

// 5. Admin Form Logic
// Initialize Pickers when Admin Mode starts
function initAdminPickers() {
    // Render Icons
    const iconContainer = document.getElementById('icon-selector');
    if(iconContainer.innerHTML === "") { // Only render once
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

        // Render Colors
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

function handleAddTopic(event) {
    event.preventDefault();
    
    const title = document.getElementById('new-topic-title').value;
    const desc = document.getElementById('new-topic-desc').value;
    const color = document.getElementById('selected-color').value;
    const icon = document.getElementById('selected-icon').value;
    
    const intro = document.getElementById('new-content-intro').value || desc;
    const bulletsRaw = document.getElementById('new-content-bullets').value;
    const action = document.getElementById('new-content-action').value;

    // Parse bullets by new line
    const bullets = bulletsRaw ? bulletsRaw.split('\n').filter(line => line.trim() !== '') : [];

    const newTopic = { 
        id: Date.now(), 
        title, 
        desc, 
        color, 
        icon, 
        content: { intro, bullets, action }
    };

    topicsData.push(newTopic);
    renderTopics();
    updateDashboard();
    event.target.reset();
    document.getElementById('admin-add-topic').classList.add('hidden');
    showNotification("New Guide Published Successfully!", "success");
}

function deleteTopic(event, id) {
    event.stopPropagation(); // Prevent opening the modal when clicking delete
    if(confirm("Delete this topic?")) {
        topicsData = topicsData.filter(topic => topic.id !== id);
        renderTopics();
        updateDashboard();
        showNotification("Topic deleted.", "success");
    }
}

// ==========================================
// VIRTUAL SESSIONS LOGIC
// ==========================================

// 1. Initial Data
let sessionsData = [
    { 
        id: 1, 
        title: "Mindfulness for Nurses", 
        desc: "Guided meditation & grounding techniques.", 
        date: "2025-11-24", 
        time: "17:00", 
        duration: 60,
        host: "Sarah Jenkins", 
        platform: "Zoom", 
        tag: "Stress Relief", 
        link: "#" 
    },
    { 
        id: 2, 
        title: "NCLEX Q&A Strategy", 
        desc: "How to dissect difficult questions.", 
        date: "2025-11-28", 
        time: "18:30", 
        duration: 90,
        host: "Peer Mentor Mike", 
        platform: "Microsoft Teams", 
        tag: "Exam Prep", 
        link: "#" 
    }
];

// 2. Render Function
// Helper to get Brand SVGs (No file upload needed, inline is faster)
function getPlatformIcon(platform) {
    if (platform === 'Google Meet') {
        // The official multi-color Meet Camera Icon
        return `<svg class="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z" fill="#fff" opacity="0"/><path d="M21 12l-4.2-3.6v2.7H13.2v1.8h3.6v2.7L21 12z" fill="#00832d"/><path d="M12 6c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6z" fill="#0066da"/><path d="M7.2 12l4.2 3.6v-2.7h3.6v-1.8h-3.6V8.4L7.2 12z" fill="#e94235"/><path d="M19.2 19.2L15 15.6V18a1.2 1.2 0 0 1-1.2 1.2H4.8A1.2 1.2 0 0 1 3.6 18V6a1.2 1.2 0 0 1 1.2-1.2h9.003c.662 0 1.197.538 1.197 1.2v2.4l4.2-3.6v14.4z" fill="none"/><g><path d="M19.2 19.2L15 15.6V18a1.2 1.2 0 0 1-1.2 1.2H4.8A1.2 1.2 0 0 1 3.6 18V6a1.2 1.2 0 0 1 1.2-1.2h9.003c.662 0 1.197.538 1.197 1.2v2.4l4.2-3.6v14.4z" fill="#00ac47"/><path d="M15 10.8v2.4l4.2 3.6V7.2L15 10.8z" fill="#00832d"/><path d="M9 12c0 1.657 1.343 3 3 3s3-1.343 3-3-1.343-3-3-3-3 1.343-3 3z" fill="#2684fc"/><path d="M3.6 18V6h9v12h-9z" fill="#ffba00"/><path d="M12.6 6H3.6a1.199 1.199 0 0 0-1.2 1.2v4.91l10.2-8.5V6z" fill="#0066da"/><path d="M12.6 18v-2.39l-10.2-8.5V18c0 .663.537 1.2 1.2 1.2h9c.662 0 1.2-.537 1.2-1.2z" fill="#00ac47"/></g></svg>`;
    } 
    else if (platform === 'Zoom') {
        // Official Zoom Blue
        return `<svg class="w-5 h-5 text-blue-500 fill-current" viewBox="0 0 24 24"><path d="M13.546 10.45l6.86-4.54a.75.75 0 0 1 1.16.63v10.92a.75.75 0 0 1-1.16.63l-6.86-4.54a.75.75 0 0 1-1.212.63l-7.77 5.18a1.5 1.5 0 0 1-2.25-1.248V5.898a1.5 1.5 0 0 1 2.25-1.248l7.77 5.18a.75.75 0 0 1 1.212.62z"/></svg>`;
    } 
    else {
        // Microsoft Teams Purple
        return `<svg class="w-5 h-5 text-indigo-600 fill-current" viewBox="0 0 24 24"><path d="M17.5 12a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"/><path d="M2.5 11.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Z"/><path d="M5 16.5a1.5 1.5 0 0 1 1.5-1.5h7a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 5 17.5v-1Z"/><path d="M12 17.5a1.5 1.5 0 0 1 1.5-1.5h7a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-7a1.5 1.5 0 0 1-1.5-1.5v-1Z"/></svg>`;
    }
}

function renderSessions() {
    const container = document.getElementById('sessions-container');
    if(!container) return;
    
    if(sessionsData.length === 0) {
        container.innerHTML = `<div class="p-8 text-center text-slate-400">No upcoming sessions scheduled.</div>`;
        return;
    }

    container.innerHTML = sessionsData.map(session => {
        const dateObj = new Date(session.date);
        const day = dateObj.getDate();
        const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
        
        // Get the SVG Icon
        const iconSVG = getPlatformIcon(session.platform);

        let adminControls = currentUserRole === 'admin' 
            ? `<button onclick="deleteSession(${session.id})" class="text-slate-300 hover:text-red-500 ml-2 transition"><i class="fas fa-trash-alt"></i></button>` 
            : "";

        return `
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition items-center group">
            
            <div class="md:col-span-2 flex items-center gap-3">
                <div class="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl p-2 w-14 text-center border border-slate-200 dark:border-slate-600">
                    <div class="text-[10px] uppercase tracking-wider">${month}</div>
                    <div class="text-xl leading-none">${day}</div>
                </div>
                <div class="text-sm text-slate-500 dark:text-slate-400">
                    ${session.time}<br>
                    <span class="text-xs opacity-70">${session.duration}m</span>
                </div>
            </div>

            <div class="md:col-span-4">
                <h4 class="font-bold text-slate-800 dark:text-white text-lg">${session.title}</h4>
                <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">${session.desc}</p>
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-800">
                    ${session.tag}
                </span>
            </div>

            <div class="md:col-span-3 flex flex-col justify-center text-sm">
                <div class="flex items-center text-slate-700 dark:text-slate-300 mb-1">
                    <i class="fas fa-user-circle mr-2 text-slate-400"></i> ${session.host}
                </div>
                <div class="flex items-center text-slate-500 dark:text-slate-400 font-medium">
                    <span class="mr-2 flex items-center justify-center">${iconSVG}</span>
                    ${session.platform}
                </div>
            </div>

            <div class="md:col-span-3 flex items-center justify-end gap-3">
                <a href="${session.link}" target="_blank" class="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold hover:opacity-90 transition shadow-md">
                    Join
                </a>
                ${adminControls}
            </div>
        </div>`;
    }).join('');
}

// 3. Add Session Logic
function handleAddSession(e) {
    e.preventDefault();
    
    const newSession = {
        id: Date.now(),
        title: document.getElementById('new-session-title').value,
        host: document.getElementById('new-session-host').value,
        date: document.getElementById('new-session-date').value,
        time: document.getElementById('new-session-time').value,
        duration: parseInt(document.getElementById('new-session-duration').value, 10),
        platform: document.getElementById('new-session-platform').value,
        tag: document.getElementById('new-session-tag').value,
        link: document.getElementById('new-session-link').value,
        desc: document.getElementById('new-session-desc').value,
    };

    sessionsData.push(newSession);
    renderSessions();
    
    // Update Analytics
    if(document.getElementById('stat-sessions')) {
        document.getElementById('stat-sessions').textContent = sessionsData.length;
    }

    e.target.reset();
    initPlatformSelector();
    document.getElementById('admin-add-session').classList.add('hidden');
    showNotification("Session Scheduled Successfully!", "success");
}

function deleteSession(id) {
    if(confirm("Cancel and delete this session?")) {
        sessionsData = sessionsData.filter(s => s.id !== id);
        renderSessions();
        showNotification("Session cancelled.", "success");
    }
}

function formatDuration(minutes) {
    const mins = parseInt(minutes, 10);
    if (isNaN(mins)) return minutes;
    const hours = Math.floor(mins / 60);
    const remainder = mins % 60;
    if (hours && remainder) return `${hours}h ${remainder}m`;
    if (hours) return `${hours}h`;
    return `${mins}m`;
}

function initPlatformSelector() {
    const container = document.getElementById('platform-options');
    const hiddenInput = document.getElementById('new-session-platform');
    if(!container || !hiddenInput) return;

    const options = Array.from(container.querySelectorAll('.platform-option'));
    if(options.length === 0) return;

    const setActive = (target) => {
        options.forEach(option => {
            option.classList.remove('active');
            const check = option.querySelector('.platform-check');
            if(check) check.classList.add('hidden');
        });
        target.classList.add('active');
        const targetCheck = target.querySelector('.platform-check');
        if(targetCheck) targetCheck.classList.remove('hidden');
        hiddenInput.value = target.dataset.platform;
    };

    const activatePreset = () => {
        const preset = options.find(option => option.dataset.platform === hiddenInput.value) || options[0];
        if(preset) setActive(preset);
    };

    if(container.dataset.enhanced === 'true') {
        activatePreset();
        return;
    }

    options.forEach(option => {
        option.addEventListener('click', () => setActive(option));
    });

    container.dataset.enhanced = 'true';
    activatePreset();
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
        initAdminPickers();
        if(document.getElementById('admin-session-controls')) {
            document.getElementById('admin-session-controls').classList.remove('hidden');
        }
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

// ==========================================
// BREATHING WIDGET LOGIC (Fixed & Scientific)
// ==========================================

let isBreathing = false;
let breathingTimeouts = []; // To store timeouts so we can clear them on stop

function toggleBreathing() {
    const btn = document.getElementById('breath-btn');
    const widget = document.getElementById('breathing-widget');
    const text = document.getElementById('breath-text');
    const instruction = document.getElementById('breath-instruction');
    
    if (!isBreathing) {
        // --- START BREATHING ---
        isBreathing = true;
        btn.textContent = "Stop Exercise";
        btn.classList.replace('bg-teal-600', 'bg-red-500');
        btn.classList.replace('hover:bg-teal-700', 'hover:bg-red-600');
        
        // Start the first cycle immediately
        runBreathingCycle(widget, text, instruction);
        
    } else {
        // --- STOP BREATHING ---
        isBreathing = false;
        // Clear all scheduled steps
        breathingTimeouts.forEach(clearTimeout);
        breathingTimeouts = [];
        
        // Reset UI
        btn.textContent = "Start Exercise";
        btn.classList.replace('bg-red-500', 'bg-teal-600');
        btn.classList.replace('hover:bg-red-600', 'hover:bg-teal-700');
        
        widget.className = 'breathing-widget'; // Remove all state classes
        text.textContent = "Ready?";
        instruction.textContent = "Tap Start";
        // Force a repaint to ensure ripples disappear instantly
        void widget.offsetWidth; 
    }
}

// The 4-7-8 Cycle (+ 3s Rest) function
function runBreathingCycle(widget, text, instruction) {
    if (!isBreathing) return; // Stop if user clicked stop

    // 1. INHALE (4s)
    widget.className = 'breathing-widget inhaling';
    text.textContent = "Inhale...";
    instruction.textContent = "Breathe in slowly through nose (4s)";
    
    breathingTimeouts.push(setTimeout(() => {
        if (!isBreathing) return;

        // 2. HOLD (7s)
        widget.className = 'breathing-widget holding';
        text.textContent = "Hold...";
        instruction.textContent = "Keep lungs full (7s)";

        breathingTimeouts.push(setTimeout(() => {
            if (!isBreathing) return;

            // 3. EXHALE (8s)
            widget.className = 'breathing-widget exhaling';
            text.textContent = "Exhale...";
            instruction.textContent = "Release slowly through mouth (8s)";

            breathingTimeouts.push(setTimeout(() => {
                if (!isBreathing) return;

                // 4. REST (3s) - The "Break" you asked for
                widget.className = 'breathing-widget resting';
                text.textContent = "Rest...";
                instruction.textContent = "Relax for a moment (3s)";

                // Schedule next cycle after rest
                breathingTimeouts.push(setTimeout(() => {
                    if(isBreathing) runBreathingCycle(widget, text, instruction);
                }, 3000)); // End of Rest (3s)

            }, 8000)); // End of Exhale (8s)

        }, 7000)); // End of Hold (7s)

    }, 4000)); // End of Inhale (4s)
}
