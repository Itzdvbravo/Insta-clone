import {
    auth,
    db
} from "./firebase";
import firebase from "firebase/compat";
import {ERROR_ID} from "./Constants";
export const TESTER = "t"

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

// setTimeout(() => {
//     db.collection("posts").get().then(snap => {
//        setTimeout(() => {
//            console.log(snap.docs[0].data())
//        }, [3000])
//     })
// }, 5000)

export const getUserData = (userId) => {
    return new Promise((resolve, reject) => {
        if (sessionCache.get(userId)) {
            resolve(sessionCache.get(userId))
            return;
        }
        db.collection(TESTER + "users").doc(userId).get()
            .then(doc => {
                if (doc.exists) {
                    sessionCache.set(userId, {...doc.data(), uid: doc.id});
                    sessionCache.set(doc.data().displayName, doc.id);
                    resolve({
                        ...doc.data(),
                        "uid": doc.id
                    });
                } else {
                    reject({error: "Not exist", type: ERROR_ID.NOT_EXIST});
                }
            })
            .catch(err => {
                reject({error: err, type: ERROR_ID.OTHER});
            });
    });
};

export const getUserDataByUsername = (username) => {
    return new Promise((resolve, reject) => {
        if (sessionCache.get(username)) {
            resolve(sessionCache.get(sessionCache.get(username)))
            return;
        }
        db.collection(TESTER + "users").where("displayName", "==", username).get()
            .then(snapshot => {
                if (snapshot.empty) {
                    reject("Not exist");
                } else {
                    sessionCache.set(snapshot.docs[0].id, {...snapshot.docs[0].data(), uid: snapshot.docs[0].id});
                    sessionCache.set(snapshot.docs[0].data().displayName, snapshot.docs[0].id);
                    resolve({
                        ...snapshot.docs[0].data(),
                        uid: snapshot.docs[0].id
                    });
                }
            })
            .catch(err => {
                reject(err);
            });
    });
}

export const uploadPost = (post) => {
    return new Promise((resolve, reject) => {
        db.collection("posts").add({
            image: post,
            likes: [],
            comments: [],
            owner: auth.currentUser.uid,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then((snap) => {
            sessionCache.set(snap.id, {
                image: post,
                likes: [],
                comments: {},
                owner: auth.currentUser.uid,
                timestamp: {
                    seconds: new Date().getTime() / 1000,
                    toDate: function (){return new Date(this.seconds * 1000)}
                }
            })
            resolve()
        })
    })
}

export const getUserPosts = (user, timing = [">", 0], limit = 25) => {
    return new Promise((resolve, reject) => {
        // if (sessionCache.get("userPosts")) {
        //     const list = sessionCache.get("userPosts");
        //     const posts = [];
        //     list.forEach(post => {
        //         posts.push(sessionCache.get("post-" + post));
        //     });
        //     resolve(posts);
        //     return;
        // }
        db.collection("posts")
            .where("owner", '==', user)
            .orderBy("timestamp", "desc")
            .where("timestamp", timing[0], new Date(timing[1]))
            .limit(limit)
            .get().then((snapshot) => {
            const posts = [];
            // const forCache = [];
            snapshot.docs.forEach((snap) => {
                // if (!sessionCache.get("post-" + snap.id)) {
                //     sessionCache.set("post-" + snap.id, {...snap.data(), id: snap.id});
                // }
                posts.push({
                    ...snap.data(),
                    id: snap.id
                })
                // forCache.push(snap.id)
            })
            // sessionCache.set("userPosts-" + user, forCache)
            resolve(posts)
        })
    })
}

export const getUserPostsByLikes = (user, lessThan = 0, limit = 25) => {
    return new Promise((resolve, reject) => {
        // if (sessionCache.get("userPosts")) {
        //     const list = sessionCache.get("userPosts");
        //     const posts = [];
        //     list.forEach(post => {
        //         posts.push(sessionCache.get("post-" + post));
        //     });
        //     resolve(posts);
        //     return;
        // }
        db.collection("posts")
            .where("owner", '==', user)
            .orderBy("likesCount", "desc")
            .where("likesCount", "<=", lessThan)
            .limit(limit)
            .get().then((snapshot) => {
            const posts = [];
            // const forCache = [];
            snapshot.docs.forEach((snap) => {
                // if (!sessionCache.get("post-" + snap.id)) {
                //     sessionCache.set("post-" + snap.id, {...snap.data(), id: snap.id});
                // }
                posts.push({
                    ...snap.data(),
                    id: snap.id
                })
                // forCache.push(snap.id)
            })
            // sessionCache.set("userPosts-" + user, forCache)
            resolve(posts)
        })
    })
}

export const togglePostLike = (id, toggleTo) => {
    return new Promise((resolve, reject) => {
        const old = sessionCache.get("post-" + id);
        if (old) {
            old.likes = old.likes.filter(user => user !== auth.currentUser.uid)
            if (toggleTo) {
                old.likes.push(auth.currentUser.uid)
            }
            sessionCache.set("post-"+id, old)
        }
        db.collection("posts").doc(id).update({
            likes: toggleTo ?
                firebase.firestore.FieldValue.arrayUnion(auth.currentUser.uid) : firebase.firestore.FieldValue.arrayRemove(auth.currentUser.uid),
            likesCount: toggleTo ?
                firebase.firestore.FieldValue.increment(1) : firebase.firestore.FieldValue.increment(-1)
        }).then(e => resolve()).catch(err => {
            reject(err)
        })
    })
}

export const isFollowing = (following, user, boolean = false) => {
    return new Promise((resolve, reject) => {
        getUserData(following).then(async (data) => {
            if (data.exists) {
                let type = 0;
                const d = data.data()
                if (d["following"].includes(user)) {
                    type = 1
                } else if (d["followers"].includes(user)) {
                    type = 2
                }
                resolve(boolean ? Boolean(type) : type)
            } else {
                reject("Not exists")
            }
        })
    })
}

export const toggleFollow = (id, toggleTo = true) => {
    return new Promise(async (resolve, reject) => {
        const myData = await getUserData(auth.currentUser.uid)
        const otherData = await getUserData(id)

        const following = myData["following"];
        const followers = otherData["followers"];

        if (toggleTo) {
            following[id] = {}
            followers[auth.currentUser.uid] = {}
        } else {
            delete following[id]
            delete followers[auth.currentUser.uid]
        }

        sessionCache.set(auth.currentUser.uid, {
            ...myData,
            following: following
        })

        sessionCache.set(id, {
            ...otherData,
            followers: followers
        })

        await db.collection(TESTER + "users").doc(auth.currentUser.uid).update({
            following: following
        })

        await db.collection(TESTER + "users").doc(id).update({
            followers: followers
        })

        resolve(followers)
    })
}

export const getPost = (id) => {
    return new Promise((resolve, reject) => {
        if (sessionCache.get("post-"+ id)) {
            const post = sessionCache.get("post-" + id);
            resolve({...post, timestamp: {
                seconds: post.timestamp.seconds,
                nanoseconds: post.timestamp.nanoseconds,
                toDate: function (){return new Date(1e3 * this.seconds + this.nanoseconds / 1e6)}
            }})
            return;
        }
        db.collection("posts").doc(id).get().then((snap) => {
            if (snap.exists) {
                sessionCache.set("post-"+id, {...snap.data(), id:snap.id})
                resolve({...snap.data(), id:snap.id})
            } else {
                reject("Not exists")
            }
        })
    })
}

export const updatePost = (id, data) => {
    return new Promise((resolve, reject) => {
        sessionCache.set("post-"+id, {...sessionCache.get("post-"+id), image: data.image})
        db.collection("posts").doc(id).update(data).then(e => resolve()).catch(err => {
            reject(err)
        })
    })
}

export const deletePost = (id) => {
    return new Promise((resolve, reject) => {
        sessionCache.remove("post-"+id)
        db.collection("posts").doc(id).delete().then(e => {resolve()}).catch(err => reject(err))
    })
}

export const dumbness100 = (id1, id2) => {
    [id1, id2] = [id1, id2].sort()
    return id1 + " " + id2
}

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
            reject(e)
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
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                notReadBy: [user],
                deleted: false
            }).then(() => {
                resolve(d)
            }).catch((e) => {
                reject(e)
            })
        }).catch((e) => {
            reject(e)
        })
    })
}

export const addComment = (post, comment) => {
    return new Promise((resolve, reject) => {
        const old = sessionCache.get("post-" + post);
        if (old) {
            old.comments.push({id: auth.currentUser.uid, comment})
            sessionCache.set("post-"+post, old)
        }
        db.collection("posts").doc(post).update({
            comments: firebase.firestore.FieldValue.arrayUnion({id: auth.currentUser.uid, comment})
        }).then(() => {
            resolve()
        }).catch(e => {
            reject(e)
        })
    })
}

export const removeUnread = (user) => {
    return new Promise((resolve, reject) => {
        db.collection("messages").doc(dumbness100(auth.currentUser.uid, user)).collection("messages").where("notReadBy", "array-contains", auth.currentUser.uid).get().then((snap) => {
            snap.docs.forEach(doc => {
                doc.ref.update({
                    notReadBy: firebase.firestore.FieldValue.arrayRemove(auth.currentUser.uid)
                }).catch(e => {
                    reject(e)
                })
            })
        }).then(() => {
            resolve()
        }).catch(e => {
            reject(e)
        })
    })
}

export const deleteMessageFromFirebase = (user, uuid) => {
    return new Promise((resolve, reject) => {
        db.collection("messages").doc(dumbness100(auth.currentUser.uid, user)).collection("messages").doc(uuid).update({
            deleted: true,
            msg: "This message has been deleted"
        }).then(() => {
            resolve()
        }).catch((e) => {
            reject(e)
        })
    })
}
