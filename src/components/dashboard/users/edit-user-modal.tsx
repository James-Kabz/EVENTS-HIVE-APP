"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EditUserForm } from "@/components/dashboard/users/edit-user-form"
import { Loader2 } from "lucide-react"

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

export function EditUserModal({ isOpen, onClose, userId }: EditUserModalProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen && userId) {
      setIsLoading(true)
      fetch(`/api/users/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setUser(data)
          setIsLoading(false)
        })
        .catch((err) => {
          console.error("Error fetching user:", err)
          setIsLoading(false)
        })
    }
  }, [isOpen, userId])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User: {user?.name}</DialogTitle>
          <DialogDescription>
            Update user information and manage their role. Changes will affect the user&#39;s access to the system.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <EditUserForm userId={userId} onSuccess={onClose} />
        )}
      </DialogContent>
    </Dialog>
  )
}

