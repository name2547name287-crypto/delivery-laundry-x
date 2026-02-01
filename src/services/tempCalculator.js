export function calcTemperaturePrice(tempKey, pricing, machineCount) {
  const temp = pricing.wash.temperatures[tempKey];
  if (!temp || !temp.enabled) return 0;
  return temp.price * machineCount;
}
