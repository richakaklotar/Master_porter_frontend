import React, { useEffect, useState } from "react";
import plantService from "../services/plantService";

function Plant() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [plant, setPlant] = useState({
    plantId: 0,
    plantName: "",
    plantCode: "",
    status: "Active",
  });

  const [isEdit, setIsEdit] = useState(false);

  // =====================================================
  // LOAD PLANTS
  // =====================================================
  const loadPlants = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await plantService.getPlants();

      setPlants(response.data || []);
    } catch (err) {
      console.error("LOAD PLANTS ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          err.message ||
          "Unable to load plants"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================
  useEffect(() => {
    loadPlants();
  }, []);

  // =====================================================
  // HANDLE CHANGE
  // =====================================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setPlant((prev) => ({
      ...prev,
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
  // CHECK DUPLICATE PLANT NAME
  // =====================================================
  const isDuplicatePlantName = () => {
    const enteredName = plant.plantName.trim().toLowerCase();

    return plants.some((item) => {
      const existingName = (item.plantName || "")
        .trim()
        .toLowerCase();

      // During edit, ignore the current plant itself
      if (
        isEdit &&
        Number(item.plantId) === Number(plant.plantId)
      ) {
        return false;
      }

      return existingName === enteredName;
    });
  };

  // =====================================================
  // HANDLE SUBMIT - CREATE / UPDATE
  // =====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ===================================================
    // VALIDATION
    // ===================================================

    if (!plant.plantName.trim()) {
      setError("Plant Name is required");
      return;
    }

    if (!plant.plantCode.trim()) {
      setError("Plant Code is required");
      return;
    }

    // ===================================================
    // DUPLICATE PLANT NAME CHECK
    // ===================================================

    if (isDuplicatePlantName()) {
      setError(
        `Plant Name "${plant.plantName.trim()}" already exists. Please enter a different Plant Name.`
      );
      return;
    }

    try {
      setError("");

      const requestData = {
        plantId: Number(plant.plantId),
        plantName: plant.plantName.trim(),
        plantCode: plant.plantCode.trim(),
        status: plant.status || "Active",
      };

      // =================================================
      // UPDATE
      // =================================================
      if (isEdit) {
        await plantService.updatePlant(
          plant.plantId,
          requestData
        );

        alert("Plant updated successfully");
      }

      // =================================================
      // CREATE
      // =================================================
      else {
        await plantService.createPlant(requestData);

        alert("Plant created successfully");
      }

      resetForm();
      await loadPlants();
    } catch (err) {
      console.error("PLANT SAVE ERROR:", err);

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

      const response = await plantService.getPlantById(id);

      const data = response.data;

      setPlant({
        plantId: data.plantId,
        plantName: data.plantName || "",
        plantCode: data.plantCode || "",
        status: data.status || "Active",
      });

      setIsEdit(true);
    } catch (err) {
      console.error("GET PLANT ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          err.message ||
          "Unable to get plant"
      );
    }
  };

  // =====================================================
  // DELETE
  // =====================================================
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this plant?"
      )
    ) {
      return;
    }

    try {
      setError("");

      await plantService.deletePlant(id);

      alert("Plant deleted successfully");

      await loadPlants();
    } catch (err) {
      console.error("DELETE PLANT ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          err.message ||
          "Delete failed"
      );
    }
  };

  // =====================================================
  // RESET FORM
  // =====================================================
  const resetForm = () => {
    setPlant({
      plantId: 0,
      plantName: "",
      plantCode: "",
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
          FLEX CONTAINER
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
            LEFT CARD - FORM
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

              {/* PLANT NAME */}
              <div className="mb-3">
                <label className="proto-label">
                  PLANT NAME *
                </label>

                <input
                  type="text"
                  className="proto-input"
                  name="plantName"
                  value={plant.plantName}
                  onChange={handleChange}
                  placeholder="Enter Plant Name"
                  maxLength={25}
                  required
                />
              </div>

              {/* PLANT CODE */}
              <div className="mb-3">
                <label className="proto-label">
                  PLANT CODE *
                </label>

                <input
                  type="text"
                  className="proto-input"
                  name="plantCode"
                  value={plant.plantCode}
                  onChange={handleChange}
                  placeholder="Enter Plant Code"
                  maxLength={25}
                  required
                />
              </div>

              {/* STATUS */}
              <div className="form-check mb-4">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="status"
                  name="status"
                  checked={plant.status === "Active"}
                  onChange={handleChange}
                />

                <label
                  className="form-check-label ms-1"
                  htmlFor="status"
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
            RIGHT CARD - TABLE
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
                Loading plants...
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
                    minWidth: "550px",
                    tableLayout: "fixed",
                    marginBottom: 0,
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          width: "32%",
                          whiteSpace: "nowrap",
                        }}
                      >
                        PLANT NAME
                      </th>

                      <th
                        style={{
                          width: "23%",
                          whiteSpace: "nowrap",
                        }}
                      >
                        CODE
                      </th>

                      <th
                        style={{
                          width: "20%",
                          whiteSpace: "nowrap",
                        }}
                      >
                        STATUS
                      </th>

                      <th
                        style={{
                          width: "25%",
                          minWidth: "135px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ACTION
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {plants.length > 0 ? (
                      plants.map((item) => (
                        <tr key={item.plantId}>

                          {/* PLANT NAME */}
                          <td
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.plantName}
                          </td>

                          {/* CODE */}
                          <td
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.plantCode}
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
                                }}
                                onClick={() =>
                                  handleEdit(item.plantId)
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
                                }}
                                onClick={() =>
                                  handleDelete(item.plantId)
                                }
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
                          colSpan="4"
                          className="text-center py-5 text-muted"
                        >
                          No plants found
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

export default Plant;