import './login.css';
import {Button, TextField} from "@material-ui/core";
import {useState} from "react";
import firebase from "firebase/compat";
import {auth} from "../../firebase";
import {useNavigate} from "react-router-dom";

function Login({toUrl}) {
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);

    const [emailError, setEmailError] = useState(null);
    const [passwordError, setPasswordError] = useState(null);

    const [fetching, setFetching] = useState(false);

    const navigate = useNavigate()


    const handleLogin = (e) => {
        e.preventDefault();
        setEmailError(null)
        setPasswordError(null)

        if (!email) {
            setEmailError('Email is required');
        } else if (!password) {
            setPasswordError('Password is required');
        } else {
            setFetching(true)
            auth.signInWithEmailAndPassword(email, password)
                .then(() => {
                    if (toUrl) {
                        navigate(toUrl);
                    }
                })
                .catch((error) => {
                    if (error.code === 'auth/wrong-password') {
                        setPasswordError('Wrong password')
                    } else if (error.code === 'auth/user-not-found') {
                        setEmailError('User isn\'t found. User may have been deleted')
                    } else if (error.code === 'auth/invalid-email') {
                        setEmailError('Email is badly formatted')
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
                <div className={"authenticator__inputs"} spacing={1}>
                    <TextField
                        error={!!emailError} helperText={emailError}
                        className={"authenticator__input"} id="outlined-basic" size={"small"} label="Email" variant="outlined" onChange={(e) => {setEmail(e.target.value)}}/>
                    <TextField
                        error={!!passwordError}
                        helperText={passwordError}
                        type={"password"}
                        className={"authenticator__input"}
                        id="outlined-basic" size={"small"}
                        label="Password" variant="outlined"
                        onChange={(e) => {setPassword(e.target.value)}}/>
                </div>
                <Button type={"submit"} size={"small"} className={"authenticator__button"} variant={"contained"} color={"primary"} onClick={handleLogin}>Log In</Button>
            </form>
        </div>
    );
}

export default Login;
