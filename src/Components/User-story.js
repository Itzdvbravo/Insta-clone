import './user-story.css';
import { useContext } from 'react';
import {Avatar} from "@material-ui/core";
import userContext from '../Contexts/userContext';

function UserStory({user, stories}) {
    const main = (useContext(userContext))["user"]
    return (
        <div className={"user-story"}>
            <div className={"user-story__container"}>
                <Avatar className={"user-story__avatar"} src={user.avatar} alt={user.displayName}/>
                <p className={"user-story__username"}>{main.displayName == user.displayName ? "Your stories" : user.displayName}</p>
            </div>
        </div>
    );
}

export default UserStory;
