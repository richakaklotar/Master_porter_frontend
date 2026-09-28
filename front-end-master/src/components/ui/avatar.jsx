import MuiAvatar from "@mui/material/Avatar";
import { cn } from "@/lib/utils";

function Avatar({ className, ...props }) {
  return (
    <MuiAvatar
      data-slot="avatar"
      className={cn("size-8 shrink-0 rounded-full bg-muted", className)}
      {...props}
    />
  );
}

function AvatarImage() {
  return null;
}

function AvatarFallback({ className, ...props }) {
  return (
    <span
      data-slot="avatar-fallback"
      className={cn("flex size-full items-center justify-center rounded-full", className)}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };