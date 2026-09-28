import { createContext, useContext, useEffect, useState } from "react";
import MuiDialog from "@mui/material/Dialog";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const DialogCtx = createContext(null);

function Dialog({ open, onOpenChange, children, ...props }) {
  const [paperClass, setPaperClass] = useState("");
  return (
    <DialogCtx.Provider value={{ onOpenChange, setPaperClass }}>
      <MuiDialog
        open={open}
        onClose={(event, reason) => {
          if (reason === "escapeKeyDown" || reason === "backdropClick") {
            onOpenChange?.(false);
          }
        }}
        scroll="paper"
        maxWidth={false}
        {...props}
        PaperProps={{
          className: cn(
            "bg-background fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
            paperClass,
          ),
          sx: {
            m: 0,
            maxWidth: "none",
            boxShadow:
              "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
          },
        }}
      >
        {children}
      </MuiDialog>
    </DialogCtx.Provider>
  );
}

function DialogTrigger({ children }) {
  return children;
}

function DialogPortal({ children }) {
  return children;
}

function DialogClose({ children, onClick, ...props }) {
  const ctx = useContext(DialogCtx);
  return (
    <button
      type="button"
      onClick={(e) => {
        onClick?.(e);
        ctx?.onOpenChange?.(false);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

function DialogOverlay() {
  return null;
}

function DialogContent({ className, children, showCloseButton = true }) {
  const ctx = useContext(DialogCtx);
  useEffect(() => {
    ctx?.setPaperClass?.(className || "");
  }, [className, ctx]);

  return (
    <>
      {children}
      {!showCloseButton && (
        <button
          type="button"
          aria-label="Close"
          onClick={() => ctx?.onOpenChange?.(false)}
          className="ring-offset-background focus:ring-ring absolute top-4 right-4 z-50 cursor-pointer rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
        >
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
    </>
  );
}

function DialogHeader({ className, ...props }) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }) {
  return (
    <h2
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }) {
  return (
    <div
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};