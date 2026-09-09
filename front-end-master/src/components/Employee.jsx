import React, { useEffect, useState } from "react";
import employeeService from "../services/employeeService";
import designationService from "../services/designationService";
import shiftService from "../services/shiftService";

function Employee() {
  const [employees, setEmployees] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [shifts, setShifts] = useState([]);

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

  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // =========================
  // EXTRACT EMPLOYEE ID
  // =========================
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
  // GET ERROR MESSAGE
  // =========================
  const getErrorMessage = (err) => {
    if (err?.response?.data?.errors) {
      return Object.values(err.response.data.errors)
        .flat()
        .join(" ");
    }

    return (
      err?.response?.data?.message ||
      err?.response?.data?.title ||
      err?.message ||
      "Something went wrong."
    );
  };

  // =========================
  // LOAD EMPLOYEES
  // =========================
  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await employeeService.getEmployees();

      console.log("Employees:", response.data);

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setEmployees(data);
    } catch (err) {
      console.error("Load Employee Error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD DESIGNATIONS
  // =========================
  const loadDesignations = async () => {
    try {
      const response =
        await designationService.getDesignations();

      console.log("Designations:", response.data);

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setDesignations(data);
    } catch (err) {
      console.error(
        "Load Designation Error:",
        err
      );
    }
  };

  // =========================
  // LOAD SHIFTS
  // =========================
  const loadShifts = async () => {
    try {
      const response =
        await shiftService.getShifts();

      console.log("Shifts:", response.data);

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setShifts(data);
    } catch (err) {
      console.error(
        "Load Shift Error:",
        err
      );
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    loadEmployees();
    loadDesignations();
    loadShifts();
  }, []);

  // =========================
  // INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setEmployee((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
            ? "Active"
            : "Inactive"
          : value,
    }));

    setError("");
  };

  // =====================================================
  // DUPLICATE EMPLOYEE CODE CHECK
  // =====================================================
  const isDuplicateEmployeeCode = (code) => {
    const normalizedCode = code
      .trim()
      .toLowerCase();

    const currentId = Number(
      employee.employeeID || 0
    );

    return employees.some((item) => {
      const existingId =
        extractEmployeeId(item);

      const existingCode = String(
        item.employeeCode ??
          item.EmployeeCode ??
          ""
      )
        .trim()
        .toLowerCase();

      // Edit mode: ignore current employee
      if (
        isEdit &&
        existingId === currentId
      ) {
        return false;
      }

      return (
        existingCode === normalizedCode
      );
    });
  };

  // =====================================================
  // DUPLICATE EMPLOYEE NAME CHECK
  // =====================================================
  const isDuplicateEmployeeName = (name) => {
    const normalizedName = name
      .trim()
      .toLowerCase();

    const currentId = Number(
      employee.employeeID || 0
    );

    return employees.some((item) => {
      const existingId =
        extractEmployeeId(item);

      const existingName = String(
        item.employeeName ??
          item.EmployeeName ??
          ""
      )
        .trim()
        .toLowerCase();

      // Edit mode: ignore current employee
      if (
        isEdit &&
        existingId === currentId
      ) {
        return false;
      }

      return (
        existingName === normalizedName
      );
    });
  };

  // =========================
  // CREATE / UPDATE
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      // =========================
      // BASIC VALIDATION
      // =========================

      const employeeCode =
        employee.employeeCode.trim();

      const employeeName =
        employee.employeeName.trim();

      if (!employeeCode) {
        return setError(
          "Employee Code is required."
        );
      }

      if (!employeeName) {
        return setError(
          "Employee Name is required."
        );
      }

      if (!employee.phone.trim()) {
        return setError(
          "Phone is required."
        );
      }

      if (!employee.email.trim()) {
        return setError(
          "Email is required."
        );
      }

      if (!employee.address.trim()) {
        return setError(
          "Address is required."
        );
      }

      if (!employee.joiningDate) {
        return setError(
          "Joining Date is required."
        );
      }

      if (
        !employee.designationID ||
        Number(employee.designationID) <= 0
      ) {
        return setError(
          "Please select a valid Designation."
        );
      }

      if (
        !employee.shiftID ||
        Number(employee.shiftID) <= 0
      ) {
        return setError(
          "Please select a valid Shift."
        );
      }

      if (!employee.status) {
        return setError(
          "Status is required."
        );
      }

      // =====================================================
      // DUPLICATE EMPLOYEE CODE
      // =====================================================
      if (
        isDuplicateEmployeeCode(
          employeeCode
        )
      ) {
        return setError(
          `Employee Code "${employeeCode}" already exists. Please enter a different Employee Code.`
        );
      }

      // =====================================================
      // DUPLICATE EMPLOYEE NAME
      // =====================================================
      if (
        isDuplicateEmployeeName(
          employeeName
        )
      ) {
        return setError(
          `Employee Name "${employeeName}" already exists. Please enter a different Employee Name.`
        );
      }

      const employeeId = Number(
        employee.employeeID || 0
      );

      // =========================
      // REQUEST DATA
      // =========================
      const requestData = {
        employeeID: employeeId,

        employeeCode:
          employeeCode,

        employeeName:
          employeeName,

        phone:
          employee.phone.trim(),

        email:
          employee.email.trim(),

        address:
          employee.address.trim(),

        joiningDate:
          employee.joiningDate,

        designationID: parseInt(
          employee.designationID,
          10
        ),

        shiftID: parseInt(
          employee.shiftID,
          10
        ),

        status:
          employee.status,

        Status:
          employee.status,
      };

      console.log(
        "Employee Request:",
        requestData
      );

      // =========================
      // UPDATE
      // =========================
      if (isEdit) {
        if (
          !employeeId ||
          employeeId <= 0
        ) {
          setError(
            "Invalid Employee ID."
          );
          return;
        }

        await employeeService.updateEmployee(
          employeeId,
          requestData
        );

        alert(
          "Employee updated successfully"
        );
      }

      // =========================
      // CREATE
      // =========================
      else {
        await employeeService.createEmployee(
          requestData
        );

        alert(
          "Employee created successfully"
        );
      }

      resetForm();

      await loadEmployees();

    } catch (err) {
      console.error(
        "Save Employee Error:",
        err
      );

      setError(
        getErrorMessage(err)
      );
    }
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = async (id) => {
    try {
      setError("");
      setSaving(true);

      const response =
        await employeeService.getEmployeeById(id);

      const data = response.data;

      let formattedDate = "";

      const rawDate =
        data.joiningDate ??
        data.JoiningDate;

      if (rawDate) {
        formattedDate = String(
          rawDate
        ).substring(0, 10);
      }

      setEmployee({
        employeeID:
          data.employeeID ??
          data.EmployeeID ??
          0,

        employeeCode:
          data.employeeCode ??
          data.EmployeeCode ??
          "",

        employeeName:
          data.employeeName ??
          data.EmployeeName ??
          "",

        phone:
          data.phone ??
          data.Phone ??
          "",

        email:
          data.email ??
          data.Email ??
          "",

        address:
          data.address ??
          data.Address ??
          "",

        joiningDate:
          formattedDate,

        designationID:
          data.designationID ??
          data.DesignationID ??
          data.designationId ??
          "",

        shiftID:
          data.shiftID ??
          data.ShiftID ??
          data.shiftId ??
          "",

        status:
          extractStatus(data),
      });

      setIsEdit(true);

    } catch (err) {
      console.error(
        "Get Employee Error:",
        err
      );

      setError(
        getErrorMessage(err)
      );

    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    if (!id) {
      setError(
        "Invalid Employee ID."
      );
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete this employee?"
      )
    ) {
      return;
    }

    try {
      setError("");
      setLoading(true);

      await employeeService.deleteEmployee(
        id
      );

      alert(
        "Employee deleted successfully"
      );

      await loadEmployees();

    } catch (err) {
      console.error(
        "Delete Employee Error:",
        err
      );

      setError(
        getErrorMessage(err)
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RESET FORM
  // =========================
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
    setError("");
  };

  // =========================
  // DESIGNATION NAME
  // =========================
  const getDesignationName = (id) => {
    const designation =
      designations.find(
        (d) =>
          String(
            d.designationID ??
              d.DesignationID ??
              d.designationId ??
              d.DesignationId
          ) === String(id)
      );

    if (!designation) {
      return id || "N/A";
    }

    return (
      designation.designationName ??
      designation.DesignationName ??
      designation.name ??
      designation.Name ??
      "N/A"
    );
  };

  // =========================
  // SHIFT NAME
  // =========================
  const getShiftName = (id) => {
    const shift =
      shifts.find(
        (s) =>
          String(
            s.shiftID ??
              s.ShiftID ??
              s.shiftId ??
              s.ShiftId
          ) === String(id)
      );

    if (!shift) {
      return id || "N/A";
    }

    return (
      shift.shiftName ??
      shift.ShiftName ??
      shift.name ??
      shift.Name ??
      "N/A"
    );
  };

  return (
    <div className="plant-page-wrapper">

      {/* ERROR */}
      {error && (
        <div className="alert alert-danger mb-4">
          <strong>Error:</strong>{" "}
          {String(error)}
        </div>
      )}

      <div className="cards-side-by-side">

        {/* =========================
            LEFT FORM
        ========================= */}
        <div className="left-card-form">
          <div className="prototype-card">

            <form onSubmit={handleSubmit}>

              {/* EMPLOYEE CODE */}
              <div className="mb-3">
                <label className="proto-label">
                  EMPLOYEE CODE *
                </label>

                <input
                  type="text"
                  className="proto-input"
                  name="employeeCode"
                  value={
                    employee.employeeCode
                  }
                  onChange={handleChange}
                  placeholder="Enter Employee Code"
                  required
                  disabled={saving}
                />
              </div>

              {/* EMPLOYEE NAME */}
              <div className="mb-3">
                <label className="proto-label">
                  EMPLOYEE NAME *
                </label>

                <input
                  type="text"
                  className="proto-input"
                  name="employeeName"
                  value={
                    employee.employeeName
                  }
                  onChange={handleChange}
                  placeholder="Enter Employee Name"
                  required
                  disabled={saving}
                />
              </div>

              {/* PHONE */}
              <div className="mb-3">
                <label className="proto-label">
                  PHONE *
                </label>

                <input
                  type="text"
                  className="proto-input"
                  name="phone"
                  value={employee.phone}
                  onChange={handleChange}
                  placeholder="Enter Phone"
                  maxLength="10"
                  required
                  disabled={saving}
                />
              </div>

              {/* EMAIL */}
              <div className="mb-3">
                <label className="proto-label">
                  EMAIL *
                </label>

                <input
                  type="email"
                  className="proto-input"
                  name="email"
                  value={employee.email}
                  onChange={handleChange}
                  placeholder="Enter Email"
                  required
                  disabled={saving}
                />
              </div>

              {/* ADDRESS */}
              <div className="mb-3">
                <label className="proto-label">
                  ADDRESS *
                </label>

                <textarea
                  className="proto-input"
                  name="address"
                  value={
                    employee.address
                  }
                  onChange={handleChange}
                  placeholder="Enter Address"
                  rows="3"
                  required
                  disabled={saving}
                />
              </div>

              {/* JOINING DATE */}
              <div className="mb-3">
                <label className="proto-label">
                  JOINING DATE *
                </label>

                <input
                  type="date"
                  className="proto-input"
                  name="joiningDate"
                  value={
                    employee.joiningDate
                  }
                  onChange={handleChange}
                  required
                  disabled={saving}
                />
              </div>

              {/* DESIGNATION */}
              <div className="mb-3">
                <label className="proto-label">
                  DESIGNATION *
                </label>

                <select
                  className="proto-input"
                  name="designationID"
                  value={
                    employee.designationID
                  }
                  onChange={handleChange}
                  required
                  disabled={saving}
                >
                  <option value="">
                    Select Designation
                  </option>

                  {designations.map(
                    (designation) => {
                      const id =
                        designation.designationID ??
                        designation.DesignationID ??
                        designation.designationId ??
                        designation.DesignationId;

                      const name =
                        designation.designationName ??
                        designation.DesignationName ??
                        designation.name ??
                        designation.Name;

                      return (
                        <option
                          key={id}
                          value={id}
                        >
                          {name}
                        </option>
                      );
                    }
                  )}
                </select>
              </div>

              {/* SHIFT */}
              <div className="mb-3">
                <label className="proto-label">
                  SHIFT *
                </label>

                <select
                  className="proto-input"
                  name="shiftID"
                  value={
                    employee.shiftID
                  }
                  onChange={handleChange}
                  required
                  disabled={saving}
                >
                  <option value="">
                    Select Shift
                  </option>

                  {shifts.map(
                    (shift) => {
                      const id =
                        shift.shiftID ??
                        shift.ShiftID ??
                        shift.shiftId ??
                        shift.ShiftId;

                      const name =
                        shift.shiftName ??
                        shift.ShiftName ??
                        shift.name ??
                        shift.Name;

                      return (
                        <option
                          key={id}
                          value={id}
                        >
                          {name}
                        </option>
                      );
                    }
                  )}
                </select>
              </div>

              {/* STATUS */}
              <div className="mb-4 status-field">

                <label className="proto-label d-block mb-2">
                  STATUS
                </label>

                <div className="status-control">

                  <input
                    type="checkbox"
                    id="employeeStatus"
                    name="status"
                    checked={
                      employee.status ===
                      "Active"
                    }
                    onChange={handleChange}
                    className="status-checkbox"
                    disabled={saving}
                  />

                  <label
                    htmlFor="employeeStatus"
                    className="status-text"
                  >
                    {employee.status ===
                    "Active"
                      ? "Active"
                      : "Inactive"}
                  </label>

                </div>
              </div>

              {/* BUTTONS */}
              <div className="d-flex gap-2 pt-1">

                <button
                  type="submit"
                  className="btn-proto-save"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : isEdit
                    ? "Update"
                    : "Save"}
                </button>

                <button
                  type="button"
                  className="btn-proto-cancel"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>

              </div>

            </form>
          </div>
        </div>

        {/* =========================
            RIGHT TABLE
        ========================= */}
        <div className="right-card-table">

          <div
            className="prototype-card p-0 overflow-auto"
            style={{
              maxWidth: "100%",
            }}
          >

            {loading ? (

              <div
                className="p-4 text-center text-muted"
                style={{
                  fontSize: "0.875rem",
                }}
              >
                Loading employees...
              </div>

            ) : (

              <table
                className="table-proto"
                style={{
                  width: "100%",
                  tableLayout: "auto",
                }}
              >

                <thead>
                  <tr>
                    <th>CODE</th>
                    <th>EMPLOYEE</th>
                    <th>PHONE</th>
                    <th>EMAIL</th>
                    <th>JOINING DATE</th>
                    <th>DESIGNATION</th>
                    <th>SHIFT</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>

                  {employees.length > 0 ? (

                    employees.map((item) => {

                      const employeeId =
                        extractEmployeeId(
                          item
                        );

                      const employeeCode =
                        item.employeeCode ??
                        item.EmployeeCode ??
                        "";

                      const employeeName =
                        item.employeeName ??
                        item.EmployeeName ??
                        "";

                      const phone =
                        item.phone ??
                        item.Phone ??
                        "";

                      const email =
                        item.email ??
                        item.Email ??
                        "";

                      const joiningDate =
                        item.joiningDate ??
                        item.JoiningDate ??
                        "";

                      const designationId =
                        item.designationID ??
                        item.DesignationID ??
                        item.designationId;

                      const shiftId =
                        item.shiftID ??
                        item.ShiftID ??
                        item.shiftId;

                      const status =
                        extractStatus(item);

                      const isActive =
                        status === "Active";

                      return (
                        <tr
                          key={employeeId}
                        >

                          <td>
                            {employeeCode}
                          </td>

                          <td>
                            {employeeName}
                          </td>

                          <td>
                            {phone}
                          </td>

                          <td>
                            {email}
                          </td>

                          <td>
                            {joiningDate
                              ? String(
                                  joiningDate
                                ).substring(
                                  0,
                                  10
                                )
                              : "N/A"}
                          </td>

                          <td>
                            {getDesignationName(
                              designationId
                            )}
                          </td>

                          <td>
                            {getShiftName(
                              shiftId
                            )}
                          </td>

                          <td>
                            <span
                              className={
                                isActive
                                  ? "status-active"
                                  : "status-inactive"
                              }
                            >
                              {isActive
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>

                          <td>

                            <button
                              type="button"
                              className="btn btn-link btn-sm p-0 me-3 text-primary text-decoration-none"
                              style={{
                                fontSize:
                                  "0.85rem",
                                fontWeight:
                                  "500",
                              }}
                              onClick={() =>
                                handleEdit(
                                  employeeId
                                )
                              }
                              disabled={saving}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="btn btn-link btn-sm p-0 text-danger text-decoration-none"
                              style={{
                                fontSize:
                                  "0.85rem",
                                fontWeight:
                                  "500",
                              }}
                              onClick={() =>
                                handleDelete(
                                  employeeId
                                )
                              }
                              disabled={saving}
                            >
                              Delete
                            </button>

                          </td>

                        </tr>
                      );
                    })

                  ) : (

                    <tr>
                      <td
                        colSpan="9"
                        className="text-center py-5 text-muted"
                      >
                        No employees found
                      </td>
                    </tr>

                  )}

                </tbody>

              </table>

            )}

          </div>

        </div>

      </div>

      {/* =========================
          STATUS CSS
      ========================= */}
      <style>
        {`
          .status-field {
            width: 100%;
            text-align: left !important;
          }

          .status-control {
            display: flex;
            align-items: center;
            justify-content: flex-start !important;
            width: 100%;
            text-align: left;
            margin: 0;
            padding: 0;
          }

          .status-checkbox {
            appearance: auto;
            -webkit-appearance: checkbox;
            width: 18px !important;
            height: 18px !important;
            margin: 0 !important;
            padding: 0 !important;
            cursor: pointer;
            flex: 0 0 18px;
          }

          .status-text {
            margin: 0 0 0 8px !important;
            padding: 0 !important;
            cursor: pointer;
            font-size: 0.875rem;
            font-weight: 500;
            line-height: 18px;
            text-align: left;
          }

          .status-active,
          .status-inactive {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
          }

          .status-active {
            background-color: #d1e7dd;
            color: #0f5132;
          }

          .status-inactive {
            background-color: #f8d7da;
            color: #842029;
          }
        `}
      </style>

    </div>
  );
}

export default Employee;