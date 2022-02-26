import './post.css';
import React, {useCallback, useContext, useEffect, useState} from "react";
import {ERROR_ID, HOST, ROUTER, TEST} from "../Constants";
import { Avatar, Button, Modal } from "@material-ui/core";
import { ChatBubbleOutline, Favorite, FavoriteBorderOutlined, MoreHoriz, TagFaces } from "@material-ui/icons";
import userContext from "../Contexts/userContext";
import {addComment, deletePost, getUserData, togglePostLike} from '../Fetcher';
import {Link, useLocation} from 'react-router-dom';
import { useStateValue } from '../TempData/StateProvider';
import { actionTypes } from '../TempData/Reducer';
import postsContext from "../Contexts/postsContext";
import ReadMore from "./ReadMore";
import {convertTimestampToDayWeekMonthMin} from "../Utils";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    boxShadow: 24,
    borderRadius: 8,
    width: 280
};

function Post({ data, user, personal, observer, index }) {
    var location = useLocation()
    const main = (useContext(userContext))["user"]
    const {basePosts, setBasePosts} = useContext(postsContext)
    const [post, setPost] = useState(data);
    const [{}, dispatch] = useStateValue()

    const [liked, setLiked] = React.useState(post.likes.includes(main.uid));
    const [wh, setWH] = useState(1);
    const [comments, setComments] = useState([])

    const [comment, setComment] = useState("")

    const [hovering, setHovering] = useState(false)

    const setObserver = useCallback(
        (node) => {
            if (node !== null && observer) {
                observer.observe(node)
            }
        },
        [observer],
    );
    const commentingBoxFix = useCallback(
        (node) => {
            if (node !== null) {
                node.scrollTop = node.scrollHeight
            }
        },
        [],
    );

    useEffect(() => {
        Promise.all(post.comments.slice(0, 3).map(async ({id, comment}) => {
            try {
                const user = await getUserData(id)
                return {user, comment}
            } catch (e) {
                if (e.type === ERROR_ID.OTHER) {
                    console.log(e)
                }
            }
        })).then((d) => {
            setComments(d.filter((e) => Boolean(e)))
        }).catch((e) => {
            console.log(e)
        })
    }, [])

    const toggleLike = () => {
        setLiked(!liked)
        setBasePosts(posts => {
            const index = posts.findIndex(p => p.post.id === post.id)
            if (index > -1) {
                if (!liked) {
                    posts[index].post.likes.push(main.uid)
                } else {
                    posts[index].post.likes.splice(posts[index].post.likes.indexOf(main.uid), 1)
                }
            }
            return posts
        })
        togglePostLike(post.id, !liked).catch((e) => {
            // if (e.code === "permission-denied") {
                dispatch({type: actionTypes.OOPSERROR, oopsError: {open: true}})
            // }
        })
        setWH(1.2)
        setTimeout(() => { setWH(1) }, 0.2 * 1000)
    }

    const [morePost, openMorePost] = React.useState(false);
    const handleOpen = () => openMorePost(true);
    const handleClose = () => openMorePost(false);

    return (
        <div ref={setObserver} className={'Post'}>
            <Modal
                open={morePost}
                onClose={handleClose}
            >
                <div style={style} className='post__morePostOptions'>
                    {post.owner === main.uid && (
                        <div>
                            <p className='post__warning' onClick={() => {
                                const restructured = basePosts
                                if (index > -1) {
                                    restructured.splice(index, 1);
                                }
                                setBasePosts([...restructured])
                                deletePost(post.id).catch((e) => {
                                    // if (e.code === "permission-denied") {
                                        dispatch({type: actionTypes.OOPSERROR, oopsError: {open: true}})
                                    // }
                                })
                                handleClose()
                            }}>Delete</p>
                            <Link to={`${ROUTER.EDIT}/${post.id}`}>Edit</Link>
                        </div>
                    )}
                    <Link to={`${ROUTER.MAINPOST}/${post.id}`} onClick={() => {
                        dispatch({
                            type: actionTypes.BACK,
                            back: location.pathname
                        })
                    }}>Go to post</Link>
                    <p onClick={() => {
                        navigator.clipboard.writeText(HOST + "/p/" + post.id)
                        handleClose()
                    }}>Copy Link</p>
                    <p onClick={() => {
                        handleClose()
                    }}>Cancel</p>
                </div>
            </Modal>
            {!personal && (
                <div className='post__userContainer'>
                    <Link className={"avatar post__user"} to={`${ROUTER.PROFILE}/${user.displayName}`}>
                        <Avatar className={"post__user-avatar"} src={user.avatar} alt={user.displayName} />
                        <div className={"post__user-name"}>{user.displayName}</div>
                    </Link>
                    <MoreHoriz onClick={() => {handleOpen()}}/>
                </div>
            )}
            <Link to={`${ROUTER.MAINPOST}/${post.id}`} onClick={() => {
                dispatch({
                    type: actionTypes.BACK,
                    back: location.pathname
                })
            }}>
                <img onMouseEnter={() => { setHovering(true) }}
                     className={"post__image"}
                     src={post.image.img}
                     alt={""} />
            </Link>
            {personal && (
                <Link to={`${ROUTER.MAINPOST}/${post.id}`} onClick={(e) => {
                    if (!(e.target.className === "post__actions")) {
                        e.preventDefault()
                    } else {
                        dispatch({
                            type: actionTypes.BACK,
                            back: location.pathname
                        })
                    }
                }}>
                    <div className='post__actions-hovered' onMouseLeave={() => { setHovering(false) }} style={{ display: hovering ? 'unset' : 'none' }}>
                        <div className={"post__actions"}>
                            <center style={{ width: '100%' }}>
                                {!liked ? (
                                    <div style={{ display: 'inline-flex' }}><FavoriteBorderOutlined style={{ transform: `scale(${wh})` }} className="unliked" onClick={toggleLike} /><p>{post.likes.length}</p></div>
                                ) : (
                                    <div style={{ display: 'inline-flex' }}><Favorite style={{ transform: `scale(${wh})` }} className="liked" onClick={toggleLike} /><p>{post.likes.length}</p></div>
                                )}
                                <ChatBubbleOutline />
                            </center>
                        </div>
                    </div>
                </Link>
            )}
            {!personal && (
                <div>
                    <div className={"post__midSec"}>
                        <div className={"post__actions"}>
                            {!liked ? (
                                <FavoriteBorderOutlined style={{ transform: `scale(${wh})` }} className="unliked" onClick={toggleLike} />
                            ) : (
                                <Favorite style={{ transform: `scale(${wh})` }} className="liked" onClick={toggleLike} />
                            )}
                            <Link to={`${ROUTER.MAINPOST}/${post.id}`} style={{display: "flex"}}><ChatBubbleOutline /></Link>
                        </div>
                        <p className={"post__activityInfo"}>{post.likes.length} likes</p>
                        {post.image.caption && (
                            <div className='post__caption'>
                                <p className='post__captionUser'>{user.displayName}:</p>
                                <ReadMore text={post.image.caption} maxLength={40} style={{
                                    maxWidth: '500px', fontSize: '12px', fontWeight: 400, fontSizeBtn: '11px'
                                }}/>
                            </div>
                        )}
                        {post.comments.length > 3 && (
                            <Link to={`${ROUTER.MAINPOST}/${post.id}`} style={{
                                color: "#8e8e8e",
                                marginTop: "2px",
                                fontSize: "12px",
                                fontWeight: 400,
                            }}>View all {post.comments.length} comments</Link>
                        )}
                        {comments.map(({user, comment}, ind) => {
                                return (
                                    <div className='post__commentItem' style={{marginTop: ind === 0 ? '5px' : 0}} key={user.uid + comment}>
                                        <Link to={`${ROUTER.PROFILE}/${user.displayName}`}>
                                            <p className={"post__comment-user"}>{user.displayName}:</p>
                                        </Link>
                                        <ReadMore text={comment} maxLength={40} style={{
                                            maxWidth: '500px', fontSize: '12px', fontWeight: 400, fontSizeBtn: '11px'
                                        }}/>
                                    </div>
                                )
                            })
                        }
                        <p className={"post__timestamp"}>{convertTimestampToDayWeekMonthMin(post.timestamp.toDate(), true, "w", {
                            timeZone: "Asia/Kolkata",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            weekday: "short",
                        })}</p>
                    </div>
                    <div className={"post__comment"}>
                        <TagFaces />
                        <textarea ref={commentingBoxFix} value={comment} className='post__commentInput' placeholder='Add a comment' onChange={e => {
                            if (e.target.value.length > 180) return;
                            setComment(e.target.value)
                        }} onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                if (comment.length > 0) {
                                    addComment("post.id", comment).catch(err => {
                                        dispatch({type: actionTypes.OOPSERROR, oopsError: {open: true, message: "Something went wrong. Please try again later."}})
                                    })
                                    setComments([...comments, {user: main, comment: comment}])
                                    setComment('')
                                }
                            }
                        }}/>
                        <button className='post__commentBtn' style={{cursor: comment.length > 0 ? "pointer" : "default"}} onClick={(e) => {
                            e.preventDefault();
                            if (comment.length === 0) return;
                            addComment("post.id", comment).catch(err => {
                                dispatch({type: actionTypes.OOPSERROR, oopsError: {open: true, message: "Something went wrong. Please try again later."}})
                            })
                            setComment('')
                        }}>Post</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Post;
