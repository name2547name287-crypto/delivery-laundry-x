import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export async function getWashers() {
  const snap = await getDocs(collection(db, "machines"));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(m => m.type === "washer");
}
