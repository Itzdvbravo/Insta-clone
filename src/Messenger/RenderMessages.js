import Message from "./Message";
import React, {useContext, useEffect} from "react";
import userContext from "../Contexts/userContext";

function RenderMessages({messages, messagingUser, lastMessageRef}) {
    const {user} = useContext(userContext)
    var prevMsgBy = null;

    var prevDate = null;

    useEffect(() => {
        if (messagingUser && prevDate[0] !== -1) {
            prevMsgBy = null;
            prevDate = null;
        }
    }, [messagingUser]);

    return messages.map((message, i) => {
        let margin = '15px'
        if (prevMsgBy === message.user) {margin = '8px'}
        prevMsgBy = message.user;

        let addBelow = false;
        let addTop = false;
        let showAvatar = message.user !== user.uid;
        let thisDate = new Date(message.timestamp.toDate())
        let prev = new Date()
        let options = {timeZone: "Asia/Kolkata"}

        if (messages[messages.length -1].id === message.id) {
            addTop = true;
            if (messages.length > 1){
                addBelow = true;
            }
        }
        if (prevDate !== null) {
            prev = new Date(prevDate.toDate())
            let ago = prevDate.seconds - message.timestamp.seconds
            if (ago > 60) {addBelow = true}
            if (showAvatar) {
                if (messages[i+1] && message.user === messages[i+1].user && message.timestamp.seconds - messages[i+1].timestamp.seconds < 60) {
                    showAvatar = false;
                    margin = "18px";
                }
            }
            if (ago > 60 * 60 * 24) {
                options = {...options, day: 'numeric', month: "short"}
            }
            if (ago > 60) {
                options = {...options, weekday: "short", hour12: true, hour: "numeric", minute: "numeric"}
            }
        }
        prevDate = {
            toDate: () => message.timestamp.toDate(), seconds: message.timestamp.seconds
        };
        return (
            <div key={message.id}>
                {addTop && (
                    <div ref={lastMessageRef} className={"messenger__timestamp"}><p>{thisDate.toLocaleString('en-US', {timeZone: "Asia/Kolkata"})}</p></div>
                )}
                <Message message={message} messagingUser={messagingUser} showAvatar={showAvatar} byMe={message.user === user.uid} margin={addBelow ? '0' : margin}/>
                {addBelow && (
                    <div className={"messenger__timestamp"}><p>{prev.toLocaleString('en-US', options)}</p></div>
                )}
            </div>
        )
    })
}

export default RenderMessages;
