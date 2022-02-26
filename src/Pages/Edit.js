import { useContext, useEffect, useState } from 'react'
import {Link, useParams} from 'react-router-dom'
import userContext from '../Contexts/userContext'
import {getPost, getUserData, updatePost} from '../Fetcher'
import { useStateValue } from '../TempData/StateProvider'
import './edit.css'
import {TextField} from "@material-ui/core";
import {TagFaces} from "@material-ui/icons";
import useWindowSize from "../customHooks/useWindowSize";
import {actionTypes} from "../TempData/Reducer";
import postsContext from "../Contexts/postsContext";

function Edit() {
    const {user} = useContext(userContext)

    const id = useParams()["post"]
    const {basePosts, setBasePosts} = useContext(postsContext)
    const [w, h] = useWindowSize()

    const [data, setData] = useState(null)
    const [caption, setCaption] = useState('')
    const [error, setError] = useState(null)

    const [vibratingEffect, setVibratingEffect] = useState(12)
    const [vibratingColor, setVibratingColor] = useState('inherit')

    const [imgWidth, setImgWidth] = useState(0)
    const [imgHeight, setImgHeight] = useState(0)

    useEffect(() => {
        if (id) {
            getPost(id).then((d) => {
                if (d.owner === user.uid) {
                    setCaption(d.image.caption)
                    setData(d)
                } else {
                    setError("You're not the owner of the post")
                }
            }).catch(() => {
                setError("Post doesn't exist")
            })
        }

        return () => {
            setData(null)
            setError(null)
        }
    }, [id])

    useEffect(() => {
        if (data) {
            const px = w < 505 ? w - 20 : 500;
            let changeW = 0;
            let changeH = 0;
            if (data.image.orientation === 0) {
                changeW = px
            } else if (data.image.orientation === 1) {
                if (w < 820 && w > 472) {
                    changeH = 420
                    changeW = 400
                } else {
                    changeW = px - (px * 0.24)
                }
            } else {
                changeH = px
                changeW = px
            }

            if (changeH === 0) {
                changeH = (data.image.height /data.image.width) * changeW
            } else if (changeW === 0) {
                changeW = (data.image.width / data.image.height) * changeH
            }

            setImgWidth(changeW)
            setImgHeight(changeH)
        }
    }, [data, w, h])

    const addCaption = (cap) => {
        if (cap && cap.length > 2000) {
            let vib = 11;
            setVibratingColor('red')
            for (let i=1; i < 4; i++) {
                setTimeout(() => {
                    if (i !== 3) {
                        vib = vib === 11 ? 13 : 11
                    } else {
                        setVibratingColor('inherit')
                        vib = 12
                    }
                    setVibratingEffect(vib)
                }, i * 50)
            }
        } else {
            setCaption(cap)
        }
    }

    return (
        <div className='Edit'>
            {data && (
                <div className={'edit__container'}>
                    <div className='edit__imgContainer' style={{width: imgWidth, height: imgHeight}}>
                        <img className='edit__img' src={data.image.img} alt={''}/>
                    </div>
                    <div className={"edit__editingContainer"}>
                        <div className="edit__caption">
                            <textarea className="edit__captionInput" placeholder="Write a caption..." value={caption} onChange={(e) => {
                                const cap = e.target.value
                                addCaption(cap)
                            }}/>
                            <div className="edit__captionBottom"><TagFaces /><p><span style={{color: vibratingColor, fontSize: vibratingEffect}}>{caption.length}</span>/2000</p></div>
                        </div>
                        <Link to={'/'} className={"edit__submitBtn"} onClick={() => {
                            updatePost(id, {image: {...data.image, caption: caption}})
                            setBasePosts(posts => {
                                const index = posts.findIndex(p => p.post.id === id)
                                if (index > -1) {
                                    posts[index].post.image.caption = caption
                                }
                                return posts
                            })
                        }}>Done</Link>
                    </div>
                </div>
            )}
            {error && (
                <div className='Base-error__box'>{error}</div>
            )}
        </div>
    )
}

export default Edit
