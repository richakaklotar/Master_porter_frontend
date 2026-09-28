import ButtonBase from "@mui/material/Button";
import { cn } from "@/lib/utils";

const variantSx = {
  default: {
    backgroundColor: "var(--primary)",
    color: "var(--primary-foreground)",
    "&:hover": {
      backgroundColor: "color-mix(in oklab, var(--primary) 90%, transparent)",
    },
  },
  destructive: {
    backgroundColor: "var(--destructive)",
    color: "#fff",
    "&:hover": {
      backgroundColor: "color-mix(in oklab, var(--destructive) 90%, transparent)",
    },
  },
  outline: {
    backgroundColor: "var(--background)",
    color: "var(--foreground)",
    border: "1px solid var(--border)",
    "&:hover": { backgroundColor: "var(--accent)" },
  },
  secondary: {
    backgroundColor: "var(--secondary)",
    color: "var(--secondary-foreground)",
    "&:hover": {
      backgroundColor: "color-mix(in oklab, var(--secondary) 85%, transparent)",
    },
  },
  ghost: {
    color: "var(--foreground)",
    "&:hover": { backgroundColor: "var(--accent)" },
  },
  link: {
    backgroundColor: "transparent",
    color: "var(--primary)",
    textAlign: "left",
    "&:hover": { backgroundColor: "transparent", textDecoration: "underline" },
  },
  success: {
    backgroundColor: "#059669",
    color: "#fff",
    "&:hover": { backgroundColor: "#047857" },
  },
};

const sizeSx = {
  default: { height: 36, padding: "0 16px", fontSize: "0.875rem" },
  sm: { height: 32, padding: "0 12px", fontSize: "0.8rem" },
  lg: { height: 40, padding: "0 24px", fontSize: "0.875rem" },
  icon: { height: 36, width: 36, padding: 0, minWidth: 36, fontSize: "0.875rem" },
};

function Button({ className, variant = "default", size = "default", ...props }) {
  const active = variantSx[variant] || variantSx.default;
  return (
    <ButtonBase
      {...props}
      variant="text"
      className={cn("gap-1.5 whitespace-nowrap", className)}
      sx={{
        minWidth: 0,
        borderRadius: 6,
        textTransform: "none",
        letterSpacing: 0,
        fontWeight: 500,
        lineHeight: 1,
        boxShadow: "none",
        fontFamily: "inherit",
        alignItems: "center",
        justifyContent: "center",
        ...active,
        ...sizeSx[size] || sizeSx.default,
        ...(active.backgroundColor
          ? {
              "&.Mui-disabled": {
                backgroundColor: active.backgroundColor,
                color: active.color || "inherit",
                opacity: 0.6,
              },
            }
          : { "&.Mui-disabled": { opacity: 0.6 } }),
      }}
    />
  );
}

export { Button };