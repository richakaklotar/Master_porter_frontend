import { createContext, useContext } from "react";
import Radio from "@mui/material/Radio";
import { cn } from "@/lib/utils";

const RadioCtx = createContext(null);

function RadioGroup({ value, onValueChange, disabled, className, children }) {
  return (
    <RadioCtx.Provider value={{ value, onChange: onValueChange, disabled }}>
      <div role="radiogroup" className={cn("grid gap-3", className)}>
        {children}
      </div>
    </RadioCtx.Provider>
  );
}

function RadioGroupItem({ className, value, id, disabled, ...props }) {
  const ctx = useContext(RadioCtx);
  return (
    <Radio
      id={id}
      value={value}
      size="small"
      checked={ctx ? String(ctx.value) === String(value) : false}
      disabled={(ctx?.disabled || disabled) === true}
      onChange={() => ctx?.onChange?.(value)}
      className={cn(className)}
      sx={{
        padding: 0,
        color: "var(--border)",
        "&.Mui-checked": { color: "var(--primary)" },
      }}
      {...props}
    />
  );
}

export { RadioGroup, RadioGroupItem };