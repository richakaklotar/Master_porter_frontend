import InputBase from "@mui/material/InputBase";
import { cn } from "@/lib/utils";

function Input({ className, type, "aria-invalid": ariaInvalid, ...props }) {
  return (
    <InputBase
      type={type}
      error={ariaInvalid}
      data-slot="input"
      className={cn(
        "h-10 w-full items-center rounded-lg border border-border bg-background px-3 text-sm shadow-xs transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      sx={{
        "&.MuiInputBase-root": { lineHeight: "1.25rem" },
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

export { Input };