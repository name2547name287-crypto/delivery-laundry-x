console.log("✅ auth.js loaded");

async function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const username = document.getElementById("username").value;

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
    window.location.href = "index.html";
  } catch (err) {
    alert(err.message);
  }
}

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await auth.signInWithEmailAndPassword(email, password);
    window.location.href = "index.html";
  } catch (err) {
    alert(err.message);
  }
}
