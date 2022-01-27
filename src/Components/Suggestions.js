import './suggestions.css';
import {Avatar, Button, Divider} from "@material-ui/core";
import {useContext, useEffect, useState} from "react";
import userContext from "../Contexts/userContext";
import {auth, db} from "../firebase";
import {TESTER} from "../Fetcher";
import Suggestion from "./Suggestion";

function Suggestions() {
    const {user} = useContext(userContext)
    const [data, setData] = useState([]);

    useEffect(() => {
        db.collection(TESTER + 'users').limit(10).get().then(snapshot => {
            const users = [];
            snapshot.forEach(doc => {
                const d = doc.data()
                if (doc.id !== user.uid && !user.following[doc.id]) {
                    users.push({
                        uid: doc.id,
                        ...d
                    })
                }
            })
            setData(users.slice(0, 5))
        })
    }, []);

    const removeUser = (id) => {
        const newData = data.filter(d => d.uid !== id)
        setData(newData)
    }

    return (
        <div className="Suggestions">
            {user && (
                <div>
                    <div className={"suggestions__user"}>
                        <div className={"avatar"}>
                            <Avatar className={"suggestions__userAvatar"} src={user.avatar} alt={user.displayName}/>
                            <p>{user.displayName}</p>
                        </div>
                    </div>
                    <div className={"suggestions__divider"}>
                        <p>Suggestions for you</p>
                        <p>See All</p>
                    </div>
                    <div className={"suggestions__list"}>
                        {data.map((d, ind) => (
                            <Suggestion key={d.uid} d={d} index={ind} remove={removeUser}/>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Suggestions;
