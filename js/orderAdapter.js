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
