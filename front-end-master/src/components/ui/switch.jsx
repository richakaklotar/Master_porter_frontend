import SwitchBase from "@mui/material/Switch";
import { cn } from "@/lib/utils";

function Switch({ onCheckedChange, className, ...props }) {
  return (
    <SwitchBase
      {...props}
      className={cn(className)}
      onChange={(event, checked) => onCheckedChange?.(checked)}
      sx={{
        // MUI's default 12px root padding squeezed the track inside this
        // small box and clipped it, so the padding is removed here.
        "&.MuiSwitch-root": {
          height: 20,
          width: 36,
          padding: 0,
          flexShrink: 0,
          overflow: "visible",
        },
        "& .MuiSwitch-switchBase": {
          padding: 0,
          color: "#fff",
          "&.Mui-checked": { transform: "translateX(16px)", color: "#fff" },
        },
        "& .MuiSwitch-thumb": {
          width: 16,
          height: 16,
          margin: "2px",
          boxShadow: "0 1px 2px rgb(0 0 0 / 0.25)",
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