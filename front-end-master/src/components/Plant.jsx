import React, { useEffect, useState } from "react";
import plantService from "../services/plantService";

function Plant() {
  const [plants, setPlants] = useState([]);
  const [plant, setPlant] = useState({
    plantId: 0,
    plantName: "",
    plantCode: "",
    isactive: true,
  });

  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadPlants = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await plantService.getPlants();
      setPlants(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Unable to load plants"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlants();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPlant((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      const requestData = {
        plantId: Number(plant.plantId),
        plantName: plant.plantName.trim(),
        plantCode: plant.plantCode.trim(),
        isactive: Boolean(plant.isactive),
      };

      if (isEdit) {
        await plantService.updatePlant(plant.plantId, requestData);
        alert("Plant updated successfully");
      } else {
        await plantService.createPlant(requestData);
        alert("Plant created successfully");
      }

      resetForm();
      await loadPlants();
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
      const response = await plantService.getPlantById(id);
      setPlant({
        plantId: response.data.plantId,
        plantName: response.data.plantName || "",
        plantCode: response.data.plantCode || "",
        isactive: response.data.isactive ?? true,
      });
      setIsEdit(true);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to get plant");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this plant?")) return;
    try {
      setError("");
      await plantService.deletePlant(id);
      alert("Plant deleted successfully");
      await loadPlants();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

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

  return (
    <div className="plant-page-wrapper">
      {error && (
        <div className="alert alert-danger mb-4">
          <strong>Error:</strong> {String(error)}
        </div>
      )}

      <div className="cards-side-by-side">
        {/* Left Card: Form */}
        <div className="left-card-form">
          <div className="prototype-card">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="proto-label">PLANT NAME *</label>
                <input
                  type="text"
                  className="proto-input"
                  name="plantName"
                  placeholder="Enter Plant Name"
                  value={plant.plantName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="proto-label">PLANT CODE *</label>
                <input
                  type="text"
                  className="proto-input"
                  name="plantCode"
                  placeholder="Enter Plant Code"
                  value={plant.plantCode}
                  onChange={handleChange}
                  required
                />
              </div>

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
                  style={{ fontSize: "0.85rem", color: "#475569" }}
                >
                  Active
                </label>
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

        {/* Right Card: Table */}
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
                    plants.map((item) => (
                      <tr key={item.plantId}>
                        <td>{item.plantName}</td>
                        <td>{item.plantCode}</td>
                        <td>
                          <span
                            className={`badge ${
                              item.isactive ? "bg-success" : "bg-secondary"
                            }`}
                            style={{
                              fontWeight: "500",
                              fontSize: "0.75rem",
                            }}
                          >
                            {item.isactive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-link btn-sm p-0 me-3 text-primary text-decoration-none"
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: "500",
                            }}
                            onClick={() => handleEdit(item.plantId)}
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
                            onClick={() => handleDelete(item.plantId)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-5 text-muted">
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