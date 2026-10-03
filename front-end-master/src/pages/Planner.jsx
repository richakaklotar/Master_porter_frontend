import React, { useEffect, useMemo, useState } from "react";
import {
  DataGrid,
  GridRowModes,
  GridRowEditStopReasons,
} from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import useMediaQuery from "@mui/material/useMediaQuery";
import { CalendarRange, Check, Plus, Save, Trash2, X } from "lucide-react";
import PageHeader from "../components/page-header";
import { useConfirm } from "../components/confirm-dialog";
import { notifyError, notifySuccess } from "../lib/notify";
import { loadPlannerDraft, savePlannerDraft } from "../lib/local-store";
import projectService from "../services/projectService";
import componentsService from "../services/componentsService";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "all";

const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

const LABEL_CLASS =
  "text-xs font-medium uppercase tracking-wide text-muted-foreground";

// =====================================================
// HELPERS
// =====================================================

// Case-insensitive property read (API casing is not consistent)
const prop = (obj, key) => {
  if (!obj) return undefined;
  const lowerKey = key.toLowerCase();
  const matchedKey = Object.keys(obj).find((k) => k.toLowerCase() === lowerKey);
  return matchedKey ? obj[matchedKey] : undefined;
};

const toList = (data) =>
  Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

const sameId = (a, b) => String(a ?? "") === String(b ?? "");

const createRow = (projectID = "", componentID = "") => ({
  id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  projectID,
  componentID,
  ...Object.fromEntries(MONTHS.map((m) => [m, null])),
  isNew: true,
});

function Planner() {
  const [projects, setProjects] = useState([]);
  const [components, setComponents] = useState([]);
  const [rows, setRows] = useState(loadPlannerDraft);
  const [rowModesModel, setRowModesModel] = useState({});
  const [projectFilter, setProjectFilter] = useState(ALL);
  const [componentFilter, setComponentFilter] = useState(ALL);

  // Phones get a compact grid (same breakpoint as Tailwind's `sm`)
  const isMobile = useMediaQuery("(max-width: 639.98px)");

  const confirmAction = useConfirm();

  const editingIds = Object.keys(rowModesModel).filter(
    (id) => rowModesModel[id]?.mode === GridRowModes.Edit
  );
  const isEditing = editingIds.length > 0;

  // =====================================================
  // LOAD DROPDOWN DATA
  // =====================================================
  const loadData = async () => {
    const [projectRes, componentRes] = await Promise.allSettled([
      projectService.getProjects(),
      componentsService.getComponents(),
    ]);

    if (projectRes.status === "fulfilled") {
      setProjects(toList(projectRes.value?.data));
    } else {
      console.error("PLANNER LOAD PROJECTS ERROR:", projectRes.reason);
      notifyError(projectRes.reason, "Failed to load projects.");
    }

    if (componentRes.status === "fulfilled") {
      setComponents(toList(componentRes.value?.data));
    } else {
      console.error("PLANNER LOAD COMPONENTS ERROR:", componentRes.reason);
      notifyError(componentRes.reason, "Failed to load components.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =====================================================
  // DROPDOWN OPTIONS
  // =====================================================
  const projectOptions = projects.map((p) => ({
    value: String(prop(p, "projectID")),
    label: prop(p, "projectName") || "-",
  }));

  const getComponentOptions = (projectID) =>
    components
      .filter((c) => !projectID || sameId(prop(c, "projectID"), projectID))
      .map((c) => ({
        value: String(prop(c, "componentID")),
        label: prop(c, "componentName") || "-",
      }));

  const filterComponentOptions = getComponentOptions(
    projectFilter === ALL ? "" : projectFilter
  );

  // =====================================================
  // FILTERED ROWS (new rows always stay visible)
  // =====================================================
  const visibleRows = useMemo(
    () =>
      rows.filter(
        (row) =>
          row.isNew ||
          ((projectFilter === ALL || sameId(row.projectID, projectFilter)) &&
            (componentFilter === ALL ||
              sameId(row.componentID, componentFilter)))
      ),
    [rows, projectFilter, componentFilter]
  );

  // =====================================================
  // ADD ROW (prefilled from the active filters)
  // =====================================================
  const handleAddRow = () => {
    const row = createRow(
      projectFilter === ALL ? "" : projectFilter,
      componentFilter === ALL ? "" : componentFilter
    );

    setRows((prev) => [...prev, row]);
    setRowModesModel((prev) => ({
      ...prev,
      [row.id]: {
        mode: GridRowModes.Edit,
        fieldToFocus: row.projectID ? "jan" : "projectID",
      },
    }));
  };

  // =====================================================
  // ROW EDITING
  // =====================================================

  // Single click / tap on a cell starts editing that row
  const handleCellClick = (params) => {
    if (!params.isEditable) return;
    if (rowModesModel[params.id]?.mode === GridRowModes.Edit) return;

    setRowModesModel((prev) => ({
      ...prev,
      [params.id]: { mode: GridRowModes.Edit, fieldToFocus: params.field },
    }));
  };

  // Keep the row open when focus leaves it - it is saved with Enter / Save
  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const saveRows = (ids) => {
    handleSaveDraft();
    setRowModesModel((prev) => ({
      ...prev,
      ...Object.fromEntries(ids.map((id) => [id, { mode: GridRowModes.View }])),
    }));
  };

  const cancelRow = (id) => {
    setRowModesModel((prev) => ({
      ...prev,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    }));

    // An unsaved new row is simply dropped
    setRows((prev) => prev.filter((row) => !(row.id === id && row.isNew)));
  };

  const deleteRow = async (id) => {
    const confirmed = await confirmAction({
      title: "Delete row?",
      message: "Are you sure you want to delete this planner row?",
      confirmText: "Delete",
    });

    if (!confirmed) return;

    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  // Field errors for a row; empty object when the row is valid
  const validateRow = (newRow) => {
    const errors = {};

    if (!newRow.projectID) {
      errors.projectID = "Please select Project.";
    }

    if (!newRow.componentID) {
      errors.componentID = "Please select Component.";
    }

    if (errors.projectID || errors.componentID) return errors;

    const componentMatches = components.some(
      (c) =>
        sameId(prop(c, "componentID"), newRow.componentID) &&
        sameId(prop(c, "projectID"), newRow.projectID)
    );

    if (components.length > 0 && !componentMatches) {
      errors.componentID = "Selected Component does not belong to this Project.";
      return errors;
    }

    const duplicate = rows.some(
      (row) =>
        row.id !== newRow.id &&
        !row.isNew &&
        sameId(row.projectID, newRow.projectID) &&
        sameId(row.componentID, newRow.componentID)
    );

    if (duplicate) {
      errors.componentID = "This Project and Component already has a row.";
    }

    return errors;
  };

  // Validates and commits an edited row (runs on Enter and on Save)
  const processRowUpdate = (newRow) => {
    const [firstError] = Object.values(validateRow(newRow));

    if (firstError) {
      throw new Error(firstError);
    }

    const updatedRow = { ...newRow, isNew: false };
    setRows((prev) =>
      prev.map((row) => (row.id === newRow.id ? updatedRow : row))
    );
    return updatedRow;
  };

  const handleProcessRowUpdateError = (err) => {
    notifyError(null, err?.message || "Failed to save row.");
  };

  // =====================================================
  // SAVE DRAFT
  // =====================================================
  const handleSaveDraft = () => {
    // if (isEditing) {
    //   notifyError(null, "Save or cancel the rows being edited first.");
    //   return;
    // }

    try {
      savePlannerDraft(rows);
      notifySuccess("Planner draft saved successfully");
    } catch (err) {
      console.error("PLANNER SAVE DRAFT ERROR:", err);
      notifyError(err, "Failed to save planner draft.");
    }
  };

  // =====================================================
  // RESPONSIVE SIZES (compact grid + buttons on phones)
  // =====================================================
  const grid = isMobile
    ? {
        sr: 36,
        project: 104,
        component: 112,
        month: 52,
        actions: 76,
        rowHeight: 36,
        headerHeight: 34,
        fontSize: "0.75rem",
        headerFontSize: "0.65rem",
        cellPadding: "0 6px",
      }
    : {
        sr: 60,
        project: 160,
        component: 170,
        month: 82,
        actions: 100,
        rowHeight: 48,
        headerHeight: 44,
        fontSize: "0.875rem",
        headerFontSize: "0.75rem",
        cellPadding: "0 10px",
      };

  const buttonSize = isMobile ? "sm" : "default";

  // =====================================================
  // COLUMNS
  // =====================================================
  const columns = [
    {
      field: "sr",
      headerName: "SR",
      width: grid.sr,
      sortable: false,
      filterable: false,
      renderCell: (params) =>
        params.api.getRowIndexRelativeToVisibleRows(params.id) + 1,
    },
    {
      field: "projectID",
      headerName: "Project",
      type: "singleSelect",
      editable: true,
      minWidth: grid.project,
      flex: 1,
      valueOptions: projectOptions,
    },
    {
      field: "componentID",
      headerName: "Component",
      type: "singleSelect",
      editable: true,
      minWidth: grid.component,
      flex: 1,
      valueOptions: ({ row }) => getComponentOptions(row?.projectID),
    },
    ...MONTHS.map((month) => ({
      field: month,
      headerName: month.toUpperCase(),
      type: "number",
      editable: true,
      width: grid.month,
      align: "center",
      headerAlign: "center",
      preProcessEditCellProps: (params) => ({
        ...params.props,
        error: params.props.value != null && params.props.value < 0,
      }),
    })),
    {
      field: "actions",
      headerName: "Action",
      width: grid.actions,
      sortable: false,
      filterable: false,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => {
        const editing =
          rowModesModel[params.id]?.mode === GridRowModes.Edit;

        // Stop the click from re-opening the row through onCellClick
        const run = (fn) => (e) => {
          e.stopPropagation();
          fn();
        };

        return editing ? (
          <div className="flex h-full items-center justify-end gap-1">
            <Tooltip title="Save">
              <IconButton
                size="small"
                aria-label="Save row"
                onClick={run(() => saveRows([params.id]))}
                sx={{ color: "#059669" }}
              >
                <Check className="size-4" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cancel">
              <IconButton
                size="small"
                aria-label="Cancel editing"
                onClick={run(() => cancelRow(params.id))}
              >
                <X className="size-4" />
              </IconButton>
            </Tooltip>
          </div>
        ) : (
          <div className="flex h-full items-center justify-end">
            <Tooltip title="Delete">
              <IconButton
                size="small"
                aria-label="Delete row"
                onClick={run(() => deleteRow(params.id))}
                sx={{ color: "var(--destructive)" }}
              >
                <Trash2 className="size-4" />
              </IconButton>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex h-full min-h-[32rem] w-full flex-col">
      {/* ================= HEADER ================= */}
      <PageHeader
        icon={CalendarRange}
        title="Planner"
        description="Plan monthly quantities per project component."
      />

      <Card className="min-h-0 flex-1 border-border/60 shadow-sm">
        <CardContent className="flex min-h-0 flex-1 flex-col gap-3 p-3 sm:gap-5 sm:p-6">
          {/* ================= FILTERS + ACTIONS ================= */}
          <div className="flex flex-wrap items-end gap-2 sm:gap-3">
            <div className="flex w-[calc(50%-0.25rem)] flex-col gap-2 sm:w-44">
              <Label htmlFor="projectFilter" className={LABEL_CLASS}>
                Project
              </Label>
              <Select
                value={projectFilter}
                onValueChange={(value) => {
                  setProjectFilter(value);
                  setComponentFilter(ALL);
                }}
              >
                <SelectTrigger id="projectFilter">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All</SelectItem>
                  {projectOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex w-[calc(50%-0.25rem)] flex-col gap-2 sm:w-44">
              <Label htmlFor="componentFilter" className={LABEL_CLASS}>
                Component
              </Label>
              <Select value={componentFilter} onValueChange={setComponentFilter}>
                <SelectTrigger id="componentFilter">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All</SelectItem>
                  {filterComponentOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex w-full gap-2 sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={handleAddRow}
                size={buttonSize}
                className="flex-1 sm:h-10 sm:flex-none"
              >
                <Plus className="size-4" />
                Add New
              </Button>
              {/* <Button
                type="button"
                onClick={handleSaveDraft}
                size={buttonSize}
                className="flex-1 bg-gradient-to-r from-blue-800 to-blue-600 sm:h-10 sm:flex-none"
              >
                <Save className="size-4" />
                Save Draft
              </Button> */}
              {isEditing && (
                <Button
                  type="button"
                  variant="success"
                  onClick={() => saveRows(editingIds)}
                  size={buttonSize}
                  className="flex-1 sm:h-10 sm:flex-none"
                >
                  <Check className="size-4" />
                  Save Row{editingIds.length > 1 ? "s" : ""}
                </Button>
              )}
            </div>
          </div>

          <p className="text-[11px] sm:-mt-2 sm:text-xs text-muted-foreground">
            Tap a cell to edit the row, then press Enter or the ✓ button to
            save it. Esc cancels.
          </p>

          {/* ================= GRID ================= */}
          <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
            <DataGrid
              rows={visibleRows}
              columns={columns}
              editMode="row"
              rowModesModel={rowModesModel}
              onRowModesModelChange={setRowModesModel}
              onRowEditStop={handleRowEditStop}
              onCellClick={handleCellClick}
              processRowUpdate={processRowUpdate}
              onProcessRowUpdateError={handleProcessRowUpdateError}
              hideFooter
              disableRowSelectionOnClick
              disableColumnMenu
              rowHeight={grid.rowHeight}
              columnHeaderHeight={grid.headerHeight}
              localeText={{ noRowsLabel: "No rows yet. Use Add New to start planning." }}
              sx={{
                border: 0,
                fontFamily: "inherit",
                fontSize: grid.fontSize,
                "& .MuiDataGrid-cell, & .MuiDataGrid-columnHeader": {
                  padding: grid.cellPadding,
                },
                "--DataGrid-containerBackground": "transparent",
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontSize: grid.headerFontSize,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: "var(--muted-foreground)",
                },
                "& .MuiDataGrid-columnHeaders": {
                  borderBottom: "1px solid var(--border)",
                },
                "& .MuiDataGrid-cell": { borderColor: "var(--border)" },
                "& .MuiDataGrid-cell--editable": { cursor: "pointer" },
                "& .MuiDataGrid-row--editing": {
                  boxShadow: "none",
                  backgroundColor:
                    "color-mix(in oklab, var(--primary) 6%, transparent)",
                },
                "& .MuiDataGrid-row--editing .MuiDataGrid-cell": {
                  backgroundColor: "transparent",
                },
                "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within":
                  { outline: "none" },
                "& .MuiDataGrid-overlay": {
                  color: "var(--muted-foreground)",
                },
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Planner;
