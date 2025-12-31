import {
    setTopicsData,
    setSessionsData,
    setPeerMessages,
    setMentorOverrides,
    state
} from './state.js';
import { db, storage } from './firebase-init.js';
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    getDocs,
    getDoc,
    updateDoc,
    setDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    deleteField
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// ==========================================
// TOPICS
// ==========================================

export function subscribeToTopics(onUpdate) {
    const q = collection(db, 'topics');
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setTopicsData(data);
        if (onUpdate) onUpdate(data);
    });
}

export async function addTopic(topicData) {
    return await addDoc(collection(db, 'topics'), {
        ...topicData,
        createdAt: serverTimestamp()
    });
}

export async function deleteTopic(id) {
    return await deleteDoc(doc(db, 'topics', id));
}

// ==========================================
// MENTORS
// ==========================================

export async function fetchMentorOverrides(mentorsData) {
    try {
        // 1. Fetch Overrides (Quote/Tags)
        const snapshot = await getDocs(collection(db, 'mentor_profiles'));
        const overrides = {};
        snapshot.forEach(doc => {
            overrides[doc.id] = doc.data();
        });

        // 2. Fetch Profile Pictures (from 'users' collection)
        const photoPromises = mentorsData.map(async (mentor) => {
            try {
                if (overrides[mentor.email] && overrides[mentor.email].photoURL) return;

                const q = query(collection(db, 'users'), where('email', '==', mentor.email), limit(1));
                const userQuery = await getDocs(q);

                if (!userQuery.empty) {
                    const userData = userQuery.docs[0].data();
                    if (userData.photoURL) {
                        if (!overrides[mentor.email]) overrides[mentor.email] = {};
                        overrides[mentor.email].photoURL = userData.photoURL;
                    }
                }
            } catch (err) {
                // Ignore permission errors
            }
        });

        await Promise.all(photoPromises);
        setMentorOverrides(overrides);
        return overrides;
    } catch (error) {
        console.error("Error fetching mentor profiles:", error);
        return {};
    }
}

// ==========================================
// SESSIONS
// ==========================================

export function subscribeToSessions(onUpdate) {
    const q = query(collection(db, 'sessions'), orderBy('date', 'asc'));
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSessionsData(data);
        if (onUpdate) onUpdate(data);
    });
}

export async function addSession(sessionData) {
    return await addDoc(collection(db, 'sessions'), {
        ...sessionData,
        createdAt: serverTimestamp()
    });
}

export async function deleteSession(id) {
    return await deleteDoc(doc(db, 'sessions', id));
}

// ==========================================
// REQUESTS (CHAT)
// ==========================================

export function subscribeToInbox(onUpdate) {
    const q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPeerMessages(data);
        if (onUpdate) onUpdate(data);
    });
}

export async function handleBookingRequest(requestData) {
    return await addDoc(collection(db, 'requests'), {
        ...requestData,
        status: "pending",
        createdAt: serverTimestamp()
    });
}

export async function acceptPeerRequest(id) {
    return await updateDoc(doc(db, 'requests', id), {
        status: 'accepted',
        acceptedAt: serverTimestamp()
    });
}

// ==========================================
// USER & AUTH
// ==========================================

export async function getUserProfile(uid) {
    return await getDoc(doc(db, 'users', uid));
}

export async function createUserProfile(uid, data) {
    return await setDoc(doc(db, 'users', uid), {
        ...data,
        createdAt: serverTimestamp()
    });
}
