import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { Card, CardBody, Chip } from "@nextui-org/react";
import { formatDate } from "../utils/format";

export interface UploadActivity {
  id: string;
  fileName: string;
  status: "completed" | "failed";
  message?: string;
  createdAt: string;
}

const STORAGE_KEY = "cloudfusion-upload-activity";

export function readUploadActivity(): UploadActivity[] {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

export function writeUploadActivity(activity: UploadActivity[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activity.slice(0, 50)));
}

export function ActivityView() {
  const [activity, setActivity] = useState<UploadActivity[]>([]);

  useEffect(() => {
    setActivity(readUploadActivity());
  }, []);

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Workspace history</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Upload activity</h2>
        <p className="mt-2 text-sm text-default-500">A local record of recent uploads from this browser.</p>
      </div>
      <Card className="border border-divider shadow-sm" shadow="none">
        <CardBody className="p-0">
          {activity.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
              <Clock3 className="text-default-400" />
              <p className="text-sm text-default-500">No upload activity yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-divider">
              {activity.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    {item.status === "completed" ? <CheckCircle2 className="shrink-0 text-success" size={18} /> : <XCircle className="shrink-0 text-danger" size={18} />}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.fileName}</p>
                      <p className="text-xs text-default-500">{formatDate(item.createdAt)}</p>
                    </div>
                  </div>
                  <Chip size="sm" color={item.status === "completed" ? "success" : "danger"} variant="flat">
                    {item.status === "completed" ? "Completed" : "Failed"}
                  </Chip>
                  {item.message && <p className="hidden max-w-xs truncate text-xs text-danger md:block">{item.message}</p>}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
