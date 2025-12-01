// ==========================================
// 1. STATE & DATA MODELS
// ==========================================

// --- PERSISTENCE HELPERS ---
// (Removed: Using Firestore)

// --- SANITIZATION HELPER (Security) ---
function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag])
    );
}

// --- DATA STORE ---
// Topics and Sessions are now loaded from Firestore


const mentorsData = [
    { name: "Meerah Ahmed Alansi", year: "BSN Year 4", email: "meera.22904065@rakmhsu.ac.ae", quote: "Happy to support with clinical placement anxiety and confidence on the ward.", tags: ["Clinical Support", "Placement Anxiety"] },
    { name: "Seham Mohammed Abuhatab", year: "BSN Year 4", email: "seham.22904030@rakmhsu.ac.ae", quote: "Let’s talk about balancing life, studies, and clinicals without burning out.", tags: ["Stress & Burnout", "Time Management"] },
    { name: "Doaa Mohamed Sharafeldin", year: "BSN Year 4", email: "doaa.22904079@rakmhsu.ac.ae", quote: "Here for exam anxiety, study plans, and last-minute motivation.", tags: ["Exam Prep", "Study Skills"] },
    { name: "Khalid Said Islam", year: "BSN Year 4", email: "khalid.22904036@rakmhsu.ac.ae", quote: "Happy to chat about tech tools, note-taking, and keeping organized.", tags: ["Study Skills", "Time Management"] },
    { name: "Amina Sulieman Yassin", year: "BSN Year 4", email: "amina.22904026@rakmhsu.ac.ae", quote: "Let’s make pharmacology and pathophysiology feel less scary.", tags: ["Pharmacology", "Pathophysiology"] },
    { name: "Haya Hani Al Halabi", year: "BSN Year 3", email: "haya.23904004@rakmhsu.ac.ae", quote: "Supporting you with first clinicals, communication, and reflective practice.", tags: ["Clinical Support", "Communication"] },
    { name: "Khalifa Khalid Alshehhi", year: "BSN Year 3", email: "khalifa.23904112@rakmhsu.ac.ae", quote: "Happy to discuss exam strategies and OSCE preparation.", tags: ["Exam Prep", "OSCE"] },
    { name: "Abdalqader Abdou", year: "BSN Year 3", email: "abdalqader.23904036@rakmhsu.ac.ae", quote: "We can work together on clinical reasoning and case-based thinking.", tags: ["Clinical Reasoning", "Case Discussions"] },
    { name: "Bushra Garallah Ali", year: "BSN Year 2", email: "bushra.24904025@rakmhsu.ac.ae", quote: "Here for first-year nerves, basics, and building your confidence.", tags: ["First Year Support", "Foundations"] },
    { name: "Ghofran G A Abuzour", year: "BSN Year 2", email: "ghofran.24904022@rakmhsu.ac.ae", quote: "Happy to help with pharmacology flashcards and study routines.", tags: ["Pharmacology", "Study Routines"] },
    { name: "Leen Abdelhakim Toubeh", year: "BSN Year 2", email: "leen.24904034@rakmhsu.ac.ae", quote: "Let’s focus on building study habits that actually work for you.", tags: ["Study Skills", "Motivation"] },
    { name: "Raghad Mohammad", year: "BSN Year 2", email: "raghad.24904030@rakmhsu.ac.ae", quote: "Here for stress management, grounding techniques, and check-ins.", tags: ["Stress Management", "Coping Skills"] },
    { name: "Haneen Jamal Hjaila", year: "BSN Year 2", email: "haneen.24904019@rakmhsu.ac.ae", quote: "Let’s work on confidence, presentations, and speaking up in class.", tags: ["Confidence", "Presentations"] }
];



let topicsData = []; // Will load from Firestore
let sessionsData = []; // Will load from Firestore
let peerMessages = []; // Will load from Firestore
let currentUserRole = 'student';
let currentUserData = null; // Store current user info
let isSignUpMode = false;

// FIXED: Stop browser from scrolling to bottom on reload
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}

// ==========================================
// 2. INITIALIZATION & THEME
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0);
    initTheme();

    // Firebase Auth Listener
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            console.log("User logged in:", user.email);

            // 1. Check Email Verification
            if (!user.emailVerified) {
                console.log("Email not verified.");
                // We don't block the UI here immediately to allow the "Please Verify" message to be shown in handleAuth
                // But if they refresh, we should probably show a "Verify your email" state or sign them out.
                // For this flow, we will sign them out if they try to access the app without verification.
                // However, to avoid infinite loops, we check if we just signed up.
                return;
            }

            // 2. Fetch Role from Firestore
            // RETRY LOGIC: Wait a moment for the profile to be created if it's a new user
            let userDoc = await db.collection('users').doc(user.uid).get();
            let attempts = 0;
            while (!userDoc.exists && attempts < 3) {
                await new Promise(r => setTimeout(r, 500)); // Wait 500ms
                userDoc = await db.collection('users').doc(user.uid).get();
                attempts++;
            }

            if (userDoc.exists) {
                const userData = userDoc.data();
                currentUserRole = userData.role || 'student';
                currentUserData = {
                    name: userData.name || 'Student',
                    email: user.email,
                    role: currentUserRole
                };
                showNotification(`Welcome back, ${userData.name || 'Student'}`, "success");
            } else {
                // Fallback
                currentUserRole = 'student';
                currentUserData = {
                    name: 'Student',
                    email: user.email,
                    role: 'student'
                };
            }

            updateUIForRole(currentUserRole);
            updateUserProfileDropdown();

            // HIDE LOADING SCREEN / LOGIN MODAL
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.classList.add('opacity-0');
                setTimeout(() => loadingScreen.classList.add('hidden'), 500);
            }
            document.getElementById('login-modal').classList.add('hidden');

            // Load Data (Real-time Listeners)
            subscribeToTopics();
            subscribeToSessions();
            subscribeToInbox();
            renderMentors();

            // SCROLL FIX: Force top
            window.scrollTo(0, 0);

        } else {
            console.log("User logged out");

            // HIDE LOADING SCREEN -> SHOW LOGIN
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.classList.add('opacity-0');
                setTimeout(() => loadingScreen.classList.add('hidden'), 500);
            }
            document.getElementById('login-modal').classList.remove('hidden');

            updateUIForRole(null);
        }
    });
});

function initTheme() {
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
// 3. NAVIGATION
// ==========================================

function showSection(sectionId) {
    if (window.location.hash.substring(1) !== sectionId) {
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
    if (target) {
        target.classList.add('active');
        target.classList.remove('hidden');
    }
    window.scrollTo(0, 0);
    updateNavState(targetId);
}

function updateNavState(activeId) {
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
    // Remove the class that pushes it down (so it slides UP)
    notif.classList.remove('translate-y-24', 'opacity-0');

    setTimeout(() => {
        // Add the class back to push it down again
        notif.classList.add('translate-y-24', 'opacity-0');
    }, 3000);
}

function openModal(id) {
    document.getElementById(id).classList.remove('hidden');
    document.getElementById(id).classList.add('flex');
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}


// ==========================================
// 4. TOPICS & ADMIN LOGIC
// ==========================================

const availableIcons = ["fa-lightbulb", "fa-heart-pulse", "fa-brain", "fa-user-nurse", "fa-coffee", "fa-bed", "fa-stopwatch", "fa-users", "fa-book-open", "fa-hand-holding-heart"];
const availableColors = [
    { name: "teal", hex: "bg-teal-500", light: "bg-teal-100", text: "text-teal-600" },
    { name: "blue", hex: "bg-blue-500", light: "bg-blue-100", text: "text-blue-600" },
    { name: "indigo", hex: "bg-indigo-500", light: "bg-indigo-100", text: "text-indigo-600" },
    { name: "purple", hex: "bg-purple-500", light: "bg-purple-100", text: "text-purple-600" },
    { name: "rose", hex: "bg-rose-500", light: "bg-rose-100", text: "text-rose-600" },
    { name: "amber", hex: "bg-amber-500", light: "bg-amber-100", text: "text-amber-600" }
];

function subscribeToTopics() {
    db.collection('topics').onSnapshot((snapshot) => {
        // Spread data first, then override with doc.id to ensure Firestore ID is used
        topicsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        renderTopics();
        updateDashboard();
    });
}

function renderTopics() {
    const container = document.getElementById('topics-container');
    if (!container) return;

    if (topicsData.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-10 text-slate-400">No topics found. Admin can add one.</div>`;
        return;
    }

    container.innerHTML = topicsData.map(topic => {
        const theme = availableColors.find(c => c.name === topic.color) || availableColors[0];
        // Use doc ID for deletion
        let adminControls = currentUserRole === 'admin'
            ? `<button onclick="deleteTopic(event, '${topic.id}')" class="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition z-20"><i class="fas fa-trash-alt"></i></button>`
            : "";

        return `
            <div onclick="openTopicModal('${topic.id}')" class="cursor-pointer bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative">
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

async function handleAddTopic(event) {
    event.preventDefault();

    const title = document.getElementById('new-topic-title').value;
    const desc = document.getElementById('new-topic-desc').value;
    const color = document.getElementById('selected-color').value;
    const icon = document.getElementById('selected-icon').value;
    const intro = document.getElementById('new-content-intro').value || desc;
    const bulletsRaw = document.getElementById('new-content-bullets').value;
    const action = document.getElementById('new-content-action').value;

    const bullets = bulletsRaw ? bulletsRaw.split('\n').filter(line => line.trim() !== '') : [];

    try {
        await db.collection('topics').add({
            title, desc, color, icon,
            content: { intro, bullets, action },
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        event.target.reset();
        document.getElementById('admin-add-topic').classList.add('hidden');
        showNotification("New Guide Published!", "success");
    } catch (error) {
        console.error("Error adding topic: ", error);
        alert("Failed to add topic.");
    }
}

async function deleteTopic(event, id) {
    event.stopPropagation();
    if (confirm("Delete this topic?")) {
        try {
            await db.collection('topics').doc(id).delete();
            showNotification("Topic deleted.", "success");
        } catch (error) {
            console.error("Error deleting topic: ", error);
            alert("Failed to delete topic.");
        }
    }
}

// ==========================================
// SUGGEST TOPIC FEATURE
// ==========================================

function openSuggestTopicModal() {
    const modal = document.getElementById('suggest-topic-modal');
    const form = document.getElementById('suggest-topic-form');
    const success = document.getElementById('suggest-topic-success');
    
    if (modal) {
        // Reset to form state
        if (form) form.classList.remove('hidden');
        if (success) success.classList.add('hidden');
        
        // Pre-fill email if user is logged in
        const emailInput = document.getElementById('suggest-topic-email');
        if (emailInput && currentUserData && currentUserData.email) {
            emailInput.value = currentUserData.email;
        }
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function closeSuggestTopicModal() {
    const modal = document.getElementById('suggest-topic-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        
        // Reset form
        const form = document.getElementById('suggest-topic-form');
        if (form) form.reset();
    }
}

async function handleSuggestTopic(event) {
    event.preventDefault();
    
    const title = document.getElementById('suggest-topic-title').value.trim();
    const reason = document.getElementById('suggest-topic-reason').value.trim();
    const email = document.getElementById('suggest-topic-email').value.trim();
    
    if (!title) {
        showNotification("Please enter a topic title", "error");
        return;
    }
    
    try {
        // Store suggestion in Firestore
        await db.collection('topic_suggestions').add({
            title: title,
            reason: reason || null,
            email: email || null,
            submittedBy: currentUserData ? currentUserData.name : 'Anonymous',
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Show success state
        const form = document.getElementById('suggest-topic-form');
        const success = document.getElementById('suggest-topic-success');
        
        if (form) form.classList.add('hidden');
        if (success) success.classList.remove('hidden');
        
        showNotification("Topic suggestion submitted!", "success");
        
    } catch (error) {
        console.error("Error submitting suggestion:", error);
        showNotification("Failed to submit. Please try again.", "error");
    }
}

function openTopicModal(id) {
    const topic = topicsData.find(t => String(t.id) === String(id));

    if (!topic) {
        showNotification("Topic not found", "error");
        return;
    }

    const theme = availableColors.find(c => c.name === topic.color) || availableColors[0];
    showDynamicModal(topic, theme);
}

// Creates a dynamic modal overlay for displaying topic details
function showDynamicModal(topic, theme) {
    // Remove any existing dynamic modal
    document.getElementById('dynamic-topic-modal')?.remove();
    
    // Detect dark mode
    const isDark = document.documentElement.classList.contains('dark');
    
    // Theme-aware colors
    const colors = {
        bg: isDark ? '#1e293b' : '#ffffff',
        text: isDark ? '#f1f5f9' : '#1e293b',
        textMuted: isDark ? '#94a3b8' : '#475569',
        border: isDark ? '#334155' : '#e2e8f0',
        btnBg: isDark ? '#334155' : '#f1f5f9',
        btnText: isDark ? '#f1f5f9' : '#475569',
        actionBg: isDark ? 'rgba(20, 184, 166, 0.15)' : '#f0fdfa',
        iconBg: isDark ? 'rgba(20, 184, 166, 0.2)' : '#ccfbf1'
    };
    
    // Get header color based on theme
    const headerColor = theme.hex.includes('teal') ? '#14b8a6' : 
                        theme.hex.includes('blue') ? '#3b82f6' : 
                        theme.hex.includes('purple') ? '#a855f7' : 
                        theme.hex.includes('rose') ? '#f43f5e' : 
                        theme.hex.includes('amber') ? '#f59e0b' : '#6366f1';
    
    const iconColor = theme.text.includes('teal') ? '#14b8a6' : 
                      theme.text.includes('blue') ? '#3b82f6' : 
                      theme.text.includes('purple') ? '#a855f7' : '#14b8a6';
    
    const content = topic.content || {};
    
    // Build bullets HTML
    let bulletsHTML = '';
    if (content.bullets && content.bullets.length > 0) {
        bulletsHTML = `
            <div style="margin-bottom: 1.5rem;">
                <h4 style="font-weight: 600; color: ${colors.text}; margin-bottom: 0.5rem;">Key Signs & Strategies</h4>
                <ul style="list-style: disc; padding-left: 1.25rem; color: ${colors.textMuted}; display: flex; flex-direction: column; gap: 0.25rem;">
                    ${content.bullets.map(b => `<li>${escapeHTML(b)}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    // Build action box HTML
    let actionHTML = '';
    if (content.action) {
        actionHTML = `
            <div style="background: ${colors.actionBg}; padding: 1rem; border-radius: 0.75rem; border-left: 4px solid ${headerColor};">
                <h4 style="color: ${iconColor}; font-weight: 600; margin-bottom: 0.25rem;">Try This:</h4>
                <p style="color: ${colors.textMuted};">${escapeHTML(content.action)}</p>
            </div>
        `;
    }
    
    // Create the modal overlay
    const overlay = document.createElement('div');
    overlay.id = 'dynamic-topic-modal';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(15, 23, 42, 0.8);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 1rem;
    `;
    overlay.onclick = (e) => {
        if (e.target === overlay) closeDynamicModal();
    };
    
    // Create the modal content
    overlay.innerHTML = `
        <div style="background: ${colors.bg}; border-radius: 1rem; width: 100%; max-width: 32rem; max-height: 85vh; overflow-y: auto; position: relative; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
            
            <!-- Header bar -->
            <div style="height: 1rem; width: 100%; background: ${headerColor}; border-radius: 1rem 1rem 0 0;"></div>
            
            <!-- Close button -->
            <button onclick="closeDynamicModal()" style="position: absolute; top: 1.5rem; right: 1rem; width: 2rem; height: 2rem; border-radius: 50%; background: ${colors.btnBg}; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: ${colors.textMuted}; font-size: 1rem; transition: all 0.2s;" onmouseover="this.style.background='#fef2f2'; this.style.color='#ef4444';" onmouseout="this.style.background='${colors.btnBg}'; this.style.color='${colors.textMuted}';">
                <i class="fas fa-times"></i>
            </button>
            
            <!-- Content -->
            <div style="padding: 1.5rem 2rem;">
                <!-- Title with icon -->
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem;">
                    <div style="width: 3rem; height: 3rem; border-radius: 0.75rem; background: ${colors.iconBg}; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; color: ${iconColor};">
                        <i class="fas ${topic.icon}"></i>
                    </div>
                    <h2 style="font-size: 1.5rem; font-weight: bold; color: ${colors.text};">${escapeHTML(topic.title)}</h2>
                </div>
                
                <!-- Intro text -->
                <p style="color: ${colors.textMuted}; margin-bottom: 1.5rem; line-height: 1.6;">
                    ${escapeHTML(content.intro || topic.desc || 'No description available.')}
                </p>
                
                ${bulletsHTML}
                ${actionHTML}
                
                <!-- Footer -->
                <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid ${colors.border}; text-align: right;">
                    <button onclick="closeDynamicModal()" style="padding: 0.5rem 1.5rem; background: ${colors.btnBg}; color: ${colors.btnText}; border: none; border-radius: 0.5rem; font-weight: 500; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.opacity='0.8';" onmouseout="this.style.opacity='1';">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

function closeDynamicModal() {
    document.getElementById('dynamic-topic-modal')?.remove();
}

function initAdminPickers() {
    const iconContainer = document.getElementById('icon-selector');
    if (iconContainer.innerHTML === "") {
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
// 5. MENTOR DIRECTORY (Updated with Contact Modal)
// ==========================================

function renderMentors(filter = 'all') {
    const container = document.getElementById('mentors-container');
    if (!container) return;

    const filtered = filter === 'all'
        ? mentorsData
        : mentorsData.filter(m => m.tags.includes(filter) || m.year === filter);

    if (filtered.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-10 text-slate-400">No mentors found for this filter.</div>`;
        return;
    }

    // OPTIMIZATION: Use map/join
    container.innerHTML = filtered.map(m => `
        <article class="bg-white dark:bg-slate-800 rounded-2xl border border-teal-100 dark:border-slate-700 shadow-sm hover:shadow-md transition flex flex-col justify-between p-6 animate-[fadeIn_0.3s_ease-out]">
            <header class="flex items-center justify-between mb-4">
                <div class="flex items-center">
                    <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mr-3">
                        <i class="fas fa-user-nurse text-slate-400"></i>
                    </div>
                    <div>
                        <h3 class="font-semibold text-slate-800 dark:text-white">${escapeHTML(m.name)}</h3>
                        <p class="text-xs text-slate-500 dark:text-slate-400">${escapeHTML(m.year)}</p>
                    </div>
                </div>
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            </header>
            <p class="text-sm text-slate-600 dark:text-slate-300 italic mb-4">"${escapeHTML(m.quote)}"</p>
            <div class="flex flex-wrap gap-2 mb-4">
                ${m.tags.map(tag => `<span class="px-2 py-1 text-xs rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">${tag}</span>`).join('')}
            </div>
            <button onclick="showMentorEmail('${escapeHTML(m.email)}', '${escapeHTML(m.name)}')" class="mt-auto w-full border border-teal-500 text-teal-700 dark:text-teal-400 rounded-full py-2 text-sm font-semibold hover:bg-teal-500 hover:text-white transition flex items-center justify-center gap-2">
                <i class="far fa-envelope"></i> Contact Mentor
            </button>
        </article>
    `).join('');
}

// --- NEW HELPER FUNCTIONS FOR MODAL ---

function showMentorEmail(mentorEmail, mentorName) {
    const emailDisplay = document.getElementById('mentor-email-display');
    const emailText = document.getElementById('mentor-email-text');
    const emailName = document.getElementById('mentor-email-name');
    const modal = document.getElementById('mentor-email-modal');

    // Populate data
    emailName.textContent = mentorName;
    emailText.value = mentorEmail;
    emailDisplay.textContent = mentorEmail;

    // Reset copy button text
    document.getElementById('mentor-copy-button').innerHTML = '<i class="fas fa-copy mr-2"></i> Copy Email';

    // Show modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeMentorEmailModal() {
    const modal = document.getElementById('mentor-email-modal');
    modal.classList.remove('flex');
    modal.classList.add('hidden');
}

function copyMentorEmail() {
    const emailText = document.getElementById('mentor-email-text');

    // Select and Copy
    emailText.select();
    emailText.setSelectionRange(0, 99999); // Mobile fix
    navigator.clipboard.writeText(emailText.value).then(() => {
        // Visual Feedback
        const copyButton = document.getElementById('mentor-copy-button');
        copyButton.innerHTML = '<i class="fas fa-check mr-2"></i> Copied!';
        setTimeout(() => {
            copyButton.innerHTML = '<i class="fas fa-copy mr-2"></i> Copy Email';
        }, 2000);
    });
}

function filterMentors(category, btn) {
    renderMentors(category);

    // Update UI Buttons
    if (btn) {
        const buttons = document.querySelectorAll('.mentor-filter-btn');

        // Inactive Classes
        const inactiveClass = "mentor-filter-btn px-4 py-1.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium hover:border-teal-500 transition cursor-pointer";
        // Active Classes
        const activeClass = "mentor-filter-btn px-4 py-1.5 bg-teal-600 text-white rounded-full text-sm font-medium shadow-md hover:bg-teal-700 transition cursor-pointer";

        buttons.forEach(b => b.className = inactiveClass);
        btn.className = activeClass;
    }
}


// ==========================================
// 6. SESSIONS
// ==========================================

function subscribeToSessions() {
    db.collection('sessions').orderBy('date', 'asc').onSnapshot((snapshot) => {
        sessionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderSessions();
        updateDashboard();
    });
}

// Helper function to get session status
function getSessionStatus(session) {
    const now = new Date();
    const sessionDate = new Date(session.date);
    
    // Parse time (e.g., "13:00" or "1:00 PM")
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

function renderSessions() {
    const container = document.getElementById('sessions-container');
    if (!container) return;

    if (sessionsData.length === 0) {
        container.innerHTML = `<div class="p-8 text-center text-slate-400">No upcoming sessions scheduled.</div>`;
        return;
    }

    container.innerHTML = sessionsData.map(session => {
        const dateObj = new Date(session.date);
        const day = dateObj.getDate();
        const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
        
        // Get session status
        const sessionStatus = getSessionStatus(session);

        // --- ICON LOGIC FIXED ---
        let platformLogo = '';

        if (session.platform === 'Google Meet') {
            platformLogo = `<img src="google-meet.svg" alt="Meet" class="w-5 h-5 mr-2 inline-block">`;
        } else if (session.platform === 'Zoom') {
            platformLogo = `<i class="fas fa-video mr-2 text-blue-500 text-lg"></i>`;
        } else if (session.platform === 'Microsoft Teams') {
            platformLogo = `<i class="fas fa-users-rectangle mr-2 text-indigo-500 text-lg"></i>`;
        } else {
            platformLogo = `<i class="fas fa-video mr-2 text-slate-400"></i>`;
        }

        let adminControls = currentUserRole === 'admin'
            ? `<button onclick="deleteSession('${session.id}')" class="text-slate-300 hover:text-red-500 ml-2 transition"><i class="fas fa-trash-alt"></i></button>`
            : "";
        
        // Determine button based on status
        let actionButton = '';
        if (sessionStatus.status === 'past') {
            actionButton = `<span class="px-5 py-2 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg text-sm font-medium cursor-not-allowed">Ended</span>`;
        } else if (sessionStatus.status === 'live') {
            actionButton = `<a href="${session.link}" target="_blank" class="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition shadow-md animate-pulse flex items-center gap-2"><span class="w-2 h-2 bg-white rounded-full"></span>Join Live</a>`;
        } else {
            actionButton = `<a href="${session.link}" target="_blank" class="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold hover:opacity-90 transition shadow-md">Join</a>`;
        }

        return `
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition items-center group ${sessionStatus.status === 'past' ? 'opacity-60' : ''}">
            <div class="md:col-span-2 flex items-center gap-3">
                <div class="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl p-2 w-14 text-center border border-slate-200 dark:border-slate-600 relative">
                    <div class="text-[10px] uppercase tracking-wider">${month}</div>
                    <div class="text-xl leading-none">${day}</div>
                </div>
                <div class="text-sm text-slate-500 dark:text-slate-400">
                    ${session.time}<br><span class="text-xs opacity-70">${session.duration}m</span>
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
                <div class="flex items-center text-slate-700 dark:text-slate-300 mb-1"><i class="fas fa-user-circle mr-2 text-slate-400"></i> ${escapeHTML(session.host)}</div>
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
}

async function handleAddSession(e) {
    e.preventDefault();
    const newSession = {
        title: document.getElementById('new-session-title').value,
        host: document.getElementById('new-session-host').value,
        date: document.getElementById('new-session-date').value,
        time: document.getElementById('new-session-time').value,
        duration: document.getElementById('new-session-duration').value,
        platform: document.getElementById('new-session-platform').value,
        tag: document.getElementById('new-session-tag').value,
        link: document.getElementById('new-session-link').value,
        desc: document.getElementById('new-session-desc').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection('sessions').add(newSession);
        e.target.reset();
        document.getElementById('admin-add-session').classList.add('hidden');
        showNotification("Session Scheduled!", "success");
    } catch (error) {
        console.error("Error adding session: ", error);
        alert("Failed to add session.");
    }
}

async function deleteSession(id) {
    if (confirm("Cancel and delete this session?")) {
        try {
            await db.collection('sessions').doc(id).delete();
            showNotification("Session cancelled.", "success");
        } catch (error) {
            console.error("Error deleting session: ", error);
            alert("Failed to delete session.");
        }
    }
}


// ==========================================
// 7. MESSAGES & BOOKING
// ==========================================

async function handleBooking(e) {
    e.preventDefault();

    // 1. Grab Inputs
    const name = document.getElementById('chat-name').value;
    const email = document.getElementById('chat-email') ? document.getElementById('chat-email').value : "no-email@test.com";
    const year = document.getElementById('chat-year').value;
    const topic = document.getElementById('chat-topic').value;

    // 2. VALIDATION
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (document.getElementById('chat-email') && !emailRegex.test(email)) {
        alert("Please enter a valid student email address.");
        return;
    }

    // 3. STORE MESSAGE (FIRESTORE)
    try {
        await db.collection('requests').add({
            name, year, topic, email,
            time: "Anytime",
            status: "pending",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // 4. TOGGLE UI
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

function resetChatForm() {
    document.getElementById('chat-success-container').classList.add('hidden');
    document.getElementById('chat-success-container').classList.remove('flex');
    document.getElementById('chat-form-container').classList.remove('hidden');
    document.querySelector('#chat-form-container form').reset();
}

function subscribeToInbox() {
    // Only listen if user is peer or admin to save reads, but for MVP we listen always or check role
    // Ideally: if (currentUserRole === 'peer' || currentUserRole === 'admin') ...

    db.collection('requests').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
        peerMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderInbox();
        updateDashboard();
    });
}

function renderInbox() {
    const container = document.getElementById('inbox-container');
    if (!container) return;
    const activeMessages = peerMessages.filter(msg => msg.status === 'pending');

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
            <div class="flex-1 flex justify-end items-center"><button onclick="acceptRequest('${msg.id}')" class="bg-teal-600 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-teal-700 transition">Accept</button></div>
        </div>`).join('');
}

async function acceptRequest(id) {
    try {
        await db.collection('requests').doc(id).update({
            status: 'accepted',
            acceptedBy: auth.currentUser ? auth.currentUser.uid : 'anonymous',
            acceptedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        showNotification("Request Accepted!", "success");
    } catch (error) {
        console.error("Error accepting request:", error);
        alert("Failed to accept request.");
    }
}


// ==========================================
// 8. DASHBOARD & AUTH
// ==========================================

function updateDashboard() {
    const statTopics = document.getElementById('stat-topics');
    const statRequests = document.getElementById('stat-requests');
    const statRequestsSub = document.getElementById('stat-requests-sub');
    const statSessions = document.getElementById('stat-sessions');

    if (statTopics) statTopics.textContent = topicsData.length;
    if (statRequests) statRequests.textContent = peerMessages.length;
    if (statRequestsSub) statRequestsSub.textContent = peerMessages.filter(m => m.status === 'pending').length;
    if (statSessions) statSessions.textContent = sessionsData.length;
}

// --- AUTH UI LOGIC ---
let currentAuthMode = 'LOGIN'; // 'LOGIN', 'SIGNUP', 'RESET'

function setAuthMode(mode) {
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

    // Reset visibility
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

        nameField.classList.remove('hidden'); // Show Name

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

        passField.classList.add('hidden'); // Hide Password
        forgotBtn.classList.add('hidden'); // Hide Forgot Link
        guestBtn.classList.add('hidden'); // Hide Guest Button

        toggleText.textContent = "Remembered your password?";
        toggleBtn.textContent = "Back to Login";
        toggleBtn.onclick = () => setAuthMode('LOGIN');
    }
}

function toggleAuthMode() {
    // Legacy support or default toggle
    if (currentAuthMode === 'LOGIN') setAuthMode('SIGNUP');
    else setAuthMode('LOGIN');
}

async function handleAuth(e) {
    e.preventDefault();
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const name = document.getElementById('auth-name').value;
    const btn = document.getElementById('auth-submit-btn');

    // DOMAIN RESTRICTION
    if (!email.endsWith('@rakmhsu.ac.ae')) {
        alert("Access Restricted: Please use your university email (@rakmhsu.ac.ae).");
        return;
    }

    btn.disabled = true;
    btn.textContent = "Processing...";

    try {
        if (currentAuthMode === 'SIGNUP') {
            // SIGN UP
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Create User Profile in Firestore
            await db.collection('users').doc(user.uid).set({
                name: name,
                email: email,
                role: 'student', // Default role
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // SEND VERIFICATION EMAIL
            await user.sendEmailVerification();

            alert("Account created! A verification email has been sent to " + email + ". Please verify your email before logging in.");
            await auth.signOut();
            setAuthMode('LOGIN');

        } else if (currentAuthMode === 'LOGIN') {
            // SIGN IN
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
            // RESET PASSWORD
            await auth.sendPasswordResetEmail(email);
            alert("Password reset email sent! Check your inbox.");
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

// --- DEV ONLY: GUEST MODE ---
function loginAsGuest() {
    console.log("Logging in as Guest (Dev Mode)");
    currentUserRole = 'guest';
    currentUserData = {
        name: 'Guest User',
        email: 'guest@demo.com',
        role: 'guest'
    };

    // Hide UI
    document.getElementById('login-modal').classList.add('hidden');
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) loadingScreen.classList.add('hidden');

    // Update UI
    updateUIForRole(currentUserRole);
    updateUserProfileDropdown();
    showNotification("Guest Mode Active (Dev)", "success");

    // Load Data manually (Firestore Test Mode required)
    subscribeToTopics();
    subscribeToSessions();
    subscribeToInbox();
    renderMentors();
}

function updateUIForRole(role) {
    const navAdmin = document.getElementById('nav-admin-link');
    const navPeer = document.getElementById('nav-peer-link');
    const mobAdmin = document.getElementById('mobile-admin-link');
    const mobPeer = document.getElementById('mobile-peer-link');
    const adminControls = document.getElementById('admin-controls-btn');
    const sessionControls = document.getElementById('admin-session-controls');
    const profileDropdown = document.getElementById('user-profile-dropdown');

    // Hide all privileged elements first
    [navAdmin, navPeer, mobAdmin, mobPeer, adminControls, sessionControls].forEach(el => el && el.classList.add('hidden'));

    if (!role) {
        if (profileDropdown) profileDropdown.classList.add('hidden');
        return;
    }

    // Show profile dropdown when logged in
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
        renderInbox(); // Will need refactor later
        showNotification("Peer Mentor Access Granted", "success");
    }
}

// Update user profile dropdown with current user info
function updateUserProfileDropdown() {
    if (!currentUserData) return;
    
    const userAvatar = document.getElementById('user-avatar');
    const userDisplayName = document.getElementById('user-display-name');
    const dropdownName = document.getElementById('dropdown-user-name');
    const dropdownEmail = document.getElementById('dropdown-user-email');
    const dropdownRole = document.getElementById('dropdown-user-role');
    
    // Get initials for avatar
    const initials = currentUserData.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    
    if (userAvatar) userAvatar.textContent = initials;
    if (userDisplayName) userDisplayName.textContent = currentUserData.name.split(' ')[0];
    if (dropdownName) dropdownName.textContent = currentUserData.name;
    if (dropdownEmail) dropdownEmail.textContent = currentUserData.email;
    
    if (dropdownRole) {
        const roleLabels = {
            admin: { label: 'Administrator', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
            peer: { label: 'Peer Mentor', class: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
            student: { label: 'Student', class: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
            guest: { label: 'Guest', class: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' }
        };
        const roleInfo = roleLabels[currentUserData.role] || roleLabels.student;
        dropdownRole.textContent = roleInfo.label;
        dropdownRole.className = `inline-flex items-center mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${roleInfo.class}`;
    }
}

// Toggle profile dropdown visibility
function toggleProfileDropdown() {
    const menu = document.getElementById('profile-dropdown-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('user-profile-dropdown');
    const menu = document.getElementById('profile-dropdown-menu');
    if (dropdown && menu && !dropdown.contains(e.target)) {
        menu.classList.add('hidden');
    }
});

function logout() {
    auth.signOut().then(() => {
        showNotification("Logged Out", "success");
        window.location.reload();
    });
}


// ==========================================
// 9. BREATHING WIDGET
// ==========================================

let isBreathing = false;
let breathingTimeouts = [];

function toggleBreathing() {
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
// 10. PWA SERVICE WORKER REGISTRATION
// ==========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker Registered'))
            .catch(err => console.log('Service Worker Failed:', err));
    });
}