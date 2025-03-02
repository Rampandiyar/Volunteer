import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { createUser } from "../../api"; // Import the API function
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();
  // Clear localStorage on component mount (optional)
  localStorage.clear();

  // State for form data
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    role: "",
    year: "",
    department: "",
  });

  // State for form errors and touched fields
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);

  // State for dropdown options
  const [years, setYears] = useState([]);
  const [departments, setDepartments] = useState([]);

  // State for success and error messages
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch years and departments on component mount
  useEffect(() => {
    // Simulate fetching from API
    setYears(["1", "2", "3", "4"]);
    setDepartments(["Computer Science", "Mechanical", "Electrical", "Civil"]);
  }, []);

  // Field validation function
  const validateField = (username, value) => {
    switch (username) {
      case "username":
        if (!value) return "Name is required";
        if (value.length < 2) return "Name must be at least 2 characters";
        return "";

      case "email":
        if (!value) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "Invalid email address";
        return "";

      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/[A-Z]/.test(value))
          return "Must contain at least one uppercase letter";
        if (!/[a-z]/.test(value))
          return "Must contain at least one lowercase letter";
        if (!/[0-9]/.test(value)) return "Must contain at least one number";
        return "";

      case "phone":
        if (!value) return "Phone number is required";
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(value)) return "Invalid phone number";
        return "";

      case "role":
        if (!value) return "Role is required";
        return "";

      case "year":
        if (!value) return "Year is required";
        return "";

      case "department":
        if (!value) return "Department is required";
        return "";

      default:
        return "";
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate field if it has been touched
    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
  };

  // Handle input blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const fieldErrors = Object.keys(formData).reduce((acc, key) => {
      acc[key] = validateField(key, formData[key]);
      return acc;
    }, {});

    setErrors(fieldErrors);
    setTouched(
      Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );

    // If no errors, submit the form
    if (Object.values(fieldErrors).every((error) => !error)) {
      try {
        const response = await createUser(formData); // Call the API
        setSuccessMessage("User created successfully!");
        setErrorMessage("");
        navigate("/login");
        console.log("User created successfully:", response);
        // Optionally, redirect to login page or clear the form
        setFormData({
          username: "",
          email: "",
          password: "",
          phone: "",
          role: "",
          year: "",
          department: "",
        });
      } catch (error) {
        setErrorMessage("Error creating user. Please try again.");
        setSuccessMessage("");
        console.error("Error creating user:", error);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 p-4">
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 mb-2">
            Create Account
          </h1>
          <p className="text-gray-600">Join our community today!</p>
        </div>

        {/* Success and error messages */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {errorMessage}
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name, Email, and Phone Fields */}
          {["username", "email", "phone"].map((field) => (
            <div key={field}>
              <label className="block text-gray-700 font-medium mb-2 capitalize">
                {field}
              </label>
              <input
                type={field === "email" ? "email" : "text"}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={`Enter your ${field}`}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              {touched[field] && errors[field] && (
                <p className="text-red-500 text-sm mt-1 animate-pulse">
                  {errors[field]}
                </p>
              )}
            </div>
          ))}

          {/* Password Field */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Create a strong password"
                className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {touched.password && errors.password && (
              <p className="text-red-500 text-sm mt-1 animate-pulse">
                {errors.password}
              </p>
            )}
          </div>

          {/* Role, Year, and Department Fields */}
          {["role", "year", "department"].map((field) => (
            <div key={field}>
              <label className="block text-gray-700 font-medium mb-2 capitalize">
                {field}
              </label>
              <select
                name={field}
                value={formData[field]}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">{`Select ${field}`}</option>
                {(field === "role"
                  ? ["Admin", "Volunteer"]
                  : field === "year"
                  ? years
                  : departments
                ).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {touched[field] && errors[field] && (
                <p className="text-red-500 text-sm mt-1 animate-pulse">
                  {errors[field]}
                </p>
              )}
            </div>
          ))}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-pink-700 transition duration-300 ease-in-out"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
