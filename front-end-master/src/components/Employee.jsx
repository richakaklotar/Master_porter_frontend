import React, { useEffect, useState } from "react";
import employeeService from "../services/employeeService";
import designationService from "../services/designationService";
import shiftService from "../services/shiftService";

function Employee() {
  const [employees, setEmployees] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [shifts, setShifts] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [saveError, setSaveError] = useState("");

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

  const [isEdit, setIsEdit] = useState(false);
  const [saving, setSaving] = useState(false);

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
  // PARSE API ERROR
  // =====================================================
  const parseApiError = (err) => {
    console.error("API ERROR:", err);

    const apiData = err?.response?.data;

    if (apiData?.errors && typeof apiData.errors === "object") {
      const messages = Object.entries(apiData.errors)
        .flatMap(([field, fieldErrors]) => {
          if (Array.isArray(fieldErrors)) {
            return fieldErrors.map((message) => {
              const fieldName =
                field.charAt(0).toUpperCase() + field.slice(1);

              return `${fieldName}: ${message}`;
            });
          }

          return [`${field}: ${fieldErrors}`];
        })
        .filter(Boolean);

      if (messages.length > 0) {
        return messages.join("\n");
      }
    }

    if (apiData?.detail) return apiData.detail;
    if (apiData?.message) return apiData.message;
    if (apiData?.error) return apiData.error;
    if (apiData?.title) return apiData.title;

    if (typeof apiData === "string") {
      return apiData;
    }

    return err?.message || "An unexpected error occurred.";
  };

  // =====================================================
  // SHOW SAVE ERROR
  // =====================================================
  const showSaveError = (message) => {
    setSaveError(
      String(message || "An unexpected error occurred.")
    );

    setShowErrorPopup(true);
  };

  // =====================================================
  // LOAD EMPLOYEES
  // =====================================================
  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError("");

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
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD DESIGNATIONS
  // =====================================================
  const loadDesignations = async () => {
    try {
      const response =
        await designationService.getDesignations();

      console.log("Designations:", response.data);

      const data = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      setDesignations(data);
    } catch (err) {
      console.error("Load Designation Error:", err);
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
    const employeeCode =
      employee.employeeCode.trim();

    const employeeName =
      employee.employeeName.trim();

    if (!employeeCode) {
      showSaveError("Employee Code is required.");
      return false;
    }

    if (!employeeName) {
      showSaveError("Employee Name is required.");
      return false;
    }

    if (!employee.phone.trim()) {
      showSaveError("Phone is required.");
      return false;
    }

    if (!/^\d{10}$/.test(employee.phone.trim())) {
      showSaveError(
        "Phone must contain exactly 10 digits."
      );
      return false;
    }

    if (!employee.email.trim()) {
      showSaveError("Email is required.");
      return false;
    }

    if (!employee.address.trim()) {
      showSaveError("Address is required.");
      return false;
    }

    if (!employee.joiningDate) {
      showSaveError("Joining Date is required.");
      return false;
    }

    if (
      !employee.designationID ||
      Number(employee.designationID) <= 0
    ) {
      showSaveError(
        "Please select a valid Designation."
      );
      return false;
    }

    if (
      !employee.shiftID ||
      Number(employee.shiftID) <= 0
    ) {
      showSaveError(
        "Please select a valid Shift."
      );
      return false;
    }

    if (!employee.status) {
      showSaveError("Status is required.");
      return false;
    }

    if (isDuplicateEmployeeCode(employeeCode)) {
      showSaveError(
        `Employee Code "${employeeCode}" already exists. Please enter a different Employee Code.`
      );
      return false;
    }

    if (isDuplicateEmployeeName(employeeName)) {
      showSaveError(
        `Employee Name "${employeeName}" already exists. Please enter a different Employee Name.`
      );
      return false;
    }

    return true;
  };

  // =====================================================
  // CREATE / UPDATE
  // =====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!validateEmployee()) {
      return;
    }

    try {
      setSaving(true);

      const employeeId =
        Number(employee.employeeID || 0);

      const requestData = {
        employeeID: employeeId,

        employeeCode:
          employee.employeeCode.trim(),

        employeeName:
          employee.employeeName.trim(),

        phone:
          employee.phone.trim(),

        email:
          employee.email.trim(),

        address:
          employee.address.trim(),

        joiningDate:
          employee.joiningDate,

        designationID:
          parseInt(
            employee.designationID,
            10
          ),

        shiftID:
          parseInt(
            employee.shiftID,
            10
          ),

        status:
          employee.status || "Active",

        Status:
          employee.status || "Active",
      };

      console.log(
        "EMPLOYEE REQUEST:",
        requestData
      );

      // UPDATE
      if (isEdit) {
        if (!employeeId || employeeId <= 0) {
          showSaveError(
            "Invalid Employee ID."
          );
          return;
        }

        await employeeService.updateEmployee(
          employeeId,
          requestData
        );

        alert(
          "Employee updated successfully."
        );
      }

      // CREATE
      else {
        await employeeService.createEmployee(
          requestData
        );

        alert(
          "Employee created successfully."
        );
      }

      resetForm();
      setShowForm(false);

      await loadEmployees();

    } catch (err) {
      console.error(
        "Save Employee Error:",
        err
      );

      showSaveError(
        parseApiError(err)
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // EDIT EMPLOYEE
  // =====================================================
  const handleEdit = async (id) => {
    if (!id || Number(id) <= 0) {
      setError("Invalid Employee ID.");
      return;
    }

    try {
      setError("");
      setSaving(true);

      const response =
        await employeeService.getEmployeeById(
          Number(id)
        );

      const data = response?.data;

      console.log(
        "EDIT EMPLOYEE DATA:",
        data
      );

      const rawDate =
        getEntityProperty(
          data,
          "joiningDate"
        );

      let formattedDate = "";

      if (rawDate) {
        formattedDate =
          String(rawDate).substring(
            0,
            10
          );
      }

      setEmployee({
        employeeID:
          extractEmployeeId(data),

        employeeCode:
          getEntityProperty(
            data,
            "employeeCode"
          ) ?? "",

        employeeName:
          getEntityProperty(
            data,
            "employeeName"
          ) ?? "",

        phone:
          getEntityProperty(
            data,
            "phone"
          ) ?? "",

        email:
          getEntityProperty(
            data,
            "email"
          ) ?? "",

        address:
          getEntityProperty(
            data,
            "address"
          ) ?? "",

        joiningDate:
          formattedDate,

        designationID:
          String(
            getEntityProperty(
              data,
              "designationID"
            ) ?? ""
          ),

        shiftID:
          String(
            getEntityProperty(
              data,
              "shiftID"
            ) ?? ""
          ),

        status:
          extractStatus(data),
      });

      setIsEdit(true);
      setShowForm(true);

    } catch (err) {
      console.error(
        "Get Employee Error:",
        err
      );

      setError(
        parseApiError(err)
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE EMPLOYEE
  // =====================================================
  const handleDelete = async (id) => {
    if (!id || Number(id) <= 0) {
      setError("Invalid Employee ID.");
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this employee?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setLoading(true);

      await employeeService.deleteEmployee(
        Number(id)
      );

      alert(
        "Employee deleted successfully."
      );

      await loadEmployees();

    } catch (err) {
      console.error(
        "Delete Employee Error:",
        err
      );

      setError(
        parseApiError(err)
      );

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
    setError("");
  };

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
    const designation =
      designations.find(
        (d) =>
          Number(
            getEntityProperty(
              d,
              "designationID"
            )
          ) === Number(id)
      );

    if (!designation) {
      return id || "-";
    }

    return (
      getEntityProperty(
        designation,
        "designationName"
      ) || "-"
    );
  };

  // =====================================================
  // SHIFT NAME
  // =====================================================
  const getShiftName = (id) => {
    const shift =
      shifts.find(
        (s) =>
          Number(
            getEntityProperty(
              s,
              "shiftID"
            )
          ) === Number(id)
      );

    if (!shift) {
      return id || "-";
    }

    return (
      getEntityProperty(
        shift,
        "shiftName"
      ) || "-"
    );
  };

  // =====================================================
  // UI
  // =====================================================
  return (
    <div className="employee-page-wrapper">

      {/* ERROR ALERT */}
      {error && (
        <div className="alert-box error">

          <span>
            {String(error)}
          </span>

          <button
            type="button"
            className="error-close"
            onClick={() => setError("")}
          >
            ×
          </button>

        </div>
      )}

      {/* =====================================================
          TABLE CARD
      ===================================================== */}
      <div className="employee-table-card">

        {/* HEADER */}
        <div className="table-card-header">

          <button
            type="button"
            className="add-employee-btn"
            onClick={handleAdd}
            disabled={saving}
          >
            <span className="add-icon">
              +
            </span>

            Add Employee
          </button>

        </div>

        {/* TABLE */}
        <div className="table-container">

          {loading ? (

            <div className="loading-box">
              Loading employees...
            </div>

          ) : (

            <table className="employee-table">

              <thead>

                <tr>
                  <th>CODE</th>
                  <th>EMPLOYEE</th>
                  <th>PHONE</th>
                  <th>EMAIL</th>
                  <th>ADDRESS</th>
                  <th>JOINING DATE</th>
                  <th>DESIGNATION</th>
                  <th>SHIFT</th>
                  <th>STATUS</th>
                  <th className="action-header">
                    ACTION
                  </th>
                </tr>

              </thead>

              <tbody>

                {employees.length > 0 ? (

                  employees.map((item) => {

                    const employeeId =
                      extractEmployeeId(item);

                    const employeeCode =
                      getEntityProperty(
                        item,
                        "employeeCode"
                      ) || "-";

                    const employeeName =
                      getEntityProperty(
                        item,
                        "employeeName"
                      ) || "-";

                    const phone =
                      getEntityProperty(
                        item,
                        "phone"
                      ) || "-";

                    const email =
                      getEntityProperty(
                        item,
                        "email"
                      ) || "-";

                    const address =
                      getEntityProperty(
                        item,
                        "address"
                      ) || "-";

                    const joiningDate =
                      getEntityProperty(
                        item,
                        "joiningDate"
                      );

                    const designationID =
                      getEntityProperty(
                        item,
                        "designationID"
                      );

                    const shiftID =
                      getEntityProperty(
                        item,
                        "shiftID"
                      );

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

                        <td className="font-semibold">
                          {employeeName}
                        </td>

                        <td>
                          {phone}
                        </td>

                        <td
                          className="email-cell"
                          title={email}
                        >
                          {email}
                        </td>

                        <td
                          className="address-cell"
                          title={address}
                        >
                          {address}
                        </td>

                        <td>
                          {joiningDate
                            ? String(
                                joiningDate
                              ).substring(
                                0,
                                10
                              )
                            : "-"}
                        </td>

                        <td>
                          {getDesignationName(
                            designationID
                          )}
                        </td>

                        <td>
                          {getShiftName(
                            shiftID
                          )}
                        </td>

                        <td>

                          <span
                            className={
                              isActive
                                ? "badge-active"
                                : "badge-inactive"
                            }
                          >
                            {isActive
                              ? "Active"
                              : "Inactive"}
                          </span>

                        </td>

                        {/* =================================================
                            EDIT + DELETE BUTTONS
                        ================================================= */}
                        <td className="action-cell">

                          <button
                            type="button"
                            className="btn-edit"
                            onClick={() =>
                              handleEdit(
                                employeeId
                              )
                            }
                            disabled={saving}
                            title="Edit Employee"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="btn-delete"
                            onClick={() =>
                              handleDelete(
                                employeeId
                              )
                            }
                            disabled={saving}
                            title="Delete Employee"
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
                      colSpan="10"
                      className="no-data"
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

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}
      {showForm && (

        <div
          className="employee-modal-overlay"
          onMouseDown={(e) => {

            if (
              e.target ===
                e.currentTarget &&
              !saving
            ) {
              closeForm();
            }

          }}
        >

          <div className="employee-modal">

            {/* HEADER */}
            <div className="modal-header-custom">

              <h5>
                {isEdit
                  ? "Edit Employee"
                  : "Add Employee"}
              </h5>

              <button
                type="button"
                className="close-modal-btn"
                onClick={closeForm}
                disabled={saving}
              >
                ×
              </button>

            </div>

            {/* BODY */}
            <div className="modal-body-custom">

              <form onSubmit={handleSubmit}>

                {/* CODE + NAME */}
                <div className="form-row">

                  <div className="form-group">

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

                  <div className="form-group">

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

                </div>

                {/* PHONE + EMAIL */}
                <div className="form-row">

                  <div className="form-group">

                    <label className="proto-label">
                      PHONE *
                    </label>

                    <input
                      type="text"
                      className="proto-input"
                      name="phone"
                      value={
                        employee.phone
                      }
                      onChange={(e) => {

                        const value =
                          e.target.value.replace(
                            /\D/g,
                            ""
                          );

                        setEmployee(
                          (prev) => ({
                            ...prev,
                            phone:
                              value.substring(
                                0,
                                10
                              ),
                          })
                        );

                        setError("");
                      }}
                      placeholder="Enter Phone"
                      maxLength="10"
                      required
                      disabled={saving}
                    />

                  </div>

                  <div className="form-group">

                    <label className="proto-label">
                      EMAIL *
                    </label>

                    <input
                      type="email"
                      className="proto-input"
                      name="email"
                      value={
                        employee.email
                      }
                      onChange={handleChange}
                      placeholder="Enter Email"
                      required
                      disabled={saving}
                    />

                  </div>

                </div>

                {/* ADDRESS */}
                <div className="form-group">

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
                    rows="2"
                    required
                    disabled={saving}
                  />

                </div>

                {/* JOINING DATE */}
                <div className="form-group">

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

                {/* DESIGNATION + SHIFT */}
                <div className="form-row">

                  <div className="form-group">

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
                            getEntityProperty(
                              designation,
                              "designationID"
                            );

                          const name =
                            getEntityProperty(
                              designation,
                              "designationName"
                            ) || "-";

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

                  <div className="form-group">

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

                      {shifts.map((shift) => {

                        const id =
                          getEntityProperty(
                            shift,
                            "shiftID"
                          );

                        const name =
                          getEntityProperty(
                            shift,
                            "shiftName"
                          ) || "-";

                        return (
                          <option
                            key={id}
                            value={id}
                          >
                            {name}
                          </option>
                        );
                      })}

                    </select>

                  </div>

                </div>

                {/* STATUS */}
                <div className="status-checkbox-row">

                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="employeeStatus"
                    name="status"
                    checked={
                      employee.status ===
                      "Active"
                    }
                    onChange={handleChange}
                    disabled={saving}
                  />

                  <label
                    className="form-check-label"
                    htmlFor="employeeStatus"
                  >
                    Active
                  </label>

                </div>

                {/* BUTTONS */}
                <div className="modal-buttons">

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
                    onClick={closeForm}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          ERROR POPUP
      ===================================================== */}
      {showErrorPopup && (

        <div
          className="save-error-overlay"
          onMouseDown={(e) => {

            if (
              e.target ===
              e.currentTarget
            ) {
              setShowErrorPopup(false);
            }

          }}
        >

          <div className="save-error-popup">

            <div className="save-error-header">

              <div className="error-icon-circle">
                !
              </div>

              <h5>
                {isEdit
                  ? "Update Failed"
                  : "Save Failed"}
              </h5>

              <button
                type="button"
                className="save-error-close"
                onClick={() =>
                  setShowErrorPopup(false)
                }
              >
                ×
              </button>

            </div>

            <div className="save-error-body">

              <p>
                {String(saveError)
                  .split("\n")
                  .map(
                    (
                      message,
                      index
                    ) => (
                      <React.Fragment
                        key={index}
                      >
                        {message}

                        {index <
                          String(
                            saveError
                          ).split(
                            "\n"
                          ).length -
                            1 && (
                          <br />
                        )}
                      </React.Fragment>
                    )
                  )}
              </p>

            </div>

            <div className="save-error-footer">

              <button
                type="button"
                className="error-ok-btn"
                onClick={() =>
                  setShowErrorPopup(false)
                }
              >
                OK
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          STYLES
      ===================================================== */}
      <style>{`

        /* =====================================================
           GLOBAL SCROLLBAR FIX
        ===================================================== */

        html,
        body,
        #root {
          width: 100%;
          max-width: 100%;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }

        * {
          box-sizing: border-box;
        }

        /* =====================================================
           PAGE
        ===================================================== */

        .employee-page-wrapper {
          width: 100%;
          max-width: 100%;
          padding: 20px;
          overflow-x: hidden;
        }

        /* =====================================================
           ERROR
        ===================================================== */

        .alert-box.error {
          width: 100%;

          background-color: #fde8e8;

          border: 1px solid #f8b4b4;

          color: #9b1c1c;

          padding: 10px 14px;

          border-radius: 8px;

          margin-bottom: 14px;

          font-size: 0.85rem;

          display: flex;

          justify-content: space-between;

          align-items: center;
        }

        .error-close {
          border: none;

          background: transparent;

          color: #9b1c1c;

          font-size: 20px;

          cursor: pointer;

          line-height: 1;
        }

        /* =====================================================
           TABLE CARD
        ===================================================== */

        .employee-table-card {
          width: 100%;
          max-width: 100%;

          background: #ffffff;

          border-radius: 12px;

          border: 1px solid #eaecf0;

          box-shadow:
            0 1px 3px
            rgba(16, 24, 40, 0.08);

          overflow: hidden;
        }

        .table-card-header {
          width: 100%;

          display: flex;

          justify-content: flex-end;

          align-items: center;

          padding: 14px 18px;

          border-bottom:
            1px solid #f2f4f7;
        }

        /* =====================================================
           ADD BUTTON
        ===================================================== */

        .add-employee-btn {
          background: #0066ff;

          color: #ffffff;

          border: none;

          padding: 8px 14px;

          border-radius: 8px;

          font-size: 0.82rem;

          font-weight: 500;

          display: inline-flex;

          align-items: center;

          gap: 7px;

          cursor: pointer;
        }

        .add-employee-btn:hover {
          background: #0052cc;
        }

        .add-employee-btn:disabled {
          opacity: 0.6;

          cursor: not-allowed;
        }

        .add-icon {
          font-size: 17px;

          line-height: 1;
        }

        /* =====================================================
           TABLE
        ===================================================== */

        .table-container {
          width: 100%;
          max-width: 100%;

          overflow: hidden;
        }

        .employee-table {
          width: 100%;
          max-width: 100%;

          border-collapse: collapse;

          table-layout: fixed;

          font-size: 0.76rem;

          text-align: left;
        }

        .employee-table th {
          background: #f9fafb;

          color: #475467;

          font-weight: 600;

          padding: 10px 6px;

          border-bottom:
            1px solid #eaecf0;

          white-space: nowrap;

          text-transform: uppercase;

          font-size: 0.65rem;

          letter-spacing: 0.02em;
        }

        .employee-table td {
          padding: 10px 6px;

          border-bottom:
            1px solid #f2f4f7;

          color: #344054;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

          vertical-align: middle;
        }

        .employee-table tbody tr:hover {
          background: #f9fafb;
        }

        /* =====================================================
           COLUMN WIDTHS
        ===================================================== */

        .employee-table th:nth-child(1),
        .employee-table td:nth-child(1) {
          width: 7%;
        }

        .employee-table th:nth-child(2),
        .employee-table td:nth-child(2) {
          width: 10%;
        }

        .employee-table th:nth-child(3),
        .employee-table td:nth-child(3) {
          width: 8%;
        }

        .employee-table th:nth-child(4),
        .employee-table td:nth-child(4) {
          width: 12%;
        }

        .employee-table th:nth-child(5),
        .employee-table td:nth-child(5) {
          width: 13%;
        }

        .employee-table th:nth-child(6),
        .employee-table td:nth-child(6) {
          width: 9%;
        }

        .employee-table th:nth-child(7),
        .employee-table td:nth-child(7) {
          width: 10%;
        }

        .employee-table th:nth-child(8),
        .employee-table td:nth-child(8) {
          width: 8%;
        }

        .employee-table th:nth-child(9),
        .employee-table td:nth-child(9) {
          width: 8%;
        }

        .employee-table th:nth-child(10),
        .employee-table td:nth-child(10) {
          width: 15%;
        }

        .font-semibold {
          font-weight: 600;

          color: #101828;
        }

        .email-cell,
        .address-cell {
          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;
        }

        /* =====================================================
           STATUS BADGES
        ===================================================== */

        .badge-active {
          display: inline-block;

          background: #ecfdf3;

          color: #027a48;

          padding: 3px 7px;

          border-radius: 12px;

          font-size: 0.66rem;

          font-weight: 500;
        }

        .badge-inactive {
          display: inline-block;

          background: #fef3f2;

          color: #b42318;

          padding: 3px 7px;

          border-radius: 12px;

          font-size: 0.66rem;

          font-weight: 500;
        }

        /* =====================================================
           ACTION HEADER
        ===================================================== */

        .action-header {
          text-align: center !important;
        }

        /* =====================================================
           EDIT / DELETE BUTTONS
        ===================================================== */

        .action-cell {
          text-align: center !important;

          white-space: nowrap !important;

          overflow: visible !important;

          padding-left: 4px !important;

          padding-right: 4px !important;
        }

        .btn-edit,
        .btn-delete {
          border: none;

          padding: 5px 8px;

          border-radius: 6px;

          font-size: 0.68rem;

          font-weight: 600;

          cursor: pointer;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 4px;

          margin: 0 2px;

          white-space: nowrap;

          transition:
            background 0.2s ease,
            transform 0.1s ease;
        }

        .btn-edit {
          color: #0066ff;
          margin-left: 160px;
          background: #eff8ff;
        }

        .btn-edit:hover {
          background: #d1e9ff;

          transform: translateY(-1px);
        }

        .btn-delete {
          color: #d92d20;

          background: #fef3f2;
        }

        .btn-delete:hover {
          background: #fee4e2;

          transform: translateY(-1px);
        }

        .btn-edit:disabled,
        .btn-delete:disabled {
          opacity: 0.6;

          cursor: not-allowed;

          transform: none;
        }

        .button-icon {
          font-size: 12px;

          line-height: 1;
        }

        /* =====================================================
           LOADING
        ===================================================== */

        .loading-box,
        .no-data {
          text-align: center;

          padding: 28px;

          color: #667085;
        }

        /* =====================================================
           MODAL OVERLAY
        ===================================================== */

        .employee-modal-overlay {
          position: fixed;

          inset: 0;

          width: 100vw;

          height: 100vh;

          background:
            rgba(16, 24, 40, 0.5);

          backdrop-filter: blur(2px);

          display: flex;

          justify-content: center;

          align-items: center;

          z-index: 1000;

          padding: 15px;

          overflow: hidden;
        }

        /* =====================================================
           MODAL
        ===================================================== */

        .employee-modal {
          background: #ffffff;

          border-radius: 12px;

          width: 100%;

          max-width: 580px;

          max-height:
            calc(100vh - 30px);

          box-shadow:
            0 20px 24px -4px
            rgba(16, 24, 40, 0.1);

          overflow: hidden;

          display: flex;

          flex-direction: column;
        }

        /* =====================================================
           MODAL HEADER
        ===================================================== */

        .modal-header-custom {
          display: flex;

          justify-content: space-between;

          align-items: center;

          padding: 13px 20px;

          border-bottom:
            1px solid #eaecf0;

          flex-shrink: 0;
        }

        .modal-header-custom h5 {
          margin: 0;

          font-size: 1rem;

          font-weight: 600;

          color: #101828;
        }

        .close-modal-btn {
          background: transparent;

          border: none;

          font-size: 1.4rem;

          color: #667085;

          cursor: pointer;

          width: 30px;

          height: 30px;

          border-radius: 6px;
        }

        .close-modal-btn:hover {
          background: #f2f4f7;
        }

        /* =====================================================
           MODAL BODY
        ===================================================== */

        .modal-body-custom {
          padding: 16px 20px;

          overflow: hidden;

          flex: 1;
        }

        /* =====================================================
           FORM
        ===================================================== */

        .form-group {
          margin-bottom: 11px;

          display: flex;

          flex-direction: column;

          gap: 4px;
        }

        .form-row {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 12px;
        }

        .proto-label {
          font-size: 0.7rem;

          font-weight: 600;

          color: #344054;

          letter-spacing: 0.02em;
        }

        .proto-input {
          width: 100%;

          padding: 8px 10px;

          border:
            1px solid #d0d5dd;

          border-radius: 7px;

          font-size: 0.8rem;

          outline: none;

          background: #ffffff;

          color: #101828;

          transition:
            border-color 0.2s,
            box-shadow 0.2s;

          font-family: inherit;
        }

        .proto-input:focus {
          border-color: #0066ff;

          box-shadow:
            0 0 0 3px
            rgba(0, 102, 255, 0.1);
        }

        .proto-input:disabled {
          background: #f2f4f7;

          color: #98a2b3;

          cursor: not-allowed;
        }

        textarea.proto-input {
          resize: none;

          min-height: 55px;
        }

        /* =====================================================
           STATUS CHECKBOX
        ===================================================== */

        .status-checkbox-row {
          display: flex;

          align-items: center;

          gap: 7px;

          margin-top: 3px;

          margin-bottom: 5px;
        }

        .status-checkbox-row
          .form-check-input {
          width: 16px;

          height: 16px;

          margin: 0;

          cursor: pointer;
        }

        .status-checkbox-row
          .form-check-label {
          font-size: 0.8rem;

          color: #475569;

          cursor: pointer;
        }

        /* =====================================================
           MODAL BUTTONS
        ===================================================== */

        .modal-buttons {
          display: flex;

          justify-content: flex-end;

          gap: 10px;

          margin-top: 15px;
        }

        .btn-proto-save {
          background: #0066ff;

          color: white;

          border: none;

          padding: 8px 17px;

          border-radius: 7px;

          font-size: 0.8rem;

          font-weight: 500;

          cursor: pointer;
        }

        .btn-proto-save:hover {
          background: #0052cc;
        }

        .btn-proto-save:disabled {
          opacity: 0.6;

          cursor: not-allowed;
        }

        .btn-proto-cancel {
          background: white;

          border:
            1px solid #d0d5dd;

          color: #344054;

          padding: 8px 17px;

          border-radius: 7px;

          font-size: 0.8rem;

          font-weight: 500;

          cursor: pointer;
        }

        .btn-proto-cancel:hover {
          background: #f9fafb;
        }

        .btn-proto-cancel:disabled {
          opacity: 0.6;

          cursor: not-allowed;
        }

        /* =====================================================
           ERROR POPUP
        ===================================================== */

        .save-error-overlay {
          position: fixed;

          inset: 0;

          width: 100vw;

          height: 100vh;

          background:
            rgba(16, 24, 40, 0.55);

          backdrop-filter: blur(3px);

          display: flex;

          justify-content: center;

          align-items: center;

          z-index: 2000;

          padding: 20px;

          overflow: hidden;
        }

        .save-error-popup {
          width: 100%;

          max-width: 430px;

          background: #ffffff;

          border-radius: 14px;

          box-shadow:
            0 20px 40px
            rgba(16, 24, 40, 0.2);

          overflow: hidden;

          animation:
            errorPopupIn
            0.2s ease-out;
        }

        @keyframes errorPopupIn {

          from {
            opacity: 0;

            transform:
              scale(0.95)
              translateY(-10px);
          }

          to {
            opacity: 1;

            transform:
              scale(1)
              translateY(0);
          }

        }

        .save-error-header {
          display: flex;

          align-items: center;

          gap: 12px;

          padding: 18px 20px;

          border-bottom:
            1px solid #eaecf0;
        }

        .error-icon-circle {
          width: 34px;

          height: 34px;

          min-width: 34px;

          border-radius: 50%;

          background: #fef3f2;

          color: #d92d20;

          border:
            1px solid #fecdca;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 18px;

          font-weight: 700;
        }

        .save-error-header h5 {
          flex: 1;

          margin: 0;

          font-size: 1rem;

          font-weight: 600;

          color: #101828;
        }

        .save-error-close {
          width: 30px;

          height: 30px;

          border: none;

          background: transparent;

          color: #667085;

          font-size: 22px;

          line-height: 1;

          cursor: pointer;

          border-radius: 6px;
        }

        .save-error-close:hover {
          background: #f2f4f7;
        }

        .save-error-body {
          padding: 20px;
        }

        .save-error-body p {
          margin: 0;

          color: #475467;

          font-size: 0.875rem;

          line-height: 1.6;
        }

        .save-error-footer {
          display: flex;

          justify-content: flex-end;

          padding: 14px 20px;

          background: #f9fafb;

          border-top:
            1px solid #eaecf0;
        }

        .error-ok-btn {
          background: #0066ff;

          color: #ffffff;

          border: none;

          padding: 8px 22px;

          border-radius: 7px;

          font-size: 0.875rem;

          font-weight: 500;

          cursor: pointer;
        }

        .error-ok-btn:hover {
          background: #0052cc;
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 1100px) {

          .employee-table {
            font-size: 0.7rem;
          }

          .employee-table th {
            font-size: 0.58rem;

            padding: 8px 4px;
          }

          .employee-table td {
            padding: 8px 4px;
          }

          .btn-edit,
          .btn-delete {
            padding: 9px 5px;
            font-size: 0.6rem;
            gap: 2px;
            margin: 0 1px;
          }

          .button-icon {
            font-size: 10px;
          }
        }

        @media (max-width: 800px) {

          .employee-page-wrapper {
            padding: 12px;
          }

          .employee-table {
            font-size: 0.65rem;
          }

          .employee-table th {
            font-size: 0.54rem;
          }

          .employee-table td {
            padding: 7px 3px;
          }

          .btn-edit,
          .btn-delete {
            padding: 3px 4px;

            font-size: 0.55rem;
          }

        }

        @media (max-width: 700px) {

          .employee-page-wrapper {
            padding: 10px;
          }

          .employee-modal-overlay {
            padding: 10px;
          }

          .employee-modal {
            max-width: 100%;

            max-height:
              calc(100vh - 20px);
          }

          .modal-body-custom {
            padding: 14px;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .modal-buttons {
            flex-direction: row;
          }

          .btn-proto-save,
          .btn-proto-cancel {
            flex: 1;
          }

          .save-error-overlay {
            padding: 12px;
          }

          .save-error-popup {
            max-width: 100%;
          }

        }

      `}</style>

    </div>
  );
}

export default Employee;