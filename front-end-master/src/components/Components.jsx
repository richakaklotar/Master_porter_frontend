import React, { useEffect, useState } from "react";
import componentsService from "../services/componentsService";
import projectService from "../services/projectService";
import machineService from "../services/machineService";

function Components() {
  const [components, setComponents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [machines, setMachines] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [component, setComponent] = useState({
    componentID: 0,
    componentName: "",
    standardHours: "",
    stock: "",
    seriesNo: "",
    projectID: "",
    machineID: "",
    status: "Active",
  });

  const [isEdit, setIsEdit] = useState(false);

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

  const getEntityProperty = (obj, key) => {
    if (!obj) return undefined;
    const lowerKey = key.toLowerCase();
    const matchedKey = Object.keys(obj).find(
      (k) => k.toLowerCase() === lowerKey
    );
    return matchedKey ? obj[matchedKey] : undefined;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [componentRes, projectRes, machineRes] = await Promise.allSettled([
        componentsService.getComponents(),
        projectService.getProjects(),
        machineService.getMachines(),
      ]);

      if (componentRes.status === "fulfilled") {
        setComponents(componentRes.value?.data || []);
      } else {
        throw componentRes.reason;
      }

      if (projectRes.status === "fulfilled") {
        setProjects(projectRes.value?.data || []);
      }

      if (machineRes.status === "fulfilled") {
        setMachines(machineRes.value?.data || []);
      }
    } catch (err) {
      console.error("COMPONENT LOAD ERROR:", err);
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (error) setError("");
    setComponent((prev) => ({ ...prev, [name]: value }));
  };

  const validateComponent = () => {
    const componentName = component.componentName.trim();
    const seriesNo = component.seriesNo.trim();

    if (!componentName) {
      setError("Component Name is required.");
      return false;
    }
    if (component.standardHours === "") {
      setError("Standard Hours is required.");
      return false;
    }
    if (Number(component.standardHours) < 0) {
      setError("Standard Hours cannot be negative.");
      return false;
    }
    if (component.stock === "") {
      setError("Stock is required.");
      return false;
    }
    if (Number(component.stock) < 0) {
      setError("Stock cannot be negative.");
      return false;
    }
    if (!seriesNo) {
      setError("Series No is required.");
      return false;
    }
    if (!component.projectID || Number(component.projectID) <= 0) {
      setError("Please select a Project.");
      return false;
    }
    if (!component.machineID || Number(component.machineID) <= 0) {
      setError("Please select a Machine.");
      return false;
    }

    const currentId = Number(component.componentID || 0);
    const duplicateName = components.some((item) => {
      const itemId = Number(getEntityProperty(item, "componentID") || 0);
      const itemName = String(getEntityProperty(item, "componentName") || "")
        .trim()
        .toLowerCase();
      return itemId !== currentId && itemName === componentName.toLowerCase();
    });

    if (duplicateName) {
      setError("Component Name already exists.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateComponent()) return;

    try {
      setLoading(true);
      const requestData = {
        componentID: Number(component.componentID || 0),
        componentName: component.componentName.trim(),
        standardHours: Number(component.standardHours),
        stock: Number(component.stock),
        seriesNo: component.seriesNo.trim(),
        projectID: Number(component.projectID),
        machineID: Number(component.machineID),
        status: component.status || "Active",
      };

      if (isEdit) {
        await componentsService.updateComponent(
          Number(component.componentID),
          requestData
        );
        alert("Component updated successfully.");
      } else {
        await componentsService.createComponent(requestData);
        alert("Component created successfully.");
      }

      resetForm();
      await loadData();
    } catch (err) {
      console.error("COMPONENT SAVE ERROR:", err);
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    if (!id || Number(id) <= 0) {
      setError("Invalid Component ID.");
      return;
    }

    try {
      setError("");
      setLoading(true);

      const response = await componentsService.getComponentById(Number(id));
      const data = response.data;

      setComponent({
        componentID: Number(getEntityProperty(data, "componentID") ?? id),
        componentName: getEntityProperty(data, "componentName") ?? "",
        standardHours: getEntityProperty(data, "standardHours") ?? "",
        stock: getEntityProperty(data, "stock") ?? "",
        seriesNo: getEntityProperty(data, "seriesNo") ?? "",
        projectID: String(getEntityProperty(data, "projectID") ?? ""),
        machineID: String(getEntityProperty(data, "machineID") ?? ""),
        status: getEntityProperty(data, "status") ?? "Active",
      });

      setIsEdit(true);
    } catch (err) {
      console.error("GET COMPONENT ERROR:", err);
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id || Number(id) <= 0) {
      setError("Invalid Component ID.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this component?")) {
      return;
    }

    try {
      setError("");
      setLoading(true);
      await componentsService.deleteComponent(Number(id));
      alert("Component deleted successfully.");
      await loadData();
    } catch (err) {
      console.error("DELETE COMPONENT ERROR:", err);
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setComponent({
      componentID: 0,
      componentName: "",
      standardHours: "",
      stock: "",
      seriesNo: "",
      projectID: "",
      machineID: "",
      status: "Active",
    });
    setIsEdit(false);
    setError("");
  };

  const getProjectName = (projectID) => {
    const project = projects.find(
      (p) => Number(getEntityProperty(p, "projectID")) === Number(projectID)
    );
    return project ? getEntityProperty(project, "projectName") || "-" : "-";
  };

  const getMachineName = (machineID) => {
    const machine = machines.find(
      (m) => Number(getEntityProperty(m, "machineID")) === Number(machineID)
    );
    return machine ? getEntityProperty(machine, "machineName") || "-" : "-";
  };

  return (
    <div style={{ width: "100%", padding: "20px", boxSizing: "border-box" }}>
      {/* ERROR MESSAGE */}
      {error && (
        <div className="alert alert-danger mb-3" style={{ width: "100%" }}>
          <strong>Error:</strong> {String(error)}
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        {/* LEFT FORM CARD */}
        <div
          style={{
            flex: "1 1 350px",
            maxWidth: "400px",
            minWidth: "300px",
            boxSizing: "border-box",
          }}
        >
          <div
            className="prototype-card no-scrollbar"
            style={{
              padding: "20px",
              maxHeight: "calc(100vh - 100px)",
              overflowY: "auto",
              boxSizing: "border-box",
            }}
          >
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="proto-label">COMPONENT NAME *</label>
                <input
                  type="text"
                  className="proto-input"
                  name="componentName"
                  value={component.componentName}
                  onChange={handleChange}
                  placeholder="Enter Component Name"
                  required
                  disabled={loading}
                  style={{ width: "100%" }}
                />
              </div>

              <div className="mb-3">
                <label className="proto-label">STANDARD HOURS *</label>
                <input
                  type="number"
                  className="proto-input"
                  name="standardHours"
                  value={component.standardHours}
                  onChange={handleChange}
                  placeholder="Enter Standard Hours"
                  min="0"
                  required
                  disabled={loading}
                  style={{ width: "100%" }}
                />
              </div>

              <div className="mb-3">
                <label className="proto-label">STOCK *</label>
                <input
                  type="number"
                  className="proto-input"
                  name="stock"
                  value={component.stock}
                  onChange={handleChange}
                  placeholder="Enter Stock"
                  min="0"
                  required
                  disabled={loading}
                  style={{ width: "100%" }}
                />
              </div>

              <div className="mb-3">
                <label className="proto-label">SERIES NO *</label>
                <input
                  type="text"
                  className="proto-input"
                  name="seriesNo"
                  value={component.seriesNo}
                  onChange={handleChange}
                  placeholder="Enter Series No"
                  required
                  disabled={loading}
                  style={{ width: "100%" }}
                />
              </div>

              <div className="mb-3">
                <label className="proto-label">PROJECT *</label>
                <select
                  className="proto-input"
                  name="projectID"
                  value={component.projectID}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  style={{ width: "100%" }}
                >
                  <option value="">Select Project</option>
                  {projects.map((p) => {
                    const id = getEntityProperty(p, "projectID");
                    const name = getEntityProperty(p, "projectName") || "-";
                    return (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="mb-3">
                <label className="proto-label">MACHINE *</label>
                <select
                  className="proto-input"
                  name="machineID"
                  value={component.machineID}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  style={{ width: "100%" }}
                >
                  <option value="">Select Machine</option>
                  {machines.map((m) => {
                    const id = getEntityProperty(m, "machineID");
                    const name = getEntityProperty(m, "machineName") || "-";
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
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="componentStatus"
                  name="status"
                  checked={component.status === "Active"}
                  onChange={(e) => {
                    setComponent((prev) => ({
                      ...prev,
                      status: e.target.checked ? "Active" : "Inactive",
                    }));
                  }}
                  disabled={loading}
                  style={{ margin: 0 }}
                />
                <label
                  className="form-check-label"
                  htmlFor="componentStatus"
                  style={{ cursor: "pointer", margin: 0 }}
                >
                  Active
                </label>
              </div>

              <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                paddingTop: "10px",
                borderTop: "1px solid #eee",
                width: "100%",
              }}
            >
              <button
                type="submit"
                className="btn-proto-save"
                disabled={loading}
                style={{
                  flex: 1,
                  height: "40px",
                  padding: "0 15px",
                  margin: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxSizing: "border-box",
                  verticalAlign: "middle",
                }}
              >
                {loading ? "Saving..." : isEdit ? "Update" : "Save"}
              </button>

              <button
                type="button"
                className="btn-proto-cancel"
                onClick={resetForm}
                disabled={loading}
                style={{
                  flex: 1,
                  height: "40px",
                  padding: "0 15px",
                  margin: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxSizing: "border-box",
                  verticalAlign: "middle",
                }}
              >
                Cancel
              </button>
            </div>
            </form>
          </div>
        </div>

        {/* RIGHT TABLE CARD */}
        <div
          style={{
            flex: "1 1 600px",
            minWidth: "350px",
            boxSizing: "border-box",
          }}
        >
          <div
            className="prototype-card p-0"
            style={{
              width: "100%",
              overflow: "hidden",
              boxSizing: "border-box",
            }}
          >
            {loading && components.length === 0 ? (
              <div className="p-4 text-center text-muted">
                Loading components...
              </div>
            ) : (
              <div
                className="no-scrollbar"
                style={{
                  width: "100%",
                  overflowX: "auto",
                  boxSizing: "border-box",
                }}
              >
                <table
                  className="table-proto"
                  style={{
                    width: "100%",
                    minWidth: "100%",
                    margin: 0,
                    tableLayout: "auto",
                  }}
                >
                  <thead>
                    <tr>
                      <th>COMPONENT</th>
                      <th style={{ textAlign: "center" }}>STD. HOURS</th>
                      <th style={{ textAlign: "center" }}>STOCK</th>
                      <th>SERIES NO</th>
                      <th>PROJECT</th>
                      <th>MACHINE</th>
                      <th style={{ textAlign: "center" }}>STATUS</th>
                      <th style={{ textAlign: "center" }}>ACTION</th>
                    </tr>
                  </thead>

                  <tbody>
                    {components.length > 0 ? (
                      components.map((item) => {
                        const id = getEntityProperty(item, "componentID");
                        const name =
                          getEntityProperty(item, "componentName") || "-";
                        const standardHours = getEntityProperty(
                          item,
                          "standardHours"
                        );
                        const stock = getEntityProperty(item, "stock");
                        const seriesNo =
                          getEntityProperty(item, "seriesNo") || "-";
                        const projectID = getEntityProperty(item, "projectID");
                        const machineID = getEntityProperty(item, "machineID");
                        const status =
                          getEntityProperty(item, "status") || "Inactive";

                        return (
                          <tr key={id}>
                            <td style={{ whiteSpace: "nowrap" }}>{name}</td>
                            <td style={{ textAlign: "center" }}>
                              {standardHours ?? "-"}
                            </td>
                            <td style={{ textAlign: "center" }}>
                              {stock ?? "-"}
                            </td>
                            <td style={{ whiteSpace: "nowrap" }}>{seriesNo}</td>
                            <td style={{ whiteSpace: "nowrap" }}>
                              {getProjectName(projectID)}
                            </td>
                            <td style={{ whiteSpace: "nowrap" }}>
                              {getMachineName(machineID)}
                            </td>
                            <td style={{ textAlign: "center" }}>
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
                            <td style={{ textAlign: "center" }}>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  gap: "8px",
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
                          colSpan="8"
                          className="text-center py-5 text-muted"
                        >
                          No Component found
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

export default Components;