import {Avatar, Modal} from "@material-ui/core";
import ReadMore from "../Components/ReadMore";
import {MoreHoriz} from "@material-ui/icons";
import {useContext, useState} from "react";
import userContext from "../Contexts/userContext";
import useWindowSize from "../customHooks/useWindowSize";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    boxShadow: 24,
};

function Message({message, deleteMessage, showAvatar, messagingUser, byMe, margin}) {
    const minMaxChar = 198;
    const [w, h] = useWindowSize()
    const [modelOpen, setModelOpen] = useState(false);
    const handleModal = () => {
        setModelOpen(!modelOpen);
    };

    return (
        <div className="Message">
            <Modal open={modelOpen} onClose={handleModal}>
                <div style={{...style, width: w > 300 ? 300 : w-10}} className={"messenger__message-modal"}>
                    {byMe && (
                        <p style={{fontWeight: 500, color: "red"}} onClick={() => {deleteMessage(message.id);handleModal()}}>Delete</p>
                    )}
                    <p>Copy</p>
                    <p onClick={handleModal}>Cancel</p>
                </div>
            </Modal>
            <div className={'messenger__message'} style={{marginBottom: margin}}>
                <div className={`${byMe ? 'messenger__message-flex messenger__message-right' : 'messenger__message-flex'}`}>
                    {(byMe && !message.deleted) && (
                        <div className={"messenger__moreOpt messenger__moreOpt-me"}>
                            <MoreHoriz onClick={handleModal} />
                            <p onClick={() => {navigator.clipboard.writeText(message.msg)}}>Copy</p>
                        </div>
                    )}
                    <div className={"messenger__message-main"}>
                        {!byMe && showAvatar && (
                            <Avatar
                                src={messagingUser.avatar}
                                alt={messagingUser.displayName}
                                className={"messenger__message-avatar"}
                            />
                        )}
                        {message.deleted ? (
                            <p className={"messenger__message-deleted"} style={{marginLeft: !byMe && !showAvatar ? 39 : 0}}>{message.msg}</p>
                        ) : (
                            <ReadMore mainStyle={{marginLeft: !byMe && !showAvatar ? "39px" : "0"}} text={message.msg} maxLength={minMaxChar} increment={minMaxChar - 16} style={{maxWidth: '200px', fontSize: '13px', fontSizeBtn: '10px'}}/>
                        )}
                    </div>
                    {(!byMe && !message.deleted) && (
                        <div className={"messenger__moreOpt messenger__moreOpt-u"}>
                            <MoreHoriz onClick={handleModal} />
                            <p onClick={() => {navigator.clipboard.writeText(message.msg)}}>Copy</p>
                        </div>)
                    }
                </div>
            </div>
        </div>
    );
}

export default Message;
