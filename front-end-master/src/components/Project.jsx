import React, { useEffect, useState } from "react";
import projectService from "../services/projectService";
import machineService from "../services/machineService";

function Project() {
  const [projects, setProjects] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [project, setProject] = useState({
    projectID: 0,
    machineID: "",
    projectName: "",
    projectCode: "",
    status: "Active",
  });

  const [isEdit, setIsEdit] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [projectsRes, machinesRes] = await Promise.all([
        projectService.getProjects(),
        machineService.getMachines(),
      ]);

      setProjects(projectsRes.data || []);
      setMachines(machinesRes.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Unable to load data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper function to resolve Machine Name from machineID
  const getMachineName = (item) => {
    if (item.machineName) return item.machineName;
    const found = machines.find(
      (m) => Number(m.machineID) === Number(item.machineID)
    );
    return found ? found.machineName : item.machineID || "-";
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProject((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "Active" : "Inactive") : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!project.machineID) {
      setError("Please select a Machine");
      return;
    }
    if (!project.projectName.trim()) {
      setError("Project Name is required");
      return;
    }

    try {
      setError("");

      const requestData = {
        projectID: Number(project.projectID),
        machineID: Number(project.machineID),
        projectName: project.projectName.trim(),
        projectCode: project.projectCode.trim(),
        status: project.status || "Active",
      };

      if (isEdit) {
        await projectService.updateProject(project.projectID, requestData);
        alert("Project updated successfully");
      } else {
        await projectService.createProject(requestData);
        alert("Project created successfully");
      }

      resetForm();
      await fetchData();
    } catch (err) {
      setError(
        err.response?.data?.title ||
          err.response?.data?.message ||
          err.message ||
          "Something went wrong"
      );
    }
  };

  const handleEdit = async (id) => {
    try {
      setError("");
      const response = await projectService.getProjectById(id);
      const data = response.data;

      setProject({
        projectID: data.projectID,
        machineID: data.machineID || "",
        projectName: data.projectName || "",
        projectCode: data.projectCode || "",
        status: data.status || "Active",
      });

      setIsEdit(true);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to get project details");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      setError("");
      await projectService.deleteProject(id);
      alert("Project deleted successfully");
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  const resetForm = () => {
    setProject({
      projectID: 0,
      machineID: "",
      projectName: "",
      projectCode: "",
      status: "Active",
    });
    setIsEdit(false);
    setError("");
  };

  return (
    <div className="project-page">
      {error && (
        <div className="project-alert">
          <span>⚠</span>
          <div>
            <strong>Error</strong>
            <p>{String(error)}</p>
          </div>
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      <div className="project-layout">
        {/* ================= FORM CARD ================= */}
        <div className="project-form-card">
          <form onSubmit={handleSubmit}>
            {/* Machine */}
            <div className="project-form-group">
              <label>
                Machine <span>*</span>
              </label>

              <select
                name="machineID"
                value={project.machineID}
                onChange={handleChange}
                className="project-form-control"
                required
              >
                <option value="">Select Machine</option>

                {machines.map((m) => (
                  <option key={m.machineID} value={m.machineID}>
                    {m.machineName}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Name */}
            <div className="project-form-group">
              <label>
                Project Name <span>*</span>
              </label>

              <input
                type="text"
                name="projectName"
                value={project.projectName}
                onChange={handleChange}
                className="project-form-control"
                placeholder="Enter project name"
                required
              />
            </div>

            {/* Project Code */}
            <div className="project-form-group">
              <label>Project Code</label>

              <input
                type="text"
                name="projectCode"
                value={project.projectCode}
                onChange={handleChange}
                className="project-form-control"
                placeholder="Enter project code"
              />
            </div>

            {/* Status */}
            <div className="form-check mb-4">
              <input
                type="checkbox"
                className="form-check-input"
                id="status"
                name="status"
                checked={project.status === "Active"}
                onChange={handleChange}
              />
              <label
                className="form-check-label ms-1"
                htmlFor="status"
                style={{ fontSize: "0.85rem", color: "#475569" }}
              >
                Active
              </label>
            </div>

            {/* Buttons */}
            <div className="project-form-actions">
              <button
                type="submit"
                className="project-btn project-btn-primary"
                disabled={loading}
              >
                {isEdit ? "Update" : "Save"}
              </button>

              <button
                type="button"
                className="project-btn project-btn-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* ================= TABLE CARD ================= */}
        <div className="right-card-table">
          <div className="prototype-card p-0 overflow-hidden">
            {loading ? (
              <div
                className="p-4 text-center text-muted"
                style={{ fontSize: "0.875rem" }}
              >
                Loading projects...
              </div>
            ) : (
              <div style={{ width: "100%", overflow: "hidden" }}>
                <table
                  className="table-proto"
                  style={{
                    width: "100%",
                    tableLayout: "fixed",
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ width: "22%" }}>PROJECT</th>
                      <th style={{ width: "22%" }}>CODE</th>
                      <th style={{ width: "22%" }}>MACHINE</th>
                      <th style={{ width: "14%" }}>STATUS</th>
                      <th style={{ width: "20%" }}>ACTION</th>
                    </tr>
                  </thead>

                  <tbody>
                    {projects.length > 0 ? (
                      projects.map((item) => (
                        <tr key={item.projectID}>
                          <td
                            style={{
                              wordBreak: "break-word",
                              overflow: "hidden",
                            }}
                          >
                            {item.projectName || "-"}
                          </td>

                          <td
                            style={{
                              wordBreak: "break-word",
                              overflow: "hidden",
                            }}
                          >
                            {item.projectCode || "-"}
                          </td>

                          <td
                            style={{
                              wordBreak: "break-word",
                              overflow: "hidden",
                            }}
                          >
                            {getMachineName(item)}
                          </td>

                          <td>
                            <span
                              className={`badge ${
                                item.status === "Active"
                                  ? "bg-success"
                                  : "bg-secondary"
                              }`}
                              style={{
                                fontWeight: "500",
                                fontSize: "0.75rem",
                                padding: "5px 8px",
                              }}
                            >
                              {item.status || "Inactive"}
                            </span>
                          </td>

                          <td>
                            <div
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "10px",
                                flexWrap: "nowrap",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <button
                                type="button"
                                className="btn btn-link btn-sm p-0 text-primary text-decoration-none"
                                style={{
                                  fontSize: "0.85rem",
                                  fontWeight: "500",
                                }}
                                onClick={() => handleEdit(item.projectID)}
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
                                onClick={() => handleDelete(item.projectID)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="text-center py-5 text-muted"
                          style={{ fontSize: "0.875rem" }}
                        >
                          No Project found
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
    </div>
  );
}

export default Project;