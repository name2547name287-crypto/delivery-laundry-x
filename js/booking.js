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

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
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
    strokeWeight: 2,
  });

  marker = new google.maps.Marker({
    map,
    position: SHOP_CENTER,
    draggable: true,
  });

  checkArea(); // เช็กครั้งแรก

  marker.addListener("dragend", checkArea);
}

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