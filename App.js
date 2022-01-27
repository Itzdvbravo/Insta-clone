import './app.css';
import React, {useState, lazy, Suspense, useEffect, useRef} from "react";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import {ROUTER__MAIN as ROUTER, SYNCRONIZED__LOADING__DEPENDENCY__ON__LOCATION} from "./Constants";
import {auth, db} from "./firebase";
import userContext from "./Contexts/userContext";
import isMobileContext from "./Contexts/isMobileContext";
import postsContext from "./Contexts/postsContext";
import Header from "./Components/Header";
import {
    convertTimestampToDayWeekMonthMin,
    dumbModificationForUsuablePost, dumbness100, getPost,
    getUserData,
    getUserPosts, getUsersLatestMessage, localStorageCache, sessionCache,
    TESTER
} from "./Fetcher";
import useWindowSize from './customHooks/useWindowSize';

const Home = lazy(() => import("./Pages/Home"));
const Profile = lazy(() => import("./Pages/Profile"));
const MainPost = lazy(() => import("./Pages/MainPost"));
const Authentication = lazy(() => import('./Pages/Authentication'));
const Edit = lazy(() => import('./Pages/Edit'));
const SearchPage = lazy(() => import('./Pages/SearchPage'));
const Account = lazy(() => import('./Pages/Account'));
const Messenger = lazy(() => import('./Messenger/Messenger'))

function App() {
    const [user, setUser] = useState(null);

    //auth.onChanged -> setUser
    
    const [musers, setMUsers] = useState([])

    const [liveConnects, _setLiveConnects] = useState({})
    const liveConnectsRef = useRef(liveConnects);
    const setLiveConnects = (liveConnects) => {
        if (typeof liveConnects === 'function') {
            _setLiveConnects(currConnects => {
                const newConnects = liveConnects(currConnects);
                liveConnectsRef.current = newConnects;
                return newConnects;
            })
        } else {
            liveConnectsRef.current = liveConnects;
            _setLiveConnects(liveConnects);
        }
    }

    const [messages, _setMessages] = useState({})
    const messagesRef = useRef(messages);
    const setMessages = (messages) => {
        if (typeof messages === 'function') {
            _setMessages(currMessages => {
                const newMessages = messages(currMessages);
                messagesRef.current = newMessages;
                return newMessages;
            })
        } else {
            messagesRef.current = messages;
            _setMessages(messages);
        }
    }

    const [changedMessages, setChangedMessages] = useState([])

    const connectLive = (muser) => {
        if (Boolean(liveConnects[muser])) return;
        db.collection("messages").doc(dumbness100(user.uid, muser)).get().then((data) => {
            if (!data.exists) return;
            let live = db.collection("messages").doc(dumbness100(user.uid, muser)).collection("messages").orderBy("timestamp", "desc").limit(21).onSnapshot(snapshot => {
                if (liveConnectsRef.current[muser]) {
                    setChangedMessages([muser, snapshot.docChanges()])
                } else {
                    const list = [];
                    //Only 20 messages will be saved, 21 is retrieved just to check if more than 20 messages are there
                    snapshot.docChanges().forEach((snap, ind) => {
                        if (ind >= 20) return;
                        list.push({...snap.doc.data(), id: snap.doc.id})
                    })
                    setMUsers(currMusers => {
                        const index = currMusers.findIndex(m => m.uid === muser);
                        if (index !== -1) {
                            currMusers[index].hasMoreMessages = snapshot.size > 20;
                        }
                        return currMusers;
                    })
                    setMessages(currMessages => {return {...currMessages, [muser]: list}})
                    setLiveConnects(currConnects => {return {...currConnects, [muser]: live}})
                }
            })
        })
    }

    useEffect(() => {
        if (user && user.verified) {
            var local = localStorageCache.get("sortedPosts")
            if (!posts.length || (local && local.users.length !== Object.keys(user.following).length)) {
                const getPostsFromFirebase = (timing = [">", 0]) => {
                    return new Promise((resolve, reject) => {
                        const users = [...Object.keys(user.following), user.uid]
                        const psts = [];
                        users.forEach(async (id, ind) => {
                            const pst = await getUserPosts(id, timing)
                            psts.push(...pst)
                            if (ind+1 === users.length) {
                                resolve(psts)
                            }
                        })
                    })
                }

                const sortAndSetPosts = (psts, saveToLocal = 1) => {
                    dumbModificationForUsuablePost(psts).then((p) => {
                        if (saveToLocal === 1) {
                            localStorageCache.set("sortedPosts", {
                                "posts": p.map(e => {return e.post.id}),
                                "users": Object.keys(user.following),
                                "timestamp": new Date().getTime(),
                                "postRetrievedOn": new Date().getTime()
                            })
                        } else if (saveToLocal === 2) {
                            localStorageCache.set("sortedPosts", {
                                "posts": p.map(e => {return e.post.id}),
                                "users": Object.keys(user.following),
                                "timestamp": localStorageCache.get("sortedPosts").timestamp,
                                "postRetrievedOn": new Date().getTime()
                            })
                        }
                        p.sort((a,b) => {
                            return b.post.likes.length - a.post.likes.length
                        })
                        setPosts(p)
                        const location = "/" + (document.location.pathname.split("/")[1])
                        if (SYNCRONIZED__LOADING__DEPENDENCY__ON__LOCATION.post.indexOf(location) !== -1 && !fullyLoaded) {setFullyLoaded(true)}
                    })
                }

                if (local && local.timestamp + (1000 * 60 * 60 * 24) > new Date().getTime()) {
                    const psts = []
                    local["posts"].forEach((id, ind) => {
                        getPost(id).then((post) => {
                            psts.push({...post, id: id})
                            if (ind+1 === local["posts"].length) {
                                sortAndSetPosts(psts, 0)
                            }
                        }).catch((err) => {
                            if (ind+1 === local["posts"].length) {
                                sortAndSetPosts(psts, 0)
                            }
                        })
                    })
                    getPostsFromFirebase([">", local.postRetrievedOn]).then((data) => {
                        if (data.length) {
                            sortAndSetPosts(psts.concat(data), 2)
                        }
                    })
                } else {
                    getPostsFromFirebase().then((psts) => {
                        sortAndSetPosts(psts)
                    })
                }
            }
            let list = []
            var musersC = Object.keys(user.messages).filter(m => !liveConnects[m])
            for (let i=0;i < musersC.length;i++) {
                getUserData(musersC[i]).then(async data => {
                    const latestMessage = await getUsersLatestMessage(musersC[i])
                    var timestamp = ""
                    if (latestMessage) {timestamp = convertTimestampToDayWeekMonthMin(latestMessage.timestamp.toDate())}
                    list.push({...data, uid: musersC[i], latestMessage: {...latestMessage, ago: timestamp}})
                    if (i+1 === musersC.length) {
                        list.sort(function(a, b){
                            if (a.latestMessage.timestamp && b.latestMessage.timestamp) {
                                return b.latestMessage.timestamp.seconds - a.latestMessage.timestamp.seconds
                            }
                            if (a.latestMessage.timestamp === undefined &&  b.latestMessage.timestamp === undefined) {return 0}
                            else if (a.latestMessage.timestamp===undefined) {return 1}
                            else if (b.latestMessage.timestamp===undefined) {return -1}
                        });
                        setMUsers(list)
                    }
                })
            }
        }
    }, [user])

    useEffect(() => {
        musers.forEach(muser => {
            connectLive(muser.uid)
        })
    }, [musers])


    return (
        <div className={"App"}>
            {fullyLoaded ? (
               <isMobileContext.Provider value={{isMobile}}>
                   <userContext.Provider value={{user}}>
                       <postsContext.Provider value={{basePosts: posts, setBasePosts: setPosts}}>
                           <Router>
                               {user && (<Header/>)}
                               <Suspense fallback={<p>Fetching</p>}>
                                   {user && user.verified ? (
                                       <Routes>
                                           <Route path={ROUTER.MESSENGER} element={<Messenger connectedUsers={musers} messages={messages} setMessages={setMessages} changesMade={changedMessages}/>}/>
                                           <Route path={"*"} element={<center><p style={{marginTop: '10px', fontSize: '20px', fontWeight: 500}}>Page not found! 404 ERROR</p></center>}/>
                                       </Routes>
                                   ) : (
                                       <Routes>
                                           <Route path={'*'} element={<Authentication />}/>
                                       </Routes>
                                   )}
                               </Suspense>
                           </Router>
                       </postsContext.Provider>
                   </userContext.Provider>
               </isMobileContext.Provider>
            ) : (
                <div>Loading...</div>
            )}
        </div>
    )
}

export default App;
