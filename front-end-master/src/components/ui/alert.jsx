import { Children, isValidElement } from "react";
import AlertBase from "@mui/material/Alert";
import AlertTitleBase from "@mui/material/AlertTitle";
import { cn } from "@/lib/utils";

function Alert({ variant = "default", className, children, ...props }) {
  const items = Children.toArray(children);
  const parts = items.filter(
    (c) =>
      isValidElement(c) &&
      (c.type === AlertTitle || c.type === AlertDescription),
  );
  const icon = items.find(
    (c) => isValidElement(c) && !parts.includes(c),
  );
  const rest = items.filter((c) => c !== icon);

  return (
    <AlertBase
      severity={variant === "destructive" ? "error" : "info"}
      icon={icon || false}
      className={cn(className)}
      sx={{ borderRadius: 8, fontSize: "0.875rem" }}
      {...props}
    >
      {parts}
      {rest}
    </AlertBase>
  );
}

function AlertTitle({ className, ...props }) {
  return <AlertTitleBase data-slot="alert-title" className={cn(className)} {...props} />;
}

function AlertDescription({ className, ...props }) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-sm", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };