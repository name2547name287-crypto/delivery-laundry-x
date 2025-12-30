 alert("booking.js loaded");

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
const SERVICE_RADIUS = 750;

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

  let price = weight * 2;

  if (currentDistance <= 500) price += 20;
  else if (currentDistance <= 750) price += 30;
  else {
    priceEl.innerText = "❌ นอกพื้นที่ให้บริการ";
    return;
  }

  if (NIGHT_SLOTS.includes(timeSlot)) {
  price += 10;
  }


  priceEl.innerText = `💰 ราคาประมาณ: ${price} บาท`;
}

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
  // 1. เช็ก login
  const user = auth.currentUser;
  if (!user) {
    alert("กรุณาเข้าสู่ระบบ");
    return;
  }

  // 2. เช็กพื้นที่
  if (!isInServiceArea) {
    alert("อยู่นอกพื้นที่ให้บริการ");
    return;
  }

  // 3. ดึงค่าจากหน้าเว็บ
  const customerName = document.getElementById("customerName").value;
const customerPhone = document.getElementById("customerPhone").value;

if (!customerName || !customerPhone) {
  alert("กรุณากรอกชื่อและเบอร์โทร");
  return;
}

// พิกัดจาก marker บนแผนที่
const lat = marker.getPosition().lat();
const lng = marker.getPosition().lng();

  const weight = Number(document.getElementById("weight").value);
  const timeSlot = document.getElementById("timeSlot").value;
  const priceText = document.getElementById("price").innerText;
  const bookingDate = document.getElementById("bookingDate").value;

  if (!bookingDate) {
    alert("กรุณาเลือกวันที่");
    return;
  }

  if (!priceText.includes("บาท")) {
    alert("กรุณาเลือกจุดรับผ้า");
    return;
  }

  // 4. ห้ามจองย้อนหลัง
  const now = new Date();
  const selected = new Date(`${bookingDate} ${timeSlot}`);
  if (selected < now) {
    alert("ไม่สามารถจองย้อนหลังได้");
    return;
  }

  const price = Number(priceText.replace(/[^\d]/g, ""));

  // 5. บันทึก Firebase
  try {
   await db.collection("orders").add({
  userId: user.uid,
  customerName,
  customerPhone,
  weight,
  price,
  timeSlot,
  bookingDate,
  location: {
    lat,
    lng
  },
  status: "wait", // สถานะแรก
  createdAt: firebase.firestore.FieldValue.serverTimestamp()
});

    // 6. ไปหน้าสถานะ
    window.location.href = "order.html";

  } catch (err) {
    alert("บันทึกไม่สำเร็จ");
    console.error(err);
  }
}



function openProfile() {
  alert("กำลังพัฒนา");
}

function logout() {
  auth.signOut().then(() => {
    location.href = "login.html";
  });
}