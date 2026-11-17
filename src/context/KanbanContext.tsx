import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Subject, HomeworkTask, TaskStatus, ViewMode, Theme, DayOfWeek } from '../types';
import { INITIAL_SUBJECTS, INITIAL_TASKS } from '../data/initialData';
import {
  SyncConfig,
  createSecretGist,
  fetchGistData,
  pushGistData,
} from '../services/gistSync';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

const WEEKDAYS_BY_JS_DAY: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const migrateTask = (raw: HomeworkTask & { dueDate?: string; dueTime?: string }): HomeworkTask => {
  if (raw.dayOfWeek !== undefined) {
    const { dueDate: _d, dueTime: _t, ...rest } = raw;
    return rest;
  }
  let derivedDay: DayOfWeek | null = null;
  if (raw.dueDate) {
    const parsed = new Date(raw.dueDate + 'T12:00:00');
    if (!isNaN(parsed.getTime())) {
      derivedDay = WEEKDAYS_BY_JS_DAY[parsed.getDay()];
    }
  }
  const { dueDate: _d, dueTime: _t, ...rest } = raw;
  return { ...rest, dayOfWeek: derivedDay };
};

interface KanbanContextType {
  subjects: Subject[];
  tasks: HomeworkTask[];
  viewMode: ViewMode;
  theme: Theme;
  selectedSubjectId: string | null;
  searchQuery: string;
  editingTaskId: string | null;
  draggedTaskId: string | null;
  hotkeyNotification: boolean;

  // Sync state & actions
  syncConfig: SyncConfig | null;
  syncStatus: SyncStatus;
  syncError: string | null;
  isSyncModalOpen: boolean;
  setIsSyncModalOpen: (open: boolean) => void;
  connectAndCreateGist: (token: string) => Promise<string>;
  connectAndPullGist: (token: string, gistId: string) => Promise<void>;
  syncPull: (force?: boolean) => Promise<void>;
  syncPush: () => Promise<void>;
  disconnectSync: () => void;

  setViewMode: (mode: ViewMode) => void;
  toggleTheme: () => void;
  setSelectedSubjectId: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
  setEditingTaskId: (id: string | null) => void;
  setDraggedTaskId: (id: string | null) => void;

  addTask: (data: { title: string; subjectId: string; dayOfWeek?: DayOfWeek | null; details?: string; status?: TaskStatus }) => void;
  toggleTaskComplete: (taskId: string) => void;
  updateTask: (taskId: string, partial: Partial<HomeworkTask>) => void;
  deleteTask: (taskId: string) => void;
  moveTaskToStatus: (taskId: string, newStatus: TaskStatus) => void;
  moveTaskToSubject: (taskId: string, newSubjectId: string) => void;
  moveTaskToDay: (taskId: string, dayOfWeek: DayOfWeek | null) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  updateSubject: (subjectId: string, partial: Partial<Subject>) => void;
  resetDefaults: () => void;

  getSubjectById: (id: string) => Subject | undefined;
  getSubjectColor: (subject?: Subject) => string;
  getFilteredTasks: () => HomeworkTask[];
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

const STORAGE_KEY_TASKS = 'gtasks_uni_tasks_v4';
const STORAGE_KEY_SUBJECTS = 'gtasks_uni_subjects_v4';
const STORAGE_KEY_THEME = 'gtasks_uni_theme_v3';
const STORAGE_KEY_SYNC = 'gtasks_uni_sync_v1';
const STORAGE_KEY_UPDATED = 'gtasks_uni_updated_v4';

export const KanbanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SUBJECTS);
      return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
    } catch {
      return INITIAL_SUBJECTS;
    }
  });

  const [tasks, setTasks] = useState<HomeworkTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TASKS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.map(migrateTask) : INITIAL_TASKS;
      }
      return INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [syncConfig, setSyncConfig] = useState<SyncConfig | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SYNC);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>('status_board');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [hotkeyNotification, setHotkeyNotification] = useState(false);

  // Refs for sync coordination without stale closures
  const hasMountedRef = useRef(false);
  const isApplyingRemoteRef = useRef(false);
  const pushTimeoutRef = useRef<number | null>(null);
  const lastPullTimestampRef = useRef<number>(0);
  const localUpdatedAtRef = useRef<string>(
    (() => {
      try {
        return localStorage.getItem(STORAGE_KEY_UPDATED) || '';
      } catch {
        return '';
      }
    })()
  );

  // Latest state refs for async sync callbacks
  const subjectsRef = useRef(subjects);
  const tasksRef = useRef(tasks);
  const syncConfigRef = useRef(syncConfig);
  subjectsRef.current = subjects;
  tasksRef.current = tasks;
  syncConfigRef.current = syncConfig;

  // Sync theme with document class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
    } catch {}
  }, [theme]);

  // Clear drag state globally on any dragend/drop (handles unmounted source elements)
  useEffect(() => {
    const clearDrag = () => setDraggedTaskId(null);
    window.addEventListener('dragend', clearDrag);
    window.addEventListener('drop', clearDrag);
    return () => {
      window.removeEventListener('dragend', clearDrag);
      window.removeEventListener('drop', clearDrag);
    };
  }, []);

  // Handle in-app Ctrl+Alt+U
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === 'u' || e.key === 'U' || e.key === 'г' || e.key === 'Г')) {
        e.preventDefault();
        setHotkeyNotification(true);
        setTimeout(() => setHotkeyNotification(false), 3000);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Persist syncConfig
  useEffect(() => {
    try {
      if (syncConfig) {
        localStorage.setItem(STORAGE_KEY_SYNC, JSON.stringify(syncConfig));
      } else {
        localStorage.removeItem(STORAGE_KEY_SYNC);
      }
    } catch {}
  }, [syncConfig]);

  // Pull from Gist
  const syncPull = useCallback(async (force = false) => {
    const cfg = syncConfigRef.current;
    if (!cfg?.token || !cfg?.gistId) return;

    setSyncStatus('syncing');
    setSyncError(null);
    try {
      const remote = await fetchGistData(cfg.token, cfg.gistId);
      const localTs = localUpdatedAtRef.current;

      if (force || !localTs || remote.updatedAt > localTs) {
        isApplyingRemoteRef.current = true;
        localUpdatedAtRef.current = remote.updatedAt;
        try {
          localStorage.setItem(STORAGE_KEY_UPDATED, remote.updatedAt);
        } catch {}
        setSubjects(remote.subjects);
        setTasks(remote.tasks.map(migrateTask));
      }

      const nowIso = new Date().toISOString();
      setSyncConfig((prev) => (prev ? { ...prev, lastSyncedAt: nowIso } : null));
      setSyncStatus('synced');
      lastPullTimestampRef.current = Date.now();
    } catch (err) {
      setSyncStatus('error');
      setSyncError(err instanceof Error ? err.message : 'Failed to pull from Gist');
    }
  }, []);

  // Push to Gist
  const syncPush = useCallback(async () => {
    const cfg = syncConfigRef.current;
    if (!cfg?.token || !cfg?.gistId) return;

    setSyncStatus('syncing');
    setSyncError(null);
    try {
      const nowIso = new Date().toISOString();
      localUpdatedAtRef.current = nowIso;
      try {
        localStorage.setItem(STORAGE_KEY_UPDATED, nowIso);
      } catch {}

      await pushGistData(cfg.token, cfg.gistId, {
        version: 1,
        updatedAt: nowIso,
        subjects: subjectsRef.current,
        tasks: tasksRef.current,
      });

      setSyncConfig((prev) => (prev ? { ...prev, lastSyncedAt: nowIso } : null));
      setSyncStatus('synced');
    } catch (err) {
      setSyncStatus('error');
      setSyncError(err instanceof Error ? err.message : 'Failed to push to Gist');
    }
  }, []);

  // Connect & Create new Secret Gist (for first device, e.g. Laptop)
  const connectAndCreateGist = useCallback(async (token: string): Promise<string> => {
    setSyncStatus('syncing');
    setSyncError(null);
    try {
      const nowIso = new Date().toISOString();
      const { gistId } = await createSecretGist(token, {
        version: 1,
        updatedAt: nowIso,
        subjects: subjectsRef.current,
        tasks: tasksRef.current,
      });

      localUpdatedAtRef.current = nowIso;
      try {
        localStorage.setItem(STORAGE_KEY_UPDATED, nowIso);
      } catch {}

      setSyncConfig({ token: token.trim(), gistId, lastSyncedAt: nowIso });
      setSyncStatus('synced');
      return gistId;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create Secret Gist';
      setSyncStatus('error');
      setSyncError(msg);
      throw err;
    }
  }, []);

  // Connect to existing Secret Gist & pull (for second device, e.g. Phone)
  const connectAndPullGist = useCallback(async (token: string, gistId: string): Promise<void> => {
    setSyncStatus('syncing');
    setSyncError(null);
    try {
      const remote = await fetchGistData(token, gistId);
      const cleanId = gistId.trim().replace(/^https:\/\/gist\.github\.com\/[^/]+\//, '');
      const nowIso = new Date().toISOString();

      isApplyingRemoteRef.current = true;
      localUpdatedAtRef.current = remote.updatedAt;
      try {
        localStorage.setItem(STORAGE_KEY_UPDATED, remote.updatedAt);
      } catch {}

      setSubjects(remote.subjects);
      setTasks(remote.tasks.map(migrateTask));
      setSyncConfig({ token: token.trim(), gistId: cleanId, lastSyncedAt: nowIso });
      setSyncStatus('synced');
      lastPullTimestampRef.current = Date.now();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to Gist';
      setSyncStatus('error');
      setSyncError(msg);
      throw err;
    }
  }, []);

  const disconnectSync = useCallback(() => {
    if (pushTimeoutRef.current) {
      window.clearTimeout(pushTimeoutRef.current);
    }
    setSyncConfig(null);
    setSyncStatus('idle');
    setSyncError(null);
  }, []);

  // Auto-pull on initial mount & when tab becomes visible/focused
  useEffect(() => {
    if (syncConfigRef.current?.token && syncConfigRef.current?.gistId) {
      syncPull();
    }

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        const elapsed = Date.now() - lastPullTimestampRef.current;
        if (elapsed > 5000 && syncConfigRef.current?.token && syncConfigRef.current?.gistId) {
          syncPull();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [syncPull]);

  // Save subjects & tasks to localStorage + debounced auto-push to Gist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SUBJECTS, JSON.stringify(subjects));
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch {}

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    if (isApplyingRemoteRef.current) {
      isApplyingRemoteRef.current = false;
      return;
    }

    const nowIso = new Date().toISOString();
    localUpdatedAtRef.current = nowIso;
    try {
      localStorage.setItem(STORAGE_KEY_UPDATED, nowIso);
    } catch {}

    if (syncConfigRef.current?.token && syncConfigRef.current?.gistId) {
      if (pushTimeoutRef.current) {
        window.clearTimeout(pushTimeoutRef.current);
      }
      pushTimeoutRef.current = window.setTimeout(() => {
        syncPush();
      }, 1200);
    }
  }, [subjects, tasks, syncPush]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const getSubjectById = useCallback(
    (id: string) => subjects.find((s) => s.id === id),
    [subjects]
  );

  const getSubjectColor = useCallback(
    (subject?: Subject) => {
      if (!subject) return theme === 'dark' ? '#8ab4f8' : '#1a73e8';
      return theme === 'dark' ? subject.colorDark : subject.colorLight;
    },
    [theme]
  );

  const addTask = useCallback(
    (data: {
      title: string;
      subjectId: string;
      dayOfWeek?: DayOfWeek | null;
      details?: string;
      status?: TaskStatus;
    }) => {
      const newTask: HomeworkTask = {
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        title: data.title.trim(),
        subjectId: data.subjectId || subjects[0].id,
        dayOfWeek: data.dayOfWeek !== undefined ? data.dayOfWeek : null,
        details: data.details || '',
        status: data.status || 'todo',
        completed: data.status === 'completed',
        subtasks: [],
        createdAt: new Date().toISOString().split('T')[0],
      };
      setTasks((prev) => [newTask, ...prev]);
    },
    [subjects]
  );

  const toggleTaskComplete = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            status: nextCompleted ? 'completed' : 'todo',
            completedAt: nextCompleted ? new Date().toISOString().split('T')[0] : undefined,
          };
        }
        return t;
      })
    );
  }, []);

  const updateTask = useCallback((taskId: string, partial: Partial<HomeworkTask>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = { ...t, ...partial };
          if (partial.status) {
            updated.completed = partial.status === 'completed';
          }
          return updated;
        }
        return t;
      })
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setEditingTaskId((curr) => (curr === taskId ? null : curr));
  }, []);

  const moveTaskToStatus = useCallback((taskId: string, newStatus: TaskStatus) => {
    setDraggedTaskId(null);
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: newStatus,
            completed: newStatus === 'completed',
            completedAt: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : undefined,
          };
        }
        return t;
      })
    );
  }, []);

  const moveTaskToSubject = useCallback((taskId: string, newSubjectId: string) => {
    setDraggedTaskId(null);
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, subjectId: newSubjectId } : t))
    );
  }, []);

  const moveTaskToDay = useCallback((taskId: string, dayOfWeek: DayOfWeek | null) => {
    setDraggedTaskId(null);
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, dayOfWeek } : t))
    );
  }, []);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          ),
        };
      })
    );
  }, []);

  const addSubtask = useCallback((taskId: string, title: string) => {
    if (!title.trim()) return;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: [
            ...t.subtasks,
            {
              id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
              title: title.trim(),
              completed: false,
            },
          ],
        };
      })
    );
  }, []);

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: t.subtasks.filter((st) => st.id !== subtaskId),
        };
      })
    );
  }, []);

  const updateSubject = useCallback((subjectId: string, partial: Partial<Subject>) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === subjectId ? { ...s, ...partial } : s))
    );
  }, []);

  const resetDefaults = useCallback(() => {
    setSubjects(INITIAL_SUBJECTS);
    setTasks(INITIAL_TASKS);
    setSelectedSubjectId(null);
    setSearchQuery('');
  }, []);

  const getFilteredTasks = useCallback(() => {
    return tasks.filter((t) => {
      if (selectedSubjectId && t.subjectId !== selectedSubjectId) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const subject = getSubjectById(t.subjectId);
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDetails = t.details?.toLowerCase().includes(q);
        const matchSubj = subject?.name.toLowerCase().includes(q) || subject?.code.toLowerCase().includes(q);
        if (!matchTitle && !matchDetails && !matchSubj) return false;
      }
      return true;
    });
  }, [tasks, selectedSubjectId, searchQuery, getSubjectById]);

  return (
    <KanbanContext.Provider
      value={{
        subjects,
        tasks,
        viewMode,
        theme,
        selectedSubjectId,
        searchQuery,
        editingTaskId,
        draggedTaskId,
        hotkeyNotification,
        syncConfig,
        syncStatus,
        syncError,
        isSyncModalOpen,
        setIsSyncModalOpen,
        connectAndCreateGist,
        connectAndPullGist,
        syncPull,
        syncPush,
        disconnectSync,
        setViewMode,
        toggleTheme,
        setSelectedSubjectId,
        setSearchQuery,
        setEditingTaskId,
        setDraggedTaskId,
        addTask,
        toggleTaskComplete,
        updateTask,
        deleteTask,
        moveTaskToStatus,
        moveTaskToSubject,
        moveTaskToDay,
        toggleSubtask,
        addSubtask,
        deleteSubtask,
        updateSubject,
        resetDefaults,
        getSubjectById,
        getSubjectColor,
        getFilteredTasks,
      }}
    >
      {children}
    </KanbanContext.Provider>
  );
};

export const useKanban = () => {
  const context = useContext(KanbanContext);
  if (!context) {
    throw new Error('useKanban must be used within a KanbanProvider');
  }
  return context;
};
