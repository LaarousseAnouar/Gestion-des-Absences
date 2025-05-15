// import React, { useState } from "react";
// import axios from "axios";

// const statusOptions = ["présent", "absent"];

// const capitalize = (str) => str && str.charAt(0).toUpperCase() + str.slice(1);

// const getStatusColor = (status) => {
//     if (status === "present") {
//       return "bg-green-500 text-white";  // Green for 'present'
//     }
//     if (status === "absent") {
//       return "bg-red-500 text-white";  // Red for 'absent'
//     }
//     return "bg-gray-300 text-gray-700";  // Default gray for other statuses
//   };

// const AttendanceStatusCell = ({ id, session, currentStatus, date, type, onUpdate, className }) => {
//   const [editing, setEditing] = useState(false);
//   const [newStatus, setNewStatus] = useState(currentStatus || "");

//   const handleChange = async (e) => {
//     const selectedStatus = e.target.value;
//     setNewStatus(selectedStatus);

//     try {
//       await axios.patch("http://localhost:3000/api/attendance", {
//         id,
//         date,
//         type,
//         session,
//         status: selectedStatus,
//       });
//       onUpdate(id, session, selectedStatus);
//       setEditing(false);
//     } catch (err) {
//       console.error("Erreur lors de la mise à jour du statut :", err);
//       alert("Erreur lors de la mise à jour. Veuillez réessayer.");
//     }
//   };

//   return (
//     <>
//       {editing ? (
//         <select
//           value={newStatus}
//           onChange={handleChange}
//           onBlur={() => setEditing(false)}
//           autoFocus
//           className={className}
//         >
//           {["présent", "absent", "absent justifié"].map((status) => (
//             <option key={status} value={status}>
//               {capitalize(status)}
//             </option>
//           ))}
//         </select>
//       ) : (
//         <span
//           className={`${className} cursor-pointer`}
//           onClick={() => setEditing(true)}
//           title="Cliquez pour modifier"
//         >
//           {capitalize(newStatus) || "Aucune présence"}
//         </span>
//       )}
//     </>
//   );
// };


// export default AttendanceStatusCell;
