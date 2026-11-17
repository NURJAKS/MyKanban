import React, { useState, memo } from 'react';
import { useKanban } from '../context/KanbanContext';
import { TaskStatus } from '../types';
import { Plus, Calendar, X } from 'lucide-react';

interface QuickAddBarProps {
  defaultStatus?: TaskStatus;
  defaultSubjectId?: string;
  placeholder?: string;
}

export const QuickAddBar: React.FC<QuickAddBarProps> = memo(({
  defaultStatus = 'todo',
  defaultSubjectId,
  placeholder = 'Add a task',
}) => {
  const { subjects, addTask } = useKanban();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [subjectId, setSubjectId] = useState(defaultSubjectId || subjects[0]?.id || '');
  const [dueDate, setDueDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [dueTime, setDueTime] = useState('23:59');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      details: details.trim(),
      subjectId: defaultSubjectId || subjectId,
      status: defaultStatus,
      dueDate,
      dueTime,
    });

    setTitle('');
    setDetails('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#0b57d0] dark:text-[#8ab4f8] hover:bg-[#0b57d0]/10 dark:hover:bg-[#8ab4f8]/10 transition-colors font-medium border border-dashed border-[#c4c7c5] dark:border-[#3c4043]/60 hover:border-[#0b57d0]/50 dark:hover:border-[#8ab4f8]/50"
      >
        <Plus size={15} />
        <span>{placeholder}</span>
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 bg-white dark:bg-[#1e1f20] rounded-xl border border-[#e0e2ec] dark:border-[#3c4043] shadow-md dark:shadow-lg space-y-2.5"
    >
      <input
        type="text"
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full bg-transparent text-sm text-[#1f1f1f] dark:text-[#e3e3e3] placeholder-[#747775] dark:placeholder-[#8e918f] focus:outline-none"
      />

      <textarea
        rows={1}
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="Details (optional)"
        className="w-full bg-transparent text-xs text-[#444746] dark:text-[#c4c7c5] placeholder-[#747775] dark:placeholder-[#5f6368] focus:outline-none resize-none"
      />

      {/* Row of quick selectors: Subject & Date */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#e0e2ec] dark:border-[#2c2d30]">
        <div className="flex items-center gap-1.5">
          {!defaultSubjectId && (
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="bg-[#f0f4f9] dark:bg-[#282a2c] text-[#1f1f1f] dark:text-[#c4c7c5] border border-[#e0e2ec] dark:border-[#3c4043] rounded-lg px-2 py-0.5 text-xs focus:outline-none"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id} className="bg-white dark:bg-[#1e1f20] text-[#1f1f1f] dark:text-[#e3e3e3]">
                  {s.name}
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-1 bg-[#f0f4f9] dark:bg-[#282a2c] border border-[#e0e2ec] dark:border-[#3c4043] rounded-lg px-2 py-0.5 text-xs text-[#1f1f1f] dark:text-[#c4c7c5]">
            <Calendar size={12} className="text-[#5f6368] dark:text-[#8e918f]" />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-transparent text-xs text-[#1f1f1f] dark:text-[#c4c7c5] focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setTitle('');
              setDetails('');
              setIsOpen(false);
            }}
            className="p-1 rounded text-[#5f6368] dark:text-[#8e918f] hover:text-[#1f1f1f] dark:hover:text-[#e3e3e3] hover:bg-[#f0f4f9] dark:hover:bg-[#282a2c]"
          >
            <X size={15} />
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="px-3 py-1 rounded-lg text-xs font-medium bg-[#0b57d0] text-white dark:bg-[#8ab4f8] dark:text-[#131314] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Save
          </button>
        </div>
      </div>
    </form>
  );
});
