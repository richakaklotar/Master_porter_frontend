import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { BarChart3 } from "lucide-react";
import PageHeader from "../components/page-header";
import MachineProduction from "../components/machine-production";
import { notifyError } from "../lib/notify";
import { loadJobCards, loadPlannerDraft } from "../lib/local-store";
import shiftService from "../services/shiftService";
import projectService from "../services/projectService";
import componentsService from "../services/componentsService";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TABS = [
  { value: "job-card", label: "Job Card Analysis" },
  { value: "plan-vs-actual", label: "Plan vs Actual" },
  { value: "machine-production", label: "Machine Production" },
];

// Same keys the Planner stores per row
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

const ALL = "all";

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

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const formatHours = (value) => toNumber(value).toFixed(2);

// "dd-mm-yyyy" (Job Card date) -> { day, month (0-11), year }
const parseJobDate = (value = "") => {
  const [day, month, year] = value.split("-").map(Number);
  return { day, month: month - 1, year };
};

const jobDateSortKey = (value) => {
  const { day, month, year } = parseJobDate(value);
  return (year || 0) * 10000 + (month || 0) * 100 + (day || 0);
};

// "HH:MM" or "HH:MM:SS" pair -> hours (end before start = crossed midnight)
const getDurationHours = (start, end) => {
  if (!start || !end) return null;
  const [sh, sm] = String(start).split(":").map(Number);
  const [eh, em] = String(end).split(":").map(Number);
  if ([sh, sm, eh, em].some((n) => !Number.isFinite(n))) return null;
  let minutes = eh * 60 + em - (sh * 60 + sm);
  if (minutes <= 0) minutes += 24 * 60;
  return minutes / 60;
};

// Empty state: centred in the visible table area (also when the table is
// wider than the screen and scrolls sideways)
function EmptyRow({ colSpan, message }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="h-full p-0">
        <div className="sticky left-0 flex min-h-40 w-[calc(100vw-4rem)] max-w-full items-center justify-center px-4 text-center text-sm whitespace-normal text-muted-foreground">
          {message}
        </div>
      </TableCell>
    </TableRow>
  );
}

// =====================================================
// JOB CARD ANALYSIS
// =====================================================
function JobCardAnalysis({ jobs, shifts }) {
  const rows = useMemo(() => {
    const sorted = [...jobs].sort(
      (a, b) => jobDateSortKey(b.date) - jobDateSortKey(a.date) || b.id - a.id
    );

    // Logged hours per operator / shift / day, used for un-utilised hours
    const groupKey = (job) =>
      `${job.date}|${job.shiftID ?? job.shift}|${(job.operator || "")
        .trim()
        .toLowerCase()}`;

    const loggedByGroup = {};
    sorted.forEach((job) => {
      const key = groupKey(job);
      loggedByGroup[key] = (loggedByGroup[key] || 0) + toNumber(job.totalHours);
    });

    const seen = new Set();

    return sorted.map((job) => {
      const hours = toNumber(job.totalHours);
      const key = groupKey(job);

      // Shown once per group (on its first row) so the value is not repeated
      let unUtilHours = null;
      if (!seen.has(key)) {
        seen.add(key);

        const shift = shifts.find((s) => sameId(prop(s, "shiftID"), job.shiftID));
        const shiftHours = getDurationHours(
          prop(shift, "startTime"),
          prop(shift, "endTime")
        );

        if (shiftHours != null) {
          unUtilHours = Math.max(0, shiftHours - loggedByGroup[key]);
        }
      }

      return {
        ...job,
        cycleHours: job.rework ? 0 : hours,
        idleHours: job.rework ? hours : 0,
        unUtilHours,
      };
    });
  }, [jobs, shifts]);

  return (
    <Table className={rows.length === 0 ? "h-full" : undefined}>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Date</TableHead>
          <TableHead>Shift</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Component</TableHead>
          <TableHead>Activity</TableHead>
          <TableHead>Sub Activity</TableHead>
          <TableHead>Operator</TableHead>
          <TableHead>Start</TableHead>
          <TableHead>End</TableHead>
          <TableHead className="text-right">Cycle Hrs</TableHead>
          <TableHead className="text-right">Idle Hrs</TableHead>
          <TableHead className="text-right">Un-Util Hrs</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length > 0 ? (
          rows.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.date}</TableCell>
              <TableCell>{item.shift}</TableCell>
              <TableCell className="font-medium">{item.project}</TableCell>
              <TableCell>{item.component}</TableCell>
              <TableCell>{item.activity}</TableCell>
              <TableCell>{item.subActivity}</TableCell>
              <TableCell>{item.operator}</TableCell>
              <TableCell>{item.startTime}</TableCell>
              <TableCell>{item.endTime}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatHours(item.cycleHours)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatHours(item.idleHours)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {item.unUtilHours == null ? "-" : formatHours(item.unUtilHours)}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <EmptyRow colSpan={12} message="No job data available" />
        )}
      </TableBody>
    </Table>
  );
}

// =====================================================
// PLAN VS ACTUAL
// =====================================================
function PlanVsActual({ jobs, plannerRows, projects, components }) {
  const now = new Date();
  const [projectFilter, setProjectFilter] = useState(ALL);
  const [month, setMonth] = useState(String(now.getMonth()));
  const year = now.getFullYear();

  const monthKey = MONTHS[Number(month)];
  const monthLabel = monthKey.toUpperCase();

  const projectOptions = projects.map((p) => ({
    value: String(prop(p, "projectID")),
    label: prop(p, "projectName") || "-",
  }));

  const rows = useMemo(() => {
    const byPair = new Map();

    const ensure = (projectID, componentID) => {
      const key = `${projectID}|${componentID}`;
      if (!byPair.has(key)) {
        byPair.set(key, {
          key,
          projectID,
          componentID,
          plan: 0,
          actual: 0,
          idle: 0,
          jobCount: 0,
          projectName: "",
          componentName: "",
        });
      }
      return byPair.get(key);
    };

    // Plan: saved Planner rows
    plannerRows
      .filter((row) => !row.isNew && row.projectID && row.componentID)
      .forEach((row) => {
        ensure(row.projectID, row.componentID).plan += toNumber(row[monthKey]);
      });

    // Actual: Job Cards logged in the selected month of this year
    jobs.forEach((job) => {
      if (!job.projectID || !job.componentID) return;

      const date = parseJobDate(job.date);
      if (date.month !== Number(month) || date.year !== year) return;

      const entry = ensure(job.projectID, job.componentID);
      const hours = toNumber(job.totalHours);

      if (job.rework) entry.idle += hours;
      else entry.actual += hours;

      entry.jobCount += 1;
      entry.projectName ||= job.project;
      entry.componentName ||= job.component;
    });

    const nameOf = (list, idKey, nameKey, id, fallback) => {
      const match = list.find((item) => sameId(prop(item, idKey), id));
      return (match && prop(match, nameKey)) || fallback || "-";
    };

    return [...byPair.values()]
      .filter(
        (row) => projectFilter === ALL || sameId(row.projectID, projectFilter)
      )
      .filter((row) => row.plan > 0 || row.jobCount > 0)
      .map((row) => ({
        ...row,
        projectName: nameOf(
          projects,
          "projectID",
          "projectName",
          row.projectID,
          row.projectName
        ),
        componentName: nameOf(
          components,
          "componentID",
          "componentName",
          row.componentID,
          row.componentName
        ),
        variance: row.plan > 0 ? ((row.actual - row.plan) / row.plan) * 100 : null,
      }))
      .sort(
        (a, b) =>
          a.projectName.localeCompare(b.projectName) ||
          a.componentName.localeCompare(b.componentName)
      );
  }, [jobs, plannerRows, projects, components, projectFilter, month, monthKey, year]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      {/* FILTERS */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex w-[calc(50%-0.375rem)] flex-col gap-2 sm:w-44">
          <Label htmlFor="pvaProject" className={LABEL_CLASS}>
            Project
          </Label>
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger id="pvaProject">
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

        <div className="flex w-[calc(50%-0.375rem)] flex-col gap-2 sm:w-36">
          <Label htmlFor="pvaMonth" className={LABEL_CLASS}>
            Month
          </Label>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger id="pvaMonth">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => (
                <SelectItem key={m} value={String(i)}>
                  {m.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* TABLE */}
      <Table className={rows.length === 0 ? "h-full" : undefined}>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>SNo</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Component</TableHead>
            <TableHead>Details</TableHead>
            <TableHead className="text-right">{monthLabel} Plan</TableHead>
            <TableHead className="text-right">{monthLabel} Actual</TableHead>
            <TableHead className="text-right">Variance%</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length > 0 ? (
            rows.map((row, index) => (
              <TableRow key={row.key}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{row.projectName}</TableCell>
                <TableCell>{row.componentName}</TableCell>
                <TableCell className="text-muted-foreground">
                  {row.jobCount} job card{row.jobCount === 1 ? "" : "s"}
                  {row.idle > 0 && ` · ${formatHours(row.idle)} idle hrs`}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatHours(row.plan)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatHours(row.actual)}
                </TableCell>
                <TableCell
                  className={
                    row.variance == null
                      ? "text-right text-muted-foreground"
                      : row.variance < 0
                        ? "text-right font-medium tabular-nums text-destructive"
                        : "text-right font-medium tabular-nums text-emerald-600"
                  }
                >
                  {row.variance == null
                    ? "-"
                    : `${row.variance > 0 ? "+" : ""}${row.variance.toFixed(1)}%`}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <EmptyRow colSpan={7} message="No data available" />
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function Reports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab = TABS.some((t) => t.value === tabParam) ? tabParam : TABS[0].value;

  const [shifts, setShifts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [components, setComponents] = useState([]);

  // Read on mount so the latest Job Cards / Planner draft are shown
  const [jobs] = useState(loadJobCards);
  const [plannerRows] = useState(loadPlannerDraft);

  // =====================================================
  // LOAD LOOKUP DATA
  // =====================================================
  const loadData = async () => {
    const [shiftRes, projectRes, componentRes] = await Promise.allSettled([
      shiftService.getShifts(),
      projectService.getProjects(),
      componentsService.getComponents(),
    ]);

    const apply = (res, setter, fallback) => {
      if (res.status === "fulfilled") {
        setter(toList(res.value?.data));
      } else {
        console.error("REPORTS LOAD ERROR:", res.reason);
        notifyError(res.reason, fallback);
      }
    };

    apply(shiftRes, setShifts, "Failed to load shifts.");
    apply(projectRes, setProjects, "Failed to load projects.");
    apply(componentRes, setComponents, "Failed to load components.");
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="flex h-full min-h-[28rem] w-full flex-col">
      {/* ================= HEADER ================= */}
      <PageHeader
        icon={BarChart3}
        title="Reports"
        description="Job card analysis and plan vs actual tracking."
      />

      {/* ================= TABS ================= */}
      <Tabs
        value={tab}
        onChange={(_e, value) => setSearchParams({ tab: value }, { replace: true })}
        variant="scrollable"
        scrollButtons={false}
        sx={{
          flexShrink: 0,
          mb: { xs: 2, sm: 3 },
          borderBottom: "1px solid var(--border)",
          minHeight: 44,
          "& .MuiTab-root": {
            textTransform: "none",
            fontFamily: "inherit",
            fontSize: "0.9rem",
            fontWeight: 500,
            minHeight: 44,
            px: { xs: 1.5, sm: 2.5 },
            color: "var(--muted-foreground)",
          },
          "& .MuiTab-root.Mui-selected": {
            color: "var(--primary)",
            fontWeight: 600,
          },
          "& .MuiTabs-indicator": { backgroundColor: "var(--primary)" },
        }}
      >
        {TABS.map((t) => (
          <Tab key={t.value} value={t.value} label={t.label} />
        ))}
      </Tabs>

      {/* ================= CONTENT ================= */}
      {tab === "machine-production" ? (
        // Has its own tiles and chart card, so it is not wrapped in the table card
        <div className="min-h-0 flex-1 overflow-y-auto">
          <MachineProduction />
        </div>
      ) : (
        <Card className="min-h-0 flex-1 border-border/60 shadow-sm">
          <CardContent className="flex min-h-0 flex-1 flex-col p-4">
            {tab === "job-card" && (
              <JobCardAnalysis jobs={jobs} shifts={shifts} />
            )}
            {tab === "plan-vs-actual" && (
              <PlanVsActual
                jobs={jobs}
                plannerRows={plannerRows}
                projects={projects}
                components={components}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Reports;
