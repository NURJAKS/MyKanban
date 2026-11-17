export interface DueFormat {
  text: string;
  isOverdue: boolean;
  isToday: boolean;
  isTomorrow: boolean;
  chipClass: string;
}

export const formatGoogleDate = (dateStr?: string, dueTime?: string, isDark: boolean = true): DueFormat | null => {
  if (!dateStr) return null;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const timeFormatted = dueTime ? `, ${dueTime}` : '';

  if (dateStr < todayStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return {
      text: `${monthDay}${timeFormatted}`,
      isOverdue: true,
      isToday: false,
      isTomorrow: false,
      chipClass: isDark
        ? 'text-[#f28b82] bg-[#f28b82]/10 border border-[#f28b82]/30'
        : 'text-[#b3261e] bg-[#f9dedc] border border-[#f2b8b5]',
    };
  }

  if (dateStr === todayStr) {
    return {
      text: `Today${timeFormatted}`,
      isOverdue: false,
      isToday: true,
      isTomorrow: false,
      chipClass: isDark
        ? 'text-[#8ab4f8] bg-[#8ab4f8]/10 border border-[#8ab4f8]/30 font-medium'
        : 'text-[#0b57d0] bg-[#d3e3fd] border border-[#a8c7fa] font-medium',
    };
  }

  if (dateStr === tomorrowStr) {
    return {
      text: `Tomorrow${timeFormatted}`,
      isOverdue: false,
      isToday: false,
      isTomorrow: true,
      chipClass: isDark
        ? 'text-[#e3e3e3] bg-[#282a2c] border border-[#3c4043]'
        : 'text-[#1f1f1f] bg-[#e9eef6] border border-[#c4c7c5]',
    };
  }

  const d = new Date(dateStr + 'T00:00:00');
  const formatted = d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return {
    text: `${formatted}${timeFormatted}`,
    isOverdue: false,
    isToday: false,
    isTomorrow: false,
    chipClass: isDark
      ? 'text-[#c4c7c5] bg-[#1e1f20] border border-[#3c4043]/60'
      : 'text-[#444746] bg-[#f0f4f9] border border-[#e0e2ec]',
  };
};
