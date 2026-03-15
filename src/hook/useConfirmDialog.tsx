import { useState, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;

  size?: "sm" | "default";
  icon?: ReactNode;
  mediaClassName?: string;

  confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "destructiveSoft";
  cancelVariant?: "default" | "outline" | "secondary" | "ghost";

  confirmClassName?: string;
  cancelClassName?: string;

  hideCancel?: boolean;
};

export function useConfirmDialog() {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = (opts: ConfirmOptions) => {
    setOptions(opts);
    setOpen(true);

    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  };

  const handleConfirm = () => {
    resolver?.(true);
    setOpen(false);
    setResolver(null);
  };

  const handleCancel = () => {
    resolver?.(false);
    setOpen(false);
    setResolver(null);
  };

  const ConfirmDialog = () => (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent size={options.size ?? "default"}>
        <AlertDialogHeader>
          {options.icon ? (
            <AlertDialogMedia className={options.mediaClassName} >
              {options.icon}
            </AlertDialogMedia>
          ) : null}

          <AlertDialogTitle>{options.title ?? "Xác nhận"}</AlertDialogTitle>

          <AlertDialogDescription>
            {options.description ?? "Bạn có chắc chắn muốn thực hiện hành động này?"}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          {!options.hideCancel ? (
            <AlertDialogCancel
              variant={options.cancelVariant ?? "outline"}
              className={options.cancelClassName}
              onClick={handleCancel}
            >
              {options.cancelText ?? "Hủy"}
            </AlertDialogCancel>
          ) : null}

          <AlertDialogAction
            variant={options.confirmVariant ?? "default"}
            className={options.confirmClassName}
            onClick={handleConfirm}
          >
            {options.confirmText ?? "Đồng ý"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return {
    confirm,
    ConfirmDialog,
  };
}