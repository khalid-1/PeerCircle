// Global State
export const state = {
    mentorsData: [
        { id: 1, name: "Meerah Ahmed Alansi", role: "BSN Year 4", email: "meera.22904065@rakmhsu.ac.ae", quote: "Happy to support with clinical placement anxiety and confidence on the ward.", specialties: ["Clinical Support", "Placement Anxiety"], img: "https://i.pravatar.cc/150?u=meera" },
        { id: 2, name: "Seham Mohammed Abuhatab", role: "BSN Year 4", email: "seham.22904030@rakmhsu.ac.ae", quote: "Let’s talk about balancing life, studies, and clinicals without burning out.", specialties: ["Stress & Burnout", "Time Management"], img: "https://i.pravatar.cc/150?u=seham" },
        { id: 3, name: "Doaa Mohamed Sharafeldin", role: "BSN Year 4", email: "doaa.22904079@rakmhsu.ac.ae", quote: "Here for exam anxiety, study plans, and last-minute motivation.", specialties: ["Exam Prep", "Study Skills"], img: "https://i.pravatar.cc/150?u=doaa" },
        { id: 4, name: "Khalid Said Islam", role: "BSN Year 4", email: "khalid.22904036@rakmhsu.ac.ae", quote: "Happy to chat about tech tools, note-taking, and keeping organized.", specialties: ["Study Skills", "Time Management"], img: "https://i.pravatar.cc/150?u=khalid" },
        { id: 5, name: "Amina Sulieman Yassin", role: "BSN Year 4", email: "amina.22904026@rakmhsu.ac.ae", quote: "Let’s make pharmacology and pathophysiology feel less scary.", specialties: ["Pharmacology", "Pathophysiology"], img: "https://i.pravatar.cc/150?u=amina" },
        { id: 6, name: "Haya Hani Al Halabi", role: "BSN Year 3", email: "haya.23904004@rakmhsu.ac.ae", quote: "Supporting you with first clinicals, communication, and reflective practice.", specialties: ["Clinical Support", "Communication"], img: "https://i.pravatar.cc/150?u=haya" },
        { id: 7, name: "Khalifa Khalid Alshehhi", role: "BSN Year 3", email: "khalifa.23904112@rakmhsu.ac.ae", quote: "Happy to discuss exam strategies and OSCE preparation.", specialties: ["Exam Prep", "OSCE"], img: "https://i.pravatar.cc/150?u=khalifa" },
        { id: 8, name: "Abdalqader Abdou", role: "BSN Year 3", email: "abdalqader.23904036@rakmhsu.ac.ae", quote: "We can work together on clinical reasoning and case-based thinking.", specialties: ["Clinical Reasoning", "Case Discussions"], img: "https://i.pravatar.cc/150?u=abdalqader" },
        { id: 9, name: "Bushra Garallah Ali", role: "BSN Year 2", email: "bushra.24904025@rakmhsu.ac.ae", quote: "Here for first-year nerves, basics, and building your confidence.", specialties: ["First Year Support", "Foundations"], img: "https://i.pravatar.cc/150?u=bushra" },
        { id: 10, name: "Ghofran G A Abuzour", role: "BSN Year 2", email: "ghofran.24904022@rakmhsu.ac.ae", quote: "Happy to help with pharmacology flashcards and study routines.", specialties: ["Pharmacology", "Study Routines"], img: "https://i.pravatar.cc/150?u=ghofran" },
        { id: 11, name: "Leen Abdelhakim Toubeh", role: "BSN Year 2", email: "leen.24904034@rakmhsu.ac.ae", quote: "Let’s focus on building study habits that actually work for you.", specialties: ["Study Skills", "Motivation"], img: "https://i.pravatar.cc/150?u=leen" },
        { id: 12, name: "Raghad Mohammad", role: "BSN Year 2", email: "raghad.24904030@rakmhsu.ac.ae", quote: "Here for stress management, grounding techniques, and check-ins.", specialties: ["Stress Management", "Coping Skills"], img: "https://i.pravatar.cc/150?u=raghad" },
        { id: 13, name: "Haneen Jamal Hjaila", role: "BSN Year 2", email: "haneen.24904019@rakmhsu.ac.ae", quote: "Let’s work on confidence, presentations, and speaking up in class.", specialties: ["Confidence", "Presentations"], img: "https://i.pravatar.cc/150?u=haneen" }
    ],
    topicsData: [],
    sessionsData: [],
    peerMessages: [],
    mentorOverrides: {},
    currentUserRole: 'student',
    currentUserData: null,
    isSignUpMode: false
};

// Setters to update state safely
export function setTopicsData(data) { state.topicsData = data; }
export function setSessionsData(data) { state.sessionsData = data; }
export function setPeerMessages(data) { state.peerMessages = data; }
export function setMentorOverrides(data) {
    state.mentorOverrides = data;
    // Update mentorsData with overrides
    state.mentorsData.forEach(mentor => {
        if (data[mentor.email]) {
            if (data[mentor.email].quote) mentor.quote = data[mentor.email].quote;
            if (data[mentor.email].photoURL) mentor.img = data[mentor.email].photoURL;
        }
    });
}
export function setCurrentUserRole(role) { state.currentUserRole = role; }
export function setCurrentUserData(data) { state.currentUserData = data; }
export function setIsSignUpMode(mode) { state.isSignUpMode = mode; }
