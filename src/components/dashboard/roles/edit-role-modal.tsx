"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EditRoleForm } from "@/components/dashboard/roles/edit-role-form"
import { Loader2 } from "lucide-react"

interface EditRoleModalProps {
  isOpen: boolean
  onClose: () => void
  roleId: string
}

export function EditRoleModal({ isOpen, onClose, roleId }: EditRoleModalProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [role, setRole] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen && roleId) {
      setIsLoading(true)
      fetch(`/api/roles/${roleId}`)
        .then((res) => res.json())
        .then((data) => {
          setRole(data)
          setIsLoading(false)
        })
        .catch((err) => {
          console.error("Error fetching role:", err)
          setIsLoading(false)
        })
    }
  }, [isOpen, roleId])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Role: {role?.name}</DialogTitle>
          <DialogDescription>
            Update role details and manage its permissions. Changes will affect all users with this role.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <EditRoleForm roleId={roleId} onSuccess={onClose} />
        )}
      </DialogContent>
    </Dialog>
  )
}

