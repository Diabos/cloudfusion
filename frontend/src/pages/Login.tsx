import { useState } from "react";
import { connectedAccountsApi } from "../api/resources";
import { GoogleIcon } from "../components/GoogleIcon";
import { ArrowRight, Cloud, LoaderCircle, Moon, ShieldCheck, Sun } from "lucide-react";
import { useTheme } from "../theme/useTheme";

export function Login() {
  const { mode, toggleMode } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [googleBusy, setGoogleBusy] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const loginError = params.get("loginError");

  const continueWithGoogle = async () => {
    setGoogleBusy(true);
    try {
      const { url } = await connectedAccountsApi.getLoginUrl();
      window.location.href = url;
    } catch (err) {
      setGoogleBusy(false);
      setError((err as Error).message);
    }
  };

  return (
    <div className={`relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 transition-colors ${mode === "dark" ? "bg-[#080d18] text-white" : "bg-[#f5f8fc] text-slate-950"}`}>
      <div className={`pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full blur-3xl ${mode === "dark" ? "bg-blue-600/10" : "bg-blue-400/20"}`} />
      <div className={`pointer-events-none absolute -bottom-40 -right-24 h-[30rem] w-[30rem] rounded-full blur-3xl ${mode === "dark" ? "bg-indigo-600/10" : "bg-indigo-300/20"}`} />
      <button onClick={toggleMode} aria-label="Toggle color mode" className={`absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-xl border transition sm:right-8 sm:top-8 ${mode === "dark" ? "border-white/10 bg-white/5 text-amber-200 hover:bg-white/10" : "border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"}`}>
        {mode === "dark" ? <Sun size={17} /> : <Moon size={17} />}
      </button>
      <div className={`relative grid w-full max-w-5xl overflow-hidden rounded-3xl border shadow-2xl lg:grid-cols-[1.02fr_0.98fr] ${mode === "dark" ? "border-white/10 bg-[#111a2c] shadow-black/40" : "border-slate-200/80 bg-white shadow-slate-900/10"}`}>
        <div className={`hidden flex-col justify-between p-12 lg:flex ${mode === "dark" ? "bg-gradient-to-br from-[#132443] via-[#101b30] to-[#0d1525]" : "bg-gradient-to-br from-[#152b52] via-[#172b4d] to-[#1d3560]"} text-white`}>
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-950/30">
                <Cloud size={21} fill="currentColor" />
              </div>
              <span className="text-xl font-bold tracking-tight">CloudFusion</span>
            </div>
            <div className="mt-24 max-w-md">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">One calm workspace</p>
              <p className="mt-4 text-4xl font-semibold leading-tight tracking-tight">Your files, without the juggling.</p>
              <p className="mt-5 text-sm leading-6 text-slate-300">Connect your Google Drive accounts, understand your real capacity, and move files through one focused workspace.</p>
            </div>
            <div className="mt-10 grid max-w-md grid-cols-3 gap-3">
              {["Unified view", "Live quota", "Smart uploads"].map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-xs text-slate-200">{item}</div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-emerald-300" />
              Google Drive integration · free to use
            </div>
            <span className="text-slate-400">Made by Ansh Verma</span>
          </div>
        </div>
        <div className={`p-7 sm:p-12 lg:p-14 ${mode === "dark" ? "bg-[#111b2e]" : "bg-white"}`}>
          <div className="mb-14 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white"><Cloud size={21} fill="currentColor" /></div>
            <span className={`text-xl font-bold ${mode === "dark" ? "text-white" : "text-slate-900"}`}>CloudFusion</span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Welcome back</p>
          <h1 className={`mt-4 text-3xl font-semibold tracking-tight ${mode === "dark" ? "text-white" : "text-slate-900"}`}>Open your workspace</h1>
          <p className={`mt-3 max-w-sm text-sm leading-6 ${mode === "dark" ? "text-slate-400" : "text-slate-500"}`}>Sign in with Google to manage your connected storage in one place.</p>

          {loginError && (
            <p role="alert" className={`mt-6 rounded-xl border p-3 text-xs leading-5 ${mode === "dark" ? "border-red-400/20 bg-red-400/10 text-red-200" : "border-red-200 bg-red-50 text-red-700"}`}>{decodeURIComponent(loginError)}</p>
          )}

          {error && <p role="alert" className={`mt-6 rounded-xl border p-3 text-xs leading-5 ${mode === "dark" ? "border-red-400/20 bg-red-400/10 text-red-200" : "border-red-200 bg-red-50 text-red-700"}`}>{error}</p>}
          <button onClick={continueWithGoogle} disabled={googleBusy} className={`group mt-9 flex w-full items-center justify-center gap-3 rounded-xl border px-5 py-3.5 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-wait disabled:opacity-60 ${mode === "dark" ? "border-white/15 bg-white text-slate-900 hover:bg-slate-100" : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"}`}>
            <GoogleIcon size={18} />
            {googleBusy ? <><LoaderCircle size={17} className="animate-spin" /> Opening Google...</> : <>Continue with Google <ArrowRight size={16} className="text-slate-400 transition-transform group-hover:translate-x-0.5" /></>}
          </button>
          <div className={`mt-7 flex items-start gap-2 text-xs leading-5 ${mode === "dark" ? "text-slate-500" : "text-slate-500"}`}>
            <ShieldCheck size={15} className="mt-0.5 shrink-0 text-emerald-500" />
            <p>Your files remain in your connected Google Drive accounts. CloudFusion does not move them without your action.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
