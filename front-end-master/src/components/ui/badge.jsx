import Chip from "@mui/material/Chip";
import { cn } from "@/lib/utils";

const badgeStyles = {
  default: { backgroundColor: "var(--primary)", color: "var(--primary-foreground)" },
  secondary: { backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)" },
  destructive: { backgroundColor: "var(--destructive)", color: "#fff" },
  outline: {
    backgroundColor: "transparent",
    color: "var(--foreground)",
    border: "1px solid var(--border)",
  },
  success: { backgroundColor: "#d1fae5", color: "#047857" },
  warning: { backgroundColor: "#fef3c7", color: "#b45309" },
};

function Badge({ className, variant = "default", children, ...props }) {
  return (
    <Chip
      size="small"
      label={children}
      data-slot="badge"
      className={cn(className)}
      sx={{
        height: 22,
        borderRadius: 9999,
        fontSize: "0.75rem",
        fontWeight: 500,
        padding: "0 8px",
        width: "fit-content",
        ...(badgeStyles[variant] || badgeStyles.default),
      }}
      {...props}
    />
  );
}

export { Badge };