// ================= MACHINE CONFIG =================
// js/priceEngine.js

const WASH_MACHINES = [
  { kg: 10, cold: 40, warm: 50, hot: 60 },
  { kg: 14, cold: 60, warm: 70, hot: 80 },
  { kg: 18, cold: 70, warm: 80, hot: 90 },
  { kg: 28, cold: 100, warm: 120, hot: 140 }
];

const EXTRA_WASH_PER_10 = 10;

const DRY_MACHINES = [
  { kg: 15, price: 50 },
  { kg: 20, price: 60 },
  { kg: 25, price: 70 }
];

const EXTRA_DRY_PER_10 = 10;
const FOLD_PER_KG = 1.5;


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

  best.price += Math.ceil(extraMinute / 10) * EXTRA_WASH_PER_10;
  return best;
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
function calculateTotalPrice(input) {
  const {
    weight,
    distance,
    timeSlot,
    temp,
    washMinute,
    dryMinute,
    folding,
    useDry
  } = input;

  // 🚚 DELIVERY
  const delivery = calculateDelivery(weight, distance, timeSlot);
  if (delivery === null) return null;

  // 🧺 WASH
  const wash = calculateBestWash(weight, temp, washMinute);

  // 🔥 DRY
  let dry = null;
  if (useDry) {
    dry = calculateBestDry(weight, dryMinute);
  }

  // 📦 FOLD
  const foldPrice = folding ? weight * FOLD_PER_KG : 0;

  const total =
    delivery +
    wash.price +
    (dry ? dry.price : 0) +
    foldPrice;

  return {
    delivery,
    wash,
    dry,
    foldPrice,
    total
  };
}

const washExtraMinute = Number(washMinute.value || 0);
const washExtraPrice = (washExtraMinute / 10) * pricing.washExtraMinutePrice;






