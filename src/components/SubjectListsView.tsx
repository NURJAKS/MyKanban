import React, { useState, memo } from 'react';
import { useKanban } from '../context/KanbanContext';
import { GoogleTaskItem } from './GoogleTaskItem';
import { QuickAddBar } from './QuickAddBar';
import { MapPin, Clock } from 'lucide-react';

export const SubjectListsView: React.FC = memo(() => {
  const { subjects, getFilteredTasks, moveTaskToSubject, getSubjectColor, draggedTaskId } = useKanban();
  const tasks = getFilteredTasks();
  const [activeDropSubject, setActiveDropSubject] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent, subjId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropSubject !== subjId) {
      setActiveDropSubject(subjId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const related = e.relatedTarget as Node | null;
    if (!e.currentTarget.contains(related)) {
      setActiveDropSubject(null);
    }
  };

  const handleDrop = (e: React.DragEvent, subjId: string) => {
    e.preventDefault();
    setActiveDropSubject(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      moveTaskToSubject(taskId, subjId);
    }
  };

  return (
    <div className="flex-1 overflow-x-auto pb-6 snap-x snap-mandatory md:snap-none">
      <div className="flex items-start gap-3.5 md:min-w-[1850px] h-full">
        {subjects.map((subject) => {
          const subjectTasks = tasks.filter((t) => t.subjectId === subject.id);
          const activeTasks = subjectTasks.filter((t) => !t.completed);
          const isOver = activeDropSubject === subject.id;
          const color = getSubjectColor(subject);

          return (
            <div
              key={subject.id}
              onDragOver={(e) => handleDragOver(e, subject.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, subject.id)}
              className={`snap-center w-[84vw] sm:w-[260px] shrink-0 rounded-2xl p-3 border transition-colors flex flex-col max-h-[calc(100vh-210px)] ${
                isOver
                  ? 'gtasks-drop-target bg-[#f0f4f9] dark:bg-[#1e1f20]'
                  : 'bg-[#f8fafd] dark:bg-[#18191a] border-[#e0e2ec] dark:border-[#282a2c]'
              }`}
            >
              {/* List Header */}
              <div className="pb-2.5 mb-2 px-1 border-b border-[#e0e2ec] dark:border-[#282a2c]">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <h3 className="text-sm font-semibold text-[#1f1f1f] dark:text-[#e3e3e3] truncate">
                      {subject.name}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-[#5f6368] dark:text-[#8e918f] bg-white dark:bg-[#282a2c] px-2 py-0.5 rounded-full shrink-0 border border-[#e0e2ec] dark:border-transparent">
                    {activeTasks.length}
                  </span>
                </div>

                {/* Subtitle with schedule & room */}
                <div className="flex items-center gap-2 text-[11px] text-[#5f6368] dark:text-[#8e918f] mt-1.5">
                  {subject.room && (
                    <span className="flex items-center gap-0.5 truncate">
                      <MapPin size={10} className="shrink-0" />
                      {subject.room}
                    </span>
                  )}
                  {subject.scheduleTime && (
                    <span className="flex items-center gap-0.5 truncate">
                      <Clock size={10} className="shrink-0" />
                      {subject.scheduleTime}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Add Bar for this Subject */}
              <div className="mb-2.5">
                <QuickAddBar
                  defaultSubjectId={subject.id}
                  placeholder={`+ Add task for ${subject.code}`}
                />
              </div>

              {/* Tasks List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-[120px]">
                {subjectTasks.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#747775] dark:text-[#5f6368]">
                    No homework assigned
                  </div>
                ) : (
                  subjectTasks.map((task) => (
                    <GoogleTaskItem key={task.id} task={task} dragType="subject" />
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
