import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import Constants from 'expo-constants';

// Firebase configuration from app.json
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebase?.apiKey || "AIzaSyDgto5b14cf1FATduNMWUn01qxySlD8YiE",
  authDomain: Constants.expoConfig?.extra?.firebase?.authDomain || "handyman-c1eee.firebaseapp.com",
  projectId: Constants.expoConfig?.extra?.firebase?.projectId || "handyman-c1eee",
  storageBucket: Constants.expoConfig?.extra?.firebase?.storageBucket || "handyman-c1eee.appspot.com",
  messagingSenderId: Constants.expoConfig?.extra?.firebase?.messagingSenderId || "26293725527",
  appId: Constants.expoConfig?.extra?.firebase?.appId || "1:26293725527:web:31d81e346d5b1f2dc83612",
  measurementId: Constants.expoConfig?.extra?.firebase?.measurementId || "G-5H02SSPNKL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;