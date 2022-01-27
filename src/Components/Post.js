import './post.css';
import React, {useContext, useEffect, useState} from "react";
import {ROUTER, TEST} from "../Constants";
import { Avatar, Button, Modal } from "@material-ui/core";
import { ChatBubbleOutline, Favorite, FavoriteBorderOutlined, MoreHoriz, TagFaces } from "@material-ui/icons";
import userContext from "../Contexts/userContext";
import {deletePost, togglePostLike} from '../Fetcher';
import {Link, useLocation} from 'react-router-dom';
import { useStateValue } from '../TempData/StateProvider';
import { actionTypes } from '../TempData/Reducer';
import postsContext from "../Contexts/postsContext";
import ReadMore from "./ReadMore";

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
    const [{cip}, dispatch] = useStateValue()
    const [liked, setLiked] = React.useState(post.likes.includes(main.uid));
    const [wh, setWH] = useState(1);


    const [hovering, setHovering] = useState(false)

    const [del, setDelete] = useState(false)

    useEffect(() => {
        if (cip && cip.id === post.id) {
            setPost(cip)
        }
    }, [cip])

    useEffect(() => {
        if (observer) {
            observer.observe(document.getElementById("post-" + post.id))
            const d = document.getElementById("post__input" + post.id);
            if (d) {
                d.scrollTop = d.scrollHeight
            }
        }
    }, [])

    const toggleLike = () => {
        setLiked(!liked)
        if (!liked) {
            post.likes.push(main.uid)
        } else {
            post.likes.splice(post.likes.indexOf(main.uid), 1)
        }
        togglePostLike(post.id, !liked)
        setWH(1.2)
        setTimeout(() => { setWH(1) }, 0.2 * 1000)
    }

    const [morePost, openMorePost] = React.useState(false);
    const handleOpen = () => openMorePost(true);
    const handleClose = () => openMorePost(false);

    return !del ? (
        <div id={"post-" + post.id} className={'Post'}>
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
                                setBasePosts(restructured)
                                deletePost(post.id)
                                setDelete(true)
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
                            <ChatBubbleOutline />
                        </div>
                        <p className={"post__activityInfo"}>{post.likes.length} likes</p>
                        <div className='post__caption'>
                            <p className='post__captionUser'>{user.displayName}:</p>
                            <ReadMore text={post.image.caption} maxLength={40} style={{
                                maxWidth: '500px', fontSize: '12px', fontWeight: 400, fontSizeBtn: '11px'
                            }}/>
                        </div>
                    </div>
                    <div className={"post__comment"}>
                        <TagFaces />
                        <textarea id={"post__input" + post.id} className='post__commentInput' placeholder='Add a comment'/>
                        <button className='post__commentBtn'>Post</button>
                    </div>
                </div>
            )}
        </div>
    ) : (<div/>)

}

export default Post;
