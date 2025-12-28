console.log("✅ auth.js loaded");

function login(){
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  firebase.auth().signInWithEmailAndPassword(email,password)
    .then(()=>alert("Login สำเร็จ"))
    .catch(err=>alert(err.message));
}

const auth = firebase.auth();
const db = firebase.firestore();

async function register() {
  const email = emailEl.value;
  const pass = passwordEl.value;
  const username = usernameEl.value;

  const res = await auth.createUserWithEmailAndPassword(email, pass);

  await db.collection("users").doc(res.user.uid).set({
    username,
    role: "customer"
  });

  location.href = "index.html";
}

async function login() {
  await auth.signInWithEmailAndPassword(
    emailEl.value,
    passwordEl.value
  );
  location.href = "index.html";
}
