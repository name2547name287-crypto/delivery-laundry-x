console.log("✅ auth.js loaded");

function login(){
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  firebase.auth().signInWithEmailAndPassword(email,password)
    .then(()=>alert("Login สำเร็จ"))
    .catch(err=>alert(err.message));
}