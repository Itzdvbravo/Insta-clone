import './readmore.css';
import {useEffect, useState} from "react";

function ReadMore({text, maxLength, mainStyle, style, increment = null}) {
    const [maxChar, setMaxChar] = useState(maxLength);
    const [readMoreVisibility, setReadMoreVisibility] = useState(false);

    useEffect(() => {
        if (maxChar !== null && maxChar !== -1 && text.length > maxChar) {
            setReadMoreVisibility(true);
        } else {
            setReadMoreVisibility(false);
        }
    }, [maxChar]);


    return (
        <div className="ReadMore" style={{...mainStyle}}>
            <p className={"readmore__text"}
                style={{
                    maxWidth: style['maxWidth'] ?? '100%',
                    fontSize: style['fontSize'] ?? '1.2rem',
                    fontWeight: style['fontWeight'] ?? 'normal',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    wordBreak: 'break-word'
                }}
            >{text.substring(0, maxChar === -1 ? text.length - 1 : maxChar ) + `${readMoreVisibility ? "..." : ""}`}
                <span
                    style={{
                        fontSize: style['fontSizeBtn'] ?? '1.2rem',
                        fontWeight: style['fontWeightBtn'] ?? 'normal',
                        cursor: 'pointer',
                        border: '1px solid lightgray',
                        marginLeft: '5px',
                        display: readMoreVisibility ? 'inline' : 'none'
                    }}
                    className={"readmore__btn"} onClick={() => {setMaxChar(increment !== null ? maxChar+increment : -1 )}}>Read More</span>
            </p>
        </div>
    );
}

export default ReadMore;
