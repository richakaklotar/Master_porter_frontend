import React, { useEffect, useState } from "react";
import divisionService from "../services/divisionService";
import plantService from "../services/plantService";

function Division() {
  const [divisions, setDivisions] = useState([]);
  const [plants, setPlants] = useState([]);

  const [division, setDivision] = useState({
    divisionId: 0,
    divisionName: "",
    divisionCode: "",
    plantId: "",
  });

  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // LOAD DIVISIONS
  // =========================
  const loadDivisions = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await divisionService.getDivisions();
      setDivisions(response.data);
    } catch (err) {
      console.error("Load Division Error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load divisions"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD PLANTS
  // =========================
  const loadPlants = async () => {
    try {
      const response = await plantService.getPlants();
      setPlants(response.data);
    } catch (err) {
      console.error("Load Plant Error:", err);
      setError(
        err.response?.data?.message || err.message || "Unable to load plants"
      );
    }
  };

  useEffect(() => {
    loadDivisions();
    loadPlants();
  }, []);

  // =========================
  // INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDivision((previous) => ({
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
        divisionId: Number(division.divisionId),
        divisionName: division.divisionName.trim(),
        divisionCode: division.divisionCode.trim(),
        plantId: Number(division.plantId),
      };

      if (isEdit) {
        await divisionService.updateDivision(
          division.divisionId,
          requestData
        );
        alert("Division updated successfully");
      } else {
        await divisionService.createDivision(requestData);
        alert("Division created successfully");
      }

      resetForm();
      await loadDivisions();
    } catch (err) {
      console.error("Save Division Error:", err);
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
      const response = await divisionService.getDivisionById(id);
      setDivision({
        divisionId: response.data.divisionId,
        divisionName: response.data.divisionName || "",
        divisionCode: response.data.divisionCode || "",
        plantId: response.data.plantId || "",
      });
      setIsEdit(true);
    } catch (err) {
      console.error("Get Division Error:", err);
      setError(
        err.response?.data?.message || err.message || "Unable to get division"
      );
    }
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this division?")) {
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
        err.response?.data?.message || err.message || "Delete failed"
      );
    }
  };

  // =========================
  // RESET
  // =========================
  const resetForm = () => {
    setDivision({
      divisionId: 0,
      divisionName: "",
      divisionCode: "",
      plantId: "",
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
                <label className="proto-label">DIVISION NAME *</label>
                <input
                  type="text"
                  className="proto-input"
                  name="divisionName"
                  value={division.divisionName}
                  onChange={handleChange}
                  placeholder="Enter Division Name"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="proto-label">DIVISION CODE *</label>
                <input
                  type="text"
                  className="proto-input"
                  name="divisionCode"
                  value={division.divisionCode}
                  onChange={handleChange}
                  placeholder="Enter Division Code"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="proto-label">PLANT *</label>
                <select
                  className="proto-input"
                  name="plantId"
                  value={division.plantId}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Plant --</option>
                  {plants.map((plant) => (
                    <option key={plant.plantId} value={plant.plantId}>
                      {plant.plantName}
                    </option>
                  ))}
                </select>
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
          <div className="prototype-card p-0 overflow-hidden">
            {loading ? (
              <div
                className="p-4 text-center text-muted"
                style={{ fontSize: "0.875rem" }}
              >
                Loading divisions...
              </div>
            ) : (
              <table className="table-proto">
                <thead>
                  <tr>
                    <th>DIVISION NAME</th>
                    <th>CODE</th>
                    <th>PLANT</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {divisions.length > 0 ? (
                    divisions.map((item) => {
                      const selectedPlant = plants.find(
                        (p) => p.plantId === item.plantId
                      );

                      return (
                        <tr key={item.divisionId}>
                          <td>{item.divisionName}</td>
                          <td>{item.divisionCode}</td>
                          <td>
                            {selectedPlant
                              ? selectedPlant.plantName
                              : item.plantId}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-link btn-sm p-0 me-3 text-primary text-decoration-none"
                              style={{ fontSize: "0.85rem", fontWeight: "500" }}
                              onClick={() => handleEdit(item.divisionId)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-link btn-sm p-0 text-danger text-decoration-none"
                              style={{ fontSize: "0.85rem", fontWeight: "500" }}
                              onClick={() => handleDelete(item.divisionId)}
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
                        No divisions found
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

export default Division;