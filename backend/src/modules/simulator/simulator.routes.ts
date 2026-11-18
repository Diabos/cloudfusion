import { Router } from "express";
import { z } from "zod";
import { AllocationAlgorithm, DEFAULT_PLACEMENT_WEIGHTS, simulate } from "../../strategies/placementEngine";

const requestSchema = z.object({
  accounts: z.array(z.object({
    id: z.string().min(1),
    capacityBytes: z.number().nonnegative(),
    usedBytes: z.number().nonnegative(),
    successRate: z.number().min(0).max(1).optional(),
    availability: z.number().min(0).max(1).optional(),
  })).min(1),
  fileSizes: z.array(z.number().nonnegative()).min(1),
  algorithms: z.array(z.enum(["first-fit", "round-robin", "adaptive"])).min(1).default(["first-fit", "round-robin", "adaptive"]),
  weights: z.object({
    capacity: z.number().nonnegative(),
    balance: z.number().nonnegative(),
    reliability: z.number().nonnegative(),
    availability: z.number().nonnegative(),
  }).optional(),
});

export const simulatorRouter = Router();

simulatorRouter.post("/", (req, res) => {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid simulation input", details: parsed.error.flatten() });
    return;
  }

  const weights = parsed.data.weights ?? DEFAULT_PLACEMENT_WEIGHTS;
  const totalWeight = Object.values(weights).reduce((sum, value) => sum + value, 0);
  if (totalWeight <= 0) {
    res.status(400).json({ error: "At least one placement weight must be greater than zero" });
    return;
  }

  const results = parsed.data.algorithms.map((algorithm: AllocationAlgorithm) =>
    simulate(parsed.data.accounts, parsed.data.fileSizes, algorithm, weights)
  );
  res.json({ mode: "demo", deterministic: true, results });
});
