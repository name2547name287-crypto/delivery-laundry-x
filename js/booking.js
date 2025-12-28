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