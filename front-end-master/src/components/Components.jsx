// import React, { useEffect, useState } from "react";
// import componentsService from "../services/componentsService";
// import projectService from "../services/projectService";
// import machineService from "../services/machineService";

// function Components() {
//   const [components, setComponents] = useState([]);
//   const [projects, setProjects] = useState([]);
//   const [machines, setMachines] = useState([]);

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const [component, setComponent] = useState({
//     componentID: 0,
//     componentName: "",
//     standardHours: "",
//     topHours: "",
//     bottomHours: "",
//     sideHours: "",
//     stock: "",
//     seriesNo: "",
//     projectID: "",
//     machineID: "",
//     status: "Active",
//   });

//   const [isEdit, setIsEdit] = useState(false);
//   const [saving, setSaving] = useState(false);

//   // =========================
//   // ERROR MESSAGE
//   // =========================
//   const parseApiError = (err) => {
//     console.error("API ERROR:", err);

//     const apiData = err.response?.data;

//     if (
//       apiData?.errors &&
//       typeof apiData.errors === "object"
//     ) {
//       const messages = Object.values(apiData.errors)
//         .flat()
//         .filter(Boolean);

//       if (messages.length > 0) {
//         return messages.join(" ");
//       }
//     }

//     if (apiData?.detail) return apiData.detail;
//     if (apiData?.message) return apiData.message;
//     if (apiData?.error) return apiData.error;
//     if (apiData?.title) return apiData.title;

//     if (typeof apiData === "string") {
//       return apiData;
//     }

//     return (
//       err.message ||
//       "An unexpected error occurred."
//     );
//   };

//   // =========================
//   // GET ENTITY PROPERTY
//   // =========================
//   const getEntityProperty = (obj, key) => {
//     if (!obj) return undefined;

//     const lowerKey = key.toLowerCase();

//     const matchedKey = Object.keys(obj).find(
//       (k) => k.toLowerCase() === lowerKey
//     );

//     return matchedKey
//       ? obj[matchedKey]
//       : undefined;
//   };

//   // =========================
//   // LOAD DATA
//   // =========================
//   const loadData = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const [
//         componentRes,
//         projectRes,
//         machineRes,
//       ] = await Promise.allSettled([
//         componentsService.getComponents(),
//         projectService.getProjects(),
//         machineService.getMachines(),
//       ]);

//       // COMPONENTS
//       if (
//         componentRes.status === "fulfilled"
//       ) {
//         const data = Array.isArray(
//           componentRes.value?.data
//         )
//           ? componentRes.value.data
//           : componentRes.value?.data?.data || [];

//         setComponents(data);
//       } else {
//         throw componentRes.reason;
//       }

//       // PROJECTS
//       if (
//         projectRes.status === "fulfilled"
//       ) {
//         const data = Array.isArray(
//           projectRes.value?.data
//         )
//           ? projectRes.value.data
//           : projectRes.value?.data?.data || [];

//         setProjects(data);
//       }

//       // MACHINES
//       if (
//         machineRes.status === "fulfilled"
//       ) {
//         const data = Array.isArray(
//           machineRes.value?.data
//         )
//           ? machineRes.value.data
//           : machineRes.value?.data?.data || [];

//         setMachines(data);
//       }
//     } catch (err) {
//       console.error(
//         "COMPONENT LOAD ERROR:",
//         err
//       );

//       setError(parseApiError(err));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // =========================
//   // INITIAL LOAD
//   // =========================
//   useEffect(() => {
//     loadData();
//   }, []);

//   // =========================
//   // INPUT CHANGE
//   // =========================
//   const handleChange = (e) => {
//     const {
//       name,
//       value,
//       type,
//       checked,
//     } = e.target;

//     setComponent((prev) => ({
//       ...prev,
//       [name]:
//         type === "checkbox"
//           ? checked
//             ? "Active"
//             : "Inactive"
//           : value,
//     }));

//     setError("");
//   };

//   // =========================
//   // VALIDATION
//   // =========================
//   const validateComponent = () => {
//     const componentName =
//       component.componentName.trim();

//     const seriesNo =
//       component.seriesNo.trim();

//     // Component Name
//     if (!componentName) {
//       setError(
//         "Component Name is required."
//       );
//       return false;
//     }

//     // Standard Hours
//     if (
//       component.standardHours === ""
//     ) {
//       setError(
//         "Standard Hours is required."
//       );
//       return false;
//     }

//     if (
//       Number(component.standardHours) < 0
//     ) {
//       setError(
//         "Standard Hours cannot be negative."
//       );
//       return false;
//     }

//     // Top Hours
//     if (component.topHours === "") {
//       setError(
//         "Top Hours is required."
//       );
//       return false;
//     }

//     if (
//       Number(component.topHours) < 0
//     ) {
//       setError(
//         "Top Hours cannot be negative."
//       );
//       return false;
//     }

//     // Bottom Hours
//     if (
//       component.bottomHours === ""
//     ) {
//       setError(
//         "Bottom Hours is required."
//       );
//       return false;
//     }

//     if (
//       Number(component.bottomHours) < 0
//     ) {
//       setError(
//         "Bottom Hours cannot be negative."
//       );
//       return false;
//     }

//     // Side Hours
//     if (component.sideHours === "") {
//       setError(
//         "Side Hours is required."
//       );
//       return false;
//     }

//     if (
//       Number(component.sideHours) < 0
//     ) {
//       setError(
//         "Side Hours cannot be negative."
//       );
//       return false;
//     }

//     // Stock
//     if (component.stock === "") {
//       setError("Stock is required.");
//       return false;
//     }

//     if (Number(component.stock) < 0) {
//       setError(
//         "Stock cannot be negative."
//       );
//       return false;
//     }

//     // Series No
//     if (!seriesNo) {
//       setError(
//         "Series No is required."
//       );
//       return false;
//     }

//     // Project
//     if (
//       !component.projectID ||
//       Number(component.projectID) <= 0
//     ) {
//       setError(
//         "Please select a Project."
//       );
//       return false;
//     }

//     // Machine
//     if (
//       !component.machineID ||
//       Number(component.machineID) <= 0
//     ) {
//       setError(
//         "Please select a Machine."
//       );
//       return false;
//     }

//     // =========================
//     // DUPLICATE COMPONENT NAME
//     // =========================
//     const currentId = Number(
//       component.componentID || 0
//     );

//     const duplicateName =
//       components.some((item) => {
//         const itemId = Number(
//           getEntityProperty(
//             item,
//             "componentID"
//           ) || 0
//         );

//         const itemName = String(
//           getEntityProperty(
//             item,
//             "componentName"
//           ) || ""
//         )
//           .trim()
//           .toLowerCase();

//         return (
//           itemId !== currentId &&
//           itemName ===
//             componentName.toLowerCase()
//         );
//       });

//     if (duplicateName) {
//       setError(
//         "Component Name already exists."
//       );
//       return false;
//     }

//     return true;
//   };

//   // =========================
//   // CREATE / UPDATE
//   // =========================
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setError("");

//     if (!validateComponent()) {
//       return;
//     }

//     try {
//       setSaving(true);

//       const requestData = {
//         componentID: Number(
//           component.componentID || 0
//         ),

//         componentName:
//           component.componentName.trim(),

//         standardHours: Number(
//           component.standardHours
//         ),

//         topHours: Number(
//           component.topHours
//         ),

//         bottomHours: Number(
//           component.bottomHours
//         ),

//         sideHours: Number(
//           component.sideHours
//         ),

//         stock: Number(
//           component.stock
//         ),

//         seriesNo:
//           component.seriesNo.trim(),

//         projectID: Number(
//           component.projectID
//         ),

//         machineID: Number(
//           component.machineID
//         ),

//         status:
//           component.status || "Active",

//         Status:
//           component.status || "Active",
//       };

//       console.log(
//         "Component Request:",
//         requestData
//       );

//       if (isEdit) {
//         await componentsService.updateComponent(
//           Number(component.componentID),
//           requestData
//         );

//         alert(
//           "Component updated successfully."
//         );
//       } else {
//         await componentsService.createComponent(
//           requestData
//         );

//         alert(
//           "Component created successfully."
//         );
//       }

//       resetForm();

//       await loadData();
//     } catch (err) {
//       console.error(
//         "COMPONENT SAVE ERROR:",
//         err
//       );

//       setError(
//         parseApiError(err)
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   // =========================
//   // EDIT
//   // =========================
//   const handleEdit = async (id) => {
//     if (!id || Number(id) <= 0) {
//       setError(
//         "Invalid Component ID."
//       );
//       return;
//     }

//     try {
//       setError("");
//       setSaving(true);

//       const response =
//         await componentsService.getComponentById(
//           Number(id)
//         );

//       const data = response.data;

//       setComponent({
//         componentID: Number(
//           getEntityProperty(
//             data,
//             "componentID"
//           ) ?? id
//         ),

//         componentName:
//           getEntityProperty(
//             data,
//             "componentName"
//           ) ?? "",

//         standardHours:
//           getEntityProperty(
//             data,
//             "standardHours"
//           ) ?? "",

//         topHours:
//           getEntityProperty(
//             data,
//             "topHours"
//           ) ?? "",

//         bottomHours:
//           getEntityProperty(
//             data,
//             "bottomHours"
//           ) ?? "",

//         sideHours:
//           getEntityProperty(
//             data,
//             "sideHours"
//           ) ?? "",

//         stock:
//           getEntityProperty(
//             data,
//             "stock"
//           ) ?? "",

//         seriesNo:
//           getEntityProperty(
//             data,
//             "seriesNo"
//           ) ?? "",

//         projectID: String(
//           getEntityProperty(
//             data,
//             "projectID"
//           ) ?? ""
//         ),

//         machineID: String(
//           getEntityProperty(
//             data,
//             "machineID"
//           ) ?? ""
//         ),

//         status:
//           getEntityProperty(
//             data,
//             "status"
//           ) ??
//           getEntityProperty(
//             data,
//             "Status"
//           ) ??
//           "Active",
//       });

//       setIsEdit(true);
//     } catch (err) {
//       console.error(
//         "GET COMPONENT ERROR:",
//         err
//       );

//       setError(
//         parseApiError(err)
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   // =========================
//   // DELETE
//   // =========================
//   const handleDelete = async (id) => {
//     if (!id || Number(id) <= 0) {
//       setError(
//         "Invalid Component ID."
//       );
//       return;
//     }

//     if (
//       !window.confirm(
//         "Are you sure you want to delete this component?"
//       )
//     ) {
//       return;
//     }

//     try {
//       setError("");
//       setLoading(true);

//       await componentsService.deleteComponent(
//         Number(id)
//       );

//       alert(
//         "Component deleted successfully."
//       );

//       await loadData();
//     } catch (err) {
//       console.error(
//         "DELETE COMPONENT ERROR:",
//         err
//       );

//       setError(
//         parseApiError(err)
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // =========================
//   // RESET FORM
//   // =========================
//   const resetForm = () => {
//     setComponent({
//       componentID: 0,
//       componentName: "",
//       standardHours: "",
//       topHours: "",
//       bottomHours: "",
//       sideHours: "",
//       stock: "",
//       seriesNo: "",
//       projectID: "",
//       machineID: "",
//       status: "Active",
//     });

//     setIsEdit(false);
//     setError("");
//   };

//   // =========================
//   // PROJECT NAME
//   // =========================
//   const getProjectName = (projectID) => {
//     const project = projects.find(
//       (p) =>
//         Number(
//           getEntityProperty(
//             p,
//             "projectID"
//           )
//         ) === Number(projectID)
//     );

//     return project
//       ? getEntityProperty(
//           project,
//           "projectName"
//         ) || "-"
//       : "-";
//   };

//   // =========================
//   // MACHINE NAME
//   // =========================
//   const getMachineName = (machineID) => {
//     const machine = machines.find(
//       (m) =>
//         Number(
//           getEntityProperty(
//             m,
//             "machineID"
//           )
//         ) === Number(machineID)
//     );

//     return machine
//       ? getEntityProperty(
//           machine,
//           "machineName"
//         ) || "-"
//       : "-";
//   };

//   return (
//     <div
//       className="plant-page-wrapper"
//       style={{
//         width: "100%",
//         maxWidth: "100%",
//         overflowX: "hidden",
//         boxSizing: "border-box",
//       }}
//     >
//       {/* =========================
//           ERROR
//       ========================= */}
//       {error && (
//         <div className="alert alert-danger mb-4">
//           <strong>Error:</strong>{" "}
//           {String(error)}
//         </div>
//       )}

//       {/* =========================
//           CARDS SIDE BY SIDE
//       ========================= */}
//       <div
//         className="cards-side-by-side"
//         style={{
//           display: "flex",
//           flexWrap: "wrap",
//           gap: "20px",
//           width: "100%",
//           maxWidth: "100%",
//           boxSizing: "border-box",
//           alignItems: "flex-start",
//         }}
//       >
//         {/* =========================
//             LEFT FORM CARD
//         ========================= */}
//         <div
//           className="left-card-form"
//           style={{
//             flex: "0 1 380px",
//             width: "380px",
//             maxWidth: "100%",
//             minWidth: "0",
//             boxSizing: "border-box",
//           }}
//         >
//           <div
//             className="prototype-card"
//             style={{
//               width: "100%",
//               maxWidth: "100%",
//               boxSizing: "border-box",
//               overflow: "hidden",
//             }}
//           >
//             <form
//               onSubmit={handleSubmit}
//               style={{
//                 width: "100%",
//                 maxWidth: "100%",
//                 boxSizing: "border-box",
//               }}
//             >
//               {/* COMPONENT NAME */}
//               <div className="mb-3">
//                 <label className="proto-label">
//                   COMPONENT NAME *
//                 </label>

//                 <input
//                   type="text"
//                   className="proto-input"
//                   name="componentName"
//                   value={
//                     component.componentName
//                   }
//                   onChange={handleChange}
//                   placeholder="Enter Component Name"
//                   required
//                   disabled={saving}
//                   style={{
//                     width: "100%",
//                     maxWidth: "100%",
//                     boxSizing: "border-box",
//                   }}
//                 />
//               </div>

//               {/* STANDARD HOURS */}
//               <div className="mb-3">
//                 <label className="proto-label">
//                   STANDARD HOURS *
//                 </label>

//                 <input
//                   type="number"
//                   className="proto-input"
//                   name="standardHours"
//                   value={
//                     component.standardHours
//                   }
//                   onChange={handleChange}
//                   placeholder="Enter Standard Hours"
//                   min="0"
//                   required
//                   disabled={saving}
//                   style={{
//                     width: "100%",
//                     maxWidth: "100%",
//                     boxSizing: "border-box",
//                   }}
//                 />
//               </div>

//               {/* TOP HOURS */}
//               <div className="mb-3">
//                 <label className="proto-label">
//                   TOP HOURS *
//                 </label>

//                 <input
//                   type="number"
//                   className="proto-input"
//                   name="topHours"
//                   value={
//                     component.topHours
//                   }
//                   onChange={handleChange}
//                   placeholder="Enter Top Hours"
//                   min="0"
//                   required
//                   disabled={saving}
//                   style={{
//                     width: "100%",
//                     maxWidth: "100%",
//                     boxSizing: "border-box",
//                   }}
//                 />
//               </div>

//               {/* BOTTOM HOURS */}
//               <div className="mb-3">
//                 <label className="proto-label">
//                   BOTTOM HOURS *
//                 </label>

//                 <input
//                   type="number"
//                   className="proto-input"
//                   name="bottomHours"
//                   value={
//                     component.bottomHours
//                   }
//                   onChange={handleChange}
//                   placeholder="Enter Bottom Hours"
//                   min="0"
//                   required
//                   disabled={saving}
//                   style={{
//                     width: "100%",
//                     maxWidth: "100%",
//                     boxSizing: "border-box",
//                   }}
//                 />
//               </div>

//               {/* SIDE HOURS */}
//               <div className="mb-3">
//                 <label className="proto-label">
//                   SIDE HOURS *
//                 </label>

//                 <input
//                   type="number"
//                   className="proto-input"
//                   name="sideHours"
//                   value={
//                     component.sideHours
//                   }
//                   onChange={handleChange}
//                   placeholder="Enter Side Hours"
//                   min="0"
//                   required
//                   disabled={saving}
//                   style={{
//                     width: "100%",
//                     maxWidth: "100%",
//                     boxSizing: "border-box",
//                   }}
//                 />
//               </div>

//               {/* STOCK */}
//               <div className="mb-3">
//                 <label className="proto-label">
//                   STOCK *
//                 </label>

//                 <input
//                   type="number"
//                   className="proto-input"
//                   name="stock"
//                   value={
//                     component.stock
//                   }
//                   onChange={handleChange}
//                   placeholder="Enter Stock"
//                   min="0"
//                   required
//                   disabled={saving}
//                   style={{
//                     width: "100%",
//                     maxWidth: "100%",
//                     boxSizing: "border-box",
//                   }}
//                 />
//               </div>

//               {/* SERIES NO */}
//               <div className="mb-3">
//                 <label className="proto-label">
//                   SERIES NO *
//                 </label>

//                 <input
//                   type="text"
//                   className="proto-input"
//                   name="seriesNo"
//                   value={
//                     component.seriesNo
//                   }
//                   onChange={handleChange}
//                   placeholder="Enter Series No"
//                   required
//                   disabled={saving}
//                   style={{
//                     width: "100%",
//                     maxWidth: "100%",
//                     boxSizing: "border-box",
//                   }}
//                 />
//               </div>

//               {/* PROJECT */}
//               <div className="mb-3">
//                 <label className="proto-label">
//                   PROJECT *
//                 </label>

//                 <select
//                   className="proto-input"
//                   name="projectID"
//                   value={
//                     component.projectID
//                   }
//                   onChange={handleChange}
//                   required
//                   disabled={saving}
//                   style={{
//                     width: "100%",
//                     maxWidth: "100%",
//                     boxSizing: "border-box",
//                   }}
//                 >
//                   <option value="">
//                     Select Project
//                   </option>

//                   {projects.map((p) => {
//                     const id =
//                       getEntityProperty(
//                         p,
//                         "projectID"
//                       );

//                     const name =
//                       getEntityProperty(
//                         p,
//                         "projectName"
//                       ) || "-";

//                     return (
//                       <option
//                         key={id}
//                         value={id}
//                       >
//                         {name}
//                       </option>
//                     );
//                   })}
//                 </select>
//               </div>

//               {/* MACHINE */}
//               <div className="mb-3">
//                 <label className="proto-label">
//                   MACHINE *
//                 </label>

//                 <select
//                   className="proto-input"
//                   name="machineID"
//                   value={
//                     component.machineID
//                   }
//                   onChange={handleChange}
//                   required
//                   disabled={saving}
//                   style={{
//                     width: "100%",
//                     maxWidth: "100%",
//                     boxSizing: "border-box",
//                   }}
//                 >
//                   <option value="">
//                     Select Machine
//                   </option>

//                   {machines.map((m) => {
//                     const id =
//                       getEntityProperty(
//                         m,
//                         "machineID"
//                       );

//                     const name =
//                       getEntityProperty(
//                         m,
//                         "machineName"
//                       ) || "-";

//                     return (
//                       <option
//                         key={id}
//                         value={id}
//                       >
//                         {name}
//                       </option>
//                     );
//                   })}
//                 </select>
//               </div>

//               {/* STATUS */}
//               <div className="mb-4 status-field">
//                 <label className="proto-label d-block mb-2">
//                   STATUS
//                 </label>

//                 <div className="status-control">
//                   <input
//                     type="checkbox"
//                     id="componentStatus"
//                     name="status"
//                     checked={
//                       component.status ===
//                       "Active"
//                     }
//                     onChange={handleChange}
//                     className="status-checkbox"
//                     disabled={saving}
//                   />

//                   <label
//                     htmlFor="componentStatus"
//                     className="status-text"
//                   >
//                     {component.status ===
//                     "Active"
//                       ? "Active"
//                       : "Inactive"}
//                   </label>
//                 </div>
//               </div>

//               {/* BUTTONS */}
//               <div className="d-flex gap-2 pt-1">
//                 <button
//                   type="submit"
//                   className="btn-proto-save"
//                   disabled={saving}
//                 >
//                   {saving
//                     ? "Saving..."
//                     : isEdit
//                     ? "Update"
//                     : "Save"}
//                 </button>

//                 <button
//                   type="button"
//                   className="btn-proto-cancel"
//                   onClick={resetForm}
//                   disabled={saving}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>

//         {/* =========================
//             RIGHT TABLE CARD
//         ========================= */}
//         <div
//           className="right-card-table"
//           style={{
//             flex: "1 1 0%",
//             minWidth: "0",
//             width: "100%",
//             maxWidth: "100%",
//             boxSizing: "border-box",
//             overflow: "hidden",
//           }}
//         >
//           <div
//             className="prototype-card p-0"
//             style={{
//               width: "100%",
//               maxWidth: "100%",
//               minWidth: "0",
//               boxSizing: "border-box",
//               overflowX: "auto",
//               overflowY: "hidden",
//             }}
//           >
//             {loading ? (
//               <div
//                 className="p-4 text-center text-muted"
//                 style={{
//                   fontSize: "0.875rem",
//                 }}
//               >
//                 Loading components...
//               </div>
//             ) : (
//               <table
//                 className="table-proto"
//                 style={{
//                   width: "100%",
//                   minWidth: "1100px",
//                   tableLayout: "auto",
//                   margin: 0,
//                 }}
//               >
//                 <thead>
//                   <tr>
//                     <th>COMPONENT</th>
//                     <th>STD. HOURS</th>
//                     <th>TOP HOURS</th>
//                     <th>BOTTOM HOURS</th>
//                     <th>SIDE HOURS</th>
//                     <th>STOCK</th>
//                     <th>SERIES NO</th>
//                     <th>PROJECT</th>
//                     <th>MACHINE</th>
//                     <th>STATUS</th>
//                     <th>ACTION</th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {components.length > 0 ? (
//                     components.map((item) => {
//                       const id =
//                         getEntityProperty(
//                           item,
//                           "componentID"
//                         );

//                       const name =
//                         getEntityProperty(
//                           item,
//                           "componentName"
//                         ) || "-";

//                       const standardHours =
//                         getEntityProperty(
//                           item,
//                           "standardHours"
//                         );

//                       const topHours =
//                         getEntityProperty(
//                           item,
//                           "topHours"
//                         );

//                       const bottomHours =
//                         getEntityProperty(
//                           item,
//                           "bottomHours"
//                         );

//                       const sideHours =
//                         getEntityProperty(
//                           item,
//                           "sideHours"
//                         );

//                       const stock =
//                         getEntityProperty(
//                           item,
//                           "stock"
//                         );

//                       const seriesNo =
//                         getEntityProperty(
//                           item,
//                           "seriesNo"
//                         ) || "-";

//                       const projectID =
//                         getEntityProperty(
//                           item,
//                           "projectID"
//                         );

//                       const machineID =
//                         getEntityProperty(
//                           item,
//                           "machineID"
//                         );

//                       const status =
//                         getEntityProperty(
//                           item,
//                           "status"
//                         ) ??
//                         getEntityProperty(
//                           item,
//                           "Status"
//                         ) ??
//                         "Inactive";

//                       const isActive =
//                         String(status)
//                           .toLowerCase() ===
//                         "active";

//                       return (
//                         <tr key={id}>
//                           <td>
//                             {name}
//                           </td>

//                           <td>
//                             {standardHours ??
//                               "-"}
//                           </td>

//                           <td>
//                             {topHours ??
//                               "-"}
//                           </td>

//                           <td>
//                             {bottomHours ??
//                               "-"}
//                           </td>

//                           <td>
//                             {sideHours ??
//                               "-"}
//                           </td>

//                           <td>
//                             {stock ?? "-"}
//                           </td>

//                           <td>
//                             {seriesNo}
//                           </td>

//                           <td>
//                             {getProjectName(
//                               projectID
//                             )}
//                           </td>

//                           <td>
//                             {getMachineName(
//                               machineID
//                             )}
//                           </td>

//                           <td>
//                             <span
//                               className={
//                                 isActive
//                                   ? "status-active"
//                                   : "status-inactive"
//                               }
//                             >
//                               {isActive
//                                 ? "Active"
//                                 : "Inactive"}
//                             </span>
//                           </td>

//                           <td
//                             style={{
//                               whiteSpace:
//                                 "nowrap",
//                             }}
//                           >
//                             <button
//                               type="button"
//                               className="btn btn-link btn-sm p-0 me-3 text-primary text-decoration-none"
//                               style={{
//                                 fontSize:
//                                   "0.85rem",
//                                 fontWeight:
//                                   "500",
//                               }}
//                               onClick={() =>
//                                 handleEdit(
//                                   id
//                                 )
//                               }
//                               disabled={saving}
//                             >
//                               Edit
//                             </button>

//                             <button
//                               type="button"
//                               className="btn btn-link btn-sm p-0 text-danger text-decoration-none"
//                               style={{
//                                 fontSize:
//                                   "0.85rem",
//                                 fontWeight:
//                                   "500",
//                               }}
//                               onClick={() =>
//                                 handleDelete(
//                                   id
//                                 )
//                               }
//                               disabled={saving}
//                             >
//                               Delete
//                             </button>
//                           </td>
//                         </tr>
//                       );
//                     })
//                   ) : (
//                     <tr>
//                       <td
//                         colSpan="11"
//                         className="text-center py-5 text-muted"
//                       >
//                         No components found
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* =========================
//           STATUS CSS
//       ========================= */}
//       <style>
//         {`
//           * {
//             box-sizing: border-box;
//           }

//           .plant-page-wrapper {
//             width: 100%;
//             max-width: 100%;
//             overflow-x: hidden;
//           }

//           .cards-side-by-side {
//             width: 100%;
//             max-width: 100%;
//           }

//           .left-card-form,
//           .right-card-table {
//             min-width: 0 !important;
//           }

//           .left-card-form .prototype-card {
//             width: 100%;
//             max-width: 100%;
//           }

//           .right-card-table .prototype-card {
//             width: 100%;
//             max-width: 100%;
//           }

//           .proto-input {
//             width: 100% !important;
//             max-width: 100% !important;
//             box-sizing: border-box !important;
//           }

//           .table-proto {
//             border-collapse: collapse;
//           }

//           .table-proto th,
//           .table-proto td {
//             white-space: nowrap;
//           }

//           .status-field {
//             width: 100%;
//             text-align: left !important;
//           }

//           .status-control {
//             display: flex;
//             align-items: center;
//             justify-content: flex-start !important;
//             width: 100%;
//             text-align: left;
//             margin: 0;
//             padding: 0;
//           }

//           .status-checkbox {
//             appearance: auto;
//             -webkit-appearance: checkbox;
//             width: 18px !important;
//             height: 18px !important;
//             margin: 0 !important;
//             padding: 0 !important;
//             cursor: pointer;
//             flex: 0 0 18px;
//           }

//           .status-text {
//             margin: 0 0 0 8px !important;
//             padding: 0 !important;
//             cursor: pointer;
//             font-size: 0.875rem;
//             font-weight: 500;
//             line-height: 18px;
//             text-align: left;
//           }

//           .status-active,
//           .status-inactive {
//             display: inline-block;
//             padding: 4px 10px;
//             border-radius: 12px;
//             font-size: 0.75rem;
//             font-weight: 600;
//           }

//           .status-active {
//             background-color: #d1e7dd;
//             color: #0f5132;
//           }

//           .status-inactive {
//             background-color: #f8d7da;
//             color: #842029;
//           }

//           @media (max-width: 900px) {
//             .cards-side-by-side {
//               flex-direction: column !important;
//             }

//             .left-card-form,
//             .right-card-table {
//               width: 100% !important;
//               max-width: 100% !important;
//               flex: 1 1 100% !important;
//             }
//           }

//           @media (max-width: 576px) {
//             .plant-page-wrapper {
//               padding-left: 10px !important;
//               padding-right: 10px !important;
//             }

//             .cards-side-by-side {
//               gap: 15px !important;
//             }

//             .prototype-card {
//               border-radius: 8px;
//             }
//           }
//         `}
//       </style>
//     </div>
//   );
// }

// export default Components;

import React, { useEffect, useState } from "react";
import componentsService from "../services/componentsService";
import projectService from "../services/projectService";
import machineService from "../services/machineService";

function Components() {
  const [components, setComponents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [machines, setMachines] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [component, setComponent] = useState({
    componentID: 0,
    componentName: "",
    standardHours: "",
    topHours: "",
    bottomHours: "",
    sideHours: "",
    stock: "",
    seriesNo: "",
    projectID: "",
    machineID: "",
    status: "Active",
  });

  const [isEdit, setIsEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  // =========================
  // ERROR MESSAGE
  // =========================
  const parseApiError = (err) => {
    console.error("API ERROR:", err);

    const apiData = err.response?.data;

    if (
      apiData?.errors &&
      typeof apiData.errors === "object"
    ) {
      const messages = Object.values(apiData.errors)
        .flat()
        .filter(Boolean);

      if (messages.length > 0) {
        return messages.join(" ");
      }
    }

    if (apiData?.detail) return apiData.detail;
    if (apiData?.message) return apiData.message;
    if (apiData?.error) return apiData.error;
    if (apiData?.title) return apiData.title;

    if (typeof apiData === "string") {
      return apiData;
    }

    return (
      err.message ||
      "An unexpected error occurred."
    );
  };

  // =========================
  // GET ENTITY PROPERTY
  // =========================
  const getEntityProperty = (obj, key) => {
    if (!obj) return undefined;

    const lowerKey = key.toLowerCase();

    const matchedKey = Object.keys(obj).find(
      (k) => k.toLowerCase() === lowerKey
    );

    return matchedKey
      ? obj[matchedKey]
      : undefined;
  };

  // =========================
  // LOAD DATA
  // =========================
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        componentRes,
        projectRes,
        machineRes,
      ] = await Promise.allSettled([
        componentsService.getComponents(),
        projectService.getProjects(),
        machineService.getMachines(),
      ]);

      // COMPONENTS
      if (
        componentRes.status === "fulfilled"
      ) {
        const data = Array.isArray(
          componentRes.value?.data
        )
          ? componentRes.value.data
          : componentRes.value?.data?.data || [];

        setComponents(data);
      } else {
        throw componentRes.reason;
      }

      // PROJECTS
      if (
        projectRes.status === "fulfilled"
      ) {
        const data = Array.isArray(
          projectRes.value?.data
        )
          ? projectRes.value.data
          : projectRes.value?.data?.data || [];

        setProjects(data);
      }

      // MACHINES
      if (
        machineRes.status === "fulfilled"
      ) {
        const data = Array.isArray(
          machineRes.value?.data
        )
          ? machineRes.value.data
          : machineRes.value?.data?.data || [];

        setMachines(data);
      }
    } catch (err) {
      console.error(
        "COMPONENT LOAD ERROR:",
        err
      );

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
  // HOURS CHECK
  // =========================
  const hasStandardHours =
    component.standardHours !== "" &&
    component.standardHours !== null &&
    component.standardHours !== undefined;

  const hasOtherHours =
    component.topHours !== "" ||
    component.bottomHours !== "" ||
    component.sideHours !== "";

  // =========================
  // INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setComponent((prev) => ({
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

  // =========================
  // VALIDATION
  // =========================
  const validateComponent = () => {
    const componentName =
      component.componentName.trim();

    const seriesNo =
      component.seriesNo.trim();

    // Component Name
    if (!componentName) {
      setError(
        "Component Name is required."
      );
      return false;
    }

    // Standard Hours
    if (
      component.standardHours === "" &&
      !hasOtherHours
    ) {
      setError(
        "Please enter Standard Hours or Top/Bottom/Side Hours."
      );
      return false;
    }

    if (
      component.standardHours !== "" &&
      Number(component.standardHours) < 0
    ) {
      setError(
        "Standard Hours cannot be negative."
      );
      return false;
    }

    // Top Hours
    if (
      component.topHours !== "" &&
      Number(component.topHours) < 0
    ) {
      setError(
        "Top Hours cannot be negative."
      );
      return false;
    }

    // Bottom Hours
    if (
      component.bottomHours !== "" &&
      Number(component.bottomHours) < 0
    ) {
      setError(
        "Bottom Hours cannot be negative."
      );
      return false;
    }

    // Side Hours
    if (
      component.sideHours !== "" &&
      Number(component.sideHours) < 0
    ) {
      setError(
        "Side Hours cannot be negative."
      );
      return false;
    }

    // Series No
    if (!seriesNo) {
      setError(
        "Series No is required."
      );
      return false;
    }

    // Stock
    if (component.stock === "") {
      setError("Stock is required.");
      return false;
    }

    if (Number(component.stock) < 0) {
      setError(
        "Stock cannot be negative."
      );
      return false;
    }

    // Project
    if (
      !component.projectID ||
      Number(component.projectID) <= 0
    ) {
      setError(
        "Please select a Project."
      );
      return false;
    }

    // Machine
    if (
      !component.machineID ||
      Number(component.machineID) <= 0
    ) {
      setError(
        "Please select a Machine."
      );
      return false;
    }

    // =========================
    // DUPLICATE COMPONENT NAME
    // =========================
    const currentId = Number(
      component.componentID || 0
    );

    const duplicateName =
      components.some((item) => {
        const itemId = Number(
          getEntityProperty(
            item,
            "componentID"
          ) || 0
        );

        const itemName = String(
          getEntityProperty(
            item,
            "componentName"
          ) || ""
        )
          .trim()
          .toLowerCase();

        return (
          itemId !== currentId &&
          itemName ===
            componentName.toLowerCase()
        );
      });

    if (duplicateName) {
      setError(
        "Component Name already exists."
      );
      return false;
    }

    return true;
  };

  // =========================
  // CREATE / UPDATE
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!validateComponent()) {
      return;
    }

    try {
      setSaving(true);

      const requestData = {
        componentID: Number(
          component.componentID || 0
        ),

        componentName:
          component.componentName.trim(),

        standardHours:
          component.standardHours === ""
            ? 0
            : Number(component.standardHours),

        topHours:
          component.topHours === ""
            ? 0
            : Number(component.topHours),

        bottomHours:
          component.bottomHours === ""
            ? 0
            : Number(component.bottomHours),

        sideHours:
          component.sideHours === ""
            ? 0
            : Number(component.sideHours),

        stock: Number(
          component.stock
        ),

        seriesNo:
          component.seriesNo.trim(),

        projectID: Number(
          component.projectID
        ),

        machineID: Number(
          component.machineID
        ),

        status:
          component.status || "Active",

        Status:
          component.status || "Active",
      };

      console.log(
        "Component Request:",
        requestData
      );

      if (isEdit) {
        await componentsService.updateComponent(
          Number(component.componentID),
          requestData
        );

        alert(
          "Component updated successfully."
        );
      } else {
        await componentsService.createComponent(
          requestData
        );

        alert(
          "Component created successfully."
        );
      }

      resetForm();

      await loadData();
    } catch (err) {
      console.error(
        "COMPONENT SAVE ERROR:",
        err
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
    if (!id || Number(id) <= 0) {
      setError(
        "Invalid Component ID."
      );
      return;
    }

    try {
      setError("");
      setSaving(true);

      const response =
        await componentsService.getComponentById(
          Number(id)
        );

      const data = response.data;

      setComponent({
        componentID: Number(
          getEntityProperty(
            data,
            "componentID"
          ) ?? id
        ),

        componentName:
          getEntityProperty(
            data,
            "componentName"
          ) ?? "",

        standardHours:
          getEntityProperty(
            data,
            "standardHours"
          ) ?? "",

        topHours:
          getEntityProperty(
            data,
            "topHours"
          ) ?? "",

        bottomHours:
          getEntityProperty(
            data,
            "bottomHours"
          ) ?? "",

        sideHours:
          getEntityProperty(
            data,
            "sideHours"
          ) ?? "",

        stock:
          getEntityProperty(
            data,
            "stock"
          ) ?? "",

        seriesNo:
          getEntityProperty(
            data,
            "seriesNo"
          ) ?? "",

        projectID: String(
          getEntityProperty(
            data,
            "projectID"
          ) ?? ""
        ),

        machineID: String(
          getEntityProperty(
            data,
            "machineID"
          ) ?? ""
        ),

        status:
          getEntityProperty(
            data,
            "status"
          ) ??
          getEntityProperty(
            data,
            "Status"
          ) ??
          "Active",
      });

      setIsEdit(true);
    } catch (err) {
      console.error(
        "GET COMPONENT ERROR:",
        err
      );

      setError(
        parseApiError(err)
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    if (!id || Number(id) <= 0) {
      setError(
        "Invalid Component ID."
      );
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete this component?"
      )
    ) {
      return;
    }

    try {
      setError("");
      setLoading(true);

      await componentsService.deleteComponent(
        Number(id)
      );

      alert(
        "Component deleted successfully."
      );

      await loadData();
    } catch (err) {
      console.error(
        "DELETE COMPONENT ERROR:",
        err
      );

      setError(
        parseApiError(err)
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RESET FORM
  // =========================
  const resetForm = () => {
    setComponent({
      componentID: 0,
      componentName: "",
      standardHours: "",
      topHours: "",
      bottomHours: "",
      sideHours: "",
      stock: "",
      seriesNo: "",
      projectID: "",
      machineID: "",
      status: "Active",
    });

    setIsEdit(false);
    setError("");
  };

  // =========================
  // PROJECT NAME
  // =========================
  const getProjectName = (projectID) => {
    const project = projects.find(
      (p) =>
        Number(
          getEntityProperty(
            p,
            "projectID"
          )
        ) === Number(projectID)
    );

    return project
      ? getEntityProperty(
          project,
          "projectName"
        ) || "-"
      : "-";
  };

  // =========================
  // MACHINE NAME
  // =========================
  const getMachineName = (machineID) => {
    const machine = machines.find(
      (m) =>
        Number(
          getEntityProperty(
            m,
            "machineID"
          )
        ) === Number(machineID)
    );

    return machine
      ? getEntityProperty(
          machine,
          "machineName"
        ) || "-"
      : "-";
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
      {/* =========================
          ERROR
      ========================= */}
      {error && (
        <div className="alert alert-danger mb-4">
          <strong>Error:</strong>{" "}
          {String(error)}
        </div>
      )}

      {/* =========================
          CARDS SIDE BY SIDE
      ========================= */}
      <div
        className="cards-side-by-side"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
          alignItems: "flex-start",
        }}
      >
        {/* =========================
            LEFT FORM CARD
        ========================= */}
        <div
          className="left-card-form"
          style={{
            flex: "0 1 380px",
            width: "380px",
            maxWidth: "100%",
            minWidth: "0",
            boxSizing: "border-box",
          }}
        >
          <div
            className="prototype-card"
            style={{
              width: "100%",
              maxWidth: "100%",
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            <form
              onSubmit={handleSubmit}
              style={{
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
              }}
            >
              {/* COMPONENT NAME */}
              <div className="mb-3">
                <label className="proto-label">
                  COMPONENT NAME *
                </label>

                <input
                  type="text"
                  className="proto-input"
                  name="componentName"
                  value={
                    component.componentName
                  }
                  onChange={handleChange}
                  placeholder="Enter Component Name"
                  required
                  disabled={saving}
                  style={{
                    width: "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* STANDARD HOURS */}
              <div className="mb-3">
                <label className="proto-label">
                  STANDARD HOURS
                </label>

                <input
                  type="number"
                  className="proto-input"
                  name="standardHours"
                  value={
                    component.standardHours
                  }
                  onChange={handleChange}
                  placeholder="Enter Standard Hours"
                  min="0"
                  disabled={
                    saving || hasOtherHours
                  }
                  style={{
                    width: "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                  }}
                />

                {hasOtherHours && (
                  <small
                    className="text-muted"
                    style={{
                      fontSize: "0.75rem",
                    }}
                  >
                    Disabled because Top,
                    Bottom or Side Hours
                    is entered.
                  </small>
                )}
              </div>

              {/* TOP HOURS */}
              <div className="mb-3">
                <label className="proto-label">
                  TOP HOURS
                </label>

                <input
                  type="number"
                  className="proto-input"
                  name="topHours"
                  value={
                    component.topHours
                  }
                  onChange={handleChange}
                  placeholder="Enter Top Hours"
                  min="0"
                  disabled={
                    saving ||
                    hasStandardHours
                  }
                  style={{
                    width: "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* BOTTOM HOURS */}
              <div className="mb-3">
                <label className="proto-label">
                  BOTTOM HOURS
                </label>

                <input
                  type="number"
                  className="proto-input"
                  name="bottomHours"
                  value={
                    component.bottomHours
                  }
                  onChange={handleChange}
                  placeholder="Enter Bottom Hours"
                  min="0"
                  disabled={
                    saving ||
                    hasStandardHours
                  }
                  style={{
                    width: "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* SIDE HOURS */}
              <div className="mb-3">
                <label className="proto-label">
                  SIDE HOURS
                </label>

                <input
                  type="number"
                  className="proto-input"
                  name="sideHours"
                  value={
                    component.sideHours
                  }
                  onChange={handleChange}
                  placeholder="Enter Side Hours"
                  min="0"
                  disabled={
                    saving ||
                    hasStandardHours
                  }
                  style={{
                    width: "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* STOCK */}
              <div className="mb-3">
                <label className="proto-label">
                  STOCK *
                </label>

                <input
                  type="number"
                  className="proto-input"
                  name="stock"
                  value={
                    component.stock
                  }
                  onChange={handleChange}
                  placeholder="Enter Stock"
                  min="0"
                  required
                  disabled={saving}
                  style={{
                    width: "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* SERIES NO */}
              <div className="mb-3">
                <label className="proto-label">
                  SERIES NO *
                </label>

                <input
                  type="text"
                  className="proto-input"
                  name="seriesNo"
                  value={
                    component.seriesNo
                  }
                  onChange={handleChange}
                  placeholder="Enter Series No"
                  required
                  disabled={saving}
                  style={{
                    width: "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* PROJECT */}
              <div className="mb-3">
                <label className="proto-label">
                  PROJECT *
                </label>

                <select
                  className="proto-input"
                  name="projectID"
                  value={
                    component.projectID
                  }
                  onChange={handleChange}
                  required
                  disabled={saving}
                  style={{
                    width: "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="">
                    Select Project
                  </option>

                  {projects.map((p) => {
                    const id =
                      getEntityProperty(
                        p,
                        "projectID"
                      );

                    const name =
                      getEntityProperty(
                        p,
                        "projectName"
                      ) || "-";

                    return (
                      <option
                        key={id}
                        value={id}
                      >
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* MACHINE */}
              <div className="mb-3">
                <label className="proto-label">
                  MACHINE *
                </label>

                <select
                  className="proto-input"
                  name="machineID"
                  value={
                    component.machineID
                  }
                  onChange={handleChange}
                  required
                  disabled={saving}
                  style={{
                    width: "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="">
                    Select Machine
                  </option>

                  {machines.map((m) => {
                    const id =
                      getEntityProperty(
                        m,
                        "machineID"
                      );

                    const name =
                      getEntityProperty(
                        m,
                        "machineName"
                      ) || "-";

                    return (
                      <option
                        key={id}
                        value={id}
                      >
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* STATUS */}
              <div className="mb-4 status-field">
                <label className="proto-label d-block mb-2">
                  STATUS
                </label>

                <div className="status-control">
                  <input
                    type="checkbox"
                    id="componentStatus"
                    name="status"
                    checked={
                      component.status ===
                      "Active"
                    }
                    onChange={handleChange}
                    className="status-checkbox"
                    disabled={saving}
                  />

                  <label
                    htmlFor="componentStatus"
                    className="status-text"
                  >
                    {component.status ===
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
            RIGHT TABLE CARD
        ========================= */}
        <div
          className="right-card-table"
          style={{
            flex: "1 1 0%",
            minWidth: "0",
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          <div
            className="prototype-card p-0"
            style={{
              width: "100%",
              maxWidth: "100%",
              minWidth: "0",
              boxSizing: "border-box",
              overflowX: "auto",
              overflowY: "hidden",
            }}
          >
            {loading ? (
              <div
                className="p-4 text-center text-muted"
                style={{
                  fontSize: "0.875rem",
                }}
              >
                Loading components...
              </div>
            ) : (
              <table
                className="table-proto"
                style={{
                  width: "100%",
                  minWidth: "1100px",
                  tableLayout: "auto",
                  margin: 0,
                }}
              >
                <thead>
                  <tr>
                    <th>COMPONENT</th>
                    <th>STD. HOURS</th>
                    <th>TOP HOURS</th>
                    <th>BOTTOM HOURS</th>
                    <th>SIDE HOURS</th>
                    <th>STOCK</th>
                    <th>SERIES NO</th>
                    <th>PROJECT</th>
                    <th>MACHINE</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {components.length > 0 ? (
                    components.map((item) => {
                      const id =
                        getEntityProperty(
                          item,
                          "componentID"
                        );

                      const name =
                        getEntityProperty(
                          item,
                          "componentName"
                        ) || "-";

                      const standardHours =
                        getEntityProperty(
                          item,
                          "standardHours"
                        );

                      const topHours =
                        getEntityProperty(
                          item,
                          "topHours"
                        );

                      const bottomHours =
                        getEntityProperty(
                          item,
                          "bottomHours"
                        );

                      const sideHours =
                        getEntityProperty(
                          item,
                          "sideHours"
                        );

                      const stock =
                        getEntityProperty(
                          item,
                          "stock"
                        );

                      const seriesNo =
                        getEntityProperty(
                          item,
                          "seriesNo"
                        ) || "-";

                      const projectID =
                        getEntityProperty(
                          item,
                          "projectID"
                        );

                      const machineID =
                        getEntityProperty(
                          item,
                          "machineID"
                        );

                      const status =
                        getEntityProperty(
                          item,
                          "status"
                        ) ??
                        getEntityProperty(
                          item,
                          "Status"
                        ) ??
                        "Inactive";

                      const isActive =
                        String(status)
                          .toLowerCase() ===
                        "active";

                      return (
                        <tr key={id}>
                          <td>
                            {name}
                          </td>

                          <td>
                            {standardHours ??
                              "-"}
                          </td>

                          <td>
                            {topHours ??
                              "-"}
                          </td>

                          <td>
                            {bottomHours ??
                              "-"}
                          </td>

                          <td>
                            {sideHours ??
                              "-"}
                          </td>

                          <td>
                            {stock ?? "-"}
                          </td>

                          <td>
                            {seriesNo}
                          </td>

                          <td>
                            {getProjectName(
                              projectID
                            )}
                          </td>

                          <td>
                            {getMachineName(
                              machineID
                            )}
                          </td>

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

                          <td
                            style={{
                              whiteSpace:
                                "nowrap",
                            }}
                          >
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
                                  id
                                )
                              }
                              disabled={saving}
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
                                  id
                                )
                              }
                              disabled={saving}
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
                        colSpan="11"
                        className="text-center py-5 text-muted"
                      >
                        No components found
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
          STATUS + FORM CSS
      ========================= */}
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          .plant-page-wrapper {
            width: 100%;
            max-width: 100%;
            overflow-x: hidden;
          }

          .cards-side-by-side {
            width: 100%;
            max-width: 100%;
          }

          .left-card-form,
          .right-card-table {
            min-width: 0 !important;
          }

          .left-card-form .prototype-card {
            width: 100%;
            max-width: 100%;
          }

          .right-card-table .prototype-card {
            width: 100%;
            max-width: 100%;
          }

          .proto-input {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }

          .proto-input:disabled {
            background-color: #e9ecef !important;
            color: #6c757d !important;
            cursor: not-allowed;
            opacity: 0.8;
          }

          .table-proto {
            border-collapse: collapse;
          }

          .table-proto th,
          .table-proto td {
            white-space: nowrap;
          }

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

          @media (max-width: 900px) {
            .cards-side-by-side {
              flex-direction: column !important;
            }

            .left-card-form,
            .right-card-table {
              width: 100% !important;
              max-width: 100% !important;
              flex: 1 1 100% !important;
            }
          }

          @media (max-width: 576px) {
            .plant-page-wrapper {
              padding-left: 10px !important;
              padding-right: 10px !important;
            }

            .cards-side-by-side {
              gap: 15px !important;
            }

            .prototype-card {
              border-radius: 8px;
            }
          }
        `}
      </style>
    </div>
  );
}

export default Components;