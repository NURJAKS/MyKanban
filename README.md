# My University Kanban (Google Tasks & Calendar Style)

A streamlined, ultra-minimalist university academic schedule and homework management system designed in the clean aesthetic of **Google Tasks** and **Google Calendar**.

## Features

- **Google Tasks Aesthetic**:
  - Signature circular checkboxes with smooth completion state transitions.
  - Minimalist dark & light themes with instant toggle.
  - Clean date chips (*Today*, *Tomorrow*, *Overdue*).
  - Zero bloat, memoized components, fast 60fps drag-and-drop.
- **Dual Themes (Light & Dark)**:
  - **Dark Mode**: Neutral `#131314` base, `#1e1f20` surface, `#8ab4f8` Google Blue accent.
  - **Light Mode**: Clean `#f8fafd` base, `#ffffff` surface, `#0b57d0` Google Blue accent.
  - Toggle button in the header (Sun / Moon) + automatic `localStorage` persistence.
- **Three Minimalist Views**:
  1. **Status Board**: 3 clean columns (*To do*, *In progress*, *Completed*) with drag-and-drop.
  2. **7 Class Lists**: 7 columns side-by-side representing each course with Google Calendar color dots, class times, and drag-and-drop between lessons.
  3. **Calendar**: 7-day Google Calendar schedule displaying scheduled classes and homework deadlines.
- **Global Hotkey (`Ctrl + Alt + U`)**:
  - Registered as a native GNOME desktop shortcut (`<Control><Alt>u`) to immediately open `http://localhost:5173` in your default browser.
  - Also supported in-app with instant keyboard confirmation.
- **Systemd User Autostart**:
  - Managed by `systemd --user` service `my-university-kanban.service`.
  - Runs automatically on boot/login in the background without needing a terminal open.

## Service Management

```bash
# Check status
systemctl --user status my-university-kanban.service

# Restart service
systemctl --user restart my-university-kanban.service

# Stop service
systemctl --user stop my-university-kanban.service
```
