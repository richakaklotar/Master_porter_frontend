import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { LoaderCircle, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Reusable Add / Edit form rendered inside an MUI Dialog.
 * - Full screen on phones, centered modal from `sm` breakpoint up.
 * - Header and footer stay fixed; only the form body scrolls.
 */
function FormDialog({
  open,
  onClose,
  onSubmit,
  icon: Icon,
  isEdit = false,
  title,
  description,
  submitLabel,
  saving = false,
  maxWidth = "sm",
  children,
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClose = (_event, reason) => {
    if (saving) return;
    // Avoid losing typed data on an accidental outside click
    if (reason === "backdropClick") return;
    onClose?.();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth={maxWidth}
      scroll="paper"
      aria-labelledby="form-dialog-title"
      slotProps={{
        paper: {
          sx: {
            borderRadius: fullScreen ? 0 : "16px",
            overflow: "hidden",
          },
        },
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          flex: "1 1 auto",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {/* HEADER */}
        <DialogTitle
          id="form-dialog-title"
          component="div"
          sx={{ px: { xs: 2, sm: 3 }, py: 2 }}
        >
          <div className="flex items-center gap-3 pr-8">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {isEdit ? (
                <Pencil className="size-4" />
              ) : (
                Icon && <Icon className="size-4" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold leading-tight sm:text-lg">
                {title}
              </h2>
              {description && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          </div>
          <IconButton
            aria-label="Close"
            onClick={() => handleClose(null, "closeButton")}
            disabled={saving}
            size="small"
            sx={{ position: "absolute", right: 12, top: 14 }}
          >
            <X className="size-4" />
          </IconButton>
        </DialogTitle>

        {/* BODY */}
        <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: 2.5 }}>
          <div className="flex flex-col gap-5">{children}</div>
        </DialogContent>

        {/* FOOTER */}
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 1.5 }}>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleClose(null, "cancel")}
            disabled={saving}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="flex-1 sm:flex-none"
          >
            {saving ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              submitLabel || (isEdit ? "Update" : "Save")
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default FormDialog;
