import { useEffect, useMemo, useState } from "react";
import {
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import PageHeader from "../components/page-header";
import { useConfirm } from "../components/confirm-dialog";
import { notifyError, notifySuccess } from "../lib/notify";
import FormDialog from "../components/form-dialog";
import FormError from "../components/form-error";
import employeeService from "../services/employeeService";
import designationService from "../services/designationService";
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
import { Textarea } from "@/components/ui/textarea";

function Employee() {
  const [employees, setEmployees] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [shifts, setShifts] = useState([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [employee, setEmployee] = useState({
    employeeID: 0,
    employeeCode: "",
    employeeName: "",
    phone: "",
    email: "",
    address: "",
    joiningDate: "",
    designationID: "",
    shiftID: "",
    status: "Active",
  });

  const confirmAction = useConfirm();
  const [isEdit, setIsEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});

  const clearFieldError = (name) => {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;

      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  // =====================================================
  // EXTRACT EMPLOYEE ID
  // =====================================================
  const extractEmployeeId = (item) => {
    if (!item) return 0;

    return Number(
      item.employeeID ??
        item.employeeId ??
        item.EmployeeID ??
        item.EmployeeId ??
        item.id ??
        item.ID ??
        0
    );
  };

  // =====================================================
  // EXTRACT STATUS
  // =====================================================
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

  // =====================================================
  // GET ENTITY PROPERTY
  // =====================================================
  const getEntityProperty = (obj, key) => {
    if (!obj) return undefined;

    const lowerKey = key.toLowerCase();

    const matchedKey = Object.keys(obj).find(
      (k) => k.toLowerCase() === lowerKey
    );

    return matchedKey ? obj[matchedKey] : undefined;
  };

  // =====================================================
  // LOAD EMPLOYEES
  // =====================================================
  const loadEmployees = async () => {
    try {
      setLoading(true);

      const response = await employeeService.getEmployees();

      console.log("Employees:", response.data);

      const data = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      setEmployees(data);
    } catch (err) {
      console.error("Load Employee Error:", err);
      notifyError(err, "Failed to load employees.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD DESIGNATIONS
  // =====================================================
  const loadDesignations = async () => {
    try {
      const response = await designationService.getDesignations();

      console.log("Designations:", response.data);

      const data = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      setDesignations(data);
    } catch (err) {
      console.error("Load Designation Error:", err);
      notifyError(err, "Failed to load designations.");
    }
  };

  // =====================================================
  // LOAD SHIFTS
  // =====================================================
  const loadShifts = async () => {
    try {
      const response = await shiftService.getShifts();

      console.log("Shifts:", response.data);

      const data = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      setShifts(data);
    } catch (err) {
      console.error("Load Shift Error:", err);
      notifyError(err, "Failed to load shifts.");
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================
  useEffect(() => {
    loadEmployees();
    loadDesignations();
    loadShifts();
  }, []);

  // =====================================================
  // INPUT CHANGE
  // =====================================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setEmployee((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (checked ? "Active" : "Inactive") : value,
    }));

    clearFieldError(name);
  };

  // =====================================================
  // HANDLE PHONE CHANGE
  // =====================================================
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");

    setEmployee((prev) => ({
      ...prev,
      phone: value.substring(0, 10),
    }));

    clearFieldError("phone");
  };

  // =====================================================
  // HANDLE DESIGNATION CHANGE
  // =====================================================
  const handleDesignationChange = (value) => {
    setEmployee((prev) => ({
      ...prev,
      designationID: String(value ?? ""),
    }));

    clearFieldError("designationID");
  };

  // =====================================================
  // HANDLE SHIFT CHANGE
  // =====================================================
  const handleShiftChange = (value) => {
    setEmployee((prev) => ({
      ...prev,
      shiftID: String(value ?? ""),
    }));

    clearFieldError("shiftID");
  };

  // =====================================================
  // HANDLE STATUS CHANGE
  // =====================================================
  const handleStatusChange = (checked) => {
    setEmployee((prev) => ({
      ...prev,
      status: checked ? "Active" : "Inactive",
    }));

    clearFieldError("status");
  };

  // =====================================================
  // DUPLICATE EMPLOYEE CODE
  // =====================================================
  const isDuplicateEmployeeCode = (code) => {
    const normalizedCode = code.trim().toLowerCase();

    const currentId = Number(employee.employeeID || 0);

    return employees.some((item) => {
      const existingId = extractEmployeeId(item);

      const existingCode = String(
        getEntityProperty(item, "employeeCode") || ""
      )
        .trim()
        .toLowerCase();

      if (isEdit && existingId === currentId) {
        return false;
      }

      return existingCode === normalizedCode;
    });
  };

  // =====================================================
  // DUPLICATE EMPLOYEE NAME
  // =====================================================
  const isDuplicateEmployeeName = (name) => {
    const normalizedName = name.trim().toLowerCase();

    const currentId = Number(employee.employeeID || 0);

    return employees.some((item) => {
      const existingId = extractEmployeeId(item);

      const existingName = String(
        getEntityProperty(item, "employeeName") || ""
      )
        .trim()
        .toLowerCase();

      if (isEdit && existingId === currentId) {
        return false;
      }

      return existingName === normalizedName;
    });
  };

  // =====================================================
  // VALIDATE EMPLOYEE
  // =====================================================
  const validateEmployee = () => {
    const employeeCode = employee.employeeCode.trim();

    const employeeName = employee.employeeName.trim();
    const errors = {};

    if (!employeeCode) {
      errors.employeeCode = "Employee Code is required.";
    }

    if (!employeeName) {
      errors.employeeName = "Employee Name is required.";
    }

    if (!employee.phone.trim()) {
      errors.phone = "Phone is required.";
    } else if (!/^\d{10}$/.test(employee.phone.trim())) {
      errors.phone = "Phone must contain exactly 10 digits.";
    }

    if (!employee.email.trim()) {
      errors.email = "Email is required.";
    }

    if (!employee.address.trim()) {
      errors.address = "Address is required.";
    }

    if (!employee.joiningDate) {
      errors.joiningDate = "Joining Date is required.";
    }

    if (!employee.designationID || Number(employee.designationID) <= 0) {
      errors.designationID = "Please select a valid Designation.";
    }

    if (!employee.shiftID || Number(employee.shiftID) <= 0) {
      errors.shiftID = "Please select a valid Shift.";
    }

    if (!employee.status) {
      errors.status = "Status is required.";
    }

    if (Object.keys(errors).length === 0) {
      if (isDuplicateEmployeeCode(employeeCode)) {
        errors.employeeCode = `Employee Code "${employeeCode}" already exists. Please enter a different Employee Code.`;
      }

      if (isDuplicateEmployeeName(employeeName)) {
        errors.employeeName = `Employee Name "${employeeName}" already exists. Please enter a different Employee Name.`;
      }
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // =====================================================
  // CREATE / UPDATE
  // =====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmployee()) {
      return;
    }

    try {
      setSaving(true);

      const employeeId = Number(employee.employeeID || 0);

      const requestData = {
        employeeID: employeeId,
        employeeCode: employee.employeeCode.trim(),
        employeeName: employee.employeeName.trim(),
        phone: employee.phone.trim(),
        email: employee.email.trim(),
        address: employee.address.trim(),
        joiningDate: employee.joiningDate,
        designationID: parseInt(employee.designationID, 10),
        shiftID: parseInt(employee.shiftID, 10),
        status: employee.status || "Active",
        Status: employee.status || "Active",
      };

      console.log("EMPLOYEE REQUEST:", requestData);

      // UPDATE
      if (isEdit) {
        if (!employeeId || employeeId <= 0) {
          notifyError(null, "Invalid Employee ID.");
          return;
        }

        await employeeService.updateEmployee(employeeId, requestData);

        notifySuccess("Employee updated successfully.");
      }

      // CREATE
      else {
        await employeeService.createEmployee(requestData);

        notifySuccess("Employee created successfully.");
      }

      resetForm();
      setShowForm(false);

      await loadEmployees();
    } catch (err) {
      console.error("Save Employee Error:", err);
      notifyError(err, "Failed to save employee.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // EDIT EMPLOYEE
  // =====================================================
  const handleEdit = async (id) => {
    if (!id || Number(id) <= 0) {
      return;
    }

    try {
      setSaving(true);

      const response = await employeeService.getEmployeeById(Number(id));

      const data = response?.data;

      console.log("EDIT EMPLOYEE DATA:", data);

      const rawDate = getEntityProperty(data, "joiningDate");

      let formattedDate = "";

      if (rawDate) {
        formattedDate = String(rawDate).substring(0, 10);
      }

      setEmployee({
        employeeID: extractEmployeeId(data),
        employeeCode: getEntityProperty(data, "employeeCode") ?? "",
        employeeName: getEntityProperty(data, "employeeName") ?? "",
        phone: getEntityProperty(data, "phone") ?? "",
        email: getEntityProperty(data, "email") ?? "",
        address: getEntityProperty(data, "address") ?? "",
        joiningDate: formattedDate,
        designationID: String(getEntityProperty(data, "designationID") ?? ""),
        shiftID: String(getEntityProperty(data, "shiftID") ?? ""),
        status: extractStatus(data),
      });

      setIsEdit(true);
      setShowForm(true);
    } catch (err) {
      console.error("Get Employee Error:", err);
      notifyError(err, "Failed to load employee details.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE EMPLOYEE
  // =====================================================
  const handleDelete = async (id) => {
    if (!id || Number(id) <= 0) {
      return;
    }

    const confirmed = await confirmAction({
      title: "Delete employee?",
      message:
        "Are you sure you want to delete this employee? This action cannot be undone.",
      confirmText: "Delete",
    });

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      await employeeService.deleteEmployee(Number(id));

      notifySuccess("Employee deleted successfully.");

      await loadEmployees();
    } catch (err) {
      console.error("Delete Employee Error:", err);
      notifyError(err, "Failed to delete employee.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RESET FORM
  // =====================================================
  const resetForm = () => {
    setEmployee({
      employeeID: 0,
      employeeCode: "",
      employeeName: "",
      phone: "",
      email: "",
      address: "",
      joiningDate: "",
      designationID: "",
      shiftID: "",
      status: "Active",
    });

    setIsEdit(false);
    setFieldErrors({});
  };

  // =====================================================
  // FILTERED LIST
  // =====================================================
  const filteredEmployees = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return employees;

    return employees.filter((item) => {
      const code = (getEntityProperty(item, "employeeCode") || "").toLowerCase();
      const name = (getEntityProperty(item, "employeeName") || "").toLowerCase();
      return code.includes(term) || name.includes(term);
    });
  }, [employees, search]);

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
  // ADD EMPLOYEE
  // =====================================================
  const handleAdd = () => {
    resetForm();
    setShowForm(true);
  };

  // =====================================================
  // DESIGNATION NAME
  // =====================================================
  const getDesignationName = (id) => {
    const designation = designations.find(
      (d) => Number(getEntityProperty(d, "designationID")) === Number(id)
    );

    if (!designation) {
      return id || "-";
    }

    return getEntityProperty(designation, "designationName") || "-";
  };

  // =====================================================
  // SHIFT NAME
  // =====================================================
  const getShiftName = (id) => {
    const shift = shifts.find(
      (s) => Number(getEntityProperty(s, "shiftID")) === Number(id)
    );

    if (!shift) {
      return id || "-";
    }

    return getEntityProperty(shift, "shiftName") || "-";
  };

  return (
    <div className="flex h-full min-h-[28rem] w-full flex-col">
      {/* ================= HEADER ================= */}
      <PageHeader
        icon={Users}
        title="Employees"
        description="Manage employee master data."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={loadEmployees}
          disabled={saving}
        >
          <RefreshCw className="size-4" />
          Refresh
        </Button>
        <Button size="sm" onClick={handleAdd} disabled={saving}>
          <Plus className="size-4" />
          Add Employee
        </Button>
      </PageHeader>

      {/* ================= TABLE CARD ================= */}
      <Card className="min-h-0 flex-1 border-border/60 shadow-sm">
        <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Employee List</CardTitle>
            <Badge
              variant="secondary"
              className="rounded-full font-normal"
            >
              {employees.length}
            </Badge>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employees..."
              className="h-8 pl-8 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Code</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Joining Date</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i} className="hover:bg-transparent">
                    <TableCell colSpan={10} className="py-3">
                      <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredEmployees.length > 0 ? (
                filteredEmployees.map((item) => {
                  const employeeId = extractEmployeeId(item);
                  const employeeCode =
                    getEntityProperty(item, "employeeCode") || "-";
                  const employeeName =
                    getEntityProperty(item, "employeeName") || "-";
                  const phone = getEntityProperty(item, "phone") || "-";
                  const email = getEntityProperty(item, "email") || "-";
                  const address = getEntityProperty(item, "address") || "-";
                  const joiningDate = getEntityProperty(item, "joiningDate");
                  const designationID = getEntityProperty(item, "designationID");
                  const shiftID = getEntityProperty(item, "shiftID");
                  const status = extractStatus(item);

                  const isActive = status === "Active";

                  return (
                    <TableRow
                      key={employeeId}
                      className="group transition-colors"
                    >
                      <TableCell>
                        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                          {employeeCode}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-48 font-medium">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                            {getInitials(employeeName)}
                          </div>
                          <span
                            className="truncate"
                            title={String(employeeName)}
                          >
                            {String(employeeName)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{phone}</TableCell>
                      <TableCell className="max-w-40 truncate">
                        <span title={String(email)}>{String(email)}</span>
                      </TableCell>
                      <TableCell className="max-w-40 truncate">
                        <span title={String(address)}>{String(address)}</span>
                      </TableCell>
                      <TableCell>
                        {joiningDate
                          ? String(joiningDate).substring(0, 10)
                          : "-"}
                      </TableCell>
                      <TableCell className="max-w-36 truncate">
                        <span title={getDesignationName(designationID)}>
                          {getDesignationName(designationID)}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-36 truncate">
                        <span title={getShiftName(shiftID)}>
                          {getShiftName(shiftID)}
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
                            onClick={() => handleEdit(employeeId)}
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
                            onClick={() => handleDelete(employeeId)}
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
                  <TableCell colSpan={10} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <div className="flex size-11 items-center justify-center rounded-full bg-muted">
                        <Users className="size-5" />
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {search ? "No matching employees" : "No employees yet"}
                      </p>
                      <p className="text-xs">
                        {search
                          ? "Try a different name or code."
                          : "Add your first employee using the form."}
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
        icon={Users}
        isEdit={isEdit}
        title={isEdit ? "Edit Employee" : "Add Employee"}
        description={
          isEdit
            ? "Update the employee details below."
            : "Fill in the details to add a new employee."
        }
        submitLabel={isEdit ? "Update Employee" : "Save Employee"}
        saving={saving}
        maxWidth="md"
      >
        {/* CODE + NAME */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="employeeCode">Employee Code <span className="text-destructive">*</span></Label>
            <Input
              id="employeeCode"
              type="text"
              name="employeeCode"
              value={employee.employeeCode}
              onChange={handleChange}
              placeholder="Enter Employee Code"
              disabled={saving}
              aria-invalid={!!fieldErrors.employeeCode}
            />
            <FormError message={fieldErrors.employeeCode} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="employeeName">Employee Name <span className="text-destructive">*</span></Label>
            <Input
              id="employeeName"
              type="text"
              name="employeeName"
              value={employee.employeeName}
              onChange={handleChange}
              placeholder="Enter Employee Name"
              disabled={saving}
              aria-invalid={!!fieldErrors.employeeName}
            />
            <FormError message={fieldErrors.employeeName} />
          </div>
        </div>

        {/* PHONE + EMAIL */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Phone <span className="text-destructive">*</span></Label>
            <Input
              id="phone"
              type="text"
              name="phone"
              value={employee.phone}
              onChange={handlePhoneChange}
              placeholder="Enter Phone"
              maxLength={10}
              disabled={saving}
              aria-invalid={!!fieldErrors.phone}
            />
            <FormError message={fieldErrors.phone} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
            <Input
              id="email"
              type="email"
              name="email"
              value={employee.email}
              onChange={handleChange}
              placeholder="Enter Email"
              disabled={saving}
              aria-invalid={!!fieldErrors.email}
            />
            <FormError message={fieldErrors.email} />
          </div>
        </div>

        {/* ADDRESS */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="address">Address <span className="text-destructive">*</span></Label>
          <Textarea
            id="address"
            name="address"
            value={employee.address}
            onChange={handleChange}
            placeholder="Enter Address"
            rows={2}
            disabled={saving}
            aria-invalid={!!fieldErrors.address}
          />
          <FormError message={fieldErrors.address} />
        </div>

        {/* JOINING DATE */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="joiningDate">Joining Date <span className="text-destructive">*</span></Label>
          <Input
            id="joiningDate"
            type="date"
            name="joiningDate"
            value={employee.joiningDate}
            onChange={handleChange}
            disabled={saving}
            aria-invalid={!!fieldErrors.joiningDate}
          />
          <FormError message={fieldErrors.joiningDate} />
        </div>

        {/* DESIGNATION + SHIFT */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="designationID">Designation <span className="text-destructive">*</span></Label>
            <Select
              value={employee.designationID}
              onValueChange={handleDesignationChange}
              disabled={saving}
            >
              <SelectTrigger
                id="designationID"
                className="w-full"
                aria-invalid={!!fieldErrors.designationID}
              >
                <SelectValue placeholder="Select Designation" />
              </SelectTrigger>
              <SelectContent>
                {designations.map((designation) => {
                  const id = getEntityProperty(designation, "designationID");
                  const name =
                    getEntityProperty(designation, "designationName") ||
                    "-";

                  return (
                    <SelectItem key={String(id)} value={String(id)}>
                      {name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <FormError message={fieldErrors.designationID} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="shiftID">Shift <span className="text-destructive">*</span></Label>
            <Select
              value={employee.shiftID}
              onValueChange={handleShiftChange}
              disabled={saving}
            >
              <SelectTrigger
                id="shiftID"
                className="w-full"
                aria-invalid={!!fieldErrors.shiftID}
              >
                <SelectValue placeholder="Select Shift" />
              </SelectTrigger>
              <SelectContent>
                {shifts.map((shift) => {
                  const id = getEntityProperty(shift, "shiftID");
                  const name = getEntityProperty(shift, "shiftName") || "-";

                  return (
                    <SelectItem key={String(id)} value={String(id)}>
                      {name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <FormError message={fieldErrors.shiftID} />
          </div>
        </div>

        {/* STATUS */}
        <StatusToggle
          value={employee.status}
          onChange={handleStatusChange}
          disabled={saving}
        />
      </FormDialog>
    </div>
  );
}

export default Employee;