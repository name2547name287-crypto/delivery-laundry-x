// ================= MACHINE CONFIG =================
// js/priceEngine.js

let PRICING = null;

function setPricingFromFirestore(data) {
  PRICING = data;
}



// ================= DELIVERY =================
function calculateDelivery(weight, distance, timeSlot) {
  let price = weight * (APP_CONFIG.pricePerKg || 2);

  if (NIGHT_SLOTS.includes(timeSlot)) {
    price += APP_CONFIG.nightFee || 10;
  }

  if (distance <= 500) price += 20;
  else if (distance <= 750) price += 30;
  else return null;

  return price;
}

// ================= BEST WASH =================
function calculateBestWash(weight, temp, extraMinute) {
  let best = { price: Infinity, machines: [] };

  function dfs(currentKg, price, machines) {
    if (currentKg >= weight) {
      if (price < best.price) {
        best = { price, machines };
      }
      return;
    }

    for (const m of WASH_MACHINES) {
      dfs(
        currentKg + m.kg,
        price + m[temp],
        [...machines, m.kg]
      );
    }
  }

  dfs(0, 0, []);

  if (best.price === Infinity) return null;

  const extraPrice =
    Math.ceil(extraMinute / 10) * EXTRA_WASH_PER_10;

  return {
    price: best.price + extraPrice,
    machines: best.machines,
    extraMinute   // ✅ ใส่บรรทัดนี้
  };
}




// ================= BEST DRY =================
function calculateBestDry(weight, extraMinute) {
  let best = { price: Infinity, machines: [] };

  function dfs(currentKg, price, machines) {
    if (currentKg >= weight) {
      if (price < best.price) {
        best = { price, machines };
      }
      return;
    }

    for (const m of DRY_MACHINES) {
      dfs(
        currentKg + m.kg,
        price + m.price,
        [...machines, m.kg]
      );
    }
  }

  dfs(0, 0, []);

  if (best.price === Infinity) return null;

  const extra =
    Math.ceil(extraMinute / 10) * EXTRA_DRY_PER_10;

  return {
    price: best.price + extra,
    machines: best.machines,
    extraMinute
  };
}


// ================= TOTAL =================
function calculateTotalPrice({
  weight,
  temp,
  washExtraMinute,
  useDry,
  dryExtraMinute,
  folding,
  distance,
  timeSlot
}) {
  if (!PRICING || !APP_CONFIG) return null;

  // ===== 🧺 ซัก =====
  const tempConfig = PRICING.wash.temperatures[temp];
  if (!tempConfig || !tempConfig.enabled) return null;

  const washBase = weight * tempConfig.price;
  const washExtra =
    Math.ceil(washExtraMinute / 10) * PRICING.wash.extraMinutePrice;

  const wash = {
    price: washBase + washExtra,
    extraMinute: washExtraMinute
  };

  // ===== 🔥 อบ =====
  let dry = null;
  if (useDry) {
    const dryExtra =
      Math.ceil(dryExtraMinute / 10) * PRICING.dry.per10Minute;

    dry = {
      price: PRICING.dry.basePrice + dryExtra,
      extraMinute: dryExtraMinute
    };
  }

  // ===== 📦 พับ =====
  const foldPrice = folding
    ? weight * PRICING.fold.perKg
    : 0;

  // ===== 🚚 ค่าส่ง =====
  let delivery = 0;

  if (distance > APP_CONFIG.serviceRadius) return null;

  delivery = weight * (APP_CONFIG.pricePerKg || 2);

  if (NIGHT_SLOTS.includes(timeSlot)) {
    delivery += APP_CONFIG.nightFee || 0;
  }

  // ===== 💰 รวม =====
  const total =
    wash.price +
    (dry?.price || 0) +
    foldPrice +
    delivery;

  return {
    wash,
    dry,
    foldPrice,
    delivery,
    total
  };
}










