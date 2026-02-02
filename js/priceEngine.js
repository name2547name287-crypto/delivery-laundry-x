// ================= MACHINE CONFIG =================
// js/priceEngine.js

async function calculateTotalPrice(input) {
  const {
    weight,
    temp,
    washExtraMinute,
    useDry,
    dryExtraMinute,
    folding,
    distance,
    timeSlot
  } = input;

  // 1️⃣ โหลดเครื่องจาก Firestore
  const washers = await getWashers();

  // 2️⃣ เลือกชุดเครื่องที่ถูกที่สุด
  const washResult = chooseWashersByWeight(weight, washers);
  if (!washResult) return null;

  // 3️⃣ โหลด pricing
  const pricingSnap = await db.collection("pricing").doc("laundry").get();
  if (!pricingSnap.exists) return null;
  const pricing = pricingSnap.data();

  // 4️⃣ ราคาซักพื้นฐาน
  let washPrice = washResult.price;

  // 5️⃣ เพิ่มเวลา (คิดตามจำนวนเครื่อง)
  const washExtraPrice =
    (washExtraMinute / 10) * 10 * washResult.machines.length;

  washPrice += washExtraPrice;

  // 6️⃣ ราคาอุณหภูมิ (🔥 จุดสำคัญ)
  const tempPrice = calcTemperaturePrice(
    temp,
    pricing,
    washResult.machines.length
  );

  washPrice += tempPrice;

  // 7️⃣ อบ
 let dry = null;

if (useDry) {
  // 1️⃣ โหลดเครื่องอบ
  const dryers = await getDryers();

  // 2️⃣ เลือกชุดเครื่องอบที่ถูกที่สุด
  const dryResult = chooseWashersByWeight(weight, dryers);
  if (!dryResult) return null;

  // 3️⃣ ราคาพื้นฐาน
  let dryPrice = dryResult.price;

  // 4️⃣ เพิ่มเวลาอบ (คิดตามจำนวนเครื่องอบจริง)
  const dryExtraPrice =
  (dryExtraMinute / 10)
  * (pricing.dry?.extraPer10Min || 10)
  * dryResult.machines.length;


  dryPrice += dryExtraPrice;

  dry = {
    machines: dryResult.machines.map(m => m.sizeKg),
    machineCount: dryResult.machines.length,
    price: dryPrice,
    extraMinute: dryExtraMinute
  };
}

  // 8️⃣ พับผ้า
const foldPrice = folding
  ? weight * (pricing.fold.perKg || 0)
  : 0;


  // 9️⃣ ค่าส่ง (ดึงจาก config/delivery)
const configSnap = await db.collection("config").doc("delivery").get();
if (!configSnap.exists) return null;

const deliveryCfg = configSnap.data();

let delivery = 0;

// ❌ เกินเขตให้บริการ
if (distance > deliveryCfg.serviceRadius) {
  return null;
}

// ✅ อยู่ในเขต


// ➕ เกิน 500 เมตร
if (distance > 500) {
  delivery += cfg.over500Fee || 10;

  // 🔥 คิดตามน้ำหนัก
  delivery += weight * deliveryCfg.pricePerKg;
}

// 🌙 รอบดึก
if (["21:00", "22:30", "00:00", "02:00"].includes(timeSlot)) {
  delivery += deliveryCfg.nightFee;
}



  // 🔟 รวม
  const total =
    washPrice +
    (dry?.price || 0) +
    foldPrice +
    delivery;

 const safe = n => Number.isFinite(n) ? n : 0;

return {
  wash: {
    machines: washResult.machines.map(m => m.sizeKg),
    machineCount: washResult.machines.length,
    price: safe(washPrice),
    extraMinute: washExtraMinute
  },
  dry: dry ? {
    ...dry,
    price: safe(dry.price)
  } : null,
  foldPrice: safe(foldPrice),
  delivery: safe(delivery),
  total: safe(
    washPrice +
    (dry?.price || 0) +
    foldPrice +
    delivery
  )
};

}


function chooseWashersByWeight(totalKg, machines) {
  machines = machines.sort((a, b) => a.sizeKg - b.sizeKg);
  let best = null;

  function dfs(remainKg, used) {
    if (remainKg <= 0) {
      const price = used.reduce((s, m) => s + m.basePrice, 0);
      if (!best || price < best.price) {
        best = { machines: [...used], price };
      }
      return;
    }
    for (let m of machines) {
      used.push(m);
      dfs(remainKg - m.sizeKg, used);
      used.pop();
    }
  }

  dfs(totalKg, []);
  return best;
}

function calcTemperaturePrice(tempKey, pricing, machineCount) {
  const temp = pricing.wash.temperatures[tempKey];
  if (!temp || !temp.enabled) return 0;
  return temp.price * machineCount;
}










