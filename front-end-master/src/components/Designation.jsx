import React, { useEffect, useState } from "react";
import designationService from "../services/designationService";

function Designation() {
  const [designations, setDesignations] = useState([]);

  const [designation, setDesignation] = useState({
    designationId: 0,
    designationName: "",
  });

  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Helper function: Safely finds primary key across ALL casing variations
  const extractId = (item) => {
    if (!item) return 0;

    const id =
      item.designationId ??
      item.designationID ??
      item.DesignationId ??
      item.DesignationID ??
      item.id ??
      item.ID ??
      item.Id ??
      0;

    return Number(id);
  };

  // Helper function: Safely finds Designation Name
  const extractName = (item) => {
    if (!item) return "";
    return (
      item.designationName ??
      item.DesignationName ??
      item.designation ??
      item.Designation ??
      ""
    );
  };

  // =========================
  // GET ALL
  // =========================
  const loadDesignations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await designationService.getDesignations();

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      // Debug log to check key names in Console (F12)
      console.log("Loaded API Data Sample:", data[0]);

      setDesignations(data);
    } catch (err) {
      console.error("Get Error:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          err.message ||
          "Unable to load designations"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDesignations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDesignation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // CREATE / UPDATE
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = designation.designationName.trim();

    if (!name) {
      setError("Designation name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (isEdit) {
        const id = Number(designation.designationId);

        if (!id || id <= 0) {
          setError(
            "Invalid designation ID. Please click Edit on the table row again."
          );
          return;
        }

        // Send all common key formats to guarantee backend model-binding match
        const requestData = {
          id: id,
          designationId: id,
          designationName: name,
        };

        await designationService.updateDesignation(id, requestData);
        alert("Designation updated successfully.");
      } else {
        const requestData = {
          designationName: name,
        };

        await designationService.createDesignation(requestData);
        alert("Designation created successfully.");
      }

      resetForm();
      await loadDesignations();
    } catch (err) {
      console.error("Save Error:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          err.message ||
          "Unable to save designation."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // EDIT BUTTON CLICK
  // =========================
  const handleEdit = (item) => {
    const id = extractId(item);
    const name = extractName(item);

    console.log("Editing Item ID:", id, "Name:", name);

    if (!id) {
      setError("Cannot edit: Could not read primary key ID from item.");
      return;
    }

    setDesignation({
      designationId: id,
      designationName: name,
    });

    setIsEdit(true);
    setError("");
  };

  // =========================
  // DELETE BUTTON CLICK
  // =========================
  const handleDelete = async (item) => {
    const id = extractId(item);

    console.log("Deleting Item ID:", id);

    if (!id || id <= 0) {
      setError("Invalid designation ID for deletion.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this designation?"
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      setError("");

      await designationService.deleteDesignation(id);
      alert("Designation deleted successfully.");

      if (Number(designation.designationId) === id) {
        resetForm();
      }

      await loadDesignations();
    } catch (err) {
      console.error("Delete Error:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          err.message ||
          "Unable to delete designation."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDesignation({
      designationId: 0,
      designationName: "",
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
        {/* FORM CARD */}
        <div className="left-card-form">
          <div className="prototype-card">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="proto-label">DESIGNATION NAME *</label>
                <input
                  type="text"
                  className="proto-input"
                  name="designationName"
                  value={designation.designationName}
                  onChange={handleChange}
                  placeholder="Enter designation name"
                  required
                  disabled={saving}
                />
              </div>

              <div className="d-flex gap-2 pt-1">
                <button
                  type="submit"
                  className="btn-proto-save"
                  disabled={saving}
                >
                  {saving ? "Saving..." : isEdit ? "Update" : "Save"}
                </button>

                <button
                  type="button"
                  className="btn-proto-cancel"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* TABLE CARD */}
        <div className="right-card-table">
          <div className="prototype-card p-0 overflow-hidden">
            {loading ? (
              <div
                className="p-4 text-center text-muted"
                style={{ fontSize: "0.875rem" }}
              >
                Loading designations...
              </div>
            ) : (
              <table className="table-proto">
                <thead>
                  <tr>
                    <th>DESIGNATION</th>
                    <th className="text-end pe-4">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {designations.length > 0 ? (
                    designations.map((item, index) => {
                      const id = extractId(item);
                      const name = extractName(item);

                      return (
                        <tr key={id || index}>
                          <td>{name}</td>
                          <td className="text-end pe-4">
                            <button
                              type="button"
                              className="btn btn-link btn-sm p-0 me-3 text-primary text-decoration-none"
                              style={{
                                fontSize: "0.85rem",
                                fontWeight: "500",
                              }}
                              onClick={() => handleEdit(item)}
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
                              onClick={() => handleDelete(item)}
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
                        colSpan="2"
                        className="text-center py-5 text-muted"
                      >
                        No designations found
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

export default Designation;