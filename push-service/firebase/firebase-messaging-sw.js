// This file MUST be named 'firebase-messaging-sw.js'
// and be in the root directory.

// Import the Firebase scripts
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js",
);

// --- YOUR firebaseConfig IS PASTED HERE ---
const firebaseConfig = {
  apiKey: "AIzaSyBnr0Ut-0NZvFx6J8HSegxDFErk7hLAx8Y",
  authDomain: "pushservice-8f271.firebaseapp.com",
  projectId: "pushservice-8f271",
  storageBucket: "pushservice-8f271.firebasestorage.app",
  messagingSenderId: "937223997489",
  appId: "1:937223997489:web:dab20a226b5abf6e3bed10",
  measurementId: "G-JHBH7VXGFK",
};

// Initialize the app in the service worker
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// This handler will be called when a notification is received
// and the app is in the BACKGROUND or CLOSED.
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload,
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/firebase-logo.png", // You can add a logo here
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
