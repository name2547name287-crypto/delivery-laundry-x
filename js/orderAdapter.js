function adaptOrderForLegacy(raw) {
  return {
    id: raw.id,

    // user
    username: raw.username,
    phone: raw.phone,
    note: raw.note,

    // booking
    bookingDate: raw.bookingDate,
    timeSlot: raw.timeSlot,
    createdAt: raw.createdAt,

    // location
    lat: raw.lat,
    lng: raw.lng,

    // payment
    paymentMethod: raw.paymentMethod,
    paymentStatus: raw.paymentStatus,

    // status
    status: raw.status || "wait",

    // laundry
    wash: raw.wash || null,
    dry: raw.dry || null,

    weight: raw.weight || 0,
    foldPrice: raw.foldPrice || 0,
    delivery: raw.delivery || 0,

    total: raw.total || raw.price || 0,
    price: raw.price || raw.total || 0
  };
}

// js/orderAdapter.js
// แปลง order ใหม่ → ให้ legacy ใช้งานได้

function adaptOrderForLegacy(raw) {
  const order = { ...raw };

  // ===== TOTAL PRICE =====
  if (!order.price) {
    order.price = order.total || 0;
  }

  // ===== WASH =====
  if (!order.wash) {
    order.wash = {
      machines: [],
      extraMinute: 0,
      price: 0
    };
  }

  // ===== DRY =====
  if (!order.dry) {
    order.dry = null;
  }

  // ===== DELIVERY =====
  if (!order.delivery) {
    order.delivery = 0;
  }

  // ===== FOLD =====
  if (!order.foldPrice) {
    order.foldPrice = 0;
  }

  // ===== WEIGHT (fallback) =====
  if (!order.weight && order.wash?.machines?.length) {
    order.weight = order.wash.machines.reduce((a, b) => a + b, 0);
  }

  // ===== STATUS DEFAULT =====
  order.status = order.status || "wait";

  return order;
}
