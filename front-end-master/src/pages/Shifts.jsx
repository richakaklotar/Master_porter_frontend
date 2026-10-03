import React, { useEffect, useMemo, useState } from "react";
import {
  Clock,
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
import shiftService from "../services/shiftService";

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
import { StatusToggle } from "@/components/ui/status-toggle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function Shifts() {
  const [shifts, setShifts] = useState([]);

  const [shift, setShift] = useState({
    shiftID: 0,
    shiftName: "",
    startTime: "",
    endTime: "",
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
  // FORMAT TIME FOR INPUT
  // =========================
  const formatTimeForInput = (timeString) => {
    if (!timeString) return "";
    return String(timeString).substring(0, 5);
  };

  // =========================
  // FORMAT TIME FOR DISPLAY
  // =========================
  const formatTimeDisplay = (timeString) => {
    if (!timeString) return "-";

    const cleanTime = String(timeString).substring(0, 5);
    const [hoursStr, minutes] = cleanTime.split(":");

    let hours = parseInt(hoursStr, 10);

    if (isNaN(hours)) return timeString;

    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;

    return `${hours}:${minutes} ${ampm}`;
  };

  // =========================
  // GET SHIFT ID
  // =========================
  const getShiftId = (item) => {
    return item.shiftID ?? item.ShiftID ?? 0;
  };

  // =========================
  // GET SHIFT NAME
  // =========================
  const getShiftName = (item) => {
    return item.shiftName ?? item.ShiftName ?? "";
  };

  // =========================
  // CHECK DUPLICATE SHIFT NAME
  // =========================
  const isDuplicateShiftName = (name) => {
    const normalizedName = name.trim().toLowerCase();
    const currentId = Number(shift.shiftID || 0);

    return shifts.some((item) => {
      const existingId = Number(getShiftId(item));
      const existingName = getShiftName(item).trim().toLowerCase();

      // While editing, don't compare with current record
      if (isEdit && existingId === currentId) {
        return false;
      }

      return existingName === normalizedName;
    });
  };

  // =========================
  // LOAD SHIFTS
  // =========================
  const loadShifts = async () => {
    try {
      setLoading(true);

      const response = await shiftService.getShifts();

      setShifts(response.data || []);
    } catch (err) {
      console.error("Load Shifts Error:", err);
      notifyError(err, "Failed to load shifts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShifts();
  }, []);

  // =========================
  // INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setShift((prev) => ({
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
  // HANDLE STATUS CHANGE
  // =========================
  const handleStatusChange = (checked) => {
    setShift((prev) => ({
      ...prev,
      status: checked ? "Active" : "Inactive",
    }));

    clearFieldError("status");
  };

  // =========================
  // CREATE / UPDATE
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const sId = Number(shift.shiftID || 0);
    const shiftName = shift.shiftName.trim();
    const errors = {};

    // =========================
    // VALIDATION
    // =========================

    if (!shiftName) {
      errors.shiftName = "Shift Name is required.";
    }

    if (!shift.startTime) {
      errors.startTime = "Start Time is required.";
    }

    if (!shift.endTime) {
      errors.endTime = "End Time is required.";
    }

    if (!shift.status) {
      errors.status = "Status is required.";
    }

    if (isDuplicateShiftName(shiftName) && !errors.shiftName) {
      errors.shiftName = `Shift Name "${shiftName}" already exists. Please enter a different Shift Name.`;
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setSaving(true);

      const formattedStartTime =
        shift.startTime.length === 5
          ? `${shift.startTime}:00`
          : shift.startTime;

      const formattedEndTime =
        shift.endTime.length === 5
          ? `${shift.endTime}:00`
          : shift.endTime;

      // =========================
      // REQUEST DATA
      // =========================

      const requestData = {
        shiftID: sId,
        ShiftID: sId,

        shiftName: shiftName,
        ShiftName: shiftName,

        startTime: formattedStartTime,
        StartTime: formattedStartTime,

        endTime: formattedEndTime,
        EndTime: formattedEndTime,

        status: shift.status,
        Status: shift.status,
      };

      // =========================
      // UPDATE
      // =========================

      if (isEdit) {
        await shiftService.updateShift(sId, requestData);

        notifySuccess("Shift updated successfully");
      }

      // =========================
      // CREATE
      // =========================

      else {
        await shiftService.createShift(requestData);

        notifySuccess("Shift created successfully");
      }

      setShowForm(false);
      resetForm();

      await loadShifts();
    } catch (err) {
      console.error("Save Shift Error:", err);
      notifyError(err, "Failed to save shift.");
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = async (id) => {
    try {
      const response = await shiftService.getShiftById(id);
      const data = response.data;

      const apiStatus = data.status ?? data.Status;

      let normalizedStatus = "Active";

      if (typeof apiStatus === "boolean") {
        normalizedStatus = apiStatus ? "Active" : "Inactive";
      } else if (String(apiStatus).toLowerCase() === "inactive") {
        normalizedStatus = "Inactive";
      } else if (String(apiStatus).toLowerCase() === "active") {
        normalizedStatus = "Active";
      }

      setShift({
        shiftID: data.shiftID ?? data.ShiftID ?? 0,
        shiftName: data.shiftName ?? data.ShiftName ?? "",
        startTime: formatTimeForInput(data.startTime ?? data.StartTime),
        endTime: formatTimeForInput(data.endTime ?? data.EndTime),
        status: normalizedStatus,
      });

      setIsEdit(true);
      setShowForm(true);
    } catch (err) {
      console.error("Get Shift Error:", err);
      notifyError(err, "Failed to load shift details.");
    }
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    const confirmed = await confirmAction({
      title: "Delete shift?",
      message:
        "Are you sure you want to delete this shift? This action cannot be undone.",
      confirmText: "Delete",
    });

    if (!confirmed) {
      return;
    }

    try {
      await shiftService.deleteShift(id);

      notifySuccess("Shift deleted successfully");

      await loadShifts();
    } catch (err) {
      console.error("Delete Shift Error:", err);
      notifyError(err, "Failed to delete shift.");
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
    setShift({
      shiftID: 0,
      shiftName: "",
      startTime: "",
      endTime: "",
      status: "Active",
    });

    setIsEdit(false);
    setFieldErrors({});
  };

  // =========================
  // FILTERED LIST
  // =========================
  const filteredShifts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return shifts;

    return shifts.filter((item) => {
      const name = (getShiftName(item) || "").toLowerCase();
      return name.includes(term);
    });
  }, [shifts, search]);

  // Two-letter initials used for the small avatar tile in each row
  const getInitials = (name = "") =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "—";

  return (
    <div className="w-full">
      {/* ================= HEADER ================= */}
      <PageHeader
        icon={Clock}
        title="Shifts"
        description="Manage shift master data."
      >
        <Button variant="outline" size="sm" onClick={loadShifts}>
          <RefreshCw className="size-4" />
          Refresh
        </Button>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="size-4" />
          Add Shift
        </Button>
      </PageHeader>

      {/* ================= TABLE CARD ================= */}
      <Card>
        <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Shift List</CardTitle>
            <Badge
              variant="secondary"
              className="rounded-full font-normal"
            >
              {shifts.length}
            </Badge>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shifts..."
              className="h-8 pl-8 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Shift</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i} className="hover:bg-transparent">
                    <TableCell colSpan={5} className="py-3">
                      <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredShifts.length > 0 ? (
                filteredShifts.map((item) => {
                  const sId = item.shiftID ?? item.ShiftID;
                  const sName = item.shiftName ?? item.ShiftName;
                  const startTimeVal = item.startTime ?? item.StartTime;
                  const endTimeVal = item.endTime ?? item.EndTime;
                  const itemStatus = item.status ?? item.Status;

                  const isActive =
                    typeof itemStatus === "boolean"
                      ? itemStatus
                      : String(itemStatus).toLowerCase() === "active";

                  return (
                    <TableRow
                      key={sId}
                      className="group transition-colors"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                            {getInitials(sName)}
                          </div>
                          {sName}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatTimeDisplay(startTimeVal)}
                      </TableCell>
                      <TableCell>
                        {formatTimeDisplay(endTimeVal)}
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
                            onClick={() => handleEdit(sId)}
                          >
                            <Pencil className="size-3.5" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDelete(sId)}
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
                        <Clock className="size-5" />
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {search
                          ? "No matching shifts"
                          : "No shifts yet"}
                      </p>
                      <p className="text-xs">
                        {search
                          ? "Try a different name."
                          : "Add your first shift using the Add button."}
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
        icon={Clock}
        isEdit={isEdit}
        title={isEdit ? "Edit Shift" : "Add Shift"}
        description={
          isEdit
            ? "Update the shift details below."
            : "Fill in the details to add a new shift."
        }
        submitLabel={isEdit ? "Update Shift" : "Save Shift"}
        saving={saving}
      >
        {/* SHIFT NAME */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="shiftName">Shift Name <span className="text-destructive">*</span></Label>
          <Input
            id="shiftName"
            type="text"
            name="shiftName"
            value={shift.shiftName}
            onChange={handleChange}
            placeholder="Enter Shift Name"
            maxLength={50}
            disabled={saving}
            aria-invalid={!!fieldErrors.shiftName}
          />
          <FormError message={fieldErrors.shiftName} />
        </div>

        {/* START TIME */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="startTime">Start Time <span className="text-destructive">*</span></Label>
          <Input
            id="startTime"
            type="time"
            name="startTime"
            value={shift.startTime}
            onChange={handleChange}
            disabled={saving}
            aria-invalid={!!fieldErrors.startTime}
          />
          <FormError message={fieldErrors.startTime} />
        </div>

        {/* END TIME */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="endTime">End Time <span className="text-destructive">*</span></Label>
          <Input
            id="endTime"
            type="time"
            name="endTime"
            value={shift.endTime}
            onChange={handleChange}
            disabled={saving}
            aria-invalid={!!fieldErrors.endTime}
          />
          <FormError message={fieldErrors.endTime} />
        </div>

        {/* STATUS */}
        <StatusToggle
          value={shift.status}
          onChange={handleStatusChange}
          disabled={saving}
        />
      </FormDialog>
    </div>
  );
}

export default Shifts;