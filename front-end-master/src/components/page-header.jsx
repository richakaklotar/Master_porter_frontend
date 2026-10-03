import { createContext, useContext } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

// DOM node inside the app's top bar that page headers render into.
// undefined = no top bar (render in place), null = top bar not mounted yet.
export const PageHeaderSlotContext = createContext(undefined);

function PageHeader({ icon: Icon, title, description, children, className }) {
  const slot = useContext(PageHeaderSlotContext);

  const heading = (
      <div
        className={cn(
          "flex min-w-0 flex-1 items-center gap-3",
          slot === undefined && "mb-1 sm:mb-4",
          className
        )}
      >
        {Icon && (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25">
            <Icon className="size-4" />
          </div>
        )}
        <div className="min-w-0 leading-tight">
          <h1 className="truncate text-base font-semibold tracking-tight sm:text-lg">
            {title}
          </h1>
          {description && (
            <p className="truncate text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
  );

  return (
    <>
      {/* Title goes to the top bar; action buttons stay in the page */}
      {slot === undefined ? heading : slot && createPortal(heading, slot)}
      {children && (
        <div className="mb-3 flex shrink-0 flex-wrap items-center justify-end gap-2 sm:mb-4">
          {children}
        </div>
      )}
    </>
  );
}

export default PageHeader;