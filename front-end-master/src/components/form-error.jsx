import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function FormError({ message, className }) {
  if (!message) return null;

  return (
    <p
      className={cn(
        "flex items-center gap-1.5 text-xs font-medium text-destructive",
        className
      )}
    >
      <AlertCircle className="size-3.5 shrink-0" />
      {message}
    </p>
  );
}

export default FormError;