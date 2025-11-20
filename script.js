
        // --- Navigation Logic ---
        function showSection(sectionId) {
            // Hide all sections
            document.querySelectorAll('.section-content').forEach(el => {
                el.classList.remove('active');
            });
            
            // Show selected section
            document.getElementById(sectionId).classList.add('active');
            
            // Scroll to top
            window.scrollTo(0, 0);

            // Update Nav Active State (Optional Simple Visual)
            document.querySelectorAll('.nav-link').forEach(btn => {
                if(btn.textContent.toLowerCase().includes(sectionId === 'home' ? 'home' : sectionId.substring(0,3))) {
                    btn.classList.add('text-teal-600');
                    btn.classList.remove('text-slate-500');
                } else {
                    btn.classList.remove('text-teal-600');
                    btn.classList.add('text-slate-500');
                }
            });
        }

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

            // Inhale (4s)
            text.textContent = "Breathe In...";
            circle.className = "breathing-circle inhale";
            
            // Exhale (4s)
            setTimeout(() => {
                if(isBreathing) {
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

        // Initialize Home
        showSection('home');

    