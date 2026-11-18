import { useCallback, useEffect, useState } from "react";
import type { View } from "../types";
import { Sidebar } from "../components/Sidebar";
import { QuotaView } from "../components/QuotaView";
import { FilesView } from "../components/FilesView";
import { SettingsView } from "../components/SettingsView";
import { UploadPanel } from "../components/UploadPanel";
import type { UploadState } from "../components/UploadPanel";
import { ContextMenu } from "../components/ContextMenu";
import type { MenuState } from "../components/ContextMenu";
import { storageApi } from "../api/resources";
import type { StorageSummary } from "../api/types";
import { formatGB } from "../utils/format";
import { Divider } from "@nextui-org/react";
import { SimulatorView } from "../components/SimulatorView";
import { useTheme } from "../theme/useTheme";
import { OverviewView } from "../components/OverviewView";
import { ActivityView } from "../components/ActivityView";

export type { View };

export function Dashboard() {
  const { mode } = useTheme();
  const [activeView, setActiveView] = useState<View>(
    new URLSearchParams(window.location.search).has("connected") ? "settings" : "overview"
  );
  const [summary, setSummary] = useState<StorageSummary | null>(null);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [upload, setUpload] = useState<UploadState | null>(null);
  const [filesRefreshKey, setFilesRefreshKey] = useState(0);

  const refreshSummary = useCallback(() => {
    storageApi.summary().then(setSummary).catch(() => {});
  }, []);

  useEffect(() => {
    refreshSummary();
  }, [refreshSummary]);

  useEffect(() => {
    const close = () => setMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const onUploadDone = () => {
    setFilesRefreshKey((k) => k + 1);
    refreshSummary();
    // Auto clear the upload panel exactly 3 seconds after success OR failure
    setTimeout(() => {
      setUpload(null);
    }, 3000);
  };

  const poolSummary = summary
    ? `${formatGB(summary.usedBytes)} used · ${formatGB(summary.freeBytes)} free`
    : "Storage unavailable";

  return (
    <div className="flex h-screen w-full bg-[#080c14] text-foreground overflow-hidden font-sans">
      <Sidebar active={activeView} onSelect={setActiveView} />
      
      <Divider orientation="vertical" />
      
      <main className={`flex-1 flex flex-col relative overflow-hidden ${mode === "dark" ? "bg-[#0b1120]" : "bg-[#f7f9fb]"}`}>
        <header className={`h-20 min-h-[80px] border-b border-divider flex items-center px-6 md:px-10 justify-between sticky top-0 z-10 ${mode === "dark" ? "bg-[#101a2d]" : "bg-white"}`}>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary">CloudFusion workspace</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground capitalize">{activeView.replace("-", " ")}</h1>
          </div>
          
          <div className="flex items-center gap-4 relative">
            <div className="font-mono text-xs text-default-500 font-medium tracking-wide bg-content2 px-4 py-2 rounded-lg border border-divider">
              {poolSummary}
            </div>
            
            {/* The Upload panel sits exactly right here below the header using absolute positioning */}
            {upload && (
              <div className="absolute top-[110%] right-0 z-50 shadow-2xl rounded-xl overflow-hidden border border-divider bg-content1">
                 <UploadPanel upload={upload} />
              </div>
            )}
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-6 md:p-10 relative">
          <div className="max-w-7xl mx-auto h-full">
            {activeView === "quota" && <QuotaView summary={summary} />}
            {activeView === "overview" && <OverviewView summary={summary} onNavigate={setActiveView} refreshKey={filesRefreshKey} />}
            {activeView === "files" && (
              <FilesView
                refreshKey={filesRefreshKey}
                onContextMenu={setMenu}
                onUploadStart={setUpload}
                onUploadProgress={setUpload}
                onUploadDone={onUploadDone}
              />
            )}
            {activeView === "activity" && <ActivityView />}
            {activeView === "settings" && <SettingsView summary={summary} onChange={refreshSummary} />}
            {activeView === "simulator" && <SimulatorView />}
          </div>
        </div>
      </main>

      {menu && <ContextMenu menu={menu} onClose={() => setMenu(null)} onChanged={() => setFilesRefreshKey(k => k + 1)} />}
    </div>
  );
}
