import type { View } from "../types";
import { HardDrive, FolderOpen, Settings, Cloud, FlaskConical, Moon, Sun, LogOut, LayoutDashboard, Activity } from "lucide-react";
import { Button } from "@nextui-org/react";
import { useTheme } from "../theme/useTheme";
import { useAuth } from "../auth/AuthContext";

export function Sidebar({ active, onSelect }: { active: View; onSelect: (v: View) => void }) {
  const { mode, toggleMode } = useTheme();
  const { logout, user } = useAuth();
  const nav = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={18} /> },
    { id: "files", label: "All Files", icon: <FolderOpen size={18} /> },
    { id: "activity", label: "Activity", icon: <Activity size={18} /> },
    { id: "quota", label: "Quota Tracker", icon: <HardDrive size={18} /> },
    { id: "simulator", label: "Storage Simulator", icon: <FlaskConical size={18} /> },
    { id: "settings", label: "Settings", icon: <Settings size={18} /> },
  ] as const;

  return (
    <aside className="w-64 bg-content1 border-r border-divider flex flex-col">
      <div className="h-20 flex items-center px-5 border-b border-divider gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white">
          <Cloud fill="currentColor" size={21} />
        </div>
        <div>
          <span className="font-bold text-lg tracking-tight text-foreground block">CloudFusion</span>
          <span className="text-[10px] uppercase tracking-[0.16em] text-default-400">storage workspace</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 flex flex-col gap-2">
        {nav.map((item) => {
          const isActive = active === item.id;
          return (
            <Button
              key={item.id}
              variant={isActive ? "flat" : "light"}
              color={isActive ? "primary" : "default"}
              className={`justify-start px-4 h-11 font-medium ${isActive ? "bg-primary/10 text-primary" : "text-default-500 hover:text-foreground"}`}
              startContent={<span className={isActive ? "text-primary" : "text-default-400"}>{item.icon}</span>}
              onPress={() => onSelect(item.id)}
            >
              {item.label}
            </Button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-divider">
        <Button
          variant="flat"
          size="sm"
          className="w-full justify-start mb-3 text-default-500"
          startContent={mode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          onPress={toggleMode}
        >
          {mode === "dark" ? "Light appearance" : "Dark appearance"}
        </Button>
        <Button
          variant="light"
          size="sm"
          className="w-full justify-start text-danger"
          startContent={<LogOut size={16} />}
          onPress={() => void logout()}
        >
          Sign out
        </Button>
        <div className="flex items-center gap-3 px-2 py-2">
          {user?.avatarDataUrl ? (
            <img src={user.avatarDataUrl} alt="" className="h-8 w-8 rounded-full object-cover shadow-md" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-secondary text-xs font-bold text-white shadow-md">
              {(user?.displayName || user?.email || "U").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col">
            <span className="max-w-[140px] truncate text-sm font-semibold text-foreground">{user?.displayName || "Personal space"}</span>
            <span className="text-xs text-default-400">Free and open</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
