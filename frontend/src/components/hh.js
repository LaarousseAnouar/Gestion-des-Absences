import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";  // Importer le style du calendrier

const hh = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("Employee");
  const [employees, setEmployees] = useState([]);
  const [formations, setFormations] = useState([]);  // Liste des formations
  const [groups, setGroups] = useState([]);  // Liste des groupes
  const [selectedFormation, setSelectedFormation] = useState("");  // Formation sélectionnée
  const [selectedGroup, setSelectedGroup] = useState("");  // Groupe sélectionné
  const [selectedDate, setSelectedDate] = useState("");  // Date choisie par l'utilisateur
  const [attendanceStatus, setAttendanceStatus] = useState(null); // Statut de présence
  const [showCalendar, setShowCalendar] = useState(false); // Etat pour afficher/masquer le calendrier
  const [attendanceData, setAttendanceData] = useState({});

  const today = new Date().toISOString().split('T')[0];  // Date d'aujourd'hui
  const isEtudiant = selectedTab === "Etudiant";
  const showEmployeeTable = selectedTab === "Employee" || selectedTab === "Etudiant";
  {/*     /////////////////////////////////////////////                                         */}
  const [nom, setNom] = useState("");  // Nom
  const [prenom, setPrenom] = useState("");  // Prénom
  const [email, setEmail] = useState("");  // Email
  const [fonction, setFonction] = useState("");  // Fonction (pour l'employé)
  const [groupeId, setGroupeId] = useState("");  // Groupe ID (pour l'étudiant)
  const [image, setImage] = useState(null); // Image de l'employé ou étudiant
  const [userType, setUserType] = useState("employee");  // Type d'utilisateur (employé ou étudiant)
  const [telephone, setTelephone] = useState(""); // Téléphone
  const [dateNaissance, setDateNaissance] = useState(""); // Date de naissance
  const [status, setStatus] = useState(""); // Statut (présent/absent)
  // Récupérer les données depuis l'API en fonction du tab sélectionné
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          selectedTab === "Etudiant"
            ? "http://localhost:3000/api/students"
            : "http://localhost:3000/api/employees"
        );
        setEmployees(res.data);
        fetchAttendanceStatus(res.data);
      } catch (err) {
        console.error("Erreur lors du chargement des données :", err);
      }
    };

    fetchData();
  }, [selectedTab]);

  // Récupérer la liste des formations
  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/formations");
        setFormations(res.data);  // Stocker les formations
      } catch (err) {
        console.error("Erreur lors de la récupération des formations :", err);
      }
    };

    fetchFormations();
  }, []);

  // Récupérer les groupes d'une formation sélectionnée
  useEffect(() => {
    if (selectedFormation) {
      const fetchGroups = async () => {
        try {
          const res = await axios.get(`http://localhost:3000/api/groups?formation=${selectedFormation}`);
          setGroups(res.data);  // Stocker les groupes de la formation sélectionnée
        } catch (err) {
          console.error("Erreur lors de la récupération des groupes :", err);
        }
      };
      fetchGroups();
    }
  }, [selectedFormation]);

  // Filtrer les employés/étudiants par le terme de recherche
  const filteredEmployees = employees.filter((employee) =>
    (employee.name || `${employee.nom} ${employee.prenom}`)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtrer les étudiants par formation et groupe
  const filteredByFormationAndGroup = filteredEmployees.filter((emp) => {
    const matchesFormation = selectedFormation ? emp.formation === selectedFormation : true;
    const matchesGroup = selectedGroup ? emp.groupe === selectedGroup : true;
    return matchesFormation && matchesGroup;
  });

  // Vérifier la présence d'un étudiant/employé pour la date sélectionnée
  const fetchAttendanceStatus = async (data) => {
    const statusData = {};
    const today = new Date().toISOString().split('T')[0];  // Date du jour
    
    // Vérification du type de l'élément (employé ou étudiant)
    console.log("Récupération des statuts pour : ", selectedTab);
  
    // Boucle à travers les employés/étudiants et récupérer leur statut de présence
    for (const emp of data) {
      console.log(`Récupération du statut pour ID ${emp.id}`);
      const status = await fetchAttendanceStatusFromApi(emp.id, today, selectedTab.toLowerCase());
      statusData[emp.id] = status;
    }
  
    console.log("Données de présence mises à jour :", statusData);  // Vérifier les données de présence
    setAttendanceData(statusData);  // Mettre à jour l'état avec les statuts de présence
  };
  

  // Récupérer le statut de présence à partir de l'API pour un employé/étudiant spécifique
  const fetchAttendanceStatusFromApi = async (id, date, type) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/attendance?date=${date}&id=${id}&type=${type}`);
      console.log("Réponse de l'API pour l'ID:", id, "Statut:", res.data); // Afficher la réponse de l'API
      return res.data.status || "Aucune présence";  // Retourner le statut ou "Aucune présence"
    } catch (err) {
      console.error("Erreur lors de la récupération du statut de présence :", err);
      return "Erreur de récupération";  // Retourner un message d'erreur si l'appel API échoue
    }
  };
  
  
  
  
  

  const handleDateChange = (date) => {
    setSelectedDate(date.toISOString().split('T')[0]);
    console.log("Date sélectionnée:", selectedDate); // Vérifier si la date est correcte
  };

  
  const getStatusColor = (status) => {
    if (status === "présent") return "bg-green-500 text-white";
    if (status === "absent") return "bg-red-500 text-white";
    return "bg-gray-300 text-gray-700";
  };

  // Avatar component pour afficher la photo ou les initiales
  const Avatar = ({ name, photo }) => {
    const getColor = (char) => {
      const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500"];
      return colors[char.charCodeAt(0) % colors.length];
    };

    if (photo) {
      return <img src={photo} alt={name} className="w-10 h-10 rounded-full object-cover" />;
    } else {
      const firstChar = name.charAt(0).toUpperCase();
      return (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${getColor(firstChar)}`}>
          {firstChar}
        </div>
      );
    }
  };

  // Fonction pour envoyer les données au backend pour ajouter un employé ou étudiant
  const handleSubmitAddUser = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("nom", nom);
    formData.append("prenom", prenom);
    formData.append("email", email);
    if (selectedTab === "Employee") {
      formData.append("fonction", fonction);
    } else {
      formData.append("groupe_id", groupeId);
      formData.append("telephone", telephone);
      formData.append("date_naissance", dateNaissance);
      formData.append("status", status);
    }
    if (image) {
      formData.append(userType === "employee" ? "image_employee" : "image_student", image);
    }

    try {
      const res = await axios.post(
        `http://localhost:3000/api/${userType === "employee" ? "add-employee" : "add-student"}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      console.log(res.data);
      // Réinitialiser le formulaire après ajout
      setNom("");
      setPrenom("");
      setEmail("");
      setFonction("");
      setGroupeId("");
      setTelephone("");
      setDateNaissance("");
      setStatus("");
      setImage(null);
      setSelectedFormation(""); // Reset formation selection
    } catch (err) {
      console.error("Erreur lors de l'ajout:", err);
    }
  };


  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <img src="/images/logo.webp" alt="ITBP Logo" className="w-3/4 mb-8" />
        <div className="mt-6 space-y-4">
          {["Employee", "Ajouter", "Etudiant"].map((tab) => (
            <div
            key={tab}
            className={`px-6 py-2 hover:bg-gray-100 cursor-pointer ${selectedTab === tab ? "bg-gray-200" : ""}`}
            onClick={() => setSelectedTab(tab)}  // Modifie le selectedTab pour que l'on récupère le bon type
          >
            {tab}
          </div>
          
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        {showEmployeeTable && (
          <>
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-lg mb-6">
              <h1 className="text-2xl font-semibold text-gray-700">
                {isEtudiant ? "Etudiant Management" : "Employee Management"}
              </h1>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Search by name or email"
                  className="p-2 border border-gray-300 rounded-lg shadow-sm"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {isEtudiant && (
                  <>
                    <select
                      className="p-2 border border-gray-300 rounded-lg shadow-sm"
                      onChange={(e) => setSelectedFormation(e.target.value)} // Mise à jour de la formation sélectionnée
                      value={selectedFormation}
                    >
                      <option value="">Select Formation</option>
                      {formations.map((formation, index) => (
                        <option key={index} value={formation.nom}>
                          {formation.nom}
                        </option>
                      ))}
                    </select>

                    {selectedFormation && (
                      <select
                        className="p-2 border border-gray-300 rounded-lg shadow-sm"
                        onChange={(e) => setSelectedGroup(e.target.value)} // Mise à jour du groupe sélectionné
                        value={selectedGroup}
                      >
                        <option value="">Select Group</option>
                        {groups.map((group, index) => (
                          <option key={index} value={group.nom}>
                            {group.nom}
                          </option>
                        ))}
                      </select>
                    )}
                  </>
                )}
                <button className="bg-blue-600 text-white p-2 rounded-lg">Filter</button>
                <button 
                  className="bg-gray-400 text-white p-2 rounded-lg"
                  onClick={() => setShowCalendar(!showCalendar)}  // Toggle calendar visibility
                >
                  Calendar
                </button>
              </div>
            </div>

            {showCalendar && (
              <div className="mb-4">
                <DatePicker
                  selected={selectedDate ? new Date(selectedDate) : new Date()}
                  onChange={(date) => setSelectedDate(date.toISOString().split('T')[0])}  // Update the selected date
                  dateFormat="yyyy-MM-dd"
                  className="p-2 border border-gray-300 rounded-lg"
                />
              </div>
            )}

            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Nom</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Email</th>
                    {isEtudiant && <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Formation</th>}
                    {isEtudiant && <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Groupe</th>}
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">{!isEtudiant && "Fonction"}</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Date</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Status</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredByFormationAndGroup.map((emp, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-700">
                        <div className="flex items-center space-x-2">
                          <Avatar name={emp.name || `${emp.nom} ${emp.prenom}`} photo={emp.photo} />
                          <span>{emp.name || `${emp.nom} ${emp.prenom}`}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">{emp.email}</td>
                      {isEtudiant && (
                        <td className="py-3 px-4 text-sm text-gray-700">{emp.formation}</td>
                      )}
                      {isEtudiant && (
                        <td className="py-3 px-4 text-sm text-gray-700">{emp.groupe}</td>
                      )}
                      <td className="py-3 px-4 text-sm text-gray-700">{emp.fonction}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {selectedDate || today}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        <span className={`px-3 py-1 rounded-lg text-sm ${getStatusColor(attendanceData[emp.id])}`}>
                          {attendanceData[emp.id] === "présent" ? "Présent" : attendanceData[emp.id] === "absent" ? "Absent" : "Aucune présence"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-blue-500 hover:underline text-sm">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-gray-600">Showing {filteredByFormationAndGroup.length} entries</p>
              <div className="flex items-center space-x-2">
                <button className="bg-gray-300 p-2 rounded-md">Back</button>
                <button className="bg-gray-300 p-2 rounded-md">Next</button>
              </div>
            </div>
          </>
        )}



{selectedTab === "Ajouter" && (
  <div className="bg-white p-6 rounded-lg shadow-lg">
    <h2 className="text-2xl font-semibold text-gray-700 mb-4">
      Ajouter un {userType === "employee" ? "Employé" : "Étudiant"}
    </h2>
    <form onSubmit={handleSubmitAddUser}>
      {/* Sélectionner le type (Employé ou Étudiant) */}
      <div className="mb-4">
        <label htmlFor="userType" className="block text-gray-600">Type d'utilisateur</label>
        <select
          id="userType"
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="employee">Employé</option>
          <option value="student">Étudiant</option>
        </select>
      </div>

      {/* Sélectionner la formation */}
      {userType === "student" && (
        <div className="mb-4">
          <label htmlFor="selectedFormation" className="block text-gray-600">Formation</label>
          <select
            id="selectedFormation"
            value={selectedFormation}
            onChange={(e) => setSelectedFormation(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Choisir une formation</option>
            {formations.map((formation, index) => (
              <option key={index} value={formation.nom}>
                {formation.nom}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Sélectionner le groupe */}
      {userType === "student" && selectedFormation && (
        <div className="mb-4">
          <label htmlFor="groupeId" className="block text-gray-600">Groupe</label>
          <select
            id="groupeId"
            value={groupeId}
            onChange={(e) => setGroupeId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Choisir un groupe</option>
            {groups.map((group, index) => (
              <option key={index} value={group.id}>
                {group.nom}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Nom */}
      <div className="mb-4">
        <label htmlFor="nom" className="block text-gray-600">Nom</label>
        <input
          type="text"
          id="name"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Prénom */}
      <div className="mb-4">
        <label htmlFor="prenom" className="block text-gray-600">Prénom</label>
        <input
          type="text"
          id="prenom"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Email */}
      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-600">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Téléphone */}
      {userType === "student" && (
        <div className="mb-4">
          <label htmlFor="telephone" className="block text-gray-600">Téléphone</label>
          <input
            type="text"
            id="telephone"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      )}

      {/* Date de naissance */}
      {userType === "student" && (
        <div className="mb-4">
          <label htmlFor="dateNaissance" className="block text-gray-600">Date de naissance</label>
          <input
            type="date"
            id="dateNaissance"
            value={dateNaissance}
            onChange={(e) => setDateNaissance(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      )}

      {/* Statut */}
      {userType === "student" && (
        <div className="mb-4">
          <label htmlFor="status" className="block text-gray-600">Statut</label>
          <input
            type="text"
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      )}

      {/* Image */}
      <div className="mb-4">
        <label htmlFor="image" className="block text-gray-600">Image</label>
        <input
          type="file"
          id="image"
          onChange={(e) => setImage(e.target.files[0])}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Bouton Ajouter avec un peu plus de marge en bas */}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 mb-6"
      >
        Ajouter
      </button>
    </form>
  </div>
)}


      </div>
    </div>
  );
};

export default hh;
