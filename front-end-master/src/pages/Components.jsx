import { useEffect, useMemo, useState } from "react";
import {
  Component as ComponentIcon,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import PageHeader from "../components/page-header";
import { useConfirm } from "../components/confirm-dialog";
import { notifyError, notifySuccess } from "../lib/notify";
import FormDialog from "../components/form-dialog";
import FormError from "../components/form-error";
import componentsService from "../services/componentsService";
import projectService from "../services/projectService";
import machineService from "../services/machineService";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

function Components() {
  const [components, setComponents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [machines, setMachines] = useState([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [component, setComponent] = useState({
    componentID: 0,
    componentName: "",
    standardHours: "",
    topHours: "",
    bottomHours: "",
    sideHours: "",
    stock: "",
    seriesNo: "",
    projectID: "",
    machineID: "",
    status: "Active",
  });

  const confirmAction = useConfirm();
  const [isEdit, setIsEdit] = useState(false);
  const [saving, setSaving] = useState(false);

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
  // GET ENTITY PROPERTY
  // =====================================================
  const getEntityProperty = (obj, key) => {
    if (!obj) return undefined;

    const lowerKey = key.toLowerCase();

    const matchedKey = Object.keys(obj).find(
      (k) => k.toLowerCase() === lowerKey,
    );

    return matchedKey ? obj[matchedKey] : undefined;
  };

  // =====================================================
  // LOAD ALL DATA
  // =====================================================
  const loadData = async () => {
    try {
      setLoading(true);

      const [componentRes, projectRes, machineRes] = await Promise.allSettled([
        componentsService.getComponents(),
        projectService.getProjects(),
        machineService.getMachines(),
      ]);

      // COMPONENTS
      if (componentRes.status === "fulfilled") {
        const responseData = componentRes.value?.data;

        const data = Array.isArray(responseData)
          ? responseData
          : Array.isArray(responseData?.data)
            ? responseData.data
            : [];

        setComponents(data);
      } else {
        throw componentRes.reason;
      }

      // PROJECTS
      if (projectRes.status === "fulfilled") {
        const responseData = projectRes.value?.data;

        const data = Array.isArray(responseData)
          ? responseData
          : Array.isArray(responseData?.data)
            ? responseData.data
            : [];

        setProjects(data);
      } else {
        console.error("Project API failed:", projectRes.reason);
        notifyError(projectRes.reason, "Failed to load projects.");
      }

      // MACHINES
      if (machineRes.status === "fulfilled") {
        const responseData = machineRes.value?.data;

        const data = Array.isArray(responseData)
          ? responseData
          : Array.isArray(responseData?.data)
            ? responseData.data
            : [];

        setMachines(data);
      } else {
        console.error("Machine API failed:", machineRes.reason);
        notifyError(machineRes.reason, "Failed to load machines.");
      }
    } catch (err) {
      console.error("COMPONENT LOAD ERROR:", err);
      notifyError(err, "Failed to load components.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================
  useEffect(() => {
    loadData();
  }, []);

  // =====================================================
  // HOURS LOGIC
  // =====================================================

  /*
    IMPORTANT:
    0 is treated as EMPTY.

    API usually returns:
    standardHours: 0
    topHours: 0
    bottomHours: 0
    sideHours: 0

    So 0 should NOT disable fields.
  */

  const hasStandardHours =
    component.standardHours !== "" &&
    component.standardHours !== null &&
    component.standardHours !== undefined &&
    Number(component.standardHours) > 0;

  const hasOtherHours =
    (component.topHours !== "" &&
      component.topHours !== null &&
      component.topHours !== undefined &&
      Number(component.topHours) > 0) ||
    (component.bottomHours !== "" &&
      component.bottomHours !== null &&
      component.bottomHours !== undefined &&
      Number(component.bottomHours) > 0) ||
    (component.sideHours !== "" &&
      component.sideHours !== null &&
      component.sideHours !== undefined &&
      Number(component.sideHours) > 0);

  // =====================================================
  // INPUT CHANGE
  // =====================================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    clearFieldError(name);

    // When editing any hour field, clear the shared hours error
    if (
      name === "standardHours" ||
      name === "topHours" ||
      name === "bottomHours" ||
      name === "sideHours"
    ) {
      clearFieldError("hours");
    }

    setComponent((prev) => {
      // STATUS
      if (type === "checkbox" && name === "status") {
        return {
          ...prev,
          status: checked ? "Active" : "Inactive",
        };
      }

      // ================================================
      // STANDARD HOURS
      // ================================================
      if (name === "standardHours") {
        if (value !== "") {
          return {
            ...prev,
            standardHours: value,

            // Clear other hours
            topHours: "",
            bottomHours: "",
            sideHours: "",
          };
        }

        return {
          ...prev,
          standardHours: "",
        };
      }

      // ================================================
      // TOP / BOTTOM / SIDE HOURS
      // ================================================
      if (
        name === "topHours" ||
        name === "bottomHours" ||
        name === "sideHours"
      ) {
        if (value !== "") {
          return {
            ...prev,
            [name]: value,

            // Clear standard hours
            standardHours: "",
          };
        }

        return {
          ...prev,
          [name]: value,
        };
      }

      // ================================================
      // NORMAL INPUT
      // ================================================
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  // =====================================================
  // HANDLE STATUS CHANGE
  // =====================================================
  const handleStatusChange = (checked) => {
    setComponent((prev) => ({
      ...prev,
      status: checked ? "Active" : "Inactive",
    }));

    clearFieldError("status");
  };

  // =====================================================
  // HANDLE PROJECT CHANGE
  // =====================================================
  const handleProjectChange = (value) => {
    setComponent((prev) => ({
      ...prev,
      projectID: String(value ?? ""),
    }));

    clearFieldError("projectID");
  };

  // =====================================================
  // HANDLE MACHINE CHANGE
  // =====================================================
  const handleMachineChange = (value) => {
    setComponent((prev) => ({
      ...prev,
      machineID: String(value ?? ""),
    }));

    clearFieldError("machineID");
  };

  // =====================================================
  // DUPLICATE COMPONENT NAME
  // =====================================================
  const isDuplicateComponentName = () => {
    const enteredName = component.componentName.trim().toLowerCase();
    const currentId = Number(component.componentID || 0);

    if (!enteredName) {
      return false;
    }

    return components.some((item) => {
      const itemId = Number(getEntityProperty(item, "componentID") || 0);

      const itemName = String(getEntityProperty(item, "componentName") || "")
        .trim()
        .toLowerCase();

      return itemId !== currentId && itemName === enteredName;
    });
  };

  // =====================================================
  // DUPLICATE SERIES NO
  // =====================================================
  const isDuplicateSeriesNo = () => {
    const enteredSeries = component.seriesNo.trim().toLowerCase();
    const currentId = Number(component.componentID || 0);

    if (!enteredSeries) {
      return false;
    }

    return components.some((item) => {
      const itemId = Number(getEntityProperty(item, "componentID") || 0);

      const itemSeries = String(getEntityProperty(item, "seriesNo") || "")
        .trim()
        .toLowerCase();

      return itemId !== currentId && itemSeries === enteredSeries;
    });
  };

  // =====================================================
  // VALIDATION
  // =====================================================
  const validateComponent = () => {
    const componentName = component.componentName.trim();
    const seriesNo = component.seriesNo.trim();
    const errors = {};

    // Component Name
    if (!componentName) {
      errors.componentName = "Component Name is required.";
    }

    // Duplicate Component Name
    if (isDuplicateComponentName()) {
      errors.componentName =
        "Component Name already exists. Please enter a different Component Name.";
    }

    // Series No
    if (!seriesNo) {
      errors.seriesNo = "Series No is required.";
    }

    // Duplicate Series No
    if (isDuplicateSeriesNo()) {
      errors.seriesNo =
        "Series No already exists. Please enter a different Series No.";
    }

    // Hours
    if (Object.keys(errors).length === 0) {
      if (component.standardHours === "" && !hasOtherHours) {
        errors.hours = "Please enter Standard Hours or Top/Bottom/Side Hours.";
      }

      if (
        component.standardHours !== "" &&
        Number(component.standardHours) < 0
      ) {
        errors.standardHours = "Standard Hours cannot be negative.";
      }

      if (component.topHours !== "" && Number(component.topHours) < 0) {
        errors.topHours = "Top Hours cannot be negative.";
      }

      if (component.bottomHours !== "" && Number(component.bottomHours) < 0) {
        errors.bottomHours = "Bottom Hours cannot be negative.";
      }

      if (component.sideHours !== "" && Number(component.sideHours) < 0) {
        errors.sideHours = "Side Hours cannot be negative.";
      }
    }

    // Stock
    if (component.stock === "") {
      errors.stock = "Stock is required.";
    } else if (Number(component.stock) < 0) {
      errors.stock = "Stock cannot be negative.";
    }

    // Project
    if (!component.projectID || Number(component.projectID) <= 0) {
      errors.projectID = "Please select a Project.";
    }

    // Machine
    if (!component.machineID || Number(component.machineID) <= 0) {
      errors.machineID = "Please select a Machine.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // =====================================================
  // CREATE / UPDATE
  // =====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateComponent()) {
      return;
    }

    try {
      setSaving(true);

      const requestData = {
        componentID: Number(component.componentID || 0),
        componentName: component.componentName.trim(),
        standardHours:
          component.standardHours === "" ? 0 : Number(component.standardHours),
        topHours: component.topHours === "" ? 0 : Number(component.topHours),
        bottomHours:
          component.bottomHours === "" ? 0 : Number(component.bottomHours),
        sideHours: component.sideHours === "" ? 0 : Number(component.sideHours),
        stock: Number(component.stock),
        seriesNo: component.seriesNo.trim(),
        projectID: Number(component.projectID),
        machineID: Number(component.machineID),
        status: component.status || "Active",
        Status: component.status || "Active",
      };

      // UPDATE
      if (isEdit) {
        await componentsService.updateComponent(
          Number(component.componentID),
          requestData,
        );

        notifySuccess("Component updated successfully.");
      }

      // CREATE
      else {
        await componentsService.createComponent(requestData);

        notifySuccess("Component created successfully.");
      }

      resetForm();
      setShowForm(false);

      await loadData();
    } catch (err) {
      console.error("COMPONENT SAVE ERROR:", err);
      notifyError(err, "Failed to save component.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // EDIT COMPONENT
  // =====================================================
  const handleEdit = async (id) => {
    if (!id || Number(id) <= 0) {
      return;
    }

    try {
      setSaving(true);

      const response = await componentsService.getComponentById(Number(id));

      const data = response?.data;

      // ================================================
      // GET HOURS FROM API
      // ================================================
      const apiStandardHours = getEntityProperty(data, "standardHours");
      const apiTopHours = getEntityProperty(data, "topHours");
      const apiBottomHours = getEntityProperty(data, "bottomHours");
      const apiSideHours = getEntityProperty(data, "sideHours");

      /*
        Convert API 0 values to empty string.
      */

      const standardValue =
        apiStandardHours !== null &&
        apiStandardHours !== undefined &&
        Number(apiStandardHours) > 0
          ? String(apiStandardHours)
          : "";

      const topValue =
        apiTopHours !== null &&
        apiTopHours !== undefined &&
        Number(apiTopHours) > 0
          ? String(apiTopHours)
          : "";

      const bottomValue =
        apiBottomHours !== null &&
        apiBottomHours !== undefined &&
        Number(apiBottomHours) > 0
          ? String(apiBottomHours)
          : "";

      const sideValue =
        apiSideHours !== null &&
        apiSideHours !== undefined &&
        Number(apiSideHours) > 0
          ? String(apiSideHours)
          : "";

      // ================================================
      // SET EDIT DATA
      // ================================================
      setComponent({
        componentID: Number(getEntityProperty(data, "componentID") ?? id),
        componentName: getEntityProperty(data, "componentName") ?? "",
        standardHours: standardValue,
        topHours: topValue,
        bottomHours: bottomValue,
        sideHours: sideValue,
        stock: getEntityProperty(data, "stock") ?? "",
        seriesNo: getEntityProperty(data, "seriesNo") ?? "",
        projectID: String(getEntityProperty(data, "projectID") ?? ""),
        machineID: String(getEntityProperty(data, "machineID") ?? ""),
        status:
          getEntityProperty(data, "status") ??
          getEntityProperty(data, "Status") ??
          "Active",
      });

      setIsEdit(true);
      setShowForm(true);
    } catch (err) {
      console.error("GET COMPONENT ERROR:", err);
      notifyError(err, "Failed to load component details.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================
  const handleDelete = async (id) => {
    if (!id || Number(id) <= 0) {
      return;
    }

    const confirmed = await confirmAction({
      title: "Delete component?",
      message:
        "Are you sure you want to delete this component? This action cannot be undone.",
      confirmText: "Delete",
    });

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      await componentsService.deleteComponent(Number(id));

      notifySuccess("Component deleted successfully.");

      await loadData();
    } catch (err) {
      console.error("DELETE COMPONENT ERROR:", err);
      notifyError(err, "Failed to delete component.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RESET FORM
  // =====================================================
  const resetForm = () => {
    setComponent({
      componentID: 0,
      componentName: "",
      standardHours: "",
      topHours: "",
      bottomHours: "",
      sideHours: "",
      stock: "",
      seriesNo: "",
      projectID: "",
      machineID: "",
      status: "Active",
    });

    setIsEdit(false);
    setFieldErrors({});
  };

  // =====================================================
  // FILTERED LIST
  // =====================================================
  const filteredComponents = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return components;

    return components.filter((item) => {
      const a = (getEntityProperty(item, "componentName") || "").toLowerCase();
      const b = (getEntityProperty(item, "seriesNo") || "").toLowerCase();
      return a.includes(term) || b.includes(term);
    });
  }, [components, search]);

  const getInitials = (name = "") =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "—";

  // =====================================================
  // CLOSE MODAL
  // =====================================================
  const closeForm = () => {
    if (saving) return;

    resetForm();
    setShowForm(false);
  };

  // =====================================================
  // ADD COMPONENT
  // =====================================================
  const handleAdd = () => {
    resetForm();
    setShowForm(true);
  };

  // =====================================================
  // PROJECT NAME
  // =====================================================
  const getProjectName = (projectID) => {
    const project = projects.find(
      (p) => Number(getEntityProperty(p, "projectID")) === Number(projectID),
    );

    return project ? getEntityProperty(project, "projectName") || "-" : "-";
  };

  // =====================================================
  // MACHINE NAME
  // =====================================================
  const getMachineName = (machineID) => {
    const machine = machines.find(
      (m) => Number(getEntityProperty(m, "machineID")) === Number(machineID),
    );

    return machine ? getEntityProperty(machine, "machineName") || "-" : "-";
  };

  return (
    <div className="w-full">
      {/* ================= HEADER ================= */}
      <PageHeader
        icon={ComponentIcon}
        title="Components"
        description="Manage component master data."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          disabled={saving}
        >
          <RefreshCw className="size-4" />
          Refresh
        </Button>
        <Button size="sm" onClick={handleAdd} disabled={saving}>
          <Plus className="size-4" />
          Add Component
        </Button>
      </PageHeader>

      {/* ================= TABLE CARD ================= */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Component List</CardTitle>
            <Badge variant="secondary" className="rounded-full font-normal">
              {components.length}
            </Badge>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search components..."
              className="h-8 pl-8 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Component</TableHead>
                <TableHead>Std. Hrs</TableHead>
                <TableHead>Top Hrs</TableHead>
                <TableHead>Bottom Hrs</TableHead>
                <TableHead>Side Hrs</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Series No</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Machine</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i} className="hover:bg-transparent">
                    <TableCell colSpan={11} className="py-3">
                      <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredComponents.length > 0 ? (
                filteredComponents.map((item) => {
                  const id = getEntityProperty(item, "componentID");
                  const name = getEntityProperty(item, "componentName") || "-";
                  const standardHours = getEntityProperty(
                    item,
                    "standardHours",
                  );
                  const topHours = getEntityProperty(item, "topHours");
                  const bottomHours = getEntityProperty(item, "bottomHours");
                  const sideHours = getEntityProperty(item, "sideHours");
                  const stock = getEntityProperty(item, "stock");
                  const seriesNo = getEntityProperty(item, "seriesNo") || "-";
                  const projectID = getEntityProperty(item, "projectID");
                  const machineID = getEntityProperty(item, "machineID");
                  const status =
                    getEntityProperty(item, "status") ??
                    getEntityProperty(item, "Status") ??
                    "Inactive";

                  const isActive = String(status).toLowerCase() === "active";

                  return (
                    <TableRow key={id} className="group transition-colors">
                      <TableCell className="max-w-48 font-medium">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                            {getInitials(name)}
                          </div>
                          <span className="truncate" title={String(name)}>
                            {String(name)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{standardHours ?? "-"}</TableCell>
                      <TableCell>{topHours ?? "-"}</TableCell>
                      <TableCell>{bottomHours ?? "-"}</TableCell>
                      <TableCell>{sideHours ?? "-"}</TableCell>
                      <TableCell>{stock ?? "-"}</TableCell>
                      <TableCell>
                        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                          {seriesNo}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-36 truncate">
                        <span title={getProjectName(projectID)}>
                          {getProjectName(projectID)}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-36 truncate">
                        <span title={getMachineName(machineID)}>
                          {getMachineName(machineID)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isActive ? "success" : "secondary"}>
                          {isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(id)}
                            disabled={saving}
                          >
                            <Pencil className="size-3.5" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDelete(id)}
                            disabled={saving}
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
                  <TableCell colSpan={11} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <div className="flex size-11 items-center justify-center rounded-full bg-muted">
                        <ComponentIcon className="size-5" />
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {search
                          ? "No matching components"
                          : "No components yet"}
                      </p>
                      <p className="text-xs">
                        {search
                          ? "Try a different name or series no."
                          : "Add your first component using the form."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* =====================================================
          ADD / EDIT DIALOG
      ===================================================== */}
      <FormDialog
        open={showForm}
        onClose={closeForm}
        onSubmit={handleSubmit}
        icon={ComponentIcon}
        isEdit={isEdit}
        title={isEdit ? "Edit Component" : "Add Component"}
        description={
          isEdit
            ? "Update the component details below."
            : "Fill in the details to add a new component."
        }
        submitLabel={isEdit ? "Update Component" : "Save Component"}
        saving={saving}
        maxWidth="md"
      >
        {/* COMPONENT NAME */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="componentName">
            Component Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="componentName"
            type="text"
            name="componentName"
            value={component.componentName}
            onChange={handleChange}
            placeholder="Enter Component Name"
            maxLength={100}
            disabled={saving}
            aria-invalid={!!fieldErrors.componentName}
          />
          <FormError message={fieldErrors.componentName} />
        </div>

        {/* STANDARD + TOP */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="standardHours">
              Standard Hours <span className="text-destructive">*</span>
            </Label>
            <Input
              id="standardHours"
              type="number"
              name="standardHours"
              value={component.standardHours}
              onChange={handleChange}
              placeholder="0"
              min="0"
              disabled={saving || hasOtherHours}
              aria-invalid={!!fieldErrors.standardHours}
            />
            <FormError message={fieldErrors.standardHours} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="topHours">
              Top Hours <span className="text-destructive">*</span>
            </Label>
            <Input
              id="topHours"
              type="number"
              name="topHours"
              value={component.topHours}
              onChange={handleChange}
              placeholder="0"
              min="0"
              disabled={saving || hasStandardHours}
              aria-invalid={!!fieldErrors.topHours}
            />
            <FormError message={fieldErrors.topHours} />
          </div>
        </div>

        <FormError message={fieldErrors.hours} />

        {/* BOTTOM + SIDE */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bottomHours">
              Bottom Hours <span className="text-destructive">*</span>
            </Label>
            <Input
              id="bottomHours"
              type="number"
              name="bottomHours"
              value={component.bottomHours}
              onChange={handleChange}
              placeholder="0"
              min="0"
              disabled={saving || hasStandardHours}
              aria-invalid={!!fieldErrors.bottomHours}
            />
            <FormError message={fieldErrors.bottomHours} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sideHours">
              Side Hours <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sideHours"
              type="number"
              name="sideHours"
              value={component.sideHours}
              onChange={handleChange}
              placeholder="0"
              min="0"
              disabled={saving || hasStandardHours}
              aria-invalid={!!fieldErrors.sideHours}
            />
            <FormError message={fieldErrors.sideHours} />
          </div>
        </div>

        {/* STOCK + SERIES */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="stock">
              Stock <span className="text-destructive">*</span>
            </Label>
            <Input
              id="stock"
              type="number"
              name="stock"
              value={component.stock}
              onChange={handleChange}
              placeholder="Enter Stock"
              min="0"
              disabled={saving}
              aria-invalid={!!fieldErrors.stock}
            />
            <FormError message={fieldErrors.stock} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="seriesNo">
              Series No <span className="text-destructive">*</span>
            </Label>
            <Input
              id="seriesNo"
              type="text"
              name="seriesNo"
              value={component.seriesNo}
              onChange={handleChange}
              placeholder="Enter Series No"
              maxLength={50}
              disabled={saving}
              aria-invalid={!!fieldErrors.seriesNo}
            />
            <FormError message={fieldErrors.seriesNo} />
          </div>
        </div>

        {/* PROJECT + MACHINE */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="projectID">
              Project <span className="text-destructive">*</span>
            </Label>
            <Select
              value={component.projectID}
              onValueChange={handleProjectChange}
              disabled={saving}
            >
              <SelectTrigger
                id="projectID"
                className="w-full"
                aria-invalid={!!fieldErrors.projectID}
              >
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => {
                  const id = getEntityProperty(p, "projectID");
                  const name = getEntityProperty(p, "projectName") || "-";

                  return (
                    <SelectItem key={String(id)} value={String(id)}>
                      {name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <FormError message={fieldErrors.projectID} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="machineID">
              Machine <span className="text-destructive">*</span>
            </Label>
            <Select
              value={component.machineID}
              onValueChange={handleMachineChange}
              disabled={saving}
            >
              <SelectTrigger
                id="machineID"
                className="w-full"
                aria-invalid={!!fieldErrors.machineID}
              >
                <SelectValue placeholder="Select Machine" />
              </SelectTrigger>
              <SelectContent>
                {machines.map((m) => {
                  const id = getEntityProperty(m, "machineID");
                  const name = getEntityProperty(m, "machineName") || "-";

                  return (
                    <SelectItem key={String(id)} value={String(id)}>
                      {name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <FormError message={fieldErrors.machineID} />
          </div>
        </div>

        {/* STATUS */}
        <div className="rounded-md border px-3 py-2">
          <StatusToggle
            value={component.status}
            onChange={handleStatusChange}
            disabled={saving}
          />
        </div>
      </FormDialog>
    </div>
  );
}

export default Components;
