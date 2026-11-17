export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export type Theme = 'dark' | 'light';

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  colorDark: string;
  colorLight: string;
  instructor?: string;
  room?: string;
  scheduleTime?: string;
}

export interface HomeworkTask {
  id: string;
  subjectId: string;
  title: string;
  details?: string;
  status: TaskStatus;
  dayOfWeek?: DayOfWeek | null;
  subtasks: SubTask[];
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export type ViewMode = 'status_board' | 'subject_lists' | 'calendar';
