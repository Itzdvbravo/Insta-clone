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
    const [fullyLoaded, setFullyLoaded] = useState(false);
    const [isMobile, setIsMobile] = useState([false, false]);

    const [posts, setPosts] = useState([])
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

    const [width, height] = useWindowSize();
    const timeout = useRef(0)

    const deviceCheck = function() {
        let check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    };

    useEffect(() => {
        const time = new Date().getTime()
        if (time - timeout.current < 1000) return;
        timeout.current = time
        const check = deviceCheck();
        const cssCheck = width > 740 ? false : check;
        if (cssCheck === isMobile[0] || check === isMobile[1]) return;
        setIsMobile([cssCheck, check])
    }, [width,height]);


    useEffect(() => {
        sessionStorage.clear()
        auth.onAuthStateChanged(user => {
            if (user) {
                db.collection(TESTER + "users").doc(user.uid).onSnapshot((d) => {
                    sessionCache.set(user.uid, {uid: d.id, ...d.data(), verified: true})
                    setUser({uid: d.id, ...d.data(), verified: true})
                })
                const check = deviceCheck()
                setIsMobile([width > 740 ? false : check, check])
            } else {
                setFullyLoaded(true)
            }
        });
    }, []);

    const connectLive = (muser) => {
        if (Boolean(liveConnects[muser])) return;
        db.collection("messages").doc(dumbness100(user.uid, muser)).get().then((data) => {
            if (!data.exists) return;
            let live = db.collection("messages").doc(dumbness100(user.uid, muser)).collection("messages").orderBy("timestamp", "desc").limit(21).onSnapshot(snapshot => {
                if (liveConnectsRef.current[muser]) {
                    setChangedMessages([muser, snapshot.docChanges()])
                } else {
                    const list = [];
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

    useEffect(() => {
        if (!user || fullyLoaded) return;
        const location = "/" + (document.location.pathname.replace("#", "/").split("/")[1])
        if (SYNCRONIZED__LOADING__DEPENDENCY__ON__LOCATION.messenger.indexOf(location) !== -1) {
            if (Object.keys(user.messages).length === Object.keys(messages).length) {setFullyLoaded(true)}
        } else {
            if (SYNCRONIZED__LOADING__DEPENDENCY__ON__LOCATION.messenger.indexOf(location) === -1 &&
                SYNCRONIZED__LOADING__DEPENDENCY__ON__LOCATION.post.indexOf(location) === -1) {
                setFullyLoaded(true)
            }
        }
    }, [messages])

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
                                           <Route path={ROUTER.HOME} element={ <Home />}/>
                                           <Route path={ROUTER.PROFILE} element={<Profile />}/>
                                           <Route path={ROUTER.MAINPOST} element={<MainPost />}/>
                                           <Route path={ROUTER.EDIT} element={<Edit />}/>
                                           <Route path={ROUTER.SEARCH} element={<SearchPage />}/>
                                           <Route path={ROUTER.ACCOUNT} element={<Account />}/>
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
