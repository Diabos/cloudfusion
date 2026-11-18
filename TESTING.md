# Testing

Run backend tests with:

```powershell
cd backend
npm test
npm run build
```

The placement tests cover first-fit, round-robin, adaptive capacity rejection and deterministic simulation. Existing cryptography tests continue to run in the same command. The simulator endpoint validates non-negative capacities and file sizes and rejects an all-zero weight configuration.

The frontend build is checked with:

```powershell
cd frontend
npm run build
```

## Academic evaluation

Use the simulator's same account fixture and file-size workload for all three algorithms. Record final utilization per account, utilization range (imbalance), successful and failed placements, and decision time separately for each run. Do not mix simulated results with Google API upload reliability.
