import { Children, isValidElement } from "react";
import SelectBase from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { cn } from "@/lib/utils";

function SelectTrigger() {
  return null;
}

function SelectValue() {
  return null;
}

function SelectContent() {
  return null;
}

function SelectItem() {
  return null;
}

function extractText(node) {
  return Children.toArray(node)
    .map((c) => (typeof c === "string" || typeof c === "number" ? String(c) : ""))
    .join("")
    .trim();
}

function Select({ value, onValueChange, disabled, children }) {
  const arr = Children.toArray(children);

  let trigger = null;
  let content = null;
  arr.forEach((child) => {
    if (!isValidElement(child)) return;
    if (child.type === SelectTrigger) trigger = child;
    else if (child.type === SelectContent) content = child;
  });

  let id;
  let name;
  let placeholder = "";
  let triggerClassName = "";
  let ariaInvalid = false;
  if (trigger) {
    const tp = trigger.props;
    id = tp.id;
    name = tp.name;
    disabled = disabled ?? tp.disabled;
    triggerClassName = tp.className || "";
    ariaInvalid = tp["aria-invalid"] === true;
    const inner = Children.toArray(tp.children).find(
      (c) => isValidElement(c) && c.type === SelectValue,
    );
    placeholder = inner && isValidElement(inner) ? inner.props.placeholder || "" : "";
  }

  const items = [];
  const collect = (node) => {
    Children.toArray(node).forEach((child) => {
      if (!isValidElement(child)) return;
      if (child.type === SelectItem) {
        items.push({
          value: String(child.props.value),
          label: extractText(child.props.children),
        });
      } else {
        collect(child.props ? child.props.children : null);
      }
    });
  };
  if (content) collect(content.props.children);

  const selected = items.find((i) => i.value === String(value));

  return (
    <SelectBase
      id={id}
      name={name}
      value={String(value ?? "")}
      disabled={disabled}
      displayEmpty
      aria-invalid={ariaInvalid}
      onChange={(event) => onValueChange?.(event.target.value)}
      renderValue={() => (selected ? selected.label : placeholder)}
      MenuProps={{
        anchorOrigin: { vertical: "bottom", horizontal: "left" },
        transformOrigin: { vertical: "top", horizontal: "left" },
        PaperProps: {
          className: "max-h-60 overflow-y-auto",
          sx: {
            borderRadius: 2,
            border: "1px solid var(--border)",
            boxShadow: "0 4px 12px -2px rgb(0 0 0 / 0.1)",
          },
        },
      }}
      className={cn(triggerClassName)}
      sx={{
        fontSize: "0.875rem",
        "& .MuiSelect-select": {
          padding: "0 34px 0 12px",
          height: 40,
          display: "flex",
          alignItems: "center",
          boxSizing: "border-box",
        },
        "&.MuiInputBase-root": {
          height: 40,
          width: "100%",
          backgroundColor: "var(--background)",
          borderRadius: 8,
          boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.03)",
          transition: "border-radius 0.15s, box-shadow 0.15s, border-color 0.15s",
          boxSizing: "border-box",
          ...(ariaInvalid ? {} : {}),
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "var(--border)",
          borderWidth: 1,
          borderRadius: 8,
          ...(ariaInvalid ? { borderColor: "var(--destructive)" } : {}),
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "var(--ring)",
          borderWidth: 1,
        },
        "&.Mui-focused": {
          boxShadow: "0 0 0 3px color-mix(in oklab, var(--ring) 35%, transparent)",
        },
        "&.Mui-disabled": { opacity: 0.5 },
      }}
    >
      {items.map((item) => (
        <MenuItem key={item.value} value={item.value} sx={{ fontSize: "0.875rem", py: 1 }}>
          {item.label}
        </MenuItem>
      ))}
    </SelectBase>
  );
}

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  SelectScrollDownButton,
  SelectScrollUpButton,
};

function SelectGroup() {
  return null;
}

function SelectLabel() {
  return null;
}

function SelectSeparator() {
  return null;
}

function SelectScrollDownButton() {
  return null;
}

function SelectScrollUpButton() {
  return null;
}