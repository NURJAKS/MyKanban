import React from 'react';
import { KanbanProvider, useKanban } from './context/KanbanContext';
import { GoogleHeader } from './components/GoogleHeader';
import { StatusBoardView } from './components/StatusBoardView';
import { SubjectListsView } from './components/SubjectListsView';
import { CalendarView } from './components/CalendarView';
import { TaskEditDrawer } from './components/TaskEditDrawer';
import { Command, CheckCircle2 } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { viewMode, hotkeyNotification } = useKanban();

  return (
    <div className="min-h-screen bg-[#f8fafd] dark:bg-[#131314] text-[#1f1f1f] dark:text-[#e3e3e3] flex flex-col font-sans transition-colors duration-150">
      <GoogleHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-6 pt-5 flex flex-col">
        {viewMode === 'status_board' && <StatusBoardView />}
        {viewMode === 'subject_lists' && <SubjectListsView />}
        {viewMode === 'calendar' && <CalendarView />}
      </main>

      {/* Google Tasks style Slide-in Drawer */}
      <TaskEditDrawer />

      {/* Global Hotkey In-App Toast Notification */}
      {hotkeyNotification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#1e1f20] text-[#1f1f1f] dark:text-[#e3e3e3] border border-[#e0e2ec] dark:border-[#3c4043] shadow-xl text-xs animate-in fade-in slide-in-from-bottom duration-200">
          <div className="w-5 h-5 rounded-full bg-[#0b57d0]/10 dark:bg-[#8ab4f8]/10 text-[#0b57d0] dark:text-[#8ab4f8] flex items-center justify-center">
            <CheckCircle2 size={13} />
          </div>
          <div>
            <span className="font-semibold block">Hotkey Ctrl+Alt+U Active</span>
            <span className="text-[11px] text-[#5f6368] dark:text-[#8e918f]">
              Global system shortcut registered to open My University Kanban.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export function App() {
  return (
    <KanbanProvider>
      <MainLayout />
    </KanbanProvider>
  );
}

export default App;
