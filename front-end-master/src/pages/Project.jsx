import React, { useEffect, useMemo, useState } from "react";
import {
  FolderKanban,
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
import projectService from "../services/projectService";
import machineService from "../services/machineService";

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

function Project() {
  const [projects, setProjects] = useState([]);
  const [machines, setMachines] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [project, setProject] = useState({
    projectID: 0,
    projectName: "",
    projectCode: "",
    status: "Active",
    machineID: "",
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

  // Helper for case-insensitive/variant property extraction
  const getEntityProperty = (obj, key) => {
    if (!obj) return undefined;
    const lowerKey = key.toLowerCase();
    const matchedKey = Object.keys(obj).find(
      (k) => k.toLowerCase() === lowerKey
    );
    return matchedKey ? obj[matchedKey] : undefined;
  };

  const getMachineId = (machine) =>
    getEntityProperty(machine, "machineID") ??
    getEntityProperty(machine, "id") ??
    "";

  const getMachineName = (machine) =>
    getEntityProperty(machine, "machineName") ??
    getEntityProperty(machine, "name") ??
    "-";

  // Load projects and dropdown options concurrently
  const loadData = async () => {
    try {
      setLoading(true);

      const [projectRes, machineRes] = await Promise.allSettled([
        projectService.getProjects(),
        machineService.getMachines(),
      ]);

      if (projectRes.status === "fulfilled") {
        setProjects(projectRes.value?.data || []);
      } else {
        throw projectRes.reason;
      }

      if (machineRes.status === "fulfilled") {
        setMachines(machineRes.value?.data || []);
      } else {
        console.error("MACHINE LOAD ERROR:", machineRes.reason);
        notifyError(machineRes.reason, "Failed to load machines.");
      }
    } catch (err) {
      console.error("PROJECT LOAD ERROR:", err);
      notifyError(err, "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "status") {
      setProject((prev) => ({
        ...prev,
        status: checked ? "Active" : "Inactive",
      }));
      return;
    }

    clearFieldError(name);

    setProject((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleStatusChange = (checked) => {
    clearFieldError("status");

    setProject((prev) => ({
      ...prev,
      status: checked ? "Active" : "Inactive",
    }));
  };

  const handleMachineChange = (value) => {
    clearFieldError("machineID");

    setProject((prev) => ({
      ...prev,
      machineID: String(value ?? ""),
    }));
  };

  const validateProject = () => {
    const projectName = project.projectName.trim();
    const projectCode = project.projectCode.trim();
    const errors = {};

    if (!projectName) {
      errors.projectName = "Project Name is required.";
    }

    if (!projectCode) {
      errors.projectCode = "Project Code is required.";
    }

    if (!project.machineID || Number(project.machineID) <= 0) {
      errors.machineID = "Please select a Machine.";
    }

    if (
      projectName &&
      projectCode &&
      projectName.toLowerCase() === projectCode.toLowerCase()
    ) {
      errors.projectCode =
        "Project Name and Project Code cannot be the same.";
    }

    if (Object.keys(errors).length === 0) {
      const currentId = Number(project.projectID || 0);

      // Normalize values
      const normalizedName = projectName.toLowerCase();
      const normalizedCode = projectCode.toLowerCase();

      // Duplicate Project Name
      const duplicateName = projects.some((item) => {
        const itemId = Number(getEntityProperty(item, "projectID") || 0);
        const itemName = String(getEntityProperty(item, "projectName") || "")
          .trim()
          .toLowerCase();

        return itemId !== currentId && itemName === normalizedName;
      });

      if (duplicateName) {
        errors.projectName = "Project Name already exists.";
      }

      // Duplicate Project Code
      const duplicateCode = projects.some((item) => {
        const itemId = Number(getEntityProperty(item, "projectID") || 0);
        const itemCode = String(getEntityProperty(item, "projectCode") || "")
          .trim()
          .toLowerCase();

        return itemId !== currentId && itemCode === normalizedCode;
      });

      if (duplicateCode) {
        errors.projectCode = "Project Code already exists.";
      }
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateProject()) return;

    try {
      setSaving(true);

      const requestData = {
        projectID: Number(project.projectID || 0),
        projectName: project.projectName.trim(),
        projectCode: project.projectCode.trim(),
        status: project.status || "Active",
        machineID: Number(project.machineID),
      };

      if (isEdit) {
        await projectService.updateProject(
          Number(project.projectID),
          requestData
        );
        notifySuccess("Project updated successfully.");
      } else {
        await projectService.createProject(requestData);
        notifySuccess("Project created successfully.");
      }

      setShowForm(false);
      resetForm();
      await loadData();
    } catch (err) {
      console.error("PROJECT SAVE ERROR:", err);
      notifyError(err, "Failed to save project.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      const response = await projectService.getProjectById(Number(id));
      const data = response.data;

      const projectId = getEntityProperty(data, "projectID") ?? id;
      const machineId = getEntityProperty(data, "machineID") ?? "";
      const projectName = getEntityProperty(data, "projectName") ?? "";
      const projectCode = getEntityProperty(data, "projectCode") ?? "";
      const status = getEntityProperty(data, "status") ?? "Active";

      setProject({
        projectID: Number(projectId),
        projectName: projectName,
        projectCode: projectCode,
        status: status,
        machineID: machineId !== "" ? String(machineId) : "",
      });

      setIsEdit(true);
      setShowForm(true);
    } catch (err) {
      console.error("GET PROJECT BY ID ERROR:", err);
      notifyError(err, "Failed to load project details.");
    }
  };

  const handleDelete = async (id) => {
    if (!id || Number(id) <= 0) {
      return;
    }

    const confirmed = await confirmAction({
      title: "Delete project?",
      message:
        "Are you sure you want to delete this project? This action cannot be undone.",
      confirmText: "Delete",
    });

    if (!confirmed) {
      return;
    }

    try {
      await projectService.deleteProject(Number(id));
      notifySuccess("Project deleted successfully.");
      await loadData();
    } catch (err) {
      console.error("DELETE PROJECT ERROR:", err);
      notifyError(err, "Failed to delete project.");
    }
  };

  const resetForm = () => {
    setProject({
      projectID: 0,
      projectName: "",
      projectCode: "",
      status: "Active",
      machineID: "",
    });
    setIsEdit(false);
    setFieldErrors({});
  };

  // =====================================================
  // FILTERED LIST
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
  const filteredProjects = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return projects;

    return projects.filter((item) => {
      const name = String(
        getEntityProperty(item, "projectName") || ""
      ).toLowerCase();
      const code = String(
        getEntityProperty(item, "projectCode") || ""
      ).toLowerCase();
      return name.includes(term) || code.includes(term);
    });
  }, [projects, search]);

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
    <div className="flex h-full min-h-[28rem] w-full flex-col">
      {/* ================= HEADER ================= */}
      <PageHeader
        icon={FolderKanban}
        title="Projects"
        description="Manage project master data."
      >
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="size-4" />
          Refresh
        </Button>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="size-4" />
          Add Project
        </Button>
      </PageHeader>

      {/* ================= TABLE CARD ================= */}
      <Card className="min-h-0 flex-1 border-border/60 shadow-sm">
        <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Project List</CardTitle>
            <Badge variant="secondary" className="rounded-full font-normal">
              {projects.length}
            </Badge>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="h-8 pl-8 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Project Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Machine</TableHead>
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
              ) : filteredProjects.length > 0 ? (
                filteredProjects.map((item) => {
                  const id = getEntityProperty(item, "projectID");
                  const name = getEntityProperty(item, "projectName") || "-";
                  const code = getEntityProperty(item, "projectCode") || "-";
                  const machineId = getEntityProperty(item, "machineID");
                  const status =
                    getEntityProperty(item, "status") || "Inactive";

                  const matchedMachine = machines.find(
                    (m) => Number(getMachineId(m)) === Number(machineId)
                  );
                  const machineName = matchedMachine
                    ? getMachineName(matchedMachine)
                    : "-";

                  return (
                    <TableRow
                      key={id}
                      className="group transition-colors"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                            {getInitials(String(name))}
                          </div>
                          {name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                          {code}
                        </span>
                      </TableCell>
                      <TableCell>{machineName}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            status === "Active" ? "success" : "secondary"
                          }
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
                            onClick={() => handleEdit(id)}
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
                        <FolderKanban className="size-5" />
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {search
                          ? "No matching projects"
                          : "No projects yet"}
                      </p>
                      <p className="text-xs">
                        {search
                          ? "Try a different name."
                          : "Add your first project using the Add button."}
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
        icon={FolderKanban}
        isEdit={isEdit}
        title={isEdit ? "Edit Project" : "Add Project"}
        description={
          isEdit
            ? "Update the project details below."
            : "Fill in the details to add a new project."
        }
        submitLabel={isEdit ? "Update Project" : "Save Project"}
        saving={saving}
      >
        {/* PROJECT NAME */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="projectName">Project Name <span className="text-destructive">*</span></Label>
          <Input
            id="projectName"
            type="text"
            name="projectName"
            value={project.projectName}
            onChange={handleChange}
            placeholder="Enter Project Name"
            maxLength={50}
            disabled={saving}
            aria-invalid={!!fieldErrors.projectName}
          />
          <FormError message={fieldErrors.projectName} />
        </div>

        {/* PROJECT CODE */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="projectCode">Project Code <span className="text-destructive">*</span></Label>
          <Input
            id="projectCode"
            type="text"
            name="projectCode"
            value={project.projectCode}
            onChange={handleChange}
            placeholder="Enter Project Code"
            maxLength={25}
            disabled={saving}
            aria-invalid={!!fieldErrors.projectCode}
          />
          <FormError message={fieldErrors.projectCode} />
        </div>

        {/* MACHINE */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="machineID">Machine <span className="text-destructive">*</span></Label>
          <Select
            value={project.machineID}
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
                const id = getMachineId(m);
                const name = getMachineName(m);

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

        {/* STATUS */}
        <StatusToggle
          value={project.status}
          onChange={handleStatusChange}
          disabled={saving}
        />
      </FormDialog>
    </div>
  );
}

export default Project;