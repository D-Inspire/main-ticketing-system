import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "sub-admin"
  department?: string
}

export interface Department {
  id: string
  name: string
  users: User[]
}

export interface Ticket {
  id: string
  name: string
  phone: string
  email: string
  companySection: string
  source: string
  dateFiled: string
  subject: string
  message: string
  recommendation?: string
  level: "urgent" | "high" | "medium" | "casual"
  status: "new" | "in-progress" | "paused" | "completed"
  department: string
  assignedUser?: string
  autoEmail: boolean
  createdBy: string
  updatedAt: string
  logTrail: LogEntry[]
}

export interface LogEntry {
  id: string
  action: string
  user: string
  timestamp: string
  details?: string
}

interface AppState {
  user: User | null
  tickets: Ticket[]
  departments: Department[]
  users: User[]
  companySections: string[]
  sources: string[]

  // Auth actions
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  setUser: (user: User) => void

  // Ticket actions
  createTicket: (ticket: Omit<Ticket, "id" | "createdBy" | "updatedAt" | "logTrail">) => void
  updateTicket: (id: string, updates: Partial<Ticket>) => void
  deleteTicket: (id: string) => void
  addLogEntry: (ticketId: string, entry: Omit<LogEntry, "id" | "timestamp">) => void

  // Department actions
  createDepartment: (name: string) => void
  updateDepartment: (id: string, name: string) => void
  deleteDepartment: (id: string) => void

  // User actions
  createUser: (user: Omit<User, "id">) => void
  updateUser: (id: string, updates: Partial<User>) => void
  deleteUser: (id: string) => void
  assignUserToDepartment: (userId: string, departmentId: string) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      tickets: [],
      departments: [
        {
          id: "1",
          name: "Technical Support",
          users: [],
        },
        {
          id: "2",
          name: "Customer Service",
          users: [],
        },
        {
          id: "3",
          name: "Sales",
          users: [],
        },
      ],
      users: [
        {
          id: "1",
          name: "Admin User",
          email: "admin@company.com",
          role: "admin",
        },
        {
          id: "2",
          name: "Sub Admin",
          email: "subadmin@company.com",
          role: "sub-admin",
          department: "1",
        },
      ],
      companySections: ["Sales", "Marketing", "Support", "Development", "HR"],
      sources: ["Tawk.to", "Walk-in", "Phone", "Email", "Website Form"],

      login: async (email: string, password: string) => {
        // Mock authentication
        const users = get().users
        const user = users.find((u) => u.email === email)
        if (user && password === "password") {
          set({ user })
          return true
        }
        return false
      },

      logout: () => set({ user: null }),

      setUser: (user) => set({ user }),

      createTicket: (ticketData) => {
        const user = get().user
        if (!user) return

        const newTicket: Ticket = {
          ...ticketData,
          id: Date.now().toString(),
          createdBy: user.id,
          updatedAt: new Date().toISOString(),
          logTrail: [
            {
              id: "1",
              action: "Ticket Created",
              user: user.name,
              timestamp: new Date().toISOString(),
            },
          ],
        }

        set((state) => ({
          tickets: [...state.tickets, newTicket],
        }))
      },

      updateTicket: (id, updates) => {
        const user = get().user
        if (!user) return

        set((state) => ({
          tickets: state.tickets.map((ticket) =>
            ticket.id === id
              ? {
                  ...ticket,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                  logTrail: [
                    ...ticket.logTrail,
                    {
                      id: Date.now().toString(),
                      action: "Ticket Updated",
                      user: user.name,
                      timestamp: new Date().toISOString(),
                      details: Object.keys(updates).join(", "),
                    },
                  ],
                }
              : ticket,
          ),
        }))
      },

      deleteTicket: (id) => {
        set((state) => ({
          tickets: state.tickets.filter((ticket) => ticket.id !== id),
        }))
      },

      addLogEntry: (ticketId, entry) => {
        set((state) => ({
          tickets: state.tickets.map((ticket) =>
            ticket.id === ticketId
              ? {
                  ...ticket,
                  logTrail: [
                    ...ticket.logTrail,
                    {
                      ...entry,
                      id: Date.now().toString(),
                      timestamp: new Date().toISOString(),
                    },
                  ],
                }
              : ticket,
          ),
        }))
      },

      createDepartment: (name) => {
        const newDepartment: Department = {
          id: Date.now().toString(),
          name,
          users: [],
        }
        set((state) => ({
          departments: [...state.departments, newDepartment],
        }))
      },

      updateDepartment: (id, name) => {
        set((state) => ({
          departments: state.departments.map((dept) => (dept.id === id ? { ...dept, name } : dept)),
        }))
      },

      deleteDepartment: (id) => {
        set((state) => ({
          departments: state.departments.filter((dept) => dept.id !== id),
        }))
      },

      createUser: (userData) => {
        const newUser: User = {
          ...userData,
          id: Date.now().toString(),
        }
        set((state) => ({
          users: [...state.users, newUser],
        }))
      },

      updateUser: (id, updates) => {
        set((state) => ({
          users: state.users.map((user) => (user.id === id ? { ...user, ...updates } : user)),
        }))
      },

      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
        }))
      },

      assignUserToDepartment: (userId, departmentId) => {
        set((state) => ({
          users: state.users.map((user) => (user.id === userId ? { ...user, department: departmentId } : user)),
        }))
      },
    }),
    {
      name: "ticketing-system-storage",
    },
  ),
)
