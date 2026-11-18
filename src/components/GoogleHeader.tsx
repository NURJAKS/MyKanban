import React, { useState, useEffect } from 'react';
import { useKanban } from '../context/KanbanContext';
import {
  Search,
  CheckCircle2,
  Columns3,
  ListFilter,
  CalendarDays,
  StickyNote,
  X,
  Sun,
  Moon,
  Command,
  Cloud,
  RefreshCw,
  Smartphone,
  Share,
  PlusSquare,
  Copy,
  Check,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const GoogleHeader: React.FC = () => {
  const {
    subjects,
    tasks,
    viewMode,
    theme,
    toggleTheme,
    setViewMode,
    selectedSubjectId,
    setSelectedSubjectId,
    searchQuery,
    setSearchQuery,
    getSubjectColor,
    syncConfig,
    syncStatus,
    setIsSyncModalOpen,
  } = useKanban();

  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIosInstallable, setIsIosInstallable] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    const isIos =
      /iPad|iPhone|iPod/.test(ua) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    const isStandalone =
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone) ||
      window.matchMedia('(display-mode: standalone)').matches;

    if (isIos && !isStandalone) {
      setIsIosInstallable(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstallPrompt(null);
      setIsIosInstallable(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstallPrompt(null);
      }
      return;
    }
    if (isIosInstallable) {
      setShowIosGuide(true);
    }
  };

  const handleCopyAppUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 1800);
    } catch {}
  };

  const totalActive = tasks.filter((t) => !t.completed).length;
  const totalCompleted = tasks.filter((t) => t.completed).length;

  return (
    <>
    <header className="border-b border-[#e0e2ec] dark:border-[#282a2c] bg-white dark:bg-[#131314] sticky top-0 z-30 pt-[env(safe-area-inset-top)] transition-colors">
      {/* Top Navbar */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#f0f4f9] dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#3c4043] flex items-center justify-center">
            <CheckCircle2 size={18} className="text-[#0b57d0] dark:text-[#8ab4f8]" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-[#1f1f1f] dark:text-[#e3e3e3] flex items-center gap-2">
              My University Kanban
              <span className="text-[10px] font-mono font-normal text-[#5f6368] dark:text-[#8e918f] bg-[#f0f4f9] dark:bg-[#1e1f20] px-1.5 py-0.5 rounded border border-[#e0e2ec] dark:border-[#2c2d30]">
                7 Lessons
              </span>
            </h1>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-[#f0f4f9] dark:bg-[#1e1f20] p-1 rounded-xl border border-[#e0e2ec] dark:border-[#282a2c] self-start md:self-auto max-w-full overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setViewMode('status_board')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 whitespace-nowrap ${
              viewMode === 'status_board'
                ? 'bg-white dark:bg-[#282a2c] text-[#0b57d0] dark:text-[#8ab4f8] shadow-sm'
                : 'text-[#5f6368] dark:text-[#8e918f] hover:text-[#1f1f1f] dark:hover:text-[#e3e3e3]'
            }`}
          >
            <Columns3 size={13} />
            <span>Status Board</span>
          </button>

          <button
            onClick={() => setViewMode('subject_lists')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 whitespace-nowrap ${
              viewMode === 'subject_lists'
                ? 'bg-white dark:bg-[#282a2c] text-[#0b57d0] dark:text-[#8ab4f8] shadow-sm'
                : 'text-[#5f6368] dark:text-[#8e918f] hover:text-[#1f1f1f] dark:hover:text-[#e3e3e3]'
            }`}
          >
            <ListFilter size={13} />
            <span>7 Class Lists</span>
          </button>

          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 whitespace-nowrap ${
              viewMode === 'calendar'
                ? 'bg-white dark:bg-[#282a2c] text-[#0b57d0] dark:text-[#8ab4f8] shadow-sm'
                : 'text-[#5f6368] dark:text-[#8e918f] hover:text-[#1f1f1f] dark:hover:text-[#e3e3e3]'
            }`}
          >
            <CalendarDays size={13} />
            <span>Calendar</span>
          </button>

          <button
            onClick={() => setViewMode('notes')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 whitespace-nowrap ${
              viewMode === 'notes'
                ? 'bg-white dark:bg-[#282a2c] text-[#0b57d0] dark:text-[#8ab4f8] shadow-sm'
                : 'text-[#5f6368] dark:text-[#8e918f] hover:text-[#1f1f1f] dark:hover:text-[#e3e3e3]'
            }`}
          >
            <StickyNote size={13} />
            <span>Notes</span>
          </button>
        </div>

        {/* Right Search, Theme Toggle, Hotkey pill, Reset */}
        <div className="flex items-center gap-2 self-stretch md:self-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-52">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5f6368] dark:text-[#8e918f]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={viewMode === 'notes' ? 'Search notes...' : 'Search tasks...'}
              className="w-full bg-[#f0f4f9] dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#282a2c] rounded-xl pl-8 pr-7 py-1.5 text-xs text-[#1f1f1f] dark:text-[#e3e3e3] placeholder-[#5f6368] dark:placeholder-[#8e918f] focus:outline-none focus:border-[#0b57d0] dark:focus:border-[#8ab4f8]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#5f6368] dark:text-[#8e918f] hover:text-[#1f1f1f] dark:hover:text-[#e3e3e3]"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Hotkey info badge */}
          <div
            className="hidden lg:flex items-center gap-1 px-2 py-1.5 rounded-xl text-[11px] font-mono text-[#5f6368] dark:text-[#8e918f] bg-[#f0f4f9] dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#282a2c]"
            title="Global Hotkey: Ctrl+Alt+U to open anywhere in Linux"
          >
            <Command size={11} />
            <span>Ctrl+Alt+U</span>
          </div>

          {/* Install App Button (native prompt on Android/Desktop, Safari guide on iOS) */}
          {(installPrompt || isIosInstallable) && (
            <button
              type="button"
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-[#0b57d0] dark:bg-[#8ab4f8] text-white dark:text-[#131314] hover:opacity-90 transition-opacity shrink-0"
              title="Install MyKanban as an app on your device"
            >
              <Smartphone size={14} />
              <span className="hidden sm:inline">Install</span>
            </button>
          )}

          {/* Sync Button */}
          <button
            onClick={() => setIsSyncModalOpen(true)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              syncStatus === 'error'
                ? 'bg-[#f9dedc] dark:bg-[#f28b82]/10 text-[#b3261e] dark:text-[#f28b82] border-[#f2b8b5] dark:border-[#f28b82]/30'
                : syncConfig?.gistId
                ? 'bg-[#d3e3fd]/50 dark:bg-[#8ab4f8]/10 text-[#0b57d0] dark:text-[#8ab4f8] border-[#a8c7fa]/60 dark:border-[#8ab4f8]/30'
                : 'text-[#5f6368] dark:text-[#8e918f] hover:text-[#1f1f1f] dark:hover:text-[#e3e3e3] bg-[#f0f4f9] dark:bg-[#1e1f20] border-[#e0e2ec] dark:border-[#282a2c] hover:bg-[#e9eef6] dark:hover:bg-[#282a2c]'
            }`}
            title="GitHub Gist Cloud Sync"
          >
            {syncStatus === 'syncing' ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Cloud size={14} />
            )}
            <span className="hidden sm:inline">
              {syncStatus === 'syncing'
                ? 'Syncing'
                : syncConfig?.gistId
                ? 'Synced'
                : 'Sync'}
            </span>
          </button>

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-[#5f6368] dark:text-[#8e918f] hover:text-[#1f1f1f] dark:hover:text-[#e3e3e3] bg-[#f0f4f9] dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#282a2c] hover:bg-[#e9eef6] dark:hover:bg-[#282a2c] transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
          >
            {theme === 'dark' ? <Sun size={15} className="text-[#fdd663]" /> : <Moon size={15} className="text-[#0b57d0]" />}
          </button>
        </div>
      </div>

      {/* 7 Lessons Filter Chips Bar (hidden in Notes view) */}
      {viewMode !== 'notes' && (
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-2 flex items-center justify-between gap-3 overflow-x-auto custom-scrollbar border-t border-[#f0f4f9] dark:border-[#1e1f20]">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] text-[#5f6368] dark:text-[#5f6368] font-medium mr-1 uppercase tracking-wider hidden sm:inline">
            Filter:
          </span>

          <button
            onClick={() => setSelectedSubjectId(null)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              selectedSubjectId === null
                ? 'bg-[#d3e3fd] text-[#0b57d0] dark:bg-[#8ab4f8]/15 dark:text-[#8ab4f8] border border-[#a8c7fa] dark:border-[#8ab4f8]/40'
                : 'text-[#5f6368] dark:text-[#8e918f] hover:text-[#1f1f1f] dark:hover:text-[#e3e3e3] bg-[#f0f4f9] dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#282a2c]'
            }`}
          >
            All 7 Classes
          </button>

          {subjects.map((subj) => {
            const isSelected = selectedSubjectId === subj.id;
            const count = tasks.filter((t) => t.subjectId === subj.id && !t.completed).length;
            const color = getSubjectColor(subj);

            return (
              <button
                key={subj.id}
                onClick={() => setSelectedSubjectId(isSelected ? null : subj.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-white dark:bg-[#282a2c] text-[#1f1f1f] dark:text-[#e3e3e3] border ring-1'
                    : 'text-[#5f6368] dark:text-[#8e918f] hover:text-[#1f1f1f] dark:hover:text-[#e3e3e3] bg-[#f0f4f9] dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#282a2c]'
                }`}
                style={{
                  borderColor: isSelected ? color : undefined,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span>{subj.name}</span>
                {count > 0 && (
                  <span className="text-[10px] font-mono opacity-75">({count})</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Counter status */}
        <div className="text-[11px] text-[#5f6368] dark:text-[#8e918f] font-mono shrink-0 hidden md:block">
          {totalActive} pending · {totalCompleted} completed
        </div>
        </div>
      )}
    </header>

    {/* iOS Safari Install Guide Modal */}
    {showIosGuide && (
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
        onClick={() => setShowIosGuide(false)}
      >
        <div
          className="w-full max-w-sm bg-white dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#3c4043] rounded-2xl shadow-2xl p-5 space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#d3e3fd]/60 dark:bg-[#8ab4f8]/15 text-[#0b57d0] dark:text-[#8ab4f8] flex items-center justify-center">
                <Smartphone size={17} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#1f1f1f] dark:text-[#e3e3e3]">
                  Install on iPhone / iPad
                </h3>
                <p className="text-[11px] text-[#5f6368] dark:text-[#8e918f]">
                  Add MyKanban to your Home Screen
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="p-1.5 rounded-lg text-[#5f6368] dark:text-[#8e918f] hover:bg-[#f0f4f9] dark:hover:bg-[#282a2c]"
            >
              <X size={16} />
            </button>
          </div>

          <ol className="space-y-2.5 text-xs text-[#1f1f1f] dark:text-[#e3e3e3]">
            <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#f0f4f9] dark:bg-[#282a2c]">
              <span className="w-5 h-5 rounded-full bg-[#0b57d0] dark:bg-[#8ab4f8] text-white dark:text-[#131314] text-[11px] font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <span>
                Open this page in <strong>Safari</strong> (if you opened it inside Telegram or Chrome, copy the link below into Safari).
              </span>
            </li>
            <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#f0f4f9] dark:bg-[#282a2c]">
              <span className="w-5 h-5 rounded-full bg-[#0b57d0] dark:bg-[#8ab4f8] text-white dark:text-[#131314] text-[11px] font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <span className="flex items-center gap-1 flex-wrap">
                Tap the <Share size={13} className="inline text-[#0b57d0] dark:text-[#8ab4f8]" /> <strong>Share</strong> button at the bottom of Safari.
              </span>
            </li>
            <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#f0f4f9] dark:bg-[#282a2c]">
              <span className="w-5 h-5 rounded-full bg-[#0b57d0] dark:bg-[#8ab4f8] text-white dark:text-[#131314] text-[11px] font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <span className="flex items-center gap-1 flex-wrap">
                Tap <PlusSquare size={13} className="inline text-[#0b57d0] dark:text-[#8ab4f8]" /> <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.
              </span>
            </li>
          </ol>

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopyAppUrl}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-[#f0f4f9] dark:bg-[#282a2c] text-[#1f1f1f] dark:text-[#e3e3e3] border border-[#e0e2ec] dark:border-[#3c4043]"
            >
              {copiedUrl ? <Check size={13} className="text-[#137333] dark:text-[#81c995]" /> : <Copy size={13} />}
              <span>{copiedUrl ? 'Link Copied' : 'Copy Link for Safari'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0b57d0] dark:bg-[#8ab4f8] text-white dark:text-[#131314]"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
