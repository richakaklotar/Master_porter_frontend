import Divider from "@mui/material/Divider";
import { cn } from "@/lib/utils";

function Separator({ className, orientation = "horizontal", ...props }) {
  return (
    <Divider
      orientation={orientation === "vertical" ? "vertical" : "horizontal"}
      flexItem={orientation === "vertical"}
      data-slot="separator"
      className={cn(className)}
      sx={{
        borderColor: "var(--border)",
        height: orientation === "vertical" ? "auto" : "1px",
      }}
      {...props}
    />
  );
}

export { Separator };