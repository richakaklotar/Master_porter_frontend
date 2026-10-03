import React, { useEffect, useMemo, useState } from "react";
import {
  Check,
  ListChecks,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  Plus,
} from "lucide-react";
import PageHeader from "../components/page-header";
import { useConfirm } from "../components/confirm-dialog";
import { notifyError, notifySuccess } from "../lib/notify";
import FormDialog from "../components/form-dialog";
import FormError from "../components/form-error";
import activityService from "../services/activityService";
import componentService from "../services/componentsService";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusToggle } from "@/components/ui/status-toggle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function Activities() {
  const [activities, setActivities] = useState([]);
  const [components, setComponents] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [activity, setActivity] = useState({
    activitiesID: 0,
    activitiesName: "",
    type: "Cycle Time",
    componentID: "",
    status: "Active",
  });

  const confirmAction = useConfirm();
  const [isEdit, setIsEdit] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});

  const clearFieldError = (name) => {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;

      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  // =====================================================
  // LOAD ACTIVITIES
  // =====================================================
  const loadActivities = async () => {
    try {
      setLoading(true);

      const response = await activityService.getActivities();
      setActivities(response.data || []);
    } catch (err) {
      console.error("LOAD ACTIVITIES ERROR:", err);
      notifyError(err, "Failed to load activities.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD COMPONENTS
  // =====================================================
  const loadComponents = async () => {
    try {
      const response = await componentService.getComponents();
      setComponents(response.data || []);
    } catch (err) {
      console.error("LOAD COMPONENTS ERROR:", err);
      notifyError(err, "Failed to load components.");
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================
  useEffect(() => {
    loadActivities();
    loadComponents();
  }, []);

  // =====================================================
  // INPUT CHANGE
  // =====================================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setActivity((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
            ? "Active"
            : "Inactive"
          : value,
    }));

    clearFieldError(name);
  };

  // =====================================================
  // HANDLE STATUS CHANGE
  // =====================================================
  const handleStatusChange = (checked) => {
    setActivity((prev) => ({
      ...prev,
      status: checked ? "Active" : "Inactive",
    }));

    clearFieldError("status");
  };

  // =====================================================
  // HANDLE TYPE CHANGE
  // =====================================================
  const handleTypeChange = (value) => {
    setActivity((prev) => ({
      ...prev,
      type: value,
    }));

    clearFieldError("type");
  };

  // =====================================================
  // HANDLE COMPONENT CHANGE
  // =====================================================
  const handleComponentChange = (value) => {
    setActivity((prev) => ({
      ...prev,
      componentID: String(value ?? ""),
    }));

    clearFieldError("componentID");
  };

  // =====================================================
  // GET ACTIVITY ID
  // =====================================================
  const getActivityId = (item) => {
    return item.activitiesID ?? item.ActivitiesID ?? 0;
  };

  // =====================================================
  // GET ACTIVITY NAME
  // =====================================================
  const getActivityName = (item) => {
    return item.activitiesName ?? item.ActivitiesName ?? "";
  };

  // =====================================================
  // GET COMPONENT ID
  // =====================================================
  const getComponentId = (item) => {
    return item.componentID ?? item.ComponentID ?? "";
  };

  // =====================================================
  // GET COMPONENT NAME
  // =====================================================
  const getComponentName = (item) => {
    return (
      item.componentName ??
      item.ComponentName ??
      item.name ??
      item.Name ??
      ""
    );
  };

  // =====================================================
  // GET TYPE
  // =====================================================
  const getActivityType = (item) => {
    return item.type ?? item.Type ?? "";
  };

  // =====================================================
  // GET STATUS
  // =====================================================
  const getActivityStatus = (item) => {
    const status = item.status ?? item.Status;

    if (typeof status === "string") {
      return status.toLowerCase() === "active";
    }

    if (typeof status === "boolean") {
      return status;
    }

    return true;
  };

  // =====================================================
  // DUPLICATE ACTIVITY NAME
  // =====================================================
  const isDuplicateActivityName = () => {
    const enteredName = activity.activitiesName.trim().toLowerCase();

    return activities.some((item) => {
      const existingName = getActivityName(item).trim().toLowerCase();
      const existingId = getActivityId(item);

      if (
        isEdit &&
        Number(existingId) === Number(activity.activitiesID)
      ) {
        return false;
      }

      return existingName !== "" && existingName === enteredName;
    });
  };

  // =====================================================
  // CREATE / UPDATE
  // =====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};

    if (!activity.activitiesName.trim()) {
      errors.activitiesName = "Activity Name is required.";
    }

    if (!activity.componentID) {
      errors.componentID = "Component is required.";
    }

    if (!activity.type) {
      errors.type = "Activity Type is required.";
    }

    if (!activity.status) {
      errors.status = "Status is required.";
    }

    if (isDuplicateActivityName() && !errors.activitiesName) {
      errors.activitiesName = `Activity Name "${activity.activitiesName.trim()}" already exists.`;
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setSaving(true);

      const activityId = Number(activity.activitiesID || 0);
      const componentId = Number(activity.componentID);

      const requestData = {
        activitiesID: activityId,
        activitiesName: activity.activitiesName.trim(),
        type: activity.type,
        componentID: componentId,
        status: activity.status === "Active" ? "Active" : "Inactive",
      };

      if (isEdit) {
        await activityService.updateActivity(activityId, requestData);
        notifySuccess("Activity updated successfully");
      } else {
        await activityService.createActivity(requestData);
        notifySuccess("Activity created successfully");
      }

      setShowForm(false);
      resetForm();
      await loadActivities();
    } catch (err) {
      console.error("SAVE ACTIVITY ERROR:", err);
      notifyError(err, "Failed to save activity.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // EDIT
  // =====================================================
  const handleEdit = async (id) => {
    try {
      const response = await activityService.getActivityById(id);

      const data = response.data;

      let status = data.status ?? data.Status ?? "Active";

      if (typeof status === "boolean") {
        status = status ? "Active" : "Inactive";
      }

      setActivity({
        activitiesID: data.activitiesID ?? data.ActivitiesID ?? 0,
        activitiesName: data.activitiesName ?? data.ActivitiesName ?? "",
        type: data.type ?? data.Type ?? "Cycle Time",
        componentID:
          data.componentID ?? data.ComponentID ??
          "",
        status:
          String(status).toLowerCase() === "inactive" ? "Inactive" : "Active",
      });

      setIsEdit(true);
      setShowForm(true);
    } catch (err) {
      console.error("GET ACTIVITY ERROR:", err);
      notifyError(err, "Failed to load activity details.");
    }
  };

  // =====================================================
  // DELETE
  // =====================================================
  const handleDelete = async (id) => {
    const confirmed = await confirmAction({
      title: "Delete activity?",
      message:
        "Are you sure you want to delete this activity? This action cannot be undone.",
      confirmText: "Delete",
    });

    if (!confirmed) {
      return;
    }

    try {
      await activityService.deleteActivity(id);

      notifySuccess("Activity deleted successfully");

      await loadActivities();
    } catch (err) {
      console.error("DELETE ACTIVITY ERROR:", err);
      notifyError(err, "Failed to delete activity.");
    }
  };

  // =====================================================
  // OPEN / CLOSE ADD-EDIT DIALOG
  // =====================================================
  const handleAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    resetForm();
  };

  // =====================================================
  // RESET
  // =====================================================
  const resetForm = () => {
    setActivity({
      activitiesID: 0,
      activitiesName: "",
      type: "Cycle Time",
      componentID: "",
      status: "Active",
    });

    setIsEdit(false);
    setFieldErrors({});
  };

  // =====================================================
  // FILTERED LIST
  // =====================================================
  const filteredActivities = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return activities;

    return activities.filter((item) => {
      const name = getActivityName(item).toLowerCase();
      return name.includes(term);
    });
  }, [activities, search]);

  // Two-letter initials used for the small avatar tile in each row
  const getInitials = (name = "") =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "—";

  // =====================================================
  // TYPE CHECK
  // =====================================================
  const isTypeMatched = (actualType, target) => {
    if (!actualType) {
      return false;
    }

    return String(actualType)
      .toLowerCase()
      .includes(target.toLowerCase());
  };

  const typeOptions = ["Cycle Time", "Idle Hrs", "Unutilised Hrs"];

  return (
    <div className="flex h-full min-h-[28rem] w-full flex-col">
      {/* ================= HEADER ================= */}
      <PageHeader
        icon={ListChecks}
        title="Activities"
        description="Manage activity master data."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            loadActivities();
            loadComponents();
          }}
        >
          <RefreshCw className="size-4" />
          Refresh
        </Button>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="size-4" />
          Add Activity
        </Button>
      </PageHeader>

      {/* ================= TABLE CARD ================= */}
      <Card className="min-h-0 flex-1 border-border/60 shadow-sm">
        <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Activity List</CardTitle>
            <Badge variant="secondary" className="rounded-full font-normal">
              {activities.length}
            </Badge>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activities..."
              className="h-8 pl-8 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Activity</TableHead>
                <TableHead>Component</TableHead>
                <TableHead className="text-center">Cycle</TableHead>
                <TableHead className="text-center">Idle</TableHead>
                <TableHead className="text-center">Unutilised</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow
                    key={i}
                    className="hover:bg-transparent"
                  >
                    <TableCell colSpan={7} className="py-3">
                      <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredActivities.length > 0 ? (
                filteredActivities.map((item) => {
                  const activityId = getActivityId(item);
                  const activityName = getActivityName(item);
                  const activityType = getActivityType(item);
                  const componentId = getComponentId(item);
                  const isActive = getActivityStatus(item);

                  const selectedComponent = components.find(
                    (component) =>
                      Number(component.componentID ?? component.ComponentID) ===
                      Number(componentId)
                  );

                  const componentName = selectedComponent
                    ? getComponentName(selectedComponent)
                    : componentId;

                  return (
                    <TableRow
                      key={activityId}
                      className="group transition-colors"
                    >
                      <TableCell className="max-w-48 font-medium">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                            {getInitials(activityName)}
                          </div>
                          <span title={activityName}>
                            {activityName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-48 truncate">
                        <span title={String(componentName)}>
                          {String(componentName)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {isTypeMatched(activityType, "cycle") ? (
                          <Check className="mx-auto size-4 text-emerald-600" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {isTypeMatched(activityType, "idle") ? (
                          <Check className="mx-auto size-4 text-emerald-600" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {isTypeMatched(activityType, "unutilised") ? (
                          <Check className="mx-auto size-4 text-emerald-600" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={isActive ? "success" : "secondary"}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(activityId)}
                          >
                            <Pencil className="size-3.5" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDelete(activityId)}
                          >
                            <Trash2 className="size-3.5" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={7}
                    className="h-48 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <div className="flex size-11 items-center justify-center rounded-full bg-muted">
                        <ListChecks className="size-5" />
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {search
                          ? "No matching activities"
                          : "No activities yet"}
                      </p>
                      <p className="text-xs">
                        {search
                          ? "Try a different name."
                          : "Add your first activity using the Add button."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ================= ADD / EDIT DIALOG ================= */}
      <FormDialog
        open={showForm}
        onClose={closeForm}
        onSubmit={handleSubmit}
        icon={ListChecks}
        isEdit={isEdit}
        title={isEdit ? "Edit Activity" : "Add Activity"}
        description={
          isEdit
            ? "Update the activity details below."
            : "Fill in the details to add a new activity."
        }
        submitLabel={isEdit ? "Update Activity" : "Save Activity"}
        saving={saving}
      >
        {/* ACTIVITY NAME */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="activitiesName">Activity Name <span className="text-destructive">*</span></Label>
          <Input
            id="activitiesName"
            type="text"
            name="activitiesName"
            value={activity.activitiesName}
            onChange={handleChange}
            placeholder="Enter Activity Name"
            maxLength={100}
            disabled={saving}
            aria-invalid={!!fieldErrors.activitiesName}
          />
          <FormError message={fieldErrors.activitiesName} />
        </div>

        {/* COMPONENT */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="componentID">Component <span className="text-destructive">*</span></Label>
          <Select
            value={String(activity.componentID)}
            onValueChange={handleComponentChange}
            disabled={saving}
          >
            <SelectTrigger
              id="componentID"
              className="w-full"
              aria-invalid={!!fieldErrors.componentID}
            >
              <SelectValue placeholder="Select Component" />
            </SelectTrigger>
            <SelectContent>
              {components.map((comp) => {
                const id = comp.componentID ?? comp.ComponentID;
                const name = getComponentName(comp);

                return (
                  <SelectItem key={String(id)} value={String(id)}>
                    {name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <FormError message={fieldErrors.componentID} />
        </div>

        {/* TYPE */}
        <div className="flex flex-col gap-2">
          <Label>Type</Label>
          <RadioGroup
            value={activity.type}
            onValueChange={handleTypeChange}
          >
            {typeOptions.map((option) => (
              <div
                key={option}
                className="flex items-center gap-2"
              >
                <RadioGroupItem value={option} id={`type-${option}`} />
                <Label
                  htmlFor={`type-${option}`}
                  className="font-normal"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
          <FormError message={fieldErrors.type} />
        </div>

        {/* STATUS */}
        <StatusToggle
          value={activity.status}
          onChange={handleStatusChange}
          disabled={saving}
        />
      </FormDialog>
    </div>
  );
}

export default Activities;