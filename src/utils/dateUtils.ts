import { DayOfWeek } from '../types';

export const WEEKDAYS_BY_JS_DAY: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export interface CalendarDayInfo {
  date: Date;
  dateStr: string;
  day: DayOfWeek;
  dayNum: number;
  monthName: string;
  isToday: boolean;
}

export function formatDateISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

export function getDayOfWeekFromDate(d: Date): DayOfWeek {
  return WEEKDAYS_BY_JS_DAY[d.getDay()];
}

export function getMondayOfWeek(baseDate: Date, weekOffset: number = 0): Date {
  const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 12, 0, 0);
  const day = d.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const distanceToMonday = (day + 6) % 7;
  d.setDate(d.getDate() - distanceToMonday + weekOffset * 7);
  return d;
}

export function getWeekDays(monday: Date): CalendarDayInfo[] {
  const now = new Date();
  const todayStr = formatDateISO(now);

  const days: CalendarDayInfo[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i, 12, 0, 0);
    const dateStr = formatDateISO(d);
    days.push({
      date: d,
      dateStr,
      day: WEEKDAYS_BY_JS_DAY[d.getDay()],
      dayNum: d.getDate(),
      monthName: d.toLocaleString('en-US', { month: 'short' }),
      isToday: dateStr === todayStr,
    });
  }
  return days;
}

export function formatWeekHeader(monday: Date): { title: string; subtitle: string } {
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6, 12, 0, 0);
  const startMonthLong = monday.toLocaleString('en-US', { month: 'long' });
  const startMonthShort = monday.toLocaleString('en-US', { month: 'short' });
  const endMonthLong = sunday.toLocaleString('en-US', { month: 'long' });
  const endMonthShort = sunday.toLocaleString('en-US', { month: 'short' });
  const startYear = monday.getFullYear();
  const endYear = sunday.getFullYear();

  let title = '';
  let subtitle = '';

  if (startYear === endYear) {
    if (startMonthLong === endMonthLong) {
      title = `${startMonthLong} ${startYear}`;
      subtitle = `${startMonthShort} ${monday.getDate()} – ${sunday.getDate()}, ${startYear}`;
    } else {
      title = `${startMonthShort} – ${endMonthShort} ${startYear}`;
      subtitle = `${startMonthShort} ${monday.getDate()} – ${endMonthShort} ${sunday.getDate()}, ${startYear}`;
    }
  } else {
    title = `${startMonthShort} ${startYear} – ${endMonthShort} ${endYear}`;
    subtitle = `${startMonthShort} ${monday.getDate()}, ${startYear} – ${endMonthShort} ${sunday.getDate()}, ${endYear}`;
  }

  return { title, subtitle };
}

export function formatTaskDateBadge(dueDate?: string | null, dayOfWeek?: DayOfWeek | null): {
  label: string;
  isToday?: boolean;
  isTomorrow?: boolean;
  isOverdue?: boolean;
} | null {
  if (!dueDate && !dayOfWeek) return null;

  if (!dueDate) {
    return { label: dayOfWeek || '' };
  }

  const now = new Date();
  const todayStr = formatDateISO(now);
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 12, 0, 0);
  const tomorrowStr = formatDateISO(tomorrow);

  if (dueDate === todayStr) {
    return { label: 'Today', isToday: true };
  }
  if (dueDate === tomorrowStr) {
    return { label: 'Tomorrow', isTomorrow: true };
  }
  if (dueDate < todayStr) {
    const parsed = parseDateISO(dueDate);
    const label = `${WEEKDAYS_BY_JS_DAY[parsed.getDay()]}, ${parsed.toLocaleString('en-US', { month: 'short' })} ${parsed.getDate()}`;
    return { label, isOverdue: true };
  }

  const parsed = parseDateISO(dueDate);
  const label = `${WEEKDAYS_BY_JS_DAY[parsed.getDay()]}, ${parsed.toLocaleString('en-US', { month: 'short' })} ${parsed.getDate()}`;
  return { label };
}
