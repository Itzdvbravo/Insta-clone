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

function Home() {
    const {basePosts, setBasePosts} = useContext(postsContext)
    const navigate = useNavigate()
    const {user} = useContext(userContext)
    const isMobile = (useContext(isMobileContext))["isMobile"][0]

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

    useEffect(() => {

    }, []);

    return (
        <div>
            {user?.verified ? (
                <div className="Home">
                    <div className={"home__container"}>
                        <div className={"home__left"}>
                            {/*<div className={"observer"} style={{position: "absolute", height: "100%", width: "482px"}}>*/}

                            {/*</div>*/}
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
