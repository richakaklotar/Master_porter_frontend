import React, { useEffect, useMemo, useState } from "react";
import {
  ListTree,
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
import subActivityService from "../services/subActivityService";
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

function SubActivities() {
  const [subActivities, setSubActivities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [components, setComponents] = useState([]);

  const [subActivity, setSubActivity] = useState({
    subActivitiesID: 0,
    subActivitiesName: "",
    activitiesID: "",
    componentID: "",
    status: "Active",
  });

  const confirmAction = useConfirm();
  const [isEdit, setIsEdit] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});

  const clearFieldError = (name) => {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;

      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  // =========================
  // LOAD SUB ACTIVITIES
  // =========================
  const loadSubActivities = async () => {
    try {
      setLoading(true);

      const response = await subActivityService.getSubActivities();

      setSubActivities(response.data || []);
    } catch (err) {
      console.error("Load SubActivities Error:", err);
      notifyError(err, "Failed to load sub activities.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD ACTIVITIES
  // =========================
  const loadActivities = async () => {
    try {
      const response = await activityService.getActivities();
      setActivities(response.data || []);
    } catch (err) {
      console.error("Load Activities Error:", err);
      notifyError(err, "Failed to load activities.");
    }
  };

  // =========================
  // LOAD COMPONENTS
  // =========================
  const loadComponents = async () => {
    try {
      const response = await componentService.getComponents();
      setComponents(response.data || []);
    } catch (err) {
      console.error("Load Components Error:", err);
      notifyError(err, "Failed to load components.");
    }
  };

  useEffect(() => {
    loadSubActivities();
    loadActivities();
    loadComponents();
  }, []);

  // =========================
  // FILTER ACTIVITIES
  // =========================
  const filteredActivities = activities.filter((act) => {
    if (!subActivity.componentID) return true;

    const actCompId = act.componentID ?? act.ComponentID;

    return String(actCompId) === String(subActivity.componentID);
  });

  // =========================
  // INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSubActivity((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
            ? "Active"
            : "Inactive"
          : value,
    }));

    clearFieldError(name);
  };

  // =========================
  // HANDLE COMPONENT CHANGE
  // =========================
  const handleComponentChange = (value) => {
    setSubActivity((prev) => ({
      ...prev,
      componentID: String(value ?? ""),
      activitiesID: "",
    }));

    clearFieldError("componentID");
    clearFieldError("activitiesID");
  };

  // =========================
  // HANDLE ACTIVITY CHANGE
  // =========================
  const handleActivityChange = (value) => {
    setSubActivity((prev) => ({
      ...prev,
      activitiesID: String(value ?? ""),
    }));

    clearFieldError("activitiesID");
  };

  // =========================
  // HANDLE STATUS CHANGE
  // =========================
  const handleStatusChange = (checked) => {
    setSubActivity((prev) => ({
      ...prev,
      status: checked ? "Active" : "Inactive",
    }));

    clearFieldError("status");
  };

  // =========================
  // GET SUB ACTIVITY ID
  // =========================
  const getSubActivityId = (item) =>
    item.subActivitiesID ?? item.SubActivitiesID ?? 0;

  // =========================
  // GET SUB ACTIVITY NAME
  // =========================
  const getSubActivityName = (item) =>
    item.subActivitiesName ?? item.SubActivitiesName ?? "";

  // =========================
  // CHECK DUPLICATE NAME
  // =========================
  const isDuplicateSubActivityName = (name) => {
    const normalizedName = name.trim().toLowerCase();
    const currentId = Number(subActivity.subActivitiesID || 0);

    return subActivities.some((item) => {
      const existingId = Number(getSubActivityId(item) || 0);
      const existingName = getSubActivityName(item).trim().toLowerCase();

      if (isEdit && existingId === currentId) {
        return false;
      }

      return existingName === normalizedName;
    });
  };

  // =========================
  // CREATE / UPDATE
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const subId = Number(subActivity.subActivitiesID || 0);
    const actId = Number(subActivity.activitiesID || 0);
    const compId = Number(subActivity.componentID || 0);
    const subName = subActivity.subActivitiesName.trim();
    const errors = {};

    if (!subActivity.componentID) {
      errors.componentID = "Please select Component.";
    }

    if (!subActivity.activitiesID) {
      errors.activitiesID = "Please select Activity.";
    }

    if (!subName) {
      errors.subActivitiesName = "Sub Activity Name is required.";
    }

    if (!subActivity.status) {
      errors.status = "Status field is required.";
    }

    if (isDuplicateSubActivityName(subName) && !errors.subActivitiesName) {
      errors.subActivitiesName = `Sub Activity "${subName}" already exists. Please enter a different name.`;
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setSaving(true);

      const requestData = {
        subActivitiesID: subId,
        SubActivitiesID: subId,
        subActivitiesName: subName,
        SubActivitiesName: subName,
        activitiesID: actId,
        ActivitiesID: actId,
        componentID: compId,
        ComponentID: compId,
        status: subActivity.status === "Active" ? "Active" : "Inactive",
      };

      if (isEdit) {
        await subActivityService.updateSubActivity(subId, requestData);
        notifySuccess("Sub Activity updated successfully");
      } else {
        await subActivityService.createSubActivity(requestData);
        notifySuccess("Sub Activity created successfully");
      }

      setShowForm(false);
      resetForm();
      await loadSubActivities();
    } catch (err) {
      console.error("Save SubActivity Error:", err);
      notifyError(err, "Failed to save sub activity.");
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = async (id) => {
    try {
      const response = await subActivityService.getSubActivityById(id);
      const data = response.data;
      const apiStatus = data.status ?? data.Status ?? "Active";

      setSubActivity({
        subActivitiesID: data.subActivitiesID ?? data.SubActivitiesID ?? 0,
        subActivitiesName:
          data.subActivitiesName ?? data.SubActivitiesName ?? "",
        activitiesID: data.activitiesID ?? data.ActivitiesID ?? "",
        componentID: data.componentID ?? data.ComponentID ?? "",
        status:
          typeof apiStatus === "boolean"
            ? apiStatus
              ? "Active"
              : "Inactive"
            : apiStatus === "Inactive"
            ? "Inactive"
            : "Active",
      });

      setIsEdit(true);
      setShowForm(true);
    } catch (err) {
      console.error("Get SubActivity Error:", err);
      notifyError(err, "Failed to load sub activity details.");
    }
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    const confirmed = await confirmAction({
      title: "Delete sub activity?",
      message:
        "Are you sure you want to delete this sub activity? This action cannot be undone.",
      confirmText: "Delete",
    });

    if (!confirmed) {
      return;
    }

    try {
      await subActivityService.deleteSubActivity(id);
      notifySuccess("Sub Activity deleted successfully");
      await loadSubActivities();
    } catch (err) {
      console.error("Delete SubActivity Error:", err);
      notifyError(err, "Failed to delete sub activity.");
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

  // =========================
  // RESET FORM
  // =========================
  const resetForm = () => {
    setSubActivity({
      subActivitiesID: 0,
      subActivitiesName: "",
      activitiesID: "",
      componentID: "",
      status: "Active",
    });

    setIsEdit(false);
    setFieldErrors({});
  };

  // =========================
  // FILTERED LIST
  // =========================
  const filteredSubActivities = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return subActivities;

    return subActivities.filter((item) => {
      const name = getSubActivityName(item).toLowerCase();
      return name.includes(term);
    });
  }, [subActivities, search]);

  // Two-letter initials used for the small avatar tile in each row
  const getInitials = (name = "") =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "—";

  // =========================
  // HELPERS
  // =========================
  const getActivityId = (item) => item.activitiesID ?? item.ActivitiesID ?? "";
  const getComponentId = (item) => item.componentID ?? item.ComponentID ?? "";
  const getActivityName = (item) =>
    item.activitiesName ?? item.ActivitiesName ?? item.name ?? item.Name ?? "";
  const getComponentName = (item) =>
    item.componentName ?? item.ComponentName ?? item.name ?? item.Name ?? "";

  const getStatus = (item) => {
    const status = item.status ?? item.Status;

    if (typeof status === "boolean") {
      return status ? "Active" : "Inactive";
    }

    return status === "Inactive" ? "Inactive" : "Active";
  };

  return (
    <div className="flex h-full min-h-[28rem] w-full flex-col">
      {/* ================= HEADER ================= */}
      <PageHeader
        icon={ListTree}
        title="Sub Activities"
        description="Manage sub-activity master data."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            loadSubActivities();
            loadActivities();
            loadComponents();
          }}
        >
          <RefreshCw className="size-4" />
          Refresh
        </Button>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="size-4" />
          Add Sub Activity
        </Button>
      </PageHeader>

      {/* ================= TABLE CARD ================= */}
      <Card className="min-h-0 flex-1 border-border/60 shadow-sm">
        <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Sub Activity List</CardTitle>
            <Badge variant="secondary" className="rounded-full font-normal">
              {subActivities.length}
            </Badge>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sub-activities..."
              className="h-8 pl-8 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Sub Activity</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Component</TableHead>
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
                    <TableCell colSpan={5} className="py-3">
                      <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredSubActivities.length > 0 ? (
                filteredSubActivities.map((item) => {
                  const subId = getSubActivityId(item);
                  const subName = getSubActivityName(item);
                  const actId = getActivityId(item);
                  const compId = getComponentId(item);
                  const status = getStatus(item);

                  const selectedActivity = activities.find(
                    (a) => String(getActivityId(a)) === String(actId)
                  );
                  const selectedComponent = components.find(
                    (c) => String(getComponentId(c)) === String(compId)
                  );

                  const actDisplayName = selectedActivity
                    ? getActivityName(selectedActivity)
                    : actId;
                  const compDisplayName = selectedComponent
                    ? getComponentName(selectedComponent)
                    : compId;

                  return (
                    <TableRow
                      key={subId}
                      className="group transition-colors"
                    >
                      <TableCell className="max-w-48 font-medium">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                            {getInitials(subName)}
                          </div>
                          <span title={subName}>{subName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-48 truncate">
                        <span title={String(actDisplayName)}>
                          {String(actDisplayName)}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-48 truncate">
                        <span title={String(compDisplayName)}>
                          {String(compDisplayName)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={status === "Active" ? "success" : "secondary"}
                        >
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(subId)}
                          >
                            <Pencil className="size-3.5" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDelete(subId)}
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
                    colSpan={5}
                    className="h-48 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <div className="flex size-11 items-center justify-center rounded-full bg-muted">
                        <ListTree className="size-5" />
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {search
                          ? "No matching sub-activities"
                          : "No sub-activities yet"}
                      </p>
                      <p className="text-xs">
                        {search
                          ? "Try a different name."
                          : "Add your first sub-activity using the Add button."}
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
        icon={ListTree}
        isEdit={isEdit}
        title={isEdit ? "Edit Sub Activity" : "Add Sub Activity"}
        description={
          isEdit
            ? "Update the sub-activity details below."
            : "Fill in the details to add a new sub-activity."
        }
        submitLabel={isEdit ? "Update Sub Activity" : "Save Sub Activity"}
        saving={saving}
      >
        {/* COMPONENT */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="componentID">Component <span className="text-destructive">*</span></Label>
          <Select
            value={String(subActivity.componentID)}
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
                const cId = comp.componentID ?? comp.ComponentID;
                const cName =
                  comp.componentName ??
                  comp.ComponentName ??
                  comp.name ??
                  comp.Name;

                return (
                  <SelectItem key={String(cId)} value={String(cId)}>
                    {cName}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <FormError message={fieldErrors.componentID} />
        </div>

        {/* ACTIVITY */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="activitiesID">Activity <span className="text-destructive">*</span></Label>
          <Select
            value={String(subActivity.activitiesID)}
            onValueChange={handleActivityChange}
            disabled={saving}
          >
            <SelectTrigger
              id="activitiesID"
              className="w-full"
              aria-invalid={!!fieldErrors.activitiesID}
            >
              <SelectValue placeholder="Select Activity" />
            </SelectTrigger>
            <SelectContent>
              {filteredActivities.map((act) => {
                const aId = act.activitiesID ?? act.ActivitiesID;
                const aName =
                  act.activitiesName ??
                  act.ActivitiesName ??
                  act.name ??
                  act.Name;

                return (
                  <SelectItem key={String(aId)} value={String(aId)}>
                    {aName}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <FormError message={fieldErrors.activitiesID} />
        </div>

        {/* SUB ACTIVITY NAME */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="subActivitiesName">Sub Activity Name <span className="text-destructive">*</span></Label>
          <Input
            id="subActivitiesName"
            type="text"
            name="subActivitiesName"
            value={subActivity.subActivitiesName}
            onChange={handleChange}
            placeholder="Enter Sub Activity Name"
            maxLength={100}
            disabled={saving}
            aria-invalid={!!fieldErrors.subActivitiesName}
          />
          <FormError message={fieldErrors.subActivitiesName} />
        </div>

        {/* STATUS */}
        <StatusToggle
          value={subActivity.status}
          onChange={handleStatusChange}
          disabled={saving}
        />
      </FormDialog>
    </div>
  );
}

export default SubActivities;