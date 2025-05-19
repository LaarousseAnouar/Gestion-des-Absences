import React, { useState } from "react";
import axios from "axios";

const capitalize = (str) => str && str.charAt(0).toUpperCase() + str.slice(1);

const AttendanceStatusCell = ({ id, session, currentStatus, date, type, onUpdate }) => {
  const [editing, setEditing] = React.useState(false);
  const [newStatus, setNewStatus] = React.useState(currentStatus || "");

  const handleChange = async (e) => {
    const selectedStatus = e.target.value;
    setNewStatus(selectedStatus);

    try {
      // Mise à jour du statut dans la base de données
      await axios.patch("http://localhost:3000/api/attendance", {
        id,
        date,
        type,
        session,
        status: selectedStatus,
      });

      // Appelle la fonction onUpdate pour informer le parent
      if (typeof onUpdate === "function") {
        onUpdate(id, session, selectedStatus);  // Mise à jour du seul statut modifié
      }
      setEditing(false);
    } catch (err) {
      console.error("Erreur lors de la mise à jour du statut :", err);
      alert("Erreur lors de la mise à jour. Veuillez réessayer.");
    }
  };

  return editing ? (
    <select
      value={newStatus}
      onChange={handleChange}
      onBlur={() => setEditing(false)}
      autoFocus
      className="rounded px-1 text-sm bg-white text-gray-900 border border-gray-300"
    >
      {["present", "absent"].map(status => (
        <option key={status} value={status}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </option>
      ))}
    </select>
  ) : (
    <span
      className="cursor-pointer"
      onClick={() => setEditing(true)}
      title="Cliquez pour modifier"
    >
      {newStatus.charAt(0).toUpperCase() + newStatus.slice(1) || "Aucune présence"}
    </span>
  );
};


export default AttendanceStatusCell;
