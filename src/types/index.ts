export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export type Theme = 'dark' | 'light';

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskImage {
  id: string;
  name: string;
  dataUrl: string;
  addedAt: string;
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
  dueDate?: string | null;
  dayOfWeek?: DayOfWeek | null;
  subtasks: SubTask[];
  images?: TaskImage[];
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export type ViewMode = 'status_board' | 'subject_lists' | 'calendar' | 'notes';

export interface UniversityNote {
  id: string;
  title: string;
  content: string;
  pinned?: boolean;
  updatedAt: string;
}
