import './authentication.css';
import React, {useContext, useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import Register from "../Components/Authenticator/Register";
import Login from "../Components/Authenticator/Login";
import Phone from '../Images/Phone.png'
import userContext from "../Contexts/userContext";
import Verify from "./Verify";

function Authentication() {
    const {user} = useContext(userContext)
    const [hash, setHash] = useState(window.location.hash)

    return (
        <div className="authentication">
            {!user && !(user && !user.verified) ? (
                <div className={"authentication__container"}>
                    <img
                        className={"authentication__image"}
                        src={Phone}
                        alt={""}/>
                    <div className={"authentication__main"}>
                        <img
                            className={"logo"}
                            src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
                            alt=""
                            width={175}
                        />
                        <div className={"authentication__mainMid"}>
                            {hash === '#login' || hash === '' ? (
                                <Login toUrl={"/"}/>
                            ) : (
                                <Register />
                            )}
                        </div>
                        <div className={"authentication__divider"}><div></div><p>OR</p><div></div></div>
                        <div className={"authentication__mainEnd"}>
                            {hash === '#login' || hash === '' ? (
                                <div><p>Don't have an account?&nbsp;</p><span className={"authentication__exceptBtn"} onClick={() => {setHash("#register");window.location.hash = "#register"}}>Sign up</span></div>
                            ) : (
                                <div><p>Already have an account?&nbsp;</p><span className={"authentication__exceptBtn"} onClick={() => {setHash("#login");window.location.hash = "#login"}}>Log In</span></div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <Verify />
            )}
        </div>
    );
}

export default Authentication;
