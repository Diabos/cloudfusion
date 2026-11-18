import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, Database, FileText, HardDrive, UploadCloud, Users } from "lucide-react";
import { Button, Card, CardBody, Chip, Progress } from "@nextui-org/react";
import { filesApi } from "../api/resources";
import type { FileItem, StorageSummary } from "../api/types";
import type { View } from "../types";
import { formatBytes, formatDate, formatGB } from "../utils/format";

export function OverviewView({
  summary,
  onNavigate,
  refreshKey,
}: {
  summary: StorageSummary | null;
  onNavigate: (view: View) => void;
  refreshKey: number;
}) {
  const [files, setFiles] = useState<FileItem[]>([]);

  useEffect(() => {
    filesApi.list().then(setFiles).catch(() => {});
  }, [refreshKey]);

  const total = Number(summary?.totalBytes ?? 0);
  const used = Number(summary?.usedBytes ?? 0);
  const usagePercent = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  const recentFiles = files.slice(0, 5);
  const accountWarnings = (summary?.accounts ?? []).filter((account) => {
    const total = Number(account.totalBytes);
    return total > 0 && Number(account.usedBytes) / total >= 0.9;
  });

  return (
    <div className="max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Storage overview</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Everything in one place</h2>
          <p className="mt-2 text-sm text-default-500">A live view of your connected Google Drive accounts.</p>
        </div>
        <Button color="primary" startContent={<UploadCloud size={16} />} onPress={() => onNavigate("files")}>
          Add files
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={<Database size={18} />} label="Used storage" value={summary ? formatGB(summary.usedBytes) : "—"} detail={`${Math.round(usagePercent)}% of pool`} />
        <MetricCard icon={<HardDrive size={18} />} label="Available" value={summary ? formatGB(summary.freeBytes) : "—"} detail="Across connected drives" />
        <MetricCard icon={<Users size={18} />} label="Accounts" value={summary ? String(summary.accountCount) : "—"} detail="Connected Google accounts" />
        <MetricCard icon={<FileText size={18} />} label="Indexed files" value={String(files.length)} detail="Files in your unified view" />
      </div>

      <Card className="border border-divider shadow-sm" shadow="none">
        <CardBody className="gap-3 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Pool utilization</h3>
              <p className="text-xs text-default-500">Live quota data from your connected accounts</p>
            </div>
            <span className="text-sm font-semibold text-primary">{Math.round(usagePercent)}%</span>
          </div>
          <Progress aria-label="Storage utilization" value={usagePercent} color="primary" size="sm" />
          <div className="flex justify-between text-xs text-default-500">
            <span>{summary ? formatGB(summary.usedBytes) : "—"} used</span>
            <span>{summary ? formatGB(summary.totalBytes) : "—"} total</span>
          </div>
        </CardBody>
      </Card>

      {accountWarnings.length > 0 && (
        <Card className="border border-warning/40 bg-warning/5 shadow-sm" shadow="none">
          <CardBody className="flex-row items-start gap-3 p-5">
            <AlertTriangle className="mt-0.5 shrink-0 text-warning" size={18} />
            <div>
              <h3 className="font-semibold">Storage attention needed</h3>
              <p className="mt-1 text-sm text-default-500">
                {accountWarnings.length} connected {accountWarnings.length === 1 ? "account is" : "accounts are"} above 90% usage. CloudFusion will try another account when possible.
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      <Card className="border border-divider shadow-sm" shadow="none">
        <CardBody className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Recent files</h3>
              <p className="text-xs text-default-500">Latest items in your unified file index</p>
            </div>
            <Button size="sm" variant="light" endContent={<ArrowRight size={14} />} onPress={() => onNavigate("files")}>View all</Button>
          </div>
          {recentFiles.length === 0 ? (
            <p className="py-8 text-center text-sm text-default-500">No files indexed yet.</p>
          ) : (
            <div className="divide-y divide-divider">
              {recentFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-default-500">{formatDate(file.createdAt)}</p>
                  </div>
                  <Chip size="sm" variant="flat">{formatBytes(file.sizeBytes)}</Chip>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function MetricCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return (
    <Card className="border border-divider shadow-sm" shadow="none">
      <CardBody className="gap-3 p-5">
        <div className="flex items-center gap-2 text-primary">{icon}<span className="text-xs font-medium text-default-500">{label}</span></div>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        <p className="text-xs text-default-500">{detail}</p>
      </CardBody>
    </Card>
  );
}
