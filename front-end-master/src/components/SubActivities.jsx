import React, { useEffect, useState } from "react";
import subActivityService from "../services/subActivityService";
import activityService from "../services/activityService";
import componentService from "../services/componentsService";

function SubActivities() {
  const [subActivities, setSubActivities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [components, setComponents] = useState([]);

  const [subActivity, setSubActivity] = useState({
    subActivitiesID: 0,
    subActivitiesName: "",
    activitiesID: "",
    componentID: "",
    status: "Active",
  });

  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // ERROR MESSAGE
  // =========================
  const getErrorMessage = (err) => {
    const data = err?.response?.data;

    if (data?.errors) {
      const messages = Object.values(data.errors).flat();

      if (messages.length > 0) {
        return messages.join(" ");
      }
    }

    return (
      data?.message ||
      data?.title ||
      err?.message ||
      "Something went wrong"
    );
  };

  // =========================
  // LOAD SUB ACTIVITIES
  // =========================
  const loadSubActivities = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await subActivityService.getSubActivities();

      setSubActivities(response.data || []);
    } catch (err) {
      console.error("Load SubActivities Error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD ACTIVITIES
  // =========================
  const loadActivities = async () => {
    try {
      const response = await activityService.getActivities();
      setActivities(response.data || []);
    } catch (err) {
      console.error("Load Activities Error:", err);
    }
  };

  // =========================
  // LOAD COMPONENTS
  // =========================
  const loadComponents = async () => {
    try {
      const response = await componentService.getComponents();
      setComponents(response.data || []);
    } catch (err) {
      console.error("Load Components Error:", err);
    }
  };

  useEffect(() => {
    loadSubActivities();
    loadActivities();
    loadComponents();
  }, []);

  // =========================
  // FILTER ACTIVITIES
  // =========================
  const filteredActivities = activities.filter((act) => {
    if (!subActivity.componentID) return true;

    const actCompId = act.componentID ?? act.ComponentID;

    return String(actCompId) === String(subActivity.componentID);
  });

  // =========================
  // INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSubActivity((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
            ? "Active"
            : "Inactive"
          : value,

      ...(name === "componentID" ? { activitiesID: "" } : {}),
    }));

    if (name === "subActivitiesName") {
      setError("");
    }
  };

  // =========================
  // GET SUB ACTIVITY ID
  // =========================
  const getSubActivityId = (item) =>
    item.subActivitiesID ?? item.SubActivitiesID ?? 0;

  // =========================
  // GET SUB ACTIVITY NAME
  // =========================
  const getSubActivityName = (item) =>
    item.subActivitiesName ?? item.SubActivitiesName ?? "";

  // =========================
  // CHECK DUPLICATE NAME
  // =========================
  const isDuplicateSubActivityName = (name) => {
    const normalizedName = name.trim().toLowerCase();
    const currentId = Number(subActivity.subActivitiesID || 0);

    return subActivities.some((item) => {
      const existingId = Number(getSubActivityId(item) || 0);
      const existingName = getSubActivityName(item).trim().toLowerCase();

      if (isEdit && existingId === currentId) {
        return false;
      }

      return existingName === normalizedName;
    });
  };

  // =========================
  // CREATE / UPDATE
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const subId = Number(subActivity.subActivitiesID || 0);
      const actId = Number(subActivity.activitiesID || 0);
      const compId = Number(subActivity.componentID || 0);
      const subName = subActivity.subActivitiesName.trim();

      if (!subActivity.componentID) {
        setError("Please select Component.");
        return;
      }

      if (!subActivity.activitiesID) {
        setError("Please select Activity.");
        return;
      }

      if (!subName) {
        setError("Sub Activity Name is required.");
        return;
      }

      if (!subActivity.status) {
        setError("Status field is required.");
        return;
      }

      if (isDuplicateSubActivityName(subName)) {
        setError(
          `Sub Activity "${subName}" already exists. Please enter a different name.`
        );
        return;
      }

      const requestData = {
        subActivitiesID: subId,
        SubActivitiesID: subId,
        subActivitiesName: subName,
        SubActivitiesName: subName,
        activitiesID: actId,
        ActivitiesID: actId,
        componentID: compId,
        ComponentID: compId,
        status: subActivity.status === "Active" ? "Active" : "Inactive",
      };

      if (isEdit) {
        await subActivityService.updateSubActivity(subId, requestData);
        alert("Sub Activity updated successfully");
      } else {
        await subActivityService.createSubActivity(requestData);
        alert("Sub Activity created successfully");
      }

      resetForm();
      await loadSubActivities();
    } catch (err) {
      console.error("Save SubActivity Error:", err);
      setError(getErrorMessage(err));
    }
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = async (id) => {
    try {
      setError("");

      const response = await subActivityService.getSubActivityById(id);
      const data = response.data;
      const apiStatus = data.status ?? data.Status ?? "Active";

      setSubActivity({
        subActivitiesID: data.subActivitiesID ?? data.SubActivitiesID ?? 0,
        subActivitiesName: data.subActivitiesName ?? data.SubActivitiesName ?? "",
        activitiesID: data.activitiesID ?? data.ActivitiesID ?? "",
        componentID: data.componentID ?? data.ComponentID ?? "",
        status:
          typeof apiStatus === "boolean"
            ? apiStatus
              ? "Active"
              : "Inactive"
            : apiStatus === "Inactive"
            ? "Inactive"
            : "Active",
      });

      setIsEdit(true);
    } catch (err) {
      console.error("Get SubActivity Error:", err);
      setError(getErrorMessage(err));
    }
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sub activity?")) {
      return;
    }

    try {
      setError("");
      await subActivityService.deleteSubActivity(id);
      alert("Sub Activity deleted successfully");
      await loadSubActivities();
    } catch (err) {
      console.error("Delete SubActivity Error:", err);
      setError(getErrorMessage(err));
    }
  };

  // =========================
  // RESET FORM
  // =========================
  const resetForm = () => {
    setSubActivity({
      subActivitiesID: 0,
      subActivitiesName: "",
      activitiesID: "",
      componentID: "",
      status: "Active",
    });

    setIsEdit(false);
    setError("");
  };

  // =========================
  // HELPERS
  // =========================
  const getActivityId = (item) => item.activitiesID ?? item.ActivitiesID ?? "";
  const getComponentId = (item) => item.componentID ?? item.ComponentID ?? "";
  const getActivityName = (item) =>
    item.activitiesName ?? item.ActivitiesName ?? item.name ?? item.Name ?? "";
  const getComponentName = (item) =>
    item.componentName ?? item.ComponentName ?? item.name ?? item.Name ?? "";

  const getStatus = (item) => {
    const status = item.status ?? item.Status;

    if (typeof status === "boolean") {
      return status ? "Active" : "Inactive";
    }

    return status === "Inactive" ? "Inactive" : "Active";
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
              {/* COMPONENT */}
              <div className="mb-3">
                <label className="proto-label">COMPONENT</label>
                <select
                  className="proto-input"
                  name="componentID"
                  value={subActivity.componentID}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  {components.map((comp) => {
                    const cId = comp.componentID ?? comp.ComponentID;
                    const cName =
                      comp.componentName ??
                      comp.ComponentName ??
                      comp.name ??
                      comp.Name;

                    return (
                      <option key={cId} value={cId}>
                        {cName}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* ACTIVITY */}
              <div className="mb-3">
                <label className="proto-label">ACTIVITY</label>
                <select
                  className="proto-input"
                  name="activitiesID"
                  value={subActivity.activitiesID}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  {filteredActivities.map((act) => {
                    const aId = act.activitiesID ?? act.ActivitiesID;
                    const aName =
                      act.activitiesName ??
                      act.ActivitiesName ??
                      act.name ??
                      act.Name;

                    return (
                      <option key={aId} value={aId}>
                        {aName}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* SUB ACTIVITY NAME */}
              <div className="mb-3">
                <label className="proto-label">SUB ACTIVITY NAME *</label>
                <input
                  type="text"
                  className="proto-input"
                  name="subActivitiesName"
                  value={subActivity.subActivitiesName}
                  onChange={handleChange}
                  placeholder="Enter Sub Activity Name"
                  required
                />
              </div>

              {/* STATUS */}
              <div className="mb-4 status-field">
                <label className="proto-label d-block mb-2">STATUS</label>
                <div className="status-control">
                  <input
                    type="checkbox"
                    id="subActivityStatus"
                    name="status"
                    checked={subActivity.status === "Active"}
                    onChange={handleChange}
                    className="status-checkbox"
                  />
                  <label htmlFor="subActivityStatus" className="status-text">
                    {subActivity.status === "Active" ? "Active" : "Inactive"}
                  </label>
                </div>
              </div>

              {/* BUTTONS */}
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

        {/* =========================
            RIGHT TABLE
        ========================= */}
        <div className="right-card-table">
          <div className="prototype-card p-0 table-container">
            {loading ? (
              <div className="p-4 text-center text-muted loading-text">
                Loading sub activities...
              </div>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>SUB ACTIVITY</th>
                    <th>ACTIVITY</th>
                    <th>COMPONENT</th>
                    <th className="text-center">STATUS</th>
                    <th className="text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {subActivities.length > 0 ? (
                    subActivities.map((item) => {
                      const subId = getSubActivityId(item);
                      const subName = getSubActivityName(item);
                      const actId = getActivityId(item);
                      const compId = getComponentId(item);
                      const status = getStatus(item);

                      const selectedActivity = activities.find(
                        (a) => String(getActivityId(a)) === String(actId)
                      );
                      const selectedComponent = components.find(
                        (c) => String(getComponentId(c)) === String(compId)
                      );

                      const actDisplayName = selectedActivity
                        ? getActivityName(selectedActivity)
                        : actId;
                      const compDisplayName = selectedComponent
                        ? getComponentName(selectedComponent)
                        : compId;

                      return (
                        <tr key={subId}>
                          <td className="font-medium text-dark">{subName}</td>
                          <td>{actDisplayName}</td>
                          <td>{compDisplayName}</td>
                          <td className="text-center">
                            <span
                              className={
                                status === "Active"
                                  ? "badge-status status-active"
                                  : "badge-status status-inactive"
                              }
                            >
                              {status}
                            </span>
                          </td>
                          <td className="text-center">
                            <div className="action-buttons-group">
                              <button
                                type="button"
                                className="action-btn edit-btn"
                                onClick={() => handleEdit(subId)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="action-btn delete-btn"
                                onClick={() => handleDelete(subId)}
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
                      <td colSpan="5" className="empty-state">
                        No sub activities found
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
      <style>{`
        .plant-page-wrapper {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          overflow-x: hidden;
        }

        .cards-side-by-side {
          display: grid;
          grid-template-columns: minmax(280px, 320px) minmax(0, 1fr);
          gap: 20px;
          width: 100%;
          align-items: start;
        }

        .left-card-form,
        .right-card-table {
          min-width: 0;
          width: 100%;
        }

        .prototype-card {
          width: 100%;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03);
          border: 1px solid #e2e8f0;
          box-sizing: border-box;
          padding: 20px;
        }

        .table-container {
          overflow: hidden;
          background: #ffffff;
        }

        /* STATUS ALIGNMENT */
        .status-field {
          width: 100%;
          text-align: left !important;
        }

        .status-control {
          display: flex;
          align-items: center;
          justify-content: flex-start !important;
          width: 100%;
        }

        .status-checkbox {
          appearance: auto;
          -webkit-appearance: checkbox;
          width: 18px !important;
          height: 18px !important;
          margin: 0 !important;
          cursor: pointer;
        }

        .status-text {
          margin: 0 0 0 8px !important;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          color: #475569;
        }

        /* TABLE STYLING */
        .custom-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 0.875rem;
        }

        .custom-table thead {
          background-color: #f8fafc;
        }

        .custom-table th {
          color: #475569;
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 14px 16px;
          border-bottom: 1px solid #e2e8f0;
          text-align: left;
          white-space: nowrap;
        }

        .custom-table td {
          padding: 14px 16px;
          color: #334155;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .custom-table tbody tr:last-child td {
          border-bottom: none;
        }

        .custom-table tbody tr {
          transition: background-color 0.15s ease;
        }

        .custom-table tbody tr:hover {
          background-color: #f8fafc;
        }

        .font-medium {
          font-weight: 500;
        }

        .text-dark {
          color: #0f172a;
        }

        /* STATUS BADGE */
        .badge-status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          line-height: 1;
        }

        .status-active {
          background-color: #dcfce7;
          color: #15803d;
        }

        .status-inactive {
          background-color: #fee2e2;
          color: #b91c1c;
        }

        /* ACTION BUTTONS */
        .action-buttons-group {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .action-btn {
          padding: 5px 12px;
          font-size: 0.775rem;
          font-weight: 500;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
        }

        .edit-btn {
          background-color: #eff6ff;
          color: #2563eb;
          border: 1px solid #bfdbfe;
        }

        .edit-btn:hover {
          background-color: #dbeafe;
          color: #1d4ed8;
        }

        .delete-btn {
          background-color: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .delete-btn:hover {
          background-color: #fee2e2;
          color: #b91c1c;
        }

        .empty-state {
          text-align: center;
          padding: 40px 16px !important;
          color: #94a3b8;
          font-style: italic;
        }

        .loading-text {
          color: #64748b;
        }

        /* RESPONSIVE DESIGN */
        @media (max-width: 992px) {
          .cards-side-by-side {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .table-container {
            overflow-x: auto;
          }

          .custom-table th,
          .custom-table td {
            padding: 10px 12px;
            font-size: 0.8rem;
          }

          .action-btn {
            padding: 4px 8px;
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  );
}

export default SubActivities;