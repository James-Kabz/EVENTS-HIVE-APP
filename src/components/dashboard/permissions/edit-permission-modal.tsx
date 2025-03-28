"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EditPermissionForm } from "@/components/dashboard/permissions/edit-permission-form"
import { Loader2 } from "lucide-react"

interface EditPermissionModalProps {
  isOpen: boolean
  onClose: () => void
  permissionId: string
}

export function EditPermissionModal({ isOpen, onClose, permissionId }: EditPermissionModalProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [permission, setPermission] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen && permissionId) {
      setIsLoading(true)
      fetch(`/api/permissions/${permissionId}`)
        .then((res) => res.json())
        .then((data) => {
          setPermission(data)
          setIsLoading(false)
        })
        .catch((err) => {
          console.error("Error fetching permission:", err)
          setIsLoading(false)
        })
    }
  }, [isOpen, permissionId])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Permission: {permission?.name}</DialogTitle>
          <DialogDescription>
            Update permission details. Changes will affect all roles that have this permission.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <EditPermissionForm permissionId={permissionId} onSuccess={onClose} />
        )}
      </DialogContent>
    </Dialog>
  )
}

