alert("booking.js loaded");

// ===== DEBUG PANEL =====
const debugBox = document.createElement("div");
debugBox.style.background = "#000";
debugBox.style.color = "#0f0";
debugBox.style.padding = "10px";
debugBox.style.fontSize = "12px";
debugBox.style.whiteSpace = "pre-wrap";
debugBox.innerText = "🛠 DEBUG LOG\n";
document.body.appendChild(debugBox);

function log(msg) {
  debugBox.innerText += msg + "\n";
}

log("booking.js loaded");

if (!isInServiceArea) {
  alert("อยู่นอกพื้นที่ให้บริการ ไม่สามารถจองได้");
  return;
}

console.log("✅ booking.js loaded");

function updatePrice() {
  const weightEl = document.getElementById("weight");
  const distanceEl = document.getElementById("distance");
  const timeSlotEl = document.getElementById("timeSlot");
  const priceEl = document.getElementById("price");

  if (!weightEl || !distanceEl || !timeSlotEl || !priceEl) {
    console.error("❌ element missing");
    return;
  }

  const weight = Number(weightEl.value) || 10;
  const distance = Number(distanceEl.value) || 0;
  const timeSlot = timeSlotEl.value;

  let price = weight * 2; // 2 บาท / kg

  if (distance <= 500) price += 20;
  else if (distance <= 1000) price += 30;

  if (timeSlot >= "21:30") price += 10;

  priceEl.innerText = `💰 ราคาประมาณ: ${price} บาท`;
}

document.addEventListener("DOMContentLoaded", updatePrice);

// ===== MAP CONFIG =====
let map, marker, circle;
let isInServiceArea = false;

// 🔴 เปลี่ยนเป็นพิกัดร้านคุณจริง
const SHOP_CENTER = { lat: 13.7563, lng: 100.5018 }; 
const SERVICE_RADIUS = 1000; // เมตร (1 กม.)

window.initMap = function () {
  log("✅ initMap called");

  const mapEl = document.getElementById("map");
  if (!mapEl) {
    log("❌ map element NOT FOUND");
    return;
  }

  mapEl.style.background = "#ddd";
  log("📦 map element found");

  new google.maps.Map(mapEl, {
    center: { lat: 13.7563, lng: 100.5018 },
    zoom: 15,
  });

  log("🗺 map rendered");
};


function checkArea() {
  const distance =
    google.maps.geometry.spherical.computeDistanceBetween(
      marker.getPosition(),
      circle.getCenter()
    );

  const statusEl = document.getElementById("areaStatus");
  const submitBtn = document.querySelector("button");

  if (distance <= SERVICE_RADIUS) {
    isInServiceArea = true;
    statusEl.innerText = "✅ อยู่ในพื้นที่ให้บริการ";
    statusEl.style.color = "green";
    submitBtn.disabled = false;
    submitBtn.style.opacity = 1;
  } else {
    isInServiceArea = false;
    statusEl.innerText = "❌ อยู่นอกพื้นที่ให้บริการ (เกิน 1 กม.)";
    statusEl.style.color = "red";
    submitBtn.disabled = true;
    submitBtn.style.opacity = 0.6;
  }
}