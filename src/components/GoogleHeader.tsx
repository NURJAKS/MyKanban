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

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => setInstallPrompt(null);

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const totalActive = tasks.filter((t) => !t.completed).length;
  const totalCompleted = tasks.filter((t) => t.completed).length;

  return (
    <header className="border-b border-[#e0e2ec] dark:border-[#282a2c] bg-white dark:bg-[#131314] sticky top-0 z-30 transition-colors">
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

          {/* Install App Button (shown when browser supports native PWA install) */}
          {installPrompt && (
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
  );
};
