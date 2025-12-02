import {
    setTopicsData,
    setSessionsData,
    setPeerMessages,
    setMentorOverrides,
    state
} from './state.js';

// We assume db, auth, storage are available globally from firebase-config.js for now.
// In a full module build, we would import them.

// ==========================================
// TOPICS
// ==========================================

export function subscribeToTopics(onUpdate) {
    return db.collection('topics').onSnapshot((snapshot) => {
        const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setTopicsData(data);
        if (onUpdate) onUpdate(data);
    });
}

export async function addTopic(topicData) {
    return await db.collection('topics').add({
        ...topicData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

export async function deleteTopic(id) {
    return await db.collection('topics').doc(id).delete();
}

export async function addTopicSuggestion(suggestionData) {
    return await db.collection('topic_suggestions').add({
        ...suggestionData,
        status: 'pending',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

// ==========================================
// MENTORS
// ==========================================

export async function fetchMentorOverrides(mentorsData) {
    try {
        // 1. Fetch Overrides (Quote/Tags)
        const snapshot = await db.collection('mentor_profiles').get();
        const overrides = {};
        snapshot.forEach(doc => {
            overrides[doc.id] = doc.data();
        });

        // 2. Fetch Profile Pictures (from 'users' collection)
        // We need to find the user doc where email matches the mentor email
        const photoPromises = mentorsData.map(async (mentor) => {
            try {
                // Skip if we already have the photo from mentor_profiles (optimization)
                if (overrides[mentor.email] && overrides[mentor.email].photoURL) return;

                const userQuery = await db.collection('users').where('email', '==', mentor.email).limit(1).get();
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

export async function updateMentorProfile(email, data) {
    return await db.collection('mentor_profiles').doc(email).set({
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
}

// ==========================================
// SESSIONS
// ==========================================

export function subscribeToSessions(onUpdate) {
    return db.collection('sessions').orderBy('date', 'asc').onSnapshot((snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSessionsData(data);
        if (onUpdate) onUpdate(data);
    });
}

export async function addSession(sessionData) {
    return await db.collection('sessions').add({
        ...sessionData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

export async function updateSession(id, sessionData) {
    return await db.collection('sessions').doc(id).update({
        ...sessionData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

export async function deleteSession(id) {
    return await db.collection('sessions').doc(id).delete();
}

// ==========================================
// REQUESTS (CHAT)
// ==========================================

export function subscribeToInbox(onUpdate) {
    return db.collection('requests').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPeerMessages(data);
        if (onUpdate) onUpdate(data);
    });
}

export async function sendRequest(requestData) {
    return await db.collection('requests').add({
        ...requestData,
        status: "pending",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

export async function acceptRequest(id, userId) {
    return await db.collection('requests').doc(id).update({
        status: 'accepted',
        acceptedBy: userId || 'anonymous',
        acceptedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

// ==========================================
// USER & AUTH
// ==========================================

export async function getUserProfile(uid) {
    return await db.collection('users').doc(uid).get();
}

export async function createUserProfile(uid, data) {
    return await db.collection('users').doc(uid).set({
        ...data,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

export async function updateUserProfile(uid, data) {
    return await db.collection('users').doc(uid).update(data);
}

export async function uploadProfilePicture(uid, blob) {
    const storageRef = storage.ref().child(`users/${uid}/profile.jpg`);
    const snapshot = await storageRef.put(blob);
    return await snapshot.ref.getDownloadURL();
}

export async function deleteProfilePicture(uid) {
    return await db.collection('users').doc(uid).update({
        photoURL: firebase.firestore.FieldValue.delete()
    });
}
