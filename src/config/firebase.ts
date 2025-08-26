
import Constants from 'expo-constants';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = (Constants.expoConfig?.extra as any)?.firebase;

if (!firebaseConfig) {
  console.warn('Firebase config missing in app.json -> expo.extra.firebase');
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
