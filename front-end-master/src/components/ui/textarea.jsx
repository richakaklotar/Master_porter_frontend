import InputBase from "@mui/material/InputBase";
import { cn } from "@/lib/utils";

function Textarea({ className, "aria-invalid": ariaInvalid, ...props }) {
  return (
    <InputBase
      multiline
      minRows={3}
      error={ariaInvalid}
      data-slot="textarea"
      className={cn(
        "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-xs transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      sx={{
        "&.MuiInputBase-root": { lineHeight: "1.5rem" },
        "&.MuiInputBase-multiline": { padding: 0 },
        "& .MuiInputBase-input": {
          padding: 0,
          boxSizing: "border-box",
          "&::placeholder": { color: "var(--muted-foreground)", opacity: 1 },
        },
        "&.Mui-error": {
          color: "var(--foreground)",
          borderColor: "var(--destructive)",
        },
      }}
      {...props}
    />
  );
}

export { Textarea };