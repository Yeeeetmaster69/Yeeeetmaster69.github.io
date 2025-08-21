// Service worker for Firebase Cloud Messaging.  This file runs in the
// background and receives push notifications when the web app is not
// active.  It imports the Firebase libraries and initializes the
// messaging instance using the same config as the main application.

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging.js');

// Firebase configuration.  This should mirror the config used in
// Handymanapp.html.  Replace the VAPID key with your own if needed.
const firebaseConfig = {
  apiKey: "AIzaSyDgto5b14cf1FATduNMWUn01qxySlD8YiE",
  authDomain: "handyman-c1eee.firebaseapp.com",
  projectId: "handyman-c1eee",
  storageBucket: "handyman-c1eee.firebasestorage.app",
  messagingSenderId: "26293725527",
  appId: "1:26293725527:web:31d81e346d5b1f2dc83612",
  measurementId: "G-5H02SSPNKL",
  messagingVapidKey: "BGaR2Au9uNoF11BJlRoXm02DjO64gGgTXjfqcKZzzHeML89Di2adOqNMhgRqwOfDMaU90SczrIUX-PuKnf1_01U"
};

// Initialize Firebase in the service worker.  This must be done before
// calling getMessaging().
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages.  When a push arrives and the app is in the
// background, this handler will display a notification.  Customize the
// notification here as desired.
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/favicon.ico'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});