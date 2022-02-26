import './profile.css';
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {getUserData, getUserDataByUsername, getUserPosts, toggleFollow} from "../Fetcher";
import {useContext, useEffect, useState} from "react";
import {Avatar, Box, Button, Modal} from "@material-ui/core";
import {Apps, AssignmentIndOutlined, Close, Done, GroupAdd, MovieCreation, Person} from "@material-ui/icons";
import isMobileContext from "../Contexts/isMobileContext";
import {ACCOUNT_EDIT_OPTIONS, ROUTER} from "../Constants";
import userContext from "../Contexts/userContext";
import Post from '../Components/Post';
import {useStateValue} from '../TempData/StateProvider';
import {actionTypes} from "../TempData/Reducer";
import {dumbModificationForUsuablePost} from "../Utils";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
}

function Profile() {
    const {user} = useContext(userContext);
    const [{}, dispatch] = useStateValue()

    const username = useParams()["username"]
    const [data, setData] = useState(null)
    const [posts, setPosts] = useState([])

    const [error, setError] = useState(null)
    const navigate = useNavigate()
    const location = useLocation()

    const isMobile = (useContext(isMobileContext))["isMobile"][0]

    const [selection, setSelection] = useState(0)

    const [followers, setFollowers] = useState("")
    const [following, setFollowing] = useState("")

    const [followed, setFollowed] = useState(0)

    const [showFollowersInfo, setShowFollowersInfo] = useState({open: false, type: null})
    const [showFollowersList, setShowFollowersList] = useState([])

    useEffect(() => {
        getUserDataByUsername(username).then(d => {
            getUserPosts(d.uid).then(async (data) => {
                const p = await dumbModificationForUsuablePost(data);
                p.sort((a, b) => {
                    return b.post.timestamp.seconds - a.post.timestamp.seconds
                })
                const finalP = [];
                let batch = [];
                for (let i = 0; i < p.length; i++) {
                    console.log("i: " + i, p.length)
                    batch.push(p[i])

                    if ((i + 1) % 3 === 0 || i === p.length - 1) {
                        console.log(batch)
                        for (let j=batch.length;j<3;j++) {
                            batch.push(null)
                        }
                        finalP.push(batch)
                        batch = []
                    }
                }
                let type = 0;
                if (user.following[d.uid]) {
                    type = 1
                } else if (user.followers[d.uid]) {
                    type = 2
                }
                setFollowed(type)
                setPosts(finalP)
                setData({ ...d, postsLength: p.length })
            })
        }).catch((err) => {
            setError("User not found")
        })
        return () => {
            setFollowed(0)
            setData(null)
            setPosts([])
            setError(null)
            setShowFollowersInfo({open: false, type: null})
            setShowFollowersList([])
        }
    }, [username])

    useEffect(() => {
        if (data) {
            let frs = `${Object.keys(data.followers).length}`;
            let fing = `${Object.keys(data.following).length}`;

            const changeToString = (number) => {
                const getDecimal = (min) => {
                    var n = parseInt(number)
                    return `${(n - (Math.floor(n / min) * min))}`.substr(0, 2)
                }

                if (parseInt(number) > 999 && parseInt(number) < 9999) {
                    number = number.charAt(0) + "," + number.slice(1)
                }
                if (parseInt(number) > 9999 && parseInt(number) < 99999) {
                    number = Math.floor(parseInt(number) / 1000) + "." + getDecimal(10000) + "K"
                }
                if (parseInt(number) > 99999 && parseInt(number) < 999999) {
                    number = number.charAt(0) + number.charAt(1) + number.charAt(2) + "," + number.slice(3)
                }
                if (parseInt(number) > 999999) {
                    number = Math.floor(parseInt(number) / 1000000) + "." + getDecimal(100000) + "M"
                }
                return number
            }

            frs = changeToString(frs)
            fing = changeToString(fing)
            setFollowers(frs)
            setFollowing(fing)
        }
    }, [data])

    useEffect(() => {
        if (showFollowersInfo.type || showFollowersInfo.type === 0) {
            if (showFollowersInfo.type === 0) {
                Promise.all(Object.keys(data.followers).map(async (id) => {
                    return await getUserData(id)
                })).then(d => {
                    setShowFollowersList(d)
                })
            } else if (showFollowersInfo.type === 1) {
                Promise.all(Object.keys(data.following).map(async (id) => {
                    return await getUserData(id)
                })).then(d => {
                    setShowFollowersList(d)
                })
            }
        }
    }, [showFollowersInfo])

    return (
        <div>
            <Modal open={showFollowersInfo.open} onClose={() => setShowFollowersInfo({open: false, type: null})}>
                <Box sx={style} className={"profile__showfollowers"}>
                    <div className={"profile__showfollowers-header"}>
                        <p>{showFollowersInfo.type ? "Following" : "Followers"}</p>
                        <Close onClick={() => {setShowFollowersInfo({open: false, type: null})}} />
                    </div>
                    <div className={"profile__showfollowers-list"}>
                        {showFollowersList.map((u) => {
                            return(
                                <div key={u.uid} className={"profile__showfollowers-item"} onClick={() => {navigate(`${ROUTER.PROFILE}/${u.displayName}`)}}>
                                <Avatar
                                    src={u.avatar}
                                    alt={u.displayName}
                                    className={"profile__showfollowers-avatar"}
                                />
                                <p onClick={() => {navigate("/user/itzdvbravo")}}>{u.displayName}</p>
                            </div>)
                        })}
                    </div>
                </Box>
            </Modal>
            {error == null ? (
                <div className="Profile">
                    {isMobile && (
                        <div className={"profile__header"}>
                            <svg viewBox={"0 0 48 48"} role={"img"} onClick={() => {navigate(`${ROUTER.ACCOUNT}$choose`)}}>
                                <path clipRule="evenodd" d="M46.7 20.6l-2.1-1.1c-.4-.2-.7-.5-.8-1-.5-1.6-1.1-3.2-1.9-4.7-.2-.4-.3-.8-.1-1.2l.8-2.3c.2-.5 0-1.1-.4-1.5l-2.9-2.9c-.4-.4-1-.5-1.5-.4l-2.3.8c-.4.1-.8.1-1.2-.1-1.4-.8-3-1.5-4.6-1.9-.4-.1-.8-.4-1-.8l-1.1-2.2c-.3-.5-.8-.8-1.3-.8h-4.1c-.6 0-1.1.3-1.3.8l-1.1 2.2c-.2.4-.5.7-1 .8-1.6.5-3.2 1.1-4.6 1.9-.4.2-.8.3-1.2.1l-2.3-.8c-.5-.2-1.1 0-1.5.4L5.9 8.8c-.4.4-.5 1-.4 1.5l.8 2.3c.1.4.1.8-.1 1.2-.8 1.5-1.5 3-1.9 4.7-.1.4-.4.8-.8 1l-2.1 1.1c-.5.3-.8.8-.8 1.3V26c0 .6.3 1.1.8 1.3l2.1 1.1c.4.2.7.5.8 1 .5 1.6 1.1 3.2 1.9 4.7.2.4.3.8.1 1.2l-.8 2.3c-.2.5 0 1.1.4 1.5L8.8 42c.4.4 1 .5 1.5.4l2.3-.8c.4-.1.8-.1 1.2.1 1.4.8 3 1.5 4.6 1.9.4.1.8.4 1 .8l1.1 2.2c.3.5.8.8 1.3.8h4.1c.6 0 1.1-.3 1.3-.8l1.1-2.2c.2-.4.5-.7 1-.8 1.6-.5 3.2-1.1 4.6-1.9.4-.2.8-.3 1.2-.1l2.3.8c.5.2 1.1 0 1.5-.4l2.9-2.9c.4-.4.5-1 .4-1.5l-.8-2.3c-.1-.4-.1-.8.1-1.2.8-1.5 1.5-3 1.9-4.7.1-.4.4-.8.8-1l2.1-1.1c.5-.3.8-.8.8-1.3v-4.1c.4-.5.1-1.1-.4-1.3zM24 41.5c-9.7 0-17.5-7.8-17.5-17.5S14.3 6.5 24 6.5 41.5 14.3 41.5 24 33.7 41.5 24 41.5z" fillRule="evenodd" />
                            </svg>
                            <p className={"profile__headerUsername"}>{data?.displayName}</p>
                            <GroupAdd />
                        </div>
                    )}
                    {data && (
                        <div className={"profile__container profile__scroller"}>
                            <div className={"profile__userInfo"}>
                                <div className={"profile__userHeader"}>
                                    <Avatar className={"profile__userAvatar"} src={data.avatar} alt={data.displayName} />
                                    <div className={"profile__userHeaderSide"}>
                                        <div className={"profile__useHeaderSideUpper"}>
                                            <div style={{ display: "flex", alignItems: "center" }}>
                                                <p className={"profile__username"}>{data.displayName}</p>
                                                {!isMobile && user.uid == data.uid && (
                                                    <svg className={"settings__icon"} viewBox={"0 0 48 48"} role={"img"} onClick={() => {navigate(`${ROUTER.ACCOUNT}#choose`)}}>
                                                        <path clipRule="evenodd" d="M46.7 20.6l-2.1-1.1c-.4-.2-.7-.5-.8-1-.5-1.6-1.1-3.2-1.9-4.7-.2-.4-.3-.8-.1-1.2l.8-2.3c.2-.5 0-1.1-.4-1.5l-2.9-2.9c-.4-.4-1-.5-1.5-.4l-2.3.8c-.4.1-.8.1-1.2-.1-1.4-.8-3-1.5-4.6-1.9-.4-.1-.8-.4-1-.8l-1.1-2.2c-.3-.5-.8-.8-1.3-.8h-4.1c-.6 0-1.1.3-1.3.8l-1.1 2.2c-.2.4-.5.7-1 .8-1.6.5-3.2 1.1-4.6 1.9-.4.2-.8.3-1.2.1l-2.3-.8c-.5-.2-1.1 0-1.5.4L5.9 8.8c-.4.4-.5 1-.4 1.5l.8 2.3c.1.4.1.8-.1 1.2-.8 1.5-1.5 3-1.9 4.7-.1.4-.4.8-.8 1l-2.1 1.1c-.5.3-.8.8-.8 1.3V26c0 .6.3 1.1.8 1.3l2.1 1.1c.4.2.7.5.8 1 .5 1.6 1.1 3.2 1.9 4.7.2.4.3.8.1 1.2l-.8 2.3c-.2.5 0 1.1.4 1.5L8.8 42c.4.4 1 .5 1.5.4l2.3-.8c.4-.1.8-.1 1.2.1 1.4.8 3 1.5 4.6 1.9.4.1.8.4 1 .8l1.1 2.2c.3.5.8.8 1.3.8h4.1c.6 0 1.1-.3 1.3-.8l1.1-2.2c.2-.4.5-.7 1-.8 1.6-.5 3.2-1.1 4.6-1.9.4-.2.8-.3 1.2-.1l2.3.8c.5.2 1.1 0 1.5-.4l2.9-2.9c.4-.4.5-1 .4-1.5l-.8-2.3c-.1-.4-.1-.8.1-1.2.8-1.5 1.5-3 1.9-4.7.1-.4.4-.8.8-1l2.1-1.1c.5-.3.8-.8.8-1.3v-4.1c.4-.5.1-1.1-.4-1.3zM24 41.5c-9.7 0-17.5-7.8-17.5-17.5S14.3 6.5 24 6.5 41.5 14.3 41.5 24 33.7 41.5 24 41.5z" fillRule="evenodd" />
                                                    </svg>
                                                )}
                                                <p className={"profile__username"}>{data.username}</p>
                                            </div>
                                            {user.uid === data.uid ? (
                                                <Button disabled={!user?.verified} className={"profile__editBtn"} onClick={() => {
                                                    navigate(`${ROUTER.ACCOUNT}${ACCOUNT_EDIT_OPTIONS.EDIT_PROFILE}`)
                                                }}>Edit Profile</Button>
                                            ) : (
                                                <div>
                                                    {followed !== 1 ? (
                                                        <div className='profile__follow-message'>
                                                            {followed === 0 ? (
                                                                <p className='profile__follow-followBtn' onClick={() => {
                                                                    toggleFollow(data.uid).then((f) => {
                                                                        setFollowed(1)
                                                                        setData({ ...data, followers: f })
                                                                    })
                                                                }}>Follow</p>
                                                            ) : (
                                                                <p className='profile__follow-followBtn' onClick={() => {
                                                                    toggleFollow(data.uid).then((f) => {
                                                                        setFollowed(1)
                                                                        setData({ ...data, followers: f })
                                                                    })
                                                                }}>Follow Back</p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className='profile__follow-message'>
                                                            <p className='profile__follow-messageBtn' onClick={() => {
                                                                dispatch({
                                                                    type: actionTypes.BACK,
                                                                    back: location.pathname
                                                                })
                                                                navigate(ROUTER.MESSENGER + `#${data.uid}`)
                                                            }}>Message</p>
                                                            <div className='profile__follow-unfollowBtn' onClick={() => {
                                                                toggleFollow(data.uid, false).then((f) => {
                                                                    setFollowed(0)
                                                                    setData({ ...data, followers: f })
                                                                })
                                                            }}><Person /><Done className='profile__follow-messageTick' /></div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className={"profile__userStatistics showonpc"}>
                                            <div style={{cursor: "default"}}>
                                                <p>{data.postsLength}</p>
                                                <p>Posts</p>
                                            </div>
                                            <div onClick={() => {setShowFollowersInfo({open: true, type: 0})}}>
                                                <p>{followers}</p>
                                                <p>Followers</p>
                                            </div>
                                            <div onClick={() => {setShowFollowersInfo({open: true, type: 1})}}>
                                                <p>{following}</p>
                                                <p>Following</p>
                                            </div>
                                        </div>
                                        <div className={"profile__userDetail profile__userDetail_n showonpc"}>
                                            <p className={"profile__userDetailName"}>{data.displayName}</p>
                                            <p className={"profile__bio"}>{data.bio}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={"profile__userDetail notshowonpc"}>
                                    <p className={"profile__userDetailName"}>{data.displayName}</p>
                                    <p className={"profile__bio"}>{data.bio}</p>
                                </div>
                                <div className={"profile__userStatistics notshowonpc"}>
                                    <div>
                                        <p>{data.postsLength}</p>
                                        <p>Posts</p>
                                    </div>
                                    <div onClick={() => {setShowFollowersInfo({open: true, type: 0})}}>
                                        <p>{followers}</p>
                                        <p>Followers</p>
                                    </div>
                                    <div onClick={() => {setShowFollowersInfo({open: true, type: 1})}}>
                                        <p>{following}</p>
                                        <p>Following</p>
                                    </div>
                                </div>
                            </div>
                            <div className={"profile__selection"}>
                                <div className={"profile__selectionContainer"}>
                                    <div onClick={() => { setSelection(0) }}>
                                        <Apps style={{ 'color': selection === 0 ? 'black' : '#8e8e8e' }} />
                                        <p style={{ 'color': selection === 0 ? 'black' : '#8e8e8e' }} className={"showonpc"}>Posts</p>
                                    </div>
                                    <div onClick={() => { setSelection(1) }}>
                                        <MovieCreation style={{ 'color': selection === 1 ? 'black' : '#8e8e8e' }} />
                                        <p style={{ 'color': selection === 1 ? 'black' : '#8e8e8e' }} className={"showonpc"}>Reels</p>
                                    </div>
                                    <div onClick={() => { setSelection(2) }}>
                                        <AssignmentIndOutlined style={{ 'color': selection === 2 ? 'black' : '#8e8e8e' }} />
                                        <p style={{ 'color': selection === 2 ? 'black' : '#8e8e8e' }} className={"showonpc"}>Tags</p>
                                    </div>
                                </div>
                            </div>
                            {selection === 0 && (
                                <div className={"posts__container"}>
                                    <div className={"posts__row"}>
                                    </div>
                                    {posts.map((data, i) => (
                                        <div key={i} className={"posts__row"}>
                                            {data.map((d) => (
                                                <div key={d?.post.id} className='post'>
                                                   {d && (
                                                       <Post data={d.post} user={d.user} personal={true} />
                                                   )}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {selection === 1 && (
                                <div className={"reels__container"}>
                                    <p>Reels</p>
                                </div>
                            )}
                            {selection === 2 && (
                                <div className={"tags__container"}>
                                    <p>Tags</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className='Base-error__box'>
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
}

export default Profile;
