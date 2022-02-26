import firebase from "firebase/compat";

const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyDcmYQf9KEAJCoqceU7bCbCRmmnPO7Gdco",
    authDomain: "my-own-insta.firebaseapp.com",
    projectId: "my-own-insta",
    storageBucket: "my-own-insta.appspot.com",
    messagingSenderId: "241691889033",
    appId: "1:241691889033:web:4a26994d963d0c8f99a558"
});

const db = firebaseApp.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

export { db, auth, storage };
