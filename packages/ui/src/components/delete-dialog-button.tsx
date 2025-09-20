'use client'

import { Loader, Trash } from 'lucide-react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog'
import { Button } from '@workspace/ui/components/button'
import { useState, useTransition } from 'react'

export namespace DeleteDialogButton {
  export type Props = {
    onClick: () => void | Promise<void>
    title?: string
    description?: string | React.ReactNode
    /** if children is provided it will be used as trigger */
    children?: React.ReactNode
    modal?: boolean
    confirmText?: string
    /**
     * Override the default button with custom content
     */
  } & Omit<React.ComponentProps<typeof Button>, 'children'>
}

export const DeleteDialogButton: React.FC<DeleteDialogButton.Props> = (props) => {
  const {
    onClick,
    title = 'Delete item',
    description = 'Are you sure you want to delete this item?',
    confirmText = 'Delete',
    children,
    modal = false,
    ...rest
  } = props
  const [deleting, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  const handleDelete = () => {
    startTransition(async () => {
      await onClick()
      setOpen(false)
    })
  }

  return (
    <Dialog modal={modal} open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="destructive" size="icon" {...rest}>
            {deleting ? <Loader className="animate-spin" /> : <Trash />}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="isolate">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {typeof description === 'string' ? (
            <DialogDescription>{description}</DialogDescription>
          ) : (
            description
          )}
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Loader className="animate-spin" /> : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
