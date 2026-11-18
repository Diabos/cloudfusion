# Placement algorithms

CloudFusion supports three choices for each upload:

* **First-fit** selects the first account with enough free bytes.
* **Round-robin** selects the next eligible account in stable account order. The request index is used as the deterministic rotation state in simulation; production persistence of that cursor is future work.
* **Adaptive** rejects accounts that cannot fit the file, then scores every eligible account:

`0.30 * CapacityScore + 0.30 * BalanceScore + 0.25 * ReliabilityScore + 0.15 * AvailabilityScore`

All factors are clamped to `[0, 1]`. Capacity is free bytes divided by the largest free capacity in the candidate set. Balance is one minus the normalized distance between projected and equal-share target usage. Reliability and availability use recorded values when supplied, otherwise the neutral value `0.5`. Ties are resolved by account ID, making decisions reproducible.

The simulator uses the same workload and account state for each algorithm and reports successful placements, failures, final usage and utilization imbalance.
