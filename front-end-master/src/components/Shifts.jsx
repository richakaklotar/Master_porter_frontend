import React, { useEffect, useState } from "react";
import shiftService from "../services/shiftService";

function Shifts() {
  const [shifts, setShifts] = useState([]);

  const [shift, setShift] = useState({
    shiftID: 0,
    shiftName: "",
    startTime: "",
    endTime: "",
    status: "Active",
  });

  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // FORMAT TIME FOR INPUT
  // =========================
  const formatTimeForInput = (timeString) => {
    if (!timeString) return "";
    return String(timeString).substring(0, 5);
  };

  // =========================
  // FORMAT TIME FOR DISPLAY
  // =========================
  const formatTimeDisplay = (timeString) => {
    if (!timeString) return "-";

    const cleanTime = String(timeString).substring(0, 5);
    const [hoursStr, minutes] = cleanTime.split(":");

    let hours = parseInt(hoursStr, 10);

    if (isNaN(hours)) return timeString;

    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;

    return `${hours}:${minutes} ${ampm}`;
  };

  // =========================
  // GET ERROR MESSAGE
  // =========================
  const getErrorMessage = (err) => {
    if (err?.response?.data?.errors) {
      const errors = err.response.data.errors;

      return Object.values(errors)
        .flat()
        .join(" ");
    }

    return (
      err?.response?.data?.message ||
      err?.response?.data?.title ||
      err?.message ||
      "Something went wrong"
    );
  };

  // =========================
  // GET SHIFT ID
  // =========================
  const getShiftId = (item) => {
    return item.shiftID ?? item.ShiftID ?? 0;
  };

  // =========================
  // GET SHIFT NAME
  // =========================
  const getShiftName = (item) => {
    return item.shiftName ?? item.ShiftName ?? "";
  };

  // =========================
  // CHECK DUPLICATE SHIFT NAME
  // =========================
  const isDuplicateShiftName = (name) => {
    const normalizedName = name.trim().toLowerCase();
    const currentId = Number(shift.shiftID || 0);

    return shifts.some((item) => {
      const existingId = Number(getShiftId(item));
      const existingName = getShiftName(item)
        .trim()
        .toLowerCase();

      // While editing, don't compare with current record
      if (isEdit && existingId === currentId) {
        return false;
      }

      return existingName === normalizedName;
    });
  };

  // =========================
  // LOAD SHIFTS
  // =========================
  const loadShifts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await shiftService.getShifts();

      setShifts(response.data || []);
    } catch (err) {
      console.error("Load Shifts Error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShifts();
  }, []);

  // =========================
  // INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setShift((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
            ? "Active"
            : "Inactive"
          : value,
    }));

    // Clear duplicate error while typing
    if (name === "shiftName") {
      setError("");
    }
  };

  // =========================
  // CREATE / UPDATE
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const sId = Number(shift.shiftID || 0);
      const shiftName = shift.shiftName.trim();

      // =========================
      // VALIDATION
      // =========================

      if (!shiftName) {
        setError("Shift Name is required.");
        return;
      }

      if (!shift.startTime) {
        setError("Start Time is required.");
        return;
      }

      if (!shift.endTime) {
        setError("End Time is required.");
        return;
      }

      if (!shift.status) {
        setError("Status is required.");
        return;
      }

      // =========================
      // DUPLICATE SHIFT NAME
      // =========================

      if (isDuplicateShiftName(shiftName)) {
        setError(
          `Shift Name "${shiftName}" already exists. Please enter a different Shift Name.`
        );
        return;
      }

      // =========================
      // FORMAT TIME
      // =========================

      const formattedStartTime =
        shift.startTime.length === 5
          ? `${shift.startTime}:00`
          : shift.startTime;

      const formattedEndTime =
        shift.endTime.length === 5
          ? `${shift.endTime}:00`
          : shift.endTime;

      // =========================
      // REQUEST DATA
      // =========================

      const requestData = {
        shiftID: sId,
        ShiftID: sId,

        shiftName: shiftName,
        ShiftName: shiftName,

        startTime: formattedStartTime,
        StartTime: formattedStartTime,

        endTime: formattedEndTime,
        EndTime: formattedEndTime,

        status: shift.status,
        Status: shift.status,
      };

      console.log("Shift Request:", requestData);

      // =========================
      // UPDATE
      // =========================

      if (isEdit) {
        await shiftService.updateShift(sId, requestData);

        alert("Shift updated successfully");
      }

      // =========================
      // CREATE
      // =========================

      else {
        await shiftService.createShift(requestData);

        alert("Shift created successfully");
      }

      resetForm();

      await loadShifts();
    } catch (err) {
      console.error("Save Shift Error:", err);
      setError(getErrorMessage(err));
    }
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = async (id) => {
    try {
      setError("");

      const response = await shiftService.getShiftById(id);
      const data = response.data;

      const apiStatus = data.status ?? data.Status;

      let normalizedStatus = "Active";

      if (typeof apiStatus === "boolean") {
        normalizedStatus = apiStatus
          ? "Active"
          : "Inactive";
      } else if (
        String(apiStatus).toLowerCase() === "inactive"
      ) {
        normalizedStatus = "Inactive";
      } else if (
        String(apiStatus).toLowerCase() === "active"
      ) {
        normalizedStatus = "Active";
      }

      setShift({
        shiftID:
          data.shiftID ??
          data.ShiftID ??
          0,

        shiftName:
          data.shiftName ??
          data.ShiftName ??
          "",

        startTime: formatTimeForInput(
          data.startTime ??
          data.StartTime
        ),

        endTime: formatTimeForInput(
          data.endTime ??
          data.EndTime
        ),

        status: normalizedStatus,
      });

      setIsEdit(true);
    } catch (err) {
      console.error("Get Shift Error:", err);
      setError(getErrorMessage(err));
    }
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this shift?"
      )
    ) {
      return;
    }

    try {
      setError("");

      await shiftService.deleteShift(id);

      alert("Shift deleted successfully");

      await loadShifts();
    } catch (err) {
      console.error("Delete Shift Error:", err);
      setError(getErrorMessage(err));
    }
  };

  // =========================
  // RESET FORM
  // =========================
  const resetForm = () => {
    setShift({
      shiftID: 0,
      shiftName: "",
      startTime: "",
      endTime: "",
      status: "Active",
    });

    setIsEdit(false);
    setError("");
  };

  return (
    <div className="plant-page-wrapper">

      {/* =========================
          ERROR
      ========================= */}
      {error && (
        <div className="alert alert-danger mb-4">
          <strong>Error:</strong>{" "}
          {String(error)}
        </div>
      )}

      <div className="cards-side-by-side">

        {/* =========================
            LEFT FORM CARD
        ========================= */}
        <div className="left-card-form">
          <div className="prototype-card">

            <form onSubmit={handleSubmit}>

              {/* SHIFT NAME */}
              <div className="mb-3">
                <label className="proto-label">
                  SHIFT NAME *
                </label>

                <input
                  type="text"
                  className="proto-input"
                  name="shiftName"
                  value={shift.shiftName}
                  onChange={handleChange}
                  placeholder="Enter Shift Name"
                  required
                />
              </div>

              {/* START TIME */}
              <div className="mb-3">
                <label className="proto-label">
                  START TIME *
                </label>

                <input
                  type="time"
                  className="proto-input"
                  name="startTime"
                  value={shift.startTime}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* END TIME */}
              <div className="mb-3">
                <label className="proto-label">
                  END TIME *
                </label>

                <input
                  type="time"
                  className="proto-input"
                  name="endTime"
                  value={shift.endTime}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* STATUS */}
              <div className="mb-4 status-field">

                <label className="proto-label d-block mb-2">
                  STATUS
                </label>

                <div className="status-control">

                  <input
                    type="checkbox"
                    id="shiftStatus"
                    name="status"
                    checked={
                      shift.status === "Active"
                    }
                    onChange={handleChange}
                    className="status-checkbox"
                  />

                  <label
                    htmlFor="shiftStatus"
                    className="status-text"
                  >
                    {shift.status === "Active"
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
                >
                  {isEdit
                    ? "Update"
                    : "Save"}
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
            RIGHT TABLE CARD
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
                Loading shifts...
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
                    <th>SHIFT</th>
                    <th>START</th>
                    <th>END</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>

                  {shifts.length > 0 ? (

                    shifts.map((item) => {

                      const sId =
                        item.shiftID ??
                        item.ShiftID;

                      const sName =
                        item.shiftName ??
                        item.ShiftName;

                      const startTimeVal =
                        item.startTime ??
                        item.StartTime;

                      const endTimeVal =
                        item.endTime ??
                        item.EndTime;

                      const itemStatus =
                        item.status ??
                        item.Status;

                      const isActive =
                        typeof itemStatus ===
                        "boolean"
                          ? itemStatus
                          : String(
                              itemStatus
                            ).toLowerCase() ===
                            "active";

                      return (
                        <tr key={sId}>

                          {/* SHIFT */}
                          <td>
                            {sName}
                          </td>

                          {/* START */}
                          <td>
                            {formatTimeDisplay(
                              startTimeVal
                            )}
                          </td>

                          {/* END */}
                          <td>
                            {formatTimeDisplay(
                              endTimeVal
                            )}
                          </td>

                          {/* STATUS */}
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

                          {/* ACTION */}
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
                                  sId
                                )
                              }
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
                                  sId
                                )
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
                        colSpan="5"
                        className="text-center py-5 text-muted"
                      >
                        No shifts found
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
          CSS
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

export default Shifts;