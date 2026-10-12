const firebaseConfig = {
  apiKey: "AIzaSyCqMH6_r6d0FrJsWGAIDW8Gk5L-cRdF9uI",
  authDomain: "project-quan-cafe.firebaseapp.com",
  projectId: "project-quan-cafe",
  storageBucket: "project-quan-cafe.firebasestorage.app",
  messagingSenderId: "934988771368",
  appId: "1:934988771368:web:e3355cbad098d081dd451d",
  measurementId: "G-8YTXYJLB6K"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();

window.firebaseDb = db;
window.firebaseAuth = auth;
window.db = db;