import React, { useEffect, useState } from "react";
import componentsService from "../services/componentsService";
import projectService from "../services/projectService";
import machineService from "../services/machineService";

function Components() {
  const [components, setComponents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [machines, setMachines] = useState([]);

  const [component, setComponent] = useState({
    componentID: 0,
    componentName: "",
    standardHours: "",
    stock: "",
    seriesNo: "",
    projectID: "",
    machineID: "",
  });

  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // LOAD COMPONENTS
  // =========================
  const loadComponents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await componentsService.getComponents();
      setComponents(response.data);
    } catch (err) {
      console.error("Load Components Error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          err.message ||
          "Unable to load components"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD PROJECTS
  // =========================
  const loadProjects = async () => {
    try {
      const response = await projectService.getProjects();
      setProjects(response.data);
    } catch (err) {
      console.error("Load Projects Error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load projects"
      );
    }
  };

  // =========================
  // LOAD MACHINES
  // =========================
  const loadMachines = async () => {
    try {
      const response = await machineService.getMachines();
      setMachines(response.data);
    } catch (err) {
      console.error("Load Machines Error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load machines"
      );
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    loadComponents();
    loadProjects();
    loadMachines();
  }, []);

  // =========================
  // INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setComponent((previous) => ({
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

      const requestData = {
        componentID: Number(component.componentID),
        componentName: component.componentName.trim(),
        standardHours: Number(component.standardHours),
        stock: Number(component.stock),
        seriesNo: component.seriesNo.trim(),
        projectID: Number(component.projectID),
        machineID: Number(component.machineID),
      };

      if (isEdit) {
        await componentsService.updateComponent(
          component.componentID,
          requestData
        );

        alert("Component updated successfully");
      } else {
        await componentsService.createComponent(requestData);

        alert("Component created successfully");
      }

      resetForm();
      await loadComponents();
    } catch (err) {
      console.error("Save Component Error:", err);

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

      const response = await componentsService.getComponentById(id);

      setComponent({
        componentID: response.data.componentID,
        componentName: response.data.componentName || "",
        standardHours: response.data.standardHours ?? "",
        stock: response.data.stock ?? "",
        seriesNo: response.data.seriesNo || "",
        projectID: response.data.projectID ?? "",
        machineID: response.data.machineID ?? "",
      });

      setIsEdit(true);
    } catch (err) {
      console.error("Get Component Error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to get component"
      );
    }
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this component?")) {
      return;
    }

    try {
      setError("");

      await componentsService.deleteComponent(id);

      alert("Component deleted successfully");

      await loadComponents();
    } catch (err) {
      console.error("Delete Component Error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          err.message ||
          "Delete failed"
      );
    }
  };

  // =========================
  // RESET
  // =========================
  const resetForm = () => {
    setComponent({
      componentID: 0,
      componentName: "",
      standardHours: "",
      stock: "",
      seriesNo: "",
      projectID: "",
      machineID: "",
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

      <div className="cards-side-by-side">

        {/* =========================
            LEFT FORM
        ========================= */}
        <div className="left-card-form">
          <div className="prototype-card">
            <form onSubmit={handleSubmit}>
              <div className="row g-2">

                {/* COMPONENT NAME */}
                <div className="col-12 col-md-6 mb-2">
                  <label className="proto-label">
                    COMPONENT NAME *
                  </label>
                  <input
                    type="text"
                    className="proto-input"
                    name="componentName"
                    value={component.componentName}
                    onChange={handleChange}
                    placeholder="Enter Component Name"
                    required
                  />
                </div>

                {/* STANDARD HOURS */}
                <div className="col-12 col-md-6 mb-2">
                  <label className="proto-label">
                    STANDARD HOURS *
                  </label>
                  <input
                    type="number"
                    className="proto-input"
                    name="standardHours"
                    value={component.standardHours}
                    onChange={handleChange}
                    placeholder="Enter Standard Hours"
                    min="0"
                    required
                  />
                </div>

                {/* STOCK */}
                <div className="col-12 col-md-6 mb-2">
                  <label className="proto-label">
                    STOCK *
                  </label>
                  <input
                    type="number"
                    className="proto-input"
                    name="stock"
                    value={component.stock}
                    onChange={handleChange}
                    placeholder="Enter Stock"
                    min="0"
                    required
                  />
                </div>

                {/* SERIES NO */}
                <div className="col-12 col-md-6 mb-2">
                  <label className="proto-label">
                    SERIES NO *
                  </label>
                  <input
                    type="text"
                    className="proto-input"
                    name="seriesNo"
                    value={component.seriesNo}
                    onChange={handleChange}
                    placeholder="Enter Series No"
                    required
                  />
                </div>

                {/* PROJECT */}
                <div className="col-12 col-md-6 mb-2">
                  <label className="proto-label">
                    PROJECT *
                  </label>
                  <select
                    className="proto-input"
                    name="projectID"
                    value={component.projectID}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      -- Select Project --
                    </option>

                    {projects.map((project) => (
                      <option
                        key={project.projectID}
                        value={project.projectID}
                      >
                        {project.projectName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* MACHINE */}
                <div className="col-12 col-md-6 mb-2">
                  <label className="proto-label">
                    MACHINE *
                  </label>
                  <select
                    className="proto-input"
                    name="machineID"
                    value={component.machineID}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      -- Select Machine --
                    </option>

                    {machines.map((machine) => (
                      <option
                        key={machine.machineID}
                        value={machine.machineID}
                      >
                        {machine.machineName}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* BUTTONS */}
              <div className="d-flex gap-2 pt-3">
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

        {/* =========================
            RIGHT TABLE
        ========================= */}
        <div className="right-card-table">
          <div className="prototype-card table-card">

            {loading ? (
              <div className="loading-container">
                Loading components...
              </div>
            ) : (
              <div className="component-table-wrapper">
                <table className="table-proto">

                  <thead>
                    <tr>
                      <th>COMPONENT NAME</th>
                      <th>STANDARD HOURS</th>
                      <th>STOCK</th>
                      <th>SERIES NO</th>
                      <th>PROJECT</th>
                      <th>MACHINE</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>

                  <tbody>
                    {components.length > 0 ? (
                      components.map((item) => {
                        const selectedProject = projects.find(
                          (p) => Number(p.projectID) === Number(item.projectID)
                        );

                        const selectedMachine = machines.find(
                          (m) => Number(m.machineID) === Number(item.machineID)
                        );

                        return (
                          <tr key={item.componentID}>
                            <td>{item.componentName}</td>
                            <td>{item.standardHours}</td>
                            <td>{item.stock}</td>
                            <td>{item.seriesNo}</td>
                            <td>
                              {selectedProject
                                ? selectedProject.projectName
                                : item.projectID}
                            </td>

                            <td>
                              {selectedMachine
                                ? selectedMachine.machineName
                                : item.machineID}
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-link btn-sm p-0 me-3 text-primary text-decoration-none"
                                style={{ fontSize: "0.85rem", fontWeight: "500" }}
                                onClick={() => handleEdit(item.componentID)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn btn-link btn-sm p-0 text-danger text-decoration-none"
                                style={{ fontSize: "0.85rem", fontWeight: "500" }}
                                onClick={() => handleDelete(item.componentID)}
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
                          colSpan="7"
                          className="empty-row"
                        >
                          No components found
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