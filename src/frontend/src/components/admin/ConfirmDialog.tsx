import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Renders the confirm action in the destructive style. */
  destructive?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

/**
 * Confirmation dialog used before every destructive admin action.
 * The confirm action is disabled while the mutation is pending.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  destructive = false,
  pending = false,
  onConfirm,
  onOpenChange,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent data-ocid="admin.confirm_dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            data-ocid="admin.confirm_cancel_button"
            disabled={pending}
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            data-ocid="admin.confirm_button"
            disabled={pending}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            className={cn(
              destructive &&
                "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            )}
          >
            {pending ? "جارٍ التنفيذ…" : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
