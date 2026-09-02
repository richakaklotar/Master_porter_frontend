import React, { useEffect, useState } from "react";
import activityService from "../services/activityService";
import componentService from "../services/componentsService";

function Activities() {
  const [activities, setActivities] = useState([]);
  const [components, setComponents] = useState([]);

  const [activity, setActivity] = useState({
    activitiesID: 0,
    activitiesName: "",
    type: "Cycle Time",
    componentID: "",
  });

  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // LOAD ACTIVITIES
  // =========================
  const loadActivities = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await activityService.getActivities();
      setActivities(response.data || []);
    } catch (err) {
      console.error("Load Activities Error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load activities"
      );
    } finally {
      setLoading(false);
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
      console.error("Load Component Error:", err);
      setError(
        err.response?.data?.message || err.message || "Unable to load components"
      );
    }
  };

  useEffect(() => {
    loadActivities();
    loadComponents();
  }, []);

  // =========================
  // INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setActivity((previous) => ({
      ...previous,
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

      const actId = Number(activity.activitiesID || activity.ActivitiesID || 0);
      const compId = Number(activity.componentID || activity.ComponentID || 0);

      const requestData = {
        activitiesID: actId,
        ActivitiesID: actId,
        activitiesName: activity.activitiesName.trim(),
        ActivitiesName: activity.activitiesName.trim(),
        type: activity.type,
        Type: activity.type,
        componentID: compId,
        ComponentID: compId,
      };

      if (isEdit) {
        await activityService.updateActivity(actId, requestData);
        alert("Activity updated successfully");
      } else {
        await activityService.createActivity(requestData);
        alert("Activity created successfully");
      }

      resetForm();
      await loadActivities();
    } catch (err) {
      console.error("Save Activity Error:", err);
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
      const response = await activityService.getActivityById(id);
      const data = response.data;
      
      setActivity({
        activitiesID: data.activitiesID ?? data.ActivitiesID ?? 0,
        activitiesName: data.activitiesName ?? data.ActivitiesName ?? "",
        type: data.type ?? data.Type ?? "Cycle Time",
        componentID: data.componentID ?? data.ComponentID ?? "",
      });
      setIsEdit(true);
    } catch (err) {
      console.error("Get Activity Error:", err);
      setError(
        err.response?.data?.message || err.message || "Unable to get activity"
      );
    }
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this activity?")) {
      return;
    }

    try {
      setError("");
      await activityService.deleteActivity(id);
      alert("Activity deleted successfully");
      await loadActivities();
    } catch (err) {
      console.error("Delete Activity Error:", err);
      setError(
        err.response?.data?.message || err.message || "Delete failed"
      );
    }
  };

  // =========================
  // RESET
  // =========================
  const resetForm = () => {
    setActivity({
      activitiesID: 0,
      activitiesName: "",
      type: "Cycle Time",
      componentID: "",
    });
    setIsEdit(false);
    setError("");
  };

  // Helper function for strict & case-insensitive matching
  const isTypeMatched = (actualType, targetKeyword) => {
    if (!actualType) return false;
    return String(actualType).toLowerCase().includes(targetKeyword.toLowerCase());
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
                <label className="proto-label">COMPONENT</label>
                <select
                  className="proto-input"
                  name="componentID"
                  value={activity.componentID}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  {components.map((comp) => {
                    const cId = comp.componentID ?? comp.ComponentID;
                    const cName = comp.componentName ?? comp.ComponentName ?? comp.name ?? comp.Name;
                    return (
                      <option key={cId} value={cId}>
                        {cName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="mb-3">
                <label className="proto-label">ACTIVITY NAME *</label>
                <input
                  type="text"
                  className="proto-input"
                  name="activitiesName"
                  value={activity.activitiesName}
                  onChange={handleChange}
                  placeholder="Enter Activity Name"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="proto-label d-block mb-2">
                  TYPE
                </label>

                <div className="form-check mb-1">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="type"
                    id="cycleTime"
                    value="Cycle Time"
                    checked={activity.type === "Cycle Time"}
                    onChange={handleChange}
                  />

                  <label
                    className="form-check-label"
                    htmlFor="cycleTime"
                    style={{
                      textAlign: "left",
                      display: "inline-block",
                    }}
                  >
                    Cycle Time
                  </label>
                </div>

                <div className="form-check mb-1">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="type"
                    id="idleHrs"
                    value="Idle Hrs"
                    checked={activity.type === "Idle Hrs"}
                    onChange={handleChange}
                  />

                  <label
                    className="form-check-label"
                    htmlFor="idleHrs"
                    style={{
                      textAlign: "left",
                      display: "inline-block",
                    }}
                  >
                    Idle Hrs
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="type"
                    id="unutilisedHrs"
                    value="Unutilised Hrs"
                    checked={activity.type === "Unutilised Hrs"}
                    onChange={handleChange}
                  />

                  <label
                    className="form-check-label"
                    htmlFor="unutilisedHrs"
                    style={{
                      textAlign: "left",
                      display: "inline-block",
                    }}
                  >
                    Unutilised Hrs
                  </label>
                </div>
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
          <div className="prototype-card p-0 overflow-auto" style={{ maxWidth: "100%" }}>
            {loading ? (
              <div
                className="p-4 text-center text-muted"
                style={{ fontSize: "0.875rem" }}
              >
                Loading activities...
              </div>
            ) : (
              <table className="table-proto" style={{ width: "100%", tableLayout: "auto" }}>
                <thead>
                  <tr>
                    <th>ACTIVITY</th>
                    <th>COMPONENT</th>
                    <th>CYCLE</th>
                    <th>IDLE</th>
                    <th>UNUTILISED</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.length > 0 ? (
                    activities.map((item) => {
                      const itemActId = item.activitiesID ?? item.ActivitiesID;
                      const itemActName = item.activitiesName ?? item.ActivitiesName;
                      const itemType = item.type ?? item.Type;
                      const itemCompId = item.componentID ?? item.ComponentID;

                      const selectedComponent = components.find(
                        (c) => String(c.componentID ?? c.ComponentID) === String(itemCompId)
                      );

                      const compDisplayName = selectedComponent
                        ? (selectedComponent.componentName ?? selectedComponent.ComponentName ?? selectedComponent.name)
                        : itemCompId;

                      return (
                        <tr key={itemActId}>
                          <td>{itemActName}</td>
                          <td>{compDisplayName}</td>
                          <td>{isTypeMatched(itemType, "cycle") ? "✔" : "-"}</td>
                          <td>{isTypeMatched(itemType, "idle") ? "✔" : "-"}</td>
                          <td>{isTypeMatched(itemType, "unutilised") ? "✔" : "-"}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-link btn-sm p-0 me-3 text-primary text-decoration-none"
                              style={{ fontSize: "0.85rem", fontWeight: "500" }}
                              onClick={() => handleEdit(itemActId)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-link btn-sm p-0 text-danger text-decoration-none"
                              style={{ fontSize: "0.85rem", fontWeight: "500" }}
                              onClick={() => handleDelete(itemActId)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        No activities found
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

export default Activities;