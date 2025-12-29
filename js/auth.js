console.log("✅ auth.js loaded");

function register() {
  const username = document.getElementById("regUsername").value;
  const phone = document.getElementById("regPhone").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

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
      window.location.href = "index.html";
    })
    .catch(err => alert(err.message));
}


function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "index.html";
    })
    .catch(err => alert(err.message));
}


function register() {
  const email = emailEl.value;
  const password = passwordEl.value;
  const username = usernameEl.value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(cred => {
      return db.collection("users").doc(cred.user.uid).set({
        username,
        email,
        phone: "",
        address: "",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      location.href = "index.html";
    })
    .catch(err => alert(err.message));
}

function logout() {
  auth.signOut().then(() => {
    window.location.href = "login.html";
  });
}

auth.onAuthStateChanged(async user => {
  if (!user) {
    location.href = "login.html";
    return;
  }

  const snap = await db.collection("users").doc(user.uid).get();
  if (snap.exists) {
    document.getElementById("username").innerText =
      "สวัสดี 👋 " + snap.data().username;
  }
});


