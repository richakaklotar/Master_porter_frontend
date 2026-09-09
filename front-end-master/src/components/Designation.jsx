import React, { useEffect, useState } from "react";
import designationService from "../services/designationService";

function Designation() {
  const [designations, setDesignations] = useState([]);

  const [designation, setDesignation] = useState({
    designationId: 0,
    designationName: "",
    status: "Active",
  });

  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // EXTRACT ID
  // =========================
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

  // =========================
  // EXTRACT NAME
  // =========================
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
  // EXTRACT STATUS
  // =========================
  const extractStatus = (item) => {
    if (!item) return "Active";

    const value = item.status ?? item.Status;

    if (typeof value === "boolean") {
      return value ? "Active" : "Inactive";
    }

    return String(value).toLowerCase() === "inactive"
      ? "Inactive"
      : "Active";
  };

  // =========================
  // GET ERROR MESSAGE
  // =========================
  const getErrorMessage = (err) => {
    if (err?.response?.data?.errors) {
      return Object.values(err.response.data.errors)
        .flat()
        .join(" ");
    }

    return (
      err?.response?.data?.message ||
      err?.response?.data?.title ||
      err?.message ||
      "Something went wrong."
    );
  };

  // =========================
  // GET ALL DESIGNATIONS
  // =========================
  const loadDesignations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await designationService.getDesignations();

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setDesignations(data);
    } catch (err) {
      console.error("Get Error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDesignations();
  }, []);

  // =========================
  // INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setDesignation((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
            ? "Active"
            : "Inactive"
          : value,
    }));

    // Clear error while typing designation name
    if (name === "designationName") {
      setError("");
    }
  };

  // =========================
  // DUPLICATE DESIGNATION NAME
  // =========================
  const isDuplicateDesignationName = (name) => {
    const normalizedName = name.trim().toLowerCase();

    const currentId = Number(
      designation.designationId || 0
    );

    return designations.some((item) => {
      const existingId = extractId(item);

      const existingName = extractName(item)
        .trim()
        .toLowerCase();

      // EDIT MODE:
      // Ignore current record
      if (
        isEdit &&
        existingId === currentId
      ) {
        return false;
      }

      // CREATE / OTHER RECORD:
      // Check duplicate name
      return existingName === normalizedName;
    });
  };

  // =========================
  // CREATE / UPDATE
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = designation.designationName.trim();

    // =========================
    // NAME REQUIRED
    // =========================
    if (!name) {
      setError("Designation name is required.");
      return;
    }

    // =========================
    // DUPLICATE NAME CHECK
    // =========================
    if (isDuplicateDesignationName(name)) {
      setError(
        `Designation "${name}" already exists. Please enter a different designation name.`
      );
      return;
    }

    // =========================
    // STATUS REQUIRED
    // =========================
    if (!designation.status) {
      setError("Status is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      // =========================
      // UPDATE
      // =========================
      if (isEdit) {
        const id = Number(
          designation.designationId
        );

        if (!id || id <= 0) {
          setError(
            "Invalid designation ID. Please click Edit on the table row again."
          );
          return;
        }

        const requestData = {
          id: id,

          designationId: id,
          DesignationId: id,
          DesignationID: id,

          designationName: name,
          DesignationName: name,

          status: designation.status,
          Status: designation.status,
        };

        console.log(
          "Update Designation Request:",
          requestData
        );

        await designationService.updateDesignation(
          id,
          requestData
        );

        alert(
          "Designation updated successfully."
        );
      }

      // =========================
      // CREATE
      // =========================
      else {
        const requestData = {
          designationName: name,
          DesignationName: name,

          status: designation.status,
          Status: designation.status,
        };

        console.log(
          "Create Designation Request:",
          requestData
        );

        await designationService.createDesignation(
          requestData
        );

        alert(
          "Designation created successfully."
        );
      }

      // Reset form
      resetForm();

      // Reload table
      await loadDesignations();
    } catch (err) {
      console.error("Save Error:", err);

      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = (item) => {
    const id = extractId(item);
    const name = extractName(item);
    const status = extractStatus(item);

    console.log(
      "Editing Item:",
      id,
      name,
      status
    );

    if (!id || id <= 0) {
      setError(
        "Cannot edit: Could not read primary key ID from item."
      );
      return;
    }

    setDesignation({
      designationId: id,
      designationName: name,
      status: status,
    });

    setIsEdit(true);
    setError("");
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (item) => {
    const id = extractId(item);

    console.log(
      "Deleting Item ID:",
      id
    );

    if (!id || id <= 0) {
      setError(
        "Invalid designation ID for deletion."
      );
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

      alert(
        "Designation deleted successfully."
      );

      if (
        Number(
          designation.designationId
        ) === id
      ) {
        resetForm();
      }

      await loadDesignations();
    } catch (err) {
      console.error(
        "Delete Error:",
        err
      );

      setError(
        getErrorMessage(err)
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RESET FORM
  // =========================
  const resetForm = () => {
    setDesignation({
      designationId: 0,
      designationName: "",
      status: "Active",
    });

    setIsEdit(false);
    setError("");
  };

  return (
    <div className="plant-page-wrapper">

      {/* =========================
          ERROR
      ========================= */}
      {error && (
        <div className="alert alert-danger mb-4">
          <strong>Error:</strong>{" "}
          {String(error)}
        </div>
      )}

      <div className="cards-side-by-side">

        {/* =========================
            FORM CARD
        ========================= */}
        <div className="left-card-form">
          <div className="prototype-card">

            <form onSubmit={handleSubmit}>

              {/* DESIGNATION NAME */}
              <div className="mb-3">
                <label className="proto-label">
                  DESIGNATION NAME *
                </label>

                <input
                  type="text"
                  className="proto-input"
                  name="designationName"
                  value={
                    designation.designationName
                  }
                  onChange={handleChange}
                  placeholder="Enter designation name"
                  required
                  disabled={saving}
                />
              </div>

              {/* STATUS */}
              <div className="mb-4 status-field">

                <label className="proto-label d-block mb-2">
                  STATUS
                </label>

                <div className="status-control">

                  <input
                    type="checkbox"
                    id="designationStatus"
                    name="status"
                    checked={
                      designation.status ===
                      "Active"
                    }
                    onChange={handleChange}
                    className="status-checkbox"
                    disabled={saving}
                  />

                  <label
                    htmlFor="designationStatus"
                    className="status-text"
                  >
                    {designation.status ===
                    "Active"
                      ? "Active"
                      : "Inactive"}
                  </label>

                </div>
              </div>

              {/* BUTTONS */}
              <div className="d-flex gap-2 pt-1">

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
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>

              </div>

            </form>
          </div>
        </div>

        {/* =========================
            TABLE CARD
        ========================= */}
        <div className="right-card-table">

          <div className="prototype-card p-0 overflow-hidden">

            {loading ? (

              <div
                className="p-4 text-center text-muted"
                style={{
                  fontSize: "0.875rem",
                }}
              >
                Loading designations...
              </div>

            ) : (

              <table className="table-proto">

                <thead>
                  <tr>
                    <th>DESIGNATION</th>

                    <th>STATUS</th>

                    <th className="text-end pe-4">
                      ACTION
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {designations.length > 0 ? (

                    designations.map(
                      (item, index) => {

                        const id =
                          extractId(item);

                        const name =
                          extractName(item);

                        const status =
                          extractStatus(item);

                        const isActive =
                          status === "Active";

                        return (
                          <tr
                            key={
                              id || index
                            }
                          >

                            {/* NAME */}
                            <td>
                              {name}
                            </td>

                            {/* STATUS */}
                            <td>
                              <span
                                className={
                                  isActive
                                    ? "status-active"
                                    : "status-inactive"
                                }
                              >
                                {isActive
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </td>

                            {/* ACTION */}
                            <td className="text-end pe-4">

                              <button
                                type="button"
                                className="btn btn-link btn-sm p-0 me-3 text-primary text-decoration-none"
                                style={{
                                  fontSize:
                                    "0.85rem",
                                  fontWeight:
                                    "500",
                                }}
                                onClick={() =>
                                  handleEdit(
                                    item
                                  )
                                }
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="btn btn-link btn-sm p-0 text-danger text-decoration-none"
                                style={{
                                  fontSize:
                                    "0.85rem",
                                  fontWeight:
                                    "500",
                                }}
                                onClick={() =>
                                  handleDelete(
                                    item
                                  )
                                }
                              >
                                Delete
                              </button>

                            </td>

                          </tr>
                        );
                      }
                    )

                  ) : (

                    <tr>
                      <td
                        colSpan="3"
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

      {/* =========================
          STATUS CSS
      ========================= */}
      <style>
        {`
          .status-field {
            width: 100%;
            text-align: left !important;
          }

          .status-control {
            display: flex;
            align-items: center;
            justify-content: flex-start !important;
            width: 100%;
            text-align: left;
            margin: 0;
            padding: 0;
          }

          .status-checkbox {
            appearance: auto;
            -webkit-appearance: checkbox;
            width: 18px !important;
            height: 18px !important;
            margin: 0 !important;
            padding: 0 !important;
            cursor: pointer;
            flex: 0 0 18px;
          }

          .status-text {
            margin: 0 0 0 8px !important;
            padding: 0 !important;
            cursor: pointer;
            font-size: 0.875rem;
            font-weight: 500;
            line-height: 18px;
            text-align: left;
          }

          .status-active,
          .status-inactive {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
          }

          .status-active {
            background-color: #d1e7dd;
            color: #0f5132;
          }

          .status-inactive {
            background-color: #f8d7da;
            color: #842029;
          }
        `}
      </style>

    </div>
  );
}

export default Designation;