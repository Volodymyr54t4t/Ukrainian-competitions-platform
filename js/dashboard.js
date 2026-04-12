/**
 * Dashboard JavaScript
 * Платформа: Єдина платформа конкурсів України
 * Реалізація: RBAC-based меню та функціонал
 */

// ==================== ГЛОБАЛЬНІ ЗМІННІ ====================
let currentUser = null;
let userPermissions = [];

// ==================== КОНФІГУРАЦІЯ МЕНЮ ПО РОЛЯХ ====================
const MENU_CONFIG = {
  student: {
    title: "Учень",
    sections: [
      {
        title: "Головне",
        items: [
          {
            id: "dashboard",
            label: "Головна",
            icon: "home",
            active: true,
            href: "/dashboard.html",
          },
          {
            id: "competitions",
            label: "Конкурси",
            icon: "trophy",
            href: "/competitions.html",
          },
          {
            id: "my-competitions",
            label: "Мої заявки",
            icon: "file-text",
            badge: null,
          },
          { id: "results", label: "Результати", icon: "chart-bar" },
        ],
      },
      {
        title: "Профіль",
        items: [
          {
            id: "profile",
            label: "Мій профіль",
            icon: "user",
            href: "/profile-student.html",
          },
          { id: "portfolio", label: "Моє портфоліо", icon: "folder" },
          { id: "certificates", label: "Сертифікати", icon: "award" },
          { id: "settings", label: "Налаштування", icon: "settings" },
        ],
      },
    ],
  },
  teacher: {
    title: "Вчитель",
    sections: [
      {
        title: "Головне",
        items: [
          {
            id: "dashboard",
            label: "Головна",
            icon: "home",
            active: true,
            href: "/dashboard.html",
          },
          {
            id: "competitions",
            label: "Конкурси",
            icon: "trophy",
            href: "/competitions.html",
          },
          { id: "students", label: "Мої учні", icon: "users" },
        ],
      },
      {
        title: "Управління",
        items: [
          {
            id: "create-competition",
            label: "Створити конкурс",
            icon: "plus-circle",
            permission: "create_competition",
            href: "/competitions.html",
          },
          { id: "analytics", label: "Аналітика", icon: "chart-bar" },
          { id: "reports", label: "Звіти", icon: "file-text" },
        ],
      },
      {
        title: "Профіль",
        items: [{ id: "settings", label: "Налаштування", icon: "settings" }],
      },
    ],
  },
  methodist: {
    title: "Методист",
    sections: [
      {
        title: "Головне",
        items: [
          {
            id: "dashboard",
            label: "Головна",
            icon: "home",
            active: true,
            href: "/dashboard.html",
          },
          {
            id: "competitions",
            label: "Всі конкурси",
            icon: "trophy",
            href: "/competitions.html",
          },
          { id: "applications", label: "Заявки", icon: "inbox", badge: "12" },
        ],
      },
      {
        title: "Управління",
        items: [
          { id: "templates", label: "Шаблони", icon: "file-plus" },
          { id: "results-management", label: "Результати", icon: "chart-bar" },
          { id: "management", label: "Управління", icon: "sliders" },
        ],
      },
      {
        title: "Звітність",
        items: [
          { id: "analytics", label: "Аналітика", icon: "bar-chart-2" },
          { id: "reports", label: "Звіти", icon: "file-text" },
          { id: "settings", label: "Налаштування", icon: "settings" },
        ],
      },
    ],
  },
  judge: {
    title: "Суддя",
    sections: [
      {
        title: "Головне",
        items: [
          {
            id: "dashboard",
            label: "Головна",
            icon: "home",
            active: true,
            href: "/dashboard.html",
          },
          {
            id: "competitions",
            label: "Конкурси",
            icon: "trophy",
            href: "/competitions.html",
          },
          {
            id: "works",
            label: "Роботи для оцінки",
            icon: "file-text",
            badge: "8",
          },
          { id: "evaluation", label: "Оцінювання", icon: "check-square" },
        ],
      },
      {
        title: "Історія",
        items: [
          { id: "evaluated", label: "Оцінені роботи", icon: "archive" },
          { id: "statistics", label: "Моя статистика", icon: "chart-bar" },
          { id: "settings", label: "Налаштування", icon: "settings" },
        ],
      },
    ],
  },
  admin: {
    title: "Адміністратор",
    sections: [
      {
        title: "Головне",
        items: [
          {
            id: "dashboard",
            label: "Головна",
            icon: "home",
            active: true,
            href: "/dashboard.html",
          },
          { id: "overview", label: "Огляд системи", icon: "activity" },
        ],
      },
      {
        title: "Адміністрування",
        items: [
          {
            id: "users",
            label: "Користувачі",
            icon: "users",
            href: "/users.html",
          },
          { id: "roles", label: "Ролі та дозволи", icon: "shield" },
        ],
      },
      {
        title: "Система",
        items: [
          {
            id: "competitions",
            label: "Конкурси",
            icon: "trophy",
            href: "/competitions.html",
          },
          { id: "system-settings", label: "Налаштування", icon: "sliders" },
          { id: "logs", label: "Логи системи", icon: "terminal" },
          { id: "backup", label: "Резервні копії", icon: "database" },
        ],
      },
    ],
  },
};

// ==================== КОНФІГУРАЦІЯ DASHBOARD ПО РОЛЯХ ====================
const DASHBOARD_CONFIG = {
  student: {
    stats: [
      {
        label: "Активні заявки",
        value: "3",
        icon: "file-text",
        color: "blue",
        change: null,
      },
      {
        label: "Мої конкурси",
        value: "5",
        icon: "trophy",
        color: "yellow",
        change: "+2",
      },
      {
        label: "Сертифікати",
        value: "12",
        icon: "award",
        color: "green",
        change: null,
      },
      {
        label: "Досягнення",
        value: "8",
        icon: "star",
        color: "purple",
        change: "+1",
      },
    ],
    quickActions: [
      {
        id: "apply",
        label: "Подати заявку",
        desc: "На новий конкурс",
        icon: "plus-circle",
        color: "blue",
      },
      {
        id: "competitions",
        label: "Переглянути конкурси",
        desc: "Доступні конкурси",
        icon: "trophy",
        color: "yellow",
      },
      {
        id: "portfolio",
        label: "Моє портфоліо",
        desc: "Мої роботи",
        icon: "folder",
        color: "green",
      },
      {
        id: "results",
        label: "Результати",
        desc: "Переглянути оцінки",
        icon: "chart-bar",
        color: "purple",
      },
    ],
  },
  teacher: {
    stats: [
      {
        label: "Учнів",
        value: "24",
        icon: "users",
        color: "blue",
        change: "+3",
      },
      {
        label: "Активні конкурси",
        value: "7",
        icon: "trophy",
        color: "yellow",
        change: null,
      },
      {
        label: "Заявки учнів",
        value: "15",
        icon: "file-text",
        color: "green",
        change: "+5",
      },
      {
        label: "Перемоги",
        value: "32",
        icon: "award",
        color: "purple",
        change: "+2",
      },
    ],
    quickActions: [
      {
        id: "create",
        label: "Створити конкурс",
        desc: "Новий конкурс",
        icon: "plus-circle",
        color: "blue",
        permission: "create_competition",
      },
      {
        id: "students",
        label: "Мої учні",
        desc: "Список учнів",
        icon: "users",
        color: "yellow",
      },
      {
        id: "analytics",
        label: "Аналітика",
        desc: "Статистика",
        icon: "chart-bar",
        color: "green",
      },
      {
        id: "reports",
        label: "Звіти",
        desc: "Генерація звітів",
        icon: "file-text",
        color: "purple",
      },
    ],
  },
  methodist: {
    stats: [
      {
        label: "Всього конкурсів",
        value: "48",
        icon: "trophy",
        color: "blue",
        change: "+5",
      },
      {
        label: "Нові заявки",
        value: "127",
        icon: "inbox",
        color: "yellow",
        change: "+23",
      },
      {
        label: "На перевірці",
        value: "34",
        icon: "clock",
        color: "green",
        change: null,
      },
      {
        label: "Завершені",
        value: "89",
        icon: "check-circle",
        color: "purple",
        change: "+12",
      },
    ],
    quickActions: [
      {
        id: "applications",
        label: "Нові заявки",
        desc: "127 очікують",
        icon: "inbox",
        color: "blue",
      },
      {
        id: "create-template",
        label: "Новий шаблон",
        desc: "Шаблон конкурсу",
        icon: "file-plus",
        color: "yellow",
      },
      {
        id: "results",
        label: "Результати",
        desc: "Публікація",
        icon: "chart-bar",
        color: "green",
      },
      {
        id: "reports",
        label: "Звіти",
        desc: "Генерація",
        icon: "file-text",
        color: "purple",
      },
    ],
  },
  judge: {
    stats: [
      {
        label: "Для оцінки",
        value: "18",
        icon: "file-text",
        color: "blue",
        change: "+8",
      },
      {
        label: "Оцінено сьогодні",
        value: "5",
        icon: "check-square",
        color: "green",
        change: null,
      },
      {
        label: "Всього оцінено",
        value: "234",
        icon: "archive",
        color: "yellow",
        change: null,
      },
      {
        label: "Середня оцінка",
        value: "8.4",
        icon: "star",
        color: "purple",
        change: null,
      },
    ],
    quickActions: [
      {
        id: "evaluate",
        label: "Почати оцінювання",
        desc: "18 робіт",
        icon: "play-circle",
        color: "blue",
      },
      {
        id: "works",
        label: "Всі роботи",
        desc: "Перелік робіт",
        icon: "file-text",
        color: "yellow",
      },
      {
        id: "history",
        label: "Історія",
        desc: "Оцінені роботи",
        icon: "archive",
        color: "green",
      },
      {
        id: "stats",
        label: "Статистика",
        desc: "Моя аналітика",
        icon: "chart-bar",
        color: "purple",
      },
    ],
  },
  admin: {
    stats: [
      {
        label: "Користувачів",
        value: "1,234",
        icon: "users",
        color: "blue",
        change: "+45",
      },
      {
        label: "Конкурсів",
        value: "156",
        icon: "trophy",
        color: "yellow",
        change: "+8",
      },
      {
        label: "Активних сесій",
        value: "89",
        icon: "activity",
        color: "green",
        change: null,
      },
      {
        label: "Системних подій",
        value: "24",
        icon: "bell",
        color: "purple",
        change: "+3",
      },
    ],
    quickActions: [
      {
        id: "users",
        label: "Користувачі",
        desc: "Управління",
        icon: "users",
        color: "blue",
      },
      {
        id: "roles",
        label: "Ролі",
        desc: "RBAC система",
        icon: "shield",
        color: "yellow",
      },
      {
        id: "system",
        label: "Система",
        desc: "Налаштування",
        icon: "sliders",
        color: "green",
      },
      {
        id: "logs",
        label: "Логи",
        desc: "Моніторинг",
        icon: "terminal",
        color: "purple",
      },
    ],
  },
};

// ==================== SVG ICONS ====================
const ICONS = {
  home: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
  user: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
  trophy:
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>',
  "plus-circle":
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>',
  "chart-bar":
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>',
  folder:
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>',
  award:
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>',
  settings:
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
  users:
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
  "file-text":
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
  inbox:
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>',
  "file-plus":
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>',
  sliders:
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>',
  "bar-chart-2":
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',
  "check-square":
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>',
  archive:
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>',
  activity:
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>',
  shield:
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
  terminal:
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>',
  database:
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>',
  bell: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>',
  star: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
  clock:
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
  "check-circle":
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
  "play-circle":
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>',
  "log-out":
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>',
  menu: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>',
  search:
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
  user: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
  "alert-circle":
    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
  "arrow-up":
    '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>',
  "arrow-down":
    '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>',
  "chevron-right":
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>',
};

// ==================== ІНІЦІАЛІЗАЦІЯ ====================
document.addEventListener("DOMContentLoaded", () => {
  initializeDashboard();
});

async function initializeDashboard() {
  const loadingOverlay = document.getElementById("loadingOverlay");

  try {
    // Перевірка авторизації
    const token = localStorage.getItem("authToken");
    if (!token) {
      redirectToAuth();
      return;
    }

    // Отримання даних користувача
    const response = await fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!data.success) {
      redirectToAuth();
      return;
    }

    // Збереження даних користувача
    currentUser = data.user;
    userPermissions = data.user.permissions || [];
    localStorage.setItem("user", JSON.stringify(currentUser));

    // Визначення ролі
    const roleName = currentUser.role?.name || currentUser.role || "student";

    // Рендер інтерфейсу
    renderMenuByRole(roleName);
    renderDashboard(roleName);
    renderUserProfile();
    setupEventListeners();

    // Приховати loading
    if (loadingOverlay) {
      loadingOverlay.classList.add("hidden");
    }
  } catch (error) {
    console.error("Dashboard initialization error:", error);
    showErrorPage(
      "Помилка завантаження",
      "Не вдалося завантажити дані. Спробуйте оновити сторінку.",
    );
  }
}

// ==================== РЕНДЕР МЕНЮ ПО РОЛІ ====================
function renderMenuByRole(role) {
  const sidebarNav = document.getElementById("sidebarNav");
  if (!sidebarNav) return;

  const menuConfig = MENU_CONFIG[role] || MENU_CONFIG.student;
  let html = "";

  menuConfig.sections.forEach((section) => {
    html += `<div class="nav-section">`;
    html += `<div class="nav-section-title">${section.title}</div>`;

    section.items.forEach((item) => {
      // Перевірка дозволу
      if (item.permission && !hasPermission(item.permission)) {
        return;
      }

      const activeClass = item.active ? "active" : "";
      const icon = ICONS[item.icon] || ICONS.home;
      const badge = item.badge
        ? `<span class="nav-badge">${item.badge}</span>`
        : "";
      const href = item.href || "#";

      html += `
                <a href="${href}" class="nav-item ${activeClass}" data-page="${item.id}">
                    ${icon}
                    <span>${item.label}</span>
                    ${badge}
                </a>
            `;
    });

    html += `</div>`;
  });

  sidebarNav.innerHTML = html;

  // Додаємо обробники кліків на пункти меню
  sidebarNav.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      const href = item.getAttribute("href");
      // Якщо є реальний href - переходимо по ньому
      if (href && href !== "#") {
        return; // Дозволяємо стандартну навігацію
      }
      e.preventDefault();
      const pageId = item.dataset.page;
      setActiveNavItem(item);
      handleNavigation(pageId);
    });
  });
}

// ==================== РЕНДЕР DASHBOARD ПО РОЛІ ====================
function renderDashboard(role) {
  const dashboardGrid = document.getElementById("dashboardGrid");
  if (!dashboardGrid) return;

  const config = DASHBOARD_CONFIG[role] || DASHBOARD_CONFIG.student;

  let html = "";

  // Profile Card
  html += renderProfileCard();

  // Stats Cards
  config.stats.forEach((stat) => {
    html += renderStatCard(stat);
  });

  // Quick Actions
  html += renderQuickActions(config.quickActions);

  // Activity Panel
  html += renderActivityPanel();

  dashboardGrid.innerHTML = html;

  // Setup quick action handlers
  dashboardGrid.querySelectorAll(".action-card").forEach((card) => {
    card.addEventListener("click", () => {
      const actionId = card.dataset.action;
      handleQuickAction(actionId);
    });
  });
}

function renderProfileCard() {
  const initials = getInitials(currentUser.first_name, currentUser.last_name);
  const fullName =
    `${currentUser.first_name || ""} ${currentUser.last_name || ""}`.trim() ||
    "Користувач";
  const roleName =
    currentUser.role?.display_name || currentUser.role?.name || "Користувач";

  return `
        <div class="profile-card">
            <div class="profile-info">
                <div class="profile-avatar">${initials}</div>
                <div class="profile-details">
                    <h2>${fullName}</h2>
                    <p>${currentUser.email}</p>
                    <div class="profile-role-badge">
                        ${ICONS.shield}
                        <span>${roleName}</span>
                    </div>
                </div>
            </div>
            <div class="profile-actions">
                <button class="profile-btn" onclick="handleNavigation('settings')">
                    ${ICONS.settings}
                    <span>Налаштування</span>
                </button>
                <a href="/competitions.html" class="profile-btn primary">
                    ${ICONS.trophy}
                    <span>Конкурси</span>
                </a>
            </div>
        </div>
    `;
}

function renderStatCard(stat) {
  const icon = ICONS[stat.icon] || ICONS.activity;
  const change = stat.change
    ? `
        <span class="stats-change ${stat.change.startsWith("+") ? "up" : "down"}">
            ${stat.change.startsWith("+") ? ICONS["arrow-up"] : ICONS["arrow-down"]}
            ${stat.change}
        </span>
    `
    : "";

  return `
        <div class="stats-card">
            <div class="stats-header">
                <div class="stats-icon ${stat.color}">${icon}</div>
                ${change}
            </div>
            <div class="stats-value">${stat.value}</div>
            <div class="stats-label">${stat.label}</div>
        </div>
    `;
}

function renderQuickActions(actions) {
  let actionsHtml = "";

  actions.forEach((action) => {
    // Перевірка дозволу
    if (action.permission && !hasPermission(action.permission)) {
      return;
    }

    const icon = ICONS[action.icon] || ICONS.activity;
    actionsHtml += `
            <div class="action-card" data-action="${action.id}">
                <div class="action-icon ${action.color}">${icon}</div>
                <div class="action-info">
                    <h4>${action.label}</h4>
                    <p>${action.desc}</p>
                </div>
            </div>
        `;
  });

  return `
        <div class="quick-actions">
            <div class="card-header">
                <h3 class="card-title">Швидкі дії</h3>
                <a href="#" class="card-link">
                    Всі дії ${ICONS["chevron-right"]}
                </a>
            </div>
            <div class="actions-grid">
                ${actionsHtml}
            </div>
        </div>
    `;
}

function renderActivityPanel() {
  const activities = [
    {
      text: 'Нова заявка на конкурс "Молоді таланти"',
      time: "5 хв тому",
      color: "blue",
    },
    {
      text: "Результати конкурсу опубліковано",
      time: "1 год тому",
      color: "green",
    },
    {
      text: "Нагадування: дедлайн через 2 дні",
      time: "3 год тому",
      color: "yellow",
    },
  ];

  let activitiesHtml = "";
  activities.forEach((activity) => {
    activitiesHtml += `
            <div class="activity-item">
                <div class="activity-dot ${activity.color}"></div>
                <div class="activity-content">
                    <div class="activity-text">${activity.text}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `;
  });

  return `
        <div class="activity-panel">
            <div class="card-header">
                <h3 class="card-title">Остання активність</h3>
                <a href="#" class="card-link">
                    Всі ${ICONS["chevron-right"]}
                </a>
            </div>
            <div class="activity-list">
                ${activitiesHtml}
            </div>
        </div>
    `;
}

// ==================== РЕНДЕР ПРОФІЛЮ КОРИСТУВАЧА ====================
function renderUserProfile() {
  const sidebarUser = document.getElementById("sidebarUser");
  const topbarUserName = document.getElementById("topbarUserName");

  if (sidebarUser && currentUser) {
    const initials = getInitials(currentUser.first_name, currentUser.last_name);
    const fullName =
      `${currentUser.first_name || ""} ${currentUser.last_name || ""}`.trim() ||
      "Користувач";
    const roleName =
      currentUser.role?.display_name || currentUser.role?.name || "Користувач";

    sidebarUser.innerHTML = `
            <div class="user-avatar">${initials}</div>
            <div class="user-info">
                <div class="user-name">${fullName}</div>
                <div class="user-role">${roleName}</div>
            </div>
        `;
  }

  if (topbarUserName && currentUser) {
    const fullName =
      `${currentUser.first_name || ""} ${currentUser.last_name || ""}`.trim() ||
      "Користувач";
    topbarUserName.textContent = fullName;
  }
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
  // Logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }

  // Mobile menu toggle
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");

  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open");
      sidebarOverlay?.classList.toggle("active");
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", () => {
      sidebar?.classList.remove("open");
      sidebarOverlay.classList.remove("active");
    });
  }
}

// ==================== HELPER FUNCTIONS ====================
function hasPermission(permissionName) {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }
  return userPermissions.some((p) => p.name === permissionName);
}

function getInitials(firstName, lastName) {
  const f = firstName ? firstName.charAt(0).toUpperCase() : "";
  const l = lastName ? lastName.charAt(0).toUpperCase() : "";
  return f + l || "U";
}

function setActiveNavItem(activeItem) {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");
  });
  activeItem.classList.add("active");
}

function handleNavigation(pageId) {
  const pageTitle = document.getElementById("pageTitle");
  if (pageTitle) {
    const titles = {
      dashboard: "Головна",
      "my-competitions": "Мої конкурси",
      apply: "Подати заявку",
      results: "Результати",
      portfolio: "Моє портфоліо",
      certificates: "Сертифікати",
      settings: "Налаштування",
      students: "Мої учні",
      competitions: "Конкурси",
      "create-competition": "Створити конкурс",
      analytics: "Аналітика",
      reports: "Звіти",
      "all-competitions": "Всі конкурси",
      applications: "Заявки",
      templates: "Шаблони",
      management: "Управління",
      works: "Роботи для оцінки",
      evaluation: "Оцінювання",
      evaluated: "Оцінені роботи",
      statistics: "Моя статистика",
      users: "Користувачі",
      roles: "Ролі та дозволи",
      "system-settings": "Налаштування системи",
      logs: "Логи системи",
      backup: "Резервні копії",
      overview: "Огляд системи",
    };
    pageTitle.textContent = titles[pageId] || "Dashboard";
  }

  // Close mobile sidebar
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  sidebar?.classList.remove("open");
  sidebarOverlay?.classList.remove("active");
}

function handleQuickAction(actionId) {
  // Navigate to corresponding page
  const navItem = document.querySelector(`.nav-item[data-page="${actionId}"]`);
  if (navItem) {
    setActiveNavItem(navItem);
  }
  handleNavigation(actionId);
}

function handleLogout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  window.location.href = "/auth.html";
}

function redirectToAuth() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  window.location.href = "/auth.html";
}

function showErrorPage(title, message) {
  const body = document.body;
  body.innerHTML = `
        <div class="error-page">
            <div class="error-icon">
                ${ICONS["alert-circle"]}
            </div>
            <h1 class="error-title">${title}</h1>
            <p class="error-message">${message}</p>
            <button class="error-btn" onclick="window.location.reload()">
                Оновити сторінку
            </button>
        </div>
    `;
}

// ==================== API FUNCTIONS ====================
async function checkPermissionAsync(permissionName) {
  const token = localStorage.getItem("authToken");
  try {
    const response = await fetch(
      `/api/auth/check-permission/${permissionName}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = await response.json();
    return data.has_permission;
  } catch (error) {
    console.error("Permission check error:", error);
    return false;
  }
}

// Export for global access
window.handleNavigation = handleNavigation;
window.hasPermission = hasPermission;
window.checkPermissionAsync = checkPermissionAsync;
