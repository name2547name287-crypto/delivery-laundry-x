// js/auth.js
console.log("✅ auth.js loaded");

// LOGIN
function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      location.href = "index.html";
    })
    .catch(err => alert(err.message));
}

// REGISTER
function register() {
  const username = document.getElementById("regUsername").value;
  const phone = document.getElementById("regPhone").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  if (!username || !email || !password) {
    alert("กรุณากรอกข้อมูลให้ครบ");
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(cred => {
      return db.collection("users").doc(cred.user.uid).set({
        username,
        phone,
        email,
        role: "customer",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      location.href = "index.html";
    })
    .catch(err => alert(err.message));
}

// LOGOUT
function logout() {
  auth.signOut().then(() => {
    location.href = "login.html";
  });
}




