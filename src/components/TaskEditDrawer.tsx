import React, { useState, useEffect, memo } from 'react';
import { useKanban } from '../context/KanbanContext';
import { TaskStatus } from '../types';
import { X, Calendar, Clock, Trash2, Check } from 'lucide-react';

export const TaskEditDrawer: React.FC = memo(() => {
  const {
    editingTaskId,
    setEditingTaskId,
    tasks,
    subjects,
    updateTask,
    deleteTask,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
  } = useKanban();

  const task = tasks.find((t) => t.id === editingTaskId);

  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDetails(task.details || '');
      setSubjectId(task.subjectId);
      setStatus(task.status);
      setDueDate(task.dueDate || '');
      setDueTime(task.dueTime || '');
    }
  }, [task]);

  if (!task) return null;

  const handleTitleBlur = () => {
    if (title.trim() && title !== task.title) {
      updateTask(task.id, { title: title.trim() });
    }
  };

  const handleDetailsBlur = () => {
    if (details !== task.details) {
      updateTask(task.id, { details: details.trim() });
    }
  };

  const handleSubjectChange = (newSubjId: string) => {
    setSubjectId(newSubjId);
    updateTask(task.id, { subjectId: newSubjId });
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    setStatus(newStatus);
    updateTask(task.id, {
      status: newStatus,
      completed: newStatus === 'completed',
    });
  };

  const handleDateChange = (newDate: string) => {
    setDueDate(newDate);
    updateTask(task.id, { dueDate: newDate });
  };

  const handleTimeChange = (newTime: string) => {
    setDueTime(newTime);
    updateTask(task.id, { dueTime: newTime });
  };

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40 dark:bg-black/60 backdrop-blur-[2px]"
      onClick={() => setEditingTaskId(null)}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#1e1f20] border-l border-[#e0e2ec] dark:border-[#3c4043] h-full flex flex-col p-6 shadow-2xl animate-in slide-in-from-right duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#e0e2ec] dark:border-[#2c2d30]">
          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
              className="bg-[#f0f4f9] dark:bg-[#282a2c] text-xs text-[#1f1f1f] dark:text-[#c4c7c5] border border-[#e0e2ec] dark:border-[#3c4043] rounded-lg px-2.5 py-1 focus:outline-none"
            >
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => deleteTask(task.id)}
              className="p-1.5 rounded-lg text-[#5f6368] dark:text-[#8e918f] hover:text-[#b3261e] dark:hover:text-[#f28b82] hover:bg-[#f0f4f9] dark:hover:bg-[#282a2c] transition-colors"
              title="Delete task"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={() => setEditingTaskId(null)}
              className="p-1.5 rounded-lg text-[#5f6368] dark:text-[#8e918f] hover:text-[#1f1f1f] dark:hover:text-[#e3e3e3] hover:bg-[#f0f4f9] dark:hover:bg-[#282a2c] transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 custom-scrollbar pr-1">
          {/* Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="Title"
              className="w-full bg-transparent text-lg font-medium text-[#1f1f1f] dark:text-[#e3e3e3] placeholder-[#747775] dark:placeholder-[#8e918f] focus:outline-none leading-snug"
            />
          </div>

          {/* Subject Selector */}
          <div>
            <label className="block text-[11px] font-medium text-[#5f6368] dark:text-[#8e918f] uppercase tracking-wider mb-1.5">
              Course / Lesson (7 Subjects)
            </label>
            <select
              value={subjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full bg-[#f0f4f9] dark:bg-[#282a2c] text-sm text-[#1f1f1f] dark:text-[#e3e3e3] border border-[#e0e2ec] dark:border-[#3c4043] rounded-xl px-3 py-2 focus:outline-none focus:border-[#0b57d0] dark:focus:border-[#8ab4f8]"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id} className="bg-white dark:bg-[#1e1f20] text-[#1f1f1f] dark:text-[#e3e3e3]">
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-[11px] font-medium text-[#5f6368] dark:text-[#8e918f] uppercase tracking-wider mb-1.5">
              Due Date & Time
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-[#f0f4f9] dark:bg-[#282a2c] border border-[#e0e2ec] dark:border-[#3c4043] rounded-xl px-3 py-2 text-sm text-[#1f1f1f] dark:text-[#e3e3e3]">
                <Calendar size={15} className="text-[#5f6368] dark:text-[#8e918f]" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="bg-transparent text-xs text-[#1f1f1f] dark:text-[#e3e3e3] focus:outline-none w-full cursor-pointer"
                />
              </div>

              <div className="w-32 flex items-center gap-2 bg-[#f0f4f9] dark:bg-[#282a2c] border border-[#e0e2ec] dark:border-[#3c4043] rounded-xl px-3 py-2 text-sm text-[#1f1f1f] dark:text-[#e3e3e3]">
                <Clock size={15} className="text-[#5f6368] dark:text-[#8e918f]" />
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="bg-transparent text-xs text-[#1f1f1f] dark:text-[#e3e3e3] focus:outline-none w-full cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Details / Description */}
          <div>
            <label className="block text-[11px] font-medium text-[#5f6368] dark:text-[#8e918f] uppercase tracking-wider mb-1.5">
              Details & Notes
            </label>
            <textarea
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              onBlur={handleDetailsBlur}
              placeholder="Add details, instructions, textbook references..."
              className="w-full bg-[#f0f4f9] dark:bg-[#282a2c] text-sm text-[#1f1f1f] dark:text-[#e3e3e3] placeholder-[#747775] dark:placeholder-[#8e918f] border border-[#e0e2ec] dark:border-[#3c4043] rounded-xl p-3 focus:outline-none focus:border-[#0b57d0] dark:focus:border-[#8ab4f8] resize-none leading-relaxed"
            />
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-[11px] font-medium text-[#5f6368] dark:text-[#8e918f] uppercase tracking-wider mb-2">
              Subtasks ({task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length})
            </label>

            {/* List */}
            <div className="space-y-1.5 mb-2.5">
              {task.subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#f0f4f9] dark:bg-[#282a2c] border border-[#e0e2ec] dark:border-[#3c4043]/50 text-xs"
                >
                  <label className="flex items-center gap-2 cursor-pointer min-w-0 flex-1">
                    <div
                      onClick={() => toggleSubtask(task.id, st.id)}
                      className={`w-4 h-4 rounded-full border border-[#747775] dark:border-[#8e918f] flex items-center justify-center cursor-pointer shrink-0 ${
                        st.completed ? 'bg-[#0b57d0] dark:bg-[#8ab4f8] border-transparent' : ''
                      }`}
                    >
                      {st.completed && <Check size={10} className="text-white dark:text-[#131314] stroke-[3]" />}
                    </div>
                    <span
                      className={`truncate ${
                        st.completed ? 'line-through text-[#747775] dark:text-[#8e918f]' : 'text-[#1f1f1f] dark:text-[#e3e3e3]'
                      }`}
                    >
                      {st.title}
                    </span>
                  </label>

                  <button
                    onClick={() => deleteSubtask(task.id, st.id)}
                    className="text-[#747775] dark:text-[#8e918f] hover:text-[#b3261e] dark:hover:text-[#f28b82] p-1"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Subtask Form */}
            <form onSubmit={handleAddSubtaskSubmit} className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add subtask..."
                className="flex-1 bg-[#f0f4f9] dark:bg-[#282a2c] border border-[#e0e2ec] dark:border-[#3c4043] rounded-xl px-3 py-1.5 text-xs text-[#1f1f1f] dark:text-[#e3e3e3] placeholder-[#747775] dark:placeholder-[#8e918f] focus:outline-none focus:border-[#0b57d0] dark:focus:border-[#8ab4f8]"
              />
              <button
                type="submit"
                disabled={!newSubtaskTitle.trim()}
                className="px-3 py-1.5 rounded-xl bg-[#e0e2ec] dark:bg-[#3c4043] hover:bg-[#c4c7c5] dark:hover:bg-[#5f6368] disabled:opacity-40 text-xs text-[#1f1f1f] dark:text-white font-medium transition-colors"
              >
                Add
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
});
