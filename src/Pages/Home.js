import './home.css';
import {useContext, useEffect, useState} from "react";
import userContext from "../Contexts/userContext";
import {useNavigate} from "react-router-dom";
import {ROUTER, TEST, TEST2} from "../Constants";
import Suggestions from "../Components/Suggestions";
import Post from "../Components/Post";
import {Avatar, Button} from "@material-ui/core";
import UserStory from "../Components/User-story";
import {KeyboardArrowLeft, KeyboardArrowRight} from "@material-ui/icons";
import isMobileContext from "../Contexts/isMobileContext";
import postsContext from "../Contexts/postsContext";
import OopsSomethingWentWrong from "../Components/OopsSomethingWentWrong";
import {useStateValue} from "../TempData/StateProvider";
import {actionTypes} from "../TempData/Reducer";

function Home({onPostScrolledToBottom}) {
    const {basePosts, setBasePosts} = useContext(postsContext)
    const navigate = useNavigate()
    const {user} = useContext(userContext)
    const isMobile = (useContext(isMobileContext))["isMobile"][0]
    const [{oopsError}, dispatch] = useStateValue()

    const [left, setLeft] = useState(0)
    const [storyTT, setStoryTT] = useState(false)

    const observer = new IntersectionObserver((entries, opts) => {
        entries.forEach(entry => {
            // console.log(entry.target.id + "-" + entry.isIntersecting)
        })
    }, {
        root: null,
        threshold: .5
    })

    const checkIfScrolledToBottom = (e) => {
        if (e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight) {
            onPostScrolledToBottom()
        }
    }

    return (
        <div>
            {user?.verified ? (
                <div className="Home" onScroll={checkIfScrolledToBottom}>
                    <OopsSomethingWentWrong open={oopsError.open} message={oopsError.message} onClose={() => {dispatch({type: actionTypes.OOPSERROR, oopsError: {open: false}})}}/>
                    <div className={"home__container"}>
                        <div className={"home__left"}>
                            <div className={"stories"} onLoad={() => {if (!storyTT){setStoryTT(true)}}} style={{overflow: isMobile ? "scroll" : "hidden"}}>
                                <div className={"stories__container"} style={{left: left}}>
                                    <UserStory user={user}/>
                                </div>
                                {left !== 0 && !isMobile && (
                                    <Button className={"stories__buttons stories__buttonsLeft"} onClick={() => {setLeft(Math.min(0, left+350))}}><KeyboardArrowLeft /></Button>
                                )}
                                {storyTT && !isMobile && (Math.abs(left)+document.querySelector(".stories").clientWidth < document.querySelector(".stories__container").scrollWidth) && 8 > 5 && (
                                    <Button className={"stories__buttons stories__buttonsRight"} onClick={() => {setLeft(left-350)}}><KeyboardArrowRight /></Button>
                                )}
                            </div>
                            {basePosts.map(({post, user}, ind) => (
                                <Post key={post.id} data={post} user={user} observer={observer} index={ind}/>
                            ))}
                        </div>
                        <div className={"false__suggestionContainer"}>
                            <div className={"false__suggestion"}/>
                            <Suggestions />
                        </div>
                    </div>
                </div>
            ) : (
                <p className={"home__verified"}>Home page is only available for verified emails</p>
            )}
        </div>
    );
}

export default Home;
