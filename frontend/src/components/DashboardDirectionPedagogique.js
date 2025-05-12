// DashboardDirectionPedagogique.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";  // Importer le style du calendrier

const DashboardDirectionPedagogique = () => {
  const today = new Date().toISOString().split('T')[0];  // Date d'aujourd'hui

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("Employee");
  const [employees, setEmployees] = useState([]);
  const [formations, setFormations] = useState([]);  // Liste des formations
  const [groups, setGroups] = useState([]);  // Liste des groupes
  const [selectedFormation, setSelectedFormation] = useState("");  // Formation sélectionnée
  const [selectedGroup, setSelectedGroup] = useState("");  // Groupe sélectionné
  const [selectedDate, setSelectedDate] = useState(today);
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

  const isEtudiant = selectedTab === "Etudiant";

  // Fetch Employees or Students based on selected tab
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
  const fetchAttendanceStatusFromApi = async (id, date, type) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/attendance?date=${date}&id=${id}&type=${type}`);
      console.log("Attendance status response:", res.data);  // This logs the response object
      
      // Ensure that you return the 'status' directly (string value)
      return res.data.status || "Aucune présence";  // Correctly access the 'status' property
    } catch (err) {
      console.error("Erreur lors de la récupération du statut de présence :", err);
      return "Erreur de récupération";  // Return a fallback in case of error
    }
  };
  
  // Fetch attendance status
  const fetchAttendanceStatus = async (data) => {
    const statusData = {};  // This will store the status for each employee/student
    const today = new Date().toISOString().split('T')[0];  // Get today's date
  
    for (const emp of data) {
      // Use selectedTab to determine if we are fetching for employees or students
      const type = selectedTab.toLowerCase() === "employee" ? "employee" : "student";
      
      // Fetch the attendance status for the specific employee/student
      const status = await fetchAttendanceStatusFromApi(emp.id, today, type);
      statusData[emp.id] = status;  // Store the status directly as a string value
    }
  
    console.log("Updated statusData:", statusData);  // Check the updated statusData object
    setAttendanceData(statusData);  // Update the state with the status data
  };
  
  

  const getStatusColor = (status) => {
    if (status === "present") {
      return "bg-green-500 text-white";  // Green for 'present'
    }
    if (status === "absent") {
      return "bg-red-500 text-white";  // Red for 'absent'
    }
    return "bg-gray-300 text-gray-700";  // Default gray for other statuses
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <img src="/images/logo.webp" alt="ITBP Logo" className="w-3/4 mb-8" />
        <div className="mt-6 space-y-4">
          {["Employee", "Etudiant"].map((tab) => (
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
  <span className={`px-3 py-1 rounded-lg text-sm ${getStatusColor(attendanceData[emp.id])}`}>
    {attendanceData[emp.id] === "present" ? "Présent" : 
     attendanceData[emp.id] === "absent" ? "Absent" : 
     attendanceData[emp.id] === undefined ? "Aucune présence" : "Erreur"}
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
  <span className={`px-3 py-1 rounded-lg text-sm ${getStatusColor(attendanceData[student.id])}`}>
    {attendanceData[student.id] === "present" ? "Présent" : 
     attendanceData[student.id] === "absent" ? "Absent" : 
     attendanceData[student.id] === undefined ? "Aucune présence" : "Erreur"}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardDirectionPedagogique;
