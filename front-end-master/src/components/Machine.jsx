import React, { useEffect, useState } from "react";
import machineService from "../services/machineService";

function Machine() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [machine, setMachine] = useState({
    machineID: 0,
    machineName: "",
    machineCode: "",
    status: "Active",
  });

  const [isEdit, setIsEdit] = useState(false);

  const loadMachines = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await machineService.getMachines();
      setMachines(response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Unable to load machines"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMachines();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMachine((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
            ? "Active"
            : "Inactive"
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!machine.machineName.trim()) {
      setError("Machine Name is required");
      return;
    }

    if (!machine.machineCode.trim()) {
      setError("Machine Code is required");
      return;
    }

    try {
      setError("");

      const requestData = {
        machineID: Number(machine.machineID),
        machineName: machine.machineName.trim(),
        machineCode: machine.machineCode.trim(),
        status: machine.status || "Active",
      };

      if (isEdit) {
        await machineService.updateMachine(machine.machineID, requestData);
        alert("Machine updated successfully");
      } else {
        await machineService.createMachine(requestData);
        alert("Machine created successfully");
      }

      resetForm();
      await loadMachines();
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
      const response = await machineService.getMachineById(id);
      const data = response.data;

      setMachine({
        machineID: data.machineID,
        machineName: data.machineName || "",
        machineCode: data.machineCode || "",
        status: data.status || "Active",
      });

      setIsEdit(true);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to get machine");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this machine?")) {
      return;
    }

    try {
      setError("");
      await machineService.deleteMachine(id);
      alert("Machine deleted successfully");
      await loadMachines();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  const resetForm = () => {
    setMachine({
      machineID: 0,
      machineName: "",
      machineCode: "",
      status: "Active",
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

      {/* Flex container side-by-side positioning */}
      <div className="cards-side-by-side">
        {/* Left Card: Form */}
        <div className="left-card-form">
          <div className="prototype-card">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="proto-label">MACHINE NAME *</label>
                <input
                  type="text"
                  className="proto-input"
                  name="machineName"
                  value={machine.machineName}
                  onChange={handleChange}
                  placeholder="Enter Machine Name"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="proto-label">MACHINE CODE *</label>
                <input
                  type="text"
                  className="proto-input"
                  name="machineCode"
                  value={machine.machineCode}
                  onChange={handleChange}
                  placeholder="Enter Machine Code"
                  required
                />
              </div>

              <div className="form-check mb-4">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="status"
                  name="status"
                  checked={machine.status === "Active"}
                  onChange={handleChange}
                />
                <label
                  className="form-check-label ms-1"
                  htmlFor="status"
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
                Loading machines...
              </div>
            ) : (
              <table className="table-proto">
                <thead>
                  <tr>
                    <th>MACHINE NAME</th>
                    <th>CODE</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {machines.length > 0 ? (
                    machines.map((item) => (
                      <tr key={item.machineID}>
                        <td>{item.machineName}</td>
                        <td>{item.machineCode}</td>
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
                            }}
                          >
                            {item.status}
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
                            onClick={() => handleEdit(item.machineID)}
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
                            onClick={() => handleDelete(item.machineID)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-5 text-muted">
                        No machines found
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

export default Machine;