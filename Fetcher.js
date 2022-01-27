import {
    auth,
    db
} from "./firebase";
import firebase from "firebase/compat";

export const localStorageCache = {
    get: (key) => {
        return JSON.parse(localStorage.getItem(key));
    },
    set: (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    },
    remove: (key) => {
        localStorage.removeItem(key);
    }
}

export const sessionCache = {
    get: (key) => {
        return JSON.parse(sessionStorage.getItem(key));
    },
    set: (key, value) => {
        sessionStorage.setItem(key, JSON.stringify(value));
    },
    remove: (key) => {
        sessionStorage.removeItem(key);
    }
}

export const getUserData = (userId) => {
    ///retrives the user data
};

export const addUserToMessages = (user) => {
    return new Promise(async (resolve, reject) => {
        const m1 = (await db.collection(TESTER + "users").doc(auth.currentUser.uid).get()).get("messages")
        if (m1[user]) {
            resolve(1)
        } else {
            const m2 = (await db.collection(TESTER + "users").doc(user).get()).get("messages")
            m1[user] = {show: true}
            m2[auth.currentUser.uid] = {show: true}
            db.collection("messages").doc(dumbness100(auth.currentUser.uid, user)).set({
                query: [auth.currentUser.uid, user]
            }).then(() => {
                db.collection(TESTER + "users").doc(auth.currentUser.uid).update({
                    messages: m1
                }).catch((e) => {
                    console.log(e)
                })
                db.collection(TESTER + "users").doc(user).update({
                    messages: m2
                }).catch((e) => {
                    console.log(e)
                })
                resolve(0)
            }).catch((err) => {
                reject(err)
            })
        }
    })
}

export const getUsersLatestMessage = (user) => {
    return new Promise((resolve, reject) => {
        db.collection("messages").doc(dumbness100(auth.currentUser.uid, user)).collection("messages").orderBy("timestamp", "desc").limit(1).get().then((snap) => {
            if (snap.empty) {
                resolve(null)
            } else {
                resolve(snap.docs[0].data())
            }
        }).catch(e => {
            console.log(e)
        })
    })
}

export const getUserMessages = (user, timestamp, limit = 21) => {
    return new Promise((resolve, reject) => {
        db.collection("messages").doc(dumbness100(auth.currentUser.uid, user)).collection("messages").orderBy("timestamp", "desc").where("timestamp", timestamp[0], new Date(timestamp[1])).limit(limit).get().then((snap) => {
            if (snap.empty) {
                resolve({messages: [], hasMore: false})
            } else {
                const messages = snap.docs.map(doc => {return{...doc.data(), id: doc.id}})
                messages.splice(messages.length - 1, 1)
                resolve({messages: messages, hasMore: snap.docs.length === limit})
            }
        }).catch(e => {
            console.log(e)
        })
    })
}

export const sendMessage = (user, message, uuid) => {
    return new Promise((resolve, reject) => {
        addUserToMessages(user).then((d) => {
            db.collection("messages").doc(dumbness100(auth.currentUser.uid, user)).collection("messages").doc(uuid).set({
                msg: message,
                user: auth.currentUser.uid,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                resolve(d)
            }).catch((e) => {
                console.log(e)
            })
        }).catch((e) => {
            console.log(e)
        })
    })
}
