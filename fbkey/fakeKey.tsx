// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const FIRE_API_KEY = "Some Firebase API Key";
const FIRE_PROJECT_ID = "Some Firebase Project Name";

export const firebaseConfigSG = {
    apiKey: FIRE_API_KEY,
    authDomain: `${FIRE_PROJECT_ID}.firebaseapp.com`,
    projectId: FIRE_PROJECT_ID,
    databaseURL: `https://${FIRE_PROJECT_ID}-default-rtdb.asia-southeast1.firebasedatabase.app/`,
    storageBucket: `${FIRE_PROJECT_ID}.appspot.com`,
    messagingSenderId: "some message sender id",
    appId: ("Some App ID")
};