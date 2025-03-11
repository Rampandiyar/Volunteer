import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getUserById, updateUser } from "../../api"; // Import API functions

function User() {
  const [profile, setProfile] = useState({
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
  });

  // Keep userId separate from profile state
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const userIdFromStorage = localStorage.getItem("userId"); // Fetch user ID

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userIdFromStorage) {
        toast.error("User ID not found in local storage");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getUserById(userIdFromStorage);

        // Set userId separately
        setUserId(data.userId || userIdFromStorage);

        // Set the rest of the profile data (excluding name)
        setProfile({
          year: data.year || "",
          department: data.department || "",
          email: data.email || "",
          phone: data.phone || "",
          // Ensure skills and interests remain text values
          skills: typeof data.skills === "string" ? data.skills : "",
          interests: typeof data.interests === "string" ? data.interests : "",
          // Parse availability if stored as JSON
          availability:
            typeof data.availability === "string"
              ? data.availability
              : "Weekdays",
          username: data.username || "",
          role: data.role ? data.role.trim() : "", // Trim trailing spaces from role
          password: data.password || "",
        });
        setLoading(false);
      } catch (error) {
        toast.error("Failed to fetch profile");
        console.error("Fetch error:", error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userIdFromStorage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({ ...prevProfile, [name]: value }));
  };

  const handleSave = async () => {
    if (!userIdFromStorage) {
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
      const { password, ...editableProfile } = updatedProfile;

      await updateUser(userIdFromStorage, editableProfile);
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

  const renderField = (key, value) => {
    // Make username editable, but password and role stay disabled
    if (key === "password" || key === "role") {
      return (
        <input
          type={key === "password" ? "password" : "text"}
          name={key}
          value={value || ""}
          disabled
          className="w-full p-4 bg-opacity-70 bg-purple-200 border border-purple-300 rounded-lg text-purple-900 cursor-not-allowed"
        />
      );
    }

    if (key === "username") {
      return (
        <input
          type="text"
          name={key}
          value={value || ""}
          onChange={handleChange}
          disabled={!isEditing}
          className={`w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 transition ${
            isEditing
              ? "bg-indigo-100/20 text-white border-indigo-400"
              : "bg-white/5 text-white"
          }`}
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
          className={`w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 transition ${
            isEditing
              ? "bg-indigo-100 text-indigo-900"
              : "bg-gray-300 text-gray-700"
          }`}
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
        className={`w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 transition ${
          isEditing ? "bg-indigo-100/20 text-white" : "bg-white/5 text-white"
        }`}
      />
    );
  };

  // Extract the credentials fields
  const credentialsFields = ["username", "password", "role"];
  // Extract the remaining profile fields (excluding name)
  const personalInfoFields = Object.keys(profile).filter(
    (key) => !credentialsFields.includes(key)
  );

  // Loading state UI
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-indigo-400 border-r-transparent border-b-indigo-400 border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white">Loading profile...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 p-6 md:p-12 text-white">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center md:text-left">
          <div>
            <h1 className="text-5xl font-extrabold text-white mb-3">
              Edit Profile
            </h1>
            <p className="text-indigo-200 text-xl">
              Update your personal details and preferences
            </p>
          </div>
        </header>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-indigo-500/20">
          {/* User ID display with improved styling */}
          <div className="mb-8 pb-4 border-b border-indigo-500/30 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <span className="text-xl font-semibold text-indigo-200 mr-3">
                User ID:
              </span>
              <span className="text-xl text-white bg-indigo-900/50 px-4 py-2 rounded-lg font-mono">
                {userId}
              </span>
            </div>

            <button
              className="mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-lg px-6 py-3 rounded-lg transition transform hover:scale-105 flex items-center justify-center"
              onClick={() => setIsEditing(!isEditing)}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isEditing ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                )}
              </svg>
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {/* Account Credentials Section with improved styling */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <svg
                className="w-6 h-6 mr-3 text-indigo-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <h3 className="text-3xl font-bold text-white">
                Account Credentials
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 bg-indigo-800/20 p-6 rounded-xl border border-indigo-500/30">
              {credentialsFields.map((key) => (
                <div key={key} className="mb-2">
                  <label className="block mb-2 text-lg font-semibold text-indigo-200 capitalize flex items-center">
                    {key.replace(/([A-Z])/g, " $1")}
                    {key === "username" && isEditing && (
                      <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded">
                        Editable
                      </span>
                    )}
                  </label>
                  {renderField(key, profile[key])}
                </div>
              ))}
            </div>

            <div className="h-px bg-indigo-500/30 w-full my-8"></div>
          </div>

          {/* Personal Information Section with improved styling */}
          <div>
            <div className="flex items-center mb-6">
              <svg
                className="w-6 h-6 mr-3 text-indigo-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <h3 className="text-3xl font-bold text-white">
                Personal Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {personalInfoFields.map((key) => (
                <div
                  key={key}
                  className={`mb-6 ${
                    key === "skills" || key === "interests"
                      ? "md:col-span-2"
                      : ""
                  }`}
                >
                  <label className="block mb-2 text-lg font-semibold text-indigo-200 capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </label>
                  {renderField(key, profile[key])}
                </div>
              ))}
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end mt-8">
              <button
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg px-8 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition shadow-lg transform hover:scale-105 flex items-center"
                onClick={handleSave}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
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
