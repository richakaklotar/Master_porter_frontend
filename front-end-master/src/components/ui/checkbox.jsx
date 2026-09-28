import CheckboxBase from "@mui/material/Checkbox";
import { cn } from "@/lib/utils";

function Checkbox({ onCheckedChange, className, ...props }) {
  return (
    <CheckboxBase
      {...props}
      size="small"
      onChange={(event, checked) => onCheckedChange?.(checked)}
      className={cn(className)}
      sx={{
        padding: 0,
        color: "var(--muted-foreground)",
        "&.Mui-checked": { color: "var(--primary)" },
      }}
    />
  );
}

export { Checkbox };