import '../style.css';
import {
    state,
    setCurrentUserRole,
    setCurrentUserData,
    setIsSignUpMode
} from './state.js';
// import { auth } from '../public/firebase-config.js'; // Removed: auth is global

import * as Repo from './firebase-repo.js';
import * as UI from './ui.js';
import * as Utils from './utils.js';

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0);
    UI.initTheme();

    // Firebase Auth Listener
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            console.log("User logged in:", user.email);

            if (!user.emailVerified) {
                console.log("Email not verified.");
                // In a real app, we might force sign-out or show a verification screen here.
                // For now, we let handleAuth manage the "Please Verify" alert.
                return;
            }

            // Fetch Role & Profile
            let userDoc = await Repo.getUserProfile(user.uid);
            let attempts = 0;
            // Retry logic for new signups where Firestore trigger/creation might be slightly delayed
            while (!userDoc.exists && attempts < 3) {
                await new Promise(r => setTimeout(r, 500));
                userDoc = await Repo.getUserProfile(user.uid);
                attempts++;
            }

            if (userDoc.exists) {
                const userData = userDoc.data();
                setCurrentUserRole(userData.role || 'student');
                setCurrentUserData({
                    name: userData.name || 'Student',
                    email: user.email,
                    role: userData.role || 'student',
                    photoURL: userData.photoURL || null
                });
                UI.showNotification(`Welcome back, ${userData.name || 'Student'}`, "success");
            } else {
                // Fallback
                setCurrentUserRole('student');
                setCurrentUserData({
                    name: 'Student',
                    email: user.email,
                    role: 'student',
                    photoURL: null
                });
            }

            UI.updateUIForRole(state.currentUserRole);
            UI.updateUserProfileDropdown();

            // Hide Loading / Login
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.classList.add('opacity-0');
                setTimeout(() => loadingScreen.classList.add('hidden'), 500);
            }
            document.getElementById('login-modal').classList.add('hidden');

            // Load Data
            Repo.subscribeToTopics(UI.renderTopics);
            Repo.subscribeToSessions(UI.renderSessions);
            Repo.subscribeToInbox(UI.renderInbox);

            // Fetch dynamic mentor data
            Repo.fetchMentorOverrides(state.mentorsData).then(() => {
                UI.renderMentors();
            });

            window.scrollTo(0, 0);

        } else {
            console.log("User logged out");

            // Show Login
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.classList.add('opacity-0');
                setTimeout(() => loadingScreen.classList.add('hidden'), 500);
            }
            document.getElementById('login-modal').classList.remove('hidden');

            // Even if logged out, fetch overrides so guests can see updated mentor profiles
            Repo.fetchMentorOverrides(state.mentorsData).then(() => {
                UI.renderMentors();
            });

            UI.updateUIForRole(null);
        }
    });

    // Mobile Menu Listener
    const mobileBtn = document.getElementById('mobile-menu-btn');
    if (mobileBtn) {
        mobileBtn.addEventListener('click', UI.toggleMobileMenu);
    }
});

// ==========================================
// EVENT LISTENERS & GLOBAL EXPORTS
// ==========================================

// Make functions available globally for HTML onclick handlers
window.toggleTheme = UI.toggleTheme;
window.showSection = (sectionId) => {
    window.location.hash = sectionId;
};
window.toggleMobileMenu = UI.toggleMobileMenu;
window.openModal = UI.openModal;
window.closeModal = UI.closeModal;

// Topics
window.openTopicModal = UI.openTopicModal;
window.openSuggestTopicModal = UI.openSuggestTopicModal;
window.closeSuggestTopicModal = UI.closeSuggestTopicModal;
window.submitSuggestTopic = UI.submitSuggestTopic;
window.closeDynamicModal = UI.closeDynamicModal;
window.deleteTopic = async (event, id) => {
    event.stopPropagation();
    if (confirm("Delete this topic?")) {
        try {
            await Repo.deleteTopic(id);
            UI.showNotification("Topic deleted.", "success");
        } catch (error) {
            console.error("Error deleting topic: ", error);
            alert("Failed to delete topic.");
        }
    }
};

// Profile
window.openProfilePictureModal = UI.openProfilePictureModal;
window.closeProfilePictureModal = UI.closeProfilePictureModal;
window.handleProfileImageSelect = UI.handleProfileImageSelect;
window.saveProfilePicture = UI.saveProfilePicture;
window.removeProfilePicture = UI.removeProfilePicture;
window.cancelProfileCrop = UI.cancelProfileCrop;

// Mentors
window.openEditMentorModal = UI.openEditMentorModal;
window.saveMentorDetails = UI.saveMentorDetails;
window.showMentorEmail = UI.showMentorEmail;
window.closeMentorEmailModal = UI.closeMentorEmailModal;
window.copyMentorEmailDynamic = UI.copyMentorEmailDynamic;
window.filterMentors = UI.filterMentors;

// Sessions
window.openEditSessionModal = UI.openEditSessionModal;
window.resetSessionModal = UI.resetSessionModal;
window.handleAddSession = UI.handleAddSession;
window.deleteSession = async (id) => {
    if (confirm("Cancel and delete this session?")) {
        try {
            await Repo.deleteSession(id);
            UI.showNotification("Session cancelled.", "success");
        } catch (error) {
            console.error("Error deleting session: ", error);
            alert("Failed to delete session.");
        }
    }
};

// Auth & Breathing
window.logout = () => {
    auth.signOut().then(() => {
        UI.showNotification("Logged Out", "success");
        window.location.reload();
    });
};

window.handleAuth = UI.handleAuth;
window.setAuthMode = UI.setAuthMode;
window.toggleAuthMode = UI.toggleAuthMode;
window.toggleProfileDropdown = UI.toggleProfileDropdown;
window.toggleBreathing = UI.toggleBreathing;

window.loginAsGuest = () => {
    console.log("Logging in as Guest");
    setCurrentUserRole('guest');
    setCurrentUserData({
        name: 'Guest User',
        email: 'guest@demo.com',
        role: 'guest',
        photoURL: null
    });

    document.getElementById('login-modal').classList.add('hidden');
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) loadingScreen.classList.add('hidden');

    UI.updateUIForRole('guest');
    UI.updateUserProfileDropdown();
    UI.showNotification("Guest Mode Active", "success");

    Repo.subscribeToTopics(UI.renderTopics);
    Repo.subscribeToSessions(UI.renderSessions);

    Repo.fetchMentorOverrides(state.mentorsData).then(() => {
        UI.renderMentors();
    });
};

// Requests
window.handleBooking = UI.handleBooking;
window.resetChatForm = UI.resetChatForm;
window.acceptRequest = UI.acceptRequest;

// Handle Hash Change
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1) || 'home';
    UI.renderSection(hash);
});


