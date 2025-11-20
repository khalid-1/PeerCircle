// ==========================================
// 1. NAVIGATION & UI LOGIC
// ==========================================

// ==========================================
// THEME TOGGLE LOGIC (Dark Mode)
// ==========================================

function initTheme() {
    const themeIcon = document.getElementById('theme-icon');
    if(!themeIcon) return;

    // Check LocalStorage or System Preference
    if (localStorage.getItem('dps_theme') === 'dark' || 
       (!('dps_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
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
        // Switch to Light
        html.classList.remove('dark');
        localStorage.setItem('dps_theme', 'light');
        icon.classList.replace('fa-sun', 'fa-moon'); // Show Moon (to go dark)
    } else {
        // Switch to Dark
        html.classList.add('dark');
        localStorage.setItem('dps_theme', 'dark');
        icon.classList.replace('fa-moon', 'fa-sun'); // Show Sun (to go light)
    }
}

// Handle showing specific sections
function showSection(sectionId) {
    // Update URL hash (so back button works)
    if(window.location.hash.substring(1) !== sectionId) {
        window.location.hash = sectionId;
    }
    renderSection(sectionId);
}

function renderSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section-content').forEach(el => {
        el.classList.remove('active');
        el.classList.add('hidden'); // Ensure hidden class is applied
    });
    
    // Show selected section (fallback to home)
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
        // Check if the button's onclick text contains the active ID
        const onClickText = btn.getAttribute('onclick');
        if(onClickText && onClickText.includes(activeId)) {
            btn.classList.add('text-teal-600');
            btn.classList.remove('text-slate-500');
        } else {
            btn.classList.remove('text-teal-600');
            btn.classList.add('text-slate-500');
        }
    });
}

// Handle Browser Back/Forward Buttons
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1) || 'home';
    renderSection(hash);
});

// Mobile Menu Toggle
function toggleMobileMenu() {
    document.getElementById('mobile-menu').classList.toggle('hidden');
}

document.getElementById('mobile-menu-btn').addEventListener('click', toggleMobileMenu);

// Notification Toast
function showNotification(msg, type) {
    const notif = document.getElementById('notification');
    document.getElementById('notif-message').textContent = msg;
    
    notif.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
        notif.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

// Modal Logic
function openModal(id) {
    document.getElementById(id).classList.remove('hidden');
    document.getElementById(id).classList.add('flex');
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
    document.getElementById(id).classList.remove('flex');
}

// ==========================================
// 2. BREATHING APP LOGIC (DIRECTIONAL)
// ==========================================

let isBreathing = false;
let breathingInterval;

function toggleBreathing() {
    const btn = document.getElementById('breath-btn');
    const widget = document.getElementById('breathing-widget');
    const text = document.getElementById('breath-text');
    const instruction = document.getElementById('breath-instruction');

    if (!isBreathing) {
        // --- START ---
        isBreathing = true;
        btn.textContent = "Stop Exercise";
        btn.classList.replace('bg-teal-600', 'bg-red-400');
        
        instruction.textContent = "Follow the waves...";
        
        // Run the first cycle immediately
        performBreathingCycle();
        
        // Set interval for full 8-second loop (4s In + 4s Out)
        breathingInterval = setInterval(performBreathingCycle, 8000); 

    } else {
        // --- STOP ---
        isBreathing = false;
        clearInterval(breathingInterval);
        btn.textContent = "Start Exercise";
        btn.classList.replace('bg-red-400', 'bg-teal-600');
        
        // Remove animation classes
        widget.classList.remove('inhaling', 'exhaling');
        
        text.textContent = "Ready?";
        instruction.textContent = "Click Start";
    }
}

function performBreathingCycle() {
    if(!isBreathing) return;
    
    const widget = document.getElementById('breathing-widget');
    const text = document.getElementById('breath-text');
    
    // PHASE 1: INHALE (0s - 4s)
    text.textContent = "Breathe In";
    widget.classList.remove('exhaling'); // Stop outward waves
    widget.classList.add('inhaling');    // Start inward waves
    
    // PHASE 2: EXHALE (4s - 8s)
    setTimeout(() => {
        if(isBreathing) {
            text.textContent = "Breathe Out";
            widget.classList.remove('inhaling'); // Stop inward waves
            widget.classList.add('exhaling');    // Start outward waves
        }
    }, 4000); 
}

// ==========================================
// 3. ADMIN & DATA LOGIC
// ==========================================

// Fake Database for Topics
let topicsData = [
    { id: 1, title: "Stress & Burnout", desc: "Identifying signs of fatigue.", color: "red", icon: "fa-fire", modalId: "modal-burnout" },
    { id: 2, title: "Exam Anxiety", desc: "Handling NCLEX pressure.", color: "orange", icon: "fa-pen-alt", modalId: "modal-exams" },
    { id: 3, title: "Clinical Placement", desc: "Navigating hospital shifts.", color: "blue", icon: "fa-user-nurse", modalId: null },
    { id: 4, title: "Transition to Work", desc: "From student to RN expectations.", color: "green", icon: "fa-briefcase", modalId: null }
];

function renderTopics() {
    const container = document.getElementById('topics-container');
    if(!container) return; 

    container.innerHTML = ""; 

    topicsData.forEach(topic => {
        let buttonHTML = topic.modalId 
            ? `<button onclick="openModal('${topic.modalId}')" class="text-teal-600 font-semibold text-sm hover:underline">Read Guide <i class="fas fa-arrow-right ml-1"></i></button>`
            : `<button class="text-slate-400 font-semibold text-sm cursor-not-allowed">Coming Soon</button>`;

        // Only show trash can if user is admin
        let adminControls = currentUserRole === 'admin' 
            ? `<button onclick="deleteTopic(${topic.id})" class="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition"><i class="fas fa-trash-alt"></i></button>` 
            : "";

        const cardHTML = `
            <div class="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition group relative animate-[fadeIn_0.3s_ease-out]">
                <div class="h-3 bg-${topic.color}-400"></div>
                <div class="p-6">
                    ${adminControls}
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="font-bold text-xl text-slate-800">${topic.title}</h3>
                        <div class="text-${topic.color}-400 text-xl"><i class="fas ${topic.icon}"></i></div>
                    </div>
                    <p class="text-slate-600 text-sm mb-4 min-h-[3rem]">${topic.desc}</p>
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
    updateDashboard(); // KEY FIX: Updates stats immediately
    event.target.reset();
    showNotification("New Topic Published!", "success");
}

function deleteTopic(id) {
    if(confirm("Delete this topic?")) {
        topicsData = topicsData.filter(topic => topic.id !== id);
        renderTopics();
        updateDashboard(); // KEY FIX: Updates stats immediately
        showNotification("Topic deleted.", "success");
    }
}

// ==========================================
// 4. PEER CHAT & INBOX LOGIC
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
        time: inputs[3].value,
        status: "pending"
    };

    peerMessages.push(newMessage);
    updateDashboard(); // KEY FIX: Updates stats immediately
    e.target.reset();
    showNotification("Request Sent! Peer will reply soon.", "success");
}

function renderInbox() {
    const container = document.getElementById('inbox-container');
    if(!container) return;

    const activeMessages = peerMessages.filter(msg => msg.status === 'pending');

    if (activeMessages.length === 0) {
        container.innerHTML = `<div class="p-8 text-center text-slate-400">All caught up!</div>`;
        return;
    }

    container.innerHTML = activeMessages.map(msg => `
        <div class="grid grid-cols-1 md:grid-cols-12 px-6 py-4 items-center border-b border-slate-100 hover:bg-slate-50">
            <div class="md:col-span-3 font-medium text-slate-800">${msg.name}</div>
            <div class="md:col-span-2 text-sm text-slate-500">${msg.year}</div>
            <div class="md:col-span-3"><span class="bg-slate-100 px-2 py-1 rounded text-xs">${msg.topic}</span></div>
            <div class="md:col-span-2 text-sm text-slate-500">${msg.time}</div>
            <div class="md:col-span-2 text-right">
                <button onclick="acceptRequest(${msg.id})" class="bg-teal-600 text-white px-3 py-1 rounded text-sm">Accept</button>
            </div>
        </div>`).join('');
}

function acceptRequest(id) {
    const msgIndex = peerMessages.findIndex(m => m.id === id);
    if(msgIndex > -1) {
        peerMessages[msgIndex].status = 'accepted';
        renderInbox();
        updateDashboard(); // KEY FIX: Updates stats immediately
        showNotification("Request Accepted!", "success");
    }
}

// ==========================================
// 5. ANALYTICS DASHBOARD
// ==========================================

function updateDashboard() {
    const topicCount = topicsData.length;
    const totalRequests = peerMessages.length;
    const pendingRequests = peerMessages.filter(m => m.status === 'pending').length;

    // Check if elements exist before updating
    if(document.getElementById('stat-topics')) {
        document.getElementById('stat-topics').textContent = topicCount;
        document.getElementById('stat-requests').textContent = totalRequests;
        document.getElementById('stat-requests-sub').textContent = `${pendingRequests} Pending actions`;
    }
}

// ==========================================
// 6. AUTHENTICATION & STARTUP (Login/Logout)
// ==========================================

let currentUserRole = 'student';

// A. Check for saved session on Page Load
document.addEventListener('DOMContentLoaded', () => {
    initTheme(); // <--- ADD THIS LINE
    
    const savedRole = localStorage.getItem('dps_user_role');

    // Render initial content
    renderTopics();

    if (savedRole) {
        // Auto-login if saved
        loginAs(savedRole, true); 
    } else {
        // Show login modal if no save found
        const modal = document.getElementById('login-modal');
        if(modal) modal.classList.remove('hidden');
    }
});

// B. Login Logic
function loginAs(role, isAutoLogin = false) {
    localStorage.setItem('dps_user_role', role);
    currentUserRole = role;

    // Hide Modal
    const modal = document.getElementById('login-modal');
    if(modal) modal.classList.add('hidden');

    // UI Elements
    const adminControls = document.getElementById('admin-controls');
    const adminBadge = document.getElementById('admin-badge');
    const adminDash = document.getElementById('admin-dashboard');
    const peerInbox = document.getElementById('peer-inbox');
    const logoutBtn = document.getElementById('logout-btn');

    // Reset Views
    if(logoutBtn) logoutBtn.classList.remove('hidden');
    if(adminControls) adminControls.classList.add('hidden');
    if(adminBadge) adminBadge.classList.add('hidden');
    if(adminDash) adminDash.classList.add('hidden');
    if(peerInbox) peerInbox.classList.add('hidden');

    // Role Specific Logic
    if (role === 'admin') {
        if(adminControls) adminControls.classList.remove('hidden');
        if(adminBadge) adminBadge.classList.remove('hidden');
        if(adminDash) adminDash.classList.remove('hidden');
        
        updateDashboard();
        
        if(!isAutoLogin) {
            showSection('admin-dashboard');
            showNotification("Admin Mode Active", "success");
        } else {
            // If refreshing, stay on current hash or go home
            const hash = window.location.hash.substring(1) || 'admin-dashboard';
            renderSection(hash);
        }
    
    } else if (role === 'peer') {
        if(peerInbox) peerInbox.classList.remove('hidden');
        renderInbox();

        if(!isAutoLogin) {
            showSection('peer-inbox');
            showNotification("Welcome Mentor", "success");
        } else {
            const hash = window.location.hash.substring(1) || 'peer-inbox';
            renderSection(hash);
        }
    
    } else {
        // Student
        if(!isAutoLogin) {
            showSection('home');
            showNotification("Logged in anonymously", "success");
        } else {
            const hash = window.location.hash.substring(1) || 'home';
            renderSection(hash);
        }
    }

    // Re-render topics to apply/remove Admin delete buttons
    renderTopics();
}

// C. Logout Logic
function logout() {
    localStorage.removeItem('dps_user_role');
    window.location.hash = ''; // Clear hash
    window.location.reload(); // Reload page to reset
}