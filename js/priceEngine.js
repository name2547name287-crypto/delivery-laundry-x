// ================= MACHINE CONFIG =================
const WASH_MACHINES = [
  { kg: 10, cold: 40, warm: 50, hot: 60 },
  { kg: 14, cold: 60, warm: 70, hot: 80 },
  { kg: 18, cold: 70, warm: 80, hot: 90 },
  { kg: 28, cold: 100, warm: 120, hot: 140 }
];

const DRY_MACHINES = [
  { kg: 15, price: 50 },
  { kg: 20, price: 60 },
  { kg: 25, price: 70 }
];

const EXTRA_DRY_PRICE_PER_10_MIN = 10;


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
function calculateBestWash(weight, temp) {
  let best = { price: Infinity, machines: [] };

  function dfs(kg, price, machines) {
    if (kg >= weight) {
      if (price < best.price) {
        best = { price, machines };
      }
      return;
    }

    for (const m of WASH_MACHINES) {
      dfs(kg + m.kg, price + m[temp], [...machines, m.kg]);
    }
  }

  dfs(0, 0, []);
  return best.price === Infinity ? null : best;
}

// ================= BEST DRY =================
function calculateBestDry(weight, extraMinute) {
  let best = { price: Infinity, machines: [] };

  function dfs(kg, price, machines) {
    if (kg >= weight) {
      if (price < best.price) {
        best = { price, machines };
      }
      return;
    }

    for (const m of DRY_MACHINES) {
      dfs(kg + m.kg, price + m.price, [...machines, m.kg]);
    }
  }

  dfs(0, 0, []);

  if (best.price === Infinity) return null;

  best.price += Math.ceil(extraMinute / 10) * EXTRA_DRY_PER_10;
  return best;
}

// ================= TOTAL =================
function calculateTotalPrice({
  weight,
  distance,
  timeSlot,
  temp,
  useDry,
  extraDryMinute,
  folding
}) {

  // 🚚 ค่าส่ง (เหมือนเดิม)
  let delivery = weight * (APP_CONFIG.pricePerKg || 2);

  if (NIGHT_SLOTS.includes(timeSlot)) {
    delivery += APP_CONFIG.nightFee || 10;
  }

  if (distance <= 500) delivery += 20;
  else if (distance <= 750) delivery += 30;
  else return null;

  // 🧺 ซัก
  const wash = calculateBestWash(weight, temp);
  if (!wash) return null;

  // 🔥 อบ
  let dry = null;
  if (useDry) {
    dry = calculateDryPrice(weight, extraDryMinute);
    if (!dry) return null;
  }

  // 📦 พับ
  let foldPrice = folding ? weight * 1.5 : 0;

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


function calculateBestDry(weight) {
  let bestPrice = Infinity;
  let bestMachines = [];

  function dfs(currentKg, currentPrice, used) {
    if (currentKg >= weight) {
      if (currentPrice < bestPrice) {
        bestPrice = currentPrice;
        bestMachines = [...used];
      }
      return;
    }

    for (const m of DRY_MACHINES) {
      dfs(
        currentKg + m.kg,
        currentPrice + m.price,
        [...used, m.kg]
      );
    }
  }

  dfs(0, 0, []);

  if (bestPrice === Infinity) return null;

  return {
    price: bestPrice,
    machines: bestMachines
  };
}

function calculateDryPrice(weight, extraMinute) {
  const base = calculateBestDry(weight);
  if (!base) return null;

  const extraCost =
    Math.ceil(extraMinute / 10) * EXTRA_DRY_PRICE_PER_10_MIN;

  return {
    price: base.price + extraCost,
    machines: base.machines,
    extraMinute
  };
}
