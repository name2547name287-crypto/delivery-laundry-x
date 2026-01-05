 alert("booking.js loaded");

let APP_CONFIG = {
  serviceRadius: 750,
  pricePerKg: 2,
  nightFee: 10
};

let SERVICE_RADIUS = 750;

async function loadConfig() {
  const snap = await db.collection("config").doc("app").get();
  if (snap.exists) {
    APP_CONFIG = snap.data();
    SERVICE_RADIUS = APP_CONFIG.serviceRadius || 750;
  }
}


const NIGHT_SLOTS = [
  "21:00",
  "22:30",
  "00:00",
  "02:00"
];


// ===== GLOBAL =====
let map, marker, circle;
let isInServiceArea = false;
let currentDistance = 0;

// ===== CONFIG =====
const SHOP_CENTER = { lat: 16.426657691622538, lng: 102.83257797027551 };


// ===== PRICE =====
function updatePrice() {
  const weight = Number(document.getElementById("weight")?.value) || 10;
  const timeSlot = document.getElementById("timeSlot")?.value;
  const priceEl = document.getElementById("price");

  if (!priceEl) return;

  if (!currentDistance || currentDistance === 0) {
    priceEl.innerText = "📍 กรุณาเลือกจุดรับผ้าบนแผนที่";
    return;
  }

  if (!isInServiceArea) {
    priceEl.innerText = "❌ อยู่นอกพื้นที่ให้บริการ";
    return;
  }

  let price = weight * (APP_CONFIG.pricePerKg || 2);

if (NIGHT_SLOTS.includes(timeSlot)) {
  price += APP_CONFIG.nightFee || 10;
}


  if (currentDistance <= 500) price += 20;
  else if (currentDistance <= 750) price += 30;
  else {
    priceEl.innerText = "❌ นอกพื้นที่ให้บริการ";
    return;
  }

 if (NIGHT_SLOTS.includes(timeSlot)) {
  price += APP_CONFIG.nightFee || 10;
}



  priceEl.innerText = `💰 ราคาประมาณ: ${price} บาท`;

}
document.addEventListener("DOMContentLoaded", async () => {
  await loadConfig();
});

// ===== MAP =====
window.initMap = function () {
  const mapEl = document.getElementById("map");
  if (!mapEl) {
    alert("❌ map element not found");
    return;
  }

  map = new google.maps.Map(mapEl, {
    center: SHOP_CENTER,
    zoom: 15,
  });

  circle = new google.maps.Circle({
  map,
  center: SHOP_CENTER,
  radius: SERVICE_RADIUS,
  fillColor: "#d32f2f",
  fillOpacity: 0.25,
  strokeColor: "#d32f2f",
  clickable: false   // ⭐ สำคัญมาก
  });


  marker = new google.maps.Marker({
    map,
    position: SHOP_CENTER,
    draggable: true,
  });

  map.addListener("click", (e) => {
    marker.setPosition(e.latLng);
    checkArea();
  });


  marker.addListener("dragend", checkArea);

  checkArea();
  

};

function checkArea() {
  currentDistance =
    google.maps.geometry.spherical.computeDistanceBetween(
      marker.getPosition(),
      circle.getCenter()
    );

  const statusEl = document.getElementById("areaStatus");
  const distanceText = document.getElementById("distanceText");

  if (distanceText) {
    distanceText.innerText =
      "📍 ระยะทาง: " + Math.round(currentDistance) + " เมตร";
  }

  if (currentDistance <= SERVICE_RADIUS) {
    isInServiceArea = true;
    statusEl.innerText = "✅ อยู่ในพื้นที่ให้บริการ";
    statusEl.style.color = "green";
  } else {
    isInServiceArea = false;
    statusEl.innerText = "❌ อยู่นอกพื้นที่ให้บริการ";
    statusEl.style.color = "red";
  }

  updatePrice();
}

function useMyLocation() {
  if (!navigator.geolocation) {
    alert("อุปกรณ์ไม่รองรับ GPS");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const userLatLng = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };

      marker.setPosition(userLatLng);
      map.panTo(userLatLng);
      checkArea();
    },
    () => {
      alert("ไม่สามารถเข้าถึงตำแหน่งได้ กรุณาเปิด GPS");
    },
    { enableHighAccuracy: true }
  );
}

async function submitBooking() {
  const user = auth.currentUser;
  if (!user) return alert("กรุณาเข้าสู่ระบบ");
  if (!isInServiceArea) return alert("อยู่นอกพื้นที่ให้บริการ");

 // 🔹 ดึงข้อมูล user จาก Firestore
  const userSnap = await db.collection("users").doc(user.uid).get();
  if (!userSnap.exists) {
    alert("ไม่พบข้อมูลผู้ใช้");
    return;
  }

  const u = userSnap.data();

  // ❗ ถ้ายังไม่กรอก profile
  if (!u.username || !u.phone) {
    alert("กรุณากรอกชื่อและเบอร์ในโปรไฟล์ก่อนใช้งาน");
    location.href = "profile.html";
    return;
  }

  // ===== ใช้ข้อมูลจาก profile =====
  const customerName = u.username;
  const customerPhone = u.phone;
  const customerNote = document.getElementById("customerNote").value || "";

  const bookingDate = document.getElementById("bookingDate").value;
  const timeSlot = document.getElementById("timeSlot").value;
  const weight = Number(document.getElementById("weight").value);
  const priceText = document.getElementById("price").innerText;

  if (!customerName || !customerPhone) return alert("กรุณากรอกชื่อและเบอร์");
  if (!bookingDate) return alert("กรุณาเลือกวันที่");
  if (!priceText.includes("บาท")) return alert("กรุณาเลือกจุดรับผ้า");

  const selected = new Date(`${bookingDate} ${timeSlot}`);
  if (selected < new Date()) return alert("ไม่สามารถจองย้อนหลังได้");

  const price = Number(priceText.replace(/[^\d]/g, ""));
  const lat = marker.getPosition().lat();
  const lng = marker.getPosition().lng();

  try {
    await db.collection("orders").add({
      userId: user.uid,
      username: customerName,
      phone: customerPhone,
      note: customerNote,
      lat,
      lng,
      weight,
      price,
      bookingDate,
      timeSlot,
      status: "wait",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    location.href = "order.html";
  } catch (e) {
    console.error(e);
    alert("บันทึกไม่สำเร็จ");
  }
}


