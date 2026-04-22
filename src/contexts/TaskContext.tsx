
import React, { createContext, useContext, useState, useEffect } from "react";
import { Task, TaskStatus, TaskPriority, TaskTag } from "@/types/task";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksByPriority: (priority: TaskPriority) => Task[];
  getTasksByTag: (tag: TaskTag) => Task[];
}

const TASKS_STORAGE_KEY = "taskr.tasks";

const initialTasks: Task[] = [
  // John Smith tasks - Bed A3, Dr. Sarah Wilson
  {
    id: "1",
    patientName: "John Smith",
    patientId: "JS001",
    bedNumber: "A3",
    doctor: "Dr. Sarah Wilson",
    description: "Order blood test",
    priority: "high",
    status: "pending",
    tags: ["practical"],
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: new Date(Date.now() + 3600000),
  },
  {
    id: "2",
    patientName: "John Smith",
    patientId: "JS001",
    bedNumber: "A3",
    doctor: "Dr. Sarah Wilson",
    description: "Check X-ray results",
    priority: "medium",
    status: "progress",
    tags: ["practical"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    patientName: "John Smith",
    patientId: "JS001",
    bedNumber: "A3",
    doctor: "Dr. Sarah Wilson",
    description: "Prescribe antibiotics",
    priority: "high",
    status: "complete",
    tags: ["prescribing"],
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: new Date(),
  },
  {
    id: "4",
    patientName: "John Smith",
    patientId: "JS001",
    bedNumber: "A3",
    doctor: "Dr. Sarah Wilson",
    description: "Refer to cardiology",
    priority: "medium",
    status: "pending",
    tags: ["referrals"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    patientName: "John Smith",
    patientId: "JS001",
    bedNumber: "A3",
    doctor: "Dr. Sarah Wilson",
    description: "Review medication",
    priority: "low",
    status: "pending",
    tags: ["prescribing"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "6",
    patientName: "John Smith",
    patientId: "JS001",
    bedNumber: "A3",
    doctor: "Dr. Sarah Wilson",
    description: "Discharge planning",
    priority: "medium",
    status: "progress",
    tags: ["practical"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "7",
    patientName: "John Smith",
    patientId: "JS001",
    bedNumber: "A3",
    doctor: "Dr. Sarah Wilson",
    description: "Complete discharge summary",
    priority: "high",
    status: "pending",
    tags: ["discharge"],
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: new Date(Date.now() + 7200000),
  },
  // Jane Doe tasks - Bed B4, Dr. Michael Chen
  {
    id: "8",
    patientName: "Jane Doe",
    patientId: "JD002",
    bedNumber: "B4",
    doctor: "Dr. Michael Chen",
    description: "Order MRI scan",
    priority: "high",
    status: "pending",
    tags: ["practical"],
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: new Date(Date.now() + 5400000),
  },
  {
    id: "9",
    patientName: "Jane Doe",
    patientId: "JD002",
    bedNumber: "B4",
    doctor: "Dr. Michael Chen",
    description: "Review lab results",
    priority: "medium",
    status: "progress",
    tags: ["practical"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "10",
    patientName: "Jane Doe",
    patientId: "JD002",
    bedNumber: "B4",
    doctor: "Dr. Michael Chen",
    description: "Prescribe pain medication",
    priority: "high",
    status: "complete",
    tags: ["prescribing"],
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: new Date(),
  },
  {
    id: "11",
    patientName: "Jane Doe",
    patientId: "JD002",
    bedNumber: "B4",
    doctor: "Dr. Michael Chen",
    description: "Refer to neurology",
    priority: "medium",
    status: "pending",
    tags: ["referrals"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "12",
    patientName: "Jane Doe",
    patientId: "JD002",
    bedNumber: "B4",
    doctor: "Dr. Michael Chen",
    description: "Update care plan",
    priority: "low",
    status: "pending",
    tags: ["practical"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "13",
    patientName: "Jane Doe",
    patientId: "JD002",
    bedNumber: "B4",
    doctor: "Dr. Michael Chen",
    description: "Family meeting",
    priority: "medium",
    status: "progress",
    tags: ["practical"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Alex Chen tasks - Bed C5, Dr. Emily Roberts
  {
    id: "14",
    patientName: "Alex Chen",
    patientId: "AC003",
    bedNumber: "C5",
    doctor: "Dr. Emily Roberts",
    description: "Order CT scan",
    priority: "high",
    status: "pending",
    tags: ["practical"],
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: new Date(Date.now() + 4800000),
  },
  {
    id: "15",
    patientName: "Alex Chen",
    patientId: "AC003",
    bedNumber: "C5",
    doctor: "Dr. Emily Roberts",
    description: "Check ECG results",
    priority: "medium",
    status: "progress",
    tags: ["practical"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "16",
    patientName: "Alex Chen",
    patientId: "AC003",
    bedNumber: "C5",
    doctor: "Dr. Emily Roberts",
    description: "Prescribe blood thinners",
    priority: "high",
    status: "complete",
    tags: ["prescribing"],
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: new Date(),
  },
  {
    id: "17",
    patientName: "Alex Chen",
    patientId: "AC003",
    bedNumber: "C5",
    doctor: "Dr. Emily Roberts",
    description: "Refer to oncology",
    priority: "high",
    status: "pending",
    tags: ["referrals"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "18",
    patientName: "Alex Chen",
    patientId: "AC003",
    bedNumber: "C5",
    doctor: "Dr. Emily Roberts",
    description: "Review previous medications",
    priority: "low",
    status: "pending",
    tags: ["prescribing"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "19",
    patientName: "Alex Chen",
    patientId: "AC003",
    bedNumber: "C5",
    doctor: "Dr. Emily Roberts",
    description: "Coordinate with PT",
    priority: "medium",
    status: "progress",
    tags: ["practical"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "20",
    patientName: "Alex Chen",
    patientId: "AC003",
    bedNumber: "C5",
    doctor: "Dr. Emily Roberts",
    description: "Prepare discharge paperwork",
    priority: "medium",
    status: "pending",
    tags: ["discharge"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Maria Garcia tasks - Bed D2, Dr. James Thompson
  {
    id: "21",
    patientName: "Maria Garcia",
    patientId: "MG004",
    bedNumber: "D2",
    doctor: "Dr. James Thompson",
    description: "Order liver function tests",
    priority: "high",
    status: "pending",
    tags: ["practical"],
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: new Date(Date.now() + 3600000),
  },
  {
    id: "22",
    patientName: "Maria Garcia",
    patientId: "MG004",
    bedNumber: "D2",
    doctor: "Dr. James Thompson",
    description: "Review ultrasound results",
    priority: "medium",
    status: "progress",
    tags: ["practical"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "23",
    patientName: "Maria Garcia",
    patientId: "MG004",
    bedNumber: "D2",
    doctor: "Dr. James Thompson",
    description: "Prescribe insulin adjustment",
    priority: "high",
    status: "complete",
    tags: ["prescribing"],
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: new Date(),
  },
  {
    id: "24",
    patientName: "Maria Garcia",
    patientId: "MG004",
    bedNumber: "D2",
    doctor: "Dr. James Thompson",
    description: "Refer to endocrinology",
    priority: "medium",
    status: "pending",
    tags: ["referrals"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "25",
    patientName: "Maria Garcia",
    patientId: "MG004",
    bedNumber: "D2",
    doctor: "Dr. James Thompson",
    description: "Complete discharge summary",
    priority: "high",
    status: "pending",
    tags: ["discharge"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Robert Williams tasks - Bed A7, Dr. Sarah Wilson
  {
    id: "26",
    patientName: "Robert Williams",
    patientId: "RW005",
    bedNumber: "A7",
    doctor: "Dr. Sarah Wilson",
    description: "Order blood cultures",
    priority: "high",
    status: "pending",
    tags: ["practical"],
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: new Date(Date.now() + 2400000),
  },
  {
    id: "27",
    patientName: "Robert Williams",
    patientId: "RW005",
    bedNumber: "A7",
    doctor: "Dr. Sarah Wilson",
    description: "Check chest X-ray",
    priority: "medium",
    status: "progress",
    tags: ["practical"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "28",
    patientName: "Robert Williams",
    patientId: "RW005",
    bedNumber: "A7",
    doctor: "Dr. Sarah Wilson",
    description: "Prescribe IV antibiotics",
    priority: "high",
    status: "pending",
    tags: ["prescribing"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "29",
    patientName: "Robert Williams",
    patientId: "RW005",
    bedNumber: "A7",
    doctor: "Dr. Sarah Wilson",
    description: "Refer to respiratory",
    priority: "medium",
    status: "pending",
    tags: ["referrals"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "30",
    patientName: "Robert Williams",
    patientId: "RW005",
    bedNumber: "A7",
    doctor: "Dr. Sarah Wilson",
    description: "Update fluid balance",
    priority: "low",
    status: "progress",
    tags: ["practical"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Emma Thompson tasks - Bed B1, Dr. Michael Chen
  {
    id: "31",
    patientName: "Emma Thompson",
    patientId: "ET006",
    bedNumber: "B1",
    doctor: "Dr. Michael Chen",
    description: "Order echocardiogram",
    priority: "high",
    status: "pending",
    tags: ["practical"],
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: new Date(Date.now() + 5400000),
  },
  {
    id: "32",
    patientName: "Emma Thompson",
    patientId: "ET006",
    bedNumber: "B1",
    doctor: "Dr. Michael Chen",
    description: "Review troponin levels",
    priority: "high",
    status: "progress",
    tags: ["practical"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "33",
    patientName: "Emma Thompson",
    patientId: "ET006",
    bedNumber: "B1",
    doctor: "Dr. Michael Chen",
    description: "Prescribe beta blockers",
    priority: "high",
    status: "complete",
    tags: ["prescribing"],
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: new Date(),
  },
  {
    id: "34",
    patientName: "Emma Thompson",
    patientId: "ET006",
    bedNumber: "B1",
    doctor: "Dr. Michael Chen",
    description: "Refer to cardiology",
    priority: "high",
    status: "pending",
    tags: ["referrals"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "35",
    patientName: "Emma Thompson",
    patientId: "ET006",
    bedNumber: "B1",
    doctor: "Dr. Michael Chen",
    description: "Arrange cardiac rehab",
    priority: "medium",
    status: "pending",
    tags: ["discharge"],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const toDate = (value?: string) => (value ? new Date(value) : undefined);

const hydrateTaskDates = (task: Task): Task => ({
  ...task,
  createdAt: new Date(task.createdAt),
  updatedAt: new Date(task.updatedAt),
  dueDate: toDate(task.dueDate as unknown as string),
  completedAt: toDate(task.completedAt as unknown as string),
});

const loadStoredTasks = (): Task[] | null => {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem(TASKS_STORAGE_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as Task[];
    if (!Array.isArray(parsed)) return null;
    return parsed.map(hydrateTaskDates);
  } catch {
    return null;
  }
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => loadStoredTasks() ?? initialTasks);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    const newTask: Task = {
      ...task,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTasks([...tasks, newTask]);
    toast.success("Task added successfully");
  };

  const updateTask = (id: string, updatedTask: Partial<Task>) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, ...updatedTask, updatedAt: new Date() }
          : task
      )
    );
    toast.success("Task updated successfully");
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
    toast.success("Task deleted successfully");
  };

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              status,
              updatedAt: new Date(),
              completedAt: status === "complete" ? new Date() : task.completedAt,
            }
          : task
      )
    );
    toast.success(`Task marked as ${status}`);
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  const getTasksByPriority = (priority: TaskPriority) => {
    return tasks.filter((task) => task.priority === priority);
  };

  const getTasksByTag = (tag: TaskTag) => {
    return tasks.filter((task) => task.tags.includes(tag));
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
        getTasksByStatus,
        getTasksByPriority,
        getTasksByTag,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
};
