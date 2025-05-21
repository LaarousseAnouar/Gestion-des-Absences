import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Ajoutez cette ligne pour importer Link
import axios from "axios";

const DashboardAdmin = () => {
  const [sectionActive, setSectionActive] = useState("statistique");
  const [adminName, setAdminName] = useState('');
  const [showMoreFormation, setShowMoreFormation] = useState(false);
  const [showMoreGroup, setShowMoreGroup] = useState(false);
  const [showMoreProf, setShowMoreProf] = useState(false);

  const toggleFormation = () => setShowMoreFormation(!showMoreFormation);
  const toggleGroup = () => setShowMoreGroup(!showMoreGroup);
  const toggleProf = () => setShowMoreProf(!showMoreProf);
  const [formationId, setFormationId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [professorId, setProfessorId] = useState('');

  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formations, setFormations] = useState([]);  // Liste des formations
  const [groups, setGroups] = useState([]);  // Liste des groupes
  const [selectedFormation, setSelectedFormation] = useState("");  // Formation sélectionnée
  const [selectedGroup, setSelectedGroup] = useState("");  // Groupe sélectionné
  const [selectedProf, setSelectedProf] = useState(null);
  const [emploiDuTemps, setEmploiDuTemps] = useState(null);
  const [emploiDuTempsVisible, setEmploiDuTempsVisible] = useState(false);


  
  useEffect(() => {
    const fetchAdminName = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/admin-name', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const data = await response.json();
        if (response.ok) {
          setAdminName(data.name); // Assurez-vous que le nom est correctement assigné
        } else {
          console.error('Erreur lors de la récupération du nom de l\'administrateur');
        }
      } catch (err) {
        console.error('Erreur lors du chargement du nom de l\'administrateur', err);
      }
    };

    fetchAdminName();
  }, []);

  useEffect(() => {
    const fetchProfessors = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3000/api/employees/professors');
        if (!response.ok) throw new Error('Erreur lors du chargement des professeurs');
        const data = await response.json();
        setProfessors(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessors();
  }, []);

  // Fetch formations list
 useEffect(() => {
  const fetchFormations = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/formations");
      const data = await res.json();
      setFormations(data);
    } catch (err) {
      console.error("Erreur lors de la récupération des formations :", err);
    }
  };
  fetchFormations();
}, []);

// Charger les groupes en fonction du nom de la formation sélectionnée
useEffect(() => {
  if (!selectedFormation) {
    setGroups([]);
    setSelectedGroup(null);
    return;
  }

  const fetchGroups = async () => {
    try {
      // Ici on envoie le nom de la formation au backend (et pas son id)
      const formationNom = encodeURIComponent(selectedFormation.nom);
      const res = await fetch(`http://localhost:3000/api/groups?formation=${formationNom}`);
      const data = await res.json();

      if (res.ok) {
        setGroups(data);
        setSelectedGroup(null);
      } else {
        // Gestion erreur backend (ex: 404)
        setGroups([]);
        setSelectedGroup(null);
        console.error(data.error);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des groupes :", err);
    }
  };

  fetchGroups();
}, [selectedFormation]);



const fetchEmploiDuTempsGroupe = async () => {
  if (!selectedGroup) {
    alert("Veuillez sélectionner un groupe");
    return;
  }
  try {
    const res = await fetch(`http://localhost:3000/api/group/${selectedGroup}`);
    if (!res.ok) throw new Error("Erreur lors du chargement de l'emploi du temps du groupe");
    const data = await res.json();
    setEmploiDuTemps(data.emploiDuTempsBase64); // mets à jour l'état avec l'image base64
    setEmploiDuTempsVisible(true);
  } catch (err) {
    console.error(err);
    alert("Erreur lors du chargement de l'emploi du temps du groupe");
  }
};


  const fetchEmploiDuTempsProf = async () => {
    if (!selectedProf) {
      alert("Veuillez sélectionner un professeur");
      return;
    }
    try {
      const res = await fetch(`http://localhost:3000/api/prof/${selectedProf}`);
      if (!res.ok) throw new Error("Erreur lors du chargement de l'emploi du temps du professeur");
      const data = await res.json();
      setEmploiDuTemps(data.emploiDuTempsBase64);
      setEmploiDuTempsVisible(true);
    } catch (err) {
      console.error(err);
      alert("Erreur lors du chargement de l'emploi du temps du professeur");
    }
  };

  const toggleEmploiDuTemps = () => {
    setEmploiDuTempsVisible(!emploiDuTempsVisible);
  };


  const handleStatistiqueClick = () => {
    setSectionActive("statistique");
    setEmploiDuTemps(false);
  };

  const handleEmploiTempsClick = () => {
    setSectionActive("emploi_du_temps");
    setEmploiDuTemps(!emploiDuTemps); // Toggle the Emploi du Temps view
  };
  // Fonction pour afficher l'emploi du temps
  const handleFormationChange = (e) => setFormationId(e.target.value);
  const handleGroupChange = (e) => setGroupId(e.target.value);
  const handleProfessorChange = (e) => setProfessorId(e.target.value);

  

    

  const CarteInfo = ({ titre, apiUrl }) => {
  const [ouvert, setOuvert] = useState(false);
  const [donnees, setDonnees] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [hover, setHover] = useState(false);

  const basculerCarte = async () => {
    if (!ouvert && donnees === null) {
      setChargement(true);
      try {
        const reponse = await fetch(apiUrl);
        const resultat = await reponse.json();
        setDonnees(resultat.count);
      } catch (erreur) {
        console.error('Erreur lors du chargement:', erreur);
      }
      setChargement(false);
    }
    setOuvert(!ouvert);
  };

  return (
    <div
      className={`
        bg-[#4B0082] text-white rounded-lg shadow-md transition-all duration-300 overflow-hidden
        ${hover ? 'w-64 max-h-64' : 'w-48 max-h-48'}
      `}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        onClick={basculerCarte}
      >
        <h2 className="text-sm font-semibold truncate">{titre}</h2>
      </div>

      <div
        className={`
          px-4 bg-white transition-all duration-300 overflow-hidden
          ${ouvert ? 'max-h-40 py-3 opacity-100' : 'max-h-0 py-0 opacity-0'}
        `}
      >
        {chargement ? (
          <p className="text-gray-500 text-xs">Chargement...</p>
        ) : donnees !== null ? (
          <p className="text-[#4B0082] text-lg font-semibold">Nombre : {donnees}</p>
        ) : null}
      </div>
    </div>
  );
};


  return (
    <div className="flex">
      <div className="bg-[#FF6F15] h-screen w-64 fixed top-0 left-0 flex flex-col items-center pt-10 px-6">
        <img src="/images/logo.webp" alt="ITBP Logo" className="w-3/4 mb-8" />
        
        <a
          href="#statistique"
          onClick={handleStatistiqueClick}
          className={`text-white px-6 py-3 w-full text-left flex items-center rounded-lg mb-4 transition duration-300 ${sectionActive === "statistique" ? "font-bold text-black border-2 border-black" : "hover:bg-[#e67210]"}`}
        >
          Statistique
        </a>

        <a
          href="#emploi-du-temps"
          onClick={handleEmploiTempsClick}
          className={`text-white px-6 py-3 w-full text-left flex items-center rounded-lg mb-4 transition duration-300 ${sectionActive === "emploi_du_temps" ? "font-bold text-black border-2 border-black" : "hover:bg-[#e67210]"}`}
        >
          Emploi du temps
        </a>

        <Link
            to="/gestion-global"
            className="text-white px-6 py-3 w-full text-left flex items-center hover:bg-[#e67210] rounded-lg mb-4 transition duration-300"
          >
            Gestion Global
          </Link>

        <a href="#logout" className="text-white px-6 py-3 w-full text-left flex items-center hover:bg-[#e67210] rounded-lg mt-auto transition duration-300">
          Log out
        </a>
      </div>

      <div className="ml-64 p-10 w-full bg-white flex flex-col items-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-4 text-center">Vue d'ensemble</h1>
        <p className="text-gray-600 text-lg mb-12 text-center">
          Bienvenue, {adminName ? adminName : 'Utilisateur non trouvé'} ! Votre progression est excellente.
        </p>

       {sectionActive === "statistique" && (
  <div className="flex justify-center w-full space-x-8">
    <CarteInfo
      titre="Nombre d'employés"
      apiUrl="http://localhost:3000/api/employee-count"
    />
    <CarteInfo
      titre="Absences de la Journée (Employés)"
      apiUrl="http://localhost:3000/api/daily-absences?type=employees"
    />
    <CarteInfo
      titre="Absences de la Journée (Étudiants)"
      apiUrl="http://localhost:3000/api/daily-absences?type=students"
    />
    <CarteInfo
      titre="Présence de la Semaine (Employés)"
      apiUrl="http://localhost:3000/api/weekly-presence?type=employees"
    />
    <CarteInfo
      titre="Présence de la Semaine (Étudiants)"
      apiUrl="http://localhost:3000/api/weekly-presence?type=students"
    />
  </div>
)}

        {/*////////////////////////////////////////////////////////////////////////////////////////////////////// */}

{sectionActive === "emploi_du_temps" && emploiDuTemps && (
  <div className="flex justify-center w-full space-x-8">

    {/* Formation */}
    <div className="bg-white p-6 rounded-lg shadow-lg w-80 border border-gray-300 transform transition duration-300 hover:scale-105">
      <h2 className="font-bold text-xl text-center mb-4">Formation</h2>
      <div className="space-y-4 max-h-60 overflow-y-auto">
        {formations.length === 0 && <p>Aucune formation disponible</p>}
        {(showMoreFormation ? formations : formations.slice(0, 3)).map((formation) => (
          <div key={formation.id} className="flex items-center">
            <input
              type="radio"
              className="mr-2"
              id={`formation-${formation.id}`}
              name="formation"
              checked={selectedFormation?.id === formation.id}
              onChange={() => setSelectedFormation(formation)}
            />
            <label htmlFor={`formation-${formation.id}`}>{formation.nom}</label>
          </div>
        ))}
        {formations.length > 3 && (
          <button
            onClick={() => setShowMoreFormation(!showMoreFormation)}
            className="text-blue-500 mt-2"
          >
            {showMoreFormation ? "Voir moins" : "Voir plus"}
          </button>
        )}
      </div>
    </div>

    {/* Groupes */}
    <div className="bg-white p-6 rounded-lg shadow-lg w-80 border border-gray-300 transform transition duration-300 hover:scale-105">
      <h2 className="font-bold text-xl text-center mb-4">Groupes</h2>
      <div className="space-y-4 max-h-60 overflow-y-auto">
        {!selectedFormation && <p>Veuillez sélectionner une formation d'abord</p>}
        {selectedFormation && groups.length === 0 && <p>Aucun groupe disponible pour cette formation</p>}
        {(showMoreGroup ? groups : groups.slice(0, 3)).map((group) => (
          <div key={group.id} className="flex items-center">
            <input
              type="radio"
              className="mr-2"
              id={`groupe-${group.id}`}
              name="groupe"
              checked={selectedGroup === group.id}
              onChange={() => setSelectedGroup(group.id)}
            />
            <label htmlFor={`groupe-${group.id}`}>{group.nom}</label>
          </div>
        ))}
        {groups.length > 3 && (
          <button
            onClick={() => setShowMoreGroup(!showMoreGroup)}
            className="text-blue-500 mt-2"
          >
            {showMoreGroup ? "Voir moins" : "Voir plus"}
          </button>
        )}
      </div>
    </div>

    {/* Professeurs */}
    <div className="bg-white p-6 rounded-lg shadow-lg w-80 border border-gray-300 transform transition duration-300 hover:scale-105">
      <h2 className="font-bold text-xl text-center mb-4">Professeurs</h2>
      <div className="space-y-4 max-h-60 overflow-y-auto">
        {professors.length === 0 && <p>Aucun professeur disponible</p>}
        {(showMoreProf ? professors : professors.slice(0, 3)).map((prof) => (
          <div key={prof.id} className="flex items-center">
            <input
              type="radio"
              className="mr-2"
              id={`prof-${prof.id}`}
              name="professeur"
              checked={selectedProf === prof.id}
              onChange={() => setSelectedProf(prof.id)}
            />
            <label htmlFor={`prof-${prof.id}`}>{prof.name}</label>
          </div>
        ))}
        {professors.length > 3 && (
          <button
            onClick={() => setShowMoreProf(!showMoreProf)}
            className="text-blue-500 mt-2"
          >
            {showMoreProf ? "Voir moins" : "Voir plus"}
          </button>
        )}
      </div>
    </div>

  </div>
)}

{/* Boutons pour afficher l'Emploi du Temps groupe ou professeur */}
{sectionActive === "emploi_du_temps" && (
  <div className="flex justify-center space-x-4 mt-6">
    <button
      onClick={fetchEmploiDuTempsGroupe}
      disabled={!selectedGroup}
      className={`py-2 px-4 rounded-lg ${selectedGroup ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-300 cursor-not-allowed'}`}
    >
      Afficher l'emploi du temps du groupe
    </button>

    <button
      onClick={fetchEmploiDuTempsProf}
      disabled={!selectedProf}
      className={`py-2 px-4 rounded-lg ${selectedProf ? 'bg-purple-500 hover:bg-purple-600 text-white' : 'bg-gray-300 cursor-not-allowed'}`}
    >
      Afficher l'emploi du temps du professeur
    </button>

    {emploiDuTempsVisible && (
      <button
        onClick={toggleEmploiDuTemps}
        className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
      >
        Cacher l'emploi du temps
      </button>
    )}
  </div>
)}

{/* Affichage de l'Emploi du Temps */}
{emploiDuTempsVisible && emploiDuTemps && (
  <div className="mt-6 bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl mx-auto">
    <h3 className="font-bold text-xl text-center mb-4">Emploi du Temps</h3>
    <img
      src={`data:image/png;base64,${emploiDuTemps}`}
      alt="Emploi du temps"
      className="w-full rounded-lg shadow-lg"
    />
  </div>
)}

      </div>
    </div>
  );
};
export default DashboardAdmin;
