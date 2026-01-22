// js/priceEngine.js

let PRICE_CONFIG = {
  delivery: {
    pricePerKg: 2,
    nightFee: 10,
    distance: [
      { max: 500, price: 20 },
      { max: 750, price: 30 }
    ]
  },
  laundry: {
    wash: {
      cold: 30,
      warm: 40,
      hot: 50
    },
    washExtraMinutePrice: 2,
    dry: {
      base: 20,
      per10min: 10
    },
    foldPerKg: 1.5
  }
};

// โหลดราคาจาก Firebase (admin ปรับได้)
async function loadPriceConfig() {
  const snap = await db.collection("pricing").doc("laundry").get();
  if (snap.exists) {
    PRICE_CONFIG.laundry = snap.data();
  }

  const cfg = await db.collection("config").doc("app").get();
  if (cfg.exists) {
    PRICE_CONFIG.delivery.pricePerKg = cfg.data().pricePerKg || 2;
    PRICE_CONFIG.delivery.nightFee = cfg.data().nightFee || 10;
  }
}

// 🚚 ค่าส่ง
function calculateDeliveryPrice({ weight, distance, timeSlot }) {
  let price = weight * PRICE_CONFIG.delivery.pricePerKg;

  if (["21:00", "22:30", "00:00", "02:00"].includes(timeSlot)) {
    price += PRICE_CONFIG.delivery.nightFee;
  }

  const zone = PRICE_CONFIG.delivery.distance.find(d => distance <= d.max);
  if (!zone) return null;

  price += zone.price;
  return price;
}

// 🧺 ค่าซัก
function calculateLaundryPriceEngine({
  weight,
  temp,
  extraMinute,
  dryMinute,
  folding
}) {
  let price = PRICE_CONFIG.laundry.wash[temp] || 0;

  price += extraMinute * PRICE_CONFIG.laundry.washExtraMinutePrice;

  if (dryMinute > 0) {
    price += PRICE_CONFIG.laundry.dry.base;
    price += Math.floor(dryMinute / 10) * PRICE_CONFIG.laundry.dry.per10min;
  }

  if (folding) {
    price += weight * PRICE_CONFIG.laundry.foldPerKg;
  }

  return price;
}

// 💰 รวมทั้งหมด
function calculateTotalPrice(input) {
  const delivery = calculateDeliveryPrice(input);
  if (delivery === null) return null;

  const laundry = calculateLaundryPriceEngine(input);

  return {
    delivery,
    laundry,
    total: delivery + laundry
  };
}
