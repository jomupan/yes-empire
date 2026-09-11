import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAx6jcFHzqvojCYUK22hQ4ePNeVmAKXAZQ",
    authDomain: "yes-empire-app.firebaseapp.com",
    projectId: "yes-empire-app",
    storageBucket: "yes-empire-app.firebasestorage.app",
    messagingSenderId: "736434237292",
    appId: "1:736434237292:web:07a5666ebdfcee840b74d49"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);