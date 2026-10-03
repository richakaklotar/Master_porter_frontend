import React, { useEffect, useRef, useState } from "react";
import Dialog from "@mui/material/Dialog";
import jsQR from "jsqr";
import {
  Camera,
  CameraOff,
  ClipboardList,
  Cog,
  Play,
  ScanLine,
  Square,
  Trash2,
  X,
} from "lucide-react";
import PageHeader from "../components/page-header";
import FormError from "../components/form-error";
import { notifyError, notifySuccess } from "../lib/notify";
import { loadJobCards, saveJobCards } from "../lib/local-store";
import shiftService from "../services/shiftService";
import projectService from "../services/projectService";
import componentsService from "../services/componentsService";
import activityService from "../services/activityService";
import subActivityService from "../services/subActivityService";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";

const LABEL_CLASS =
  "text-xs font-medium uppercase tracking-wide text-muted-foreground";
const READONLY_CLASS = "bg-muted/60";

const EMPTY_JOB = {
  operator: "",
  shiftID: "",
  projectID: "",
  componentID: "",
  activitiesID: "",
  subActivitiesID: "",
  startTime: "",
  endTime: "",
  remarks: "",
  rework: false,
};

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

const pad = (n) => String(n).padStart(2, "0");

const formatDate = (d) =>
  `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;

const formatClock = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

const formatElapsed = (seconds) =>
  `${pad(Math.floor(seconds / 3600))}:${pad(
    Math.floor((seconds % 3600) / 60)
  )}:${pad(seconds % 60)}`;

// "HH:MM" pair -> decimal hours (end before start = crossed midnight)
const getTotalHours = (start, end) => {
  if (!start || !end) return "";
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let minutes = eh * 60 + em - (sh * 60 + sm);
  if (minutes < 0) minutes += 24 * 60;
  return (minutes / 60).toFixed(2);
};

// =====================================================
// QR SCANNER (camera permission + jsQR frame decoding)
// =====================================================
const SCANNER_MESSAGES = {
  requesting: {
    title: "Camera permission needed",
    text: "Please choose Allow when your browser asks to use the camera.",
  },
  denied: {
    title: "Camera access is blocked",
    text: "Allow camera access for this site from the lock / camera icon in the address bar, then try again.",
    retry: true,
  },
  nocamera: {
    title: "No camera found",
    text: "Connect a camera to this device and try again.",
    retry: true,
  },
  busy: {
    title: "Camera is unavailable",
    text: "The camera may be in use by another app. Close it and try again.",
    retry: true,
  },
  unsupported: {
    title: "Camera is not available",
    text: "The camera only works on a secure (https) page or on localhost.",
  },
};

function ScannerView({ onResult }) {
  const videoRef = useRef(null);
  // requesting | scanning | denied | nocamera | busy | unsupported
  const [status, setStatus] = useState("requesting");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let stream = null;
    let timer = null;
    let cancelled = false;

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("unsupported");
        return;
      }

      setStatus("requesting");

      try {
        // Shows the browser permission prompt if access was not decided yet
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();
        setStatus("scanning");

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        timer = setInterval(() => {
          if (cancelled || video.readyState < 2 || !video.videoWidth) return;

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(image.data, image.width, image.height);

          if (code?.data) {
            cancelled = true;
            onResult(code.data);
          }
        }, 250);
      } catch (err) {
        if (cancelled) return;
        console.error("QR SCANNER ERROR:", err);

        if (err?.name === "NotAllowedError" || err?.name === "SecurityError") {
          setStatus("denied");
        } else if (
          err?.name === "NotFoundError" ||
          err?.name === "OverconstrainedError"
        ) {
          setStatus("nocamera");
        } else {
          setStatus("busy");
        }
      }
    };

    start();

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [attempt]);

  const info = SCANNER_MESSAGES[status];

  return (
    <div>
      {/* Video stays mounted so the stream can attach as soon as access is granted */}
      <video
        ref={videoRef}
        muted
        playsInline
        className={
          status === "scanning"
            ? "aspect-square w-full rounded-xl bg-black object-cover"
            : "hidden"
        }
      />

      {status === "scanning" && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Point the camera at the machine QR code.
        </p>
      )}

      {info && (
        <div className="flex flex-col items-center gap-3 px-2 py-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            {status === "requesting" ? (
              <Camera className="size-5" />
            ) : (
              <CameraOff className="size-5" />
            )}
          </div>
          <p className="text-sm font-medium">{info.title}</p>
          <p className="text-sm text-muted-foreground">{info.text}</p>
          {info.retry && (
            <Button
              type="button"
              size="sm"
              onClick={() => setAttempt((n) => n + 1)}
            >
              Try Again
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function JobCard() {
  const [shifts, setShifts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [components, setComponents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [subActivities, setSubActivities] = useState([]);

  const [job, setJob] = useState(EMPTY_JOB);
  const [machine, setMachine] = useState(null);
  const [jobs, setJobs] = useState(loadJobCards);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showScanner, setShowScanner] = useState(false);

  // Timer
  const [running, setRunning] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  const today = formatDate(new Date());
  const totalHours = getTotalHours(job.startTime, job.endTime);

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
  // LOAD DROPDOWN DATA
  // =====================================================
  const loadData = async () => {
    const [shiftRes, projectRes, componentRes, activityRes, subActivityRes] =
      await Promise.allSettled([
        shiftService.getShifts(),
        projectService.getProjects(),
        componentsService.getComponents(),
        activityService.getActivities(),
        subActivityService.getSubActivities(),
      ]);

    const apply = (res, setter, fallback) => {
      if (res.status === "fulfilled") {
        setter(toList(res.value?.data));
      } else {
        console.error("JOB CARD LOAD ERROR:", res.reason);
        notifyError(res.reason, fallback);
      }
    };

    apply(shiftRes, setShifts, "Failed to load shifts.");
    apply(projectRes, setProjects, "Failed to load projects.");
    apply(componentRes, setComponents, "Failed to load components.");
    apply(activityRes, setActivities, "Failed to load activities.");
    apply(subActivityRes, setSubActivities, "Failed to load sub activities.");
  };

  useEffect(() => {
    loadData();
  }, []);

  // =====================================================
  // TIMER TICK
  // =====================================================
  useEffect(() => {
    if (!running) return undefined;

    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => clearInterval(id);
  }, [running, startedAt]);

  // =====================================================
  // START / STOP TIMER
  // =====================================================
  const handleTimerToggle = () => {
    const now = new Date();

    if (running) {
      setRunning(false);
      setJob((prev) => ({ ...prev, endTime: formatClock(now) }));
      clearFieldError("endTime");
      return;
    }

    setStartedAt(now.getTime());
    setElapsed(0);
    setRunning(true);
    setJob((prev) => ({ ...prev, startTime: formatClock(now), endTime: "" }));
    clearFieldError("startTime");
  };

  // =====================================================
  // CASCADING DROPDOWN OPTIONS
  // =====================================================
  const sameId = (a, b) => String(a ?? "") === String(b ?? "");

  // After a machine scan, only that machine's projects are offered
  const projectOptions = machine
    ? projects.filter((p) => sameId(prop(p, "machineID"), machine.machineID))
    : projects;

  const componentOptions = components.filter(
    (c) => !job.projectID || sameId(prop(c, "projectID"), job.projectID)
  );

  const activityOptions = activities.filter(
    (a) => !job.componentID || sameId(prop(a, "componentID"), job.componentID)
  );

  const subActivityOptions = subActivities.filter(
    (s) => !job.activitiesID || sameId(prop(s, "activitiesID"), job.activitiesID)
  );

  // =====================================================
  // HANDLE CHANGE
  // =====================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setJob((prev) => ({ ...prev, [name]: value }));
    clearFieldError(name);
  };

  // Changing a parent dropdown clears everything below it
  const handleSelectChange = (name, value, resets = []) => {
    setJob((prev) => ({
      ...prev,
      [name]: String(value ?? ""),
      ...Object.fromEntries(resets.map((key) => [key, ""])),
    }));

    clearFieldError(name);
  };

  // =====================================================
  // QR SCAN RESULT (machine QR generated on the Machines page)
  // =====================================================
  const handleScanResult = (rawValue) => {
    setShowScanner(false);

    try {
      const data = JSON.parse(rawValue);
      const machineID = prop(data, "machineID");

      if (!machineID) throw new Error("Not a machine QR");

      setMachine({
        machineID,
        machineName: prop(data, "machineName") || "",
        machineCode: prop(data, "machineCode") || "",
      });

      setJob((prev) => ({
        ...prev,
        projectID: "",
        componentID: "",
        activitiesID: "",
        subActivitiesID: "",
      }));

      notifySuccess("Machine scanned successfully");
    } catch (err) {
      console.error("QR PARSE ERROR:", err);
      notifyError(null, "This QR code is not a valid machine QR code.");
    }
  };

  // =====================================================
  // LOOKUP NAME BY ID
  // =====================================================
  const getName = (list, idKey, nameKey, id) => {
    const match = list.find((item) => sameId(prop(item, idKey), id));
    return match ? prop(match, nameKey) || "-" : "-";
  };

  // =====================================================
  // SAVE JOB CARD
  // =====================================================
  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = {};

    if (!job.operator.trim()) errors.operator = "Operator is required.";
    if (!job.shiftID) errors.shiftID = "Please select Shift.";
    if (!job.projectID) errors.projectID = "Please select Project.";
    if (!job.componentID) errors.componentID = "Please select Component.";
    if (!job.activitiesID) errors.activitiesID = "Please select Activity.";
    if (!job.startTime) errors.startTime = "Start time is required.";

    if (running) {
      errors.endTime = "Stop the timer before saving.";
    } else if (!job.endTime) {
      errors.endTime = "End time is required.";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    updateJobs((prev) => [
      {
        id: Date.now(),
        date: today,
        shiftID: job.shiftID,
        projectID: job.projectID,
        componentID: job.componentID,
        machineName: machine?.machineName || "-",
        operator: job.operator.trim(),
        shift: getName(shifts, "shiftID", "shiftName", job.shiftID),
        project: getName(projects, "projectID", "projectName", job.projectID),
        component: getName(
          components,
          "componentID",
          "componentName",
          job.componentID
        ),
        activity: getName(
          activities,
          "activitiesID",
          "activitiesName",
          job.activitiesID
        ),
        subActivity: getName(
          subActivities,
          "subActivitiesID",
          "subActivitiesName",
          job.subActivitiesID
        ),
        startTime: job.startTime,
        endTime: job.endTime,
        totalHours,
        remarks: job.remarks.trim(),
        rework: job.rework,
      },
      ...prev,
    ]);

    notifySuccess("Job card saved successfully");
    resetForm();
  };

  // Job cards are kept in localStorage (read by the Reports page)
  const updateJobs = (updater) => {
    setJobs((prev) => {
      const next = updater(prev);
      saveJobCards(next);
      return next;
    });
  };

  // =====================================================
  // RESET FORM
  // =====================================================
  const resetForm = () => {
    setJob(EMPTY_JOB);
    setMachine(null);
    setFieldErrors({});
    setRunning(false);
    setStartedAt(null);
    setElapsed(0);
  };

  const handleRemoveJob = (id) => {
    updateJobs((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="w-full">
      {/* ================= HEADER ================= */}
      <PageHeader
        icon={ClipboardList}
        title="Job Card"
        description="Log job timings against a project activity."
      />

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-6">
        {/* ================= JOB CARD FORM ================= */}
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* SCAN QR */}
              <Button
                type="button"
                size="lg"
                onClick={() => setShowScanner(true)}
                className="w-full bg-gradient-to-r from-violet-600 to-blue-600"
              >
                <ScanLine className="size-4" />
                Scan QR Code
              </Button>

              {machine && (
                <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <Cog className="size-4 shrink-0 text-primary" />
                    <span className="truncate font-medium">
                      {machine.machineName || `Machine #${machine.machineID}`}
                    </span>
                    {machine.machineCode && (
                      <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                        {machine.machineCode}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label="Clear machine"
                    className="cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={() => setMachine(null)}
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}

              {/* TIMER */}
              <div className="flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 px-4 py-6">
                <div className="font-mono text-4xl font-semibold tabular-nums tracking-tight text-indigo-800">
                  {formatElapsed(elapsed)}
                </div>
                <Button
                  type="button"
                  variant={running ? "destructive" : "success"}
                  onClick={handleTimerToggle}
                >
                  {running ? (
                    <>
                      <Square className="size-4 fill-current" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play className="size-4 fill-current" />
                      Start
                    </>
                  )}
                </Button>
              </div>

              {/* DATE */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="date" className={LABEL_CLASS}>
                  Date
                </Label>
                <Input
                  id="date"
                  type="text"
                  value={today}
                  readOnly
                  className={READONLY_CLASS}
                />
              </div>

              {/* OPERATOR */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="operator" className={LABEL_CLASS}>
                  Operator
                </Label>
                <Input
                  id="operator"
                  type="text"
                  name="operator"
                  value={job.operator}
                  onChange={handleChange}
                  maxLength={50}
                  aria-invalid={!!fieldErrors.operator}
                />
                <FormError message={fieldErrors.operator} />
              </div>

              {/* SHIFT */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="shiftID" className={LABEL_CLASS}>
                  Shift
                </Label>
                <Select
                  value={job.shiftID}
                  onValueChange={(value) => handleSelectChange("shiftID", value)}
                >
                  <SelectTrigger
                    id="shiftID"
                    aria-invalid={!!fieldErrors.shiftID}
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {shifts.map((item) => (
                      <SelectItem
                        key={prop(item, "shiftID")}
                        value={String(prop(item, "shiftID"))}
                      >
                        {prop(item, "shiftName")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormError message={fieldErrors.shiftID} />
              </div>

              {/* PROJECT */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="projectID" className={LABEL_CLASS}>
                  Project
                </Label>
                <Select
                  value={job.projectID}
                  onValueChange={(value) =>
                    handleSelectChange("projectID", value, [
                      "componentID",
                      "activitiesID",
                      "subActivitiesID",
                    ])
                  }
                >
                  <SelectTrigger
                    id="projectID"
                    aria-invalid={!!fieldErrors.projectID}
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectOptions.map((item) => (
                      <SelectItem
                        key={prop(item, "projectID")}
                        value={String(prop(item, "projectID"))}
                      >
                        {prop(item, "projectName")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormError message={fieldErrors.projectID} />
              </div>

              {/* COMPONENT */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="componentID" className={LABEL_CLASS}>
                  Component
                </Label>
                <Select
                  value={job.componentID}
                  onValueChange={(value) =>
                    handleSelectChange("componentID", value, [
                      "activitiesID",
                      "subActivitiesID",
                    ])
                  }
                >
                  <SelectTrigger
                    id="componentID"
                    aria-invalid={!!fieldErrors.componentID}
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {componentOptions.map((item) => (
                      <SelectItem
                        key={prop(item, "componentID")}
                        value={String(prop(item, "componentID"))}
                      >
                        {prop(item, "componentName")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormError message={fieldErrors.componentID} />
              </div>

              {/* ACTIVITY */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="activitiesID" className={LABEL_CLASS}>
                  Activity
                </Label>
                <Select
                  value={job.activitiesID}
                  onValueChange={(value) =>
                    handleSelectChange("activitiesID", value, [
                      "subActivitiesID",
                    ])
                  }
                >
                  <SelectTrigger
                    id="activitiesID"
                    aria-invalid={!!fieldErrors.activitiesID}
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {activityOptions.map((item) => (
                      <SelectItem
                        key={prop(item, "activitiesID")}
                        value={String(prop(item, "activitiesID"))}
                      >
                        {prop(item, "activitiesName")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormError message={fieldErrors.activitiesID} />
              </div>

              {/* SUB ACTIVITY */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="subActivitiesID" className={LABEL_CLASS}>
                  Sub Activity
                </Label>
                <Select
                  value={job.subActivitiesID}
                  onValueChange={(value) =>
                    handleSelectChange("subActivitiesID", value)
                  }
                >
                  <SelectTrigger id="subActivitiesID">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {subActivityOptions.map((item) => (
                      <SelectItem
                        key={prop(item, "subActivitiesID")}
                        value={String(prop(item, "subActivitiesID"))}
                      >
                        {prop(item, "subActivitiesName")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* START / END */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="startTime" className={LABEL_CLASS}>
                    Start
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    name="startTime"
                    value={job.startTime}
                    onChange={handleChange}
                    disabled={running}
                    aria-invalid={!!fieldErrors.startTime}
                    className={READONLY_CLASS}
                  />
                  <FormError message={fieldErrors.startTime} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="endTime" className={LABEL_CLASS}>
                    End
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    name="endTime"
                    value={job.endTime}
                    onChange={handleChange}
                    disabled={running}
                    aria-invalid={!!fieldErrors.endTime}
                    className={READONLY_CLASS}
                  />
                  <FormError message={fieldErrors.endTime} />
                </div>
              </div>

              {/* TOTAL HOURS */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="totalHours" className={LABEL_CLASS}>
                  Total Hours
                </Label>
                <Input
                  id="totalHours"
                  type="text"
                  value={totalHours}
                  readOnly
                  className={READONLY_CLASS}
                />
              </div>

              {/* REMARKS */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="remarks" className={LABEL_CLASS}>
                  Remarks
                </Label>
                <Textarea
                  id="remarks"
                  name="remarks"
                  value={job.remarks}
                  onChange={handleChange}
                  maxLength={250}
                />
              </div>

              {/* REWORK */}
              <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                <Checkbox
                  checked={job.rework}
                  onCheckedChange={(checked) =>
                    setJob((prev) => ({ ...prev, rework: checked }))
                  }
                />
                Rework (Idle Hrs)
              </label>

              {/* ACTIONS */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="submit"
                  size="lg"
                  className="bg-gradient-to-r from-blue-800 to-blue-600"
                >
                  Save Job Card
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={resetForm}
                >
                  Discard
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* ================= LOGGED JOBS ================= */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <CardTitle>Logged Jobs</CardTitle>
            <Badge variant="secondary" className="rounded-full font-normal">
              {jobs.length}
            </Badge>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {jobs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Operator</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Component</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((item) => (
                    <TableRow key={item.id} className="group transition-colors">
                      <TableCell className="font-medium">
                        {item.operator}
                        <div className="text-xs font-normal text-muted-foreground">
                          {item.date} · {item.shift}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.project}
                        {item.machineName !== "-" && (
                          <div className="text-xs text-muted-foreground">
                            {item.machineName}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{item.component}</TableCell>
                      <TableCell>
                        {item.activity}
                        {item.subActivity !== "-" && (
                          <div className="text-xs text-muted-foreground">
                            {item.subActivity}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {item.startTime} – {item.endTime}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.totalHours}
                          {item.rework && (
                            <Badge variant="secondary">Rework</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleRemoveJob(item.id)}
                        >
                          <Trash2 className="size-3.5" />
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="px-6 pb-16 pt-10 text-center text-sm text-muted-foreground">
                No jobs logged yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ================= QR SCANNER DIALOG ================= */}
      <Dialog
        open={showScanner}
        onClose={() => setShowScanner(false)}
        fullWidth
        maxWidth="xs"
        aria-labelledby="qr-scanner-title"
        slotProps={{
          paper: { sx: { borderRadius: "16px", m: 2, width: "calc(100% - 32px)" } },
        }}
      >
        <div className="flex flex-col gap-4 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <h2
              id="qr-scanner-title"
              className="text-base font-semibold leading-tight"
            >
              Scan Machine QR Code
            </h2>
            <button
              type="button"
              aria-label="Close"
              className="cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => setShowScanner(false)}
            >
              <X className="size-4" />
            </button>
          </div>
          <ScannerView onResult={handleScanResult} />
        </div>
      </Dialog>
    </div>
  );
}

export default JobCard;
