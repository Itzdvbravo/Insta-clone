import {Avatar} from "@material-ui/core";
import ReadMore from "../Components/ReadMore";

function Message({message, showAvatar, messagingUser, byMe, margin}) {
    const minMaxChar = 198;

    return (
        <div className="Message">
            <div className={'messenger__message'} style={{marginBottom: margin}}>
                <div className={`${byMe ? ' messenger__message-right' : ''}`}>
                    <div className={"messenger__message-main"}>
                        {!byMe && showAvatar && (
                            <Avatar
                                src={messagingUser.avatar}
                                alt={messagingUser.displayName}
                                className={"messenger__message-avatar"}
                            />
                        )}
                        <ReadMore mainStyle={{marginLeft: !byMe && !showAvatar ? "39px" : "0"}} text={message.msg} maxLength={minMaxChar} increment={minMaxChar - 16} style={{maxWidth: '200px', fontSize: '13px', fontSizeBtn: '10px'}}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Message;
