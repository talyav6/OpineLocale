// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBj8_HiVCcL1d08_72Csy1nsiQdeXtaN7I",
    authDomain: "trip-review-c0058.firebaseapp.com",
    projectId: "trip-review-c0058",
    storageBucket: "trip-review-c0058.appspot.com",
    messagingSenderId: "443408447104",
    appId: "1:443408447104:web:8b032c166e7cf74debd865"
  };

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore()
