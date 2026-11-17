import React, { useState, memo } from 'react';
import { useKanban } from '../context/KanbanContext';
import { TaskStatus, DayOfWeek } from '../types';
import { Plus, X } from 'lucide-react';

const DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface QuickAddBarProps {
  defaultStatus?: TaskStatus;
  defaultSubjectId?: string;
  defaultDayOfWeek?: DayOfWeek | null;
  placeholder?: string;
  compact?: boolean;
}

export const QuickAddBar: React.FC<QuickAddBarProps> = memo(({
  defaultStatus = 'todo',
  defaultSubjectId,
  defaultDayOfWeek,
  placeholder = 'Add a task',
  compact = false,
}) => {
  const { subjects, addTask } = useKanban();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [subjectId, setSubjectId] = useState(defaultSubjectId || subjects[0]?.id || '');
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek | ''>(defaultDayOfWeek || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      details: details.trim(),
      subjectId: defaultSubjectId || subjectId,
      status: defaultStatus,
      dayOfWeek: defaultDayOfWeek !== undefined ? defaultDayOfWeek : (dayOfWeek || null),
    });

    setTitle('');
    setDetails('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`w-full flex items-center gap-1.5 rounded-xl text-[#0b57d0] dark:text-[#8ab4f8] hover:bg-[#0b57d0]/10 dark:hover:bg-[#8ab4f8]/10 transition-colors font-medium border border-dashed border-[#c4c7c5] dark:border-[#3c4043]/60 hover:border-[#0b57d0]/50 dark:hover:border-[#8ab4f8]/50 ${
          compact ? 'px-2 py-1.5 text-[11px]' : 'px-3 py-2 text-xs gap-2.5'
        }`}
      >
        <Plus size={compact ? 13 : 15} />
        <span className="truncate">{placeholder}</span>
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-2.5 bg-white dark:bg-[#1e1f20] rounded-xl border border-[#e0e2ec] dark:border-[#3c4043] shadow-md dark:shadow-lg space-y-2"
    >
      <input
        type="text"
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full bg-transparent text-xs sm:text-sm text-[#1f1f1f] dark:text-[#e3e3e3] placeholder-[#747775] dark:placeholder-[#8e918f] focus:outline-none"
      />

      {!compact && (
        <textarea
          rows={1}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Details (optional)"
          className="w-full bg-transparent text-xs text-[#444746] dark:text-[#c4c7c5] placeholder-[#747775] dark:placeholder-[#5f6368] focus:outline-none resize-none"
        />
      )}

      {/* Row of quick selectors: Subject & Day of Week */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-[#e0e2ec] dark:border-[#2c2d30]">
        <div className="flex flex-wrap items-center gap-1.5">
          {!defaultSubjectId && (
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="bg-[#f0f4f9] dark:bg-[#282a2c] text-[#1f1f1f] dark:text-[#c4c7c5] border border-[#e0e2ec] dark:border-[#3c4043] rounded-lg px-2 py-0.5 text-[11px] focus:outline-none max-w-[130px]"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id} className="bg-white dark:bg-[#1e1f20] text-[#1f1f1f] dark:text-[#e3e3e3]">
                  {s.name}
                </option>
              ))}
            </select>
          )}

          {defaultDayOfWeek === undefined && (
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek | '')}
              className="bg-[#f0f4f9] dark:bg-[#282a2c] text-[#1f1f1f] dark:text-[#c4c7c5] border border-[#e0e2ec] dark:border-[#3c4043] rounded-lg px-2 py-0.5 text-[11px] focus:outline-none"
            >
              <option value="" className="bg-white dark:bg-[#1e1f20]">No day</option>
              {DAYS.map((d) => (
                <option key={d} value={d} className="bg-white dark:bg-[#1e1f20]">
                  {d}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setTitle('');
              setDetails('');
              setIsOpen(false);
            }}
            className="p-1 rounded text-[#5f6368] dark:text-[#8e918f] hover:text-[#1f1f1f] dark:hover:text-[#e3e3e3] hover:bg-[#f0f4f9] dark:hover:bg-[#282a2c]"
          >
            <X size={14} />
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#0b57d0] text-white dark:bg-[#8ab4f8] dark:text-[#131314] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Save
          </button>
        </div>
      </div>
    </form>
  );
});
