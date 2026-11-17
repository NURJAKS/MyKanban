import React, { useState, useEffect, memo } from 'react';
import { useKanban } from '../context/KanbanContext';
import { DayOfWeek } from '../types';
import { X, Copy, Check } from 'lucide-react';

const DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const DuplicateTaskModal: React.FC = memo(() => {
  const {
    duplicatingTaskId,
    setDuplicatingTaskId,
    tasks,
    subjects,
    getSubjectById,
    getSubjectColor,
    duplicateTaskToSubjects,
    showToast,
  } = useKanban();

  const task = tasks.find((t) => t.id === duplicatingTaskId);

  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek | null>(null);
  const [resetStatus, setResetStatus] = useState(false);

  useEffect(() => {
    if (!duplicatingTaskId) return;
    const current = tasks.find((t) => t.id === duplicatingTaskId);
    if (current) {
      setSelectedSubjectIds([]);
      setDayOfWeek(current.dayOfWeek ?? null);
      setResetStatus(current.completed);
    }
    // Only reset modal form when opening for a new duplicatingTaskId, not on background task polls
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duplicatingTaskId]);

  useEffect(() => {
    if (!duplicatingTaskId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDuplicatingTaskId(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [duplicatingTaskId, setDuplicatingTaskId]);

  if (!task) return null;

  const sourceSubject = getSubjectById(task.subjectId);
  const sourceColor = getSubjectColor(sourceSubject);

  const toggleSubject = (subjId: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(subjId) ? prev.filter((id) => id !== subjId) : [...prev, subjId]
    );
  };

  const selectAllOther = () => {
    setSelectedSubjectIds(subjects.filter((s) => s.id !== task.subjectId).map((s) => s.id));
  };

  const selectAll = () => {
    setSelectedSubjectIds(subjects.map((s) => s.id));
  };

  const handleDuplicate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSubjectIds.length === 0) return;

    const count = duplicateTaskToSubjects(task.id, selectedSubjectIds, {
      resetStatus,
      dayOfWeek,
    });

    setDuplicatingTaskId(null);
    if (count > 0) {
      showToast(`Task duplicated to ${count} ${count === 1 ? 'lesson' : 'lessons'}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
      onClick={() => setDuplicatingTaskId(null)}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#1e1f20] border border-[#e0e2ec] dark:border-[#3c4043] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e0e2ec] dark:border-[#2c2d30]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#d3e3fd]/60 dark:bg-[#8ab4f8]/15 text-[#0b57d0] dark:text-[#8ab4f8] flex items-center justify-center">
              <Copy size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1f1f1f] dark:text-[#e3e3e3]">
                Duplicate Task to Lessons
              </h3>
              <p className="text-[11px] text-[#5f6368] dark:text-[#8e918f]">
                Copy this task into one or more courses
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDuplicatingTaskId(null)}
            className="p-1.5 rounded-lg text-[#5f6368] dark:text-[#8e918f] hover:text-[#1f1f1f] dark:hover:text-[#e3e3e3] hover:bg-[#f0f4f9] dark:hover:bg-[#282a2c]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleDuplicate} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Source Task Preview */}
          <div className="p-3 rounded-xl bg-[#f0f4f9] dark:bg-[#282a2c] border border-[#e0e2ec] dark:border-[#3c4043]">
            <div className="text-xs font-medium text-[#1f1f1f] dark:text-[#e3e3e3] line-clamp-2">
              {task.title}
            </div>
            {sourceSubject && (
              <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-[#5f6368] dark:text-[#8e918f]">
                <span>From:</span>
                <span className="inline-flex items-center gap-1 font-medium text-[#1f1f1f] dark:text-[#c4c7c5]">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: sourceColor }}
                  />
                  {sourceSubject.name} ({sourceSubject.code})
                </span>
              </div>
            )}
          </div>

          {/* Target Lessons Multi-Select */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-medium text-[#5f6368] dark:text-[#8e918f] uppercase tracking-wider">
                Select Target Lessons ({selectedSubjectIds.length})
              </label>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={selectAllOther}
                  className="text-[#0b57d0] dark:text-[#8ab4f8] hover:underline font-medium"
                >
                  Other 6
                </button>
                <span className="text-[#c4c7c5] dark:text-[#5f6368]">·</span>
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-[#0b57d0] dark:text-[#8ab4f8] hover:underline font-medium"
                >
                  All
                </button>
                {selectedSubjectIds.length > 0 && (
                  <>
                    <span className="text-[#c4c7c5] dark:text-[#5f6368]">·</span>
                    <button
                      type="button"
                      onClick={() => setSelectedSubjectIds([])}
                      className="text-[#5f6368] dark:text-[#8e918f] hover:underline"
                    >
                      Clear
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {subjects.map((subj) => {
                const isSelected = selectedSubjectIds.includes(subj.id);
                const isSource = subj.id === task.subjectId;
                const color = getSubjectColor(subj);

                return (
                  <button
                    key={subj.id}
                    type="button"
                    onClick={() => toggleSubject(subj.id)}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#d3e3fd]/40 dark:bg-[#8ab4f8]/15 border-[#0b57d0] dark:border-[#8ab4f8] text-[#1f1f1f] dark:text-[#e3e3e3]'
                        : 'bg-[#f8fafd] dark:bg-[#282a2c]/60 border-[#e0e2ec] dark:border-[#3c4043] text-[#444746] dark:text-[#c4c7c5] hover:bg-[#f0f4f9] dark:hover:bg-[#282a2c]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-medium truncate">{subj.name}</div>
                        <div className="text-[10px] text-[#5f6368] dark:text-[#8e918f] font-mono">
                          {subj.code}
                          {isSource ? ' · current' : ''}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#0b57d0] dark:bg-[#8ab4f8] border-transparent'
                          : 'border-[#747775] dark:border-[#8e918f]'
                      }`}
                    >
                      {isSelected && (
                        <Check size={11} className="text-white dark:text-[#131314] stroke-[3]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Planned Day Override */}
          <div>
            <label className="block text-[11px] font-medium text-[#5f6368] dark:text-[#8e918f] uppercase tracking-wider mb-1.5">
              Day of Week for Copies
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DAYS.map((d) => {
                const isSelected = dayOfWeek === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDayOfWeek(isSelected ? null : d)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-[#d3e3fd] text-[#0b57d0] border-[#a8c7fa] dark:bg-[#8ab4f8]/20 dark:text-[#8ab4f8] dark:border-[#8ab4f8]/50'
                        : 'bg-[#f0f4f9] dark:bg-[#282a2c] text-[#444746] dark:text-[#c4c7c5] border-[#e0e2ec] dark:border-[#3c4043]'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setDayOfWeek(null)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  dayOfWeek === null
                    ? 'bg-[#e0e2ec] text-[#1f1f1f] border-[#c4c7c5] dark:bg-[#3c4043] dark:text-[#e3e3e3] dark:border-[#5f6368]'
                    : 'bg-transparent text-[#747775] dark:text-[#8e918f] border-transparent hover:bg-[#f0f4f9] dark:hover:bg-[#282a2c]'
                }`}
              >
                None
              </button>
            </div>
          </div>

          {/* Options */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none p-2.5 rounded-xl bg-[#f8fafd] dark:bg-[#282a2c]/50 border border-[#e0e2ec] dark:border-[#3c4043]/70">
            <input
              type="checkbox"
              checked={resetStatus}
              onChange={(e) => setResetStatus(e.target.checked)}
              className="rounded border-[#747775] text-[#0b57d0] focus:ring-[#0b57d0] dark:focus:ring-[#8ab4f8]"
            />
            <span className="text-xs text-[#1f1f1f] dark:text-[#e3e3e3]">
              Reset status to <strong>To do</strong> &amp; uncheck subtasks in copies
            </span>
          </label>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e0e2ec] dark:border-[#2c2d30]">
            <button
              type="button"
              onClick={() => setDuplicatingTaskId(null)}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#5f6368] dark:text-[#c4c7c5] hover:bg-[#f0f4f9] dark:hover:bg-[#282a2c] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedSubjectIds.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#0b57d0] dark:bg-[#8ab4f8] text-white dark:text-[#131314] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              <Copy size={13} />
              <span>
                Duplicate to {selectedSubjectIds.length || 0}{' '}
                {selectedSubjectIds.length === 1 ? 'Lesson' : 'Lessons'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});
