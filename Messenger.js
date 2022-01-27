import './messenger.css';
import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import {db} from "../firebase";
import userContext from "../Contexts/userContext";
import {
    getUserData, getUserMessages,
    sendMessage
} from "../Fetcher";
import {Avatar} from "@material-ui/core";
import {ChevronLeft, Collections, TagFaces} from "@material-ui/icons";
import useWindowSize from "../customHooks/useWindowSize";
import isMobileContext from "../Contexts/isMobileContext";
import {useNavigate} from "react-router-dom";
import {useStateValue} from "../TempData/StateProvider";
import RenderMessages from "./RenderMessages";
import {uuidv4} from "../Components/Utils";

function Messenger({connectedUsers, messages, setMessages, changesMade}) {
    const {user} = useContext(userContext) // the main user
    const [users, setUsers] = useState(connectedUsers);
    useEffect(() => {
        setUsers(connectedUsers);
    }, [connectedUsers]) // created another state for it, because, if someone clicks "message" in a page to a user, and doesn't send a message 
                         //it won't be added to connectedUsers/saved to user's "message" 
                         //list or else it'll try to connect using onSnapShot which will give an error

    const [w,h] = useWindowSize();
    const [hash, sH] = useState(window.location.hash);

    const {isMobile} = useContext(isMobileContext)
    const navigate = useNavigate()
    const [{back}, dispatch] = useStateValue()

    const [messagingUser, setMessagingUser] = useState(null);

    const observer = useRef();
    const lastMessageRef = useCallback(node => {
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && messagingUser && messagingUser.hasMoreMessages) {
                messagingUser.hasMoreMessages = false;
                getUserMessages(messagingUser.uid, ["<", messages[messagingUser.uid][messages[messagingUser.uid].length - 1].timestamp.toDate()]).then(data => {
                    messagingUser.hasMoreMessages = data.hasMore
                    setMessages(currMessages => {
                        return {...currMessages,
                            [messagingUser.uid]: [...currMessages[messagingUser.uid], ...data.messages]}
                    })
                })
            }
        });
        if (node) observer.current.observe(node);
    }, [messagingUser, messages]);

    const setHash = (h) => {
        window.location.hash = h
        sH(h)
    }

    useEffect(() => {
        if (messagingUser) {
            const inbox = document.querySelector('.messenger__inbox-body');
            if (inbox) {
                inbox.scrollTop = inbox.scrollHeight;
            }
        }
    }, [messagingUser])

    useEffect(() => {
        if (hash.replace("#", "") !== "") {
            var index = users.findIndex(u => u.uid === hash.replace("#", ""))
            if (index !== -1) {
                setMessagingUser(users[index])
            } else {
                getUserData(hash.replace("#", "")).then((u) => {
                    setUsers(currUsers => [u, ...currUsers])
                    setMessages({...messages, [u.uid]: []})
                    setMessagingUser(u)
                }).catch(() => {
                    setHash('')
                })
            }
        }
    }, [])

    useEffect(() => {
        if (changesMade.length) {
            changesMade[1].forEach(c => {
                if (c.type === 'added') {
                    if (c.doc.data().user !== user.uid) {
                        console.log(c.doc.id)
                        setMessages(
                            {...messages, [c.doc.data().user]: [{id: c.doc.id, ...c.doc.data()}, ...messages[c.doc.data().user]]}
                        )
                    }
                } else if (c.type === 'modified') {
                    const index = messages[changesMade[0]].findIndex(m => m.id === c.doc.id);
                    messages[changesMade[0]][index] = {...c.doc.data(), id: c.doc.id}
                }
            })
        }
    }, [changesMade])

    return (
        <div className="Messenger">
            {isMobile[0] && (
                <center className='messenger__header' style={{display: w < 740 && hash.replace("#", "") !== "" ? 'none' : 'flex'}}>
                    <ChevronLeft className='messenger__backBtn' onClick={() => {
                        navigate(back ?? "/")
                    }}/>
                    <p>Chats</p>
                </center>
            )}
            {user && (
                <div className="messenger__container" style={{height: w < 740 && !isMobile[1] ? "calc(100vh - 160)" : "calc(100vh - 80px)"}}>
                    <div className="messenger__left" style={{display: w < 740 && hash.replace("#", "") !== "" ? 'none' : 'block'}}>
                        <p className={"messenger__owner"}>{user.displayName}</p>
                        <div className="messenger__list">
                            {users.map((user, i) => (
                                <div key={user.uid} className={"messenger__item"} style={{cursor: hash === user.uid ? 'default' : 'pointer'}} onClick={() => {setHash(user.uid);setMessagingUser(user)}}>
                                    <Avatar
                                        src={user.avatar}
                                        alt={user.displayName}
                                        className={"messenger__item-avatar"}
                                    />
                                    <div className="messenger__item-info">
                                        <p className="messenger__item-name">{user.displayName}</p>
                                        <div className="messenger__item-msg" style={{display: user.latestMessage ? 'flex' : 'none'}}><p className={"messenger__item-realMsg"}>{user.latestMessage?.msg}</p><p className={"messenger__item-msg__bullet"}>&#8226;</p> <p>{user.latestMessage?.ago}</p></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="messenger__inbox" style={{display: w < 740 && hash.replace("#", "") === "" ? 'none' : 'block'}}>
                        {hash === '' || !messagingUser ? (
                            <div className="messenger__inbox-empty">
                                <div className={"messenger__inbox-emptyContainer"}><p>You can send private photos and messages to friends</p></div>
                            </div>
                        ) : (
                            <div className={"messenger__inbox-user"}>
                                    <div className={"messenger__inbox-header"}>
                                        <ChevronLeft className='messenger__inbox-back' onClick={() => {
                                            setHash("#")
                                        }}/>
                                        <div className={"messenger__inbox-headerUser"}>
                                            <Avatar
                                                alt={messagingUser.displayName}
                                                src={messagingUser.avatar}
                                                className={"messenger__inbox-headerUser-avatar"}
                                            />
                                            <p className={"messenger__inbox-headerUser-name"}>{messagingUser.displayName}</p>
                                        </div>
                                    </div>
                                <div className={"messenger__inbox-body"}>
                                    {messages[messagingUser.uid]?.length && (
                                        <RenderMessages messages={messages[messagingUser.uid]} messagingUser={messagingUser} lastMessageRef={lastMessageRef}/>
                                    )}
                                </div>
                                <div className={"messenger__inbox-input"}>
                                    <TagFaces />
                                    <input placeholder={"Message..."} onKeyPress={(e) => {
                                        if (e.code.toLowerCase() === 'enter' && e.target.value !== '') {
                                            var msg = e.target.value
                                            const copy = users
                                            var index = users.findIndex(user => user.uid === messagingUser.uid)
                                            users.splice(index, 1)
                                            users.unshift({
                                                ...messagingUser,
                                                latestMessage: {
                                                    msg: msg,
                                                    ago: 'Just now',
                                                    timestamp: Date.now()
                                                }
                                            })
                                            const uuid = uuidv4()
                                            setMessages(currMessages => {
                                                return {...currMessages,
                                                    [messagingUser.uid]: [{
                                                        msg: msg,
                                                        user: user.uid,
                                                        timestamp: {
                                                            seconds: (new Date()).getTime() / 1000,
                                                            toDate: function() {return this.seconds * 1000}
                                                        },
                                                        id: uuid
                                                } ,...currMessages[messagingUser.uid]]}
                                            })
                                            document.querySelector('.messenger__inbox-body').scrollTop = document.querySelector('.messenger__inbox-body').scrollHeight
                                            sendMessage(messagingUser.uid, msg, uuid)
                                            e.target.value = ''
                                        }
                                    }}/>
                                    <Collections />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Messenger;
