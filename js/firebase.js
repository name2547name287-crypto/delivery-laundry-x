// Firebase config (ใส่ค่าจริงของคุณ)
const firebaseConfig = {
  apiKey: "AIzaSyCNTbxBMf5gL-KqdXznqIT5Mtwu9NLckxY",
  authDomain: "delivery-laundry-x-dcd9f.firebaseapp.com",
  projectId: "delivery-laundry-x-dcd9f",
  storageBucket: "delivery-laundry-x-dcd9f.firebasestorage.app",
  messagingSenderId: "648273904876",
  appId: "1:648273904876:web:422a1e6ca41c85269411c9"
};

// Init Firebase
firebase.initializeApp(firebaseConfig);

// Services
const auth = firebase.auth();
const db = firebase.firestore();

console.log("🔥 Firebase initialized");