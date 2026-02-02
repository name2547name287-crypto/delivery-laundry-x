
// src/services/machineService.js
// js/machineService.js
export async function getWashers() {
  const snap = await db.collection("machines")
    .where("type", "==", "washer")
    .where("enabled", "==", true)
    .get();

  return snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
}

export async function getDryers() {
  const snap = await db.collection("machines")
    .where("type", "==", "dryer")
    .where("enabled", "==", true)
    .get();

  return snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
}

