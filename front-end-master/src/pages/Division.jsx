import React, { useEffect, useMemo, useState } from "react";
import {
  Boxes,
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
import divisionService from "../services/divisionService";

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

function Division() {
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [division, setDivision] = useState({
    divisionId: 0,
    divisionName: "",
    divisionCode: "",
    status: "Active",
  });

  const confirmAction = useConfirm();
  const [isEdit, setIsEdit] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // =====================================================
  // CLEAR FIELD ERROR
  // =====================================================
  const clearFieldError = (name) => {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;

      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  // =====================================================
  // LOAD DIVISIONS
  // =====================================================
  const loadDivisions = async () => {
    try {
      setLoading(true);

      const response = await divisionService.getDivisions();

      setDivisions(response.data || []);
    } catch (err) {
      console.error("LOAD DIVISIONS ERROR:", err);
      notifyError(err, "Failed to load divisions.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================
  useEffect(() => {
    loadDivisions();
  }, []);

  // =====================================================
  // HANDLE CHANGE
  // =====================================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setDivision((prev) => ({
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

  // =====================================================
  // HANDLE STATUS CHANGE
  // =====================================================
  const handleStatusChange = (checked) => {
    setDivision((prev) => ({
      ...prev,
      status: checked ? "Active" : "Inactive",
    }));

    clearFieldError("status");
  };

  // =====================================================
  // CHECK DUPLICATE DIVISION NAME
  // =====================================================
  const isDuplicateDivisionName = () => {
    const enteredName = division.divisionName.trim().toLowerCase();

    return divisions.some((item) => {
      const existingName = (item.divisionName || "")
        .trim()
        .toLowerCase();

      // During edit, ignore the current division itself
      if (
        isEdit &&
        Number(item.divisionId) === Number(division.divisionId)
      ) {
        return false;
      }

      return existingName === enteredName;
    });
  };

  // =====================================================
  // HANDLE SUBMIT - CREATE / UPDATE
  // =====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};

    // ===================================================
    // VALIDATION
    // ===================================================

    if (!division.divisionName.trim()) {
      errors.divisionName = "Division Name is required.";
    }

    if (!division.divisionCode.trim()) {
      errors.divisionCode = "Division Code is required.";
    }

    if (isDuplicateDivisionName()) {
      errors.divisionName = `Division Name "${division.divisionName.trim()}" already exists. Please enter a different Division Name.`;
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setSaving(true);

      const requestData = {
        divisionId: Number(division.divisionId),
        divisionName: division.divisionName.trim(),
        divisionCode: division.divisionCode.trim(),
        status: division.status || "Active",
      };

      // =================================================
      // UPDATE
      // =================================================
      if (isEdit) {
        await divisionService.updateDivision(
          division.divisionId,
          requestData
        );

        notifySuccess("Division updated successfully");
      }

      // =================================================
      // CREATE
      // =================================================
      else {
        await divisionService.createDivision(requestData);

        notifySuccess("Division created successfully");
      }

      setShowForm(false);
      resetForm();
      await loadDivisions();
    } catch (err) {
      console.error("DIVISION SAVE ERROR:", err);
      notifyError(err, "Failed to save division.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // EDIT
  // =====================================================
  const handleEdit = async (id) => {
    try {
      const response = await divisionService.getDivisionById(id);

      const data = response.data;

      setDivision({
        divisionId: data.divisionId,
        divisionName: data.divisionName || "",
        divisionCode: data.divisionCode || "",
        status: data.status || "Active",
      });

      setIsEdit(true);
      setShowForm(true);
    } catch (err) {
      console.error("GET DIVISION ERROR:", err);
      notifyError(err, "Failed to load division details.");
    }
  };

  // =====================================================
  // DELETE
  // =====================================================
  const handleDelete = async (id) => {
    const confirmed = await confirmAction({
      title: "Delete division?",
      message:
        "Are you sure you want to delete this division? This action cannot be undone.",
      confirmText: "Delete",
    });

    if (!confirmed) {
      return;
    }

    try {
      await divisionService.deleteDivision(id);

      notifySuccess("Division deleted successfully");

      await loadDivisions();
    } catch (err) {
      console.error("DELETE DIVISION ERROR:", err);
      notifyError(err, "Failed to delete division.");
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
  // RESET FORM
  // =====================================================
  const resetForm = () => {
    setDivision({
      divisionId: 0,
      divisionName: "",
      divisionCode: "",
      status: "Active",
    });

    setIsEdit(false);
    setFieldErrors({});
  };

  // =====================================================
  // FILTERED LIST
  // =====================================================
  const filteredDivisions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return divisions;

    return divisions.filter((item) => {
      const name = (item.divisionName || "").toLowerCase();
      const code = (item.divisionCode || "").toLowerCase();
      return name.includes(term) || code.includes(term);
    });
  }, [divisions, search]);

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
        icon={Boxes}
        title="Divisions"
        description="Manage division master data."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={loadDivisions}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw
            className={`size-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="size-4" />
          Add Division
        </Button>
      </PageHeader>

      {/* ================= TABLE CARD ================= */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Division List</CardTitle>
            <Badge variant="secondary" className="rounded-full font-normal">
              {divisions.length}
            </Badge>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search divisions..."
              className="h-8 pl-8 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Division Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i} className="hover:bg-transparent">
                    <TableCell colSpan={4} className="py-3">
                      <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredDivisions.length > 0 ? (
                filteredDivisions.map((item) => (
                  <TableRow
                    key={item.divisionId}
                    className="group transition-colors"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                          {getInitials(item.divisionName)}
                        </div>
                        {item.divisionName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                        {item.divisionCode}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === "Active"
                            ? "success"
                            : "secondary"
                        }
                      >
                        {item.status || "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item.divisionId)}
                        >
                          <Pencil className="size-3.5" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDelete(item.divisionId)}
                        >
                          <Trash2 className="size-3.5" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={4} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <div className="flex size-11 items-center justify-center rounded-full bg-muted">
                        <Boxes className="size-5" />
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {search
                          ? "No matching divisions"
                          : "No divisions yet"}
                      </p>
                      <p className="text-xs">
                        {search
                          ? "Try a different name or code."
                          : "Add your first division using the Add button."}
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
        icon={Boxes}
        isEdit={isEdit}
        title={isEdit ? "Edit Division" : "Add Division"}
        description={
          isEdit
            ? "Update the division details below."
            : "Fill in the details to add a new division."
        }
        submitLabel={isEdit ? "Update Division" : "Save Division"}
        saving={saving}
      >
        {/* DIVISION NAME */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="divisionName">
            Division Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="divisionName"
            type="text"
            name="divisionName"
            value={division.divisionName}
            onChange={handleChange}
            placeholder="e.g. Manufacturing"
            maxLength={50}
            aria-invalid={!!fieldErrors.divisionName}
          />
          <FormError message={fieldErrors.divisionName} />
        </div>

        {/* DIVISION CODE */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="divisionCode">
            Division Code <span className="text-destructive">*</span>
          </Label>
          <Input
            id="divisionCode"
            type="text"
            name="divisionCode"
            value={division.divisionCode}
            onChange={handleChange}
            placeholder="e.g. MFG-01"
            maxLength={25}
            aria-invalid={!!fieldErrors.divisionCode}
            className="uppercase placeholder:normal-case"
          />
          <FormError message={fieldErrors.divisionCode} />
        </div>

        {/* STATUS */}
        <StatusToggle
          value={division.status}
          onChange={handleStatusChange}
          disabled={saving}
        />
      </FormDialog>
    </div>
  );
}

export default Division;