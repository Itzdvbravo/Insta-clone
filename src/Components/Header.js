import './header.css';
import React, {useContext, useState} from "react";
import userContext from "../Contexts/userContext";
import {
    Add, Cancel, Explore, ExploreOutlined,
    FavoriteBorder,
    Home,
    SearchOutlined
} from "@material-ui/icons";
import {Avatar, Snackbar} from "@material-ui/core";
import {Link, useLocation, useNavigate} from "react-router-dom";
import isMobileContext from "../Contexts/isMobileContext";
import Step1 from "./ImageUpload/Step1";
import MuiAlert from '@material-ui/lab/Alert';
import { useStateValue } from '../TempData/StateProvider';
import { actionTypes } from '../TempData/Reducer';
import {HEADER__ON, ROUTER} from "../Constants";
import Search from "./Search";


function Header() {
    const {user} = useContext(userContext);
    const isMobile = (useContext(isMobileContext))["isMobile"][0]
    var location = useLocation()
    var navigate = useNavigate()
    const [{}, dispatch] = useStateValue()

    const [uploadingImage, setUploadingImage] = React.useState(false);

    const [sbOpen, setSbopen] = useState(false)

    const sbClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }

        setSbopen(false);
    };

    function Alert(props) {
        return <MuiAlert elevation={6} variant="filled" {...props} />;
    }

    return (
        <div className="Header">
            {uploadingImage && (<Step1 open={uploadingImage} close={(r) => {if (r) {setSbopen(true)} setUploadingImage(false)}}/>)}
            <Snackbar anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }} open={sbOpen} autoHideDuration={6000} onClose={sbClose}>
                <Alert onClose={sbClose} severity="success">
                    Your post has been created
                </Alert>
            </Snackbar>
            {(!isMobile || HEADER__ON.indexOf("/" + (location.pathname.split("/")[1])) !== -1) && (
                <div className={"header__left"}>
                    {isMobile && (
                        <svg width={"24"} viewBox={"0 0 48 48"} className={"header__leftCamera"} onClick={() => {setUploadingImage(true)}}>
                            <path clip-rule="evenodd" d="M38.5 46h-29c-5 0-9-4-9-9V17c0-5 4-9 9-9h1.1c1.1 0 2.2-.6 2.7-1.7l.5-1c1-2 3.1-3.3 5.4-3.3h9.6c2.3 0 4.4 1.3 5.4 3.3l.5 1c.5 1 1.5 1.7 2.7 1.7h1.1c5 0 9 4 9 9v20c0 5-4 9-9 9zm6-29c0-3.3-2.7-6-6-6h-1.1C35.1 11 33 9.7 32 7.7l-.5-1C31 5.6 29.9 5 28.8 5h-9.6c-1.1 0-2.2.6-2.7 1.7l-.5 1c-1 2-3.1 3.3-5.4 3.3H9.5c-3.3 0-6 2.7-6 6v20c0 3.3 2.7 6 6 6h29c3.3 0 6-2.7 6-6V17zM24 38c-6.4 0-11.5-5.1-11.5-11.5S17.6 15 24 15s11.5 5.1 11.5 11.5S30.4 38 24 38zm0-20c-4.7 0-8.5 3.8-8.5 8.5S19.3 35 24 35s8.5-3.8 8.5-8.5S28.7 18 24 18z" fill-rule="evenodd"/>
                        </svg>
                    )}
                    <Link to={"/"} className={"header__logo"}>
                        <img
                            src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
                            alt=""
                            width={175}
                        />
                    </Link>
                    {isMobile && (
                        <svg width={"24"} viewBox={"0 0 48 48"} height={"24"} className={"header__leftCamera"} onClick={() => {
                            dispatch({
                                type: actionTypes.BACK,
                                back: location.pathname
                            })
                            navigate(ROUTER.MESSENGER)
                        }}>
                            <path d="M36.2 16.7L29 22.2c-.5.4-1.2.4-1.7 0l-5.4-4c-1.6-1.2-3.9-.8-5 .9l-6.8 10.7c-.7 1 .6 2.2 1.6 1.5l7.3-5.5c.5-.4 1.2-.4 1.7 0l5.4 4c1.6 1.2 3.9.8 5-.9l6.8-10.7c.6-1.1-.7-2.2-1.7-1.5zM24 1C11 1 1 10.5 1 23.3 1 30 3.7 35.8 8.2 39.8c.4.3.6.8.6 1.3l.2 4.1c0 1 .9 1.8 1.8 1.8.2 0 .5 0 .7-.2l4.6-2c.2-.1.5-.2.7-.2.2 0 .3 0 .5.1 2.1.6 4.3.9 6.7.9 13 0 23-9.5 23-22.3S37 1 24 1zm0 41.6c-2 0-4-.3-5.9-.8-.4-.1-.8-.2-1.3-.2-.7 0-1.3.1-2 .4l-3 1.3V41c0-1.3-.6-2.5-1.6-3.4C6.2 34 4 28.9 4 23.3 4 12.3 12.6 4 24 4s20 8.3 20 19.3-8.6 19.3-20 19.3z"/>
                        </svg>
                    )}
                </div>
            )}
            {!isMobile && (
                <Search sendToSearch={true}/>
            )}
            {user?.verified ? (
                <div className={"header__right"}>
                    <Link to={"/"}><Home /></Link>
                    {isMobile && (<Link to={ROUTER.SEARCH} onClick={() => {
                        dispatch({
                            type: actionTypes.BACK,
                            back: location.pathname
                        })
                    }}><SearchOutlined /></Link>)}
                    {!isMobile && (
                        <svg width={"24"} viewBox={"0 0 48 48"} height={"24"} className={"cramp"} onClick={() => {
                            dispatch({
                                type: actionTypes.BACK,
                                back: location.pathname
                            })
                            navigate(ROUTER.MESSENGER)
                        }}>
                            <path d="M36.2 16.7L29 22.2c-.5.4-1.2.4-1.7 0l-5.4-4c-1.6-1.2-3.9-.8-5 .9l-6.8 10.7c-.7 1 .6 2.2 1.6 1.5l7.3-5.5c.5-.4 1.2-.4 1.7 0l5.4 4c1.6 1.2 3.9.8 5-.9l6.8-10.7c.6-1.1-.7-2.2-1.7-1.5zM24 1C11 1 1 10.5 1 23.3 1 30 3.7 35.8 8.2 39.8c.4.3.6.8.6 1.3l.2 4.1c0 1 .9 1.8 1.8 1.8.2 0 .5 0 .7-.2l4.6-2c.2-.1.5-.2.7-.2.2 0 .3 0 .5.1 2.1.6 4.3.9 6.7.9 13 0 23-9.5 23-22.3S37 1 24 1zm0 41.6c-2 0-4-.3-5.9-.8-.4-.1-.8-.2-1.3-.2-.7 0-1.3.1-2 .4l-3 1.3V41c0-1.3-.6-2.5-1.6-3.4C6.2 34 4 28.9 4 23.3 4 12.3 12.6 4 24 4s20 8.3 20 19.3-8.6 19.3-20 19.3z"/>
                        </svg>
                    )}
                    <Add onClick={() => {setUploadingImage(true)}}/>
                    <FavoriteBorder />
                    {!isMobile && (
                        <ExploreOutlined/>
                    )}
                    <Link to={`${ROUTER.PROFILE}/${user.displayName}`}>
                        <Avatar
                            className={"header__avatar"}
                            src={user.avatar}
                            alt={user.displayName}
                        />
                    </Link>
                </div>
            ) : (
                <div className={"header__right"}>
                    <p className={"header__verify"}>Please verify yourself first</p>
                </div>
            )}
        </div>
    );
}

export default Header;
