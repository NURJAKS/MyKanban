# MyKanban

> Minimalist academic schedule & task manager styled after Google Tasks and Google Calendar.

[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-22c55e?style=flat&logo=github)](https://nurjaks.github.io/MyKanban/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Features

- **Google Tasks & Calendar Aesthetic**: Circular task checkboxes, clean date chips, and neutral light/dark themes.
- **3 Dynamic Views**:
  - **Status Board**: 3-column Kanban (*To Do*, *In Progress*, *Completed*) with drag-and-drop.
  - **Course Lists**: 7 subject columns showing timetable, lesson types, and homework queues.
  - **Calendar**: 7-day schedule with classes and assignment due dates.
- **Private Gist Sync**: Serverless multi-device backup and sync using GitHub Personal Access Tokens and private Gists.
- **Desktop Ready**: Optional `systemd --user` background daemon and `Ctrl+Alt+U` global hotkey.

---

## Quickstart

```bash
# Clone repository
git clone https://github.com/NURJAKS/MyKanban.git
cd MyKanban

# Install & start
npm install
npm run dev
```

App runs at: `http://localhost:5173`

Live demo hosted on GitHub Pages: [https://nurjaks.github.io/MyKanban/](https://nurjaks.github.io/MyKanban/)

---

## Service Daemon (Optional)

```bash
# Check status / restart local background service
systemctl --user status my-university-kanban.service
systemctl --user restart my-university-kanban.service
```

---

## License

MIT License
