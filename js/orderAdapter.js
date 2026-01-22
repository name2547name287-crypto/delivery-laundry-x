function adaptOrderForLegacy(order) {
  return {
    ...order,

    // 🔑 สิ่งที่ระบบเก่าต้องใช้
    price: order.total || order.price || 0,

    lat: order.lat || order.location?.lat,
    lng: order.lng || order.location?.lng,

    // กันพัง
    status: order.status || "wait",
    paymentMethod: order.paymentMethod || "cash",
    paymentStatus: order.paymentStatus || "pay_on_delivery"
  };
}
