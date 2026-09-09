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
    projectName: "",
    projectCode: "",
    status: "Active",
    machineID: "",
  });

  const [isEdit, setIsEdit] = useState(false);

  // Parse standard ASP.NET validation and exception structures
  const parseApiError = (err) => {
    console.error("API ERROR:", err);
    const apiData = err.response?.data;

    if (apiData?.errors && typeof apiData.errors === "object") {
      const messages = Object.values(apiData.errors).flat().filter(Boolean);
      if (messages.length > 0) return messages.join(" ");
    }

    if (apiData?.detail) return apiData.detail;
    if (apiData?.message) return apiData.message;
    if (apiData?.error) return apiData.error;
    if (apiData?.title) return apiData.title;
    if (typeof apiData === "string") return apiData;

    return err.message || "An unexpected error occurred.";
  };

  // Helper for case-insensitive/variant property extraction
  const getEntityProperty = (obj, key) => {
    if (!obj) return undefined;
    const lowerKey = key.toLowerCase();
    const matchedKey = Object.keys(obj).find(
      (k) => k.toLowerCase() === lowerKey
    );
    return matchedKey ? obj[matchedKey] : undefined;
  };

  const getMachineId = (machine) =>
    getEntityProperty(machine, "machineID") ??
    getEntityProperty(machine, "id") ??
    "";

  const getMachineName = (machine) =>
    getEntityProperty(machine, "machineName") ??
    getEntityProperty(machine, "name") ??
    "-";

  // Load projects and dropdown options concurrently
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [projectRes, machineRes] = await Promise.allSettled([
        projectService.getProjects(),
        machineService.getMachines(),
      ]);

      if (projectRes.status === "fulfilled") {
        setProjects(projectRes.value?.data || []);
      } else {
        throw projectRes.reason;
      }

      if (machineRes.status === "fulfilled") {
        setMachines(machineRes.value?.data || []);
      } else {
        console.error("MACHINE LOAD ERROR:", machineRes.reason);
      }
    } catch (err) {
      console.error("PROJECT LOAD ERROR:", err);
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (error) setError("");

    if (name === "status") {
      setProject((prev) => ({
        ...prev,
        status: checked ? "Active" : "Inactive",
      }));
      return;
    }

    setProject((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateProject = () => {
    const projectName = project.projectName.trim();
    const projectCode = project.projectCode.trim();

    if (!projectName) {
      setError("Project Name is required.");
      return false;
    }

    if (!projectCode) {
      setError("Project Code is required.");
      return false;
    }

    if (!project.machineID || Number(project.machineID) <= 0) {
      setError("Please select a Machine.");
      return false;
    }

    if (projectName.toLowerCase() === projectCode.toLowerCase()) {
      setError("Project Name and Project Code cannot be the same.");
      return false;
    }

    const currentId = Number(project.projectID || 0);

    // Normalize values
    const normalizedName = projectName.toLowerCase();
    const normalizedCode = projectCode.toLowerCase();

    // Duplicate Project Name
    const duplicateName = projects.some((item) => {
      const itemId = Number(
        getEntityProperty(item, "projectID") || 0
      );

      const itemName = String(
        getEntityProperty(item, "projectName") || ""
      )
        .trim()
        .toLowerCase();

      return (
        itemId !== currentId &&
        itemName === normalizedName
      );
    });

    if (duplicateName) {
      setError("Project Name already exists.");
      return false;
    }

    // Duplicate Project Code
    const duplicateCode = projects.some((item) => {
      const itemId = Number(
        getEntityProperty(item, "projectID") || 0
      );

      const itemCode = String(
        getEntityProperty(item, "projectCode") || ""
      )
        .trim()
        .toLowerCase();

      return (
        itemId !== currentId &&
        itemCode === normalizedCode
      );
    });

    if (duplicateCode) {
      setError("Project Code already exists.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateProject()) return;

    try {
      setLoading(true);

      const requestData = {
        projectID: Number(project.projectID || 0),
        projectName: project.projectName.trim(),
        projectCode: project.projectCode.trim(),
        status: project.status || "Active",
        machineID: Number(project.machineID),
      };

      if (isEdit) {
        await projectService.updateProject(
          Number(project.projectID),
          requestData
        );
        alert("Project updated successfully.");
      } else {
        await projectService.createProject(requestData);
        alert("Project created successfully.");
      }

      resetForm();
      await loadData();
    } catch (err) {
      console.error("PROJECT SAVE ERROR:", err);
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      setError("");
      setLoading(true);

      const response = await projectService.getProjectById(Number(id));
      const data = response.data;

      const projectId = getEntityProperty(data, "projectID") ?? id;
      const machineId = getEntityProperty(data, "machineID") ?? "";
      const projectName = getEntityProperty(data, "projectName") ?? "";
      const projectCode = getEntityProperty(data, "projectCode") ?? "";
      const status = getEntityProperty(data, "status") ?? "Active";

      setProject({
        projectID: Number(projectId),
        projectName: projectName,
        projectCode: projectCode,
        status: status,
        machineID: machineId !== "" ? String(machineId) : "",
      });

      setIsEdit(true);
    } catch (err) {
      console.error("GET PROJECT BY ID ERROR:", err);
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id || Number(id) <= 0) {
      setError("Invalid Project ID.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      setError("");
      setLoading(true);

      await projectService.deleteProject(Number(id));
      alert("Project deleted successfully.");
      await loadData();
    } catch (err) {
      console.error("DELETE PROJECT ERROR:", err);
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProject({
      projectID: 0,
      projectName: "",
      projectCode: "",
      status: "Active",
      machineID: "",
    });
    setIsEdit(false);
    setError("");
  };

  return (
    <div
      className="plant-page-wrapper"
      style={{
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      {error && (
        <div
          className="alert alert-danger mb-4"
          style={{
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
            overflowWrap: "anywhere",
          }}
        >
          <strong>Error:</strong> {String(error)}
        </div>
      )}

      <div
        className="cards-side-by-side"
        style={{
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* Form Card */}
        <div
          className="left-card-form"
          style={{
            minWidth: 0,
            maxWidth: "100%",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <div className="prototype-card">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="proto-label">PROJECT NAME *</label>
                <input
                  type="text"
                  className="proto-input"
                  name="projectName"
                  value={project.projectName}
                  onChange={handleChange}
                  placeholder="Enter Project Name"
                  required
                  disabled={loading}
                />
              </div>

              <div className="mb-3">
                <label className="proto-label">PROJECT CODE *</label>
                <input
                  type="text"
                  className="proto-input"
                  name="projectCode"
                  value={project.projectCode}
                  onChange={handleChange}
                  placeholder="Enter Project Code"
                  required
                  disabled={loading}
                />
              </div>

              <div className="mb-3">
                <label className="proto-label">MACHINE *</label>
                <select
                  className="proto-input"
                  name="machineID"
                  value={project.machineID}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select Machine</option>
                  {machines.map((m) => {
                    const id = getMachineId(m);
                    const name = getMachineName(m);
                    return (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div
                className="mb-4"
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="projectStatus"
                  name="status"
                  checked={project.status === "Active"}
                  onChange={handleChange}
                  disabled={loading}
                  style={{
                    marginLeft: "0",
                    marginRight: "8px",
                    position: "static",
                  }}
                />

                <label
                  className="form-check-label"
                  htmlFor="projectStatus"
                  style={{
                    margin: 0,
                    cursor: "pointer",
                  }}
                >
                  Active
                </label>
              </div>

              <div className="d-flex gap-2 pt-1">
                <button
                  type="submit"
                  className="btn-proto-save"
                  disabled={loading}
                >
                  {loading ? "Saving..." : isEdit ? "Update" : "Save"}
                </button>
                <button
                  type="button"
                  className="btn-proto-cancel"
                  onClick={resetForm}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Table Card */}
        <div
          className="right-card-table"
          style={{
            minWidth: 0,
            width: "100%",
            maxWidth: "100%",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <div className="prototype-card p-0">
            {loading && projects.length === 0 ? (
              <div className="p-4 text-center text-muted">
                Loading projects...
              </div>
            ) : (
              <div style={{ width: "100%", overflowX: "auto" }}>
                <table
                  className="table-proto"
                  style={{
                    width: "100%",
                    minWidth: "700px",
                    tableLayout: "fixed",
                    margin: 0,
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ width: "22%" }}>PROJECT</th>
                      <th style={{ width: "18%" }}>CODE</th>
                      <th style={{ width: "20%" }}>MACHINE</th>
                      <th style={{ width: "15%" }}>STATUS</th>
                      <th style={{ width: "25%" }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.length > 0 ? (
                      projects.map((item) => {
                        const id = getEntityProperty(item, "projectID");
                        const name =
                          getEntityProperty(item, "projectName") || "-";
                        const code =
                          getEntityProperty(item, "projectCode") || "-";
                        const machineId = getEntityProperty(
                          item,
                          "machineID"
                        );
                        const status =
                          getEntityProperty(item, "status") || "Inactive";

                        const matchedMachine = machines.find(
                          (m) =>
                            Number(getMachineId(m)) === Number(machineId)
                        );
                        const machineName = matchedMachine
                          ? getMachineName(matchedMachine)
                          : "-";

                        return (
                          <tr key={id}>
                            <td style={{ wordBreak: "break-word" }}>{name}</td>
                            <td style={{ wordBreak: "break-word" }}>{code}</td>
                            <td style={{ wordBreak: "break-word" }}>
                              {machineName}
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  status === "Active"
                                    ? "bg-success"
                                    : "bg-secondary"
                                }`}
                              >
                                {status}
                              </span>
                            </td>
                            <td>
                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <button
                                  type="button"
                                  className="btn btn-link btn-sm p-0 text-primary text-decoration-none"
                                  onClick={() => handleEdit(id)}
                                  disabled={loading}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-link btn-sm p-0 text-danger text-decoration-none"
                                  onClick={() => handleDelete(id)}
                                  disabled={loading}
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
                          colSpan="5"
                          className="text-center py-5 text-muted"
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