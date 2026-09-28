import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

function StatusToggle({ value, onChange, disabled = false, label = "Status" }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Label htmlFor="statusToggle" className="font-normal text-foreground">
        {label}
      </Label>
      <Switch
        id="statusToggle"
        checked={value === "Active"}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

export { StatusToggle };