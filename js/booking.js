 alert("booking.js loaded");

 const weight = document.getElementById("weight");
const timeSlot = document.getElementById("timeSlot");
const washTemp = document.getElementById("washTemp");
const dryMinuteEl  = document.getElementById("dryMinute");
const folding = document.getElementById("folding");
const useDry = document.getElementById("useDry");
const washMinuteEl = document.getElementById("washMinute");

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
const priceEl = document.getElementById("price");

function updatePrice() {
const result = calculateTotalPrice({
  weight: Number(weight.value),
  distance: currentDistance,
  timeSlot: timeSlot.value,
  temp: washTemp.value,
 washMinute: Number(washMinuteEl.value),
  dryMinute: Number(dryMinuteEl.value),
  folding: folding.checked,
  useDry: useDry.checked
});

if (useDry.checked && Number(dryMinute.value) < 0) {
  dryMinute.value = 0;
}


  if (!result) {
 priceEl.innerText = "❌ คำนวณไม่ได้";
    return;
  }

  priceEl.innerText = `
🚚 ค่าส่ง ${result.delivery} บาท
 ${result.wash
  ? `🧺 ค่าซัก ${result.wash.price} บาท (${result.wash.machines.join(" + ")}kg)`
  : "ไม่ซัก"}
 ${result.dry ? `🔥 ค่าอบ ${result.dry.price} บาท (${result.dry.machines.join(" + ")}kg)` : "🔥 ไม่อบผ้า"}
📦 พับ ${result.foldPrice} บาท
💰 รวม ${result.total} บาท
`;

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
  console.log("🔥 submitBooking called");

  const user = auth.currentUser;
  if (!user) return alert("กรุณาเข้าสู่ระบบ");
  if (!isInServiceArea) return alert("อยู่นอกพื้นที่ให้บริการ");

  // 🔹 ดึงข้อมูล profile
  const userSnap = await db.collection("users").doc(user.uid).get();
  if (!userSnap.exists) {
    alert("ไม่พบข้อมูลผู้ใช้");
    return;
  }

  const u = userSnap.data();

  if (!u.username || !u.phone) {
    alert("กรุณากรอกชื่อและเบอร์ในโปรไฟล์ก่อน");
    location.href = "profile.html";
    return;
  }

  const customerNote =
    document.getElementById("customerNote")?.value || "";

  const bookingDate = document.getElementById("bookingDate").value;
  const timeSlot = document.getElementById("timeSlot").value;
  const weight = Number(document.getElementById("weight").value);
  const WASH_MACHINES = [
  { kg: 10, cold: 40, warm: 50, hot: 60 },
  { kg: 14, cold: 60, warm: 70, hot: 80 },
  { kg: 18, cold: 70, warm: 80, hot: 90 },
  { kg: 28, cold: 100, warm: 120, hot: 140 }
];
const DRY_MACHINES = [
  { kg: 15, baseMinute: 30, price: 50 },
  { kg: 20, baseMinute: 30, price: 60 },
  { kg: 25, baseMinute: 30, price: 70 }
];



const priceResult = calculateTotalPrice({
  weight,
  distance: currentDistance,
  timeSlot,
  temp: washTemp.value,
  washMinute: Number(washMinuteEl.value),
  dryMinute: Number(dryMinuteEl.value),
  folding: folding.checked,
  useDry: useDry.checked
});


if (!priceResult) {
  alert("คำนวณราคาไม่ได้");
  return;
}



if (!priceResult) {
  return alert("❌ อยู่นอกพื้นที่ให้บริการ");
}


  if (!bookingDate) return alert("กรุณาเลือกวันที่");

  const selected = new Date(`${bookingDate} ${timeSlot}`);
  if (selected < new Date()) {
    return alert("ไม่สามารถจองย้อนหลังได้");
  }
  
  console.log("📍 ตำแหน่งผู้ใช้:", marker.getPosition().toJSON());
  const lat = marker.getPosition().lat();
  const lng = marker.getPosition().lng();

  try {
    // ✅ บันทึก order แค่ครั้งเดียว
  const ref = await db.collection("orders").add({
  // ===== NEW SYSTEM =====
  wash: priceResult.wash,
  dry: priceResult.dry,
  foldPrice: priceResult.foldPrice,
  total: priceResult.total,

  // ===== LEGACY (ห้ามหาย) =====
  userId: user.uid,
  username: u.username,
  phone: u.phone,

  bookingDate,
  timeSlot,
  weight,

  lat,
  lng,

  price: priceResult.total,
  status: "wait",

  paymentMethod: selectedPayment,
  paymentStatus: selectedPayment === "cash"
    ? "pay_on_delivery"
    : "waiting_transfer",

  createdAt: firebase.firestore.FieldValue.serverTimestamp()
});




    // ✅ แยกเส้นทางชัดเจน
    if (selectedPayment === "transfer") {
      location.href = "payment.html?id=" + ref.id;
    } else {
      location.href = "order.html";
    }

  } catch (err) {
    console.error(err);
    alert("บันทึกไม่สำเร็จ");
  }
}
 
let selectedPayment = "cash";

function selectPayment(type) {
  selectedPayment = type;

  document.querySelectorAll(".payment-card")
    .forEach(card => card.classList.remove("active"));

  const card = document.querySelector(
    `.payment-card input[value="${type}"]`
  )?.closest(".payment-card");

  if (card) card.classList.add("active");

  console.log("💳 payment =", selectedPayment);
}

[
  "weight",
  "timeSlot",
  "washTemp",
  "washMinute",
  "dryMinute",
  "folding"
].forEach(id => {
 document.getElementById(id)?.addEventListener("change", updatePrice);
});
["dryMinute", "washMinute"].forEach(id => {
  document.getElementById(id)?.addEventListener("input", updatePrice);
});


document.addEventListener("DOMContentLoaded", () => {
  const useDryEl = document.getElementById("useDry");
  const dryMinuteEl = document.getElementById("dryMinute");

  if (!useDryEl || !dryMinuteEl) return;

  useDryEl.addEventListener("change", () => {
    if (useDryEl.checked) {
      dryMinuteEl.disabled = false;
    } else {
      dryMinuteEl.disabled = true;
      dryMinuteEl.value = 0;
    }

    updatePrice(); // 🔥 สำคัญมาก
  });
});

