import './account.css';
import React, {useContext, useState} from "react";
import userContext from "../Contexts/userContext";
import {ACCOUNT_EDIT_OPTIONS} from "../Constants";
import EditProfile from "./EditAccount/EditProfile";
import ChangePassword from "./EditAccount/ChangePassword";
import useWindowSize from "../customHooks/useWindowSize";
import {ChevronLeft} from "@material-ui/icons";
import {useNavigate} from "react-router-dom";
import {useStateValue} from "../TempData/StateProvider";
import isMobileContext from "../Contexts/isMobileContext";

function Account() {
    const [hash, setHash] = useState(window.location.hash)
    const [w, h] = useWindowSize();

    const navigate = useNavigate();
    const [{back}, dispatch] = useStateValue()
    const isMobile = (useContext(isMobileContext))["isMobile"][0]

    const CONVERT_OPTIONS = {
        [ACCOUNT_EDIT_OPTIONS.EDIT_PROFILE]: 'Edit Profile',
        [ACCOUNT_EDIT_OPTIONS.CHANGE_PASSWORD]: 'Edit Password'
    }

    return (
        <div className="Account">
            {isMobile && (
                <center className='account__header'>
                    <ChevronLeft className='account__backBtn' onClick={() => {
                        if (hash !== "#choose") {
                            setHash("#choose")
                            window.location.hash = "#choose"
                        } else {
                            navigate(back ?? "/")
                        }
                    }}/>
                    <p>{CONVERT_OPTIONS[hash] ?? 'Account'}</p>
                </center>
            )}
            <div className={"account__container"}>
                <div className={"account__options"} style={{display: w < 740 && hash !== "#choose" ? 'none' : 'flex'}}>
                    {Object.keys(CONVERT_OPTIONS).map((convert) => (
                        <p className={convert === hash ? 'active' : ''} onClick={() => {
                            setHash(convert)
                            window.location.hash = convert
                        }}>{CONVERT_OPTIONS[convert]}</p>
                    ))}
                </div>
                <div className={"account__box"} style={{display: w < 740 && hash === "#choose" ? 'none' : 'block'}}>
                    <div>
                        {hash === ACCOUNT_EDIT_OPTIONS.EDIT_PROFILE && <EditProfile/>}
                        {hash === ACCOUNT_EDIT_OPTIONS.CHANGE_PASSWORD && <ChangePassword/>}
                        {(hash === '#choose' || hash === "") && (
                            <p className={"account__choose"}>You can edit your account info here</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Account;
