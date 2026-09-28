import SkeletonBase from "@mui/material/Skeleton";
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <SkeletonBase
      variant="rounded"
      data-slot="skeleton"
      className={cn(className)}
      sx={{ backgroundColor: "var(--muted)" }}
      {...props}
    />
  );
}

export { Skeleton };