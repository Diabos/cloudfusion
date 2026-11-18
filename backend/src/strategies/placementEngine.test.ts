import assert from "node:assert/strict";
import { choosePlacement, simulate } from "./placementEngine";

const accounts = [
  { id: "a", capacityBytes: 100, usedBytes: 20 },
  { id: "b", capacityBytes: 100, usedBytes: 70 },
];

assert.equal(choosePlacement(accounts, 10, "first-fit").accountId, "a");
assert.equal(choosePlacement(accounts, 10, "round-robin", 1).accountId, "b");
assert.equal(choosePlacement(accounts, 90, "adaptive").accountId, null);
assert.equal(simulate(accounts, [10, 10], "round-robin").successfulPlacements, 2);
assert.equal(simulate(accounts, [1000], "adaptive").failedPlacements, 1);
console.log("placement engine tests passed");
