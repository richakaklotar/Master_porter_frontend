import { styled } from "@mui/material/styles";
import { cn } from "@/lib/utils";

const LabelRoot = styled("label")({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  lineHeight: 1,
  cursor: "pointer",
  color: "var(--foreground)",
  userSelect: "none",
});

function Label({ className, ...props }) {
  return <LabelRoot data-slot="label" className={cn(className)} {...props} />;
}

export { Label };