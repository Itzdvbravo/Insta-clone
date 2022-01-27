import firebase from "firebase/compat";

const firebaseApp = firebase.initializeApp({
    //details
});

const db = firebaseApp.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

export { db, auth, storage };
