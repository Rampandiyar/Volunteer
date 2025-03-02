import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getUserById, updateUser } from "../../api"; // Import API functions

function User() {
  const [profile, setProfile] = useState({
    name: "",
    year: "",
    department: "",
    email: "",
    phone: "",
    skills: "",
    interests: "",
    availability: "Weekdays", // Default value
    username: "",
    role: "",
    password: "",
    createdAt: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const userId = localStorage.getItem("userId"); // Fetch user ID

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        toast.error("User ID not found in local storage");
        return;
      }

      try {
        const data = await getUserById(userId);
        setProfile({
          ...data,
          // Ensure skills and interests remain text values
          skills: typeof data.skills === "string" ? data.skills : "",
          interests: typeof data.interests === "string" ? data.interests : "",
          // Parse availability if stored as JSON
          availability:
            typeof data.availability === "string"
              ? data.availability
              : "Weekdays",
          role: data.role ? data.role.trim() : "", // Trim trailing spaces from role
        });
      } catch (error) {
        toast.error("Failed to fetch profile");
        console.error("Fetch error:", error);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({ ...prevProfile, [name]: value }));
  };

  const handleSave = async () => {
    if (!userId) {
      toast.error("User ID not found in local storage");
      return;
    }

    try {
      // Ensure username is included
      if (!profile.username) {
        toast.error("Username cannot be empty");
        return;
      }

      const updatedProfile = {
        ...profile,
        role: profile.role ? profile.role.trim() : profile.role,
        username: profile.username.trim(), // Ensure username is included
      };

      // Remove non-editable fields except username
      const { password, createdAt, ...editableProfile } = updatedProfile;

      await updateUser(userId, editableProfile);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error(`Failed to update profile: ${error.message}`);
      console.error("Update error:", error);
    }
  };

  const availabilityOptions = [
    { value: "Weekdays", label: "Weekdays" },
    { value: "fullTime", label: "Full-time" },
    { value: "partTime", label: "Part-time" },
    { value: "weekends", label: "Weekends" },
    { value: "evenings", label: "Evenings" },
  ];

  const nonEditableFields = ["username", "role", "password", "createdAt"];

  const renderField = (key, value) => {
    if (nonEditableFields.includes(key)) {
      return (
        <input
          type="text"
          name={key}
          value={value || ""}
          disabled
          className="w-full p-4 bg-gray-300 border border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-400 transition cursor-not-allowed"
        />
      );
    }

    if (key === "availability") {
      return (
        <select
          name={key}
          value={value || "Weekdays"}
          onChange={handleChange}
          disabled={!isEditing}
          className="w-full p-4 bg-transparent border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 transition"
        >
          {availabilityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (key === "skills" || key === "interests") {
      return (
        <textarea
          name={key}
          value={value || ""}
          onChange={handleChange}
          disabled={!isEditing}
          rows={3}
          className="w-full p-4 bg-transparent border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 transition"
          placeholder={`Enter your ${key}...`}
        />
      );
    }

    return (
      <input
        type={key === "email" ? "email" : "text"}
        name={key}
        value={value || ""}
        onChange={handleChange}
        disabled={!isEditing}
        className="w-full p-4 bg-transparent border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 transition"
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 p-6 md:p-12 text-white">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-extrabold text-white mb-3">
              Edit Profile
            </h1>
            <p className="text-indigo-200">
              Update your personal details and preferences.
            </p>
          </div>
        </header>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 space-y-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-3xl font-semibold text-white">
              Personal Information
            </h3>
            <button
              className="bg-indigo-600 text-white font-semibold text-lg px-6 py-3 rounded-lg hover:bg-indigo-500 transition"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>

          {Object.entries(profile).map(([key, value]) => (
            <div key={key} className="mb-6">
              <label className="block mb-2 text-xl font-semibold text-indigo-200 capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </label>
              {renderField(key, value)}
            </div>
          ))}

          {isEditing && (
            <div className="flex justify-end space-x-6 mt-8">
              <button
                className="bg-green-500 text-white text-lg px-8 py-3 rounded-lg hover:bg-green-600 transition"
                onClick={handleSave}
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default User;
