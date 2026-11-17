import React, { useState, memo } from 'react';
import { useKanban } from '../context/KanbanContext';
import { TaskStatus } from '../types';
import { GoogleTaskItem } from './GoogleTaskItem';
import { QuickAddBar } from './QuickAddBar';
import { Circle, Clock, CheckCircle2, LucideIcon } from 'lucide-react';

interface ColumnDef {
  id: TaskStatus;
  title: string;
  icon: LucideIcon;
  iconClass: string;
}

const COLUMNS: ColumnDef[] = [
  { id: 'todo', title: 'To do', icon: Circle, iconClass: 'text-[#747775] dark:text-[#8e918f]' },
  { id: 'in_progress', title: 'In progress', icon: Clock, iconClass: 'text-[#0b57d0] dark:text-[#8ab4f8]' },
  { id: 'completed', title: 'Completed', icon: CheckCircle2, iconClass: 'text-[#137333] dark:text-[#81c995]' },
];

export const StatusBoardView: React.FC = memo(() => {
  const { getFilteredTasks, moveTaskToStatus, draggedTaskId } = useKanban();
  const tasks = getFilteredTasks();
  const [activeDropColumn, setActiveDropColumn] = useState<TaskStatus | null>(null);

  const handleDragOver = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropColumn !== colId) {
      setActiveDropColumn(colId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const related = e.relatedTarget as Node | null;
    if (!e.currentTarget.contains(related)) {
      setActiveDropColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    setActiveDropColumn(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      moveTaskToStatus(taskId, colId);
    }
  };

  return (
    <div className="flex-1 overflow-x-auto pb-6 snap-x snap-mandatory md:snap-none">
      <div className="flex items-start gap-4 md:min-w-[900px] h-full">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          const Icon = col.icon;
          const isOver = activeDropColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`snap-center shrink-0 w-[86vw] sm:w-auto sm:flex-1 min-w-[280px] max-w-[420px] rounded-2xl p-3 border transition-colors flex flex-col max-h-[calc(100vh-210px)] ${
                isOver
                  ? 'gtasks-drop-target bg-[#f0f4f9] dark:bg-[#1e1f20]'
                  : 'bg-[#f8fafd] dark:bg-[#18191a] border-[#e0e2ec] dark:border-[#282a2c]'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-2 px-1">
                <div className="flex items-center gap-2">
                  <Icon size={16} className={col.iconClass} />
                  <h3 className="text-sm font-semibold text-[#1f1f1f] dark:text-[#e3e3e3]">{col.title}</h3>
                </div>
                <span className="text-xs font-mono text-[#5f6368] dark:text-[#8e918f] bg-white dark:bg-[#282a2c] px-2 py-0.5 rounded-full border border-[#e0e2ec] dark:border-transparent">
                  {colTasks.length}
                </span>
              </div>

              {/* Quick Add at top of column */}
              <div className="mb-3">
                <QuickAddBar defaultStatus={col.id} placeholder={`Add task to ${col.title}`} />
              </div>

              {/* Tasks List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-[120px]">
                {colTasks.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#747775] dark:text-[#5f6368]">
                    No tasks in {col.title}
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <GoogleTaskItem key={task.id} task={task} dragType="status" />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
