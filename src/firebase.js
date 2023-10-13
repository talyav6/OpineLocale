// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA8HMcpQ7RCHZk0VZLkMc-WzX5sh6KYSFc",
  authDomain: "trip-review-8afde.firebaseapp.com",
  projectId: "trip-review-8afde",
  storageBucket: "trip-review-8afde.appspot.com",
  messagingSenderId: "368852105993",
  appId: "1:368852105993:web:a48cb7aa0e6319583331d8"
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore()
