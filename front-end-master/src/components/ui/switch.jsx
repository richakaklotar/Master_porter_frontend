import SwitchBase from "@mui/material/Switch";
import { cn } from "@/lib/utils";

function Switch({ onCheckedChange, className, ...props }) {
  return (
    <SwitchBase
      {...props}
      className={cn(className)}
      onChange={(event, checked) => onCheckedChange?.(checked)}
      sx={{
        "&.MuiSwitch-root": {
          height: "1.15rem",
          width: 34,
        },
        "& .MuiSwitch-switchBase": {
          padding: 0,
          "&.Mui-checked": { transform: "translateX(18px)" },
        },
        "& .MuiSwitch-thumb": {
          width: 14,
          height: 14,
          margin: 2,
        },
        "& .MuiSwitch-track": {
          borderRadius: 9999,
          backgroundColor: "var(--border)",
          opacity: 1,
        },
        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
          backgroundColor: "var(--primary)",
          opacity: 1,
        },
      }}
    />
  );
}

export { Switch };