import './login.css';
import {Button, Stack, TextField} from "@material-ui/core";
import {useState} from "react";
import firebase from "firebase/compat";
import {auth, db} from "../../firebase";
import {useNavigate} from "react-router-dom";
import { TESTER } from '../../Fetcher';

function Register() {
    const navigate = useNavigate()
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [passwordConfirm, setPasswordConfirm] = useState(null);

    const [usernameError, setUsernameError] = useState(null);
    const [emailError, setEmailError] = useState(null);
    const [passwordError, setPasswordError] = useState(null);
    const [passwordConfirmError, setPasswordConfirmError] = useState(null);

    const [fetching, setFetching] = useState(false);

    const handleRegister = (e) => {
        e.preventDefault();

        setUsernameError(null);
        setEmailError(null);
        setPasswordError(null);
        setPasswordConfirmError(null);

        if (!username) {
            setUsernameError('Username is required');
        } else if (!email) {
            setEmailError('Email is required');
        } else if (!password) {
            setPasswordError('Password is required');
        } else if (!passwordConfirm) {
            setPasswordConfirmError('Password confirmation is required');
        } else if (password !== passwordConfirm) {
            setPasswordConfirmError('Passwords do not match');
        } else {
            setFetching(true)
            auth
                .createUserWithEmailAndPassword(email, password)
                .then((data) => {
                    setFetching(false)
                    db.collection(TESTER + "users").doc(data.user.uid).set({
                        displayName: username.toLowerCase(),
                        followers: {},
                        following: {},
                        avatar: "https://firebasestorage.googleapis.com/v0/b/my-own-insta.appspot.com/o/avatar%2FInstagram.jpg?alt=media&token=3e8a4b77-7771-4c4f-9849-e64388da2641",
                        bio: 'Hi! I\'m new to instagram',
                        messages: {},
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    })
                    db.collection("userList").doc("only").update({
                        users: firebase.firestore.FieldValue.arrayUnion(username.toLowerCase())
                    })
                    // auth.currentUser.sendEmailVerification()
                })
                .catch((error) => {
                    if (error.code === 'auth/email-already-in-use') {
                        setEmailError('Email is already in use');
                    } else if (error.code === 'auth/invalid-email') {
                        setEmailError('Email is invalid');
                    } else if (error.code === 'auth/weak-password') {
                        setPasswordError('Password is too weak');
                    } else {
                        setEmailError(error.message)
                    }
                    setFetching(false)
                });
        }
    };

    return (
        <div className="authenticator">
            <form className={"authenticator__form"}>
                <div className={"authenticator__inputs"}>
                    <TextField error={!!usernameError} helperText={usernameError}
                        className={"authenticator__input"} id="outlined-basic" size={"small"} label="Username" variant="outlined"  onChange={(e) => {setUsername(e.target.value)}}/>
                    <TextField error={!!emailError} helperText={emailError}
                        className={"authenticator__input"} id="outlined-basic" size={"small"} label="Email" variant="outlined" onChange={(e) => {setEmail(e.target.value)}}/>
                    <TextField error={!!passwordError} helperText={passwordError}
                        type={"password"} className={"authenticator__input"} id="outlined-basic" size={"small"} label="Password" variant="outlined" onChange={(e) => {setPassword(e.target.value)}}/>
                    <TextField error={!!passwordConfirmError} helperText={passwordConfirmError}
                        type={"password"} className={"authenticator__input"} id="outlined-basic" size={"small"} label="Password Confirm" variant="outlined"  onChange={(e) => {setPasswordConfirm(e.target.value)}}/>
                </div>
                <Button disabled={fetching} size={"small"} type={"submit"} className={"authenticator__button"} variant={"contained"} color={"primary"} onClick={handleRegister}>Register</Button>
            </form>
        </div>
    );
}

export default Register;
