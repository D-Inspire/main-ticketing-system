"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Ticket, User, Department, LogEntry } from "@/lib/store"
import { Clock, UserIcon, Mail, Tag, Info, Calendar, MessageSquare, List, FileText } from 'lucide-react'
import { Separator } from "@/components/ui/separator"

interface TicketDetailsModalProps {
  ticket: Ticket | null
  isOpen: boolean
  onClose: () => void
  users: User[]
  departments: Department[]
}

export function TicketDetailsModal({ ticket, isOpen, onClose, users, departments }: TicketDetailsModalProps) {
  if (!ticket) return null

  const assignedUser = users.find(user => user.id === ticket.assignedUser)
  const department = departments.find(dept => dept.name === ticket.department)

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{ticket.subject}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Ticket ID: {ticket.id}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* Customer Information */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2"><UserIcon className="w-5 h-5" /> Customer Information</h3>
              <p><span className="font-medium">Name:</span> {ticket.name}</p>
              <p><span className="font-medium">Email:</span> {ticket.email}</p>
              <p><span className="font-medium">Phone:</span> {ticket.phone}</p>
              <p><span className="font-medium">Company Section:</span> {ticket.companySection}</p>
            </div>

            {/* Ticket Details */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2"><Info className="w-5 h-5" /> Ticket Details</h3>
              <p><span className="font-medium">Source:</span> {ticket.source}</p>
              <p><span className="font-medium">Date Filed:</span> {new Date(ticket.dateFiled).toLocaleString()}</p>
              <p><span className="font-medium">Last Updated:</span> {new Date(ticket.updatedAt).toLocaleString()}</p>
              <p className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                <Badge className={getStatusColor(ticket.status)}>{ticket.status.replace("-", " ")}</Badge>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium">Priority:</span>
                <Badge className={getLevelColor(ticket.level)}>{ticket.level}</Badge>
              </p>
              <p><span className="font-medium">Department:</span> {department?.name || 'N/A'}</p>
              <p><span className="font-medium">Assigned To:</span> {assignedUser?.name || 'Unassigned'}</p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{ticket.message}</p>
          </div>

          {ticket.recommendation && (
            <>
              <Separator className="my-6" />
              <div className="space-y-2">
                <h3 className="font-semibold text-lg flex items-center gap-2"><FileText className="w-5 h-5" /> Resolution</h3>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 whitespace-pre-wrap">{ticket.recommendation}</p>
                </div>
              </div>
            </>
          )}

          <Separator className="my-6" />

          {/* Log Trail */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2"><List className="w-5 h-5" /> Log Trail</h3>
            {ticket.logTrail && ticket.logTrail.length > 0 ? (
              <ul className="space-y-3">
                {ticket.logTrail.map((log: LogEntry) => (
                  <li key={log.id} className="border-l-2 border-gray-200 pl-4">
                    <p className="font-medium">{log.action} by {log.user}</p>
                    <p className="text-sm text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
                    {log.details && <p className="text-sm text-gray-600">{log.details}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No log entries for this ticket.</p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
