import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Assurez-vous que axios est installé

const DashboardProf = () => {
  const [activeSection, setActiveSection] = useState("debutCours");
  const [professorData, setProfessorData] = useState(null); // État pour les données du professeur
  const [isLoading, setIsLoading] = useState(true); // Nouveau state pour gérer le chargement
  const [error, setError] = useState(null); // Gérer les erreurs

  // Récupérer l'email depuis le localStorage
  const user = JSON.parse(localStorage.getItem('user')); // Convertir la chaîne en objet
  const email = user ? user.email : null; // Récupérer l'email du professeur
  const token = localStorage.getItem('token'); // Récupère le token depuis localStorage

  const [startTime, setStartTime] = useState(null); // État pour l'heure de début du cours
  const [elapsedTime, setElapsedTime] = useState(0); // État pour le temps écoulé en secondes
  const [timerActive, setTimerActive] = useState(false); // Pour savoir si le timer est en cours

  const [isRunning, setIsRunning] = useState(false); // Suivi de l'état du compteur
  let timer; // Variable pour le timer
  const [selectedFormation, setSelectedFormation] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [formations, setFormations] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showCourses, setShowCourses] = useState(false);


  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]); // Date par défaut : aujourd'hui

  const [view, setView] = useState(''); // 'present', 'absent', 'total'
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});



  // Vérification si l'email est disponible
  if (!email) {
    console.error('L\'email n\'est pas disponible!');
  }

  // Fonction pour récupérer les informations du professeur (nom, prénom, image, emploi du temps)
  useEffect(() => {
    const fetchProfessorData = async () => {
      try {
        // Effectuer la requête pour récupérer les données du professeur
        const response = await axios.get(`http://localhost:3000/api/professor/${email}/schedule`, {
          headers: {
            'Authorization': `Bearer ${token}`, // Remplacez `token` par la valeur réelle de votre token
          },
        });
        setProfessorData(response.data); // Stocke les données récupérées dans l'état
      } catch (error) {
        console.error('Erreur lors de la récupération des informations du professeur:', error);
        setError('Erreur lors de la récupération des informations du professeur. Veuillez réessayer plus tard.'); // Gérer l'erreur
      } finally {
        setIsLoading(false); // Fin du chargement
      }
    };

    if (email) {
      fetchProfessorData();  // Si l'email est disponible, on fait la requête
    }
  }, [email]);

  useEffect(() => {
    if (timerActive) {
      timer = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1); // Incrémente chaque seconde
      }, 1000);
    } else {
      clearInterval(timer); // Arrêter le timer lorsque timerActive devient false
    }

    return () => clearInterval(timer); // Nettoyer l'intervalle lors du démontage du composant
  }, [timerActive]);

  //+}++++++}++}}}+}}}}++++++++++++++}}}}}+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++}
  useEffect(() => {
    fetchCourses();
  }, []);
  
  // Fetch groups when selected course changes
  useEffect(() => {
    if (selectedCourse) {
      fetchGroupsByFormation(selectedCourse);
    }
  }, [selectedCourse]);
  

  useEffect(() => {
    // Fetch all students data
    axios.get('http://localhost:3000/api/students')
      .then(response => {
        setStudents(response.data);
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des étudiants :", error);
      });
  }, []);

  useEffect(() => {
    students.forEach(student => {
      axios.get(`http://localhost:3000/api/attendance?date=${selectedDate}&id=${student.id}&type=student`)
        .then(response => {
          // Vérifier si la réponse contient bien le champ 'status'
          const status = response.data.status;
          
          // Si 'status' est défini et valide, on l'utilise. Sinon, on définit 'aucune-présence'.
          setAttendance(prevState => ({
            ...prevState,
            [student.id]: status && (status === 'present' || status === 'absent') ? status : 'aucune-présence'
          }));
        })
        .catch(error => {
          console.error(`Erreur lors de la récupération de la présence pour l'étudiant ${student.id}:`, error);
          // Si l'appel API échoue, définir 'aucune-présence'
          setAttendance(prevState => ({
            ...prevState,
            [student.id]: 'aucune-présence'
          }));
        });
    });
  }, [selectedDate, students]);
  

  // Function to fetch courses
  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/formations', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      console.log("Fetched courses:", response.data);  // Log the fetched courses to ensure data is correct
      setFormations(response.data);  // Set courses to the state
    } catch (error) {
      setError('Erreur lors de la récupération des formations');
    }
  };
  
  // Function to fetch groups based on selected course
  const fetchGroupsByFormation = async (formationName) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/groups?formation=${formationName}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      console.log("Fetched groups:", response.data);  // Log the fetched groups to ensure data is correct
      setGroups(response.data);  // Set available groups for the selected formation
    } catch (error) {
      console.log('Error fetching groups:', error);  // Log the error if the request fails
      setError('Erreur lors de la récupération des groupes');
    }
  };
  
  // Function to handle course selection
  const handleFormationSelect = (event) => {
    const selectedFormationName = event.target.value;
    setSelectedCourse(selectedFormationName);  // Update selected course
  };
  
  // Function to handle group selection
  const handleGroupSelect = (event) => {
    setSelectedGroup(event.target.value);  // Update selected group
  };
  
  // Function to toggle visibility of courses
  const handleFilterClick = () => {
    setShowCourses(!showCourses);  // Toggle the visibility of courses
  };
  
  
  
//+}}++++++}++++++++}}}+}}}}}}}+}++++++++}}++++++++++++++++++++}}+++++}++++++++++++++++++++++++++++}}}}+}+}}}++++++++++++++++}}+++++++++++++++++
  // Affichage pendant le chargement
  if (isLoading) {
    return <div>Chargement des données...</div>;
  }

  // Affichage en cas d'erreur
  if (error) {
    return <div>{error}</div>;
  }

  const handleStartClick = () => {
    setIsRunning(true); // Déclencher le démarrage du compteur
    setTimerActive(true); // Activer le timer
  };

  // Fonction pour arrêter le compteur
  const handleStopClick = () => {
    setIsRunning(false); // Le compteur est arrêté
    setTimerActive(false); // Désactiver le timer
  };

  // Fonction pour reprendre le compteur
  const handleResumeClick = () => {
    if (!isRunning) {
      setIsRunning(true); // Relancer le compteur
      setTimerActive(true); // Réactiver le timer
    }
  };

  const handleFinishClick = () => {
    const userConfirmed = window.confirm("Voulez-vous vraiment terminer ce cours ?");
    if (userConfirmed) {
      // Si l'utilisateur confirme, on arrête le cours
      setIsRunning(false);
      setTimerActive(false);
      setElapsedTime(0); // Réinitialiser le temps si nécessaire
    }
  };
  
  // Formater le temps en heures:minutes:secondes
  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

// ++++}}}}++}++++++++++++}}}+}}}}}}}+++++++++++++++++}}+++++}}}}}}}++++}}}++++++}++++}
  const handleSectionChange = (section) => {
    setActiveSection(section); // Mettez à jour la section active
  };


  const handleDateChange = (e) => {
    setSelectedDate(e.target.value); // Stocke la date sélectionnée dans l'état
  };
  
  // +}+++++}+++}}}}}++}}}++}+}}}}+}}++++++}}++++++}}}}}}}+}}+}++++++++++++++}}+++++++}++++++++++++++++++++++++}
  const handleViewChange = (type) => {
    if (view === type) {
      setView('');
    } else {
      setView(type);
    }
  };

  // Filtrage des étudiants en fonction du statut
  const filteredStudents = students.filter(student => {
    if (view === 'present') return attendance[student.id] === 'present';
    if (view === 'absent') return attendance[student.id] === 'absent';
    return true; // Total, afficher tous les étudiants
  });

  return (
    <div className="flex min-h-screen max-w-full rounded-tr-3xl border border-r-0 border-b-0 border-[#2B3A67] overflow-hidden">
      {/* Sidebar créative avec numérotation */}
      <aside className="bg-gradient-to-r from-[#2B3A67] to-[#6D8AA3] w-56 flex flex-col items-center py-4 border-r border-[#D9E1F2] shadow-lg">
        <div className="flex flex-col items-center mt-4 mb-6">
          <img
            src="/images/logo.webp"
            alt="Logo de l'école"
            className="school-logo"
          />
          <h1 className="text-white font-merriweather font-bold text-lg text-center leading-5">
            ITEIP FES
          </h1>
        </div>

        <nav className="w-full flex flex-col space-y-6 mt-6">
          {/* Lien Début Cours */}
          <a
            onClick={() => handleSectionChange("debutCours")}
            className={`flex items-center gap-3 px-6 text-white font-semibold text-sm leading-5 hover:text-[#F0F4FB] cursor-pointer transition-all 
              ${activeSection === "debutCours" ? 'font-bold text-[#F0F4FB] border-2 border-[#F0F4FB] px-5 py-2 rounded-md' : ''}`}
          >
            <i className="fas fa-user-graduate text-white text-base"></i>
            Début Cours
          </a>
          <a
            onClick={() => handleSectionChange("emploiTemps")}
            className={`flex items-center gap-3 px-6 text-white font-semibold text-sm leading-5 hover:text-[#F0F4FB] cursor-pointer transition-all 
              ${activeSection === "emploiTemps" ? 'font-bold text-[#F0F4FB] border-2 border-[#F0F4FB] px-5 py-2 rounded-md' : ''}`}
          >
            <i className="fas fa-th-large text-white text-base"></i>
            Mon Emplois de Temps
          </a>
          {/* Lien Attendance */}
          <a
            onClick={() => handleSectionChange("attendance")}
            className={`flex items-center gap-3 px-6 text-white font-semibold text-sm leading-5 hover:text-[#F0F4FB] cursor-pointer transition-all 
              ${activeSection === "attendance" ? 'font-bold text-[#F0F4FB] border-2 border-[#F0F4FB] px-5 py-2 rounded-md' : ''}`}
          >
            <i className="fas fa-laptop-code text-white text-base"></i>
            Attendance
          </a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <header className="flex justify-end items-center gap-3 border-b border-[#D9E1F2] pb-3">
          {/* Afficher le nom, prénom et image du professeur */}
          {professorData && (
            <>
              <img
                alt="User profile"
                className="rounded-full w-8 h-8 object-cover"
                height="32"
                src={`data:image/png;base64,${professorData.image}`} // Affichage de l'image du professeur en base64
                width="32"
              />
              <button
                aria-expanded="false"
                aria-haspopup="true"
                className="text-[#2B3A67] font-normal text-sm leading-5 flex items-center gap-1 focus:outline-none"
              >
                {professorData.nom} {professorData.prenom}
                <i className="fas fa-chevron-down text-xs"></i>
              </button>
            </>
          )}
        </header>

        {/* Contenu dynamique en fonction de la section active */}
        <section className="mt-6">




        {activeSection === "debutCours" && (
  <div className="p-6 bg-white rounded-lg shadow-xl max-w-4xl mx-auto mt-6">
    {/* Icone de filtre */}
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-[#2B3A67] font-semibold text-xl leading-6 text-left">Début Un Cours</h2>

      {/* Bouton Filtrer */}
      <button 
        className="bg-[#2B3A67] text-white p-2 rounded-md shadow-md hover:bg-[#1a2b43] flex items-center gap-2"
        onClick={handleFilterClick} // Trigger filter functionality
      >
        <i className="fas fa-filter text-2xl"></i>
        Filtrer
        <i className="fas fa-chevron-down text-2xl mt-1 text-white"></i>
      </button>
    </div>

    {/* Section des Formations */}
    {showCourses && (
      <div className="space-y-4">
        <select 
          className="p-2 border rounded-md w-full"
          value={selectedCourse} 
          onChange={handleFormationSelect} // Handle selection of course
        >
          <option value="">Choisir une formation</option>
          {formations.length > 0 ? (
            formations.map((formation) => (
              <option key={formation.id} value={formation.nom} className="text-[#2B3A67]">
                {formation.nom}
              </option>
            ))
          ) : (
            <option value="">Aucune formation disponible</option>
          )}
        </select>
      </div>
    )}

    {/* Section des Groupes */}
    {selectedCourse && (
      <div className="space-y-4">
        <select 
          className="p-2 border rounded-md w-full mt-4"
          value={selectedGroup}
          onChange={handleGroupSelect} // Handle selection of group
        >
          <option value="">Choisir un groupe</option>
          {groups.length > 0 ? (
            groups.map((group) => (
              <option key={group.id} value={group.nom} className="text-[#2B3A67]">
                {group.nom}
              </option>
            ))
          ) : (
            <option value="">Aucun groupe disponible</option>
          )}
        </select>
      </div>
    )}


{/* Section 3 */}

<div className="space-y-4">
      {/* Démarrer le cours */}
      {!isRunning && (
        <button className="bg-purple-100 p-4 rounded-lg shadow-md hover:shadow-lg transition-all w-full text-left" onClick={handleStartClick}>
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <p className="text-[12px] text-[#4B5C8A] font-semibold">Aucune formation sélectionnée</p>
              <p className="text-lg text-[#4B5C8A] font-semibold">Démarrer le cours</p>
            </div>
            <div className="text-[#4B5C8A] text-lg font-semibold">{formatTime(elapsedTime)}</div>
          </div>
        </button>
      )}

      {/* Arrêter le cours */}
      {isRunning && (
        <button className="bg-blue-100 p-4 rounded-lg shadow-md hover:shadow-lg transition-all w-full text-left" onClick={handleStopClick}>
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <p className="text-[12px] text-[#4B5C8A] font-semibold">Aucune formation sélectionnée</p>
              <p className="text-lg text-[#4B5C8A] font-semibold">Arrêter</p>
            </div>
            <div className="text-[#4B5C8A] text-lg font-semibold">{formatTime(elapsedTime)}</div>
          </div>
        </button>
      )}

      {/* Reprendre le cours */}
      {!isRunning && elapsedTime > 0 && (
        <button className="bg-green-100 p-4 rounded-lg shadow-md hover:shadow-lg transition-all w-full text-left" onClick={handleResumeClick}>
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <p className="text-[12px] text-[#4B5C8A] font-semibold">Aucune formation sélectionnée</p>
              <p className="text-lg text-[#4B5C8A] font-semibold">Reprendre</p>
            </div>
            <div className="text-[#4B5C8A] text-lg font-semibold">{formatTime(elapsedTime)}</div>
          </div>
        </button>
      )}

      {/* Terminer le cours */}
      {isRunning && (
      <button className="bg-yellow-100 p-4 rounded-lg shadow-md hover:shadow-lg transition-all w-full text-left" onClick={handleFinishClick}>
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <p className="text-[12px] text-[#4B5C8A] font-semibold">{selectedCourse || 'Aucune formation sélectionnée'}</p>
            <p className="text-lg text-[#4B5C8A] font-semibold">Terminer le cours</p>
          </div>
          <div className="text-[#4B5C8A] text-lg font-semibold">{formatTime(elapsedTime)}</div>
        </div>
      </button>
    )}
    </div>


  </div>
)}



{activeSection === "emploiTemps" && professorData && (
  <div>
    <h2 className="text-[#2B3A67] font-semibold text-sm leading-5 mb-4">Mon Emplois de Temps</h2>
    {professorData.emploiDuTemps ? (
      <div className="flex justify-center items-center mb-6">
        <img
          src={`data:image/png;base64,${professorData.emploiDuTemps}`} 
          alt="Emploi du temps"
          className="w-full max-w-4xl h-auto object-contain border-4 border-[#2B3A67] rounded-lg shadow-lg transition-transform duration-300 transform hover:scale-105" // Animation au survol
        />
      </div>
    ) : (
      <p className="text-[#4B5C8A] font-normal text-sm leading-5">Aucun emploi du temps disponible.</p>
    )}
  </div>
)}


{activeSection === "attendance" && (
  <div className="p-6 bg-white rounded-lg shadow-xl max-w-4xl mx-auto mt-6">
    {/* Icone de filtre */}
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-[#2B3A67] font-semibold text-xl leading-6 text-left">Statistique</h2>
  
      {/* Bouton Filtrer */}
      <button 
        className="bg-[#2B3A67] text-white p-2 rounded-md shadow-md hover:bg-[#1a2b43] flex items-center gap-2"
        onClick={handleFilterClick} // Trigger filter functionality
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
          defaultValue={new Date().toISOString().split("T")[0]} // Date par défaut (aujourd'hui)
        />
      </div>
    </div>

    {/* Section des Formations */}
    {showCourses && (
      <div className="space-y-4">
        <select 
          className="p-2 border rounded-md w-full"
          value={selectedCourse} 
          onChange={handleFormationSelect} // Handle selection of course
        >
          <option value="">Choisir une formation</option>
          {formations.length > 0 ? (
            formations.map((formation) => (
              <option key={formation.id} value={formation.nom} className="text-[#2B3A67]">
                {formation.nom}
              </option>
            ))
          ) : (
            <option value="">Aucune formation disponible</option>
          )}
        </select>
      </div>
    )}

    {/* Section des Groupes */}
    {selectedCourse && (
      <div className="space-y-4">
        <select 
          className="p-2 border rounded-md w-full mt-4"
          value={selectedGroup}
          onChange={handleGroupSelect} // Handle selection of group
        >
          <option value="">Choisir un groupe</option>
          {groups.length > 0 ? (
            groups.map((group) => (
              <option key={group.id} value={group.nom} className="text-[#2B3A67]">
                {group.nom}
              </option>
            ))
          ) : (
            <option value="">Aucun groupe disponible</option>
          )}
        </select>
      </div>
    )}

    {/* Section des Boutons de Filtrage */}
    <div className="mt-8 space-y-6">
      <div className="flex justify-between items-center w-full gap-6">
        <button 
          className="bg-green-300 p-4 rounded-lg shadow-md hover:shadow-lg transition-all w-1/3 text-left" 
          onClick={() => handleViewChange('present')}
        >
          <div className="flex flex-col">
            <p className="text-[12px] text-[#4B5C8A] font-semibold">{selectedCourse || 'Aucune formation sélectionnée'}</p>
            <p className="text-[20px] text-[#4B5C8A] font-semibold">L'étudiant Présent</p>
            <p className="text-[12px] text-[#4B5C8A] font-semibold">{selectedGroup || 'Aucun groupe sélectionné'}</p>
          </div>
        </button>

        <button 
          className="bg-red-400 p-4 rounded-lg shadow-md hover:shadow-lg transition-all w-1/3 text-left" 
          onClick={() => handleViewChange('absent')}
        >
          <div className="flex flex-col">
            <p className="text-[12px] text-[#4B5C8A] font-semibold">{selectedCourse || 'Aucune formation sélectionnée'}</p>
            <p className="text-[20px] text-[#4B5C8A] font-semibold">L'étudiant Absent</p>
            <p className="text-[12px] text-[#4B5C8A] font-semibold">{selectedGroup || 'Aucun groupe sélectionné'}</p>
          </div>
        </button>

        <button 
          className="bg-blue-300 p-4 rounded-lg shadow-md hover:shadow-lg transition-all w-1/3 text-left" 
          onClick={() => handleViewChange('total')}
        >
          <div className="flex flex-col">
            <p className="text-[12px] text-[#4B5C8A] font-semibold">{selectedCourse || 'Aucune formation sélectionnée'}</p>
            <p className="text-[20px] text-[#4B5C8A] font-semibold">Total d'étudiants</p>
            <p className="text-[12px] text-[#4B5C8A] font-semibold">{selectedGroup || 'Aucun groupe sélectionné'}</p>
          </div>
        </button>
      </div>
    </div>

    {/* Affichage des étudiants selon le filtre */}
    {view && (
  <div className="mt-6">
    <h3 className="text-xl font-semibold text-[#4B5C8A] mb-4">
      Étudiants {view === 'present' ? 'Présents' : view === 'absent' ? 'Absents' : 'Totaux'}
    </h3>
    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
      <table className="min-w-full table-auto">
        <thead className="bg-[#4B5C8A] text-white">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium">Nom Complet</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Statut</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.length > 0 ? (
            // Filtrage selon le statut
            filteredStudents
              .filter(student => student.groupe === selectedGroup && student.formation === selectedCourse) // Filtrage par groupe et formation
              .filter(student => {
                if (view === 'present') return attendance[student.id] === 'present'; // Filtrer les étudiants présents
                if (view === 'absent') return attendance[student.id] === 'absent'; // Filtrer les étudiants absents
                return true; // Si "total", afficher tous les étudiants
              })
              .map((student) => (
                <tr key={student.id} className="border-t hover:bg-gray-100">
                  <td className="px-6 py-4 text-sm text-gray-700">{student.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{student.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {attendance[student.id] === 'aucune-présence' ? (
                      <span className="text-gray-500">Aucune Présence</span> // Afficher "Aucune Présence" en gris
                    ) : (
                      <span className={`font-semibold ${attendance[student.id] === 'present' ? 'text-green-500' : 'text-red-500'}`}>
                        {attendance[student.id] === 'present' ? 'Présent' : 'Absent'}
                      </span>
                    )}
                  </td>
                </tr>
              ))
          ) : (
            <tr>
              <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">Aucun étudiant trouvé</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
)}

  </div>
)}


        </section>
      </main>
    </div>
  );
}

export default DashboardProf;
