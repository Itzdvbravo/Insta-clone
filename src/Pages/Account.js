import './account.css';
import {useContext, useState} from "react";
import userContext from "../Contexts/userContext";
import {ACCOUNT_EDIT_OPTIONS} from "../Constants";
import EditProfile from "./EditAccount/EditProfile";
import ChangePassword from "./EditAccount/ChangePassword";
import useWindowSize from "../customHooks/useWindowSize";
import {ChevronLeft} from "@material-ui/icons";

function Account() {
    const [hash, setHash] = useState(window.location.hash)
    const [w, h] = useWindowSize();

    const CONVERT_OPTIONS = [
        [ACCOUNT_EDIT_OPTIONS.EDIT_PROFILE, 'Edit Profile'],
        [ACCOUNT_EDIT_OPTIONS.CHANGE_PASSWORD, 'Edit Password'],
    ]

    return (
        <div className="Account">
            <div className={"account__container"}>
                <div className={"account__options"} style={{display: w < 690 && hash !== "#choose" ? 'none' : 'flex'}}>
                    {CONVERT_OPTIONS.map((convert) => (
                        <p className={convert[0] === hash ? 'active' : ''} onClick={() => {
                            setHash(convert[0])
                            window.location.hash = convert[0]
                        }}>{convert[1]}</p>
                    ))}
                </div>
                <div className={"account__box"} style={{display: w < 690 && hash === "#choose" ? 'none' : 'block'}}>
                    <ChevronLeft className={"account__back"} onClick={() => {
                        setHash("#choose")
                        window.location.hash = "#choose"
                    }}/>
                    <div>
                        {hash === ACCOUNT_EDIT_OPTIONS.EDIT_PROFILE && <EditProfile/>}
                        {hash === ACCOUNT_EDIT_OPTIONS.CHANGE_PASSWORD && <ChangePassword/>}
                        {hash === '#choose' && (
                            <p className={"account__choose"}>You can edit your account info here</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Account;
