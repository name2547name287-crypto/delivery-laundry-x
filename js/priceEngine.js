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
function calculateTotalPrice({ weight, temp, washExtraMinute, useDry, dryExtraMinute, folding, distance, timeSlot }) {
  if (!PRICING) return null;

  const washPricePerKg = PRICING.wash.temperatures[temp].price;
  const washPrice = weight * washPricePerKg;

  const washExtra = washExtraMinute * PRICING.wash.extraMinutePrice;

  let dry = null;
  if (useDry) {
    dry = {
      price:
        PRICING.dry.basePrice +
        Math.ceil(dryExtraMinute / 10) * PRICING.dry.per10Minute,
      extraMinute: dryExtraMinute
    };
  }

  const foldPrice = folding ? weight * PRICING.fold.perKg : 0;

  return {
    wash: {
      price: washPrice + washExtra,
      extraMinute: washExtraMinute
    },
    dry,
    foldPrice,
    total: washPrice + washExtra + (dry?.price || 0) + foldPrice
  };
}





const washExtraPrice = (washExtraMinute / 10) * 10; // 10฿ ต่อ 10 นาที

const dryExtraPrice = (dryExtraMinute / 10) * 10;






