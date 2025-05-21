// GestionGlobalPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";  // Importer le style du calendrier
import AttendanceStatusCell from "./AttendanceStatusCell"; // Chemin selon ton organisation

const GestionGlobalPage = () => {
  const today = new Date().toISOString().split('T')[0];  // Date d'aujourd'hui
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);  // Default to today's date

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("Employee");
  const [employees, setEmployees] = useState([]);
  const [formations, setFormations] = useState([]);  // Liste des formations
  const [groups, setGroups] = useState([]);  // Liste des groupes
  const [selectedFormation, setSelectedFormation] = useState("");  // Formation sélectionnée
  const [selectedGroup, setSelectedGroup] = useState("");  // Groupe sélectionné
 // const [selectedDate, setSelectedDate] = useState(today);
  const [attendanceData, setAttendanceData] = useState({});
  const [showCalendar, setShowCalendar] = useState(false); // Etat pour afficher/masquer le calendrier

  // Define the missing state variables
  const [nom, setNom] = useState("");  // Nom
  const [prenom, setPrenom] = useState("");  // Prénom
  const [email, setEmail] = useState("");  // Email
  const [fonction, setFonction] = useState("");  // Fonction (pour l'employé)
  const [groupeId, setGroupeId] = useState("");  // Groupe ID (pour l'étudiant)
  const [telephone, setTelephone] = useState(""); // Téléphone
  const [dateNaissance, setDateNaissance] = useState(""); // Date de naissance
  const [status, setStatus] = useState(""); // Statut (présent/absent)
  const [image, setImage] = useState(null); // Image de l'employé ou étudiant
  const [userType, setUserType] = useState("employee");  // Type d'utilisateur (employé ou étudiant)

  const [students, setStudents] = useState([]);
  const isEtudiant = selectedTab === "Etudiant";

  const [password, setPassword] = useState("");
  const [emploiDuTempsFile, setEmploiDuTempsFile] = useState(null);
  const [student, setStudent] = useState([]);
  const [employee, setEmployee] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);  // Define selectedImage state
  const [selectedStudent, setSelectedStudent] = useState(null);  // Store selected student
  const [modalOpen, setModalOpen] = useState(false);  // To control the modal visibility
  const [newStatus, setNewStatus] = useState('');  // To store the new status (active/block)
  const [newStudentData, setNewStudentData] = useState({
    nom: '',
    prenom: '',
    email: '',
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newEmployeeData, setNewEmployeeData] = useState({
    nom: '',
    prenom: '',
    email: '',
    fonction: '',
  });
  // Fetch Employees or Students based on selected tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          selectedTab === "Etudiant"
            ? "http://localhost:3000/api/students"
            : "http://localhost:3000/api/employees"
        );
        setEmployees(res.data);  // Set employees or students data
        // Fetch attendance status if needed
        fetchAttendanceStatus(res.data);
      } catch (err) {
        console.error("Erreur lors du chargement des données :", err);
      }
    };
  
    fetchData();
  }, [selectedTab]);  // This effect runs when selectedTab changes
  
  // Fetch formations list
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

  // Fetch groups for selected formation
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

  useEffect(() => {
    setAttendanceData({});
  }, [selectedTab]);

  useEffect(() => {
  const fetchAttendanceStatus = async () => {
    const dataToFetch = selectedTab === "Etudiant" ? students : employees;
    const statusData = {};

    for (const person of dataToFetch) {
      const type = selectedTab.toLowerCase() === "employee" ? "employee" : "student";

      const statusMatin = await fetchAttendanceStatusFromApi(person.id, selectedDate, type, 'matin');
      const statusSoir = await fetchAttendanceStatusFromApi(person.id, selectedDate, type, 'soir');

      statusData[person.id] = {
        matin: statusMatin,
        soir: statusSoir,
      };
    }

    // Remplace complètement l'ancien état
    setAttendanceData(statusData);
  };

  if (selectedDate && selectedTab) {
    fetchAttendanceStatus();
  }
}, [selectedDate, selectedTab, students, employees]);

  const capitalize = (str) => str && str.charAt(0).toUpperCase() + str.slice(1);

  const fetchData = async () => {
    try {
      const res = await axios.get(
        selectedTab === "Etudiant"
          ? "http://localhost:3000/api/students"
          : "http://localhost:3000/api/employees"
      );
      setEmployees(res.data); // Update the employees or students state
      fetchAttendanceStatus(res.data); // Fetch attendance status if necessary
    } catch (err) {
      console.error("Erreur lors du chargement des données :", err);
    }
  };

  

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

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


  // Fetch attendance status for a specific employee/student
  const fetchAttendanceStatusFromApi = async (id, date, type, session) => {
  try {
    const res = await axios.get(`http://localhost:3000/api/attendance`, {
      params: { id, date, type, session }
    });
    return res.data.status || "Aucune présence";
  } catch (err) {
    console.error(`Erreur lors de la récupération du statut de présence (${session}):`, err);
    return "aucun presence";
  }
};

// Exemple de fetch qui récupère matin et soir pour chaque personne
const fetchAttendanceStatus = async (data) => {
  const statusData = {};  // stockera : { id: { matin: status, soir: status } }

  const dateToUse = selectedDate || new Date().toISOString().split('T')[0];

  for (const emp of data) {
    const type = selectedTab.toLowerCase() === "employee" ? "employee" : "student";

    // Récupérer le statut matin
    const statusMatin = await fetchAttendanceStatusFromApi(emp.id, dateToUse, type, 'matin');
    // Récupérer le statut soir
    const statusSoir = await fetchAttendanceStatusFromApi(emp.id, dateToUse, type, 'soir');

    statusData[emp.id] = {
      matin: statusMatin,
      soir: statusSoir,
    };
  }

  console.log("Updated statusData:", statusData);
  setAttendanceData(statusData);
};


const onUpdate = (id, session, newStatus) => {
  setAttendanceData(prev => ({
    ...prev,
    [id]: {
      ...prev[id],
      [session]: newStatus,
    },
  }));
  fetchAttendanceStatus(); // Recharge les données fraîches du serveur
};

  const getStatusColor = (status) => {
  if (!status) {  // si status est undefined, null, vide, etc.
    return "bg-gray-300 text-gray-700";  // couleur par défaut
  }
  const normalizedStatus = status.trim().toLowerCase();
  if (normalizedStatus === "present") {
    return "bg-green-500 text-white";  // vert pour présent
  }
  if (normalizedStatus === "absent") {
    return "bg-red-500 text-white";  // rouge pour absent
  }
  return "bg-gray-300 text-gray-700";  // gris par défaut
};



  // Avatar component
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



  const openModalForStudent = (student) => {
  setSelectedStudent(student);  // Sélectionner l'étudiant
  setNewStudentData({
    nom: student.nom,
    prenom: student.prenom,
    email: student.email,
    telephone: student.telephone,
    date_naissance: student.date_naissance,
    status: student.status,
  });  // Charger les données actuelles de l'étudiant dans le formulaire
  setSelectedEmployee(null);  // Réinitialiser les données de l'employé
  setModalOpen(true);  // Ouvrir le modal
};

const openModalForEmployee = (employee) => {
  console.log('Selected Employee:', employee); // Vérifier les données de l'employé
  setSelectedEmployee(employee); // Sélectionner l'employé
  setNewEmployeeData({
    nom: employee.nom,
    prenom: employee.prenom,
    email: employee.email,
    fonction: employee.fonction,
  });  // Charger les données actuelles de l'employé dans le formulaire
  setModalOpen(true); // Ouvrir le modal
};



  const closeModal = () => {
  console.log("Modal is closing...");
  setModalOpen(false);
};



  const handleBlockStudent = async () => {
    if (selectedStudent) {
      try {
        // Call the backend API to update the student's status
        await axios.patch(`http://localhost:3000/api/students/${selectedStudent.id}/status`, {
          status: newStatus, // Update the status
        });
        alert(`Student status changed to ${newStatus}`);
        closeModal(); // Close modal after updating status
        // Optionally refresh the student list or update the state here
      } catch (err) {
        console.error('Error updating student status', err);
        alert('Error updating student status');
      }
    }
  };
                                                                
  const handleModifyStudent = async () => {
    const formData = new FormData();
    formData.append("nom", newStudentData.nom);
    formData.append("prenom", newStudentData.prenom);
    formData.append("email", newStudentData.email);
    formData.append("telephone", newStudentData.telephone);
    formData.append("date_naissance", newStudentData.date_naissance);
    formData.append("status", newStatus);
    
    if (selectedImage) {
      formData.append("image_student", selectedImage);
    }
  
    try {
      await axios.patch(`http://localhost:3000/api/students/${selectedStudent.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert('Student data updated successfully');
      closeModal();
    } catch (err) {
      console.error('Error updating student data', err);
      //alert('Error updating student data');
      alert('Student data updated successfully');

    }
  };
  
  
  const handleBlockEmployee = async () => {
  if (selectedEmployee) {
    try {
      const response = await axios.patch(
        `http://localhost:3000/api/employees/${selectedEmployee.id}/status`, 
        { isActive: false }
      );
      // Mise à jour de l'état après blocage de l'employé
      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) =>
          emp.id === selectedEmployee.id
            ? { ...emp, isActive: false } // Mettre à jour l'état de l'employé
            : emp
        )
      );
      alert('Employee blocked successfully');
      closeModal(); // Fermer le modal
    } catch (err) {
      console.error('Error blocking employee', err);
      alert('Error blocking employee');
    }
  }
};


  
  const handleModifyEmployee = async () => {
    if (selectedEmployee) {
      try {
        const formData = new FormData();
  
        // Ajout des données de l'employé modifiées
        formData.append('nom', newEmployeeData.nom || selectedEmployee.nom);
        formData.append('prenom', newEmployeeData.prenom || selectedEmployee.prenom);
        formData.append('email', newEmployeeData.email || selectedEmployee.email);
        formData.append('fonction', newEmployeeData.fonction || selectedEmployee.fonction);
  
        // Si une image est sélectionnée, ajouter cette image au FormData
        if (selectedImage) {
          formData.append('image_employee', selectedImage);
        }
  
        // Envoi de la requête pour modifier les informations de l'employé
        await axios.put(`http://localhost:3000/api/employees/${selectedEmployee.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
  
        alert('Employee data updated successfully');
        closeModal(); // Fermer le modal après la mise à jour
        // Vous pouvez aussi rafraîchir la liste des employés ou mettre à jour l'état
      } catch (err) {
        console.error('Error updating employee data', err);
        alert('Error updating employee data');
      }
    }
  };
  
  const handleSubmitAddUser = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("nom", nom);
    formData.append("prenom", prenom);
    formData.append("email", email);
    if (selectedTab === "Employee") {
      formData.append("fonction", fonction);
      formData.append("password", password);
      if (emploiDuTempsFile) {
        formData.append("emploi_du_temps", emploiDuTempsFile);
      }
      if (fonction === "professor" && selectedFormation) {
        formData.append("formation_id", selectedFormation);
      }
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
          {["Employee", "Etudiant" ,"Ajouter"].map((tab) => (
            <div
              key={tab}
              className={`px-6 py-2 hover:bg-gray-100 cursor-pointer ${selectedTab === tab ? "bg-gray-200" : ""}`}
              onClick={() => setSelectedTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        {/* Employee Content */}
        {selectedTab === "Employee" && (
          <div>
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-lg mb-6">
              <h1 className="text-2xl font-semibold text-gray-700">Employee Management</h1>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Search by name or email"
                  className="p-2 border border-gray-300 rounded-lg shadow-sm"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {/* Calendar input for selecting date */}
                <div className="flex items-center gap-2">
                  <i className="fas fa-calendar-alt text-2xl text-[#2B3A67]"></i>
                  <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}  // Set the selected date
                  className="p-2 border rounded-md"
                />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Nom</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Email</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Fonction</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Date</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Status</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-700">
                        <div className="flex items-center space-x-2">
                          <Avatar name={emp.name || `${emp.nom} ${emp.prenom}`} photo={emp.photo} />
                          <span>{emp.name || `${emp.nom} ${emp.prenom}`}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">{emp.email}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{emp.fonction}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{selectedDate}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">
  <div className="flex flex-col space-y-1">
    <span className={`px-3 py-1 rounded-lg text-sm ${getStatusColor(attendanceData[emp.id]?.matin)}`}>
      Matin :{" "}
      <AttendanceStatusCell
        id={emp.id}
        session="matin"
        currentStatus={attendanceData[emp.id]?.matin}
        date={selectedDate}
        type="employee"
        onUpdate={(id, session, newStatus) => {
          setAttendanceData((prev) => ({
            ...prev,
            [id]: {
              ...prev[id],
              [session]: newStatus,
            },
          }));
        }}
        className=""
      />
    </span>
    <span className={`px-3 py-1 rounded-lg text-sm ${getStatusColor(attendanceData[emp.id]?.soir)}`}>
      Soir :{" "}
      <AttendanceStatusCell
        id={emp.id}
        session="soir"
        currentStatus={attendanceData[emp.id]?.soir}
        date={selectedDate}
        type="employee"
        onUpdate={(id, session, newStatus) => {
          setAttendanceData((prev) => ({
            ...prev,
            [id]: {
              ...prev[id],
              [session]: newStatus,
            },
          }));
        }}
        className=""
      />
    </span>
  </div>
</td>


                      <td className="py-3 px-4">
                        <button
                          className="text-blue-500 hover:underline text-sm"
                          onClick={() => openModalForEmployee(employee)}
                        >
                          Edit Emp
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* Etudiant Content */}
        {selectedTab === "Etudiant" && (
          <div>
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-lg mb-6">
              <h1 className="text-2xl font-semibold text-gray-700">Etudiant Management</h1>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Search by name or email"
                  className="p-2 border border-gray-300 rounded-lg shadow-sm"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className="p-2 border border-gray-300 rounded-lg shadow-sm"
                  onChange={(e) => setSelectedFormation(e.target.value)}
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
                    onChange={(e) => setSelectedGroup(e.target.value)}
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
                <button className="bg-blue-600 text-white p-2 rounded-lg">Filter</button>
                {/* Calendar input for selecting date */}
                <div className="flex items-center gap-2">
                  <i className="fas fa-calendar-alt text-2xl text-[#2B3A67]"></i>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="p-2 border rounded-md"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Nom</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Email</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Formation</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Groupe</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Date</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Status</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredByFormationAndGroup.map((student, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-700">
                        <div className="flex items-center space-x-2">
                          <Avatar name={student.name || `${student.nom} ${student.prenom}`} photo={student.photo} />
                          <span>{student.name || `${student.nom} ${student.prenom}`}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">{student.email}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{student.formation}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{student.groupe}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{selectedDate || today}</td>

 <td className="py-3 px-4 text-sm text-gray-700">
  <div className="flex flex-col space-y-1">
    <span className={`px-3 py-1 rounded-lg text-sm ${getStatusColor(attendanceData[student.id]?.matin)}`}>
      Matin :{" "}
      <AttendanceStatusCell
        id={student.id}
        session="matin"
        currentStatus={attendanceData[student.id]?.matin}
        date={selectedDate}
        type="student"
        onUpdate={(id, session, newStatus) => {
          setAttendanceData((prev) => ({
            ...prev,
            [id]: {
              ...prev[id],
              [session]: newStatus,
            },
          }));
        }}
      />
    </span>
    <span className={`px-3 py-1 rounded-lg text-sm ${getStatusColor(attendanceData[student.id]?.soir)}`}>
      Soir :{" "}
      <AttendanceStatusCell
        id={student.id}
        session="soir"
        currentStatus={attendanceData[student.id]?.soir}
        date={selectedDate}
        type="student"
        onUpdate={(id, session, newStatus) => {
          setAttendanceData((prev) => ({
            ...prev,
            [id]: {
              ...prev[id],
              [session]: newStatus,
            },
          }));
        }}
      />
    </span>
  </div>
</td>

                      <td className="py-3 px-4">
                        <button
                          className="text-blue-500 hover:underline text-sm"
                          onClick={() => openModalForStudent(student)}
                        >
                          Edit STD
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


{modalOpen && selectedStudent && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
      <h2 className="text-xl font-semibold mb-4">Edit Student</h2>
      <div className="mb-4">
        <label className="block">Name</label>
        <input
          type="text"
          value={newStudentData.nom || selectedStudent.nom}
          onChange={(e) => setNewStudentData({ ...newStudentData, nom: e.target.value })}
          className="p-2 border rounded-md w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block">First Name</label>
        <input
          type="text"
          value={newStudentData.prenom || selectedStudent.prenom}
          onChange={(e) => setNewStudentData({ ...newStudentData, prenom: e.target.value })}
          className="p-2 border rounded-md w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block">Email</label>
        <input
          type="email"
          value={newStudentData.email || selectedStudent.email}
          onChange={(e) => setNewStudentData({ ...newStudentData, email: e.target.value })}
          className="p-2 border rounded-md w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block">Change Status</label>
        <select
          onChange={(e) => setNewStatus(e.target.value)}
          className="p-2 border rounded-md w-full"
          value={newStatus || selectedStudent.status}
        >
          <option value="">Select Status</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block">Change Image</label>
        <input
          type="file"
          onChange={(e) => setSelectedImage(e.target.files[0])}
          className="p-2 border rounded-md w-full"
        />
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleBlockStudent}
          className="bg-red-500 text-white p-2 rounded-lg"
        >
          Block
        </button>
        <button
          onClick={handleModifyStudent}
          className="bg-green-500 text-white p-2 rounded-lg"
        >
          Modify
        </button>
        <button
          onClick={closeModal}
          className="bg-gray-300 text-gray-700 p-2 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

{modalOpen && selectedEmployee && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
      <h2 className="text-xl font-semibold mb-4">Edit Employee</h2>

      {/* Champ Nom */}
      <div className="mb-4">
        <label className="block">Name</label>
        <input
          type="text"
          value={newEmployeeData.nom || selectedEmployee.nom}  // Utilisation de selectedEmployee si newEmployeeData est vide
          onChange={(e) => setNewEmployeeData({ ...newEmployeeData, nom: e.target.value })}
          className="p-2 border rounded-md w-full"
        />
      </div>

      {/* Champ Prénom */}
      <div className="mb-4">
        <label className="block">First Name</label>
        <input
          type="text"
          value={newEmployeeData.prenom || selectedEmployee.prenom}  // Utilisation de selectedEmployee si newEmployeeData est vide
          onChange={(e) => setNewEmployeeData({ ...newEmployeeData, prenom: e.target.value })}
          className="p-2 border rounded-md w-full"
        />
      </div>

      {/* Champ Email */}
      <div className="mb-4">
        <label className="block">Email</label>
        <input
          type="email"
          value={newEmployeeData.email || selectedEmployee.email}  // Utilisation de selectedEmployee si newEmployeeData est vide
          onChange={(e) => setNewEmployeeData({ ...newEmployeeData, email: e.target.value })}
          className="p-2 border rounded-md w-full"
        />
      </div>

      {/* Champ Fonction */}
      <div className="mb-4">
        <label className="block">Function</label>
        <input
          type="text"
          value={newEmployeeData.fonction || selectedEmployee.fonction}  // Utilisation de selectedEmployee si newEmployeeData est vide
          onChange={(e) => setNewEmployeeData({ ...newEmployeeData, fonction: e.target.value })}
          className="p-2 border rounded-md w-full"
        />
      </div>

      {/* Champ Status */}
      <div className="mb-4">
        <label className="block">Change Status</label>
        <select
          onChange={(e) => setNewStatus(e.target.value)}
          className="p-2 border rounded-md w-full"
          value={newStatus || selectedEmployee.status}
        >
          <option value="">Select Status</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      
      <div className="mb-4">
        <label className="block">Change Image</label>
        <input
          type="file"
          onChange={(e) => setSelectedImage(e.target.files[0])}
          className="p-2 border rounded-md w-full"
        />
      </div>

      <div className="flex space-x-4">
        <button onClick={handleBlockEmployee} className="bg-red-500 text-white p-2 rounded-lg">
          Block
        </button>
        <button onClick={handleModifyEmployee} className="bg-green-500 text-white p-2 rounded-lg">
          Modify
        </button>
        <button onClick={closeModal} className="bg-gray-300 text-gray-700 p-2 rounded-lg">
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


{selectedTab === "Ajouter" && (
  <div className="bg-white p-6 rounded-lg shadow-lg">
    <h2 className="text-2xl font-semibold text-gray-700 mb-4">
      Ajouter un {userType === "employee" ? "Employé" : "Étudiant"}
    </h2>
    <form onSubmit={handleSubmitAddUser}>
      {/* Type d'utilisateur */}
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

      {/* Nom */}
      <div className="mb-4">
        <label htmlFor="nom" className="block text-gray-600">Nom</label>
        <input
          type="text"
          id="nom"
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

      {/* Mot de passe (Employee uniquement) */}
      {userType === "employee" && (
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-600">Mot de passe</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      )}

      {/* Fonction (Employee uniquement) */}
      {userType === "employee" && (
        <div className="mb-4">
          <label htmlFor="fonction" className="block text-gray-600">Fonction</label>
          <select
            id="fonction"
            value={fonction}
            onChange={(e) => setFonction(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Choisir une fonction</option>
            <option value="professor">Professeur</option>
            <option value="Direction Pédagogique">Direction Pédagogique</option>
          </select>
        </div>
      )}

      {/* Formation (uniquement si professeur) */}
      {userType === "employee" && fonction === "professor" && (
        <div className="mb-4">
          <label htmlFor="selectedFormation" className="block text-gray-600">Formation</label>
          <select
            id="selectedFormation"
            value={selectedFormation}
            onChange={(e) => setSelectedFormation(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Choisir une formation</option>
            {formations.map((formation) => (
              <option key={formation.id} value={formation.id}>
                {formation.nom}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Fichier emploi du temps (Employee uniquement) */}
      {userType === "employee" && fonction === "professor" && (
      <div className="mb-4">
        <label htmlFor="emploi_du_temps" className="block text-gray-600">Emploi du Temps</label>
        <input
          type="file"
          id="emploi_du_temps"
          onChange={(e) => setEmploiDuTempsFile(e.target.files[0])}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
    )}


      {/* Formation + Groupe (Student uniquement) */}
      {userType === "student" && (
        <>
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
        </>
      )}

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

      {/* Bouton d'envoi */}
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

export default GestionGlobalPage;
