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
  });

  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // LOAD EMPLOYEES
  // =========================
  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await employeeService.getEmployees();

      console.log("Employees:", response.data);

      setEmployees(response.data || []);
    } catch (err) {
      console.error("Load Employee Error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          err.message ||
          "Unable to load employees"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD DESIGNATIONS
  // =========================
  const loadDesignations = async () => {
    try {
      const response = await designationService.getDesignations();

      console.log("Designations:", response.data);

      setDesignations(response.data || []);
    } catch (err) {
      console.error("Load Designation Error:", err);
    }
  };

  // =========================
  // LOAD SHIFTS
  // =========================
  const loadShifts = async () => {
    try {
      const response = await shiftService.getShifts();

      console.log("Shifts:", response.data);

      setShifts(response.data || []);
    } catch (err) {
      console.error("Load Shift Error:", err);
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
    const { name, value } = e.target;

    setEmployee((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // CREATE / UPDATE
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      // Front-end Validations
      if (!employee.employeeCode.trim()) return setError("Employee Code is required.");
      if (!employee.employeeName.trim()) return setError("Employee Name is required.");
      if (!employee.phone.trim()) return setError("Phone is required.");
      if (!employee.email.trim()) return setError("Email is required.");
      if (!employee.address.trim()) return setError("Address is required.");
      if (!employee.joiningDate) return setError("Joining Date is required.");
      if (!employee.designationID || Number(employee.designationID) <= 0) {
        return setError("Please select a valid Designation.");
      }
      if (!employee.shiftID || Number(employee.shiftID) <= 0) {
        return setError("Please select a valid Shift.");
      }

      const employeeId = Number(employee.employeeID || 0);

      // Formatted payload matching C# Employee entity types exactly
      const requestData = {
        employeeID: employeeId,
        employeeCode: employee.employeeCode.trim(),
        employeeName: employee.employeeName.trim(),
        phone: employee.phone.trim(),
        email: employee.email.trim(),
        address: employee.address.trim(),
        joiningDate: employee.joiningDate, // Formatted as "YYYY-MM-DD" from <input type="date" />
        designationID: parseInt(employee.designationID, 10),
        shiftID: parseInt(employee.shiftID, 10)
      };

      if (isEdit) {
        await employeeService.updateEmployee(employeeId, requestData);
        alert("Employee updated successfully");
      } else {
        await employeeService.createEmployee(requestData);
        alert("Employee created successfully");
      }

      resetForm();
      await loadEmployees();
    } catch (err) {
      // Handled by updated catch block above
    }
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = async (id) => {
  try {
    setError("");
    const response = await employeeService.getEmployeeById(id);
    const data = response.data;

    let formattedDate = "";
    const rawDate = data.joiningDate ?? data.JoiningDate;
    if (rawDate) {
      formattedDate = new Date(rawDate).toISOString().split("T")[0];
    }

    setEmployee({
      employeeID: data.employeeID ?? data.EmployeeID ?? 0,
      employeeCode: data.employeeCode ?? data.EmployeeCode ?? "",
      employeeName: data.employeeName ?? data.EmployeeName ?? "",
      phone: data.phone ?? data.Phone ?? "",
      email: data.email ?? data.Email ?? "",
      address: data.address ?? data.Address ?? "",
      joiningDate: formattedDate,
      designationID: data.designationID ?? data.DesignationID ?? "",
      shiftID: data.shiftID ?? data.ShiftID ?? "",
    });

    setIsEdit(true);
  } catch (err) {
    console.error("Get Employee Error:", err);
    setError(err.response?.data?.message || "Unable to get employee");
  }
};

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    if (!id) {
      setError("Invalid Employee ID.");
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

      await employeeService.deleteEmployee(id);

      alert("Employee deleted successfully");

      await loadEmployees();
    } catch (err) {
      console.error("Delete Employee Error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          err.message ||
          "Delete failed"
      );
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
    });

    setIsEdit(false);
    setError("");
  };

  // =========================
  // DESIGNATION NAME
  // =========================
  const getDesignationName = (id) => {
    const designation = designations.find(
      (d) =>
        String(d.designationID ?? d.DesignationID ?? d.designationId) ===
        String(id)
    );

    if (!designation) {
      return id || "N/A";
    }

    return (
      designation.designationName ??
      designation.DesignationName ??
      designation.name ??
      "N/A"
    );
  };

  // =========================
  // SHIFT NAME
  // =========================
  const getShiftName = (id) => {
    const shift = shifts.find(
      (s) =>
        String(s.shiftID ?? s.ShiftID ?? s.shiftId) ===
        String(id)
    );

    if (!shift) {
      return id || "N/A";
    }

    return (
      shift.shiftName ??
      shift.ShiftName ??
      shift.name ??
      "N/A"
    );
  };

  return (
    <div className="plant-page-wrapper">

      {/* ERROR */}
      {error && (
        <div className="alert alert-danger mb-4">
          <strong>Error:</strong> {String(error)}
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
                  value={employee.employeeCode}
                  onChange={handleChange}
                  placeholder="Enter Employee Code"
                  required
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
                  value={employee.employeeName}
                  onChange={handleChange}
                  placeholder="Enter Employee Name"
                  required
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
                  value={employee.address}
                  onChange={handleChange}
                  placeholder="Enter Address"
                  rows="3"
                  required
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
                  value={employee.joiningDate}
                  onChange={handleChange}
                  required
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
                  value={employee.designationID}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select Designation
                  </option>

                  {designations.map((designation) => {
                    const id =
                      designation.designationID ??
                      designation.DesignationID ??
                      designation.designationId;

                    const name =
                      designation.designationName ??
                      designation.DesignationName ??
                      designation.name ??
                      designation.Name;

                    return (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* SHIFT */}
              <div className="mb-4">
                <label className="proto-label">
                  SHIFT *
                </label>

                <select
                  className="proto-input"
                  name="shiftID"
                  value={employee.shiftID}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select Shift
                  </option>

                  {shifts.map((shift) => {
                    const id =
                      shift.shiftID ??
                      shift.ShiftID ??
                      shift.shiftId;

                    const name =
                      shift.shiftName ??
                      shift.ShiftName ??
                      shift.name ??
                      shift.Name;

                    return (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* BUTTONS */}
              <div className="d-flex gap-2 pt-1">

                <button
                  type="submit"
                  className="btn-proto-save"
                >
                  {isEdit ? "Update" : "Save"}
                </button>

                <button
                  type="button"
                  className="btn-proto-cancel"
                  onClick={resetForm}
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
            style={{ maxWidth: "100%" }}
          >

            {loading ? (
              <div
                className="p-4 text-center text-muted"
                style={{ fontSize: "0.875rem" }}
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
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>

                  {employees.length > 0 ? (

                    employees.map((item) => {

                      const employeeId =
                        item.employeeID ??
                        item.EmployeeID;

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
                        item.DesignationID;

                      const shiftId =
                        item.shiftID ??
                        item.ShiftID;

                      return (
                        <tr key={employeeId}>

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
                              ? String(joiningDate).substring(0, 10)
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

                            <button
                              type="button"
                              className="btn btn-link btn-sm p-0 me-3 text-primary text-decoration-none"
                              style={{
                                fontSize: "0.85rem",
                                fontWeight: "500",
                              }}
                              onClick={() =>
                                handleEdit(employeeId)
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="btn btn-link btn-sm p-0 text-danger text-decoration-none"
                              style={{
                                fontSize: "0.85rem",
                                fontWeight: "500",
                              }}
                              onClick={() =>
                                handleDelete(employeeId)
                              }
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
                        colSpan="8"
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
    </div>
  );
}

export default Employee;