
// --- Navigation Logic ---
function showSection(sectionId) {
    // Update the URL hash without reloading
    window.location.hash = sectionId;
    renderSection(sectionId);
}

function renderSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section-content').forEach(el => {
        el.classList.remove('active');
    });
    
    // Show selected section (fallback to home if id doesn't exist)
    const target = document.getElementById(sectionId) || document.getElementById('home');
    target.classList.add('active');
    
    // Scroll to top
    window.scrollTo(0, 0);

    // Update Nav Active State
    document.querySelectorAll('.nav-link').forEach(btn => {
        // precise matching based on onclick attribute or hash
        if(btn.getAttribute('onclick').includes(sectionId)) {
            btn.classList.add('text-teal-600');
            btn.classList.remove('text-slate-500');
        } else {
            btn.classList.remove('text-teal-600');
            btn.classList.add('text-slate-500');
        }
    });
}

// Handle Back/Forward Browser Buttons
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1) || 'home';
    renderSection(hash);
});

// Initialize on Load
window.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash.substring(1) || 'home';
    renderSection(hash);
    renderTopics();
});

        // --- Mobile Menu ---
        function toggleMobileMenu() {
            const menu = document.getElementById('mobile-menu');
            menu.classList.toggle('hidden');
        }

        document.getElementById('mobile-menu-btn').addEventListener('click', toggleMobileMenu);

        // --- Breathing App Logic ---
        let isBreathing = false;
        let breathingInterval;

        function toggleBreathing() {
            const btn = document.getElementById('breath-btn');
            const circle = document.getElementById('breathing-container');
            const text = document.getElementById('breath-text');

            if (!isBreathing) {
                isBreathing = true;
                btn.textContent = "Stop Exercise";
                btn.classList.remove('bg-teal-600');
                btn.classList.add('bg-red-400');
                
                runBreathingCycle();
                breathingInterval = setInterval(runBreathingCycle, 8000); // 4s in + 4s out = 8s cycle loop (simplified)

            } else {
                isBreathing = false;
                clearInterval(breathingInterval);
                btn.textContent = "Start Exercise";
                btn.classList.add('bg-teal-600');
                btn.classList.remove('bg-red-400');
                
                // Reset UI
                circle.classList.remove('inhale', 'exhale');
                text.textContent = "Ready?";
            }
        }

function runBreathingCycle() {
    const circle = document.getElementById('breathing-container');
    const text = document.getElementById('breath-text');

    // Immediate Start (Inhale)
    text.textContent = "Breathe In...";
    circle.className = "breathing-circle inhale";
    
    // Exhale after 4 seconds
    setTimeout(() => {
        if(isBreathing) { // Check if user didn't stop it mid-way
            text.textContent = "Breathe Out...";
            circle.className = "breathing-circle exhale";
        }
    }, 4000); 
}

        // --- Modal Logic ---
        function openModal(id) {
            document.getElementById(id).classList.remove('hidden');
            document.getElementById(id).classList.add('flex');
        }

        function closeModal(id) {
            document.getElementById(id).classList.add('hidden');
            document.getElementById(id).classList.remove('flex');
        }

// --- PEER INBOX LOGIC ---

// 1. The "Messages Database"
let peerMessages = [
    // Seed data so the inbox isn't empty on first login
    {
        id: 101,
        name: "NervousStudent22",
        year: "BSN Year 1",
        topic: "Academic Struggles",
        time: "Weekends",
        status: "pending"
    }
];

// 2. Handle Student Form Submission
function handleBooking(e) {
    e.preventDefault();
    
    // Gather data from the form inputs
    // Note: In a real app, use specific IDs. Here assuming order or adding IDs to inputs is best.
    // Let's assume you added IDs to your form inputs in HTML: id="req-name", "req-year", "req-topic", "req-time"
    
    // Fallback for demo if IDs aren't set yet:
    const inputs = e.target.querySelectorAll('input, select');
    
    const newMessage = {
        id: Date.now(),
        name: inputs[0].value || "Anonymous",
        year: inputs[1].value,
        topic: inputs[2].value,
        time: inputs[3].value,
        status: "pending"
    };

    // Save to "Database"
    peerMessages.push(newMessage);
    
    // Reset Form
    e.target.reset();
    
    // Feedback
    showNotification("Request Sent! A peer will check it soon.", "success");
}

// 3. Render the Inbox (For Peer Mentors)
function renderInbox() {
    const container = document.getElementById('inbox-container');
    
    // Filter for pending messages
    const activeMessages = peerMessages.filter(msg => msg.status === 'pending');

    if (activeMessages.length === 0) {
        container.innerHTML = `
            <div class="p-8 text-center text-slate-400">
                <i class="fas fa-check-circle text-4xl mb-3 block text-teal-100"></i>
                All caught up! No pending requests.
            </div>`;
        return;
    }

    container.innerHTML = activeMessages.map(msg => `
        <div class="grid grid-cols-12 px-6 py-4 items-center hover:bg-slate-50 transition">
            <div class="col-span-3 font-medium text-slate-800">
                <div class="flex items-center">
                    <div class="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-xs font-bold mr-2">
                        ${msg.name.charAt(0).toUpperCase()}
                    </div>
                    ${msg.name}
                </div>
            </div>
            <div class="col-span-2 text-sm text-slate-500">${msg.year}</div>
            <div class="col-span-3">
                <span class="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium">
                    ${msg.topic}
                </span>
            </div>
            <div class="col-span-2 text-sm text-slate-500">${msg.time}</div>
            <div class="col-span-2 text-right">
                <button onclick="acceptRequest(${msg.id})" class="bg-teal-600 text-white hover:bg-teal-700 px-3 py-1 rounded text-sm font-medium shadow-sm transition">
                    Accept
                </button>
            </div>
        </div>
    `).join('');
}

function acceptRequest(id) {
    // Find message and mark as 'accepted' (removes it from list)
    const msgIndex = peerMessages.findIndex(m => m.id === id);
    if(msgIndex > -1) {
        peerMessages[msgIndex].status = 'accepted';
        renderInbox();
        showNotification("Request Accepted! Check your email for the chat link.", "success");
    }
}

        // --- Notification Logic ---
        function showNotification(msg, type) {
            const notif = document.getElementById('notification');
            document.getElementById('notif-message').textContent = msg;
            
            notif.classList.remove('translate-y-20', 'opacity-0');
            
            setTimeout(() => {
                notif.classList.add('translate-y-20', 'opacity-0');
            }, 3000);
        }

// --- DYNAMIC DATA MANAGEMENT (The "Brain") ---

// 1. The "Database" (Array of Objects)
let topicsData = [
    {
        id: 1,
        title: "Stress & Burnout",
        desc: "Identifying the signs of compassion fatigue and practical strategies to reset.",
        color: "red",
        icon: "fa-fire",
        modalId: "modal-burnout"
    },
    {
        id: 2,
        title: "Exam Anxiety",
        desc: "Techniques to handle NCLEX prep pressure and semester finals without panic.",
        color: "orange",
        icon: "fa-pen-alt",
        modalId: "modal-exams"
    },
    {
        id: 3,
        title: "Clinical Placement",
        desc: "Navigating hospital hierarchies, difficult shifts, and debriefing safely.",
        color: "blue",
        icon: "fa-user-nurse",
        modalId: null // "Coming Soon"
    },
    {
        id: 4,
        title: "Transition to Work",
        desc: "From student to RN: What to expect in your first 6 months.",
        color: "green",
        icon: "fa-briefcase",
        modalId: null 
    }
];

// 2. The Render Function (Builds HTML from Data)
function renderTopics() {
    const container = document.getElementById('topics-container');
    container.innerHTML = ""; // Clear current content

    topicsData.forEach(topic => {
        // Determine Button Action
        let buttonHTML = topic.modalId 
            ? `<button onclick="openModal('${topic.modalId}')" class="text-teal-600 font-semibold text-sm hover:underline">Read Guide <i class="fas fa-arrow-right ml-1"></i></button>`
            : `<button class="text-slate-400 font-semibold text-sm cursor-not-allowed">Coming Soon</button>`;

        // If ADMIN, add Delete Button
        let adminControls = "";
        if (currentUserRole === 'admin') {
            adminControls = `
                <button onclick="deleteTopic(${topic.id})" class="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
        }

        // Dynamic HTML Template
        const cardHTML = `
            <div class="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition group relative animate-[fadeIn_0.3s_ease-out]">
                <div class="h-3 bg-${topic.color}-400"></div>
                <div class="p-6">
                    ${adminControls}
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="font-bold text-xl text-slate-800">${topic.title}</h3>
                        <div class="text-${topic.color}-400 text-xl">
                            <i class="fas ${topic.icon}"></i>
                        </div>
                    </div>
                    <p class="text-slate-600 text-sm mb-4 min-h-[3rem]">${topic.desc}</p>
                    ${buttonHTML}
                </div>
            </div>
        `;
        
        container.innerHTML += cardHTML;
    });
}

// 3. Admin Actions (Add & Delete)

function handleAddTopic(event) {
    event.preventDefault(); // Stop page reload

    // Get values from form
    const title = document.getElementById('new-topic-title').value;
    const desc = document.getElementById('new-topic-desc').value;
    const color = document.getElementById('new-topic-color').value;

    // Create new object
    const newTopic = {
        id: Date.now(), // Simple unique ID
        title: title,
        desc: desc,
        color: color,
        icon: "fa-lightbulb", // Default icon
        modalId: null
    };

    // Add to "Database"
    topicsData.push(newTopic);

    // Refresh the View
    renderTopics();
    
    // Clear Form and Notify
    event.target.reset();
    showNotification("New Topic Published Successfully!", "success");
}

function deleteTopic(id) {
    if(confirm("Are you sure you want to delete this topic?")) {
        // Filter out the topic with the matching ID
        topicsData = topicsData.filter(topic => topic.id !== id);
        renderTopics();
        showNotification("Topic deleted.", "success");
    }
}

// 4. Update Login Logic to Trigger Render
// (Make sure to replace your previous 'loginAs' with this version)

function loginAs(role) {
    currentUserRole = role;
    document.getElementById('login-modal').classList.add('hidden');

    // UI Elements to Toggle
    const adminControls = document.getElementById('admin-controls');
    const adminBadge = document.getElementById('admin-badge');
    const adminDash = document.getElementById('admin-dashboard');
    const peerInbox = document.getElementById('peer-inbox');

    // Reset Views (Hide everything first)
    adminControls.classList.add('hidden');
    adminBadge.classList.add('hidden');
    adminDash.classList.add('hidden');
    peerInbox.classList.add('hidden');

    // LOGIC: Apply permissions based on role
    if (role === 'admin') {
        // Admin: See Dashboard, Badge, and Edit Controls
        adminControls.classList.remove('hidden');
        adminBadge.classList.remove('hidden');
        adminDash.classList.remove('hidden');
        
        updateDashboard(); // Calculate stats
        showSection('admin-dashboard'); // Jump to dashboard
        showNotification("Admin Mode: Dashboard Loaded.", "success");
    
    } else if (role === 'peer') {
        // Peer: See Inbox
        peerInbox.classList.remove('hidden');
        
        renderInbox(); // Load messages
        showSection('peer-inbox'); // Jump to inbox
        showNotification("Welcome Mentor! Inbox synced.", "success");
    
    } else {
        // Student: Standard View
        showSection('home');
        showNotification("Welcome! Logged in anonymously.", "success");
    }

    // Re-render shared components (like Topics) to apply/remove delete buttons
    renderTopics();
}



// --- ANALYTICS LOGIC ---

function updateDashboard() {
    // 1. Count Active Topics
    // This pulls directly from the array you created in Step 3
    const topicCount = topicsData.length;
    
    // 2. Count Peer Requests (Total & Pending)
    // This pulls directly from the array you created in Step 4
    const totalRequests = peerMessages.length;
    const pendingRequests = peerMessages.filter(m => m.status === 'pending').length;

    // 3. Update HTML Elements
    // Use a simple animation effect for numbers
    animateValue("stat-topics", 0, topicCount, 1000);
    animateValue("stat-requests", 0, totalRequests, 1000);
    
    document.getElementById('stat-requests-sub').textContent = `${pendingRequests} Pending actions`;
}

// Helper to animate numbers counting up
function animateValue(id, start, end, duration) {
    if (start === end) return;
    const range = end - start;
    let current = start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));
    const obj = document.getElementById(id);
    
    const timer = setInterval(function() {
        current += increment;
        obj.innerHTML = current;
        if (current == end) {
            clearInterval(timer);
        }
    }, stepTime);
}