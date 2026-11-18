import { useEffect, useRef, useState } from "react";
import type { StorageSummary } from "../api/types";
import { connectedAccountsApi } from "../api/resources";
import { formatGB } from "../utils/format";
import { GoogleIcon } from "./GoogleIcon";
import { Button, Card, CardBody, Badge } from "@nextui-org/react";
import { useToast } from "./ToastProvider";
import { Camera, RefreshCw, Trash2, Link, UserRound } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export function SettingsView({ summary, onChange }: { summary: StorageSummary | null; onChange: () => void }) {
  const [connecting, setConnecting] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const { addToast } = useToast();
  const { user, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [avatarDataUrl, setAvatarDataUrl] = useState(user?.avatarDataUrl ?? null);
  const [savingProfile, setSavingProfile] = useState(false);
  const avatarInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayName(user?.displayName ?? "");
    setAvatarDataUrl(user?.avatarDataUrl ?? null);
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("connected")) {
      const ok = params.get("connected") === "1";
      if (ok) {
        addToast("Google Account successfully connected!", "success");
      } else {
        addToast(`Connect failed: ${params.get("error") ?? "unknown error"}`, "error");
      }
      window.history.replaceState({}, "", window.location.pathname);
      onChange();
    }
  }, [onChange, addToast]);

  const connectDrive = async () => {
    setConnecting(true);
    try {
      const { url } = await connectedAccountsApi.getConnectUrl();
      window.location.href = url;
    } catch {
      setConnecting(false);
      addToast("Failed to generate connect URL", "error");
    }
  };

  const disconnect = async (id: string) => {
    if (!window.confirm("Disconnect this account? Files stored there will become inaccessible.")) return;
    try {
      await connectedAccountsApi.delete(id);
      addToast("Account disconnected successfully", "success");
      onChange();
    } catch (err) {
      addToast(`Disconnect failed: ${(err as Error).message}`, "error");
    }
  };

  const sync = async (id: string) => {
    setSyncingId(id);
    try {
      await connectedAccountsApi.syncQuota(id);
      addToast("Quota and files synced successfully!", "success");
      onChange();
    } catch (err) {
      addToast(`Sync failed: ${(err as Error).message}`, "error");
    } finally {
      setSyncingId(null);
    }
  };

  const accounts = summary?.accounts ?? [];
  const initials = (displayName || user?.email || "U").slice(0, 1).toUpperCase();

  const selectAvatar = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      addToast("Choose an image file for your profile picture", "error");
      return;
    }
    if (file.size > 1_500_000) {
      addToast("Profile pictures must be smaller than 1.5 MB", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatarDataUrl(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => addToast("Unable to read that image", "error");
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await updateProfile({ displayName: displayName.trim() || null, avatarDataUrl });
      addToast("Profile updated successfully", "success");
    } catch (err) {
      addToast(`Profile update failed: ${(err as Error).message}`, "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const resetAvatar = () => {
    setAvatarDataUrl(null);
    if (avatarInput.current) avatarInput.current.value = "";
  };

  return (
    <div className="max-w-3xl space-y-6">
      <Card className="border border-divider shadow-sm" shadow="none">
        <CardBody className="gap-5 p-5 sm:p-6">
          <div>
            <h2 className="text-xl font-semibold">Your profile</h2>
            <p className="mt-1 text-sm text-default-500">Personalize how you appear in CloudFusion.</p>
          </div>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
              {avatarDataUrl ? (
                <img src={avatarDataUrl} alt="Profile preview" className="h-20 w-20 rounded-2xl object-cover ring-4 ring-primary/10" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-2xl font-bold text-white ring-4 ring-primary/10">
                  {initials}
                </div>
              )}
              <button type="button" aria-label="Choose profile picture" onClick={() => avatarInput.current?.click()} className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-content1 bg-primary text-white shadow-md transition hover:scale-105">
                <Camera size={16} />
              </button>
              <input ref={avatarInput} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => selectAvatar(event.target.files?.[0])} />
            </div>
            <div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Display name
                <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={80} placeholder="Your name" className="mt-2 h-10 w-full rounded-lg border border-divider bg-content2 px-3 text-sm text-foreground outline-none transition focus:border-primary" />
              </label>
              <div className="text-sm font-medium">
                Google account
                <div className="mt-2 flex h-10 items-center gap-2 rounded-lg border border-divider bg-content2 px-3 text-sm text-default-500">
                  <UserRound size={15} />
                  <span className="truncate">{user?.email ?? "—"}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs text-default-500">
              <span>PNG, JPG, or WebP · max 1.5 MB</span>
              {avatarDataUrl && <button type="button" onClick={resetAvatar} className="font-medium text-danger hover:underline">Remove picture</button>}
            </div>
            <Button color="primary" isLoading={savingProfile} onPress={() => void saveProfile()}>Save profile</Button>
          </div>
        </CardBody>
      </Card>

      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-semibold mb-1">Connected Accounts</h2>
          <p className="text-sm text-default-500 font-mono">
            Connected accounts feed a single merged storage pool
          </p>
        </div>
        <Button 
          color="primary" 
          startContent={<GoogleIcon />} 
          isLoading={connecting}
          onPress={connectDrive}
          className="font-medium"
        >
          Connect Google Account
        </Button>
      </div>

      <div className="grid gap-4 mt-6">
        {accounts.length === 0 ? (
          <Card className="bg-content2/50 border border-divider shadow-none">
            <CardBody className="py-12 flex flex-col items-center justify-center text-center gap-3">
              <Link size={48} className="text-default-300" />
              <p className="text-default-500">No accounts connected yet.<br/>Connect your first Google Drive to start merging storage.</p>
            </CardBody>
          </Card>
        ) : (
          accounts.map((a) => (
            <Card key={a.id} className="border border-divider shadow-sm" shadow="none">
              <CardBody className="p-4 flex flex-row items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <GoogleIcon />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{a.googleAccountEmail}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge color={Number(a.usedBytes) > Number(a.totalBytes) * 0.9 ? "danger" : "success"} variant="flat" size="sm">
                      {formatGB(a.usedBytes)} / {formatGB(a.totalBytes)} used · {formatGB(Math.max(0, Number(a.totalBytes) - Number(a.usedBytes)))} free
                    </Badge>
                    {a.lastSyncedAt && (
                      <span className="text-xs text-default-400 font-mono">
                        Synced: {new Date(a.lastSyncedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button 
                    size="sm" 
                    variant="flat" 
                    isLoading={syncingId === a.id}
                    startContent={syncingId !== a.id && <RefreshCw size={14} />}
                    onPress={() => sync(a.id)}
                  >
                    Sync
                  </Button>
                  <Button 
                    size="sm" 
                    color="danger" 
                    variant="light" 
                    isIconOnly
                    onPress={() => disconnect(a.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
