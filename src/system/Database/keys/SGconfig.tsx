import {decode} from "base-64";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const FIRE_API_KEY = decode(
    "QUl6YVN5RFg5cmp1YUNtVHkwWmVuTVFGVXVOUkc3UjY1U01ZbE9J"
);
const FIRE_PROJECT_ID = "hamang-mq-sg";

export const firebaseConfigSG = {
    apiKey: FIRE_API_KEY,
    authDomain: `${FIRE_PROJECT_ID}.firebaseapp.com`,
    projectId: FIRE_PROJECT_ID,
    databaseURL: `https://${FIRE_PROJECT_ID}-default-rtdb.asia-southeast1.firebasedatabase.app/`,
    storageBucket: "hamang-mq-sg.appspot.com",
    messagingSenderId: "723965104054",
    appId: decode("MTo3MjM5NjUxMDQwNTQ6d2ViOjVkNWJiMjBjNTY5OWYxOWE3YWZiMTc=")
};