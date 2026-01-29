// js/orderAdapter.js
function adaptOrderForLegacy(raw) {
  const order = { ...raw };

  // ===== USER =====
  order.id = raw.id;
  order.username = raw.username || "-";
  order.phone = raw.phone || "-";
  order.note = raw.note || "-";

  // ===== BOOKING =====
  order.bookingDate = raw.bookingDate || "-";
  order.timeSlot = raw.timeSlot || "-";
  order.createdAt = raw.createdAt || null;

  // ===== LOCATION =====
  order.lat = raw.lat;
  order.lng = raw.lng;

  // ===== PAYMENT =====
  order.paymentMethod = raw.paymentMethod || "-";
  order.paymentStatus = raw.paymentStatus || "-";

  // ===== STATUS =====
  order.status = raw.status || "wait";

  // ===== WASH =====
  order.wash = raw.wash || {
    machines: [],
    extraMinute: 0,
    price: 0
  };

  // ===== DRY =====
  order.dry = raw.dry || null;

  // ===== PRICE =====
  order.foldPrice = raw.foldPrice || 0;
  order.delivery = raw.delivery || 0;
  order.total = raw.total || raw.price || 0;
  order.price = raw.price || raw.total || 0;

  // ===== WEIGHT (fallback) =====
  order.weight =
    raw.weight ||
    (order.wash.machines?.reduce((a, b) => a + b, 0) || 0);

  return order;
}
