import React, { useEffect, useState } from "react";
import divisionService from "../services/divisionService";
import plantService from "../services/plantService";

function Division() {
  const [divisions, setDivisions] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [division, setDivision] = useState({
    divisionId: 0,
    divisionName: "",
    divisionCode: "",
    plantId: "",
    status: "Active",
  });

  const [isEdit, setIsEdit] = useState(false);

  // =====================================================
  // LOAD DIVISIONS
  // =====================================================
  const loadDivisions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await divisionService.getDivisions();

      setDivisions(response.data || []);
    } catch (err) {
      console.error("Load Division Error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          err.message ||
          "Unable to load divisions"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD PLANTS
  // =====================================================
  const loadPlants = async () => {
    try {
      const response = await plantService.getPlants();

      setPlants(response.data || []);
    } catch (err) {
      console.error("Load Plant Error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          err.message ||
          "Unable to load plants"
      );
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================
  useEffect(() => {
    loadDivisions();
    loadPlants();
  }, []);

  // =====================================================
  // INPUT CHANGE
  // =====================================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setDivision((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
            ? "Active"
            : "Inactive"
          : value,
    }));

    // Clear previous error while typing
    setError("");
  };

  // =====================================================
  // CHECK DUPLICATE DIVISION NAME
  // =====================================================
  const isDuplicateDivisionName = () => {
    const enteredName = division.divisionName
      .trim()
      .toLowerCase();

    return divisions.some((item) => {
      const existingName = (item.divisionName || "")
        .trim()
        .toLowerCase();

      // Edit વખતે current record ignore કરો
      if (
        isEdit &&
        Number(item.divisionId) === Number(division.divisionId)
      ) {
        return false;
      }

      return existingName === enteredName;
    });
  };

  // =====================================================
  // CHECK DUPLICATE DIVISION CODE
  // =====================================================
  const isDuplicateDivisionCode = () => {
    const enteredCode = division.divisionCode
      .trim()
      .toLowerCase();

    return divisions.some((item) => {
      const existingCode = (item.divisionCode || "")
        .trim()
        .toLowerCase();

      // Edit વખતે current record ignore કરો
      if (
        isEdit &&
        Number(item.divisionId) === Number(division.divisionId)
      ) {
        return false;
      }

      return existingCode === enteredCode;
    });
  };

  // =====================================================
  // CREATE / UPDATE
  // =====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ===================================================
    // BASIC VALIDATION
    // ===================================================

    if (!division.divisionName.trim()) {
      setError("Division Name is required");
      return;
    }

    if (!division.divisionCode.trim()) {
      setError("Division Code is required");
      return;
    }

    if (!division.plantId) {
      setError("Plant is required");
      return;
    }

    // ===================================================
    // DUPLICATE DIVISION NAME
    // ===================================================

    if (isDuplicateDivisionName()) {
      setError(
        `Division Name "${division.divisionName.trim()}" already exists. Please enter a different Division Name.`
      );
      return;
    }

    // ===================================================
    // DUPLICATE DIVISION CODE
    // ===================================================

    if (isDuplicateDivisionCode()) {
      setError(
        `Division Code "${division.divisionCode.trim()}" already exists. Please enter a different Division Code.`
      );
      return;
    }

    try {
      setError("");

      const requestData = {
        divisionId: Number(division.divisionId),
        divisionName: division.divisionName.trim(),
        divisionCode: division.divisionCode.trim(),
        plantId: Number(division.plantId),
        status: division.status || "Active",
      };

      // =================================================
      // UPDATE
      // =================================================
      if (isEdit) {
        await divisionService.updateDivision(
          division.divisionId,
          requestData
        );

        alert("Division updated successfully");
      }

      // =================================================
      // CREATE
      // =================================================
      else {
        await divisionService.createDivision(requestData);

        alert("Division created successfully");
      }

      resetForm();
      await loadDivisions();
    } catch (err) {
      console.error("Save Division Error:", err);

      setError(
        err.response?.data?.title ||
          err.response?.data?.message ||
          err.message ||
          "Something went wrong"
      );
    }
  };

  // =====================================================
  // EDIT
  // =====================================================
  const handleEdit = async (id) => {
    try {
      setError("");

      const response = await divisionService.getDivisionById(id);

      const data = response.data;

      setDivision({
        divisionId: data.divisionId,
        divisionName: data.divisionName || "",
        divisionCode: data.divisionCode || "",
        plantId: data.plantId || "",
        status: data.status || "Active",
      });

      setIsEdit(true);
    } catch (err) {
      console.error("Get Division Error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          err.message ||
          "Unable to get division"
      );
    }
  };

  // =====================================================
  // DELETE
  // =====================================================
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this division?"
      )
    ) {
      return;
    }

    try {
      setError("");

      await divisionService.deleteDivision(id);

      alert("Division deleted successfully");

      await loadDivisions();
    } catch (err) {
      console.error("Delete Division Error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          err.message ||
          "Delete failed"
      );
    }
  };

  // =====================================================
  // RESET
  // =====================================================
  const resetForm = () => {
    setDivision({
      divisionId: 0,
      divisionName: "",
      divisionCode: "",
      plantId: "",
      status: "Active",
    });

    setIsEdit(false);
    setError("");
  };

  // =====================================================
  // UI
  // =====================================================
  return (
    <div
      className="plant-page-wrapper"
      style={{
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      {/* =====================================================
          ERROR
      ===================================================== */}
      {error && (
        <div className="alert alert-danger mb-4">
          <strong>Error:</strong> {String(error)}
        </div>
      )}

      {/* =====================================================
          SIDE BY SIDE
      ===================================================== */}
      <div
        className="cards-side-by-side"
        style={{
          width: "100%",
          display: "flex",
          gap: "20px",
          alignItems: "flex-start",
        }}
      >
        {/* =====================================================
            LEFT FORM CARD
        ===================================================== */}
        <div
          className="left-card-form"
          style={{
            flex: "0 0 32%",
            minWidth: 0,
          }}
        >
          <div className="prototype-card">
            <form onSubmit={handleSubmit}>

              {/* DIVISION NAME */}
              <div className="mb-3">
                <label className="proto-label">
                  DIVISION NAME *
                </label>

                <input
                  type="text"
                  className="proto-input"
                  name="divisionName"
                  value={division.divisionName}
                  onChange={handleChange}
                  placeholder="Enter Division Name"
                  maxLength={25}
                  required
                />
              </div>

              {/* DIVISION CODE */}
              <div className="mb-3">
                <label className="proto-label">
                  DIVISION CODE *
                </label>

                <input
                  type="text"
                  className="proto-input"
                  name="divisionCode"
                  value={division.divisionCode}
                  onChange={handleChange}
                  placeholder="Enter Division Code"
                  maxLength={25}
                  required
                />
              </div>

              {/* PLANT */}
              <div className="mb-3">
                <label className="proto-label">
                  PLANT *
                </label>

                <select
                  className="proto-input"
                  name="plantId"
                  value={division.plantId}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    -- Select Plant --
                  </option>

                  {plants.map((plant) => (
                    <option
                      key={plant.plantId}
                      value={plant.plantId}
                    >
                      {plant.plantName}
                    </option>
                  ))}
                </select>
              </div>

              {/* STATUS */}
              <div className="form-check mb-4">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="divisionStatus"
                  name="status"
                  checked={division.status === "Active"}
                  onChange={handleChange}
                />

                <label
                  className="form-check-label ms-1"
                  htmlFor="divisionStatus"
                  style={{
                    fontSize: "0.85rem",
                    color: "#475569",
                  }}
                >
                  Active
                </label>
              </div>

              {/* BUTTONS */}
              <div className="d-flex gap-2 pt-1">

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

        {/* =====================================================
            RIGHT TABLE CARD
        ===================================================== */}
        <div
          className="right-card-table"
          style={{
            flex: "1 1 68%",
            minWidth: 0,
            maxWidth: "68%",
          }}
        >
          <div
            className="prototype-card p-0"
            style={{
              width: "100%",
              maxWidth: "100%",
              overflow: "hidden",
            }}
          >
            {loading ? (
              <div
                className="p-4 text-center text-muted"
                style={{
                  fontSize: "0.875rem",
                }}
              >
                Loading divisions...
              </div>
            ) : (
              <div
                style={{
                  width: "100%",
                  overflowX: "auto",
                  overflowY: "hidden",
                }}
              >
                <table
                  className="table-proto"
                  style={{
                    width: "100%",
                    minWidth: "650px",
                    tableLayout: "fixed",
                    marginBottom: 0,
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          width: "24%",
                          whiteSpace: "nowrap",
                        }}
                      >
                        DIVISION NAME
                      </th>

                      <th
                        style={{
                          width: "14%",
                          whiteSpace: "nowrap",
                        }}
                      >
                        CODE
                      </th>

                      <th
                        style={{
                          width: "22%",
                          whiteSpace: "nowrap",
                        }}
                      >
                        PLANT
                      </th>

                      <th
                        style={{
                          width: "16%",
                          whiteSpace: "nowrap",
                        }}
                      >
                        STATUS
                      </th>

                      <th
                        style={{
                          width: "24%",
                          minWidth: "135px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ACTION
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {divisions.length > 0 ? (
                      divisions.map((item) => {
                        const selectedPlant = plants.find(
                          (p) =>
                            Number(p.plantId) ===
                            Number(item.plantId)
                        );

                        return (
                          <tr key={item.divisionId}>

                            {/* DIVISION NAME */}
                            <td
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item.divisionName}
                            </td>

                            {/* CODE */}
                            <td
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item.divisionCode}
                            </td>

                            {/* PLANT */}
                            <td
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {selectedPlant
                                ? selectedPlant.plantName
                                : item.plantId}
                            </td>

                            {/* STATUS */}
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
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {item.status || "Inactive"}
                              </span>
                            </td>

                            {/* ACTION */}
                            <td
                              style={{
                                width: "135px",
                                minWidth: "135px",
                                padding: "10px 8px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-start",
                                  gap: "12px",
                                  width: "100%",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {/* EDIT */}
                                <button
                                  type="button"
                                  className="btn btn-link btn-sm p-0 text-primary text-decoration-none"
                                  style={{
                                    fontSize: "0.85rem",
                                    fontWeight: "500",
                                    whiteSpace: "nowrap",
                                    flexShrink: 0,
                                    display: "inline-block",
                                  }}
                                  onClick={() =>
                                    handleEdit(
                                      item.divisionId
                                    )
                                  }
                                >
                                  Edit
                                </button>

                                {/* DELETE */}
                                <button
                                  type="button"
                                  className="btn btn-link btn-sm p-0 text-danger text-decoration-none"
                                  style={{
                                    fontSize: "0.85rem",
                                    fontWeight: "500",
                                    whiteSpace: "nowrap",
                                    flexShrink: 0,
                                    display: "inline-block",
                                  }}
                                  onClick={() =>
                                    handleDelete(
                                      item.divisionId
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
                          colSpan="5"
                          className="text-center py-5 text-muted"
                        >
                          No divisions found
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

export default Division;