import React, { useEffect, useMemo, useState } from "react";
import {
  Factory,
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
import plantService from "../services/plantService";

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

function Plant() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});

  const [plant, setPlant] = useState({
    plantId: 0,
    plantName: "",
    plantCode: "",
    status: "Active",
  });

  const confirmAction = useConfirm();
  const [isEdit, setIsEdit] = useState(false);
  const [showForm, setShowForm] = useState(false);

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
  // LOAD PLANTS
  // =====================================================
  const loadPlants = async () => {
    try {
      setLoading(true);

      const response = await plantService.getPlants();

      setPlants(response.data || []);
    } catch (err) {
      console.error("LOAD PLANTS ERROR:", err);
      notifyError(err, "Failed to load plants.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================
  useEffect(() => {
    loadPlants();
  }, []);

  // =====================================================
  // HANDLE CHANGE
  // =====================================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setPlant((prev) => ({
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
    setPlant((prev) => ({
      ...prev,
      status: checked ? "Active" : "Inactive",
    }));

    clearFieldError("status");
  };

  // =====================================================
  // CHECK DUPLICATE PLANT NAME
  // =====================================================
  const isDuplicatePlantName = () => {
    const enteredName = plant.plantName.trim().toLowerCase();

    return plants.some((item) => {
      const existingName = (item.plantName || "")
        .trim()
        .toLowerCase();

      // During edit, ignore the current plant itself
      if (
        isEdit &&
        Number(item.plantId) === Number(plant.plantId)
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

    if (!plant.plantName.trim()) {
      errors.plantName = "Plant Name is required.";
    }

    if (!plant.plantCode.trim()) {
      errors.plantCode = "Plant Code is required.";
    }

    if (isDuplicatePlantName()) {
      errors.plantName = `Plant Name "${plant.plantName.trim()}" already exists. Please enter a different Plant Name.`;
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setSaving(true);

      const requestData = {
        plantId: Number(plant.plantId),
        plantName: plant.plantName.trim(),
        plantCode: plant.plantCode.trim(),
        status: plant.status || "Active",
      };

      // =================================================
      // UPDATE
      // =================================================
      if (isEdit) {
        await plantService.updatePlant(
          plant.plantId,
          requestData
        );

        notifySuccess("Plant updated successfully");
      }

      // =================================================
      // CREATE
      // =================================================
      else {
        await plantService.createPlant(requestData);

        notifySuccess("Plant created successfully");
      }

      setShowForm(false);
      resetForm();
      await loadPlants();
    } catch (err) {
      console.error("PLANT SAVE ERROR:", err);
      notifyError(err, "Failed to save plant.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // EDIT
  // =====================================================
  const handleEdit = async (id) => {
    try {
      const response = await plantService.getPlantById(id);

      const data = response.data;

      setPlant({
        plantId: data.plantId,
        plantName: data.plantName || "",
        plantCode: data.plantCode || "",
        status: data.status || "Active",
      });

      setIsEdit(true);
      setShowForm(true);
    } catch (err) {
      console.error("GET PLANT ERROR:", err);
      notifyError(err, "Failed to load plant details.");
    }
  };

  // =====================================================
  // DELETE
  // =====================================================
  const handleDelete = async (id) => {
    const confirmed = await confirmAction({
      title: "Delete plant?",
      message:
        "Are you sure you want to delete this plant? This action cannot be undone.",
      confirmText: "Delete",
    });

    if (!confirmed) {
      return;
    }

    try {
      await plantService.deletePlant(id);

      notifySuccess("Plant deleted successfully");

      await loadPlants();
    } catch (err) {
      console.error("DELETE PLANT ERROR:", err);
      notifyError(err, "Failed to delete plant.");
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
    setPlant({
      plantId: 0,
      plantName: "",
      plantCode: "",
      status: "Active",
    });

    setIsEdit(false);
    setFieldErrors({});
  };

  // =====================================================
  // FILTERED LIST
  // =====================================================
  const filteredPlants = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return plants;

    return plants.filter((item) => {
      const name = (item.plantName || "").toLowerCase();
      const code = (item.plantCode || "").toLowerCase();
      return name.includes(term) || code.includes(term);
    });
  }, [plants, search]);

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
        icon={Factory}
        title="Plants"
        description="Manage plant master data."
      >
        <Button variant="outline" size="sm" onClick={loadPlants}>
          <RefreshCw className="size-4" />
          Refresh
        </Button>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="size-4" />
          Add Plant
        </Button>
      </PageHeader>

      {/* ================= TABLE CARD ================= */}
      <Card>
        <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Plant List</CardTitle>
            <Badge
              variant="secondary"
              className="rounded-full font-normal"
            >
              {plants.length}
            </Badge>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plants..."
              className="h-8 pl-8 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Plant Name</TableHead>
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
              ) : filteredPlants.length > 0 ? (
                filteredPlants.map((item) => (
                  <TableRow
                    key={item.plantId}
                    className="group transition-colors"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                          {getInitials(item.plantName)}
                        </div>
                        {item.plantName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                        {item.plantCode}
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
                          onClick={() =>
                            handleEdit(item.plantId)
                          }
                        >
                          <Pencil className="size-3.5" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() =>
                            handleDelete(item.plantId)
                          }
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
                  <TableCell
                    colSpan={4}
                    className="h-48 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <div className="flex size-11 items-center justify-center rounded-full bg-muted">
                        <Factory className="size-5" />
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {search
                          ? "No matching plants"
                          : "No plants yet"}
                      </p>
                      <p className="text-xs">
                        {search
                          ? "Try a different name."
                          : "Add your first plant using the Add button."}
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
        icon={Factory}
        isEdit={isEdit}
        title={isEdit ? "Edit Plant" : "Add Plant"}
        description={
          isEdit
            ? "Update the plant details below."
            : "Fill in the details to add a new plant."
        }
        submitLabel={isEdit ? "Update Plant" : "Save Plant"}
        saving={saving}
      >
        {/* PLANT NAME */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="plantName">Plant Name <span className="text-destructive">*</span></Label>
          <Input
            id="plantName"
            type="text"
            name="plantName"
            value={plant.plantName}
            onChange={handleChange}
            placeholder="Enter Plant Name"
            maxLength={25}
            aria-invalid={!!fieldErrors.plantName}
          />
          <FormError message={fieldErrors.plantName} />
        </div>

        {/* PLANT CODE */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="plantCode">Plant Code <span className="text-destructive">*</span></Label>
          <Input
            id="plantCode"
            type="text"
            name="plantCode"
            value={plant.plantCode}
            onChange={handleChange}
            placeholder="Enter Plant Code"
            maxLength={25}
            aria-invalid={!!fieldErrors.plantCode}
          />
          <FormError message={fieldErrors.plantCode} />
        </div>

        {/* STATUS */}
        <StatusToggle
          value={plant.status}
          onChange={handleStatusChange}
          disabled={saving}
        />
      </FormDialog>
    </div>
  );
}

export default Plant;