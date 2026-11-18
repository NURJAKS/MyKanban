import React, { useState, memo } from 'react';
import { useKanban } from '../context/KanbanContext';
import {
  X,
  Cloud,
  RefreshCw,
  Check,
  Copy,
  Eye,
  EyeOff,
  AlertCircle,
  Download,
  Unlink,
} from 'lucide-react';

export const SyncModal: React.FC = memo(() => {
  const {
    isSyncModalOpen,
    setIsSyncModalOpen,
    syncConfig,
    syncStatus,
    syncError,
    connectAndCreateGist,
    connectAndPullGist,
    disconnectSync,
  } = useKanban();

  const [tokenInput, setTokenInput] = useState(syncConfig?.token || '');
  const [gistIdInput, setGistIdInput] = useState(syncConfig?.gistId || '');
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isSyncModalOpen) return null;

  const isConnected = Boolean(syncConfig?.token && syncConfig?.gistId);

  const handleCopyGistId = async () => {
    if (!syncConfig?.gistId) return;
    try {
      await navigator.clipboard.writeText(syncConfig.gistId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!tokenInput.trim()) {
      setLocalError('Please enter your GitHub Token.');
      return;
    }

    try {
      if (!gistIdInput.trim()) {
        const newId = await connectAndCreateGist(tokenInput.trim());
        setGistIdInput(newId);
      } else {
        await connectAndPullGist(tokenInput.trim(), gistIdInput.trim());
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Connection failed.');
    }
  };

  const formatLastSync = (iso?: string) => {
    if (!iso) return 'Never';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
      onClick={() => setIsSyncModalOpen(false)}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#3c4043] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e0e2ec] dark:border-[#2c2d30]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#d3e3fd]/60 dark:bg-[#8ab4f8]/15 text-[#0b57d0] dark:text-[#8ab4f8] flex items-center justify-center">
              <Cloud size={17} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1f1f1f] dark:text-[#e3e3e3]">
                Private GitHub Gist Sync
              </h3>
              <p className="text-[11px] text-[#5f6368] dark:text-[#8e918f]">
                Sync tasks between your laptop & phone
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSyncModalOpen(false)}
            className="p-1.5 rounded-lg text-[#5f6368] dark:text-[#8e918f] hover:text-[#1f1f1f] dark:hover:text-[#e3e3e3] hover:bg-[#f0f4f9] dark:hover:bg-[#282a2c]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {(localError || syncError) && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-[#f9dedc] dark:bg-[#f28b82]/10 border border-[#f2b8b5] dark:border-[#f28b82]/30 text-xs text-[#b3261e] dark:text-[#f28b82]">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{localError || syncError}</span>
            </div>
          )}

          {isConnected && syncConfig ? (
            <div className="space-y-4">
              {/* Connected Status Card */}
              <div className="p-3.5 rounded-xl bg-[#f0f4f9] dark:bg-[#282a2c] border border-[#e0e2ec] dark:border-[#3c4043] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#137333] dark:text-[#81c995]">
                    <span className="w-2 h-2 rounded-full bg-[#137333] dark:bg-[#81c995]" />
                    Connected to Secret Gist
                  </span>
                  <span className="text-[11px] text-[#5f6368] dark:text-[#8e918f] font-mono">
                    Last sync: {formatLastSync(syncConfig.lastSyncedAt)}
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5f6368] dark:text-[#8e918f] mb-1">
                    Secret Gist ID (paste this on your phone)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <code className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#3c4043] text-xs font-mono text-[#1f1f1f] dark:text-[#e3e3e3] truncate">
                      {syncConfig.gistId}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyGistId}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#3c4043] hover:bg-[#e9eef6] dark:hover:bg-[#333538] text-xs text-[#1f1f1f] dark:text-[#e3e3e3] transition-colors shrink-0"
                    >
                      {copied ? <Check size={13} className="text-[#137333] dark:text-[#81c995]" /> : <Copy size={13} />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-[#5f6368] dark:text-[#8e918f] leading-relaxed">
                Auto-sync active: changes push 1.2s after edits and pull automatically every 10s, on tab/app resume, and on reconnect.
              </p>

              {/* Disconnect */}
              <div className="pt-2 border-t border-[#e0e2ec] dark:border-[#2c2d30] flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    disconnectSync();
                    setGistIdInput('');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#b3261e] dark:text-[#f28b82] hover:bg-[#f9dedc]/60 dark:hover:bg-[#f28b82]/10 transition-colors"
                >
                  <Unlink size={13} />
                  <span>Disconnect Sync</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleConnect} className="space-y-4">
              {/* Step-by-step short guide */}
              <div className="p-3 rounded-xl bg-[#f0f4f9] dark:bg-[#282a2c]/70 border border-[#e0e2ec] dark:border-[#3c4043] text-[11px] text-[#444746] dark:text-[#c4c7c5] space-y-1 leading-relaxed">
                <p className="font-semibold text-[#1f1f1f] dark:text-[#e3e3e3]">Quick Setup:</p>
                <p>1. On GitHub, create a token with only <strong>Gists</strong> permission.</p>
                <p>2. <strong>First device (Laptop):</strong> paste your token, leave Gist ID empty, and click Create.</p>
                <p>3. <strong>Second device (Phone):</strong> paste the same token + the Gist ID from your laptop.</p>
              </div>

              {/* Token Input */}
              <div>
                <label className="block text-[11px] font-medium text-[#5f6368] dark:text-[#8e918f] uppercase tracking-wider mb-1.5">
                  GitHub Personal Access Token *
                </label>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="github_pat_... or ghp_..."
                    className="w-full bg-[#f0f4f9] dark:bg-[#282a2c] border border-[#e0e2ec] dark:border-[#3c4043] rounded-xl pl-3 pr-9 py-2 text-xs text-[#1f1f1f] dark:text-[#e3e3e3] placeholder-[#747775] dark:placeholder-[#8e918f] focus:outline-none focus:border-[#0b57d0] dark:focus:border-[#8ab4f8]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5f6368] dark:text-[#8e918f] hover:text-[#1f1f1f] dark:hover:text-[#e3e3e3]"
                  >
                    {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <span className="text-[10px] text-[#747775] dark:text-[#8e918f] mt-1 block">
                  Stored locally in your browser only — never sent anywhere except api.github.com.
                </span>
              </div>

              {/* Gist ID Input */}
              <div>
                <label className="block text-[11px] font-medium text-[#5f6368] dark:text-[#8e918f] uppercase tracking-wider mb-1.5">
                  Secret Gist ID (optional on 1st device)
                </label>
                <input
                  type="text"
                  value={gistIdInput}
                  onChange={(e) => setGistIdInput(e.target.value)}
                  placeholder="Leave empty to create new, or paste Gist ID"
                  className="w-full bg-[#f0f4f9] dark:bg-[#282a2c] border border-[#e0e2ec] dark:border-[#3c4043] rounded-xl px-3 py-2 text-xs font-mono text-[#1f1f1f] dark:text-[#e3e3e3] placeholder-[#747775] dark:placeholder-[#8e918f] focus:outline-none focus:border-[#0b57d0] dark:focus:border-[#8ab4f8]"
                />
              </div>

              <button
                type="submit"
                disabled={syncStatus === 'syncing' || !tokenInput.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold bg-[#0b57d0] dark:bg-[#8ab4f8] text-white dark:text-[#131314] hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                {syncStatus === 'syncing' ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : gistIdInput.trim() ? (
                  <>
                    <Download size={14} />
                    <span>Connect & Download Tasks</span>
                  </>
                ) : (
                  <>
                    <Cloud size={14} />
                    <span>Create Secret Gist & Connect</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
});
