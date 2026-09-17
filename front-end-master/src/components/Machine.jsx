import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

import machineService from "../services/machineService";
import plantService from "../services/plantService";
import divisionService from "../services/divisionService";

function Machine() {
  // =========================
  // DATA STATES
  // =========================
  const [machines, setMachines] = useState([]);
  const [plants, setPlants] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [filteredDivisions, setFilteredDivisions] = useState([]);

  // =========================
  // UI STATES
  // =========================
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // MACHINE FORM
  // =========================
  const [machine, setMachine] = useState({
    machineID: 0,
    machineName: "",
    machineCode: "",
    status: "Active",
    plantId: "",
    divisionId: "",
  });

  const [isEdit, setIsEdit] = useState(false);

  // =========================
  // QR MODAL
  // =========================
  const [selectedMachine, setSelectedMachine] = useState(null);

  // =========================
  // API ERROR PARSER
  // =========================
  const parseApiError = (err) => {
    const apiData = err.response?.data;

    if (apiData?.errors && typeof apiData.errors === "object") {
      return Object.values(apiData.errors)
        .flat()
        .join(" ");
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
  // LOAD ALL DATA
  // =========================
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        machineRes,
        plantRes,
        divisionRes,
      ] = await Promise.allSettled([
        machineService.getMachines(),
        plantService.getPlants(),
        divisionService.getDivisions(),
      ]);

      // Machines
      if (machineRes.status === "fulfilled") {
        setMachines(machineRes.value.data || []);
      } else {
        console.error(
          "MACHINE LOAD ERROR:",
          machineRes.reason
        );
        setError(parseApiError(machineRes.reason));
      }

      // Plants
      if (plantRes.status === "fulfilled") {
        setPlants(plantRes.value.data || []);
      } else {
        console.error(
          "PLANT LOAD ERROR:",
          plantRes.reason
        );
      }

      // Divisions
      if (divisionRes.status === "fulfilled") {
        const divData = divisionRes.value.data || [];

        setDivisions(divData);
        setFilteredDivisions(divData);
      } else {
        console.error(
          "DIVISION LOAD ERROR:",
          divisionRes.reason
        );
      }
    } catch (err) {
      console.error("MACHINE LOAD ERROR:", err);
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    loadData();
  }, []);

  // =========================
  // HANDLE INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    if (error) {
      setError("");
    }

    // =========================
    // PLANT CHANGE
    // =========================
    if (name === "plantId") {
      const selectedPlantId = value;

      // Find related divisions
      const relatedDivisions = divisions.filter((div) => {
        const divPlantId =
          div.plantId ??
          div.PlantId ??
          div.plantID ??
          div.PlantID;

        return (
          !selectedPlantId ||
          String(divPlantId) === String(selectedPlantId)
        );
      });

      setFilteredDivisions(
        relatedDivisions.length > 0
          ? relatedDivisions
          : divisions
      );

      // =========================
      // AUTO SELECT FIRST DIVISION
      // =========================
      let autoDivisionId = "";

      const chosenPlant = plants.find((p) => {
        const plantId =
          p.plantID ??
          p.PlantID ??
          p.plantId ??
          p.id;

        return (
          String(plantId) ===
          String(selectedPlantId)
        );
      });

      // If plant has direct division relation
      const directDivId =
        chosenPlant?.divisionId ??
        chosenPlant?.DivisionId ??
        chosenPlant?.divisionID;

      if (directDivId) {
        autoDivisionId = String(directDivId);
      }

      // Otherwise select first related division
      else if (
        relatedDivisions.length > 0 &&
        selectedPlantId
      ) {
        const firstDivision =
          relatedDivisions[0];

        const firstDivId =
          firstDivision.divisionId ??
          firstDivision.DivisionId ??
          firstDivision.divisionID ??
          firstDivision.DivisionID ??
          firstDivision.id;

        if (firstDivId) {
          autoDivisionId = String(firstDivId);
        }
      }

      setMachine((prev) => ({
        ...prev,
        plantId: selectedPlantId,
        divisionId: autoDivisionId,
      }));

      return;
    }

    // =========================
    // NORMAL INPUT
    // =========================
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
  // VALIDATE MACHINE
  // =========================
  const validateMachine = () => {
    const machineName =
      machine.machineName.trim();

    const machineCode =
      machine.machineCode.trim();

    // Machine Name
    if (!machineName) {
      setError("Machine Name is required.");
      return false;
    }

    // Machine Code
    if (!machineCode) {
      setError("Machine Code is required.");
      return false;
    }

    // Plant
    if (!machine.plantId) {
      setError("Please select Plant.");
      return false;
    }

    // Division
    if (!machine.divisionId) {
      setError("Please select Division.");
      return false;
    }

    // Name and Code cannot be same
    if (
      machineName.toLowerCase() ===
      machineCode.toLowerCase()
    ) {
      setError(
        "Machine Name and Machine Code cannot be the same."
      );
      return false;
    }

    const currentId = Number(
      machine.machineID || 0
    );

    // =========================
    // DUPLICATE MACHINE NAME
    // =========================
    const duplicateName = machines.some(
      (item) => {
        const itemId = Number(
          item.machineID ??
            item.MachineID ??
            item.id ??
            0
        );

        const itemName = String(
          item.machineName ??
            item.MachineName ??
            ""
        )
          .trim()
          .toLowerCase();

        return (
          itemId !== currentId &&
          itemName === machineName.toLowerCase()
        );
      }
    );

    if (duplicateName) {
      setError(
        "Machine Name already exists."
      );
      return false;
    }

    // =========================
    // DUPLICATE MACHINE CODE
    // =========================
    const duplicateCode = machines.some(
      (item) => {
        const itemId = Number(
          item.machineID ??
            item.MachineID ??
            item.id ??
            0
        );

        const itemCode = String(
          item.machineCode ??
            item.MachineCode ??
            ""
        )
          .trim()
          .toLowerCase();

        return (
          itemId !== currentId &&
          itemCode === machineCode.toLowerCase()
        );
      }
    );

    if (duplicateCode) {
      setError(
        "Machine Code already exists."
      );
      return false;
    }

    return true;
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!validateMachine()) {
      return;
    }

    try {
      setSaving(true);

      // =========================
      // REQUEST DATA
      // =========================
      const requestData = {
        machineID: Number(
          machine.machineID || 0
        ),

        machineName:
          machine.machineName.trim(),

        machineCode:
          machine.machineCode.trim(),

        status:
          machine.status || "Active",

        plantId:
          Number(machine.plantId),

        divisionId:
          Number(machine.divisionId),
      };

      console.log(
        "MACHINE REQUEST:",
        requestData
      );

      // =========================
      // UPDATE
      // =========================
      if (isEdit) {
        await machineService.updateMachine(
          Number(machine.machineID),
          requestData
        );

        alert(
          "Machine updated successfully."
        );
      }

      // =========================
      // CREATE
      // =========================
      else {
        await machineService.createMachine(
          requestData
        );

        alert(
          "Machine created successfully. QR Code generated."
        );
      }

      // Reload latest machine list
      await loadData();

      // Reset
      resetForm();
    } catch (err) {
      console.error(
        "SAVE MACHINE ERROR:",
        err.response?.data || err
      );

      setError(
        parseApiError(err)
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = async (id) => {
    try {
      setError("");

      const response =
        await machineService.getMachineById(
          id
        );

      const data = response.data;

      const pId =
        data.plantId ??
        data.PlantId ??
        "";

      const dId =
        data.divisionId ??
        data.DivisionId ??
        "";

      setMachine({
        machineID:
          data.machineID ??
          data.MachineID ??
          id,

        machineName:
          data.machineName ??
          data.MachineName ??
          "",

        machineCode:
          data.machineCode ??
          data.MachineCode ??
          "",

        status:
          data.status ??
          data.Status ??
          "Active",

        plantId: pId,

        divisionId: dId,
      });

      // Filter divisions
      const relatedDivisions =
        divisions.filter((div) => {
          const divPlantId =
            div.plantId ??
            div.PlantId ??
            div.plantID ??
            div.PlantID;

          return (
            !pId ||
            String(divPlantId) ===
              String(pId)
          );
        });

      setFilteredDivisions(
        relatedDivisions.length > 0
          ? relatedDivisions
          : divisions
      );

      setIsEdit(true);

      // Scroll to form
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error(
        "GET MACHINE BY ID ERROR:",
        err
      );

      setError(
        parseApiError(err)
      );
    }
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this machine?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await machineService.deleteMachine(
        id
      );

      alert(
        "Machine deleted successfully."
      );

      // If deleted machine was open in QR modal
      if (
        selectedMachine &&
        Number(
          selectedMachine.machineID ??
            selectedMachine.MachineID
        ) === Number(id)
      ) {
        setSelectedMachine(null);
      }

      await loadData();
    } catch (err) {
      console.error(
        "DELETE MACHINE ERROR:",
        err
      );

      setError(
        parseApiError(err)
      );
    }
  };

  // =========================
  // RESET FORM
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

    setFilteredDivisions(
      divisions
    );

    setIsEdit(false);
    setError("");
  };

  // =========================
  // GET PLANT NAME
  // =========================
  const getPlantName = (pId) => {
    const plant = plants.find(
      (p) =>
        Number(
          p.plantID ??
            p.PlantID ??
            p.plantId ??
            p.id
        ) === Number(pId)
    );

    return (
      plant?.plantName ??
      plant?.PlantName ??
      plant?.name ??
      "-"
    );
  };

  // =========================
  // GET DIVISION NAME
  // =========================
  const getDivisionName = (dId) => {
    const division =
      divisions.find(
        (d) =>
          Number(
            d.divisionId ??
              d.DivisionId ??
              d.divisionID ??
              d.DivisionID ??
              d.id
          ) === Number(dId)
      );

    return (
      division?.divisionName ??
      division?.DivisionName ??
      division?.name ??
      "-"
    );
  };

  // =========================
  // GET MACHINE ID
  // =========================
  const getMachineId = (item) => {
    return (
      item.machineID ??
      item.MachineID ??
      item.machineId ??
      item.id
    );
  };

  // =========================
  // GET MACHINE NAME
  // =========================
  const getMachineName = (item) => {
    return (
      item.machineName ??
      item.MachineName ??
      ""
    );
  };

  // =========================
  // GET MACHINE CODE
  // =========================
  const getMachineCode = (item) => {
    return (
      item.machineCode ??
      item.MachineCode ??
      ""
    );
  };

  // =========================
  // GET STATUS
  // =========================
  const getMachineStatus = (item) => {
    return (
      item.status ??
      item.Status ??
      "Active"
    );
  };

  // =========================
  // QR DATA
  // =========================
  const getQrData = (item) => {
    const machineId =
      getMachineId(item);

    const machineName =
      getMachineName(item);

    const machineCode =
      getMachineCode(item);

    const plantId =
      item.plantId ??
      item.PlantId ??
      "";

    const divisionId =
      item.divisionId ??
      item.DivisionId ??
      "";

    const status =
      getMachineStatus(item);

    return JSON.stringify(
      {
        type: "Machine",

        machineID:
          Number(machineId || 0),

        machineName:
          machineName,

        machineCode:
          machineCode,

        plantId:
          Number(plantId || 0),

        plant:
          getPlantName(plantId),

        divisionId:
          Number(divisionId || 0),

        division:
          getDivisionName(
            divisionId
          ),

        status:
          status,
      },
      null,
      2
    );
  };

  // =========================
  // SHOW QR
  // =========================
  const handleShowQR = (item) => {
    setSelectedMachine(item);
  };

  // =========================
  // CLOSE QR
  // =========================
  const closeQR = () => {
    setSelectedMachine(null);
  };

  // =========================
  // DOWNLOAD QR
  // =========================
  const downloadQR = () => {
    if (!selectedMachine) {
      return;
    }

    const machineCode =
      getMachineCode(
        selectedMachine
      );

    const canvas =
      document.getElementById(
        "machine-qr-canvas"
      );

    if (!canvas) {
      return;
    }

    const pngUrl =
      canvas.toDataURL(
        "image/png"
      );

    const downloadLink =
      document.createElement(
        "a"
      );

    downloadLink.href =
      pngUrl;

    downloadLink.download =
      `Machine-${machineCode || "QR"}.png`;

    document.body.appendChild(
      downloadLink
    );

    downloadLink.click();

    document.body.removeChild(
      downloadLink
    );
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
      {/* =====================================
          ERROR MESSAGE
      ===================================== */}
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
          <strong>
            Error:
          </strong>{" "}
          {String(error)}

          <button
            type="button"
            className="btn-close float-end"
            onClick={() =>
              setError("")
            }
          />
        </div>
      )}

      {/* =====================================
          MAIN CARDS
      ===================================== */}
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
        {/* =====================================
            LEFT - FORM
        ===================================== */}
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
            <form
              onSubmit={handleSubmit}
            >
              {/* MACHINE NAME */}
              <div className="mb-3">
                <label className="proto-label">
                  MACHINE NAME *
                </label>

                <input
                  type="text"
                  className="proto-input"
                  name="machineName"
                  value={
                    machine.machineName
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter Machine Name"
                  required
                  disabled={saving}
                />
              </div>

              {/* MACHINE CODE */}
              <div className="mb-3">
                <label className="proto-label">
                  MACHINE CODE *
                </label>

                <input
                  type="text"
                  className="proto-input"
                  name="machineCode"
                  value={
                    machine.machineCode
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter Machine Code"
                  required
                  disabled={saving}
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
                  value={
                    machine.plantId
                  }
                  onChange={
                    handleChange
                  }
                  required
                  disabled={saving}
                >
                  <option value="">
                    Select Plant
                  </option>

                  {plants.map(
                    (plant) => {
                      const id =
                        plant.plantID ??
                        plant.PlantID ??
                        plant.plantId ??
                        plant.id;

                      const name =
                        plant.plantName ??
                        plant.PlantName ??
                        plant.name;

                      return (
                        <option
                          key={id}
                          value={id}
                        >
                          {name}
                        </option>
                      );
                    }
                  )}
                </select>
              </div>

              {/* DIVISION */}
              <div className="mb-3">
                <label className="proto-label">
                  DIVISION *
                </label>

                <select
                  className="proto-input"
                  name="divisionId"
                  value={
                    machine.divisionId
                  }
                  onChange={
                    handleChange
                  }
                  required
                  disabled={
                    saving ||
                    !machine.plantId
                  }
                >
                  <option value="">
                    Select Division
                  </option>

                  {filteredDivisions.map(
                    (division) => {
                      const id =
                        division.divisionId ??
                        division.DivisionId ??
                        division.divisionID ??
                        division.DivisionID ??
                        division.id;

                      const name =
                        division.divisionName ??
                        division.DivisionName ??
                        division.name;

                      return (
                        <option
                          key={id}
                          value={id}
                        >
                          {name}
                        </option>
                      );
                    }
                  )}
                </select>
              </div>

              {/* STATUS */}
              <div className="form-check mb-4">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="machineStatus"
                  name="status"
                  checked={
                    machine.status ===
                    "Active"
                  }
                  onChange={
                    handleChange
                  }
                  disabled={saving}
                />

                <label
                  className="form-check-label ms-1"
                  htmlFor="machineStatus"
                >
                  Active
                </label>
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
                  onClick={
                    resetForm
                  }
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* =====================================
            RIGHT - TABLE
        ===================================== */}
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
              <div
                style={{
                  width: "100%",
                  overflowX: "auto",
                }}
              >
                <table
                  className="table-proto"
                  style={{
                    width: "100%",
                    minWidth: "850px",
                    tableLayout:
                      "fixed",
                    margin: 0,
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          width: "15%",
                        }}
                      >
                        MACHINE NAME
                      </th>

                      <th
                        style={{
                          width: "11%",
                        }}
                      >
                        CODE
                      </th>

                      <th
                        style={{
                          width: "15%",
                        }}
                      >
                        PLANT
                      </th>

                      <th
                        style={{
                          width: "15%",
                        }}
                      >
                        DIVISION
                      </th>

                      <th
                        style={{
                          width: "10%",
                        }}
                      >
                        STATUS
                      </th>

                      <th
                        style={{
                          width: "24%",
                        }}
                      >
                        ACTION
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {machines.length >
                    0 ? (
                      machines.map(
                        (item) => {
                          const mId =
                            getMachineId(
                              item
                            );

                          const mName =
                            getMachineName(
                              item
                            );

                          const mCode =
                            getMachineCode(
                              item
                            );

                          const pId =
                            item.plantId ??
                            item.PlantId ??
                            "";

                          const dId =
                            item.divisionId ??
                            item.DivisionId ??
                            "";

                          const mStatus =
                            getMachineStatus(
                              item
                            );

                          return (
                            <tr
                              key={mId}
                            >
                              {/* MACHINE NAME */}
                              <td>
                                {mName}
                              </td>

                              {/* CODE */}
                              <td>
                                {mCode}
                              </td>

                              {/* PLANT */}
                              <td>
                                {getPlantName(
                                  pId
                                )}
                              </td>

                              {/* DIVISION */}
                              <td>
                                {getDivisionName(
                                  dId
                                )}
                              </td>

                              {/* STATUS */}
                              <td>
                                <span
                                  className={`badge ${
                                    mStatus ===
                                    "Active"
                                      ? "bg-success"
                                      : "bg-secondary"
                                  }`}
                                >
                                  {
                                    mStatus
                                  }
                                </span>
                              </td>

                              {/* ACTION */}
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-link btn-sm p-0 me-3 text-success text-decoration-none"
                                  onClick={() =>
                                    handleShowQR(
                                      item
                                    )
                                  }
                                >
                                  View QR
                                </button>

                                <button
                                  type="button"
                                  className="btn btn-link btn-sm p-0 me-3 text-primary text-decoration-none"
                                  onClick={() =>
                                    handleEdit(
                                      mId
                                    )
                                  }
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  className="btn btn-link btn-sm p-0 text-danger text-decoration-none"
                                  onClick={() =>
                                    handleDelete(
                                      mId
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
                          colSpan="7"
                          className="text-center py-5 text-muted"
                        >
                          No machines
                          found
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

      {/* =====================================
          QR CODE MODAL
      ===================================== */}
      {selectedMachine && (
        <div
          onClick={closeQR}
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0, 0, 0, 0.55)",
            display: "flex",
            justifyContent:
              "center",
            alignItems:
              "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              background:
                "#ffffff",
              borderRadius:
                "14px",
              padding: "30px",
              width: "100%",
              maxWidth:
                "420px",
              textAlign:
                "center",
              position:
                "relative",
              boxShadow:
                "0 10px 40px rgba(0,0,0,0.25)",
            }}
          >
            {/* CLOSE */}
            <button
              type="button"
              onClick={
                closeQR
              }
              style={{
                position:
                  "absolute",
                right:
                  "15px",
                top:
                  "12px",
                border:
                  "none",
                background:
                  "transparent",
                fontSize:
                  "26px",
                cursor:
                  "pointer",
                lineHeight:
                  1,
              }}
            >
              ×
            </button>

            {/* TITLE */}
            <h4
              style={{
                marginBottom:
                  "5px",
                fontWeight:
                  "600",
              }}
            >
              Machine QR Code
            </h4>

            {/* MACHINE NAME */}
            <div
              style={{
                fontSize:
                  "18px",
                fontWeight:
                  "600",
                marginBottom:
                  "3px",
              }}
            >
              {
                getMachineName(
                  selectedMachine
                )
              }
            </div>

            {/* MACHINE CODE */}
            <div
              className="text-muted"
              style={{
                marginBottom:
                  "20px",
              }}
            >
              Code:{" "}
              {
                getMachineCode(
                  selectedMachine
                )
              }
            </div>

            {/* QR */}
            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "center",
                marginBottom:
                  "20px",
              }}
            >
              <QRCodeCanvas
                id="machine-qr-canvas"
                value={getQrData(
                  selectedMachine
                )}
                size={260}
                level="H"
                includeMargin={
                  true
                }
              />
            </div>

            {/* MACHINE DETAILS */}
            <div
              style={{
                textAlign:
                  "left",
                background:
                  "#f8f9fa",
                borderRadius:
                  "8px",
                padding:
                  "12px",
                marginBottom:
                  "20px",
                fontSize:
                  "14px",
              }}
            >
              <div>
                <strong>
                  Machine ID:
                </strong>{" "}
                {
                  getMachineId(
                    selectedMachine
                  )
                }
              </div>

              <div>
                <strong>
                  Plant:
                </strong>{" "}
                {getPlantName(
                  selectedMachine.plantId ??
                    selectedMachine.PlantId
                )}
              </div>

              <div>
                <strong>
                  Division:
                </strong>{" "}
                {getDivisionName(
                  selectedMachine.divisionId ??
                    selectedMachine.DivisionId
                )}
              </div>

              <div>
                <strong>
                  Status:
                </strong>{" "}
                {getMachineStatus(
                  selectedMachine
                )}
              </div>
            </div>

            {/* DOWNLOAD */}
            <button
              type="button"
              className="btn btn-primary"
              onClick={
                downloadQR
              }
              style={{
                width:
                  "100%",
              }}
            >
              Download QR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Machine;