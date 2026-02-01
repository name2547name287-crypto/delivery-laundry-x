export function chooseWashersByWeight(totalKg, machines) {
  machines = machines
    .filter(m => m.enabled)
    .sort((a, b) => a.sizeKg - b.sizeKg);

  let best = null;

  function dfs(remainKg, used) {
    if (remainKg <= 0) {
      const price = used.reduce((s, m) => s + m.basePrice, 0);
      if (!best || price < best.price) {
        best = {
          machines: [...used],
          price
        };
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
