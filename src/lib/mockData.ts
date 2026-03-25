export interface User {
  id: string;
  username: string;
  password: string;
  role: "student" | "admin";
  name: string;
  email?: string;
  rating?: number;
  assignedModules?: string[]; // module IDs, empty = all
}

export interface ModuleContent {
  id: string;
  title: string;
  type: "note" | "video" | "assignment" | "extra-video";
  url: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  contents: ModuleContent[];
  visibleTo: "all" | string[]; // "all" or array of student IDs
}

export interface HelpdeskPost {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
  comments: { id: string; authorName: string; content: string; createdAt: string }[];
}

const STORAGE_KEYS = {
  users: "jr_users",
  modules: "jr_modules",
  helpdesk: "jr_helpdesk",
  currentUser: "jr_current_user",
};

const defaultUsers: User[] = [];

const defaultModules: Module[] = [
  {
    id: "m1",
    title: "Introduction to Programming",
    description: "Learn the basics of programming with Python",
    visibleTo: "all",
    contents: [
      { id: "c1", title: "Chapter 1 Notes", type: "note", url: "https://drive.google.com/example1" },
      { id: "c2", title: "Intro Lecture", type: "video", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { id: "c3", title: "Assignment 1", type: "assignment", url: "Write a program that prints Hello World" },
    ],
  },
  {
    id: "m2",
    title: "Web Development Basics",
    description: "HTML, CSS, and JavaScript fundamentals",
    visibleTo: "all",
    contents: [
      { id: "c4", title: "HTML Guide", type: "note", url: "https://drive.google.com/example2" },
      { id: "c5", title: "CSS Tutorial", type: "video", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    ],
  },
];

function getFromStorage<T>(key: string, defaults: T): T {
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(key, JSON.stringify(defaults));
  return defaults;
}

function setToStorage<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

export const db = {
  getUsers: (): User[] => getFromStorage(STORAGE_KEYS.users, defaultUsers),
  setUsers: (users: User[]) => setToStorage(STORAGE_KEYS.users, users),

  getModules: (): Module[] => getFromStorage(STORAGE_KEYS.modules, defaultModules),
  setModules: (modules: Module[]) => setToStorage(STORAGE_KEYS.modules, modules),

  getHelpdesk: (): HelpdeskPost[] => getFromStorage(STORAGE_KEYS.helpdesk, []),
  setHelpdesk: (posts: HelpdeskPost[]) => setToStorage(STORAGE_KEYS.helpdesk, posts),

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(STORAGE_KEYS.currentUser);
    return stored ? JSON.parse(stored) : null;
  },
  setCurrentUser: (user: User | null) => {
    if (user) setToStorage(STORAGE_KEYS.currentUser, user);
    else localStorage.removeItem(STORAGE_KEYS.currentUser);
  },

  login: (username: string, password: string): User | null => {
    const users = db.getUsers();
    const user = users.find((u) => u.username === username && u.password === password);
    if (user) db.setCurrentUser(user);
    return user || null;
  },

  logout: () => db.setCurrentUser(null),

  getStudentModules: (studentId: string): Module[] => {
    const modules = db.getModules();
    return modules.filter(
      (m) => m.visibleTo === "all" || (Array.isArray(m.visibleTo) && m.visibleTo.includes(studentId))
    );
  },
};
