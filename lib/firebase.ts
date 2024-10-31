import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCf-4orXfvVmTJf6f4EE1UGqjLNs7jM7rE",
  authDomain: "lucypro-5e443.firebaseapp.com",
  projectId: "lucypro-5e443",
  storageBucket: "lucypro-5e443.appspot.com",
  messagingSenderId: "569383346148",
  appId: "1:569383346148:web:24c48aeea756f3c4b731f1",
  measurementId: "G-NX4F4N5M2T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);