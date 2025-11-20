
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

        // --- Form Handling ---
        function handleBooking(e) {
            e.preventDefault();
            // In a real app, this would send data to a backend
            
            // Reset form
            document.getElementById('bookingForm').reset();
            
            // Show Notification
            showNotification("Request Sent! A peer will email you shortly.", "success");
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

let currentUserRole = 'student';

function loginAs(role) {
    currentUserRole = role;
    document.getElementById('login-modal').classList.add('hidden');

    // Update Admin UI Elements
    const adminControls = document.getElementById('admin-controls');
    const adminBadge = document.getElementById('admin-badge');

    if (role === 'admin') {
        adminControls.classList.remove('hidden');
        adminBadge.classList.remove('hidden');
        showNotification("Admin Mode: You can now Edit content.", "success");
    } else {
        adminControls.classList.add('hidden');
        adminBadge.classList.add('hidden');
        showNotification(`Welcome! Logged in as ${role}.`, "success");
    }

    // Re-render topics to show/hide delete buttons
    renderTopics();
    
    // Go to education section to show off the feature
    showSection('education');
}

// Initial Render on Load
document.addEventListener('DOMContentLoaded', () => {
    renderTopics();
});