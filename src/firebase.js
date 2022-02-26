import firebase from "firebase/compat";

const firebaseApp = firebase.initializeApp({
    /**/
});

const db = firebaseApp.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

export { db, auth, storage };
