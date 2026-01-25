function adaptOrderForLegacy(raw) {
  return {
    id: raw.id,
    status: raw.status || "wait",
    createdAt: raw.createdAt,

    // === ใหม่ ===
    wash: raw.wash || null,
    dry: raw.dry || null,
    foldPrice: raw.foldPrice || 0,
    delivery: raw.delivery || 0,
    total: raw.total || raw.price || 0,

    // === fallback ของเก่า ===
    price: raw.price || raw.total || 0,
  };
}
