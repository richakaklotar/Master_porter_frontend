import React, { useEffect, useState } from "react";
import shiftService from "../services/shiftService";

function Shifts() {
  const [shifts, setShifts] = useState([]);

  const [shift, setShift] = useState({
    shiftID: 0,
    shiftName: "",
    startTime: "",
    endTime: "",
  });

  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Helper function to format C# TimeOnly string (HH:mm:ss) into standard HTML input format (HH:mm)
  const formatTimeForInput = (timeString) => {
    if (!timeString) return "";
    return String(timeString).substring(0, 5);
  };

  // Helper function to format HH:mm time string into 12-hour AM/PM string for display
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
      setError(
        err.response?.data?.message || err.message || "Unable to load shifts"
      );
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
    const { name, value } = e.target;
    setShift((prev) => ({
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

      const sId = Number(shift.shiftID || 0);

      // Append seconds (:00) if required for C# TimeOnly deserialization
      const formattedStartTime =
        shift.startTime.length === 5 ? `${shift.startTime}:00` : shift.startTime;
      const formattedEndTime =
        shift.endTime.length === 5 ? `${shift.endTime}:00` : shift.endTime;

      const requestData = {
        shiftID: sId,
        ShiftID: sId,
        shiftName: shift.shiftName.trim(),
        ShiftName: shift.shiftName.trim(),
        startTime: formattedStartTime,
        StartTime: formattedStartTime,
        endTime: formattedEndTime,
        EndTime: formattedEndTime,
      };

      if (isEdit) {
        await shiftService.updateShift(sId, requestData);
        alert("Shift updated successfully");
      } else {
        await shiftService.createShift(requestData);
        alert("Shift created successfully");
      }

      resetForm();
      await loadShifts();
    } catch (err) {
      console.error("Save Shift Error:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          err.message ||
          "Something went wrong"
      );
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

      setShift({
        shiftID: data.shiftID ?? data.ShiftID ?? 0,
        shiftName: data.shiftName ?? data.ShiftName ?? "",
        startTime: formatTimeForInput(data.startTime ?? data.StartTime),
        endTime: formatTimeForInput(data.endTime ?? data.EndTime),
      });
      setIsEdit(true);
    } catch (err) {
      console.error("Get Shift Error:", err);
      setError(
        err.response?.data?.message || err.message || "Unable to get shift"
      );
    }
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this shift?")) {
      return;
    }

    try {
      setError("");
      await shiftService.deleteShift(id);
      alert("Shift deleted successfully");
      await loadShifts();
    } catch (err) {
      console.error("Delete Shift Error:", err);
      setError(err.response?.data?.message || err.message || "Delete failed");
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
    });
    setIsEdit(false);
    setError("");
  };

  return (
    <div className="plant-page-wrapper">
      {error && (
        <div className="alert alert-danger mb-4">
          <strong>Error:</strong> {String(error)}
        </div>
      )}

      {/* Side-by-side flex container */}
      <div className="cards-side-by-side">
        {/* Left Form Card */}
        <div className="left-card-form">
          <div className="prototype-card">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="proto-label">SHIFT NAME *</label>
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

              <div className="mb-3">
                <label className="proto-label">START TIME</label>
                <input
                  type="time"
                  className="proto-input"
                  name="startTime"
                  value={shift.startTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="proto-label">END TIME</label>
                <input
                  type="time"
                  className="proto-input"
                  name="endTime"
                  value={shift.endTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="d-flex gap-2 pt-1">
                <button type="submit" className="btn-proto-save">
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

        {/* Right Table Card */}
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
                Loading shifts...
              </div>
            ) : (
              <table
                className="table-proto"
                style={{ width: "100%", tableLayout: "auto" }}
              >
                <thead>
                  <tr>
                    <th>SHIFT</th>
                    <th>START</th>
                    <th>END</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.length > 0 ? (
                    shifts.map((item) => {
                      const sId = item.shiftID ?? item.ShiftID;
                      const sName = item.shiftName ?? item.ShiftName;
                      const startTimeVal = item.startTime ?? item.StartTime;
                      const endTimeVal = item.endTime ?? item.EndTime;

                      return (
                        <tr key={sId}>
                          <td>{sName}</td>
                          <td>{formatTimeDisplay(startTimeVal)}</td>
                          <td>{formatTimeDisplay(endTimeVal)}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-link btn-sm p-0 me-3 text-primary text-decoration-none"
                              style={{ fontSize: "0.85rem", fontWeight: "500" }}
                              onClick={() => handleEdit(sId)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-link btn-sm p-0 text-danger text-decoration-none"
                              style={{ fontSize: "0.85rem", fontWeight: "500" }}
                              onClick={() => handleDelete(sId)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-5 text-muted">
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
    </div>
  );
}

export default Shifts;