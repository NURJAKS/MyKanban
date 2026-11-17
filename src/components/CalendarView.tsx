import React, { useState, useRef, memo } from 'react';
import { useKanban } from '../context/KanbanContext';
import { DayOfWeek, HomeworkTask } from '../types';
import { QuickAddBar } from './QuickAddBar';
import { Check, GripVertical, Copy, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import {
  getMondayOfWeek,
  getWeekDays,
  formatWeekHeader,
  CalendarDayInfo,
} from '../utils/dateUtils';

const isTaskForCalendarDay = (
  task: HomeworkTask,
  col: CalendarDayInfo,
  isCurrentWeek: boolean
): boolean => {
  if (task.dueDate) {
    return task.dueDate === col.dateStr;
  }
  // Backwards compatibility for legacy tasks that only have dayOfWeek
  return isCurrentWeek && task.dayOfWeek === col.day;
};

export const CalendarView: React.FC = memo(() => {
  const {
    getFilteredTasks,
    getSubjectById,
    getSubjectColor,
    toggleTaskComplete,
    setEditingTaskId,
    setDuplicatingTaskId,
    moveTaskToDate,
    setDraggedTaskId,
    draggedTaskId,
  } = useKanban();

  const [weekOffset, setWeekOffset] = useState(0);
  const [activeDropDate, setActiveDropDate] = useState<string | 'unscheduled' | null>(null);
  const [mobileSelectedDay, setMobileSelectedDay] = useState<DayOfWeek | 'all'>('all');

  // Touch swipe tracking for horizontal week navigation
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const tasks = getFilteredTasks();
  const isCurrentWeek = weekOffset === 0;
  const monday = getMondayOfWeek(new Date(), weekOffset);
  const dayColumns = getWeekDays(monday);
  const { title: monthTitle, subtitle: rangeSubtitle } = formatWeekHeader(monday);

  const unscheduledTasks = tasks.filter((t) => !t.dueDate && !t.dayOfWeek);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length !== 1) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    // Trigger week switch only on clear horizontal swipe
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) {
        setWeekOffset((prev) => prev + 1);
      } else {
        setWeekOffset((prev) => prev - 1);
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    requestAnimationFrame(() => {
      setDraggedTaskId(taskId);
    });
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setActiveDropDate(null);
  };

  const handleDragEnter = (e: React.DragEvent, target: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropDate !== target) {
      setActiveDropDate(target);
    }
  };

  const handleDragOver = (e: React.DragEvent, target: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropDate !== target) {
      setActiveDropDate(target);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const related = e.relatedTarget as Node | null;
    if (!e.currentTarget.contains(related)) {
      setActiveDropDate(null);
    }
  };

  const handleDropOnDay = (e: React.DragEvent, col: CalendarDayInfo | null) => {
    e.preventDefault();
    setActiveDropDate(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      if (col) {
        moveTaskToDate(taskId, col.dateStr, col.day);
      } else {
        moveTaskToDate(taskId, null, null);
      }
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
    <div
      className="flex-1 flex flex-col gap-3 pb-6"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Google Calendar Style Week Navigation Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#18191a] border border-[#e0e2ec] dark:border-[#282a2c] rounded-2xl px-4 py-2.5 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setWeekOffset(0)}
            disabled={isCurrentWeek}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              isCurrentWeek
                ? 'bg-[#d3e3fd]/40 dark:bg-[#8ab4f8]/10 text-[#0b57d0] dark:text-[#8ab4f8] border-[#a8c7fa]/60 dark:border-[#8ab4f8]/30'
                : 'bg-[#f8fafd] dark:bg-[#1e1f20] text-[#1f1f1f] dark:text-[#e3e3e3] border-[#e0e2ec] dark:border-[#3c4043] hover:bg-[#f0f4f9] dark:hover:bg-[#282a2c]'
            }`}
          >
            Today
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setWeekOffset((prev) => prev - 1)}
              className="p-1.5 rounded-full text-[#5f6368] dark:text-[#c4c7c5] hover:bg-[#f0f4f9] dark:hover:bg-[#282a2c] transition-colors"
              title="Previous week"
              aria-label="Previous week"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => setWeekOffset((prev) => prev + 1)}
              className="p-1.5 rounded-full text-[#5f6368] dark:text-[#c4c7c5] hover:bg-[#f0f4f9] dark:hover:bg-[#282a2c] transition-colors"
              title="Next week"
              aria-label="Next week"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex items-baseline gap-2.5 ml-1">
            <h2 className="text-sm sm:text-base font-semibold text-[#1f1f1f] dark:text-[#e3e3e3] tracking-tight">
              {monthTitle}
            </h2>
            <span className="text-xs text-[#5f6368] dark:text-[#8e918f] hidden sm:inline font-mono">
              {rangeSubtitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#5f6368] dark:text-[#8e918f]">
          <CalendarIcon size={13} className="text-[#0b57d0] dark:text-[#8ab4f8]" />
          <span className="hidden sm:inline">
            {weekOffset === 0
              ? 'This Week'
              : weekOffset === 1
              ? 'Next Week'
              : weekOffset === -1
              ? 'Last Week'
              : weekOffset > 0
              ? `+${weekOffset} weeks`
              : `${weekOffset} weeks`}
          </span>
          <span className="sm:hidden">{rangeSubtitle}</span>
        </div>
      </div>

      {/* Unscheduled / Backlog Drop Tray */}
      {unscheduledTasks.length > 0 && (
        <div
          onDragEnter={(e) => handleDragEnter(e, 'unscheduled')}
          onDragOver={(e) => handleDragOver(e, 'unscheduled')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDropOnDay(e, null)}
          className={`rounded-2xl border p-3 transition-colors ${
            activeDropDate === 'unscheduled'
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
          const count = tasks.filter((t) => isTaskForCalendarDay(t, col, isCurrentWeek)).length;
          const isSelected = mobileSelectedDay === col.day;
          return (
            <button
              key={col.dateStr}
              onClick={() => setMobileSelectedDay(isSelected ? 'all' : col.day)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 border transition-colors flex items-center gap-1 ${
                isSelected
                  ? 'bg-[#0b57d0] text-white border-[#0b57d0] dark:bg-[#8ab4f8] dark:text-[#131314] dark:border-[#8ab4f8]'
                  : col.isToday
                  ? 'bg-[#d3e3fd]/40 dark:bg-[#8ab4f8]/10 text-[#0b57d0] dark:text-[#8ab4f8] border-[#a8c7fa]/60 dark:border-[#8ab4f8]/30'
                  : 'bg-white dark:bg-[#1e1f20] text-[#5f6368] dark:text-[#8e918f] border-[#e0e2ec] dark:border-[#282a2c]'
              }`}
            >
              <span>
                {col.day} {col.dayNum}
              </span>
              {count > 0 && <span className="text-[10px] font-mono opacity-80">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Weekly 7-Day Grid */}
      <div className="flex-1 md:overflow-x-auto">
        <div className="flex flex-col gap-3 md:gap-0 md:grid md:grid-cols-7 md:min-w-[1000px] md:border md:border-[#e0e2ec] md:dark:border-[#282a2c] md:rounded-2xl md:bg-white md:dark:bg-[#18191a] md:overflow-hidden md:shadow-sm md:min-h-[520px]">
          {dayColumns.map((col, idx) => {
            const dayTasks = tasks.filter((t) => isTaskForCalendarDay(t, col, isCurrentWeek));
            const isOver = activeDropDate === col.dateStr;
            const hiddenOnMobile = mobileSelectedDay !== 'all' && mobileSelectedDay !== col.day;
            const showMonthTag = col.dayNum === 1 || idx === 0;

            return (
              <div
                key={col.dateStr}
                onDragEnter={(e) => handleDragEnter(e, col.dateStr)}
                onDragOver={(e) => handleDragOver(e, col.dateStr)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDropOnDay(e, col)}
                className={`${hiddenOnMobile ? 'hidden md:flex' : 'flex'} w-full md:w-auto flex-col rounded-2xl md:rounded-none border md:border-0 md:border-r border-[#e0e2ec] dark:border-[#282a2c] last:border-r-0 overflow-hidden md:overflow-visible bg-white dark:bg-[#18191a] md:bg-transparent shadow-sm md:shadow-none transition-colors ${
                  isOver
                    ? 'bg-[#d3e3fd]/25 dark:bg-[#8ab4f8]/10'
                    : col.isToday
                    ? 'bg-[#d3e3fd]/[0.06] dark:bg-[#8ab4f8]/[0.02]'
                    : ''
                }`}
              >
                {/* Google Calendar Style Day Header */}
                <div
                  className={`py-2.5 px-2 text-center border-b border-[#e0e2ec] dark:border-[#282a2c] flex md:flex-col items-center justify-between md:justify-center gap-1.5 ${
                    col.isToday
                      ? 'bg-[#d3e3fd]/25 dark:bg-[#8ab4f8]/10'
                      : 'bg-[#f8fafd] dark:bg-[#1e1f20]'
                  }`}
                >
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wider ${
                      col.isToday
                        ? 'text-[#0b57d0] dark:text-[#8ab4f8]'
                        : 'text-[#5f6368] dark:text-[#8e918f]'
                    }`}
                  >
                    {col.day}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                        col.isToday
                          ? 'bg-[#0b57d0] text-white dark:bg-[#8ab4f8] dark:text-[#131314] shadow-sm'
                          : 'text-[#1f1f1f] dark:text-[#e3e3e3]'
                      }`}
                    >
                      {col.dayNum}
                    </span>
                    {showMonthTag && (
                      <span className="text-[10px] font-medium text-[#5f6368] dark:text-[#8e918f] md:hidden">
                        {col.monthName}
                      </span>
                    )}
                    {col.dayNum === 1 && (
                      <span className="hidden md:inline text-[10px] font-semibold uppercase text-[#0b57d0] dark:text-[#8ab4f8]">
                        {col.monthName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Day Content */}
                <div className="p-2 flex-1 flex flex-col gap-2">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5f6368] dark:text-[#8e918f]">
                        Tasks ({dayTasks.length})
                      </span>
                    </div>

                    <QuickAddBar
                      defaultDayOfWeek={col.day}
                      defaultDueDate={col.dateStr}
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
