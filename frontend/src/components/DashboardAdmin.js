import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Ajoutez cette ligne pour importer Link

const DashboardAdmin = () => {
  const [sectionActive, setSectionActive] = useState("statistique");
  const [adminName, setAdminName] = useState('');
  const [emploiDuTemps, setEmploiDuTemps] = useState(false);
  const [showMoreFormation, setShowMoreFormation] = useState(false);
  const [showMoreGroup, setShowMoreGroup] = useState(false);
  const [showMoreProf, setShowMoreProf] = useState(false);

  const toggleFormation = () => setShowMoreFormation(!showMoreFormation);
  const toggleGroup = () => setShowMoreGroup(!showMoreGroup);
  const toggleProf = () => setShowMoreProf(!showMoreProf);
  const [isEmploiDuTempsVisible, setEmploiDuTempsVisible] = useState(false);
  const [formationId, setFormationId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [professorId, setProfessorId] = useState('');
  const [emploiDuTempsVisible] = useState(false);

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

  const toggleEmploiDuTemps = async () => {
    if (!formationId && !groupId && !professorId) {
      alert('Veuillez sélectionner au moins une formation, un groupe ou un professeur.');
      return;
    }

    let apiUrl = 'http://localhost:3000/api/v1/emploi-du-temps?';
    if (formationId) apiUrl += `formationId=${formationId}&`;
    if (groupId) apiUrl += `groupId=${groupId}&`;
    if (professorId) apiUrl += `professorId=${professorId}&`;

    apiUrl = apiUrl.slice(0, -1); // enlever le dernier '&'

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (response.ok) {
        console.log('Données reçues:', data);
        setEmploiDuTemps(data.emploi_du_temps); // Mettez à jour l'état avec les données Base64
        setEmploiDuTempsVisible(true);  // Affichez l'élément
      } else {
        console.error('Aucun emploi du temps trouvé');
      }
    } catch (err) {
      console.error('Erreur lors du chargement de l\'emploi du temps', err);
    }
  };

  

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
    {/* Card for Formation */}
    <div className="bg-white p-6 rounded-lg shadow-lg w-80 border border-gray-300 transform transition duration-300 hover:scale-105">
      <h2 className="font-bold text-xl text-center mb-4">Formation</h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Choisir une formation</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <input type="radio" className="mr-2" id="web" name="formation" />
              <label htmlFor="web">Développeur Web Expert</label>
            </div>
            <div className="flex items-center">
              <input type="radio" className="mr-2" id="securite" name="formation" />
              <label htmlFor="securite">Cybersécurité</label>
            </div>
            <div className="flex items-center">
              <input type="radio" className="mr-2" id="digitalM" name="formation" />
              <label htmlFor="digitalM">Digital Marketing</label>
            </div>

            {/* Show more button */}
            {showMoreFormation && (
              <>
                <div className="flex items-center">
                  <input type="radio" className="mr-2" id="graphicDesign" name="formation" />
                  <label htmlFor="graphicDesign">Graphic Design</label>
                </div>
                <div className="flex items-center">
                  <input type="radio" className="mr-2" id="dataAnalyst" name="formation" />
                  <label htmlFor="dataAnalyst">Data-Analyst</label>
                </div>
              </>
            )}
          </div>
          <button onClick={toggleFormation} className="text-blue-500 mt-2">
            {showMoreFormation ? "Voir moins" : "Voir plus"}
          </button>
        </div>
      </div>
    </div>

    {/* Card for Groupes */}
    <div className="bg-white p-6 rounded-lg shadow-lg w-80 border border-gray-300 transform transition duration-300 hover:scale-105">
      <h2 className="font-bold text-xl text-center mb-4">Groupes</h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Choisir un groupe</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <input type="radio" className="mr-2" id="g1" name="groupe" />
              <label htmlFor="g1">Groupe 1</label>
            </div>
            <div className="flex items-center">
              <input type="radio" className="mr-2" id="g2" name="groupe" />
              <label htmlFor="g2">Groupe 2</label>
            </div>
            <div className="flex items-center">
              <input type="radio" className="mr-2" id="g3" name="groupe" />
              <label htmlFor="g3">Groupe 3</label>
            </div>

            {/* Show more button */}
            {showMoreGroup && (
              <>
                <div className="flex items-center">
                  <input type="radio" className="mr-2" id="g4" name="groupe" />
                  <label htmlFor="g4">Groupe 4</label>
                </div>
                <div className="flex items-center">
                  <input type="radio" className="mr-2" id="g5" name="groupe" />
                  <label htmlFor="g5">Groupe 5</label>
                </div>
              </>
            )}
          </div>
          <button onClick={toggleGroup} className="text-blue-500 mt-2">
            {showMoreGroup ? "Voir moins" : "Voir plus"}
          </button>
        </div>
      </div>
    </div>

    {/* Card for Professeurs */}
    <div className="bg-white p-6 rounded-lg shadow-lg w-80 border border-gray-300 transform transition duration-300 hover:scale-105">
      <h2 className="font-bold text-xl text-center mb-4">Professeurs</h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Choisir un professeur</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <input type="radio" className="mr-2" id="profKhalil" name="professeur" />
              <label htmlFor="profKhalil">Mr Achaachaa khalil</label>
            </div>
            <div className="flex items-center">
              <input type="radio" className="mr-2" id="profAyoub" name="professeur" />
              <label htmlFor="profAyoub">Mr Ayyoub Benzakour</label>
            </div>
            <div className="flex items-center">
              <input type="radio" className="mr-2" id="profIssam" name="professeur" />
              <label htmlFor="profIssam">Mr Issam Jaroudi</label>
            </div>

            {/* Show more button */}
            {showMoreProf && (
              <>
                <div className="flex items-center">
                  <input type="radio" className="mr-2" id="profSalah" name="professeur" />
                  <label htmlFor="profSalah">Mr Salah-Eddine Diouri</label>
                </div>
                <div className="flex items-center">
                  <input type="radio" className="mr-2" id="profSalma" name="professeur" />
                  <label htmlFor="profSalma">Mlle Salma Fennane</label>
                </div>
                <div className="flex items-center">
                  <input type="radio" className="mr-2" id="profOumaima" name="professeur" />
                  <label htmlFor="profOumaima">Mlle Oumaima Laamoumi</label>
                </div>
              </>
            )}
          </div>
          <button onClick={toggleProf} className="text-blue-500 mt-2">
            {showMoreProf ? "Voir moins" : "Voir plus"}
          </button>
        </div>
      </div>
      
    </div>
    
  </div>
)}

        {/*////////////////////////////////////////////////////////////////////////////////////////////////////// */}

{/* Bouton pour afficher l'Emploi du Temps */}
{sectionActive === "emploi_du_temps" && (
          <button
            onClick={toggleEmploiDuTemps}
            className="mt-6 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
          >
            {isEmploiDuTempsVisible ? 'Cacher l\'emploi du temps' : 'Afficher l\'emploi du temps'}
          </button>
        )}

        {/* Affichage de l'Emploi du Temps */}
        {emploiDuTempsVisible && emploiDuTemps && (
  <div className="mt-6 bg-white p-6 rounded-lg shadow-lg w-full">
    <h3 className="font-bold text-xl text-center mb-4">Emploi du Temps</h3>
    <img 
      src={`data:image/png;base64,${emploiDuTemps}`} 
      alt="Emploi du temps" 
      className="mt-2 w-full max-w-4xl rounded-lg shadow-lg" 
    />
  </div>
)}

      </div>
    </div>
  );
};
export default DashboardAdmin;
