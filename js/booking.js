alert("booking.js loaded");

// ===== GLOBAL =====
let map, marker, circle;
let isInServiceArea = false;
let currentDistance = 0;

// ===== CONFIG =====
const SHOP_CENTER = { lat: 16.426657691622538, lng: 102.83257797027551 };
const SERVICE_RADIUS = 1000;

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
  else if (currentDistance <= 1000) price += 30;
  else {
    priceEl.innerText = "❌ เกินระยะให้บริการ";
    return;
  }

  if (timeSlot && timeSlot >= "21:30") {
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
