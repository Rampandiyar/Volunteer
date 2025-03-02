import { useState, useEffect, useMemo } from "react";
import { UserCircle, Calendar, Building2, Star } from "lucide-react";
import { motion } from "framer-motion";
import { getVolunteers, getFeedbackByVolunteer } from "../../api";

const VolunteerManagement = () => {
  const [searchQuery] = useState("");
  const [filterCriteria, setFilterCriteria] = useState({
    skills: "",
    availability: "",
    department: "",
  });
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const data = await getVolunteers();
        console.log("Fetched volunteers:", data); // Debugging log

        // Fetch ratings for each volunteer
        const volunteerRatings = await Promise.all(
          data.map(async (volunteer) => {
            try {
              const feedback = await getFeedbackByVolunteer(volunteer.user_id);

              // Calculate average rating if multiple feedbacks exist
              const avgRating =
                feedback.length > 0
                  ? (
                      feedback.reduce((sum, fb) => sum + (fb.rating || 0), 0) /
                      feedback.length
                    ).toFixed(1)
                  : "Not Rated";

              return { ...volunteer, rating: avgRating };
            } catch (error) {
              console.error(
                `Failed to fetch feedback for user ${volunteer.user_id}:`,
                error
              );
              return { ...volunteer, rating: "Not Rated" }; // Prevent breaking the entire process
            }
          })
        );

        setVolunteers(volunteerRatings);
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

  if (loading) {
    return <div className="text-white text-center">Loading...</div>;
  }

  if (!volunteers.length) {
    return <div className="text-white text-center">No volunteers found.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 p-6 md:p-8 text-white">
      <div className="max-w-7xl mx-auto">
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
                  "Rating",
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
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center text-sm">
                      <Star className="mr-2 text-yellow-500" size={18} />
                      {volunteer.avg_rating
                        ? `${volunteer.avg_rating}/5`
                        : "Not Rated"}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VolunteerManagement;
