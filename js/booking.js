console.log("✅ booking.js loaded");

let RATE_KG = 2;
let RATE_NIGHT = 10;

db.collection("settings").doc("rate").get().then(doc=>{
  if(doc.exists){
    RATE_KG = doc.data().kg;
    RATE_NIGHT = doc.data().night;
  }
  updatePrice();
});

function isNightSlot(t){
  return ["21:00-22:30","22:30-00:00","00:00-02:00"].includes(t);
}

function updatePrice(){
  const w = parseFloat(document.getElementById("weight").value)||10;
  const d = parseFloat(document.getElementById("distance").value)||0;
  const t = document.getElementById("timeSlot").value;
  let price = w*RATE_KG;
  if(d<=500) price+=20;
  else if(d<=1000) price+=30;
  if(isNightSlot(t)) price+=RATE_NIGHT;
  document.getElementById("price").innerText = `💰 ราคาประมาณ: ${price} บาท`;
}

function submitBooking(){
  const user = firebase.auth().currentUser;
  if(!user){ alert("กรุณา Login"); return; }

  db.collection("orders").add({
    uid:user.uid,
    email:user.email,
    bookingDate:bookingDate.value,
    timeSlot:timeSlot.value,
    weight:Number(weight.value),
    distance:Number(distance.value),
    price:parseInt(price.innerText.replace(/\D/g,"")),
    night:isNightSlot(timeSlot.value),
    status:"รอรับงาน",
    createdAt:firebase.firestore.FieldValue.serverTimestamp()
  }).then(()=>alert("จองสำเร็จ"));
}

document.addEventListener("DOMContentLoaded",updatePrice);