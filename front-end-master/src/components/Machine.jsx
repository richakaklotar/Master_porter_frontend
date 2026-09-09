import React, { useEffect, useState } from "react";
import machineService from "../services/machineService";
import plantService from "../services/plantService";
import divisionService from "../services/divisionService";

function Machine() {
  const [machines, setMachines] = useState([]);
  const [plants, setPlants] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [filteredDivisions, setFilteredDivisions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [machine, setMachine] = useState({
    machineID: 0,
    machineName: "",
    machineCode: "",
    status: "Active",
    plantId: "",
    divisionId: "",
  });

  const [isEdit, setIsEdit] = useState(false);

  const parseApiError = (err) => {
    const apiData = err.response?.data;
    if (apiData?.errors && typeof apiData.errors === "object") {
      return Object.values(apiData.errors).flat().join(" ");
    }
    return (
      apiData?.message ||
      apiData?.error ||
      apiData?.title ||
      err.message ||
      "An unexpected error occurred."
    );
  };

  // =========================
  // Load All Data
  // =========================
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [machineRes, plantRes, divisionRes] = await Promise.allSettled([
        machineService.getMachines(),
        plantService.getPlants(),
        divisionService.getDivisions(),
      ]);

      if (machineRes.status === "fulfilled") {
        setMachines(machineRes.value.data || []);
      }

      if (plantRes.status === "fulfilled") {
        setPlants(plantRes.value.data || []);
      }

      if (divisionRes.status === "fulfilled") {
        const divData = divisionRes.value.data || [];
        setDivisions(divData);
        setFilteredDivisions(divData);
      }
    } catch (err) {
      console.error("MACHINE LOAD ERROR:", err);
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================
  // Handle Input Change (Auto-Select Logic Included)
  // =========================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (error) setError("");

    if (name === "plantId") {
      const selectedPlantId = value;

      // Filter divisions based on plantId field if backend provides relation
      const relatedDivisions = divisions.filter((div) => {
        const divPlantId = div.plantId ?? div.PlantId ?? div.plantID ?? div.PlantID;
        return !selectedPlantId || String(divPlantId) === String(selectedPlantId);
      });

      setFilteredDivisions(relatedDivisions.length > 0 ? relatedDivisions : divisions);

      // Automatic Selection Logic
      let autoDivisionId = "";

      // 1. Check if chosen Plant model itself contains division ID
      const chosenPlant = plants.find(
        (p) => String(p.plantID ?? p.PlantID ?? p.plantId ?? p.id) === String(selectedPlantId)
      );
      
      const directDivId = chosenPlant?.divisionId ?? chosenPlant?.DivisionId ?? chosenPlant?.divisionID;

      if (directDivId) {
        autoDivisionId = String(directDivId);
      } else if (relatedDivisions.length > 0 && selectedPlantId) {
        // 2. Otherwise pick the first matching division automatically
        const firstDivId = relatedDivisions[0].divisionId ?? relatedDivisions[0].DivisionId ?? relatedDivisions[0].id;
        autoDivisionId = String(firstDivId);
      }

      setMachine((prev) => ({
        ...prev,
        plantId: selectedPlantId,
        divisionId: autoDivisionId || prev.divisionId,
      }));
      return;
    }

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

  // =========================
  // Validate Machine
  // =========================
  const validateMachine = () => {
    const machineName = machine.machineName.trim();
    const machineCode = machine.machineCode.trim();

    if (!machineName) {
      setError("Machine Name is required.");
      return false;
    }

    if (!machineCode) {
      setError("Machine Code is required.");
      return false;
    }

    if (!machine.plantId) {
      setError("Please select Plant.");
      return false;
    }

    if (!machine.divisionId) {
      setError("Please select Division.");
      return false;
    }

    if (machineName.toLowerCase() === machineCode.toLowerCase()) {
      setError("Machine Name and Machine Code cannot be the same.");
      return false;
    }

    const currentId = Number(machine.machineID || 0);

    const duplicateName = machines.some((item) => {
      const itemId = Number(item.machineID ?? item.MachineID ?? 0);
      return (
        itemId !== currentId &&
        String(item.machineName ?? item.MachineName ?? "")
          .trim()
          .toLowerCase() === machineName.toLowerCase()
      );
    });

    if (duplicateName) {
      setError("Machine Name already exists.");
      return false;
    }

    const duplicateCode = machines.some((item) => {
      const itemId = Number(item.machineID ?? item.MachineID ?? 0);
      return (
        itemId !== currentId &&
        String(item.machineCode ?? item.MachineCode ?? "")
          .trim()
          .toLowerCase() === machineCode.toLowerCase()
      );
    });

    if (duplicateCode) {
      setError("Machine Code already exists.");
      return false;
    }

    return true;
  };

  // =========================
  // Submit
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!validateMachine()) {
      return;
    }

    try {
      const requestData = {
        machineID: Number(machine.machineID || 0),
        machineName: machine.machineName.trim(),
        machineCode: machine.machineCode.trim(),
        status: machine.status || "Active",
        plantId: Number(machine.plantId),
        divisionId: Number(machine.divisionId),
      };

      if (isEdit) {
        await machineService.updateMachine(
          Number(machine.machineID),
          requestData
        );
        alert("Machine updated successfully.");
      } else {
        await machineService.createMachine(requestData);
        alert("Machine created successfully.");
      }

      resetForm();
      await loadData();
    } catch (err) {
      console.error("SAVE ERROR:", err.response?.data);
      setError(parseApiError(err));
    }
  };

  // =========================
  // Edit
  // =========================
  const handleEdit = async (id) => {
    try {
      setError("");

      const response = await machineService.getMachineById(id);
      const data = response.data;

      const pId = data.plantId ?? data.PlantId ?? "";
      const dId = data.divisionId ?? data.DivisionId ?? "";

      setMachine({
        machineID: data.machineID ?? data.MachineID ?? id,
        machineName: data.machineName ?? data.MachineName ?? "",
        machineCode: data.machineCode ?? data.MachineCode ?? "",
        status: data.status ?? data.Status ?? "Active",
        plantId: pId,
        divisionId: dId,
      });

      // Filter divisions list on edit mode
      const relatedDivisions = divisions.filter((div) => {
        const divPlantId = div.plantId ?? div.PlantId ?? div.plantID ?? div.PlantID;
        return !pId || String(divPlantId) === String(pId);
      });
      setFilteredDivisions(relatedDivisions.length > 0 ? relatedDivisions : divisions);

      setIsEdit(true);
    } catch (err) {
      console.error("GET BY ID ERROR:", err);
      setError(parseApiError(err));
    }
  };

  // =========================
  // Delete
  // =========================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this machine?")) {
      return;
    }

    try {
      setError("");

      await machineService.deleteMachine(id);
      alert("Machine deleted successfully.");

      await loadData();
    } catch (err) {
      console.error("DELETE ERROR:", err);
      setError(parseApiError(err));
    }
  };

  // =========================
  // Reset Form
  // =========================
  const resetForm = () => {
    setMachine({
      machineID: 0,
      machineName: "",
      machineCode: "",
      status: "Active",
      plantId: "",
      divisionId: "",
    });

    setFilteredDivisions(divisions);
    setIsEdit(false);
    setError("");
  };

  const getPlantName = (pId) => {
    const plant = plants.find(
      (p) => Number(p.plantID ?? p.PlantID ?? p.plantId ?? p.id) === Number(pId)
    );
    return plant?.plantName ?? plant?.PlantName ?? "-";
  };

  const getDivisionName = (dId) => {
    const division = divisions.find(
      (d) => Number(d.divisionId ?? d.DivisionId ?? d.id) === Number(dId)
    );
    return division?.divisionName ?? division?.DivisionName ?? "-";
  };

  return (
    <div
      className="plant-page-wrapper"
      style={{
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      {error && (
        <div
          className="alert alert-danger mb-4"
          style={{
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
            overflowWrap: "anywhere",
          }}
        >
          <strong>Error:</strong> {String(error)}
        </div>
      )}

      <div
        className="cards-side-by-side"
        style={{
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        <div
          className="left-card-form"
          style={{
            minWidth: 0,
            maxWidth: "100%",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
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

              {/* PLANT SELECT */}
              <div className="mb-3">
                <label className="proto-label">PLANT *</label>
                <select
                  className="proto-input"
                  name="plantId"
                  value={machine.plantId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Plant</option>
                  {plants.map((plant) => {
                    const id = plant.plantID ?? plant.PlantID ?? plant.plantId ?? plant.id;
                    const name = plant.plantName ?? plant.PlantName ?? plant.name;
                    return (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* DIVISION SELECT (AUTO SELECTED & FILTERED) */}
              <div className="mb-3">
                <label className="proto-label">DIVISION *</label>
                <select
                  className="proto-input"
                  name="divisionId"
                  value={machine.divisionId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Division</option>
                  {filteredDivisions.map((division) => {
                    const id = division.divisionId ?? division.DivisionId ?? division.id;
                    const name = division.divisionName ?? division.DivisionName ?? division.name;
                    return (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    );
                  })}
                </select>
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
                <label className="form-check-label ms-1" htmlFor="status">
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

        <div
          className="right-card-table"
          style={{
            minWidth: 0,
            width: "100%",
            maxWidth: "100%",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <div className="prototype-card p-0">
            {loading ? (
              <div className="p-4 text-center text-muted">
                Loading machines...
              </div>
            ) : (
              <div style={{ width: "100%", overflowX: "auto" }}>
                <table
                  className="table-proto"
                  style={{
                    width: "100%",
                    minWidth: "700px",
                    tableLayout: "fixed",
                    margin: 0,
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ width: "18%" }}>MACHINE NAME</th>
                      <th style={{ width: "13%" }}>CODE</th>
                      <th style={{ width: "17%" }}>PLANT</th>
                      <th style={{ width: "17%" }}>DIVISION</th>
                      <th style={{ width: "13%" }}>STATUS</th>
                      <th style={{ width: "22%" }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {machines.length > 0 ? (
                      machines.map((item) => {
                        const mId = item.machineID ?? item.MachineID ?? item.id;
                        const mName = item.machineName ?? item.MachineName;
                        const mCode = item.machineCode ?? item.MachineCode;
                        const pId = item.plantId ?? item.PlantId;
                        const dId = item.divisionId ?? item.DivisionId;
                        const mStatus = item.status ?? item.Status ?? "Active";

                        return (
                          <tr key={mId}>
                            <td>{mName}</td>
                            <td>{mCode}</td>
                            <td>{getPlantName(pId)}</td>
                            <td>{getDivisionName(dId)}</td>
                            <td>
                              <span
                                className={`badge ${
                                  mStatus === "Active"
                                    ? "bg-success"
                                    : "bg-secondary"
                                }`}
                              >
                                {mStatus}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-link btn-sm p-0 me-2 text-primary text-decoration-none"
                                onClick={() => handleEdit(mId)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn btn-link btn-sm p-0 text-danger text-decoration-none"
                                onClick={() => handleDelete(mId)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-5 text-muted">
                          No machines found
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

export default Machine;