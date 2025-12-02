// Global State
export const state = {
    mentorsData: [
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
export function setMentorOverrides(data) { state.mentorOverrides = data; }
export function setCurrentUserRole(role) { state.currentUserRole = role; }
export function setCurrentUserData(data) { state.currentUserData = data; }
export function setIsSignUpMode(mode) { state.isSignUpMode = mode; }
