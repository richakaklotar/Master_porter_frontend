import { createContext, useCallback, useContext, useRef, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

const ConfirmContext = createContext(null);

const DEFAULTS = {
  title: "Are you sure?",
  message: "",
  confirmText: "Delete",
  cancelText: "Cancel",
  destructive: true,
};

/**
 * Promise-based confirm dialog (MUI) - drop-in replacement for window.confirm.
 *
 *   const confirmAction = useConfirm();
 *   if (!(await confirmAction({ title: "Delete plant?", message: "..." }))) return;
 *
 * Also accepts a plain string: await confirmAction("Are you sure?")
 */
export function ConfirmProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState(DEFAULTS);
  const resolverRef = useRef(null);

  const confirm = useCallback((opts) => {
    const next = typeof opts === "string" ? { message: opts } : opts || {};
    setOptions({ ...DEFAULTS, ...next });
    setOpen(true);
    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const close = (result) => {
    setOpen(false);
    resolverRef.current?.(result);
    resolverRef.current = null;
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      <Dialog
        open={open}
        onClose={() => close(false)}
        fullWidth
        maxWidth="xs"
        aria-labelledby="confirm-dialog-title"
        slotProps={{
          paper: { sx: { borderRadius: "16px", m: 2, width: "calc(100% - 32px)" } },
        }}
      >
        <DialogContent sx={{ pt: 3, pb: 1 }}>
          <div className="flex items-start gap-4">
            <div
              className={
                options.destructive
                  ? "flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive"
                  : "flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
              }
            >
              <TriangleAlert className="size-5" />
            </div>
            <div className="min-w-0 pt-1">
              <h2
                id="confirm-dialog-title"
                className="text-base font-semibold leading-tight"
              >
                {options.title}
              </h2>
              {options.message && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {options.message}
                </p>
              )}
            </div>
          </div>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, pt: 2 }}>
          <Button
            type="button"
            variant="outline"
            onClick={() => close(false)}
            className="flex-1 sm:flex-none"
          >
            {options.cancelText}
          </Button>
          <Button
            type="button"
            variant={options.destructive ? "destructive" : "default"}
            onClick={() => close(true)}
            className="flex-1 sm:flex-none"
            autoFocus
          >
            {options.confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used inside <ConfirmProvider>");
  }
  return ctx;
}
