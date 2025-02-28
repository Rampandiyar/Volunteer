import { useState, useEffect, useMemo } from "react";
import {
  UserCircle,
  CheckCircle2,
  XCircle,
  Calendar,
  Building2,
} from "lucide-react";
import { motion } from "framer-motion";
import { getVolunteers, updateTaskStatus } from "../../api";

const VolunteerManagement = () => {
  const [searchQuery] = useState("");
  const [filterCriteria, setFilterCriteria] = useState({
    skills: "",
    availability: "",
    department: "",
  });
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const data = await getVolunteers();
        setVolunteers(data);
      } catch (error) {
        console.error("Failed to fetch volunteers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteers();
  }, []);

  const filteredVolunteers = useMemo(() => {
    return volunteers.filter((volunteer) => {
      const matchesSearch = volunteer.username
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesSkills = filterCriteria.skills
        ? volunteer.skills && volunteer.skills.includes(filterCriteria.skills)
        : true;
      const matchesAvailability = filterCriteria.availability
        ? volunteer.availability === filterCriteria.availability
        : true;
      const matchesDepartment = filterCriteria.department
        ? volunteer.department === filterCriteria.department
        : true;
      return (
        matchesSearch &&
        matchesSkills &&
        matchesAvailability &&
        matchesDepartment
      );
    });
  }, [volunteers, searchQuery, filterCriteria]);

  const openModal = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedVolunteer(null);
    setIsModalOpen(false);
  };

  const handleTaskAction = async (status) => {
    try {
      await updateTaskStatus(selectedVolunteer.task_id, { status });
      setVolunteers((prev) =>
        prev.map((v) =>
          v.user_id === selectedVolunteer.user_id
            ? { ...v, task: { ...v.task, status } }
            : v
        )
      );
      closeModal();
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  if (loading) {
    return <div className="text-white text-center">Loading...</div>;
  }

  if (!volunteers.length) {
    return <div className="text-white text-center">No volunteers found.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 p-6 md:p-8 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-extrabold text-white mb-2">
              Volunteer Management
            </h1>
            <p className="text-indigo-200 text-lg">
              Manage your volunteers efficiently
            </p>
          </div>
        </header>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-start justify-start gap-4">
          <select
            className="px-4 py-3 border border-gray-300 text-white bg-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-md"
            value={filterCriteria.skills}
            onChange={(e) =>
              setFilterCriteria((prev) => ({ ...prev, skills: e.target.value }))
            }
          >
            <option value="">All Skills</option>
            <option value="Programming">Programming</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
          </select>

          <select
            className="px-4 py-3 border border-gray-300 text-white bg-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-md"
            value={filterCriteria.availability}
            onChange={(e) =>
              setFilterCriteria((prev) => ({
                ...prev,
                availability: e.target.value,
              }))
            }
          >
            <option value="">All Availability</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
          </select>
        </div>

        {/* Volunteer Table */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
          <table className="w-full">
            <thead className="bg-white/20 border-b">
              <tr>
                {[
                  "Name",
                  "Year",
                  "Department",
                  "Skills",
                  "Availability",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredVolunteers.map((volunteer) => (
                <motion.tr
                  key={volunteer.user_id}
                  whileHover={{ scale: 1.02 }}
                  className="hover:bg-white/10 transition-all duration-200 border-b last:border-b-0"
                >
                  <td className="px-6 py-4 flex items-center">
                    <UserCircle className="mr-4 text-indigo-500" size={28} />
                    <span className="font-medium text-lg">
                      {volunteer.username}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-lg">{volunteer.year}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center text-sm">
                      <Building2 className="mr-2 text-gray-500" size={18} />
                      {volunteer.department}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      {volunteer.skills && Array.isArray(volunteer.skills) ? (
                        volunteer.skills.map((skill) => (
                          <span
                            key={skill}
                            className="bg-indigo-100 text-indigo-800 text-xs px-3 py-2 rounded-full"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400">No skills listed</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center text-sm">
                      <Calendar className="mr-2 text-gray-500" size={18} />
                      {volunteer.availability}
                    </span>
                  </td>
                  <td className="px-6 py-4"></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Task Modal */}
        {isModalOpen && selectedVolunteer && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 relative"
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
              <h2 className="text-3xl font-semibold mb-4">
                {selectedVolunteer.task_name}
              </h2>
              <p className="text-sm text-gray-700 mb-6">
                {selectedVolunteer.task_description}
              </p>
              <div className="flex space-x-6">
                <button
                  onClick={() => handleTaskAction("Completed")}
                  className="bg-green-500 text-white px-5 py-3 rounded-lg hover:bg-green-600 transition duration-200"
                >
                  <CheckCircle2 className="mr-2" size={22} /> Complete Task
                </button>
                <button
                  onClick={() => handleTaskAction("Cancelled")}
                  className="bg-red-500 text-white px-5 py-3 rounded-lg hover:bg-red-600 transition duration-200"
                >
                  <XCircle className="mr-2" size={22} /> Cancel Task
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerManagement;
