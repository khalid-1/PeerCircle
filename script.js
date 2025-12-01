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
let mentorOverrides = {}; // Store edited mentor details (keyed by email)
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
                    role: currentUserRole,
                    photoURL: userData.photoURL || null
                };
                showNotification(`Welcome back, ${userData.name || 'Student'}`, "success");
            } else {
                // Fallback
                currentUserRole = 'student';
                currentUserData = {
                    name: 'Student',
                    email: user.email,
                    role: 'student',
                    photoURL: null
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
            subscribeToTopics();
            subscribeToSessions();
            subscribeToInbox();
            fetchMentorOverrides(); // Fetch dynamic mentor data
            // renderMentors(); // Will be called after fetch

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

            // Even if logged out (or guest), try to fetch mentor overrides
            // This allows guests to see the public mentor profiles
            fetchMentorOverrides();

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
            // Active State
            link.classList.add('bg-teal-50', 'dark:bg-teal-900/30', 'text-teal-700', 'dark:text-teal-300');
            link.classList.remove('text-slate-600', 'dark:text-slate-300');
        } else {
            // Inactive State
            link.classList.remove('bg-teal-50', 'dark:bg-teal-900/30', 'text-teal-700', 'dark:text-teal-300');
            link.classList.add('text-slate-600', 'dark:text-slate-300');
        }
    });
}

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1) || 'home';
    renderSection(hash);
});

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const icon = document.querySelector('#mobile-menu-btn i');

    if (menu) {
        // Toggle Visibility and Animation
        if (menu.classList.contains('hidden')) {
            // Open Menu
            menu.classList.remove('hidden');
            // Small delay to allow display:block to apply before transition
            setTimeout(() => {
                menu.classList.remove('translate-x-full');
            }, 10);

            // Icon to X
            if (icon) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            }
        } else {
            // Close Menu
            menu.classList.add('translate-x-full');

            // Wait for transition to finish before hiding
            setTimeout(() => {
                menu.classList.add('hidden');
            }, 300); // Match duration-300

            // Icon to Bars
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
    }
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
    // Remove any existing modal
    document.getElementById('dynamic-suggest-modal')?.remove();

    const isDark = document.documentElement.classList.contains('dark');

    const colors = {
        bg: isDark ? '#1e293b' : '#ffffff',
        text: isDark ? '#f1f5f9' : '#1e293b',
        textMuted: isDark ? '#94a3b8' : '#64748b',
        inputBg: isDark ? '#334155' : '#f8fafc',
        inputBorder: isDark ? '#475569' : '#cbd5e1',
        border: isDark ? '#475569' : '#e2e8f0'
    };

    const prefillEmail = currentUserData && currentUserData.email ? currentUserData.email : '';

    const overlay = document.createElement('div');
    overlay.id = 'dynamic-suggest-modal';
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
        if (e.target === overlay) closeSuggestTopicModal();
    };

    overlay.innerHTML = `
        <div style="background: ${colors.bg}; border-radius: 1rem; max-width: 28rem; width: 100%; position: relative; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #14b8a6, #10b981); padding: 1.5rem; color: white;">
                <button onclick="closeSuggestTopicModal()" style="position: absolute; top: 1rem; right: 1rem; width: 2rem; height: 2rem; border-radius: 50%; background: rgba(255,255,255,0.2); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white;">
                    <i class="fas fa-times"></i>
                </button>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 3rem; height: 3rem; border-radius: 0.75rem; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                        <i class="fas fa-lightbulb"></i>
                    </div>
                    <div>
                        <h2 style="font-size: 1.25rem; font-weight: bold; margin: 0;">Suggest a Topic</h2>
                        <p style="font-size: 0.875rem; opacity: 0.9; margin: 0;">Help us improve the library</p>
                    </div>
                </div>
            </div>
            
            <!-- Form -->
            <div id="suggest-form-container" style="padding: 1.5rem;">
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; font-size: 0.75rem; font-weight: 700; color: ${colors.textMuted}; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Topic Title *</label>
                    <input type="text" id="dyn-suggest-title" placeholder="e.g. Managing Clinical Anxiety" required style="width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid ${colors.inputBorder}; background: ${colors.inputBg}; color: ${colors.text}; outline: none; box-sizing: border-box;">
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; font-size: 0.75rem; font-weight: 700; color: ${colors.textMuted}; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Why is this important?</label>
                    <textarea id="dyn-suggest-reason" placeholder="Tell us why this topic would help nursing students..." rows="3" style="width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid ${colors.inputBorder}; background: ${colors.inputBg}; color: ${colors.text}; outline: none; resize: none; box-sizing: border-box;"></textarea>
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; font-size: 0.75rem; font-weight: 700; color: ${colors.textMuted}; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Your Email (Optional)</label>
                    <input type="email" id="dyn-suggest-email" placeholder="To be notified when published" value="${prefillEmail}" style="width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid ${colors.inputBorder}; background: ${colors.inputBg}; color: ${colors.text}; outline: none; box-sizing: border-box;">
                </div>
                
                <button onclick="submitSuggestTopic()" style="width: 100%; background: #14b8a6; color: white; padding: 0.875rem; border-radius: 0.75rem; font-weight: bold; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                    <i class="fas fa-paper-plane"></i> Submit Suggestion
                </button>
                
                <p style="text-align: center; font-size: 0.75rem; color: ${colors.textMuted}; margin-top: 1rem;">Your suggestion will be reviewed by our team</p>
            </div>
            
            <!-- Success State -->
            <div id="suggest-success-container" style="display: none; padding: 2rem; text-align: center;">
                <div style="width: 4rem; height: 4rem; border-radius: 50%; background: ${isDark ? 'rgba(16, 185, 129, 0.2)' : '#d1fae5'}; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: #10b981; font-size: 2rem;">
                    <i class="fas fa-check"></i>
                </div>
                <h3 style="font-size: 1.25rem; font-weight: bold; color: ${colors.text}; margin-bottom: 0.5rem;">Thank You!</h3>
                <p style="color: ${colors.textMuted}; margin-bottom: 1.5rem;">Your topic suggestion has been submitted. We appreciate your input!</p>
                <button onclick="closeSuggestTopicModal()" style="padding: 0.5rem 1.5rem; background: ${colors.inputBg}; color: ${colors.text}; border-radius: 0.5rem; font-weight: 500; border: 1px solid ${colors.border}; cursor: pointer;">
                    Close
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
}

function closeSuggestTopicModal() {
    document.getElementById('dynamic-suggest-modal')?.remove();
}

async function submitSuggestTopic() {
    const title = document.getElementById('dyn-suggest-title')?.value.trim();
    const reason = document.getElementById('dyn-suggest-reason')?.value.trim();
    const email = document.getElementById('dyn-suggest-email')?.value.trim();

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
        const form = document.getElementById('suggest-form-container');
        const success = document.getElementById('suggest-success-container');

        if (form) form.style.display = 'none';
        if (success) success.style.display = 'block';

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

// ==================== PROFILE PICTURE UPLOAD & CROP ====================

function openProfilePictureModal() {
    // Remove any existing modal
    document.getElementById('profile-picture-modal')?.remove();

    const isDark = document.documentElement.classList.contains('dark');
    const currentAvatar = currentUserData?.photoURL || null;

    // Theme colors
    const colors = {
        bg: isDark ? '#1e293b' : '#ffffff',
        text: isDark ? '#f1f5f9' : '#1e293b',
        textMuted: isDark ? '#94a3b8' : '#64748b',
        border: isDark ? '#334155' : '#e2e8f0',
        btnBg: isDark ? '#334155' : '#f1f5f9',
        btnText: isDark ? '#f1f5f9' : '#475569',
        primary: '#14b8a6', // Teal-500
        primaryHover: '#0d9488', // Teal-600
        danger: '#ef4444'
    };

    const overlay = document.createElement('div');
    overlay.id = 'profile-picture-modal';
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
        z-index: 10000;
        padding: 1rem;
    `;

    overlay.innerHTML = `
        <div style="background: ${colors.bg}; border-radius: 1.5rem; width: 100%; max-width: 28rem; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); border: 1px solid ${colors.border};">
            
            <!-- Upload Step -->
            <div id="profile-upload-step" style="display: flex; flex-direction: column;">
                <!-- Header -->
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid ${colors.border};">
                    <h2 style="color: ${colors.text}; font-size: 1.125rem; font-weight: 700; margin: 0;">Edit Profile Photo</h2>
                    <button onclick="closeProfilePictureModal()" style="background: none; border: none; color: ${colors.textMuted}; font-size: 1.125rem; cursor: pointer; padding: 0.25rem; display: flex; align-items: center; justify-content: center; transition: color 0.2s;" onmouseover="this.style.color='${colors.danger}'" onmouseout="this.style.color='${colors.textMuted}'">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <!-- Content -->
                <div style="padding: 2rem; display: flex; flex-direction: column; align-items: center;">
                    <!-- Current Photo -->
                    <div style="width: 8rem; height: 8rem; border-radius: 50%; background: ${colors.btnBg}; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 4px solid ${colors.bg}; box-shadow: 0 0 0 2px ${colors.primary}; margin-bottom: 1.5rem;">
                        ${currentAvatar
            ? `<img src="${currentAvatar}" style="width: 100%; height: 100%; object-fit: cover;">`
            : `<span style="font-size: 2.5rem; font-weight: 700; color: ${colors.primary};">${getInitials(currentUserData?.name || 'U')}</span>`
        }
                    </div>
                    
                    <h3 style="color: ${colors.text}; font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem;">${currentUserData?.name || 'User'}</h3>
                    <p style="color: ${colors.textMuted}; font-size: 0.875rem; margin-bottom: 2rem;">${currentUserData?.email || 'user@rakmhsu.ac.ae'}</p>
                    
                    <!-- Buttons -->
                    <div style="width: 100%; display: flex; flex-direction: column; gap: 0.75rem;">
                        <label style="display: flex; align-items: center; justify-content: center; width: 100%; padding: 0.875rem; background: ${colors.primary}; color: white; border-radius: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(20, 184, 166, 0.2);" onmouseover="this.style.background='${colors.primaryHover}'; this.style.transform='translateY(-1px)'" onmouseout="this.style.background='${colors.primary}'; this.style.transform='translateY(0)'">
                            <input type="file" id="profile-file-input" accept="image/*" style="display: none;" onchange="handleProfileImageSelect(event)">
                            <i class="fas fa-camera" style="margin-right: 0.5rem;"></i> Upload New Photo
                        </label>
                        
                        ${currentAvatar ? `
                            <button onclick="removeProfilePicture()" style="width: 100%; padding: 0.875rem; background: transparent; color: ${colors.danger}; border: 1px solid ${colors.border}; border-radius: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;" onmouseover="this.style.background='${isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2'}'" onmouseout="this.style.background='transparent'">
                                <i class="fas fa-trash-alt" style="margin-right: 0.5rem;"></i> Remove Photo
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <!-- Crop Step -->
            <div id="profile-crop-step" style="display: none; flex-direction: column; height: 100%;">
                <!-- Header -->
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; border-bottom: 1px solid ${colors.border}; background: ${colors.bg}; z-index: 10;">
                    <button onclick="cancelProfileCrop()" style="background: none; border: none; color: ${colors.textMuted}; font-size: 1rem; cursor: pointer; padding: 0.5rem; display: flex; align-items: center; gap: 0.5rem; font-weight: 600;">
                        <i class="fas fa-arrow-left"></i> Back
                    </button>
                    <h2 style="color: ${colors.text}; font-size: 1rem; font-weight: 700; margin: 0;">Adjust Photo</h2>
                    <button onclick="saveProfilePicture()" style="background: none; border: none; color: ${colors.primary}; font-size: 1rem; font-weight: 700; cursor: pointer; padding: 0.5rem;">
                        Save
                    </button>
                </div>
                
                <!-- Crop Area -->
                <div id="crop-container" style="position: relative; width: 100%; padding-top: 100%; background: #0f172a; overflow: hidden;">
                    <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;">
                        <!-- The image -->
                        <img id="profile-crop-image" style="position: absolute; transform-origin: center; cursor: grab; user-select: none; -webkit-user-drag: none; max-width: none; max-height: none;">
                        
                        <!-- Overlay Mask -->
                        <div id="crop-mask" style="position: absolute; inset: 0; pointer-events: none; z-index: 20;">
                            <svg width="100%" height="100%" style="position: absolute;">
                                <defs>
                                    <mask id="circle-mask">
                                        <rect width="100%" height="100%" fill="white"/>
                                        <circle cx="50%" cy="50%" r="40%" fill="black"/>
                                    </mask>
                                </defs>
                                <rect width="100%" height="100%" fill="rgba(15, 23, 42, 0.7)" mask="url(#circle-mask)"/>
                                
                                <!-- Circle Border -->
                                <circle cx="50%" cy="50%" r="40%" fill="none" stroke="white" stroke-width="2" stroke-opacity="0.8"/>
                                
                                <!-- Grid Lines (Vertical) -->
                                <line x1="33.33%" y1="10%" x2="33.33%" y2="90%" stroke="white" stroke-width="1" stroke-opacity="0.3" />
                                <line x1="66.66%" y1="10%" x2="66.66%" y2="90%" stroke="white" stroke-width="1" stroke-opacity="0.3" />
                                
                                <!-- Grid Lines (Horizontal) -->
                                <line x1="10%" y1="33.33%" x2="90%" y2="33.33%" stroke="white" stroke-width="1" stroke-opacity="0.3" />
                                <line x1="10%" y1="66.66%" x2="90%" y2="66.66%" stroke="white" stroke-width="1" stroke-opacity="0.3" />
                            </svg>
                        </div>
                    </div>
                </div>
                
                <!-- Zoom Control -->
                <div style="padding: 1.5rem; background: ${colors.bg}; border-top: 1px solid ${colors.border};">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <i class="fas fa-minus text-xs" style="color: ${colors.textMuted};"></i>
                        <input type="range" id="profile-zoom-slider" min="1" max="3" step="0.01" value="1" 
                            style="flex: 1; height: 4px; -webkit-appearance: none; background: ${colors.border}; border-radius: 2px; cursor: pointer; outline: none;">
                        <i class="fas fa-plus text-xs" style="color: ${colors.textMuted};"></i>
                    </div>
                </div>
            </div>
            
            <!-- Saving Overlay -->
            <div id="profile-saving-overlay" style="display: none; position: absolute; inset: 0; background: rgba(255,255,255,0.9); dark:background: rgba(30, 41, 59, 0.9); align-items: center; justify-content: center; flex-direction: column; gap: 1rem; z-index: 50;">
                <div style="width: 3rem; height: 3rem; border: 3px solid ${colors.border}; border-top-color: ${colors.primary}; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="color: ${colors.text}; font-weight: 600;">Updating Profile...</p>
            </div>
            
            <style>
                @keyframes spin { to { transform: rotate(360deg); } }
                #profile-zoom-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 18px;
                    height: 18px;
                    background: ${colors.primary};
                    border: 2px solid white;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    transition: transform 0.1s;
                }
                #profile-zoom-slider::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                }
                #profile-crop-image { touch-action: none; }
            </style>
        </div>
    `;

    document.body.appendChild(overlay);
}

function closeProfilePictureModal() {
    profileCropState = null;
    document.getElementById('profile-picture-modal')?.remove();
}

function handleProfileImageSelect(event) {
    const file = event.target.files[0];
    if (file) {
        handleProfileImageFile(file);
    }
}

// State for the custom circular cropper
let profileCropState = null;

function handleProfileImageFile(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Please select an image file', 'error');
        return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Image must be less than 5MB', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        // Show crop step
        document.getElementById('profile-upload-step').style.display = 'none';
        document.getElementById('profile-crop-step').style.display = 'flex';

        const cropImage = document.getElementById('profile-crop-image');
        const container = document.getElementById('crop-container');

        cropImage.onload = () => {
            // Calculate initial scale to fit circle
            const containerRect = container.getBoundingClientRect();
            // Circle is 40% radius = 80% diameter of container width
            const circleDiameter = containerRect.width * 0.8;

            // Scale image so smallest dimension fills the circle
            const imgAspect = cropImage.naturalWidth / cropImage.naturalHeight;
            let scale;

            if (imgAspect > 1) {
                // Landscape - fit height
                scale = circleDiameter / cropImage.naturalHeight;
            } else {
                // Portrait or square - fit width
                scale = circleDiameter / cropImage.naturalWidth;
            }

            // Start at 1.0x (fit to cover) instead of 1.2x
            // This allows the user to see the full image within the circle bounds immediately

            profileCropState = {
                scale: scale,
                minScale: scale,
                maxScale: scale * 3,
                x: 0,
                y: 0,
                isDragging: false,
                startX: 0,
                startY: 0,
                imgWidth: cropImage.naturalWidth,
                imgHeight: cropImage.naturalHeight
            };

            updateCropImageTransform();

            // Setup drag
            cropImage.onmousedown = startDrag;
            cropImage.ontouchstart = startDrag;

            document.onmousemove = drag;
            document.ontouchmove = drag;

            document.onmouseup = endDrag;
            document.ontouchend = endDrag;

            // Add Zoom Support (Wheel/Pinch)
            container.addEventListener('wheel', handleZoom, { passive: false });

            // Reset zoom slider
            const slider = document.getElementById('profile-zoom-slider');
            if (slider) {
                slider.min = 1;
                slider.max = 3;
                slider.value = 1;
                slider.oninput = (e) => adjustProfileZoom(e.target.value);
            }
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
    e.preventDefault();
    profileCropState.isDragging = true;

    const point = e.touches ? e.touches[0] : e;
    profileCropState.startX = point.clientX - profileCropState.x;
    profileCropState.startY = point.clientY - profileCropState.y;

    const img = document.getElementById('profile-crop-image');
    if (img) img.style.cursor = 'grabbing';
}

function drag(e) {
    if (!profileCropState || !profileCropState.isDragging) return;
    e.preventDefault();

    const point = e.touches ? e.touches[0] : e;
    profileCropState.x = point.clientX - profileCropState.startX;
    profileCropState.y = point.clientY - profileCropState.startY;

    updateCropImageTransform();
}

function endDrag() {
    if (!profileCropState) return;
    profileCropState.isDragging = false;

    const img = document.getElementById('profile-crop-image');
    if (img) img.style.cursor = 'grab';
}

function adjustProfileZoom(value) {
    if (!profileCropState) return;

    const newScale = profileCropState.minScale * parseFloat(value);
    profileCropState.scale = newScale;
    updateCropImageTransform();
}

function handleZoom(e) {
    if (!profileCropState) return;
    e.preventDefault();

    // Increased zoom speed for better trackpad response
    const zoomSpeed = 0.01;
    const delta = -e.deltaY * zoomSpeed;

    // Calculate new scale factor
    let scaleFactor = 1 + delta;

    // Calculate new scale
    let newScale = profileCropState.scale * scaleFactor;

    // Clamp scale
    newScale = Math.max(profileCropState.minScale, Math.min(profileCropState.maxScale, newScale));

    // Update state
    profileCropState.scale = newScale;
    updateCropImageTransform();

    // Update slider UI to match
    const slider = document.getElementById('profile-zoom-slider');
    if (slider) {
        // Slider value is relative to minScale (1 to 3)
        slider.value = newScale / profileCropState.minScale;
    }
}

function cancelProfileCrop() {
    profileCropState = null;
    document.getElementById('profile-crop-step').style.display = 'none';
    document.getElementById('profile-upload-step').style.display = 'flex';
    document.getElementById('profile-file-input').value = '';
}

async function saveProfilePicture() {
    if (!profileCropState) return;

    const savingOverlay = document.getElementById('profile-saving-overlay');
    savingOverlay.style.display = 'flex';

    try {
        const img = document.getElementById('profile-crop-image');
        const container = document.getElementById('crop-container');
        const containerRect = container.getBoundingClientRect();

        // Create canvas for the cropped circular area
        const outputSize = 256;
        const canvas = document.createElement('canvas');
        canvas.width = outputSize;
        canvas.height = outputSize;
        const ctx = canvas.getContext('2d');

        // The circle is centered in the container with radius 40% of width
        const circleRadius = containerRect.width * 0.4;
        const circleCenterX = containerRect.width / 2;
        const circleCenterY = containerRect.height / 2;

        // Calculate where the image is positioned
        const imgRect = img.getBoundingClientRect();
        const imgCenterX = imgRect.left - containerRect.left + imgRect.width / 2;
        const imgCenterY = imgRect.top - containerRect.top + imgRect.height / 2;

        // Calculate source coordinates on the original image
        // profileCropState.scale is the visual scale relative to natural size

        // Offset from image center to circle center
        const offsetX = circleCenterX - imgCenterX;
        const offsetY = circleCenterY - imgCenterY;

        // Convert to original image coordinates
        const srcX = (img.naturalWidth / 2) + (offsetX / profileCropState.scale) - (circleRadius / profileCropState.scale);
        const srcY = (img.naturalHeight / 2) + (offsetY / profileCropState.scale) - (circleRadius / profileCropState.scale);
        const srcSize = (circleRadius * 2) / profileCropState.scale;

        // Draw circular clip
        ctx.beginPath();
        ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Draw the cropped portion
        ctx.drawImage(
            img,
            srcX, srcY, srcSize, srcSize,
            0, 0, outputSize, outputSize
        );

        // Convert to base64
        const photoURL = canvas.toDataURL('image/jpeg', 0.9);
        const user = auth.currentUser;

        if (user) {
            // 2. Update Firestore (Users Collection)
            await db.collection('users').doc(user.uid).update({
                photoURL: photoURL
            });

            // 3. Sync to Mentor Profile (if user is a mentor)
            // This ensures guests can see the photo without accessing the restricted 'users' collection
            const isMentor = mentorsData.some(m => m.email === user.email);
            if (isMentor) {
                try {
                    await db.collection('mentor_profiles').doc(user.email).set({
                        photoURL: photoURL,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                    console.log("Synced photo to mentor profile");
                } catch (err) {
                    console.error("Failed to sync photo to mentor profile:", err);
                }
            }
        }

        // 4. Update UI
        if (currentUserData) {
            currentUserData.photoURL = photoURL;
        }
        updateAllAvatars(photoURL);
        showNotification('Profile picture updated!', 'success');
        closeProfilePictureModal();

    } catch (error) {
        console.error('Error saving profile picture:', error);
        showNotification('Failed to save photo. Please try again.', 'error');
        savingOverlay.style.display = 'none';
    }
}

async function removeProfilePicture() {
    if (!confirm('Are you sure you want to remove your profile picture?')) return;

    try {
        // Remove from Firestore if user is logged in and not a guest
        if (currentUserData && !currentUserData.isGuest && auth.currentUser) {
            await db.collection('users').doc(auth.currentUser.uid).update({
                photoURL: firebase.firestore.FieldValue.delete()
            });
        }

        // Update local user data
        if (currentUserData) {
            currentUserData.photoURL = null;
        }

        // Update all avatar displays
        updateAllAvatars(null);

        showNotification('Profile picture removed', 'success');
        closeProfilePictureModal();

    } catch (error) {
        console.error('Error removing profile picture:', error);
        showNotification('Failed to remove photo. Please try again.', 'error');
    }
}

function updateAllAvatars(photoURL) {
    const initials = getInitials(currentUserData?.name || 'U');

    // Update navbar avatar
    const navAvatar = document.getElementById('user-avatar');
    if (navAvatar) {
        if (photoURL) {
            navAvatar.innerHTML = `<img src="${photoURL}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
            navAvatar.innerHTML = initials;
        }
    }

    // Update dropdown avatar
    const dropdownAvatar = document.getElementById('dropdown-avatar');
    const dropdownInitials = document.getElementById('dropdown-avatar-initials');
    if (dropdownAvatar) {
        if (photoURL) {
            dropdownAvatar.innerHTML = `<img src="${photoURL}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
            dropdownAvatar.innerHTML = `<span id="dropdown-avatar-initials">${initials}</span>`;
        }
    }

    // Update Mobile Menu Avatar
    const mobileAvatar = document.getElementById('mobile-menu-avatar');
    if (mobileAvatar) {
        if (photoURL) {
            mobileAvatar.innerHTML = `<img src="${photoURL}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
            mobileAvatar.innerHTML = `<span id="mobile-menu-initials">${initials}</span>`;
        }
    }

    // Update Mobile Menu Text
    if (currentUserData) {
        const mobileName = document.getElementById('mobile-menu-name');
        const mobileEmail = document.getElementById('mobile-menu-email');
        if (mobileName) mobileName.textContent = currentUserData.name;
        if (mobileEmail) mobileEmail.textContent = currentUserData.email;
    }

    // Update mentor list in case the user is a mentor
    renderMentors();
}

function getInitials(name) {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

// ==================== END PROFILE PICTURE ====================

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

async function fetchMentorOverrides() {
    try {
        // 1. Fetch Overrides (Quote/Tags)
        const snapshot = await db.collection('mentor_profiles').get();
        mentorOverrides = {};
        snapshot.forEach(doc => {
            mentorOverrides[doc.id] = doc.data();
        });

        // 2. Fetch Profile Pictures (from 'users' collection)
        // We need to find the user doc where email matches the mentor email
        const photoPromises = mentorsData.map(async (mentor) => {
            try {
                // Skip if we already have the photo from mentor_profiles (optimization)
                if (mentorOverrides[mentor.email] && mentorOverrides[mentor.email].photoURL) return;

                const userQuery = await db.collection('users').where('email', '==', mentor.email).limit(1).get();
                if (!userQuery.empty) {
                    const userData = userQuery.docs[0].data();
                    if (userData.photoURL) {
                        if (!mentorOverrides[mentor.email]) mentorOverrides[mentor.email] = {};
                        mentorOverrides[mentor.email].photoURL = userData.photoURL;
                    }
                }
            } catch (err) {
                // Ignore permission errors (guests might not be able to read 'users')
                // console.warn(`Could not fetch user profile for ${mentor.email}:`, err);
            }
        });

        await Promise.all(photoPromises);

        renderMentors(); // Re-render with new data
    } catch (error) {
        console.error("Error fetching mentor profiles:", error);
        renderMentors(); // Render anyway
    }
}

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
    container.innerHTML = filtered.map(m => {
        const isCurrentUser = currentUserData && currentUserData.email === m.email;

        // Merge with overrides
        const override = mentorOverrides[m.email] || {};
        const displayQuote = override.quote || m.quote;
        const displayTags = override.tags || m.tags;

        // Use photo from overrides (fetched from users collection) or fallback to current user if it's them (immediate update)
        const photoURL = override.photoURL || (isCurrentUser ? currentUserData.photoURL : null);

        // Check permissions
        const canEdit = (currentUserData && currentUserData.role === 'admin') || isCurrentUser;

        return `
        <article class="bg-white dark:bg-slate-800 rounded-2xl border border-teal-100 dark:border-slate-700 shadow-sm hover:shadow-md transition flex flex-col justify-between p-6 animate-[fadeIn_0.3s_ease-out] relative group">
            
            ${canEdit ? `
                <button onclick="openEditMentorModal('${escapeHTML(m.email)}')" class="absolute top-4 right-4 text-slate-400 hover:text-teal-500 transition opacity-0 group-hover:opacity-100">
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
            <button onclick="showMentorEmail('${escapeHTML(m.email)}', '${escapeHTML(m.name)}')" class="mt-auto w-full border border-teal-500 text-teal-700 dark:text-teal-400 rounded-full py-2 text-sm font-semibold hover:bg-teal-500 hover:text-white transition flex items-center justify-center gap-2">
                <i class="far fa-envelope"></i> Contact Mentor
            </button>
        </article>

    `;
    }).join('');
}

// --- EDIT MENTOR MODAL ---

function openEditMentorModal(email) {
    const mentor = mentorsData.find(m => m.email === email);
    if (!mentor) return;

    const override = mentorOverrides[email] || {};
    const currentQuote = override.quote || mentor.quote;
    const currentTags = (override.tags || mentor.tags).join(', ');

    const overlay = document.createElement('div');
    overlay.id = 'edit-mentor-modal';
    overlay.className = 'fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]';

    // Theme-aware colors
    const isDark = document.documentElement.classList.contains('dark');
    const bg = isDark ? '#1e293b' : '#ffffff';
    const text = isDark ? '#f1f5f9' : '#1e293b';
    const border = isDark ? '#334155' : '#e2e8f0';

    overlay.innerHTML = `
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-[popIn_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)]">
            <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h3 class="text-xl font-bold text-slate-800 dark:text-white">Edit Mentor Profile</h3>
                <button onclick="document.getElementById('edit-mentor-modal').remove()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div class="p-6 space-y-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message (Quote)</label>
                    <textarea id="edit-mentor-quote" rows="3" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition resize-none">${escapeHTML(currentQuote)}</textarea>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tags (comma separated)</label>
                    <input type="text" id="edit-mentor-tags" value="${escapeHTML(currentTags)}" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition">
                    <p class="text-xs text-slate-500 mt-1">Example: Clinical Support, Exam Prep</p>
                </div>
            </div>

            <div class="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                <button onclick="document.getElementById('edit-mentor-modal').remove()" class="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition">Cancel</button>
                <button onclick="saveMentorDetails('${escapeHTML(email)}')" class="px-6 py-2 rounded-xl bg-teal-500 text-white font-bold hover:bg-teal-600 shadow-lg shadow-teal-500/30 transition transform hover:scale-105">Save Changes</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
}

async function saveMentorDetails(email) {
    const quoteInput = document.getElementById('edit-mentor-quote');
    const tagsInput = document.getElementById('edit-mentor-tags');

    if (!quoteInput || !tagsInput) return;

    const newQuote = quoteInput.value.trim();
    const newTags = tagsInput.value.split(',').map(t => t.trim()).filter(t => t.length > 0);

    // Optimistic Update
    if (!mentorOverrides[email]) mentorOverrides[email] = {};
    mentorOverrides[email].quote = newQuote;
    mentorOverrides[email].tags = newTags;

    renderMentors();
    document.getElementById('edit-mentor-modal').remove();
    showNotification('Profile updated successfully!', 'success');

    // Persist to Firestore
    try {
        await db.collection('mentor_profiles').doc(email).set({
            quote: newQuote,
            tags: newTags,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    } catch (error) {
        console.error("Error saving mentor profile:", error);
        showNotification('Failed to save changes.', 'error');
    }
}

// --- NEW HELPER FUNCTIONS FOR MODAL ---

function showMentorEmail(mentorEmail, mentorName) {
    // Remove any existing modal
    document.getElementById('dynamic-mentor-modal')?.remove();

    const isDark = document.documentElement.classList.contains('dark');

    const colors = {
        bg: isDark ? '#1e293b' : '#ffffff',
        text: isDark ? '#f1f5f9' : '#1e293b',
        textMuted: isDark ? '#94a3b8' : '#64748b',
        inputBg: isDark ? '#334155' : '#f1f5f9',
        border: isDark ? '#475569' : '#e2e8f0'
    };

    const overlay = document.createElement('div');
    overlay.id = 'dynamic-mentor-modal';
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
        if (e.target === overlay) closeMentorEmailModal();
    };

    overlay.innerHTML = `
        <div style="background: ${colors.bg}; border-radius: 1rem; max-width: 24rem; width: 100%; padding: 2rem; text-align: center; position: relative; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
            <button onclick="closeMentorEmailModal()" style="position: absolute; top: 1rem; right: 1rem; width: 2rem; height: 2rem; border-radius: 50%; background: ${colors.inputBg}; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: ${colors.textMuted};">
                <i class="fas fa-times"></i>
            </button>
            
            <div style="width: 4rem; height: 4rem; border-radius: 50%; background: ${isDark ? 'rgba(20, 184, 166, 0.2)' : '#f0fdfa'}; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: #14b8a6; font-size: 1.5rem;">
                <i class="fas fa-envelope"></i>
            </div>
            
            <h2 style="font-size: 1.5rem; font-weight: bold; color: ${colors.text}; margin-bottom: 0.5rem;">Contact ${escapeHTML(mentorName.split(' ')[0])}</h2>
            <p style="color: ${colors.textMuted}; font-size: 0.875rem; margin-bottom: 1.5rem;">Copy the email address below to contact your mentor.</p>
            
            <p id="mentor-email-value" style="font-family: monospace; font-weight: 600; color: ${colors.text}; background: ${colors.inputBg}; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 1rem; word-break: break-all; user-select: all;">${escapeHTML(mentorEmail)}</p>
            
            <button onclick="copyMentorEmailDynamic('${escapeHTML(mentorEmail)}')" id="copy-mentor-btn" style="width: 100%; background: #14b8a6; color: white; padding: 0.75rem; border-radius: 0.75rem; font-weight: bold; border: none; cursor: pointer; margin-bottom: 0.75rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                <i class="fas fa-copy"></i> Copy Email
            </button>
            
            <button onclick="window.location.href='mailto:${escapeHTML(mentorEmail)}'" style="width: 100%; background: ${colors.inputBg}; color: ${colors.text}; padding: 0.75rem; border-radius: 0.75rem; font-weight: bold; border: 1px solid ${colors.border}; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                <i class="fas fa-external-link-alt"></i> Open Email App
            </button>
        </div>
    `;

    document.body.appendChild(overlay);
}

function closeMentorEmailModal() {
    document.getElementById('dynamic-mentor-modal')?.remove();
}

function copyMentorEmailDynamic(email) {
    navigator.clipboard.writeText(email).then(() => {
        const btn = document.getElementById('copy-mentor-btn');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-copy"></i> Copy Email';
            }, 2000);
        }
    });
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
        <!-- Mobile Card (Visible only on Mobile) -->
        <div class="md:hidden flex flex-col p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-4 relative overflow-hidden">
            ${sessionStatus.status === 'past' ? '<div class="absolute inset-0 bg-white/50 dark:bg-slate-900/50 z-10 pointer-events-none"></div>' : ''}
            
            <!-- Header: Date & Status -->
            <div class="flex justify-between items-start mb-4">
                <div class="flex items-center gap-3">
                    <div class="bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-bold rounded-xl p-2.5 w-14 text-center border border-slate-200 dark:border-slate-600">
                        <div class="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">${month}</div>
                        <div class="text-xl leading-none font-extrabold">${day}</div>
                    </div>
                    <div>
                        <div class="font-bold text-slate-800 dark:text-white">${session.time}</div>
                        <div class="text-xs text-slate-500 dark:text-slate-400">${session.duration}m duration</div>
                    </div>
                </div>
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${sessionStatus.class}">
                    ${sessionStatus.status === 'live' ? '<span class="w-1.5 h-1.5 bg-current rounded-full mr-1"></span>' : ''}${sessionStatus.label}
                </span>
            </div>

            <!-- Body: Content -->
            <div class="mb-5">
                <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">${escapeHTML(session.title)}</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 leading-relaxed">${escapeHTML(session.desc)}</p>
                <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-800">
                    ${escapeHTML(session.tag)}
                </span>
            </div>

            <!-- Footer: Metadata & Action -->
            <div class="space-y-4">
                <div class="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-user-circle text-slate-400 text-lg"></i>
                        <span class="font-medium truncate max-w-[100px]">${escapeHTML(session.host)}</span>
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
                    ${currentUserRole === 'admin' ? `
                    <button onclick="deleteSession('${session.id}')" class="w-12 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                        <i class="fas fa-trash-alt"></i>
                    </button>` : ''}
                </div>
            </div>
        </div>

        <!-- Desktop Row (Visible only on Desktop) -->
        <div class="hidden md:grid md:grid-cols-12 gap-4 px-6 py-5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition items-center group ${sessionStatus.status === 'past' ? 'opacity-60' : ''} border-b border-slate-100 dark:border-slate-800 last:border-0">
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
                    <p class="text-sm text-slate-500 dark:text-slate-400 mb-1 line-clamp-1">${escapeHTML(session.desc)}</p>
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

    updateSessionBadge();
}

function updateSessionBadge() {
    const badge = document.getElementById('mobile-sessions-badge');
    if (!badge) return;

    // Count upcoming and live sessions
    const upcomingCount = sessionsData.filter(session => {
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
        container.innerHTML = `< div class="p-12 text-center text-slate-400 flex flex-col items-center" ><i class="fas fa-inbox text-3xl mb-4"></i><p>No new requests.</p></div > `;
        return;
    }

    container.innerHTML = activeMessages.map(msg => `
            < div class="flex flex-col md:flex-row gap-4 p-5 border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition" >
            <div class="flex items-start gap-3 md:w-1/3">
                <div class="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex-shrink-0 flex items-center justify-center font-bold text-sm">${msg.name.charAt(0).toUpperCase()}</div>
                <div><h4 class="font-bold text-slate-800 dark:text-white text-sm">${escapeHTML(msg.name)}</h4><p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${escapeHTML(msg.year)}</p></div>
            </div>
            <div class="md:w-1/4 flex items-center"><span class="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 text-xs px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-600">${escapeHTML(msg.topic)}</span></div>
            <div class="flex-1 flex justify-end items-center"><button onclick="acceptRequest('${msg.id}')" class="bg-teal-600 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-teal-700 transition">Accept</button></div>
        </div > `).join('');
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

    // Update Mobile Menu Profile Text
    if (currentUserData) {
        const mobileName = document.getElementById('mobile-menu-name');
        const mobileEmail = document.getElementById('mobile-menu-email');
        const mobileAvatar = document.getElementById('mobile-menu-avatar');

        if (mobileName) mobileName.textContent = currentUserData.name;
        if (mobileEmail) mobileEmail.textContent = currentUserData.email;

        // Also ensure avatar is set (in case updateAllAvatars wasn't triggered)
        if (mobileAvatar) {
            if (currentUserData.photoURL) {
                mobileAvatar.innerHTML = `<img src="${currentUserData.photoURL}" style="width: 100%; height: 100%; object-fit: cover;">`;
            } else {
                const initials = currentUserData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                mobileAvatar.innerHTML = `<span id="mobile-menu-initials">${initials}</span>`;
            }
        }
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
    const dropdownAvatar = document.getElementById('dropdown-avatar');

    // Get initials for avatar
    const initials = currentUserData.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    // Update navbar avatar (with profile picture support)
    if (userAvatar) {
        if (currentUserData.photoURL) {
            userAvatar.innerHTML = `<img src="${currentUserData.photoURL}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
            userAvatar.textContent = initials;
        }
    }

    // Update dropdown large avatar (with profile picture support)
    if (dropdownAvatar) {
        if (currentUserData.photoURL) {
            dropdownAvatar.innerHTML = `<img src="${currentUserData.photoURL}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
            dropdownAvatar.innerHTML = `<span id="dropdown-avatar-initials">${initials}</span>`;
        }
    }

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
        dropdownRole.className = `inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${roleInfo.class}`;
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