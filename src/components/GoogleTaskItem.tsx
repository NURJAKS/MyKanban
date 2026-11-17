import React, { memo } from 'react';
import { HomeworkTask } from '../types';
import { useKanban } from '../context/KanbanContext';
import { Check, GripVertical, ListTodo, ChevronRight, Copy } from 'lucide-react';

interface GoogleTaskItemProps {
  task: HomeworkTask;
  dragType?: 'status' | 'subject';
}

export const GoogleTaskItem: React.FC<GoogleTaskItemProps> = memo(({ task }) => {
  const {
    getSubjectById,
    getSubjectColor,
    toggleTaskComplete,
    setEditingTaskId,
    setDuplicatingTaskId,
    setDraggedTaskId,
    draggedTaskId,
  } = useKanban();

  const subject = getSubjectById(task.subjectId);
  const color = getSubjectColor(subject);
  const isDragging = draggedTaskId === task.id;

  const totalSubtasks = task.subtasks.length;
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    requestAnimationFrame(() => {
      setDraggedTaskId(task.id);
    });
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => setEditingTaskId(task.id)}
      className={`group flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer select-none ${
        isDragging
          ? 'gtasks-dragging border-[#0b57d0] dark:border-[#8ab4f8] bg-[#f0f4f9] dark:bg-[#1e1f20]'
          : task.completed
          ? 'bg-[#f0f4f9]/70 dark:bg-[#18191a]/80 border-transparent hover:border-[#e0e2ec] dark:hover:border-[#3c4043]'
          : 'bg-white dark:bg-[#1e1f20] border-[#e0e2ec] dark:border-[#2c2d30] hover:border-[#c4c7c5] dark:hover:border-[#3c4043] hover:bg-[#f8fafd] dark:hover:bg-[#25272a] shadow-sm dark:shadow-none'
      }`}
    >
      {/* Drag handle */}
      <div
        className="opacity-0 group-hover:opacity-60 transition-opacity mt-0.5 cursor-grab active:cursor-grabbing text-[#747775] dark:text-[#8e918f] -ml-1 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={16} />
      </div>

      {/* Google Tasks Checkbox Circle */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          toggleTaskComplete(task.id);
        }}
        className={`gtasks-check-circle mt-0.5 ${task.completed ? 'checked' : ''}`}
        title={task.completed ? 'Mark uncompleted' : 'Mark completed'}
      >
        {task.completed && <Check size={12} className="text-white dark:text-[#131314] stroke-[3]" />}
      </div>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-sm leading-snug break-words ${
              task.completed
                ? 'line-through text-[#747775] dark:text-[#8e918f]'
                : 'text-[#1f1f1f] dark:text-[#e3e3e3] group-hover:text-black dark:group-hover:text-white'
            }`}
          >
            {task.title}
          </span>
        </div>

        {/* Details snippet */}
        {task.details && (
          <p
            className={`text-xs mt-1 line-clamp-1 leading-relaxed ${
              task.completed ? 'text-[#747775] dark:text-[#5f6368]' : 'text-[#444746] dark:text-[#9aa0a6]'
            }`}
          >
            {task.details}
          </p>
        )}

        {/* Chips row: Subject, Weekday, Subtasks */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {/* Subject chip */}
          {subject && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#f0f4f9] dark:bg-[#282a2c] text-[#444746] dark:text-[#c4c7c5] border border-[#e0e2ec] dark:border-[#3c4043]/50">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="truncate max-w-[120px]">{subject.name}</span>
            </span>
          )}

          {/* Day of week chip */}
          {task.dayOfWeek && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium text-[#0b57d0] dark:text-[#8ab4f8] bg-[#d3e3fd]/60 dark:bg-[#8ab4f8]/10 border border-[#a8c7fa]/60 dark:border-[#8ab4f8]/25">
              {task.dayOfWeek}
            </span>
          )}

          {/* Subtasks chip */}
          {totalSubtasks > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] bg-[#f0f4f9] dark:bg-[#282a2c] text-[#5f6368] dark:text-[#9aa0a6] border border-[#e0e2ec] dark:border-[#3c4043]/50 font-mono">
              <ListTodo size={11} />
              <span>
                {completedSubtasks}/{totalSubtasks}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Duplicate & Edit actions on hover */}
      <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setDuplicatingTaskId(task.id);
          }}
          className="opacity-50 sm:opacity-0 sm:group-hover:opacity-80 hover:!opacity-100 p-1 rounded-lg text-[#5f6368] dark:text-[#8e918f] hover:text-[#0b57d0] dark:hover:text-[#8ab4f8] hover:bg-[#f0f4f9] dark:hover:bg-[#282a2c] transition-all"
          title="Duplicate to lessons"
        >
          <Copy size={13} />
        </button>
        <div className="opacity-0 group-hover:opacity-60 transition-opacity text-[#747775] dark:text-[#8e918f]">
          <ChevronRight size={16} />
        </div>
      </div>
    </div>
  );
});
