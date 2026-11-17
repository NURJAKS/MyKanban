import React, { useState, memo } from 'react';
import { useKanban } from '../context/KanbanContext';
import { DayOfWeek, HomeworkTask } from '../types';
import { QuickAddBar } from './QuickAddBar';
import { Check, GripVertical, Copy } from 'lucide-react';

interface DayColumnDef {
  day: DayOfWeek;
  label: string;
  isToday: boolean;
  classes: { subjectId: string; type: string; room: string }[];
}

const JS_DAY_TO_WEEKDAY: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const WEEK_DAYS: { day: DayOfWeek; label: string }[] = [
  { day: 'Mon', label: 'MON' },
  { day: 'Tue', label: 'TUE' },
  { day: 'Wed', label: 'WED' },
  { day: 'Thu', label: 'THU' },
  { day: 'Fri', label: 'FRI' },
  { day: 'Sat', label: 'SAT' },
  { day: 'Sun', label: 'SUN' },
];

const TIMETABLE_BY_DAY: Record<DayOfWeek, { subjectId: string; type: string; room: string }[]> = {
  Mon: [
    { subjectId: 'subj-1', type: 'Lecture', room: 'Aud. 104' },
    { subjectId: 'subj-3', type: 'Lecture', room: 'Room 208' },
    { subjectId: 'subj-7', type: 'Lab', room: 'Lab 102' },
  ],
  Tue: [
    { subjectId: 'subj-2', type: 'Lecture', room: 'Lab 310' },
    { subjectId: 'subj-4', type: 'Lecture', room: 'Lab 204' },
  ],
  Wed: [
    { subjectId: 'subj-1', type: 'Seminar', room: 'Aud. 104' },
    { subjectId: 'subj-5', type: 'Lecture', room: 'Studio 501' },
    { subjectId: 'subj-6', type: 'Lecture', room: 'Sec Lab 4B' },
  ],
  Thu: [
    { subjectId: 'subj-2', type: 'Lab', room: 'Lab 310' },
    { subjectId: 'subj-4', type: 'Practice', room: 'Lab 204' },
    { subjectId: 'subj-7', type: 'Practice', room: 'Lab 102' },
  ],
  Fri: [
    { subjectId: 'subj-5', type: 'Lab', room: 'Studio 501' },
    { subjectId: 'subj-3', type: 'Practice', room: 'Room 208' },
    { subjectId: 'subj-6', type: 'Lab', room: 'Sec Lab 4B' },
  ],
  Sat: [],
  Sun: [],
};

export const CalendarView: React.FC = memo(() => {
  const {
    getFilteredTasks,
    getSubjectById,
    getSubjectColor,
    toggleTaskComplete,
    setEditingTaskId,
    setDuplicatingTaskId,
    moveTaskToDay,
    setDraggedTaskId,
    draggedTaskId,
  } = useKanban();

  const [activeDropDay, setActiveDropDay] = useState<DayOfWeek | 'unscheduled' | null>(null);
  const [mobileSelectedDay, setMobileSelectedDay] = useState<DayOfWeek | 'all'>('all');
  const tasks = getFilteredTasks();
  const todayWeekday = JS_DAY_TO_WEEKDAY[new Date().getDay()];

  const dayColumns: DayColumnDef[] = WEEK_DAYS.map((d) => ({
    day: d.day,
    label: d.label,
    isToday: d.day === todayWeekday,
    classes: TIMETABLE_BY_DAY[d.day],
  }));

  const unscheduledTasks = tasks.filter((t) => !t.dayOfWeek);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    // Defer visual drag state so Chrome captures the drag ghost cleanly without aborting
    requestAnimationFrame(() => {
      setDraggedTaskId(taskId);
    });
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setActiveDropDay(null);
  };

  const handleDragEnter = (e: React.DragEvent, target: DayOfWeek | 'unscheduled') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropDay !== target) {
      setActiveDropDay(target);
    }
  };

  const handleDragOver = (e: React.DragEvent, target: DayOfWeek | 'unscheduled') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropDay !== target) {
      setActiveDropDay(target);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const related = e.relatedTarget as Node | null;
    if (!e.currentTarget.contains(related)) {
      setActiveDropDay(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetDay: DayOfWeek | null) => {
    e.preventDefault();
    setActiveDropDay(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      moveTaskToDay(taskId, targetDay);
    }
  };

  const renderCalendarTask = (task: HomeworkTask) => {
    const subject = getSubjectById(task.subjectId);
    const color = getSubjectColor(subject);
    const isDragging = draggedTaskId === task.id;

    return (
      <div
        key={task.id}
        draggable
        onDragStart={(e) => handleDragStart(e, task.id)}
        onDragEnd={handleDragEnd}
        onClick={() => setEditingTaskId(task.id)}
        className={`group p-2 rounded-xl border transition-all cursor-grab active:cursor-grabbing flex items-start gap-1.5 text-xs select-none ${
          isDragging
            ? 'gtasks-dragging border-[#0b57d0] dark:border-[#8ab4f8] bg-[#f0f4f9] dark:bg-[#1e1f20]'
            : task.completed
            ? 'bg-[#f0f4f9]/70 dark:bg-[#18191a] border-transparent opacity-60'
            : 'bg-white dark:bg-[#1e1f20] border-[#e0e2ec] dark:border-[#2c2d30] hover:border-[#0b57d0]/50 dark:hover:border-[#8ab4f8]/50 shadow-sm dark:shadow-none'
        }`}
      >
        <div
          className="opacity-0 group-hover:opacity-60 transition-opacity mt-0.5 text-[#747775] dark:text-[#8e918f] -ml-0.5 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={12} />
        </div>

        <div
          onClick={(e) => {
            e.stopPropagation();
            toggleTaskComplete(task.id);
          }}
          className={`w-3.5 h-3.5 rounded-full border border-[#747775] dark:border-[#8e918f] flex items-center justify-center shrink-0 mt-0.5 cursor-pointer hover:border-[#1f1f1f] dark:hover:border-[#c4c7c5] ${
            task.completed
              ? 'bg-[#0b57d0] border-[#0b57d0] dark:bg-[#8ab4f8] dark:border-[#8ab4f8]'
              : ''
          }`}
        >
          {task.completed && (
            <Check size={9} className="text-white dark:text-[#131314] stroke-[3]" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <span
            className={`block leading-snug text-[11px] break-words ${
              task.completed
                ? 'line-through text-[#747775] dark:text-[#8e918f]'
                : 'text-[#1f1f1f] dark:text-[#e3e3e3]'
            }`}
          >
            {task.title}
          </span>
          {subject && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-medium mt-1"
              style={{ color }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              {subject.name}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setDuplicatingTaskId(task.id);
          }}
          className="opacity-0 group-hover:opacity-80 hover:!opacity-100 p-1 rounded-md text-[#5f6368] dark:text-[#8e918f] hover:text-[#0b57d0] dark:hover:text-[#8ab4f8] hover:bg-[#f0f4f9] dark:hover:bg-[#282a2c] transition-all shrink-0"
          title="Duplicate to lessons"
        >
          <Copy size={11} />
        </button>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col gap-3 pb-6">
      {/* Unscheduled / Backlog Drop Tray (only shown when unscheduled tasks exist so layout never jumps on dragStart) */}
      {unscheduledTasks.length > 0 && (
        <div
          onDragEnter={(e) => handleDragEnter(e, 'unscheduled')}
          onDragOver={(e) => handleDragOver(e, 'unscheduled')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, null)}
          className={`rounded-2xl border p-3 transition-colors ${
            activeDropDay === 'unscheduled'
              ? 'gtasks-drop-target bg-[#f0f4f9] dark:bg-[#1e1f20]'
              : 'bg-white dark:bg-[#18191a] border-[#e0e2ec] dark:border-[#282a2c]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5f6368] dark:text-[#8e918f]">
              Unscheduled ({unscheduledTasks.length}) — drag onto a day below
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {unscheduledTasks.map((task) => (
              <div key={task.id} className="w-full sm:w-[220px]">
                {renderCalendarTask(task)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Weekday Quick-Jump Filter (< md) */}
      <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        <button
          onClick={() => setMobileSelectedDay('all')}
          className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 border transition-colors ${
            mobileSelectedDay === 'all'
              ? 'bg-[#d3e3fd] text-[#0b57d0] border-[#a8c7fa] dark:bg-[#8ab4f8]/15 dark:text-[#8ab4f8] dark:border-[#8ab4f8]/40'
              : 'bg-white dark:bg-[#1e1f20] text-[#5f6368] dark:text-[#8e918f] border-[#e0e2ec] dark:border-[#282a2c]'
          }`}
        >
          All Week
        </button>
        {dayColumns.map((col) => {
          const count = tasks.filter((t) => t.dayOfWeek === col.day).length;
          const isSelected = mobileSelectedDay === col.day;
          return (
            <button
              key={col.day}
              onClick={() => setMobileSelectedDay(isSelected ? 'all' : col.day)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 border transition-colors flex items-center gap-1 ${
                isSelected
                  ? 'bg-[#0b57d0] text-white border-[#0b57d0] dark:bg-[#8ab4f8] dark:text-[#131314] dark:border-[#8ab4f8]'
                  : col.isToday
                  ? 'bg-[#d3e3fd]/40 dark:bg-[#8ab4f8]/10 text-[#0b57d0] dark:text-[#8ab4f8] border-[#a8c7fa]/60 dark:border-[#8ab4f8]/30'
                  : 'bg-white dark:bg-[#1e1f20] text-[#5f6368] dark:text-[#8e918f] border-[#e0e2ec] dark:border-[#282a2c]'
              }`}
            >
              <span>{col.day}</span>
              {count > 0 && <span className="text-[10px] font-mono opacity-80">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Weekly 7-Day Grid (stacked vertically on mobile, 7-column grid on desktop) */}
      <div className="flex-1 md:overflow-x-auto">
        <div className="flex flex-col gap-3 md:gap-0 md:grid md:grid-cols-7 md:min-w-[1000px] md:border md:border-[#e0e2ec] md:dark:border-[#282a2c] md:rounded-2xl md:bg-white md:dark:bg-[#18191a] md:overflow-hidden md:shadow-sm md:min-h-[520px]">
          {dayColumns.map((col) => {
            const dayTasks = tasks.filter((t) => t.dayOfWeek === col.day);
            const isOver = activeDropDay === col.day;
            const hiddenOnMobile = mobileSelectedDay !== 'all' && mobileSelectedDay !== col.day;

            return (
              <div
                key={col.day}
                onDragEnter={(e) => handleDragEnter(e, col.day)}
                onDragOver={(e) => handleDragOver(e, col.day)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.day)}
                className={`${hiddenOnMobile ? 'hidden md:flex' : 'flex'} w-full md:w-auto flex-col rounded-2xl md:rounded-none border md:border-0 md:border-r border-[#e0e2ec] dark:border-[#282a2c] last:border-r-0 overflow-hidden md:overflow-visible bg-white dark:bg-[#18191a] md:bg-transparent shadow-sm md:shadow-none transition-colors ${
                  isOver
                    ? 'bg-[#d3e3fd]/25 dark:bg-[#8ab4f8]/10'
                    : col.isToday
                    ? 'bg-[#d3e3fd]/[0.06] dark:bg-[#8ab4f8]/[0.02]'
                    : ''
                }`}
              >
                {/* Day Header */}
                <div
                  className={`p-3 text-center border-b border-[#e0e2ec] dark:border-[#282a2c] flex items-center justify-center gap-2 ${
                    col.isToday
                      ? 'bg-[#d3e3fd]/30 dark:bg-[#8ab4f8]/10'
                      : 'bg-[#f8fafd] dark:bg-[#1e1f20]'
                  }`}
                >
                  <span
                    className={`text-xs font-semibold tracking-wider ${
                      col.isToday
                        ? 'text-[#0b57d0] dark:text-[#8ab4f8]'
                        : 'text-[#5f6368] dark:text-[#8e918f]'
                    }`}
                  >
                    {col.label}
                  </span>
                  {col.isToday && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#0b57d0] text-white dark:bg-[#8ab4f8] dark:text-[#131314]">
                      Today
                    </span>
                  )}
                </div>

                {/* Day Content */}
                <div className="p-2 flex-1 flex flex-col gap-2.5">
                  {/* Academic Classes */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#747775] dark:text-[#5f6368] block px-1">
                      Classes
                    </span>
                    {col.classes.length === 0 ? (
                      <span className="text-[11px] text-[#c4c7c5] dark:text-[#3c4043] px-1 block italic">
                        None
                      </span>
                    ) : (
                      col.classes.map((c, idx) => {
                        const subject = getSubjectById(c.subjectId);
                        const color = getSubjectColor(subject);

                        return (
                          <div
                            key={idx}
                            className="p-1.5 rounded-lg border text-xs"
                            style={{
                              backgroundColor: `${color}15`,
                              borderColor: `${color}35`,
                            }}
                          >
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: color }}
                              />
                              <span className="font-semibold text-[#1f1f1f] dark:text-[#e3e3e3] truncate text-[11px]">
                                {subject?.name}
                              </span>
                            </div>
                            <div className="text-[10px] text-[#5f6368] dark:text-[#8e918f] mt-0.5 truncate">
                              {c.type} · {c.room}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Tasks for this day */}
                  <div className="flex-1 flex flex-col gap-1.5 pt-2 border-t border-[#e0e2ec] dark:border-[#282a2c]/60">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5f6368] dark:text-[#8e918f]">
                        Tasks ({dayTasks.length})
                      </span>
                    </div>

                    <QuickAddBar
                      defaultDayOfWeek={col.day}
                      placeholder="Add task"
                      compact
                    />

                    <div className="space-y-1.5 flex-1">
                      {dayTasks.length === 0 ? (
                        <div
                          className={`py-4 text-center text-[11px] rounded-xl border border-dashed transition-colors ${
                            isOver
                              ? 'border-[#0b57d0] dark:border-[#8ab4f8] text-[#0b57d0] dark:text-[#8ab4f8]'
                              : 'border-transparent text-[#c4c7c5] dark:text-[#3c4043]'
                          }`}
                        >
                          {isOver ? 'Drop here' : 'No tasks'}
                        </div>
                      ) : (
                        dayTasks.map(renderCalendarTask)
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
