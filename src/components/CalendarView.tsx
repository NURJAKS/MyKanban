import React, { memo } from 'react';
import { useKanban } from '../context/KanbanContext';
import { Check } from 'lucide-react';

interface DayColumn {
  dayName: string;
  dayShort: string;
  dateStr: string;
  dayNumber: number;
  isToday: boolean;
  classes: { time: string; subjectId: string; type: string; room: string }[];
}

export const CalendarView: React.FC = memo(() => {
  const { tasks, getSubjectById, getSubjectColor, toggleTaskComplete, setEditingTaskId } = useKanban();

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const dayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon, ...
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const baseMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);

  const timetableByDay: Record<number, { time: string; subjectId: string; type: string; room: string }[]> = {
    0: [
      { time: '09:00 - 10:30', subjectId: 'subj-1', type: 'Lecture', room: 'Aud. 104' },
      { time: '12:30 - 14:00', subjectId: 'subj-3', type: 'Lecture', room: 'Room 208' },
      { time: '14:15 - 15:45', subjectId: 'subj-7', type: 'Lab', room: 'Lab 102' },
    ],
    1: [
      { time: '09:00 - 10:30', subjectId: 'subj-2', type: 'Lecture', room: 'Lab 310' },
      { time: '10:45 - 12:15', subjectId: 'subj-4', type: 'Lecture', room: 'Lab 204' },
    ],
    2: [
      { time: '09:00 - 10:30', subjectId: 'subj-1', type: 'Seminar', room: 'Aud. 104' },
      { time: '10:45 - 12:15', subjectId: 'subj-5', type: 'Lecture', room: 'Studio 501' },
      { time: '14:15 - 15:45', subjectId: 'subj-6', type: 'Lecture', room: 'Sec Lab 4B' },
    ],
    3: [
      { time: '09:00 - 10:30', subjectId: 'subj-2', type: 'Lab', room: 'Lab 310' },
      { time: '10:45 - 12:15', subjectId: 'subj-4', type: 'Practice', room: 'Lab 204' },
      { time: '14:15 - 15:45', subjectId: 'subj-7', type: 'Practice', room: 'Lab 102' },
    ],
    4: [
      { time: '10:45 - 12:15', subjectId: 'subj-5', type: 'Lab', room: 'Studio 501' },
      { time: '12:30 - 14:00', subjectId: 'subj-3', type: 'Practice', room: 'Room 208' },
      { time: '14:15 - 15:45', subjectId: 'subj-6', type: 'Lab', room: 'Sec Lab 4B' },
    ],
    5: [],
    6: [],
  };

  const dayColumns: DayColumn[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(baseMonday);
    d.setDate(baseMonday.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const isToday = dateStr === todayStr;

    return {
      dayName: d.toLocaleDateString('en-US', { weekday: 'long' }),
      dayShort: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      dayNumber: d.getDate(),
      dateStr,
      isToday,
      classes: timetableByDay[i] || [],
    };
  });

  return (
    <div className="flex-1 overflow-x-auto pb-6">
      <div className="min-w-[1000px] border border-[#e0e2ec] dark:border-[#282a2c] rounded-2xl bg-white dark:bg-[#18191a] overflow-hidden flex flex-col shadow-sm">
        {/* Day Header Row */}
        <div className="grid grid-cols-7 border-b border-[#e0e2ec] dark:border-[#282a2c] bg-[#f8fafd] dark:bg-[#1e1f20]">
          {dayColumns.map((col) => (
            <div
              key={col.dateStr}
              className={`p-3 text-center border-r border-[#e0e2ec] dark:border-[#282a2c] last:border-r-0 ${
                col.isToday ? 'bg-[#d3e3fd]/20 dark:bg-[#8ab4f8]/5' : ''
              }`}
            >
              <div className="text-[11px] font-medium text-[#5f6368] dark:text-[#8e918f] tracking-wider mb-1">
                {col.dayShort}
              </div>
              <div className="inline-flex items-center justify-center">
                <span
                  className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center ${
                    col.isToday
                      ? 'bg-[#0b57d0] text-white dark:bg-[#8ab4f8] dark:text-[#131314]'
                      : 'text-[#1f1f1f] dark:text-[#e3e3e3]'
                  }`}
                >
                  {col.dayNumber}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Calendar Body: Classes & Deadlines */}
        <div className="grid grid-cols-7 min-h-[480px]">
          {dayColumns.map((col) => {
            const dayTasks = tasks.filter((t) => t.dueDate === col.dateStr);

            return (
              <div
                key={col.dateStr}
                className={`p-2 border-r border-[#e0e2ec] dark:border-[#282a2c] last:border-r-0 space-y-2.5 ${
                  col.isToday ? 'bg-[#d3e3fd]/[0.06] dark:bg-[#8ab4f8]/[0.02]' : ''
                }`}
              >
                {/* Academic Classes */}
                <div className="space-y-1.5">
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
                              {subject?.code}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#5f6368] dark:text-[#8e918f] mt-0.5 truncate">
                            {c.time.split('-')[0].trim()} · {c.room}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Homework Deadlines */}
                <div className="space-y-1 pt-2 border-t border-[#e0e2ec] dark:border-[#282a2c]/60">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5f6368] dark:text-[#8e918f] block px-1">
                    Homework Due ({dayTasks.length})
                  </span>

                  {dayTasks.length === 0 ? (
                    <span className="text-[11px] text-[#c4c7c5] dark:text-[#3c4043] px-1 block">
                      No due dates
                    </span>
                  ) : (
                    dayTasks.map((task) => {
                      const subject = getSubjectById(task.subjectId);
                      const color = getSubjectColor(subject);

                      return (
                        <div
                          key={task.id}
                          onClick={() => setEditingTaskId(task.id)}
                          className={`group p-1.5 rounded-lg border transition-all cursor-pointer flex items-start gap-1.5 text-xs ${
                            task.completed
                              ? 'bg-[#f0f4f9] dark:bg-[#18191a] border-transparent opacity-60'
                              : 'bg-white dark:bg-[#1e1f20] border-[#e0e2ec] dark:border-[#2c2d30] hover:border-[#0b57d0]/50 dark:hover:border-[#8ab4f8]/50 shadow-sm dark:shadow-none'
                          }`}
                        >
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
                              className={`block leading-tight text-[11px] truncate ${
                                task.completed
                                  ? 'line-through text-[#747775] dark:text-[#8e918f]'
                                  : 'text-[#1f1f1f] dark:text-[#e3e3e3]'
                              }`}
                            >
                              {task.title}
                            </span>
                            <span
                              className="inline-block text-[9px] font-medium mt-0.5"
                              style={{ color }}
                            >
                              {subject?.code} {task.dueTime ? `· ${task.dueTime}` : ''}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
