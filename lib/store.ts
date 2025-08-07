import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: "admin" | "sub-admin" | "user"
  department?: string // Changed to string to store department name
}

export interface Department {
  id: string
  name: string
  description?: string // Added description field
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
  createDepartment: (departmentData: { name: string; description: string }) => void
  updateDepartment: (id: string, updates: { name?: string; description?: string }) => void
  deleteDepartment: (id: string) => void

  // User actions
  createUser: (user: Omit<User, "id">) => void
  updateUser: (id: string, updates: Partial<User>) => void
  deleteUser: (id: string) => void
  assignUserToDepartment: (userId: string, departmentName: string) => void // Changed to departmentName

  // Reset function
  resetStore: () => void
}

// Initial data
const initialUsers: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@company.com",
    password: "password",
    role: "admin",
  },
  {
    id: "2",
    name: "Sub Admin",
    email: "subadmin@company.com",
    password: "password",
    role: "sub-admin",
    department: "Technical Support",
  },
  {
    id: "3",
    name: "John Doe",
    email: "john@company.com",
    password: "password",
    role: "user",
    department: "Technical Support",
  },
  {
    id: "4",
    name: "Jane Smith",
    email: "jane@company.com",
    password: "password",
    role: "user",
    department: "Customer Service",
  },
]

const initialDepartments: Department[] = [
  {
    id: "1",
    name: "Technical Support",
    description: "Handles all technical issues and support requests.",
    users: [],
  },
  {
    id: "2",
    name: "Customer Service",
    description: "Manages customer inquiries, feedback, and general support.",
    users: [],
  },
  {
    id: "3",
    name: "Sales",
    description: "Responsible for new client acquisition and sales operations.",
    users: [],
  },
]

const initialTickets: Ticket[] = [
  {
    id: "1",
    name: "John Customer",
    phone: "+1234567890",
    email: "john.customer@email.com",
    companySection: "Sales",
    source: "Email",
    dateFiled: "2024-01-15T10:30:00Z",
    subject: "Login Issues",
    message: "I'm having trouble logging into my account. The password reset doesn't seem to work.",
    level: "high",
    status: "new",
    department: "Technical Support",
    autoEmail: true,
    createdBy: "1",
    updatedAt: "2024-01-15T10:30:00Z",
    logTrail: [
      {
        id: "1",
        action: "Ticket Created",
        user: "Admin User",
        timestamp: "2024-01-15T10:30:00Z",
      },
    ],
  },
  {
    id: "2",
    name: "Jane Smith",
    phone: "+1987654321",
    email: "jane.smith@email.com",
    companySection: "Support",
    source: "Phone",
    dateFiled: "2024-01-16T14:20:00Z",
    subject: "Billing Question",
    message: "I have a question about my recent invoice. There seems to be an extra charge.",
    level: "medium",
    status: "in-progress",
    department: "Customer Service",
    autoEmail: false,
    createdBy: "1",
    updatedAt: "2024-01-16T14:20:00Z",
    logTrail: [
      {
        id: "1",
        action: "Ticket Created",
        user: "Admin User",
        timestamp: "2024-01-16T14:20:00Z",
      },
    ],
  },
]

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      tickets: initialTickets,
      departments: initialDepartments,
      users: initialUsers,
      companySections: ["Sales", "Marketing", "Support", "Development", "HR"],
      sources: ["Tawk.to", "Walk-in", "Phone", "Email", "Website Form"],

      login: async (email: string, password: string) => {
        console.log("Login attempt:", { email, password })
        
        // Get current users from store
        const currentUsers = get().users
        console.log("Available users:", currentUsers)
        
        // Find user with matching email and password
        const user = currentUsers.find((u) => {
          console.log("Checking user:", { userEmail: u.email, userPassword: u.password, inputEmail: email, inputPassword: password })
          return u.email === email && u.password === password
        })
        
        console.log("Found user:", user)
        
        if (user) {
          set({ user })
          return true
        }
        return false
      },

      logout: () => {
        set({ user: null })
      },

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

      createDepartment: (departmentData) => {
        const newDepartment: Department = {
          id: Date.now().toString(),
          name: departmentData.name,
          description: departmentData.description,
          users: [],
        }
        set((state) => ({
          departments: [...state.departments, newDepartment],
        }))
      },

      updateDepartment: (id, updates) => {
        set((state) => ({
          departments: state.departments.map((dept) => (dept.id === id ? { ...dept, ...updates } : dept)),
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

      assignUserToDepartment: (userId, departmentName) => { // Changed to departmentName
        set((state) => ({
          users: state.users.map((user) => (user.id === userId ? { ...user, department: departmentName } : user)),
        }))
      },

      resetStore: () => {
        set({
          user: null,
          tickets: initialTickets,
          departments: initialDepartments,
          users: initialUsers,
        })
      },
    }),
    {
      name: "ticketing-system-storage",
      version: 1, // Increment version to force reset
    },
  ),
)
