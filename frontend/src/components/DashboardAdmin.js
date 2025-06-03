import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Ajoutez cette ligne pour importer Link
import axios from "axios";
import '../index.css';  // ou './globals.css' selon le nom et emplacement
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashboardAdmin = () => {
  const [sectionActive, setSectionActive] = useState("statistique");
  const [adminName, setAdminName] = useState('');
  const [showMoreFormation, setShowMoreFormation] = useState(false);
  const [showMoreGroup, setShowMoreGroup] = useState(false);
  const [showMoreProf, setShowMoreProf] = useState(false);
  const token = localStorage.getItem('token'); // Récupère le token depuis localStorage

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
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]); // Date par défaut : aujourd'hui
  const [showCourses, setShowCourses] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [noteText, setNoteText] = React.useState("");
  const [coursHours, setCoursHours] = useState([]);
const [isDateFiltered, setIsDateFiltered] = useState(false);

const [dataEmployes, setDataEmployes] = useState(null);
  const [dataEtudiants, setDataEtudiants] = useState(null);
  const fullText = `Bonjour, ${adminName || 'Utilisateur non trouvé'} ! Votre progression est excellente.`;
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);
  const [data, setData] = useState(null);
  const [dataFormationsGroupes, setDataFormationsGroupes] = useState(null);


  useEffect(() => {
  const fetchAdminName = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin-name', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Ajoute un header Authorization si nécessaire, ex:
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error('Erreur lors de la récupération du nom de l\'administrateur');
        return; // quitte la fonction si erreur
      }

      const data = await response.json();
      setAdminName(data.name); // affecte le nom reçu
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


useEffect(() => {
  if (!selectedProfessor) {
    setCoursHours([]);
    return;
  }

  const fetchCoursHours = async () => {
    try {
      let url = `http://localhost:3000/api/cours_hours/teacher/${selectedProfessor.id}`;

      if (isDateFiltered && selectedDate) {
        // Filtrer uniquement si l'utilisateur a choisi une date
        url += `?date=${selectedDate}`;
      }
      // Sinon (au début), récupérer tous les cours sans filtre

      const res = await fetch(url);
      if (!res.ok) throw new Error("Erreur lors du chargement des heures de cours");
      const data = await res.json();
      setCoursHours(data);
    } catch (err) {
      console.error(err);
    }
  };

  fetchCoursHours();
}, [selectedProfessor, selectedDate, isDateFiltered]);


useEffect(() => {
    // Fonction pour récupérer les données employés
    const fetchDataEmployes = async () => {
      try {
        // Récupérer chaque valeur via ton API (5 appels ici, à optimiser si possible)
        const responses = await Promise.all([
          fetch('http://localhost:3000/api/employee-count'),
          fetch('http://localhost:3000/api/daily-absences?type=employees'),
          fetch('http://localhost:3000/api/daily-presence?type=employees'),
          fetch('http://localhost:3000/api/weekly-presence?type=employees'),
          fetch('http://localhost:3000/api/weekly-absences?type=employees'),
        ]);
        const results = await Promise.all(responses.map(r => r.json()));

        setDataEmployes({
          labels: [
            "Nombre d'employés",
            "Absences Journée",
            "Présence Journée",
            "Présence Semaine",
            "Absences Semaine",
          ],
          datasets: [{
            label: 'Employés',
            data: results.map(res => Number(res.count)),
            backgroundColor: '#4B0082',
          }],
        });
      } catch (error) {
        console.error('Erreur récupération données employés :', error);
      }
    };

    // Fonction pour récupérer les données étudiants
    const fetchDataEtudiants = async () => {
      try {
        const responses = await Promise.all([
          fetch('http://localhost:3000/api/daily-absences?type=students'),
          fetch('http://localhost:3000/api/daily-presence?type=students'),
          fetch('http://localhost:3000/api/weekly-presence?type=students'),
          fetch('http://localhost:3000/api/weekly-absences?type=students'),
        ]);
        const results = await Promise.all(responses.map(r => r.json()));

        setDataEtudiants({
          labels: [
            "Absences Journée",
            "Présence Journée",
            "Présence Semaine",
            "Absences Semaine",
          ],
          datasets: [{
            label: 'Étudiants',
            data: results.map(res => Number(res.count)),
            backgroundColor: '#6A5ACD',
          }],
        });
      } catch (error) {
        console.error('Erreur récupération données étudiants :', error);
      }
    };

    fetchDataEmployes();
    fetchDataEtudiants();
  }, []);

  useEffect(() => {
    async function fetchFormationsGroupes() {
      try {
        const response = await fetch('http://localhost:3000/api/formations-groupes-etudiants');
        const formationsData = await response.json();

        const formations = Object.keys(formationsData);
        const groupesUniques = [
          ...new Set(
            Object.values(formationsData).flat().map(g => g.groupe)
          )
        ];

        const datasets = groupesUniques.map((groupe, index) => ({
          label: groupe,
          data: formations.map(formation => {
            const groupeData = formationsData[formation].find(g => g.groupe === groupe);
            return groupeData ? groupeData.nombre_etudiants : 0;
          }),
          backgroundColor: `hsl(${(index * 60) % 360}, 70%, 50%)`
        }));

        setDataFormationsGroupes({
          labels: formations,
          datasets: datasets
        });
      } catch (error) {
        console.error('Erreur chargement données formations/groupes :', error);
      }
    }

    fetchFormationsGroupes();
  }, []);
  
  // Function to toggle visibility of courses
  const handleFilterClick = () => {
    setShowFilter(prev => !prev);
  };

  const handleDateChange = (e) => {
  setSelectedDate(e.target.value);
  setIsDateFiltered(true); // on active le filtre dès que l'utilisateur change la date
};

  const handleProfessorSelect = (prof) => {
    setSelectedProfessor(prof);
    setShowFilter(false); // optionnel : fermer la liste après sélection
  };

  
  
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
  const handleGestionProfClick = (e) => {
  e.preventDefault();
  setSectionActive("gestion_prof");
  // tu peux ajouter ici la logique spécifique à ce clic si besoin
};

const formatInterval = (interval) => {
    if (!interval) return "-";
    const h = interval.hours ?? 0;
    const m = interval.minutes ?? 0;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};
  // // Fonction pour afficher l'emploi du temps
  // const handleFormationChange = (e) => setFormationId(e.target.value);
  // const handleGroupChange = (e) => setGroupId(e.target.value);
  // const handleProfessorChange = (e) => setProfessorId(e.target.value);

  

    

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
    bg-[#4B0082] text-white rounded-lg shadow-md transition-all duration-500 ease-in-out overflow-hidden
    ${hover ? 'w-[580px] max-h-[80px]' : 'w-[420px] max-h-[420px]'}
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


  const optionsDiagramme = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Résumé des performances' },
    },
    scales: { y: { beginAtZero: true } },
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: "Nombre d'étudiants par formation et groupe" }
    },
    scales: {
      x: { stacked: false },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        }
      }
    }
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

        <a
          href="#gestion-prof"
          onClick={handleGestionProfClick}
          className={`text-white px-6 py-3 w-full text-left flex items-center rounded-lg mb-4 transition duration-300 ${
            sectionActive === "gestion_prof" ? "font-bold text-black border-2 border-black" : "hover:bg-[#e67210]"
          }`}
        >
          Gestion des prof
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

        <h1
        className="
          text-5xl font-extrabold text-indigo-700 mb-6 text-center tracking-wide drop-shadow-md
          transition-transform duration-300 ease-in-out
          hover:scale-105 hover:text-indigo-900
        "
        >
        Votre espace administrateur
        </h1>
        <p
          className="
            max-w-xl mx-auto text-center text-gray-700 text-xl leading-relaxed mb-16
            transition-colors duration-400 ease-in-out hover:text-indigo-600
          "
        >
          Bonjour, <span className="font-semibold">{adminName || 'Utilisateur non trouvé'}</span> ! Votre progression est excellente.
        </p>



{sectionActive === "statistique" && (
  <>
  {/* Section Employés */}
  <section className="mb-16 bg-indigo-50 p-6 rounded-lg shadow-sm">
    <h2 className="text-3xl font-bold text-indigo-700 mb-6 text-center">
      Informations Employés
    </h2>
    <div className="flex gap-x-8 max-w-6xl mx-auto mb-10">
      <CarteInfo titre="Nombre d'employés" apiUrl="http://localhost:3000/api/employee-count" />
      <CarteInfo titre="Absences de la Journée (Employés)" apiUrl="http://localhost:3000/api/daily-absences?type=employees" />
      <CarteInfo titre="Présence de la Journée (Employés)" apiUrl="http://localhost:3000/api/daily-presence?type=employees" />
      <CarteInfo titre="Présence de la Semaine (Employés)" apiUrl="http://localhost:3000/api/weekly-presence?type=employees" />
      <CarteInfo titre="Absences de la Semaine (Employés)" apiUrl="http://localhost:3000/api/weekly-absences?type=employees" />
    </div>
    <div className="max-w-4xl mx-auto px-4">
      {dataEmployes ? (
        <Bar data={dataEmployes} options={optionsDiagramme} />
      ) : (
        <p className="text-center text-gray-500">Chargement des données employés...</p>
      )}
    </div>
  </section>

  <hr className="border-indigo-300 my-12 mx-auto max-w-4xl" />

  {/* Section Étudiants */}
  <section className="bg-indigo-50 p-6 rounded-lg shadow-sm">
    <h2 className="text-3xl font-bold text-indigo-700 mb-6 text-center">
      Informations Étudiants
    </h2>
    <div className="flex gap-x-8 max-w-6xl mx-auto mb-10">
      <CarteInfo titre="Absences de la Journée (Étudiants)" apiUrl="http://localhost:3000/api/daily-absences?type=students" />
      <CarteInfo titre="Présence de la Journée (Étudiants)" apiUrl="http://localhost:3000/api/daily-presence?type=students" />
      <CarteInfo titre="Présence de la Semaine (Étudiants)" apiUrl="http://localhost:3000/api/weekly-presence?type=students" />
      <CarteInfo titre="Absences de la Semaine (Étudiants)" apiUrl="http://localhost:3000/api/weekly-absences?type=students" />
    </div>
    <div className="max-w-4xl mx-auto px-4">
      {dataEtudiants ? (
        <Bar data={dataEtudiants} options={optionsDiagramme} />
      ) : (
        <p className="text-center text-gray-500">Chargement des données étudiants...</p>
      )}
    </div>
  </section>

  <hr className="border-indigo-300 my-12 mx-auto max-w-4xl" />

  {/* Section Formations et Groupes */}
  <section className="bg-indigo-50 p-6 rounded-lg shadow-sm mb-16">
  <div
    className="mx-auto px-4"
    style={{ maxWidth: '1160px', minWidth: '1160px' }} // force largeur fixe
  >
    <h2 className="text-3xl font-bold text-indigo-700 mb-6 text-center">
      Répartition des étudiants par formation et groupe
    </h2>

    {dataFormationsGroupes ? (
      <Bar data={dataFormationsGroupes} options={optionsDiagramme} />
    ) : (
      <p className="text-center text-gray-500">Chargement des données formations et groupes...</p>
    )}
  </div>
</section>





</>


)}

         

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



{sectionActive === "gestion_prof" && (
  <div className="p-6 bg-white rounded-lg shadow-xl max-w-8xl mx-auto mt-6 min-h-[500px]">
    {/* Icone de filtre */}
    <div className="flex justify-between items-center mb-4">
      {/* Bouton Filtrer */}
      <button 
        className="bg-[#2B3A67] text-white p-2 rounded-md shadow-md hover:bg-[#1a2b43] flex items-center gap-2"
        onClick={handleFilterClick}
      >
        <i className="fas fa-filter text-2xl"></i>
        Filtrer
        <i className="fas fa-chevron-down text-2xl mt-1 text-white"></i>
      </button>

      {/* Icone Date */}
      <div className="flex items-center gap-2">
        <i className="fas fa-calendar-alt text-2xl text-[#2B3A67]"></i>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="p-2 border rounded-md"
          defaultValue={new Date().toISOString().split("T")[0]}
        />
      </div>
    </div>

    {showFilter && (
      <div className="border p-4 rounded-md max-h-60 overflow-y-auto bg-gray-50">
        {loading && <p>Chargement...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && professors.length === 0 && <p>Aucun professeur trouvé</p>}

        <ul>
          {professors.map(prof => (
            <li
              key={prof.id}
              className={`p-2 cursor-pointer hover:bg-[#2B3A67] hover:text-white rounded ${
                selectedProfessor?.id === prof.id ? 'bg-[#2B3A67] text-white' : ''
              }`}
              onClick={() => handleProfessorSelect(prof)}
            >
              {prof.name}
            </li>
          ))}
        </ul>
      </div>
    )}

    {/* Partie tableau toujours affichée, même si pas de prof */}
    <div className="mt-4">
      {selectedProfessor ? (
        <>
          <div>
            <strong>Professeur sélectionné : </strong> {selectedProfessor.name}
          </div>

          <table className="min-w-full table-auto border-collapse border border-gray-300 mt-6">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-6 py-3 text-left font-semibold text-gray-700">Date</th>
                <th className="border border-gray-300 px-6 py-3 text-left font-semibold text-gray-700">Formation</th>
                <th className="border border-gray-300 px-6 py-3 text-left font-semibold text-gray-700">Groupe</th>
                <th className="border border-gray-300 px-6 py-3 text-center font-semibold text-gray-700">Début</th>
                <th className="border border-gray-300 px-6 py-3 text-center font-semibold text-gray-700">Fin</th>
                <th className="border border-gray-300 px-6 py-3 text-center font-semibold text-gray-700">Pause</th>
                <th className="border border-gray-300 px-6 py-3 text-center font-semibold text-gray-700">Total</th>
              </tr>
            </thead>
            <tbody>
              {coursHours.length > 0 ? (
                coursHours.map((ch, index) => (
                  <tr
                    key={ch.id}
                    className={`transition-transform duration-300 hover:scale-105 hover:shadow-lg ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="border border-gray-300 px-6 py-3 text-left">{new Date(ch.date).toLocaleDateString()}</td>
                    <td className="border border-gray-300 px-6 py-3 text-left">{ch.formation_name}</td>
                    <td className="border border-gray-300 px-6 py-3 text-left">{ch.groupe_name}</td>
                    <td className="border border-gray-300 px-6 py-3 text-center">{ch.start_time}</td>
                    <td className="border border-gray-300 px-6 py-3 text-center">{ch.end_time ?? "-"}</td>
                    <td className="border border-gray-300 px-6 py-3 text-center">{formatInterval(ch.pause_time)}</td>
                    <td className="border border-gray-300 px-6 py-3 text-center">{formatInterval(ch.total_hours)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-500">
                    Aucun cours disponible pour ce professeur.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      ) : (
        <div className="text-center py-6 text-gray-500">
          Veuillez sélectionner un professeur pour afficher les cours.
        </div>
      )}
    </div>
  </div>
)}



      </div>
    </div>
  );
};
export default DashboardAdmin;
