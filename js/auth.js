console.log("✅ auth.js loaded");

async function register() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const username = document.getElementById("username").value.trim();

  if (!email || !password || !username) {
    alert("กรอกข้อมูลให้ครบ");
    return;
  }

  try {
    const res = await auth.createUserWithEmailAndPassword(email, password);

    await db.collection("users").doc(res.user.uid).set({
      username: username,
      role: "customer",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert("สมัครสำเร็จ");
  } catch (err) {
    alert(err.message);
  }
}

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("กรอก email และ password");
    return;
  }

  try {
    await auth.signInWithEmailAndPassword(email, password);
    alert("เข้าสู่ระบบสำเร็จ");
  } catch (err) {
    alert(err.message);
  }
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