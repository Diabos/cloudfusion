import { useState } from "react";
import { Button, Card, CardBody, Input } from "@nextui-org/react";
import { api } from "../api/client";

type Algorithm = "first-fit" | "round-robin" | "adaptive";
type Result = { algorithm: Algorithm; successfulPlacements: number; failedPlacements: number; imbalance: number; accounts: { id: string; usedBytes: number; capacityBytes: number }[] };

export function SimulatorView() {
  const [fileSizes, setFileSizes] = useState("20, 35, 40, 15, 25");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  async function runSimulation() {
    setLoading(true);
    try {
      const data = await api<{ results: Result[] }>("/simulator", {
        method: "POST",
        body: JSON.stringify({
          accounts: [
            { id: "account-a", capacityBytes: 100, usedBytes: 20, successRate: 0.98, availability: 0.99 },
            { id: "account-b", capacityBytes: 100, usedBytes: 55, successRate: 0.94, availability: 0.97 },
            { id: "account-c", capacityBytes: 100, usedBytes: 10, successRate: 0.9, availability: 0.95 },
          ],
          fileSizes: fileSizes.split(",").map((value) => Number(value.trim())).filter((value) => Number.isFinite(value) && value >= 0),
        }),
      });
      setResults(data.results);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-primary">Demo mode · no cloud changes</p>
        <h2 className="mt-2 text-3xl font-semibold">What-if storage simulator</h2>
        <p className="mt-2 text-default-500">Run the same deterministic workload against each placement algorithm.</p>
      </div>
      <Card><CardBody className="gap-4">
        <Input label="File sizes (capacity units)" value={fileSizes} onValueChange={setFileSizes} />
        <Button color="primary" isLoading={loading} onPress={runSimulation}>Compare algorithms</Button>
      </CardBody></Card>
      {results.length > 0 && <div className="grid gap-4 md:grid-cols-3">
        {results.map((result) => <Card key={result.algorithm}><CardBody className="gap-3">
          <div className="flex items-center justify-between"><h3 className="font-semibold capitalize">{result.algorithm.replace("-", " ")}</h3><span className="text-xs text-primary">deterministic</span></div>
          <p className="text-sm text-default-500">{result.successfulPlacements} successful · {result.failedPlacements} failed</p>
          <p className="text-sm">Storage imbalance: <strong>{result.imbalance.toFixed(2)}</strong></p>
          {result.accounts.map((account) => <div key={account.id} className="text-xs text-default-500">{account.id}: {account.usedBytes} / {account.capacityBytes}</div>)}
        </CardBody></Card>)}
      </div>}
    </div>
  );
}
