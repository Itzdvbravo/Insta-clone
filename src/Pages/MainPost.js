import {ChevronLeft, MoreHoriz} from '@material-ui/icons'
import React, { useContext } from 'react'
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
import {ROUTER} from "../Constants";

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
        if (!liked) {
            data.post.likes.push(user.uid)
        } else {
            data.post.likes.splice(data.post.likes.indexOf(user.uid), 1)
        }
        togglePostLike(data.post.id, !liked)
        setWH(1.2)
        setTimeout(() => { setWH(1) }, 0.2 * 1000)
    }

    const [{back}, dispatch] = useStateValue()

    const [data, setData] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (id) {
            getPost(id).then((d) => {
                getUserData(d.owner).then((user) => {
                    setLiked(d.likes.includes(user.uid))
                    setData({post: {...d, id: id}, user})
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
                                    deletePost(data.post.id)
                                    navigate(back ?? "/")
                                }}>Delete</p>
                                <Link to={`${ROUTER.EDIT}/${data.post.id}`}>Edit</Link>
                                <p onClick={() => {
                                    handleClose()
                                }}>Cancel</p>
                            </div>
                        ) : (
                            <div style={style} className='post__morePostOptions'>
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
                            <img src={data.post.image.img} className='mainpost__mainImage' alt={''}/>
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
                                <div className='mainpost__captionAndCommentContainer'>
                                    <p className='mainpost__caption'><span>{data.user.displayName}</span>{" " + data.post.image.caption}</p>
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
