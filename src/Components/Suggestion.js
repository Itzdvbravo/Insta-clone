import './suggest.css';
import {Avatar, Button} from "@material-ui/core";
import {toggleFollow} from "../Fetcher";
import {Link} from "react-router-dom";

function Suggestion({d, index, remove}) {
    return (
        <div className={"suggestion"}>
            <Link to={`/user/${d.displayName}`} className={"suggestion__user"}>
                <Avatar className={"suggestion__avatar"} src={d.avatar} alt={d.displayName}/>
                <div>
                    <p className={"suggestion__displayName"}>{d.displayName}</p>
                    <p className="suggestion__message">{d.bio}</p>
                </div>
            </Link>
            <Button className={"suggestion__follow"} onClick={() => {
                remove(d.uid)
                toggleFollow(d.uid)
            }}>Follow</Button>
        </div>
    );
}

export default Suggestion;
