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
    isactive: true,
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
      console.error("GET PLANTS ERROR:", err);

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
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
  };

  // =====================================================
  // RESET FORM
  // =====================================================
  const resetForm = () => {
    setPlant({
      plantId: 0,
      plantName: "",
      plantCode: "",
      isactive: true,
    });

    setIsEdit(false);
    setError("");
  };

  // =====================================================
  // VALIDATION
  // =====================================================
  const validateForm = () => {
    // Plant Name required
    if (!plant.plantName.trim()) {
      setError("Plant Name is required");
      return false;
    }

    // Plant Name maximum 25 characters
    if (plant.plantName.trim().length > 25) {
      setError("Plant Name cannot be more than 25 characters");
      return false;
    }

    // Plant Code required
    if (!plant.plantCode.trim()) {
      setError("Plant Code is required");
      return false;
    }

    // Duplicate Plant Code check
    const duplicate = plants.some((item) => {
      const itemId =
        item.plantId ??
        item.plantID ??
        item.PlantId ??
        item.PlantID ??
        0;

      const itemCode =
        item.plantCode ??
        item.PlantCode ??
        "";

      return (
        itemCode.trim().toLowerCase() ===
          plant.plantCode.trim().toLowerCase() &&
        (!isEdit || Number(itemId) !== Number(plant.plantId))
      );
    });

    if (duplicate) {
      setError(
        `Plant Code "${plant.plantCode.trim()}" already exists`
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

    if (!validateForm()) {
      return;
    }

    try {
      setError("");

      const requestData = {
        plantId: Number(plant.plantId),
        plantName: plant.plantName.trim(),
        plantCode: plant.plantCode.trim(),
        isactive: Boolean(plant.isactive),
      };

      if (isEdit) {
        await plantService.updatePlant(
          Number(plant.plantId),
          requestData
        );

        alert("Plant updated successfully");
      } else {
        await plantService.createPlant({
          plantId: 0,
          plantName: plant.plantName.trim(),
          plantCode: plant.plantCode.trim(),
          isactive: Boolean(plant.isactive),
        });

        alert("Plant created successfully");
      }

      resetForm();
      await loadPlants();
    } catch (err) {
      console.error("SAVE PLANT ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
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
        plantId:
          data.plantId ??
          data.plantID ??
          data.PlantId ??
          data.PlantID ??
          id,

        plantName:
          data.plantName ??
          data.PlantName ??
          "",

        plantCode:
          data.plantCode ??
          data.PlantCode ??
          "",

        isactive:
          data.isactive ??
          data.isActive ??
          data.Isactive ??
          data.IsActive ??
          false,
      });

      setIsEdit(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error("EDIT PLANT ERROR:", err);

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
    if (!window.confirm("Are you sure you want to delete this plant?")) {
      return;
    }

    try {
      setError("");

      await plantService.deletePlant(id);

      alert("Plant deleted successfully");

      if (Number(plant.plantId) === Number(id)) {
        resetForm();
      }

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
  // UI
  // =====================================================
  return (
    <div className="plant-page-wrapper">

      {/* ERROR */}
      {error && (
        <div className="alert alert-danger mb-4">
          <strong>Error:</strong> {String(error)}
        </div>
      )}

      <div className="cards-side-by-side">

        {/* =====================================================
            LEFT - FORM
        ===================================================== */}
        <div className="left-card-form">
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
                  required
                />
              </div>

              {/* ACTIVE */}
              <div className="form-check mb-4">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="isactive"
                  name="isactive"
                  checked={plant.isactive}
                  onChange={handleChange}
                />

                <label
                  className="form-check-label ms-1"
                  htmlFor="isactive"
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
            RIGHT - TABLE
        ===================================================== */}
        <div className="right-card-table">
          <div className="prototype-card p-0 overflow-hidden">

            {loading ? (
              <div
                className="p-4 text-center text-muted"
                style={{ fontSize: "0.875rem" }}
              >
                Loading plants...
              </div>
            ) : (
              <table className="table-proto">

                <thead>
                  <tr>
                    <th>PLANT NAME</th>
                    <th>CODE</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {plants.length > 0 ? (
                    plants.map((item) => {

                      const id =
                        item.plantId ??
                        item.plantID ??
                        item.PlantId ??
                        item.PlantID;

                      const name =
                        item.plantName ??
                        item.PlantName ??
                        "";

                      const code =
                        item.plantCode ??
                        item.PlantCode ??
                        "";

                      const active =
                        item.isactive ??
                        item.isActive ??
                        item.Isactive ??
                        item.IsActive ??
                        false;

                      return (
                        <tr key={id}>

                          <td>{name}</td>

                          <td>{code}</td>

                          <td>
                            <span
                              className={`badge ${
                                Boolean(active)
                                  ? "bg-success"
                                  : "bg-secondary"
                              }`}
                              style={{
                                fontWeight: "500",
                                fontSize: "0.75rem",
                              }}
                            >
                              {Boolean(active)
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>

                          <td>

                            {/* EDIT */}
                            <button
                              type="button"
                              className="btn btn-link btn-sm p-0 me-3 text-primary text-decoration-none"
                              style={{
                                fontSize: "0.85rem",
                                fontWeight: "500",
                              }}
                              onClick={() => handleEdit(id)}
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
                              }}
                              onClick={() => handleDelete(id)}
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
                        colSpan="4"
                        className="text-center py-5 text-muted"
                      >
                        No plants found
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

export default Plant;