import React, { useEffect, useMemo, useState } from "react";
import {
  Cog,
  LoaderCircle,
  Pencil,
  QrCode,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import PageHeader from "../components/page-header";
import FormError from "../components/form-error";
import { QRCodeCanvas } from "qrcode.react";

import machineService from "../services/machineService";
import plantService from "../services/plantService";
import divisionService from "../services/divisionService";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

function Machine() {
  // =========================
  // DATA STATES
  // =========================
  const [machines, setMachines] = useState([]);
  const [plants, setPlants] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [filteredDivisions, setFilteredDivisions] = useState([]);

  // =========================
  // UI STATES
  // =========================
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  // =========================
  // MACHINE FORM
  // =========================
  const [machine, setMachine] = useState({
    machineID: 0,
    machineName: "",
    machineCode: "",
    status: "Active",
    plantId: "",
    divisionId: "",
  });

  const [isEdit, setIsEdit] = useState(false);

  // =========================
  // FIELD ERRORS
  // =========================
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
  // QR MODAL
  // =========================
  const [selectedMachine, setSelectedMachine] = useState(null);

  // =========================
  // LOAD ALL DATA
  // =========================
  const loadData = async () => {
    try {
      setLoading(true);

      const [machineRes, plantRes, divisionRes] =
        await Promise.allSettled([
          machineService.getMachines(),
          plantService.getPlants(),
          divisionService.getDivisions(),
        ]);

      // Machines
      if (machineRes.status === "fulfilled") {
        setMachines(machineRes.value.data || []);
      } else {
        console.error("MACHINE LOAD ERROR:", machineRes.reason);
      }

      // Plants
      if (plantRes.status === "fulfilled") {
        setPlants(plantRes.value.data || []);
      } else {
        console.error("PLANT LOAD ERROR:", plantRes.reason);
      }

      // Divisions
      if (divisionRes.status === "fulfilled") {
        const divData = divisionRes.value.data || [];

        setDivisions(divData);
        setFilteredDivisions(divData);
      } else {
        console.error("DIVISION LOAD ERROR:", divisionRes.reason);
      }
    } catch (err) {
      console.error("MACHINE LOAD ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    loadData();
  }, []);

  // =========================
  // HANDLE INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    clearFieldError(name);

    setMachine((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
            ? "Active"
            : "Inactive"
          : value,
    }));
  };

  // =========================
  // HANDLE STATUS CHANGE
  // =========================
  const handleStatusChange = (checked) => {
    clearFieldError("status");

    setMachine((prev) => ({
      ...prev,
      status: checked ? "Active" : "Inactive",
    }));
  };

  // =========================
  // HANDLE PLANT CHANGE
  // =========================
  const handlePlantChange = (value) => {
    clearFieldError("plantId");
    clearFieldError("divisionId");

    const selectedPlantId = String(value ?? "");

    // Find related divisions
    const relatedDivisions = divisions.filter((div) => {
      const divPlantId =
        div.plantId ?? div.PlantId ?? div.plantID ?? div.PlantID;

      return !selectedPlantId || String(divPlantId) === selectedPlantId;
    });

    setFilteredDivisions(
      relatedDivisions.length > 0 ? relatedDivisions : divisions
    );

    // Auto select first division
    let autoDivisionId = "";

    const chosenPlant = plants.find((p) => {
      const plantId = p.plantID ?? p.PlantID ?? p.plantId ?? p.id;

      return String(plantId) === selectedPlantId;
    });

    // If plant has direct division relation
    const directDivId =
      chosenPlant?.divisionId ??
      chosenPlant?.DivisionId ??
      chosenPlant?.divisionID;

    if (directDivId) {
      autoDivisionId = String(directDivId);
    }

    // Otherwise select first related division
    else if (relatedDivisions.length > 0 && selectedPlantId) {
      const firstDivision = relatedDivisions[0];

      const firstDivId =
        firstDivision.divisionId ??
        firstDivision.DivisionId ??
        firstDivision.divisionID ??
        firstDivision.DivisionID ??
        firstDivision.id;

      if (firstDivId) {
        autoDivisionId = String(firstDivId);
      }
    }

    setMachine((prev) => ({
      ...prev,
      plantId: selectedPlantId,
      divisionId: autoDivisionId,
    }));
  };

  // =========================
  // HANDLE DIVISION CHANGE
  // =========================
  const handleDivisionChange = (value) => {
    clearFieldError("divisionId");

    setMachine((prev) => ({
      ...prev,
      divisionId: String(value ?? ""),
    }));
  };

  // =========================
  // VALIDATE MACHINE
  // =========================
  const validateMachine = () => {
    const machineName = machine.machineName.trim();
    const machineCode = machine.machineCode.trim();
    const errors = {};

    // Machine Name
    if (!machineName) {
      errors.machineName = "Machine Name is required.";
    }

    // Machine Code
    if (!machineCode) {
      errors.machineCode = "Machine Code is required.";
    }

    // Plant
    if (!machine.plantId) {
      errors.plantId = "Please select Plant.";
    }

    // Division
    if (!machine.divisionId) {
      errors.divisionId = "Please select Division.";
    }

    // Name and Code cannot be same
    if (
      machineName &&
      machineCode &&
      machineName.toLowerCase() === machineCode.toLowerCase()
    ) {
      errors.machineCode =
        "Machine Name and Machine Code cannot be the same.";
    }

    if (Object.keys(errors).length === 0) {
      const currentId = Number(machine.machineID || 0);

      // =========================
      // DUPLICATE MACHINE NAME
      // =========================
      const duplicateName = machines.some((item) => {
        const itemId = Number(
          item.machineID ?? item.MachineID ?? item.id ?? 0
        );

        const itemName = String(
          item.machineName ?? item.MachineName ?? ""
        )
          .trim()
          .toLowerCase();

        return itemId !== currentId && itemName === machineName.toLowerCase();
      });

      if (duplicateName) {
        errors.machineName = "Machine Name already exists.";
      }

      // =========================
      // DUPLICATE MACHINE CODE
      // =========================
      const duplicateCode = machines.some((item) => {
        const itemId = Number(
          item.machineID ?? item.MachineID ?? item.id ?? 0
        );

        const itemCode = String(
          item.machineCode ?? item.MachineCode ?? ""
        )
          .trim()
          .toLowerCase();

        return itemId !== currentId && itemCode === machineCode.toLowerCase();
      });

      if (duplicateCode) {
        errors.machineCode = "Machine Code already exists.";
      }
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateMachine()) {
      return;
    }

    try {
      setSaving(true);

      // =========================
      // REQUEST DATA
      // =========================
      const requestData = {
        machineID: Number(machine.machineID || 0),
        machineName: machine.machineName.trim(),
        machineCode: machine.machineCode.trim(),
        status: machine.status || "Active",
        plantId: Number(machine.plantId),
        divisionId: Number(machine.divisionId),
      };

      // =========================
      // UPDATE
      // =========================
      if (isEdit) {
        await machineService.updateMachine(
          Number(machine.machineID),
          requestData
        );

        alert("Machine updated successfully.");
      }

      // =========================
      // CREATE
      // =========================
      else {
        await machineService.createMachine(requestData);

        alert("Machine created successfully. QR Code generated.");
      }

      // Reload latest machine list
      await loadData();

      // Reset
      resetForm();
    } catch (err) {
      console.error("SAVE MACHINE ERROR:", err.response?.data || err);
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = async (id) => {
    try {
      const response = await machineService.getMachineById(id);

      const data = response.data;

      const pId = data.plantId ?? data.PlantId ?? "";
      const dId = data.divisionId ?? data.DivisionId ?? "";

      setMachine({
        machineID: data.machineID ?? data.MachineID ?? id,
        machineName: data.machineName ?? data.MachineName ?? "",
        machineCode: data.machineCode ?? data.MachineCode ?? "",
        status: data.status ?? data.Status ?? "Active",
        plantId: pId !== "" ? String(pId) : "",
        divisionId: dId !== "" ? String(dId) : "",
      });

      // Filter divisions
      const relatedDivisions = divisions.filter((div) => {
        const divPlantId = div.plantId ?? div.PlantId ?? div.plantID ?? div.PlantID;

        return !pId || String(divPlantId) === String(pId);
      });

      setFilteredDivisions(
        relatedDivisions.length > 0 ? relatedDivisions : divisions
      );

      setIsEdit(true);

      // Scroll to form
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error("GET MACHINE BY ID ERROR:", err);
    }
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this machine?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await machineService.deleteMachine(id);

      alert("Machine deleted successfully.");

      // If deleted machine was open in QR modal
      if (
        selectedMachine &&
        Number(selectedMachine.machineID ?? selectedMachine.MachineID) ===
          Number(id)
      ) {
        setSelectedMachine(null);
      }

      await loadData();
    } catch (err) {
      console.error("DELETE MACHINE ERROR:", err);
    }
  };

  // =========================
  // RESET FORM
  // =========================
  const resetForm = () => {
    setMachine({
      machineID: 0,
      machineName: "",
      machineCode: "",
      status: "Active",
      plantId: "",
      divisionId: "",
    });

    setFilteredDivisions(divisions);

    setIsEdit(false);
    setFieldErrors({});
  };

  // =========================
  // FILTERED LIST
  // =========================
  const filteredMachines = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return machines;

    return machines.filter((item) => {
      const a = (item.machineName || "").toLowerCase();
      const b = (item.machineCode || "").toLowerCase();
      return a.includes(term) || b.includes(term);
    });
  }, [machines, search]);

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
  // GET PLANT NAME
  // =========================
  const getPlantName = (pId) => {
    if (pId === undefined || pId === null || pId === "") return "-";

    const plant = plants.find(
      (p) =>
        Number(p.plantID ?? p.PlantID ?? p.plantId ?? p.id) === Number(pId)
    );

    return plant?.plantName ?? plant?.PlantName ?? plant?.name ?? "-";
  };

  // =========================
  // GET DIVISION NAME
  // =========================
  const getDivisionName = (dId) => {
    if (dId === undefined || dId === null || dId === "") return "-";

    const division = divisions.find(
      (d) =>
        Number(
          d.divisionId ??
            d.DivisionId ??
            d.divisionID ??
            d.DivisionID ??
            d.id
        ) === Number(dId)
    );

    return division?.divisionName ?? division?.DivisionName ?? division?.name ?? "-";
  };

  // =========================
  // GET MACHINE ID
  // =========================
  const getMachineId = (item) => {
    return item.machineID ?? item.MachineID ?? item.machineId ?? item.id;
  };

  // =========================
  // GET MACHINE NAME
  // =========================
  const getMachineName = (item) => {
    return item.machineName ?? item.MachineName ?? "";
  };

  // =========================
  // GET MACHINE CODE
  // =========================
  const getMachineCode = (item) => {
    return item.machineCode ?? item.MachineCode ?? "";
  };

  // =========================
  // GET STATUS
  // =========================
  const getMachineStatus = (item) => {
    return item.status ?? item.Status ?? "Active";
  };

  // =========================
  // QR DATA
  // =========================
  const getQrData = (item) => {
    const machineId = getMachineId(item);
    const machineName = getMachineName(item);
    const machineCode = getMachineCode(item);
    const plantId = item.plantId ?? item.PlantId ?? "";
    const divisionId = item.divisionId ?? item.DivisionId ?? "";
    const status = getMachineStatus(item);

    return JSON.stringify(
      {
        type: "Machine",
        machineID: Number(machineId || 0),
        machineName: machineName,
        machineCode: machineCode,
        plantId: Number(plantId || 0),
        plant: getPlantName(plantId),
        divisionId: Number(divisionId || 0),
        division: getDivisionName(divisionId),
        status: status,
      },
      null,
      2
    );
  };

  // =========================
  // SHOW QR
  // =========================
  const handleShowQR = (item) => {
    setSelectedMachine(item);
  };

  // =========================
  // CLOSE QR
  // =========================
  const closeQR = () => {
    setSelectedMachine(null);
  };

  // =========================
  // DOWNLOAD QR
  // =========================
  const downloadQR = () => {
    if (!selectedMachine) {
      return;
    }

    const machineCode = getMachineCode(selectedMachine);

    const canvas = document.getElementById("machine-qr-canvas");

    if (!canvas) {
      return;
    }

    const pngUrl = canvas.toDataURL("image/png");

    const downloadLink = document.createElement("a");

    downloadLink.href = pngUrl;
    downloadLink.download = `Machine-${machineCode || "QR"}.png`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="w-full">
      {/* ================= HEADER ================= */}
      <PageHeader
        icon={Cog}
        title="Machines"
        description="Manage machine master data with QR codes."
      >
        <Button variant="outline" size="sm" onClick={loadData}>
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
                  <Cog className="size-4" />
                )}
              </div>
              <div>
                <CardTitle>{isEdit ? "Edit Machine" : "Add Machine"}</CardTitle>
                <CardDescription>
                  {isEdit
                    ? "Update the machine details below."
                    : "Fill in the details to add a new machine."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* MACHINE NAME */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="machineName">Machine Name <span className="text-destructive">*</span></Label>
                <Input
                  id="machineName"
                  type="text"
                  name="machineName"
                  value={machine.machineName}
                  onChange={handleChange}
                  placeholder="Enter Machine Name"
                  maxLength={50}
                  disabled={saving}
                  aria-invalid={!!fieldErrors.machineName}
                />
                <FormError message={fieldErrors.machineName} />
              </div>

              {/* MACHINE CODE */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="machineCode">Machine Code <span className="text-destructive">*</span></Label>
                <Input
                  id="machineCode"
                  type="text"
                  name="machineCode"
                  value={machine.machineCode}
                  onChange={handleChange}
                  placeholder="Enter Machine Code"
                  maxLength={25}
                  disabled={saving}
                  aria-invalid={!!fieldErrors.machineCode}
                />
                <FormError message={fieldErrors.machineCode} />
              </div>

              {/* PLANT */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="plantId">Plant <span className="text-destructive">*</span></Label>
                <Select
                  value={machine.plantId}
                  onValueChange={handlePlantChange}
                  disabled={saving}
                >
                  <SelectTrigger
                    id="plantId"
                    className="w-full"
                    aria-invalid={!!fieldErrors.plantId}
                  >
                    <SelectValue placeholder="Select Plant" />
                  </SelectTrigger>
                  <SelectContent>
                    {plants.map((plant) => {
                      const id =
                        plant.plantID ?? plant.PlantID ?? plant.plantId ?? plant.id;
                      const name =
                        plant.plantName ?? plant.PlantName ?? plant.name;

                      return (
                        <SelectItem key={String(id)} value={String(id)}>
                          {name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormError message={fieldErrors.plantId} />
              </div>

              {/* DIVISION */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="divisionId">Division <span className="text-destructive">*</span></Label>
                <Select
                  value={machine.divisionId}
                  onValueChange={handleDivisionChange}
                  disabled={saving || !machine.plantId}
                >
                  <SelectTrigger
                    id="divisionId"
                    className="w-full"
                    aria-invalid={!!fieldErrors.divisionId}
                  >
                    <SelectValue placeholder="Select Division" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDivisions.map((division) => {
                      const id =
                        division.divisionId ??
                        division.DivisionId ??
                        division.divisionID ??
                        division.DivisionID ??
                        division.id;
                      const name =
                        division.divisionName ??
                        division.DivisionName ??
                        division.name;

                      return (
                        <SelectItem key={String(id)} value={String(id)}>
                          {name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormError message={fieldErrors.divisionId} />
              </div>

              {/* STATUS + BUTTONS */}
              <div className="mt-1 flex flex-col gap-4">
                <StatusToggle
                  value={machine.status}
                  onChange={handleStatusChange}
                  disabled={saving}
                />

                <div className="flex gap-2">
                  <Button type="submit" disabled={saving} className="flex-1">
                    {saving ? (
                      <>
                        <LoaderCircle className="size-4 animate-spin" />
                        Saving...
                      </>
                    ) : isEdit ? (
                      "Update Machine"
                    ) : (
                      "Save Machine"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* ===== TABLE CARD ===== */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
            <div className="flex items-center gap-2">
              <CardTitle>Machine List</CardTitle>
              <Badge variant="secondary" className="rounded-full font-normal">
                {machines.length}
              </Badge>
            </div>
            <div className="relative w-full max-w-[220px]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search machines..."
                className="h-8 pl-8 text-sm"
              />
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Machine Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Plant</TableHead>
                  <TableHead>Division</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i} className="hover:bg-transparent">
                      <TableCell colSpan={6} className="py-3">
                        <div className="h-4 w-full animate-pulse rounded bg-muted" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredMachines.length > 0 ? (
                  filteredMachines.map((item) => {
                    const mId = getMachineId(item);
                    const mName = getMachineName(item);
                    const mCode = getMachineCode(item);
                    const pId = item.plantId ?? item.PlantId ?? "";
                    const dId = item.divisionId ?? item.DivisionId ?? "";
                    const mStatus = getMachineStatus(item);

                    return (
                      <TableRow
                        key={mId}
                        className="group transition-colors"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                              {getInitials(mName)}
                            </div>
                            {mName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                            {mCode}
                          </span>
                        </TableCell>
                        <TableCell>{getPlantName(pId)}</TableCell>
                        <TableCell>{getDivisionName(dId)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              mStatus === "Active" ? "success" : "secondary"
                            }
                          >
                            {mStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-emerald-600 hover:bg-emerald-100/50 hover:text-emerald-700"
                              onClick={() => handleShowQR(item)}
                            >
                              <QrCode className="size-3.5" />
                              QR
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(mId)}
                            >
                              <Pencil className="size-3.5" />
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleDelete(mId)}
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
                    <TableCell colSpan={6} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <div className="flex size-11 items-center justify-center rounded-full bg-muted">
                          <Cog className="size-5" />
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          {search ? "No matching machines" : "No machines yet"}
                        </p>
                        <p className="text-xs">
                          {search
                            ? "Try a different name or code."
                            : "Add your first machine using the form."}
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

      {/* =====================================
          QR CODE DIALOG
      ===================================== */}
      <Dialog
        open={!!selectedMachine}
        onOpenChange={(open) => {
          if (!open) closeQR();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Machine QR Code</DialogTitle>
            <DialogDescription>
              Scan the QR code to view machine details.
            </DialogDescription>
          </DialogHeader>

          {selectedMachine && (
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-xl border p-4">
                <QRCodeCanvas
                  id="machine-qr-canvas"
                  value={getQrData(selectedMachine)}
                  size={230}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="w-full rounded-lg bg-muted/50 p-4 text-sm">
                <div className="mb-3 text-center">
                  <div className="text-base font-semibold">
                    {getMachineName(selectedMachine)}
                  </div>
                  <div className="text-muted-foreground">
                    Code: {getMachineCode(selectedMachine)}
                  </div>
                </div>
                <dl className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5">
                  <dt className="font-medium text-muted-foreground">Machine ID:</dt>
                  <dd>{getMachineId(selectedMachine)}</dd>
                  <dt className="font-medium text-muted-foreground">Plant:</dt>
                  <dd>
                    {getPlantName(
                      selectedMachine.plantId ?? selectedMachine.PlantId
                    )}
                  </dd>
                  <dt className="font-medium text-muted-foreground">Division:</dt>
                  <dd>
                    {getDivisionName(
                      selectedMachine.divisionId ?? selectedMachine.DivisionId
                    )}
                  </dd>
                  <dt className="font-medium text-muted-foreground">Status:</dt>
                  <dd>{getMachineStatus(selectedMachine)}</dd>
                </dl>
              </div>

              <Button type="button" className="w-full" onClick={downloadQR}>
                Download QR
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Machine;