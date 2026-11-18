export type AllocationAlgorithm = "first-fit" | "round-robin" | "adaptive";

export interface PlacementAccount {
  id: string;
  capacityBytes: number;
  usedBytes: number;
  successRate?: number;
  availability?: number;
}

export interface PlacementWeights {
  capacity: number;
  balance: number;
  reliability: number;
  availability: number;
}

export interface PlacementCandidate {
  accountId: string;
  eligible: boolean;
  score: number;
  factors: {
    capacity: number;
    balance: number;
    reliability: number;
    availability: number;
  };
}

export interface PlacementDecision {
  algorithm: AllocationAlgorithm;
  accountId: string | null;
  candidates: PlacementCandidate[];
  reason: string;
}

export const DEFAULT_PLACEMENT_WEIGHTS: PlacementWeights = {
  capacity: 0.3,
  balance: 0.3,
  reliability: 0.25,
  availability: 0.15,
};

const clamp = (value: number) => Math.max(0, Math.min(1, value));

function eligibleAccounts(accounts: PlacementAccount[], fileSizeBytes: number) {
  return accounts.filter((account) => fileSizeBytes >= 0 && account.capacityBytes - account.usedBytes >= fileSizeBytes);
}

function adaptiveCandidates(
  accounts: PlacementAccount[],
  fileSizeBytes: number,
  weights: PlacementWeights
): PlacementCandidate[] {
  const eligible = eligibleAccounts(accounts, fileSizeBytes);
  const maxFree = Math.max(...accounts.map((account) => Math.max(0, account.capacityBytes - account.usedBytes)), 0);
  const totalCapacity = accounts.reduce((sum, account) => sum + Math.max(account.capacityBytes, 0), 0);
  const targetUsed = totalCapacity > 0 ? totalCapacity / Math.max(accounts.length, 1) : 0;

  return accounts.map((account) => {
    const free = Math.max(0, account.capacityBytes - account.usedBytes);
    const isEligible = eligible.includes(account);
    const projectedUsed = account.usedBytes + fileSizeBytes;
    const capacity = maxFree > 0 ? clamp(free / maxFree) : 0;
    const balance = targetUsed > 0 ? clamp(1 - Math.abs(projectedUsed - targetUsed) / targetUsed) : 0;
    const reliability = clamp(account.successRate ?? 0.5);
    const availability = clamp(account.availability ?? 0.5);
    const score = isEligible
      ? weights.capacity * capacity +
        weights.balance * balance +
        weights.reliability * reliability +
        weights.availability * availability
      : 0;

    return {
      accountId: account.id,
      eligible: isEligible,
      score,
      factors: { capacity, balance, reliability, availability },
    };
  });
}

export function choosePlacement(
  accounts: PlacementAccount[],
  fileSizeBytes: number,
  algorithm: AllocationAlgorithm = "adaptive",
  roundRobinIndex = 0,
  weights = DEFAULT_PLACEMENT_WEIGHTS
): PlacementDecision {
  const candidates = adaptiveCandidates(accounts, fileSizeBytes, weights);
  const eligible = eligibleAccounts(accounts, fileSizeBytes);

  if (eligible.length === 0) {
    return { algorithm, accountId: null, candidates, reason: "No connected account has enough available storage." };
  }

  let selected: PlacementAccount;
  if (algorithm === "first-fit") {
    selected = eligible[0];
  } else if (algorithm === "round-robin") {
    selected = eligible[roundRobinIndex % eligible.length];
  } else {
    const scored = candidates
      .filter((candidate) => candidate.eligible)
      .sort((a, b) => b.score - a.score || a.accountId.localeCompare(b.accountId));
    selected = eligible.find((account) => account.id === scored[0].accountId)!;
  }

  return {
    algorithm,
    accountId: selected.id,
    candidates,
    reason: `Selected ${selected.id} using ${algorithm}.`,
  };
}

export interface SimulationResult {
  algorithm: AllocationAlgorithm;
  accounts: PlacementAccount[];
  successfulPlacements: number;
  failedPlacements: number;
  decisions: PlacementDecision[];
  imbalance: number;
}

export function simulate(
  initialAccounts: PlacementAccount[],
  fileSizes: number[],
  algorithm: AllocationAlgorithm,
  weights = DEFAULT_PLACEMENT_WEIGHTS
): SimulationResult {
  const accounts = initialAccounts.map((account) => ({ ...account }));
  const decisions: PlacementDecision[] = [];
  let successfulPlacements = 0;

  fileSizes.forEach((fileSizeBytes, index) => {
    const decision = choosePlacement(accounts, fileSizeBytes, algorithm, index, weights);
    decisions.push(decision);
    if (!decision.accountId) return;
    const account = accounts.find((candidate) => candidate.id === decision.accountId)!;
    account.usedBytes += fileSizeBytes;
    successfulPlacements += 1;
  });

  const utilization = accounts.map((account) => (account.capacityBytes > 0 ? account.usedBytes / account.capacityBytes : 0));
  const imbalance = utilization.length > 0 ? Math.max(...utilization) - Math.min(...utilization) : 0;
  return { algorithm, accounts, successfulPlacements, failedPlacements: fileSizes.length - successfulPlacements, decisions, imbalance };
}
