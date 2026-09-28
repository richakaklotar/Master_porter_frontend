import React, { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  LoaderCircle,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import PageHeader from "../components/page-header";
import FormError from "../components/form-error";
import designationService from "../services/designationService";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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

function Designation() {
  const [designations, setDesignations] = useState([]);

  const [designation, setDesignation] = useState({
    designationId: 0,
    designationName: "",
    status: "Active",
  });

  const [isEdit, setIsEdit] = useState(false);
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
  // EXTRACT ID
  // =========================
  const extractId = (item) => {
    if (!item) return 0;

    const id =
      item.designationId ??
      item.designationID ??
      item.DesignationId ??
      item.DesignationID ??
      item.id ??
      item.ID ??
      item.Id ??
      0;

    return Number(id);
  };

  // =========================
  // EXTRACT NAME
  // =========================
  const extractName = (item) => {
    if (!item) return "";

    return (
      item.designationName ??
      item.DesignationName ??
      item.designation ??
      item.Designation ??
      ""
    );
  };

  // =========================
  // EXTRACT STATUS
  // =========================
  const extractStatus = (item) => {
    if (!item) return "Active";

    const value = item.status ?? item.Status;

    if (typeof value === "boolean") {
      return value ? "Active" : "Inactive";
    }

    return String(value).toLowerCase() === "inactive"
      ? "Inactive"
      : "Active";
  };

  // =========================
  // GET ALL DESIGNATIONS
  // =========================
  const loadDesignations = async () => {
    try {
      setLoading(true);

      const response = await designationService.getDesignations();

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setDesignations(data);
    } catch (err) {
      console.error("Get Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDesignations();
  }, []);

  // =========================
  // INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setDesignation((prev) => ({
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
    setDesignation((prev) => ({
      ...prev,
      status: checked ? "Active" : "Inactive",
    }));

    clearFieldError("status");
  };

  // =========================
  // DUPLICATE DESIGNATION NAME
  // =========================
  const isDuplicateDesignationName = (name) => {
    const normalizedName = name.trim().toLowerCase();

    const currentId = Number(designation.designationId || 0);

    return designations.some((item) => {
      const existingId = extractId(item);

      const existingName = extractName(item).trim().toLowerCase();

      // EDIT MODE:
      // Ignore current record
      if (isEdit && existingId === currentId) {
        return false;
      }

      // CREATE / OTHER RECORD:
      // Check duplicate name
      return existingName === normalizedName;
    });
  };

  // =========================
  // CREATE / UPDATE
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = designation.designationName.trim();
    const errors = {};

    // =========================
    // NAME REQUIRED
    // =========================
    if (!name) {
      errors.designationName = "Designation name is required.";
    }

    // =========================
    // DUPLICATE NAME CHECK
    // =========================
    if (isDuplicateDesignationName(name) && !errors.designationName) {
      errors.designationName = `Designation "${name}" already exists. Please enter a different designation name.`;
    }

    // =========================
    // STATUS REQUIRED
    // =========================
    if (!designation.status) {
      errors.status = "Status is required.";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setSaving(true);

      // =========================
      // UPDATE
      // =========================
      if (isEdit) {
        const id = Number(designation.designationId);

        if (!id || id <= 0) {
          return;
        }

        const requestData = {
          id: id,

          designationId: id,
          DesignationId: id,
          DesignationID: id,

          designationName: name,
          DesignationName: name,

          status: designation.status,
          Status: designation.status,
        };

        await designationService.updateDesignation(id, requestData);

        alert("Designation updated successfully.");
      }

      // =========================
      // CREATE
      // =========================
      else {
        const requestData = {
          designationName: name,
          DesignationName: name,

          status: designation.status,
          Status: designation.status,
        };

        await designationService.createDesignation(requestData);

        alert("Designation created successfully.");
      }

      // Reset form
      resetForm();

      // Reload table
      await loadDesignations();
    } catch (err) {
      console.error("Save Error:", err);
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = (item) => {
    const id = extractId(item);
    const name = extractName(item);
    const status = extractStatus(item);

    if (!id || id <= 0) {
      return;
    }

    setDesignation({
      designationId: id,
      designationName: name,
      status: status,
    });

    setIsEdit(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (item) => {
    const id = extractId(item);

    if (!id || id <= 0) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this designation?"
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      await designationService.deleteDesignation(id);

      alert("Designation deleted successfully.");

      if (Number(designation.designationId) === id) {
        resetForm();
      }

      await loadDesignations();
    } catch (err) {
      console.error("Delete Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RESET FORM
  // =========================
  const resetForm = () => {
    setDesignation({
      designationId: 0,
      designationName: "",
      status: "Active",
    });

    setIsEdit(false);
    setFieldErrors({});
  };

  // =========================
  // FILTERED LIST
  // =========================
  const filteredDesignations = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return designations;

    return designations.filter((item) => {
      const name = (extractName(item) || "").toLowerCase();
      return name.includes(term);
    });
  }, [designations, search]);

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
        icon={BadgeCheck}
        title="Designations"
        description="Manage designation master data."
      >
        <Button variant="outline" size="sm" onClick={loadDesignations}>
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </PageHeader>

      {/* ================= CONTENT ================= */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        {/* ===== FORM CARD ===== */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {isEdit ? (
                  <Pencil className="size-4" />
                ) : (
                  <BadgeCheck className="size-4" />
                )}
              </div>
              <div>
                <CardTitle>
                  {isEdit ? "Edit Designation" : "Add Designation"}
                </CardTitle>
                <CardDescription>
                  {isEdit
                    ? "Update the designation details below."
                    : "Fill in the details to add a new designation."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* DESIGNATION NAME */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="designationName">Designation Name <span className="text-destructive">*</span></Label>
                <Input
                  id="designationName"
                  type="text"
                  name="designationName"
                  value={designation.designationName}
                  onChange={handleChange}
                  placeholder="Enter designation name"
                  maxLength={50}
                  disabled={saving}
                  aria-invalid={!!fieldErrors.designationName}
                />
                <FormError message={fieldErrors.designationName} />
              </div>

              {/* STATUS + BUTTONS */}
              <div className="mt-1 flex flex-col gap-4">
                <StatusToggle
                  value={designation.status}
                  onChange={handleStatusChange}
                  disabled={saving}
                />

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1"
                  >
                    {saving ? (
                      <>
                        <LoaderCircle className="size-4 animate-spin" />
                        Saving...
                      </>
                    ) : isEdit ? (
                      "Update Designation"
                    ) : (
                      "Save Designation"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* ===== TABLE CARD ===== */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
            <div className="flex items-center gap-2">
              <CardTitle>Designation List</CardTitle>
              <Badge
                variant="secondary"
                className="rounded-full font-normal"
              >
                {designations.length}
              </Badge>
            </div>
            <div className="relative w-full max-w-[220px]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search designations..."
                className="h-8 pl-8 text-sm"
              />
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Designation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i} className="hover:bg-transparent">
                      <TableCell colSpan={3} className="py-3">
                        <div className="h-4 w-full animate-pulse rounded bg-muted" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredDesignations.length > 0 ? (
                  filteredDesignations.map((item, index) => {
                    const id = extractId(item);
                    const name = extractName(item);
                    const status = extractStatus(item);
                    const isActive = status === "Active";

                    return (
                      <TableRow
                        key={id || index}
                        className="group transition-colors"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                              {getInitials(name)}
                            </div>
                            {name}
                          </div>
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
                              onClick={() => handleEdit(item)}
                            >
                              <Pencil className="size-3.5" />
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleDelete(item)}
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
                      colSpan={3}
                      className="h-48 text-center"
                    >
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <div className="flex size-11 items-center justify-center rounded-full bg-muted">
                          <BadgeCheck className="size-5" />
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          {search
                            ? "No matching designations"
                            : "No designations yet"}
                        </p>
                        <p className="text-xs">
                          {search
                            ? "Try a different name."
                            : "Add your first designation using the form."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Designation;