import {ChevronLeft, MoreHoriz} from '@material-ui/icons'
import React, {useCallback, useContext} from 'react'
import { useEffect, useState } from 'react'
import {Link, useNavigate, useParams} from 'react-router-dom'
import isMobileContext from '../Contexts/isMobileContext'
import { useStateValue } from '../TempData/StateProvider'
import {Avatar, Modal} from "@material-ui/core";
import { ChatBubbleOutline, Favorite, FavoriteBorderOutlined } from "@material-ui/icons";
import './mainpost.css'
import userContext from '../Contexts/userContext'
import {deletePost, getPost, getUserData, togglePostLike} from '../Fetcher'
import { actionTypes } from '../TempData/Reducer'
import postsContext from "../Contexts/postsContext";
import {ERROR_ID, HOST, ROUTER} from "../Constants";

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

function MainPost({index}) {
    const {user} = useContext(userContext)
    const id = useParams()["post"]
    const isMobile = (useContext(isMobileContext))["isMobile"][0]

    const [liked, setLiked] = useState(false);
    const [wh, setWH] = useState(1);
    const navigate = useNavigate()
    const {basePosts, setBasePosts} = useContext(postsContext)

    const toggleLike = () => {
        setLiked(!liked)
        setBasePosts(posts => {
            const index = posts.findIndex(p => p.post.id === data.post.id)
            if (index > -1) {
                if (!liked) {
                    posts[index].post.likes.push(user.uid)
                } else {
                    posts[index].post.likes.splice(posts[index].post.likes.indexOf(user.uid), 1)
                }
            }
            return posts
        })
        togglePostLike(data.post.id, !liked).catch((e) => {
            // if (e.code === "permission-denied") {
            dispatch({type: actionTypes.OOPSERROR, oopsError: {open: true}})
            // }
        })
        setWH(1.2)
        setTimeout(() => { setWH(1) }, 0.2 * 1000)
    }

    const [{back}, dispatch] = useStateValue()

    const [data, setData] = useState(null)
    const [error, setError] = useState(null)


    const [comments, setComments] = useState([])
    const [commentHeight, setCommentHeight] = useState(0)
    const commentHeightRef = useCallback((node) => {
        if (node) setCommentHeight(node.getBoundingClientRect().height)
    }, [commentHeight]);


    useEffect(() => {
        if (id) {
            getPost(id).then((d) => {
                getUserData(d.owner).then((usr) => {
                    setLiked(d.likes.includes(user.uid))
                    setData({post: {...d, id: id}, user: usr})
                    Promise.all(d.comments.map(async ({id, comment}) => {
                        try {
                            const us = await getUserData(id)
                            return {displayName: us.displayName, comment, uid: us.uid, avatar: us.avatar}
                        } catch (e) {
                            if (e.type === ERROR_ID.OTHER) {
                                console.log(e)
                            }
                        }
                    })).then((e) => {
                        setComments(e.filter(e => Boolean(e)))
                    })
                }).catch(() => {
                    setError("Post was found but user was unfortunately not found")
                })
            }).catch(() => {
                setError("Post doesn't exist")
            })
        }
    }, [id])

    const [morePost, openMorePost] = React.useState(false);
    const handleOpen = () => openMorePost(true);
    const handleClose = () => openMorePost(false);

    return (
        <div className='Mainpost'>
            {isMobile && (
                <center className='mainpost__header'>
                    <ChevronLeft className='mainpost__backBtn' onClick={() => {
                        navigate(back ?? "/")
                    }}/>
                    <p>Photo</p>
                </center>
            )}
            {data && (
                <div className='mainpost__container'>
                    <Modal
                        open={morePost}
                        onClose={handleClose}
                    >
                        {data.post.owner === user.uid ? (
                            <div style={style} className='post__morePostOptions'>
                                <p className='post__warning' onClick={() => {
                                    const restructured = basePosts
                                    restructured.forEach((p, i) => {
                                        if (p.post.id === data.post.id) {
                                            restructured.splice(i, 1)
                                        }
                                    })
                                    setBasePosts(restructured)
                                    deletePost(data.post.id).catch((e) => {
                                        // if (e.code === "permission-denied") {
                                        dispatch({type: actionTypes.OOPSERROR, oopsError: {open: true}})
                                        // }
                                    })
                                    navigate(back ?? "/")
                                }}>Delete</p>
                                <Link to={`${ROUTER.EDIT}/${data.post.id}`}>Edit</Link>
                                <p onClick={() => {
                                    navigator.clipboard.writeText(HOST + "/p/" + data.post.id)
                                    handleClose()
                                }}>Copy Link</p>
                                <p onClick={() => {
                                    handleClose()
                                }}>Cancel</p>
                            </div>
                        ) : (
                            <div style={style} className='post__morePostOptions'>
                                <p onClick={() => {
                                    navigator.clipboard.writeText(HOST + "/p/" + data.post.id)
                                    handleClose()
                                }}>Copy Link</p>
                                <p onClick={() => {
                                    handleClose()
                                }}>Cancel</p>
                            </div>
                        )}
                    </Modal>
                    <div className='mainpost__upperContainer'>
                        <div className='mainpost__owner'>
                            <Link to={`${ROUTER.PROFILE}/${data.user.displayName}`} style={{display: 'flex', alignItems: 'center'}}>
                                <Avatar src={data.user.avatar} className='mainpost__ownerAvatar'/>
                                <p>{data.user.displayName}</p>
                            </Link>
                            <MoreHoriz style={{width: '25px', height: '25px', cursor: 'pointer'}} onClick={() => {handleOpen()}}/>
                        </div>
                        <div className='mainpost__containerImgContainer'>
                            <img ref={commentHeightRef} src={data.post.image.img} className='mainpost__mainImage' alt={''}/>
                        </div>
                        <div className='mainpost__containerSideContainer'>
                            <div className='mainpost__owner mainpost__ownerPc'>
                                <Link to={`${ROUTER.PROFILE}/${data.user.displayName}`} style={{display: 'flex', alignItems: 'center'}}>
                                    <Avatar src={data.user.avatar} className='mainpost__ownerAvatar'/>
                                    <p>{data.user.displayName}</p>
                                </Link>
                                <MoreHoriz style={{width: '25px', height: '25px', cursor: 'pointer'}} onClick={() => {handleOpen()}}/>
                            </div>
                            <div className='mainpost__actionAndCommentContainer'>
                                <div className={"mainpost__actions"}>
                                    <div style={{width: '100%'}}>
                                        {!liked ? (
                                            <div style={{display: 'inline-flex'}}><FavoriteBorderOutlined style={{ transform: `scale(${wh})` }} className="unliked" onClick={toggleLike} /></div>
                                        ) : (
                                            <div style={{display: 'inline-flex'}}><Favorite style={{ transform: `scale(${wh})` }} className="liked" onClick={toggleLike} /></div>
                                        )}
                                        <ChatBubbleOutline />
                                    </div>
                                </div>
                                <div className='mainpost__captionAndCommentContainer' style={{height: commentHeight - 95}}>
                                    <p className='mainpost__caption' style={{marginBottom: 5}}><span>{data.user.displayName}</span>{": " + data.post.image.caption}</p>
                                    {comments.map(({displayName,avatar,comment,uid}) => {
                                        return (
                                            <div className='mainpost__captionComment' key={uid}>
                                                <Avatar
                                                    src={avatar}
                                                    alt={displayName}
                                                    className='mainpost__captionCommentAvatar'
                                                    onClick={() => {
                                                        navigate(`${ROUTER.PROFILE}/${displayName}`)
                                                    }}
                                                    style={{cursor: 'pointer'}}
                                                />
                                                <p><span>{displayName + ":"}</span> {" " + comment}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {error && (
                <div className='Base-error__box'><p>{error}</p></div>
            )}
        </div>
    )
}

export default MainPost
