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

  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [component, setComponent] = useState({
    componentID: 0,
    componentName: "",
    standardHours: "",
    topHours: "",
    bottomHours: "",
    sideHours: "",
    stock: "",
    seriesNo: "",
    projectID: "",
    machineID: "",
    status: "Active",
  });

  const [isEdit, setIsEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  // =====================================================
  // PARSE API ERROR
  // =====================================================
  const parseApiError = (err) => {
    console.error("API ERROR:", err);

    const apiData = err?.response?.data;

    if (apiData?.errors && typeof apiData.errors === "object") {
      const messages = Object.entries(apiData.errors)
        .flatMap(([field, fieldErrors]) => {
          if (Array.isArray(fieldErrors)) {
            return fieldErrors.map((message) => {
              const fieldName =
                field.charAt(0).toUpperCase() + field.slice(1);

              return `${fieldName}: ${message}`;
            });
          }

          return [`${field}: ${fieldErrors}`];
        })
        .filter(Boolean);

      if (messages.length > 0) {
        return messages.join("\n");
      }
    }

    if (apiData?.detail) {
      return apiData.detail;
    }

    if (apiData?.message) {
      return apiData.message;
    }

    if (apiData?.error) {
      return apiData.error;
    }

    if (apiData?.title) {
      return apiData.title;
    }

    if (typeof apiData === "string") {
      return apiData;
    }

    return err?.message || "An unexpected error occurred.";
  };

  // =====================================================
  // SHOW SAVE ERROR POPUP
  // =====================================================
  const showSaveError = (message) => {
    setSaveError(
      String(message || "An unexpected error occurred.")
    );
    setShowErrorPopup(true);
  };

  // =====================================================
  // GET ENTITY PROPERTY
  // =====================================================
  const getEntityProperty = (obj, key) => {
    if (!obj) return undefined;

    const lowerKey = key.toLowerCase();

    const matchedKey = Object.keys(obj).find(
      (k) => k.toLowerCase() === lowerKey
    );

    return matchedKey ? obj[matchedKey] : undefined;
  };

  // =====================================================
  // LOAD ALL DATA
  // =====================================================
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [componentRes, projectRes, machineRes] =
        await Promise.allSettled([
          componentsService.getComponents(),
          projectService.getProjects(),
          machineService.getMachines(),
        ]);

      // COMPONENTS
      if (componentRes.status === "fulfilled") {
        const responseData = componentRes.value?.data;

        const data = Array.isArray(responseData)
          ? responseData
          : Array.isArray(responseData?.data)
          ? responseData.data
          : [];

        setComponents(data);
      } else {
        throw componentRes.reason;
      }

      // PROJECTS
      if (projectRes.status === "fulfilled") {
        const responseData = projectRes.value?.data;

        const data = Array.isArray(responseData)
          ? responseData
          : Array.isArray(responseData?.data)
          ? responseData.data
          : [];

        setProjects(data);
      } else {
        console.warn(
          "Project API failed:",
          projectRes.reason
        );
      }

      // MACHINES
      if (machineRes.status === "fulfilled") {
        const responseData = machineRes.value?.data;

        const data = Array.isArray(responseData)
          ? responseData
          : Array.isArray(responseData?.data)
          ? responseData.data
          : [];

        setMachines(data);
      } else {
        console.warn(
          "Machine API failed:",
          machineRes.reason
        );
      }
    } catch (err) {
      console.error(
        "COMPONENT LOAD ERROR:",
        err
      );

      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================
  useEffect(() => {
    loadData();
  }, []);

  // =====================================================
  // HOURS LOGIC
  // =====================================================

  /*
    IMPORTANT:
    0 is treated as EMPTY.

    API usually returns:
    standardHours: 0
    topHours: 0
    bottomHours: 0
    sideHours: 0

    So 0 should NOT disable fields.
  */

  const hasStandardHours =
    component.standardHours !== "" &&
    component.standardHours !== null &&
    component.standardHours !== undefined &&
    Number(component.standardHours) > 0;

  const hasOtherHours =
    (component.topHours !== "" &&
      component.topHours !== null &&
      component.topHours !== undefined &&
      Number(component.topHours) > 0) ||
    (component.bottomHours !== "" &&
      component.bottomHours !== null &&
      component.bottomHours !== undefined &&
      Number(component.bottomHours) > 0) ||
    (component.sideHours !== "" &&
      component.sideHours !== null &&
      component.sideHours !== undefined &&
      Number(component.sideHours) > 0);

  // =====================================================
  // INPUT CHANGE
  // =====================================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setComponent((prev) => {
      // STATUS
      if (type === "checkbox" && name === "status") {
        return {
          ...prev,
          status: checked ? "Active" : "Inactive",
        };
      }

      // ================================================
      // STANDARD HOURS
      // ================================================
      if (name === "standardHours") {
        if (value !== "") {
          return {
            ...prev,
            standardHours: value,

            // Clear other hours
            topHours: "",
            bottomHours: "",
            sideHours: "",
          };
        }

        return {
          ...prev,
          standardHours: "",
        };
      }

      // ================================================
      // TOP / BOTTOM / SIDE HOURS
      // ================================================
      if (
        name === "topHours" ||
        name === "bottomHours" ||
        name === "sideHours"
      ) {
        if (value !== "") {
          return {
            ...prev,

            [name]: value,

            // Clear standard hours
            standardHours: "",
          };
        }

        return {
          ...prev,
          [name]: value,
        };
      }

      // ================================================
      // NORMAL INPUT
      // ================================================
      return {
        ...prev,
        [name]: value,
      };
    });

    setError("");
  };

  // =====================================================
  // DUPLICATE COMPONENT NAME
  // =====================================================
  const isDuplicateComponentName = () => {
    const enteredName =
      component.componentName.trim().toLowerCase();

    const currentId =
      Number(component.componentID || 0);

    if (!enteredName) {
      return false;
    }

    return components.some((item) => {
      const itemId = Number(
        getEntityProperty(
          item,
          "componentID"
        ) || 0
      );

      const itemName = String(
        getEntityProperty(
          item,
          "componentName"
        ) || ""
      )
        .trim()
        .toLowerCase();

      return (
        itemId !== currentId &&
        itemName === enteredName
      );
    });
  };

  // =====================================================
  // DUPLICATE SERIES NO
  // =====================================================
  const isDuplicateSeriesNo = () => {
    const enteredSeries =
      component.seriesNo.trim().toLowerCase();

    const currentId =
      Number(component.componentID || 0);

    if (!enteredSeries) {
      return false;
    }

    return components.some((item) => {
      const itemId = Number(
        getEntityProperty(
          item,
          "componentID"
        ) || 0
      );

      const itemSeries = String(
        getEntityProperty(
          item,
          "seriesNo"
        ) || ""
      )
        .trim()
        .toLowerCase();

      return (
        itemId !== currentId &&
        itemSeries === enteredSeries
      );
    });
  };

  // =====================================================
  // VALIDATION
  // =====================================================
  const validateComponent = () => {
    const componentName =
      component.componentName.trim();

    const seriesNo =
      component.seriesNo.trim();

    // Component Name
    if (!componentName) {
      showSaveError(
        "Component Name is required."
      );
      return false;
    }

    // Duplicate Component Name
    if (isDuplicateComponentName()) {
      showSaveError(
        "Component Name already exists. Please enter a different Component Name."
      );
      return false;
    }

    // Series No
    if (!seriesNo) {
      showSaveError(
        "Series No is required."
      );
      return false;
    }

    // Duplicate Series No
    if (isDuplicateSeriesNo()) {
      showSaveError(
        "Series No already exists. Please enter a different Series No."
      );
      return false;
    }

    // Hours
    if (
      component.standardHours === "" &&
      !hasOtherHours
    ) {
      showSaveError(
        "Please enter Standard Hours or Top/Bottom/Side Hours."
      );
      return false;
    }

    // Standard Hours
    if (
      component.standardHours !== "" &&
      Number(component.standardHours) < 0
    ) {
      showSaveError(
        "Standard Hours cannot be negative."
      );
      return false;
    }

    // Top Hours
    if (
      component.topHours !== "" &&
      Number(component.topHours) < 0
    ) {
      showSaveError(
        "Top Hours cannot be negative."
      );
      return false;
    }

    // Bottom Hours
    if (
      component.bottomHours !== "" &&
      Number(component.bottomHours) < 0
    ) {
      showSaveError(
        "Bottom Hours cannot be negative."
      );
      return false;
    }

    // Side Hours
    if (
      component.sideHours !== "" &&
      Number(component.sideHours) < 0
    ) {
      showSaveError(
        "Side Hours cannot be negative."
      );
      return false;
    }

    // Stock
    if (component.stock === "") {
      showSaveError(
        "Stock is required."
      );
      return false;
    }

    if (Number(component.stock) < 0) {
      showSaveError(
        "Stock cannot be negative."
      );
      return false;
    }

    // Project
    if (
      !component.projectID ||
      Number(component.projectID) <= 0
    ) {
      showSaveError(
        "Please select a Project."
      );
      return false;
    }

    // Machine
    if (
      !component.machineID ||
      Number(component.machineID) <= 0
    ) {
      showSaveError(
        "Please select a Machine."
      );
      return false;
    }

    return true;
  };

  // =====================================================
  // CREATE / UPDATE
  // =====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!validateComponent()) {
      return;
    }

    try {
      setSaving(true);

      const requestData = {
        componentID: Number(
          component.componentID || 0
        ),

        componentName:
          component.componentName.trim(),

        standardHours:
          component.standardHours === ""
            ? 0
            : Number(component.standardHours),

        topHours:
          component.topHours === ""
            ? 0
            : Number(component.topHours),

        bottomHours:
          component.bottomHours === ""
            ? 0
            : Number(component.bottomHours),

        sideHours:
          component.sideHours === ""
            ? 0
            : Number(component.sideHours),

        stock: Number(component.stock),

        seriesNo:
          component.seriesNo.trim(),

        projectID:
          Number(component.projectID),

        machineID:
          Number(component.machineID),

        status:
          component.status || "Active",

        Status:
          component.status || "Active",
      };

      console.log(
        "COMPONENT REQUEST:",
        requestData
      );

      // UPDATE
      if (isEdit) {
        await componentsService.updateComponent(
          Number(component.componentID),
          requestData
        );

        alert(
          "Component updated successfully."
        );
      }

      // CREATE
      else {
        await componentsService.createComponent(
          requestData
        );

        alert(
          "Component created successfully."
        );
      }

      resetForm();
      setShowForm(false);

      await loadData();
    } catch (err) {
      console.error(
        "COMPONENT SAVE ERROR:",
        err
      );

      showSaveError(
        parseApiError(err)
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // EDIT COMPONENT
  // =====================================================
  const handleEdit = async (id) => {
    if (!id || Number(id) <= 0) {
      setError(
        "Invalid Component ID."
      );
      return;
    }

    try {
      setError("");
      setSaving(true);

      const response =
        await componentsService.getComponentById(
          Number(id)
        );

      const data = response?.data;

      console.log(
        "EDIT COMPONENT DATA:",
        data
      );

      // ================================================
      // GET HOURS FROM API
      // ================================================
      const apiStandardHours =
        getEntityProperty(
          data,
          "standardHours"
        );

      const apiTopHours =
        getEntityProperty(
          data,
          "topHours"
        );

      const apiBottomHours =
        getEntityProperty(
          data,
          "bottomHours"
        );

      const apiSideHours =
        getEntityProperty(
          data,
          "sideHours"
        );

      /*
        Convert API 0 values to empty string.

        Example:
        standardHours = 10
        topHours = 0
        bottomHours = 0
        sideHours = 0

        Result:
        standardHours = "10"
        topHours = ""
        bottomHours = ""
        sideHours = ""

        Therefore:
        Standard enabled
        Other fields disabled
      */

      const standardValue =
        apiStandardHours !== null &&
        apiStandardHours !== undefined &&
        Number(apiStandardHours) > 0
          ? String(apiStandardHours)
          : "";

      const topValue =
        apiTopHours !== null &&
        apiTopHours !== undefined &&
        Number(apiTopHours) > 0
          ? String(apiTopHours)
          : "";

      const bottomValue =
        apiBottomHours !== null &&
        apiBottomHours !== undefined &&
        Number(apiBottomHours) > 0
          ? String(apiBottomHours)
          : "";

      const sideValue =
        apiSideHours !== null &&
        apiSideHours !== undefined &&
        Number(apiSideHours) > 0
          ? String(apiSideHours)
          : "";

      // ================================================
      // SET EDIT DATA
      // ================================================
      setComponent({
        componentID: Number(
          getEntityProperty(
            data,
            "componentID"
          ) ?? id
        ),

        componentName:
          getEntityProperty(
            data,
            "componentName"
          ) ?? "",

        standardHours:
          standardValue,

        topHours:
          topValue,

        bottomHours:
          bottomValue,

        sideHours:
          sideValue,

        stock:
          getEntityProperty(
            data,
            "stock"
          ) ?? "",

        seriesNo:
          getEntityProperty(
            data,
            "seriesNo"
          ) ?? "",

        projectID: String(
          getEntityProperty(
            data,
            "projectID"
          ) ?? ""
        ),

        machineID: String(
          getEntityProperty(
            data,
            "machineID"
          ) ?? ""
        ),

        status:
          getEntityProperty(
            data,
            "status"
          ) ??
          getEntityProperty(
            data,
            "Status"
          ) ??
          "Active",
      });

      setIsEdit(true);
      setShowForm(true);
    } catch (err) {
      console.error(
        "GET COMPONENT ERROR:",
        err
      );

      setError(
        parseApiError(err)
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================
  const handleDelete = async (id) => {
    if (!id || Number(id) <= 0) {
      setError(
        "Invalid Component ID."
      );
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this component?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setLoading(true);

      await componentsService.deleteComponent(
        Number(id)
      );

      alert(
        "Component deleted successfully."
      );

      await loadData();
    } catch (err) {
      console.error(
        "DELETE COMPONENT ERROR:",
        err
      );

      setError(
        parseApiError(err)
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RESET FORM
  // =====================================================
  const resetForm = () => {
    setComponent({
      componentID: 0,
      componentName: "",
      standardHours: "",
      topHours: "",
      bottomHours: "",
      sideHours: "",
      stock: "",
      seriesNo: "",
      projectID: "",
      machineID: "",
      status: "Active",
    });

    setIsEdit(false);
    setError("");
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================
  const closeForm = () => {
    if (saving) return;

    resetForm();
    setShowForm(false);
  };

  // =====================================================
  // ADD COMPONENT
  // =====================================================
  const handleAdd = () => {
    resetForm();
    setShowForm(true);
  };

  // =====================================================
  // PROJECT NAME
  // =====================================================
  const getProjectName = (projectID) => {
    const project = projects.find(
      (p) =>
        Number(
          getEntityProperty(
            p,
            "projectID"
          )
        ) === Number(projectID)
    );

    return project
      ? getEntityProperty(
          project,
          "projectName"
        ) || "-"
      : "-";
  };

  // =====================================================
  // MACHINE NAME
  // =====================================================
  const getMachineName = (machineID) => {
    const machine = machines.find(
      (m) =>
        Number(
          getEntityProperty(
            m,
            "machineID"
          )
        ) === Number(machineID)
    );

    return machine
      ? getEntityProperty(
          machine,
          "machineName"
        ) || "-"
      : "-";
  };

  // =====================================================
  // UI
  // =====================================================
  return (
    <div className="components-page-wrapper">

      {/* ERROR */}
      {error && (
        <div className="alert-box error">
          <span>
            {String(error)}
          </span>

          <button
            type="button"
            className="error-close"
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}

      {/* TABLE CARD */}
      <div className="components-table-card">

        <div className="table-card-header">

          <button
            type="button"
            className="add-component-btn"
            onClick={handleAdd}
            disabled={saving}
          >
            <span className="add-icon">
              +
            </span>

            Add Component
          </button>

        </div>

        <div className="table-container">

          {loading ? (
            <div className="loading-box">
              Loading components...
            </div>
          ) : (
            <table className="components-table">

              <thead>
                <tr>
                  <th>COMPONENT</th>
                  <th>STD. HRS</th>
                  <th>TOP HRS</th>
                  <th>BOTTOM HRS</th>
                  <th>SIDE HRS</th>
                  <th>STOCK</th>
                  <th>SERIES NO</th>
                  <th>PROJECT</th>
                  <th>MACHINE</th>
                  <th>STATUS</th>
                  <th className="text-center">
                    ACTION
                  </th>
                </tr>
              </thead>

              <tbody>

                {components.length > 0 ? (
                  components.map((item) => {

                    const id =
                      getEntityProperty(
                        item,
                        "componentID"
                      );

                    const name =
                      getEntityProperty(
                        item,
                        "componentName"
                      ) || "-";

                    const standardHours =
                      getEntityProperty(
                        item,
                        "standardHours"
                      );

                    const topHours =
                      getEntityProperty(
                        item,
                        "topHours"
                      );

                    const bottomHours =
                      getEntityProperty(
                        item,
                        "bottomHours"
                      );

                    const sideHours =
                      getEntityProperty(
                        item,
                        "sideHours"
                      );

                    const stock =
                      getEntityProperty(
                        item,
                        "stock"
                      );

                    const seriesNo =
                      getEntityProperty(
                        item,
                        "seriesNo"
                      ) || "-";

                    const projectID =
                      getEntityProperty(
                        item,
                        "projectID"
                      );

                    const machineID =
                      getEntityProperty(
                        item,
                        "machineID"
                      );

                    const status =
                      getEntityProperty(
                        item,
                        "status"
                      ) ??
                      getEntityProperty(
                        item,
                        "Status"
                      ) ??
                      "Inactive";

                    const isActive =
                      String(status)
                        .toLowerCase() ===
                      "active";

                    return (
                      <tr key={id}>

                        <td className="font-semibold">
                          {name}
                        </td>

                        <td>
                          {standardHours ?? "-"}
                        </td>

                        <td>
                          {topHours ?? "-"}
                        </td>

                        <td>
                          {bottomHours ?? "-"}
                        </td>

                        <td>
                          {sideHours ?? "-"}
                        </td>

                        <td>
                          {stock ?? "-"}
                        </td>

                        <td>
                          {seriesNo}
                        </td>

                        <td>
                          {getProjectName(
                            projectID
                          )}
                        </td>

                        <td>
                          {getMachineName(
                            machineID
                          )}
                        </td>

                        <td>
                          <span
                            className={
                              isActive
                                ? "badge-active"
                                : "badge-inactive"
                            }
                          >
                            {isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td className="action-cell">

                          <button
                            type="button"
                            className="btn-edit"
                            onClick={() =>
                              handleEdit(id)
                            }
                            disabled={saving}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="btn-delete"
                            onClick={() =>
                              handleDelete(id)
                            }
                            disabled={saving}
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
                      colSpan="11"
                      className="no-data"
                    >
                      No components found
                    </td>
                  </tr>
                )}

              </tbody>

            </table>
          )}

        </div>
      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}
      {showForm && (
        <div
          className="component-modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !saving
            ) {
              closeForm();
            }
          }}
        >

          <div className="component-modal">

            {/* HEADER */}
            <div className="modal-header-custom">

              <h5>
                {isEdit
                  ? "Edit Component"
                  : "Add Component"}
              </h5>

              <button
                type="button"
                className="close-modal-btn"
                onClick={closeForm}
                disabled={saving}
              >
                ×
              </button>

            </div>

            {/* BODY */}
            <div className="modal-body-custom">

              <form onSubmit={handleSubmit}>

                {/* COMPONENT NAME */}
                <div className="form-group">

                  <label className="proto-label">
                    COMPONENT NAME *
                  </label>

                  <input
                    type="text"
                    className="proto-input"
                    name="componentName"
                    value={
                      component.componentName
                    }
                    onChange={handleChange}
                    placeholder="Enter Component Name"
                    required
                    disabled={saving}
                  />

                </div>

                {/* STANDARD + TOP */}
                <div className="form-row">

                  {/* STANDARD HOURS */}
                  <div className="form-group">

                    <label className="proto-label">
                      STANDARD HOURS
                    </label>

                    <input
                      type="number"
                      className="proto-input"
                      name="standardHours"
                      value={
                        component.standardHours
                      }
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      disabled={
                        saving ||
                        hasOtherHours
                      }
                    />

                  </div>

                  {/* TOP HOURS */}
                  <div className="form-group">

                    <label className="proto-label">
                      TOP HOURS
                    </label>

                    <input
                      type="number"
                      className="proto-input"
                      name="topHours"
                      value={
                        component.topHours
                      }
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      disabled={
                        saving ||
                        hasStandardHours
                      }
                    />

                  </div>

                </div>

                {/* BOTTOM + SIDE */}
                <div className="form-row">

                  {/* BOTTOM HOURS */}
                  <div className="form-group">

                    <label className="proto-label">
                      BOTTOM HOURS
                    </label>

                    <input
                      type="number"
                      className="proto-input"
                      name="bottomHours"
                      value={
                        component.bottomHours
                      }
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      disabled={
                        saving ||
                        hasStandardHours
                      }
                    />

                  </div>

                  {/* SIDE HOURS */}
                  <div className="form-group">

                    <label className="proto-label">
                      SIDE HOURS
                    </label>

                    <input
                      type="number"
                      className="proto-input"
                      name="sideHours"
                      value={
                        component.sideHours
                      }
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      disabled={
                        saving ||
                        hasStandardHours
                      }
                    />

                  </div>

                </div>

                {/* STOCK + SERIES */}
                <div className="form-row">

                  <div className="form-group">

                    <label className="proto-label">
                      STOCK *
                    </label>

                    <input
                      type="number"
                      className="proto-input"
                      name="stock"
                      value={
                        component.stock
                      }
                      onChange={handleChange}
                      placeholder="Enter Stock"
                      min="0"
                      required
                      disabled={saving}
                    />

                  </div>

                  <div className="form-group">

                    <label className="proto-label">
                      SERIES NO *
                    </label>

                    <input
                      type="text"
                      className="proto-input"
                      name="seriesNo"
                      value={
                        component.seriesNo
                      }
                      onChange={handleChange}
                      placeholder="Enter Series No"
                      required
                      disabled={saving}
                    />

                  </div>

                </div>

                {/* PROJECT + MACHINE */}
                <div className="form-row">

                  {/* PROJECT */}
                  <div className="form-group">

                    <label className="proto-label">
                      PROJECT *
                    </label>

                    <select
                      className="proto-input"
                      name="projectID"
                      value={
                        component.projectID
                      }
                      onChange={handleChange}
                      required
                      disabled={saving}
                    >

                      <option value="">
                        Select Project
                      </option>

                      {projects.map((p) => {

                        const id =
                          getEntityProperty(
                            p,
                            "projectID"
                          );

                        const name =
                          getEntityProperty(
                            p,
                            "projectName"
                          ) || "-";

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

                  {/* MACHINE */}
                  <div className="form-group">

                    <label className="proto-label">
                      MACHINE *
                    </label>

                    <select
                      className="proto-input"
                      name="machineID"
                      value={
                        component.machineID
                      }
                      onChange={handleChange}
                      required
                      disabled={saving}
                    >

                      <option value="">
                        Select Machine
                      </option>

                      {machines.map((m) => {

                        const id =
                          getEntityProperty(
                            m,
                            "machineID"
                          );

                        const name =
                          getEntityProperty(
                            m,
                            "machineName"
                          ) || "-";

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

                </div>

                {/* STATUS */}
                <div className="status-checkbox-row">

                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="componentStatus"
                    name="status"
                    checked={
                      component.status ===
                      "Active"
                    }
                    onChange={handleChange}
                    disabled={saving}
                  />

                  <label
                    className="form-check-label"
                    htmlFor="componentStatus"
                  >
                    Active
                  </label>

                </div>

                {/* BUTTONS */}
                <div className="modal-buttons">

                  <button
                    type="submit"
                    className="btn-proto-save"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : isEdit
                      ? "Update"
                      : "Save"}
                  </button>

                  <button
                    type="button"
                    className="btn-proto-cancel"
                    onClick={closeForm}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                </div>

              </form>

            </div>
          </div>

        </div>
      )}

      {/* =====================================================
          SAVE / UPDATE ERROR POPUP
      ===================================================== */}
      {showErrorPopup && (
        <div
          className="save-error-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget
            ) {
              setShowErrorPopup(false);
            }
          }}
        >

          <div className="save-error-popup">

            <div className="save-error-header">

              <div className="error-icon-circle">
                !
              </div>

              <h5>
                {isEdit
                  ? "Update Failed"
                  : "Save Failed"}
              </h5>

              <button
                type="button"
                className="save-error-close"
                onClick={() =>
                  setShowErrorPopup(false)
                }
              >
                ×
              </button>

            </div>

            <div className="save-error-body">

              <p>
                {String(saveError)
                  .split("\n")
                  .map((message, index) => (
                    <React.Fragment
                      key={index}
                    >
                      {message}

                      {index <
                        String(saveError)
                          .split("\n")
                          .length -
                          1 && (
                        <br />
                      )}
                    </React.Fragment>
                  ))}
              </p>

            </div>

            <div className="save-error-footer">

              <button
                type="button"
                className="error-ok-btn"
                onClick={() =>
                  setShowErrorPopup(false)
                }
              >
                OK
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          STYLES
      ===================================================== */}
      <style>{`

        * {
          box-sizing: border-box;
        }

        .components-page-wrapper {
          width: 100%;
          padding: 24px;
        }

        /* ================= ERROR ALERT ================= */

        .alert-box.error {
          background-color: #fde8e8;
          border: 1px solid #f8b4b4;
          color: #9b1c1c;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 0.875rem;

          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .error-close {
          border: none;
          background: transparent;
          color: #9b1c1c;
          font-size: 20px;
          cursor: pointer;
          line-height: 1;
        }

        /* ================= TABLE CARD ================= */

        .components-table-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #eaecf0;

          box-shadow:
            0px 1px 3px
            rgba(16, 24, 40, 0.1);

          overflow: hidden;
        }

        .table-card-header {
          display: flex;
          justify-content: flex-end;
          align-items: center;

          padding: 18px 24px;

          border-bottom:
            1px solid #f2f4f7;
        }

        /* ================= ADD BUTTON ================= */

        .add-component-btn {
          background: #0066ff;
          color: #ffffff;

          border: none;

          padding: 9px 16px;

          border-radius: 8px;

          font-size: 0.875rem;
          font-weight: 500;

          display: inline-flex;
          align-items: center;
          gap: 8px;

          cursor: pointer;

          transition:
            background 0.2s ease;
        }

        .add-component-btn:hover {
          background: #0052cc;
        }

        .add-component-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .add-icon {
          font-size: 18px;
          line-height: 1;
        }

        /* ================= TABLE ================= */

        .table-container {
          width: 100%;
          overflow-x: auto;
        }

        .components-table {
          width: 100%;

          border-collapse: collapse;

          font-size: 0.85rem;

          text-align: left;

          min-width: 1200px;
        }

        .components-table th {
          background: #f9fafb;

          color: #475467;

          font-weight: 600;

          padding: 12px 16px;

          border-bottom:
            1px solid #eaecf0;

          white-space: nowrap;

          text-transform: uppercase;

          font-size: 0.75rem;

          letter-spacing: 0.03em;
        }

        .components-table td {
          padding: 14px 16px;

          border-bottom:
            1px solid #f2f4f7;

          color: #344054;

          white-space: nowrap;
        }

        .components-table tbody tr:hover {
          background: #f9fafb;
        }

        .font-semibold {
          font-weight: 600;
          color: #101828;
        }

        /* ================= STATUS BADGES ================= */

        .badge-active {
          background: #ecfdf3;
          color: #027a48;

          padding: 4px 10px;

          border-radius: 12px;

          font-size: 0.75rem;

          font-weight: 500;
        }

        .badge-inactive {
          background: #fef3f2;
          color: #b42318;

          padding: 4px 10px;

          border-radius: 12px;

          font-size: 0.75rem;

          font-weight: 500;
        }

        /* ================= ACTION ================= */

        .action-cell {
          display: flex;

          gap: 8px;

          justify-content: center;
        }

        .btn-edit,
        .btn-delete {
          border: none;

          padding: 5px 10px;

          border-radius: 6px;

          font-size: 0.8rem;

          font-weight: 500;

          cursor: pointer;
        }

        .btn-edit {
          color: #0066ff;
          background: #eff8ff;
        }

        .btn-edit:hover {
          background: #d1e9ff;
        }

        .btn-delete {
          color: #d92d20;
          background: #fef3f2;
        }

        .btn-delete:hover {
          background: #fee4e2;
        }

        .btn-edit:disabled,
        .btn-delete:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ================= LOADING ================= */

        .loading-box,
        .no-data {
          text-align: center;

          padding: 32px;

          color: #667085;
        }

        /* ================= MAIN MODAL ================= */

        .component-modal-overlay {
          position: fixed;

          inset: 0;

          background:
            rgba(16, 24, 40, 0.5);

          backdrop-filter: blur(2px);

          display: flex;

          justify-content: center;

          align-items: center;

          z-index: 1000;

          padding: 20px;
        }

        .component-modal {
          background: #ffffff;

          border-radius: 12px;

          width: 100%;

          max-width: 540px;

          max-height: 92vh;

          box-shadow:
            0px 20px 24px -4px
            rgba(16, 24, 40, 0.1);

          overflow: hidden;

          display: flex;

          flex-direction: column;
        }

        /* ================= MODAL HEADER ================= */

        .modal-header-custom {
          display: flex;

          justify-content: space-between;

          align-items: center;

          padding: 16px 24px;

          border-bottom:
            1px solid #eaecf0;
        }

        .modal-header-custom h5 {
          margin: 0;

          font-size: 1.1rem;

          font-weight: 600;

          color: #101828;
        }

        .close-modal-btn {
          background: transparent;

          border: none;

          font-size: 1.5rem;

          color: #667085;

          cursor: pointer;

          width: 32px;

          height: 32px;

          border-radius: 6px;
        }

        .close-modal-btn:hover {
          background: #f2f4f7;
        }

        /* ================= MODAL BODY ================= */

        .modal-body-custom {
          padding: 20px 24px;

          overflow-y: auto;
        }

        /* ================= FORM ================= */

        .form-group {
          margin-bottom: 16px;

          display: flex;

          flex-direction: column;

          gap: 6px;
        }

        .form-row {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 16px;
        }

        .proto-label {
          font-size: 0.75rem;

          font-weight: 600;

          color: #344054;

          letter-spacing: 0.02em;
        }

        .proto-input {
          width: 100%;

          padding: 9px 12px;

          border:
            1px solid #d0d5dd;

          border-radius: 8px;

          font-size: 0.875rem;

          outline: none;

          background: #ffffff;

          color: #101828;

          transition:
            border-color 0.2s,
            box-shadow 0.2s;
        }

        .proto-input:focus {
          border-color: #0066ff;

          box-shadow:
            0 0 0 3px
            rgba(0, 102, 255, 0.1);
        }

        .proto-input:disabled {
          background: #f2f4f7;

          color: #98a2b3;

          cursor: not-allowed;
        }

        /* ================= STATUS ================= */

        .status-checkbox-row {
          display: flex;

          align-items: center;

          gap: 8px;

          margin-top: 4px;

          margin-bottom: 8px;
        }

        .status-checkbox-row
          .form-check-input {
          width: 17px;

          height: 17px;

          margin: 0;

          cursor: pointer;
        }

        .status-checkbox-row
          .form-check-label {
          font-size: 0.85rem;

          color: #475569;

          cursor: pointer;
        }

        /* ================= MODAL BUTTONS ================= */

        .modal-buttons {
          display: flex;

          justify-content: flex-end;

          gap: 12px;

          margin-top: 24px;
        }

        .btn-proto-save {
          background: #0066ff;

          color: white;

          border: none;

          padding: 9px 18px;

          border-radius: 8px;

          font-weight: 500;

          cursor: pointer;
        }

        .btn-proto-save:hover {
          background: #0052cc;
        }

        .btn-proto-save:disabled {
          opacity: 0.6;

          cursor: not-allowed;
        }

        .btn-proto-cancel {
          background: white;

          border:
            1px solid #d0d5dd;

          color: #344054;

          padding: 9px 18px;

          border-radius: 8px;

          font-weight: 500;

          cursor: pointer;
        }

        .btn-proto-cancel:hover {
          background: #f9fafb;
        }

        .btn-proto-cancel:disabled {
          opacity: 0.6;

          cursor: not-allowed;
        }

        /* ================= ERROR POPUP ================= */

        .save-error-overlay {
          position: fixed;

          inset: 0;

          background:
            rgba(16, 24, 40, 0.55);

          backdrop-filter: blur(3px);

          display: flex;

          justify-content: center;

          align-items: center;

          z-index: 2000;

          padding: 20px;
        }

        .save-error-popup {
          width: 100%;

          max-width: 430px;

          background: #ffffff;

          border-radius: 14px;

          box-shadow:
            0 20px 40px
            rgba(16, 24, 40, 0.2);

          overflow: hidden;

          animation:
            errorPopupIn
            0.2s ease-out;
        }

        @keyframes errorPopupIn {
          from {
            opacity: 0;

            transform:
              scale(0.95)
              translateY(-10px);
          }

          to {
            opacity: 1;

            transform:
              scale(1)
              translateY(0);
          }
        }

        .save-error-header {
          display: flex;

          align-items: center;

          gap: 12px;

          padding: 18px 20px;

          border-bottom:
            1px solid #eaecf0;
        }

        .error-icon-circle {
          width: 34px;

          height: 34px;

          min-width: 34px;

          border-radius: 50%;

          background: #fef3f2;

          color: #d92d20;

          border:
            1px solid #fecdca;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 18px;

          font-weight: 700;
        }

        .save-error-header h5 {
          flex: 1;

          margin: 0;

          font-size: 1rem;

          font-weight: 600;

          color: #101828;
        }

        .save-error-close {
          width: 30px;

          height: 30px;

          border: none;

          background: transparent;

          color: #667085;

          font-size: 22px;

          line-height: 1;

          cursor: pointer;

          border-radius: 6px;
        }

        .save-error-close:hover {
          background: #f2f4f7;
        }

        .save-error-body {
          padding: 20px;
        }

        .save-error-body p {
          margin: 0;

          color: #475467;

          font-size: 0.875rem;

          line-height: 1.6;

          white-space: normal;
        }

        .save-error-footer {
          display: flex;

          justify-content: flex-end;

          padding: 14px 20px;

          background: #f9fafb;

          border-top:
            1px solid #eaecf0;
        }

        .error-ok-btn {
          background: #0066ff;

          color: #ffffff;

          border: none;

          padding: 8px 22px;

          border-radius: 7px;

          font-size: 0.875rem;

          font-weight: 500;

          cursor: pointer;
        }

        .error-ok-btn:hover {
          background: #0052cc;
        }

        /* ================= RESPONSIVE ================= */

        @media (max-width: 600px) {

          .components-page-wrapper {
            padding: 12px;
          }

          .component-modal-overlay {
            padding: 10px;
          }

          .component-modal {
            max-width: 100%;

            max-height: 95vh;
          }

          .modal-body-custom {
            padding: 16px;
          }

          .form-row {
            grid-template-columns: 1fr;

            gap: 0;
          }

          .modal-buttons {
            flex-direction: column;
          }

          .btn-proto-save,
          .btn-proto-cancel {
            width: 100%;
          }

          .save-error-overlay {
            padding: 16px;
          }

          .save-error-popup {
            max-width: 100%;
          }
        }

      `}</style>

    </div>
  );
}

export default Components;