import React, { useEffect, useState } from "react";
import activityService from "../services/activityService";
import componentService from "../services/componentsService";

function Activities() {
  const [activities, setActivities] = useState([]);
  const [components, setComponents] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [activity, setActivity] = useState({
    activitiesID: 0,
    activitiesName: "",
    type: "Cycle Time",
    componentID: "",
    status: "Active",
  });

  const [isEdit, setIsEdit] = useState(false);

  // =====================================================
  // ERROR MESSAGE
  // =====================================================
  const getErrorMessage = (err, fallback = "Something went wrong") => {
    console.error("API Error:", err);

    const data = err?.response?.data;

    if (data?.errors) {
      return Object.values(data.errors).flat().join(" | ");
    }

    return data?.message || data?.title || err?.message || fallback;
  };

  // =====================================================
  // LOAD ACTIVITIES
  // =====================================================
  const loadActivities = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await activityService.getActivities();
      setActivities(response.data || []);
    } catch (err) {
      setError(
        getErrorMessage(err, "Unable to load activities")
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD COMPONENTS
  // =====================================================
  const loadComponents = async () => {
    try {
      const response = await componentService.getComponents();
      setComponents(response.data || []);
    } catch (err) {
      setError(
        getErrorMessage(err, "Unable to load components")
      );
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================
  useEffect(() => {
    loadActivities();
    loadComponents();
  }, []);

  // =====================================================
  // INPUT CHANGE
  // =====================================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setActivity((previous) => ({
      ...previous,
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
  // GET ACTIVITY ID
  // =====================================================
  const getActivityId = (item) => {
    return item.activitiesID ?? item.ActivitiesID ?? 0;
  };

  // =====================================================
  // GET ACTIVITY NAME
  // =====================================================
  const getActivityName = (item) => {
    return item.activitiesName ?? item.ActivitiesName ?? "";
  };

  // =====================================================
  // GET COMPONENT ID
  // =====================================================
  const getComponentId = (item) => {
    return item.componentID ?? item.ComponentID ?? "";
  };

  // =====================================================
  // GET COMPONENT NAME
  // =====================================================
  const getComponentName = (item) => {
    return (
      item.componentName ??
      item.ComponentName ??
      item.name ??
      item.Name ??
      ""
    );
  };

  // =====================================================
  // GET TYPE
  // =====================================================
  const getActivityType = (item) => {
    return item.type ?? item.Type ?? "";
  };

  // =====================================================
  // GET STATUS
  // =====================================================
  const getActivityStatus = (item) => {
    const status = item.status ?? item.Status;

    if (typeof status === "string") {
      return status.toLowerCase() === "active";
    }

    if (typeof status === "boolean") {
      return status;
    }

    return true;
  };

  // =====================================================
  // DUPLICATE ACTIVITY NAME
  // =====================================================
  const isDuplicateActivityName = () => {
    const enteredName = activity.activitiesName
      .trim()
      .toLowerCase();

    return activities.some((item) => {
      const existingName = getActivityName(item)
        .trim()
        .toLowerCase();

      const existingId = getActivityId(item);

      if (
        isEdit &&
        Number(existingId) === Number(activity.activitiesID)
      ) {
        return false;
      }

      return (
        existingName !== "" &&
        existingName === enteredName
      );
    });
  };

  // =====================================================
  // CREATE / UPDATE
  // =====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!activity.activitiesName.trim()) {
      setError("Activity Name is required");
      return;
    }

    if (!activity.componentID) {
      setError("Component is required");
      return;
    }

    if (!activity.type) {
      setError("Activity Type is required");
      return;
    }

    if (!activity.status) {
      setError("Status is required");
      return;
    }

    if (isDuplicateActivityName()) {
      setError(
        `Activity Name "${activity.activitiesName.trim()}" already exists.`
      );
      return;
    }

    try {
      setError("");

      const activityId = Number(activity.activitiesID || 0);
      const componentId = Number(activity.componentID);

      const requestData = {
        activitiesID: activityId,
        activitiesName: activity.activitiesName.trim(),
        type: activity.type,
        componentID: componentId,
        status:
          activity.status === "Active"
            ? "Active"
            : "Inactive",
      };

      if (isEdit) {
        await activityService.updateActivity(
          activityId,
          requestData
        );

        alert("Activity updated successfully");
      } else {
        await activityService.createActivity(requestData);

        alert("Activity created successfully");
      }

      resetForm();
      await loadActivities();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Something went wrong while saving activity"
        )
      );
    }
  };

  // =====================================================
  // EDIT
  // =====================================================
  const handleEdit = async (id) => {
    try {
      setError("");

      const response =
        await activityService.getActivityById(id);

      const data = response.data;

      let status =
        data.status ??
        data.Status ??
        "Active";

      if (typeof status === "boolean") {
        status = status ? "Active" : "Inactive";
      }

      setActivity({
        activitiesID:
          data.activitiesID ??
          data.ActivitiesID ??
          0,

        activitiesName:
          data.activitiesName ??
          data.ActivitiesName ??
          "",

        type:
          data.type ??
          data.Type ??
          "Cycle Time",

        componentID:
          data.componentID ??
          data.ComponentID ??
          "",

        status:
          String(status).toLowerCase() === "inactive"
            ? "Inactive"
            : "Active",
      });

      setIsEdit(true);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to get activity details"
        )
      );
    }
  };

  // =====================================================
  // DELETE
  // =====================================================
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this activity?"
      )
    ) {
      return;
    }

    try {
      setError("");

      await activityService.deleteActivity(id);

      alert("Activity deleted successfully");

      await loadActivities();
    } catch (err) {
      setError(
        getErrorMessage(err, "Delete failed")
      );
    }
  };

  // =====================================================
  // RESET
  // =====================================================
  const resetForm = () => {
    setActivity({
      activitiesID: 0,
      activitiesName: "",
      type: "Cycle Time",
      componentID: "",
      status: "Active",
    });

    setIsEdit(false);
    setError("");
  };

  // =====================================================
  // TYPE CHECK
  // =====================================================
  const isTypeMatched = (actualType, target) => {
    if (!actualType) {
      return false;
    }

    return String(actualType)
      .toLowerCase()
      .includes(target.toLowerCase());
  };

  // =====================================================
  // UI
  // =====================================================
  return (
    <div className="activity-page">

      {/* ERROR */}
      {error && (
        <div className="activity-error">
          <strong>Error:</strong> {String(error)}
        </div>
      )}

      {/* =================================================
          MAIN LAYOUT
      ================================================= */}
      <div className="activity-layout">

        {/* =================================================
            LEFT FORM
        ================================================= */}
        <div className="activity-form-wrapper">
          <div className="prototype-card activity-form-card">

            <form onSubmit={handleSubmit}>

              {/* ACTIVITY NAME */}
              <div className="activity-field">
                <label className="proto-label">
                  ACTIVITY NAME *
                </label>

                <input
                  type="text"
                  className="proto-input"
                  name="activitiesName"
                  value={activity.activitiesName}
                  onChange={handleChange}
                  placeholder="Enter Activity Name"
                  maxLength={100}
                  required
                />
              </div>

              {/* COMPONENT */}
              <div className="activity-field">
                <label className="proto-label">
                  COMPONENT *
                </label>

                <select
                  className="proto-input"
                  name="componentID"
                  value={activity.componentID}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select Component
                  </option>

                  {components.map((comp) => {
                    const id =
                      comp.componentID ??
                      comp.ComponentID;

                    const name =
                      getComponentName(comp);

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

              {/* TYPE */}
              <div className="activity-field">
                <label className="proto-label">
                  TYPE
                </label>

                <label className="radio-option">
                  <input
                    type="radio"
                    name="type"
                    value="Cycle Time"
                    checked={
                      activity.type ===
                      "Cycle Time"
                    }
                    onChange={handleChange}
                  />
                  <span>Cycle Time</span>
                </label>

                <label className="radio-option">
                  <input
                    type="radio"
                    name="type"
                    value="Idle Hrs"
                    checked={
                      activity.type ===
                      "Idle Hrs"
                    }
                    onChange={handleChange}
                  />
                  <span>Idle Hrs</span>
                </label>

                <label className="radio-option">
                  <input
                    type="radio"
                    name="type"
                    value="Unutilised Hrs"
                    checked={
                      activity.type ===
                      "Unutilised Hrs"
                    }
                    onChange={handleChange}
                  />
                  <span>Unutilised Hrs</span>
                </label>
              </div>

              {/* STATUS */}
              <div className="activity-field status-field">
                <label className="proto-label">
                  STATUS
                </label>
                <label className="status-option">
                  <input
                    type="checkbox"
                    name="status"
                    checked={
                      activity.status ===
                      "Active"
                    }
                    onChange={handleChange}
                  />

                  <span>Active</span>
                </label>
              </div>

              {/* BUTTONS */}
              <div className="activity-buttons">

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

        {/* =================================================
            RIGHT TABLE
        ================================================= */}
        <div className="activity-table-wrapper">
          <div className="prototype-card activity-table-card">

            {loading ? (
              <div className="activity-loading">
                Loading activities...
              </div>
            ) : (
              <div className="activity-table-container">

                <table className="activity-table">

                  <thead>
                    <tr>
                      <th>ACTIVITY</th>
                      <th>COMPONENT</th>
                      <th className="center">CYCLE</th>
                      <th className="center">IDLE</th>
                      <th className="center">UNUTILISED</th>
                      <th className="center">STATUS</th>
                      <th className="center">ACTION</th>
                    </tr>
                  </thead>

                  <tbody>
                    {activities.length > 0 ? (
                      activities.map((item) => {

                        const activityId =
                          getActivityId(item);

                        const activityName =
                          getActivityName(item);

                        const activityType =
                          getActivityType(item);

                        const componentId =
                          getComponentId(item);

                        const isActive =
                          getActivityStatus(item);

                        const selectedComponent =
                          components.find(
                            (component) =>
                              Number(
                                component.componentID ??
                                  component.ComponentID
                              ) ===
                              Number(componentId)
                          );

                        const componentName =
                          selectedComponent
                            ? getComponentName(
                                selectedComponent
                              )
                            : componentId;

                        return (
                          <tr key={activityId}>

                            {/* ACTIVITY */}
                            <td
                              className="text-truncate-cell"
                              title={activityName}
                            >
                              {activityName}
                            </td>

                            {/* COMPONENT */}
                            <td
                              className="text-truncate-cell"
                              title={componentName}
                            >
                              {componentName}
                            </td>

                            {/* CYCLE */}
                            <td className="center">
                              {isTypeMatched(
                                activityType,
                                "cycle"
                              ) ? (
                                <span className="check-mark">
                                  ✓
                                </span>
                              ) : (
                                "-"
                              )}
                            </td>

                            {/* IDLE */}
                            <td className="center">
                              {isTypeMatched(
                                activityType,
                                "idle"
                              ) ? (
                                <span className="check-mark">
                                  ✓
                                </span>
                              ) : (
                                "-"
                              )}
                            </td>

                            {/* UNUTILISED */}
                            <td className="center">
                              {isTypeMatched(
                                activityType,
                                "unutilised"
                              ) ? (
                                <span className="check-mark">
                                  ✓
                                </span>
                              ) : (
                                "-"
                              )}
                            </td>

                            {/* STATUS */}
                            <td className="center">
                              <span
                                className={
                                  isActive
                                    ? "status-pill status-active"
                                    : "status-pill status-inactive"
                                }
                              >
                                {isActive
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </td>

                            {/* ACTION */}
                            <td className="center">
                              <div className="action-buttons">

                                <button
                                  type="button"
                                  className="btn-action edit-btn"
                                  onClick={() =>
                                    handleEdit(
                                      activityId
                                    )
                                  }
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  className="btn-action delete-btn"
                                  onClick={() =>
                                    handleDelete(
                                      activityId
                                    )
                                  }
                                >
                                  Delete
                                </button>

                              </div>
                            </td>

                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="no-data"
                        >
                          No activities found
                        </td>
                      </tr>
                    )}
                  </tbody>

                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =================================================
          CSS
      ================================================= */}
      <style>{`
        .activity-page {
          width: 100%;
          max-width: 100%;
          padding: 24px;
          background-color: #f4f6fb;
          min-height: 100vh;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .activity-layout {
          width: 100%;
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 24px;
          align-items: start;
          box-sizing: border-box;
        }

        .activity-form-wrapper,
        .activity-table-wrapper {
          min-width: 0;
          width: 100%;
        }

        .prototype-card {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
          border: 1px solid #f0f0f0;
        }

        .activity-form-card {
          padding: 28px 24px;
        }

        .activity-field {
          margin-bottom: 20px;
        }

        .proto-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .proto-input {
          width: 100%;
          height: 44px;
          padding: 8px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          outline: none;
          font-size: 13px;
          color: #334155;
          background: #ffffff;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }

        .proto-input:focus {
          border-color: #3b82f6;
        }

        .proto-input::placeholder {
          color: #a0aec0;
        }

        .radio-option,
        .status-option {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
          font-size: 14px;
          color: #475569;
          cursor: pointer;
        }

        .radio-option input,
        .status-option input {
          width: 16px;
          height: 16px;
          accent-color: #2563eb;
          cursor: pointer;
          margin: 0;
        }

        .status-field {
          margin-top: 10px;
          margin-bottom: 24px;
        }

        /* Buttons Layout */
        .activity-buttons {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 12px;
          width: 100%;
        }

        .btn-proto-save,
        .btn-proto-cancel {
          flex: 1;
          height: 40px;
          padding: 0 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          white-space: nowrap;
          transition: background-color 0.2s;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .btn-proto-save {
          background: #2563eb;
          color: #ffffff;
        }

        .btn-proto-save:hover {
          background: #1d4ed8;
        }

        .btn-proto-cancel {
          background: #f1f5f9;
          color: #64748b;
        }

        .btn-proto-cancel:hover {
          background: #e2e8f0;
        }

        .activity-table-card {
          padding: 16px 24px;
          overflow: hidden;
        }

        .activity-table-container {
          width: 100%;
          overflow-x: auto;
        }

        .activity-table {
          width: 100%;
          border-collapse: collapse;
          margin: 0;
        }

        .activity-table th {
          height: 48px;
          padding: 12px 16px;
          color: #1e293b;
          border-bottom: 1px solid #f1f5f9;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-align: left;
          white-space: nowrap;
        }

        .activity-table td {
          height: 56px;
          padding: 12px 16px;
          border-bottom: 1px solid #f8fafc;
          color: #475569;
          font-size: 13px;
          vertical-align: middle;
        }

        .activity-table tbody tr:hover {
          background: #fafafa;
        }

        .center {
          text-align: center !important;
        }

        .text-truncate-cell {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .check-mark {
          font-size: 14px;
          font-weight: 700;
          color: #16a34a;
        }

        .status-pill {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-active {
          color: #16a34a;
          background: #dcfce7;
        }

        .status-inactive {
          color: #ef4444;
          background: #fee2e2;
        }

        .action-buttons {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
        }

        .btn-action {
          height: 30px;
          padding: 0 14px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          background: #f1f5f9;
        }

        .edit-btn {
          color: #2563eb;
        }

        .edit-btn:hover {
          background: #e0e7ff;
        }

        .delete-btn {
          color: #ef4444;
          background: #fff1f2;
        }

        .delete-btn:hover {
          background: #ffe4e6;
        }

        .no-data {
          height: 120px !important;
          text-align: center !important;
          color: #94a3b8 !important;
        }

        .activity-loading {
          padding: 48px;
          text-align: center;
          color: #64748b;
        }

        .activity-error {
          width: 100%;
          margin-bottom: 20px;
          padding: 12px 16px;
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
          border-radius: 8px;
          font-size: 13px;
        }

        @media (max-width: 1024px) {
          .activity-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default Activities;