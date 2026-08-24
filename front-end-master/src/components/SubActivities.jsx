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
  });

  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // LOAD DATA (SUB-ACTIVITIES, ACTIVITIES, COMPONENTS)
  // =========================
  const loadSubActivities = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await subActivityService.getSubActivities();
      setSubActivities(response.data || []);
    } catch (err) {
      console.error("Load SubActivities Error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load sub activities"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    try {
      const response = await activityService.getActivities();
      setActivities(response.data || []);
    } catch (err) {
      console.error("Load Activities Error:", err);
    }
  };

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

  // Filter activities dynamically based on selected component
  const filteredActivities = activities.filter((act) => {
    if (!subActivity.componentID) return true;
    const actCompId = act.componentID ?? act.ComponentID;
    return String(actCompId) === String(subActivity.componentID);
  });

  // =========================
  // INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubActivity((prev) => ({
      ...prev,
      [name]: value,
      // Reset activity selection if component changes
      ...(name === "componentID" ? { activitiesID: "" } : {}),
    }));
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

      const requestData = {
        subActivitiesID: subId,
        SubActivitiesID: subId,
        subActivitiesName: subActivity.subActivitiesName.trim(),
        SubActivitiesName: subActivity.subActivitiesName.trim(),
        activitiesID: actId,
        ActivitiesID: actId,
        componentID: compId,
        ComponentID: compId,
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
      const response = await subActivityService.getSubActivityById(id);
      const data = response.data;

      setSubActivity({
        subActivitiesID: data.subActivitiesID ?? data.SubActivitiesID ?? 0,
        subActivitiesName: data.subActivitiesName ?? data.SubActivitiesName ?? "",
        activitiesID: data.activitiesID ?? data.ActivitiesID ?? "",
        componentID: data.componentID ?? data.ComponentID ?? "",
      });
      setIsEdit(true);
    } catch (err) {
      console.error("Get SubActivity Error:", err);
      setError(
        err.response?.data?.message || err.message || "Unable to get sub activity"
      );
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
      setError(
        err.response?.data?.message || err.message || "Delete failed"
      );
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
                      act.activitiesName ?? act.ActivitiesName ?? act.name;
                    return (
                      <option key={aId} value={aId}>
                        {aName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="mb-4">
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
                Loading sub activities...
              </div>
            ) : (
              <table className="table-proto" style={{ width: "100%", tableLayout: "auto" }}>
                <thead>
                  <tr>
                    <th>SUB ACTIVITY</th>
                    <th>ACTIVITY</th>
                    <th>COMPONENT</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {subActivities.length > 0 ? (
                    subActivities.map((item) => {
                      const subId = item.subActivitiesID ?? item.SubActivitiesID;
                      const subName = item.subActivitiesName ?? item.SubActivitiesName;
                      const actId = item.activitiesID ?? item.ActivitiesID;
                      const compId = item.componentID ?? item.ComponentID;

                      const selectedActivity = activities.find(
                        (a) => String(a.activitiesID ?? a.ActivitiesID) === String(actId)
                      );
                      const selectedComponent = components.find(
                        (c) => String(c.componentID ?? c.ComponentID) === String(compId)
                      );

                      const actDisplayName = selectedActivity
                        ? selectedActivity.activitiesName ?? selectedActivity.ActivitiesName
                        : actId;

                      const compDisplayName = selectedComponent
                        ? selectedComponent.componentName ??
                          selectedComponent.ComponentName ??
                          selectedComponent.name
                        : compId;

                      return (
                        <tr key={subId}>
                          <td>{subName}</td>
                          <td>{actDisplayName}</td>
                          <td>{compDisplayName}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-link btn-sm p-0 me-3 text-primary text-decoration-none"
                              style={{ fontSize: "0.85rem", fontWeight: "500" }}
                              onClick={() => handleEdit(subId)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-link btn-sm p-0 text-danger text-decoration-none"
                              style={{ fontSize: "0.85rem", fontWeight: "500" }}
                              onClick={() => handleDelete(subId)}
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
    </div>
  );
}

export default SubActivities;