import './editprofile.css';
import React, {useContext, useEffect, useState} from "react";
import userContext from "../../Contexts/userContext";
import {Avatar} from "@material-ui/core";
import {sessionCache, TESTER} from "../../Fetcher";
import {auth, db, storage} from "../../firebase";
import {ChevronLeft} from "@material-ui/icons";
import isMobileContext from "../../Contexts/isMobileContext";
import {useNavigate} from "react-router-dom";
import {useStateValue} from "../../TempData/StateProvider";

function EditProfile() {
    const {user} = useContext(userContext)

    const [avatar, setAvatar] = useState(user.avatar)
    const [name, setName] = useState(user.displayName)
    const [bio, setBio] = useState(user.bio)

    const [check, setCheck] = useState(false)

    useEffect(() => {
        setCheck(user.bio !== bio)
    }, [bio, user])

    const updateAccount = (updates) => {
        sessionCache.set(user.uid, {...user, ...updates})
        db.collection(TESTER + "users").doc(user.uid).update(updates)
    }

    const fileSelect = () => {
        const fileSelector = document.createElement('input');
        fileSelector.setAttribute('type', 'file');
        fileSelector.setAttribute('accept', 'image/*');
        fileSelector.addEventListener('change', updateAvatar)
        fileSelector.click()
    }

    const updateAvatar = (e) => {
        if (e.target.files[0]) {
            var image = e.target.files[0]
            if (image.type.includes('image')) {
                const uploadTask = storage.ref(`avatar/${auth.currentUser.uid}`).put(image);
                uploadTask.on('state_changed', () => { },
                    (error) => { console.log(error); },
                    () => {
                        storage
                            .ref("avatar")
                            .child(auth.currentUser.uid)
                            .getDownloadURL()
                            .then((url) => {
                                setAvatar(url);
                                updateAccount({avatar: url})
                            });
                    });
            }
        }
    }

    return (
        <div className="EditProfile">
            <div className={"editprofile__container"}>
                <div className={"editprofile__user"}>
                    <Avatar
                        className={"editprofile__user-avatar"}
                        src={avatar}
                        alt={user.displayName}
                        onClick={() => {
                            fileSelect()
                        }}
                    />
                    <div>
                        <p className={"editprofile__user-name"}>{user.displayName}</p>
                        <p className={"editprofile__user-cpp"} onClick={() => {fileSelect()}}>Change Profile Photo</p>
                    </div>
                </div>
                <div className={"editprofile__details"}>
                    <div className={"editprofile__detail"}>
                        <p className={"editprofile__detail-title"}>Username</p>
                        <div className={"editprofile__detail-box"}>
                            <input disabled={true} className={"editprofile__detail-input"} value={name}/>
                            <p className={"editprofile__detail-info"}>Help people discover your account by using the name you're known by: your username.</p>
                            <p className={"editprofile__detail-info editprofile__detail-warning"}>You can't change it for now.</p>
                        </div>
                    </div>
                    <div className={"editprofile__detail"}>
                        <p className={"editprofile__detail-title"}>Bio</p>
                        <div className={"editprofile__detail-box"}>
                            <input className={"editprofile__detail-input"} value={bio} onChange={(e) => {
                                setBio(e.target.value)
                            }}/>
                            <p className={"editprofile__detail-info"}>Write a bio of maximum 2000 characters. Make it interesting to influence more people to follow you.</p>
                        </div>
                    </div>
                    <div className={"editprofile__submit"}>
                        <button className={"editprofile__submit-button"} style={{backgroundColor: `rgba(0, 149, 246, ${check ? 1 : 0.7})`, cursor: check ? 'pointer' : 'default'}} onClick={() => {
                            if (check) {
                                updateAccount({bio: bio})
                            }
                        }}>Submit</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditProfile;
