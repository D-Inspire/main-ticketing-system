"use client"

import { useState, useMemo } from "react"
import { useStore } from "@/lib/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { Search, Calendar, User, Building2, Eye, Edit } from "lucide-react"
import Link from "next/link"

export default function SearchPage() {
  const { tickets, departments, users } = useStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")

  const searchResults = useMemo(() => {
    if (
      !searchQuery.trim() &&
      !dateFilter &&
      departmentFilter === "all" &&
      statusFilter === "all" &&
      levelFilter === "all"
    ) {
      return []
    }

    return tickets.filter((ticket) => {
      const matchesQuery =
        !searchQuery.trim() ||
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.message.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesDate =
        !dateFilter || new Date(ticket.dateFiled).toDateString() === new Date(dateFilter).toDateString()

      const matchesDepartment = departmentFilter === "all" || ticket.department === departmentFilter
      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
      const matchesLevel = levelFilter === "all" || ticket.level === levelFilter

      return matchesQuery && matchesDate && matchesDepartment && matchesStatus && matchesLevel
    })
  }, [tickets, searchQuery, dateFilter, departmentFilter, statusFilter, levelFilter])

  const clearFilters = () => {
    setSearchQuery("")
    setDateFilter("")
    setDepartmentFilter("all")
    setStatusFilter("all")
    setLevelFilter("all")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "in-progress":
        return "bg-orange-100 text-orange-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "casual":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-primary">Search Tickets</h1>
          <p className="text-muted-foreground">Find tickets by subject, name, date, or other criteria</p>
        </div>

        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search & Filter
            </CardTitle>
            <CardDescription>Use multiple criteria to find specific tickets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by subject, name, email, or message..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Filed</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Actions</label>
                  <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
                    Clear All
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        <div className="space-y-4">
          {searchResults.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  {!searchQuery.trim() &&
                  !dateFilter &&
                  departmentFilter === "all" &&
                  statusFilter === "all" &&
                  levelFilter === "all" ? (
                    <>
                      <p className="text-lg font-medium">Start your search</p>
                      <p className="text-sm">Enter search terms or apply filters to find tickets</p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-medium">No tickets found</p>
                      <p className="text-sm">Try adjusting your search criteria</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Found {searchResults.length} ticket{searchResults.length !== 1 ? "s" : ""}
                </p>
              </div>

              {searchResults.map((ticket, index) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg text-primary truncate">{ticket.subject}</h3>
                              <p className="text-muted-foreground text-sm">
                                {ticket.name} • {ticket.email}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Badge className={getStatusColor(ticket.status)}>{ticket.status.replace("-", " ")}</Badge>
                              <Badge className={getLevelColor(ticket.level)}>{ticket.level}</Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(ticket.dateFiled).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4" />
                              <span>{ticket.department}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>{ticket.assignedUser || "Unassigned"}</span>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2">{ticket.message}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link href={`/tickets/${ticket.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </Link>
                          <Link href={`/tickets/${ticket.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
