import './searchpage.css';
import {useStateValue} from "../TempData/StateProvider";
import {useContext, useEffect, useState} from "react";
import {db} from "../firebase";
import {getUserDataByUsername} from "../Fetcher";
import {Avatar} from "@material-ui/core";
import {ChevronLeft} from "@material-ui/icons";
import Search from "../Components/Search";
import isMobileContext from "../Contexts/isMobileContext";
import {Link, useNavigate} from "react-router-dom";
import {ROUTER} from "../Constants";
import Suggestions from "../Components/Suggestions";

function SearchPage() {
    const [{ search, back }, dispatch] = useStateValue();
    const navigate = useNavigate()
    const isMobile = useContext(isMobileContext)["isMobile"][0]
    const [list, setList] = useState([]);

    const [data, setData] = useState(null);

    const matchNames = (name, list) => {
        var re = new RegExp(name, 'g');
        const filtered = list.filter(item => {
            return item.match(re);
        });
        return filtered
    }

    useEffect( () => {
        const setFinalData = async (matches) => {
            const finalData = []
            for (let i = 0; i < matches.length; i++) {
                const d = await getUserDataByUsername(matches[i])
                finalData.push(d)
                if (i === matches.length - 1) {
                    setData(finalData)
                }
            }
        }

        if (!list.length) {
            db.collection("userList").doc("only").get().then((snap) => {
                let list = snap.get("users")
                setList(list)
                const matches = matchNames(search, list)
                setFinalData(matches)
            })
        } else {
            const matches = matchNames(search, list)
            setFinalData(matches)
        }
    }, [search])

    return (
        <div className="SearchPage">
            {isMobile && (
                <div className={"searchpage__header"}>
                    <ChevronLeft className={"searchpage__backBtn"} onClick={() => {
                        navigate(back ?? '/')
                    }}/>
                    <center><Search /></center>
                </div>
            )}
            <div className="searchpage__container">
                {data && data.map((item, index) => (
                    <Link key={item.uid} to={`${ROUTER.PROFILE}/${item.displayName}`} className={"searchpage__list"}>
                        <div className={"searchpage__user"}>
                            <div className={"searchpage__user-header"}>
                                <Avatar
                                    src={item.avatar}
                                    alt={item.displayName}
                                    className={'searchpage__user-avatar'}
                                />
                                <div className={"searchpage__user-headerInfo"}>
                                    <p className={"searchpage__user-username"}>{item.displayName}</p>
                                    <p className={"searchpage__user-bio"}>{item.bio}</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
                {!data && isMobile &&(<Suggestions />)}
            </div>
        </div>
    );
}

export default SearchPage;
