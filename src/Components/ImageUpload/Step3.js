import { useContext, useEffect, useState } from "react";
import useWindowSize from "../../customHooks/useWindowSize";
import userContext from '../../Contexts/userContext'
import './step3.css';
import { Avatar } from "@material-ui/core";
import { TagFaces } from "@material-ui/icons";

function Step3({ image, complete, step }) {
    const [w, h] = useWindowSize()
    const { user } = useContext(userContext)
    const [caption, setCaption] = useState('')

    const [vibratingEffect, setVibratingEffect] = useState(12)
    const [vibratingColor, setVibratingColor] = useState('inherit')

    const [width, setWidth] = useState(image.width)
    const [height, setHeight] = useState(image.height)

    useEffect(() => {
        if (step == 4) {
            complete({'caption': caption})
        }
    }, [step])

    const addCaption = (cap) => {
        if (cap && cap.length > 2000) {
            let vib = 11
            setVibratingColor('red')
            for (let i=1; i < 4; i++) {
                setTimeout(() => {
                    if (i != 3) {
                        vib = vib == 11 ? 13 : 11
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

    useEffect(() => {
        const o = image.orientation
        const px = w < 505 ? w - 20 : 500
        if (o == 0) {
            setWidth(`${px}px`)
            setHeight(`${(image.height/image.width)*px}`)
        } else {
            setHeight(`${px - (px*0.24)}px`)
            setWidth(`${(image.width/image.height)*(px - (px*0.24))}`)
        }
    }, [w,h])

    return (
        <div className="Step3">
            <div className="step3__left" style={{ width: w < 505 ? `${w-20}px` : `500px` }}>
                <img src={image.src} width={width} height={height}></img>
            </div>
            <div className="step3__right">
                <div className="step3__user">
                    <Avatar
                        className={"step3__userAvatar"}
                        src={user.avatar}
                        alt={user.displayName}
                    />
                    <p>{user.displayName}</p>
                </div>
                <div className="step3__caption">
                    <textarea className="step3__captionInput" placeholder="Write a caption..." value={caption} onChange={(e) => {
                        var cap = e.target.value
                        addCaption(cap)
                    }}/>
                    <div className="step3__captionBottom"><TagFaces /><p><span style={{color: vibratingColor, fontSize: vibratingEffect}}>{caption.length}</span>/2000</p></div>
                </div>
            </div>
        </div>
    )
}

export default Step3;
