import './search.css';
import {Cancel, SearchOutlined} from "@material-ui/icons";
import React, {useContext} from "react";
import userContext from "../Contexts/userContext";
import {useStateValue} from "../TempData/StateProvider";
import {actionTypes} from "../TempData/Reducer";
import {useNavigate} from "react-router-dom";
import {ROUTER} from "../Constants";

function Search({sendToSearch}) {
    const {user} = useContext(userContext)
    const navigate = useNavigate()
    const [{}, dispatch] = useStateValue();
    const [search, setSearch] = React.useState('');
    const [searching, setSearching] = React.useState(false);

    return (
        <div className="Search">
            <SearchOutlined style={{"display": searching ? "none" : "initial"}}/>
            <input disabled={!user?.verified} placeholder={"Search"} onFocus={() => {setSearching(true)}} onBlur={() => {setSearching(false)}} onKeyPress={(e) => {
                if (e.key.toLowerCase() === "enter" && search.length > 0) {
                    dispatch({type: actionTypes.SEARCH, search: search})
                    if (sendToSearch) {
                        navigate(ROUTER.SEARCH)
                    }
                }
            }} onChange={(e) => {
                setSearch(e.target.value)
            }}/>
            <Cancel style={{"display": !searching ? "none" : "initial", cursor: "pointer"}}/>
        </div>
    );
}

export default Search;
