import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../api"; // Import the loginUser API function

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null); // State for handling login errors
  const navigate = useNavigate();

  // Clear localStorage when the Login component mounts
  useEffect(() => {
    localStorage.clear();
  }, []);

  const formik = useFormik({
    initialValues: { email: "", password: "" }, // Use email instead of username
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address") // Validate email format
        .required("Required"), // Email is required
      password: Yup.string().required("Required"),
    }),
    onSubmit: async (values) => {
      setError(null); // Reset error state
      try {
        // Call the loginUser API function with email
        const response = await loginUser({
          email: values.email, // Use email instead of username
          password: values.password,
        });

        // Save the token and role in localStorage
        localStorage.setItem("token", response.token);
        localStorage.setItem("userRole", response.user.role);
        localStorage.setItem("userId", response.user.user_id);

        // Navigate to the respective dashboard based on the role
        if (response.user.role === "Admin") {
          navigate("/admindashboard");
        } else if (response.user.role === "Volunteer") {
          navigate("/dashboard");
        }
      } catch (err) {
        console.error("Login error:", err);
        setError("Invalid email or password"); // Set error message
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 p-4">
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 mb-2">
            Welcome Back!
          </h1>
          <p className="text-gray-600">Login to your account</p>
        </div>

        {error && (
          <div className="text-red-500 text-center mb-4 animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-gray-700 font-medium mb-2"
            >
              Email
            </label>
            <input
              type="email" // Use type="email" for email input
              name="email"
              id="email"
              placeholder="Enter your email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-300 ease-in-out"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500 text-sm mt-1 animate-pulse">
                {formik.errors.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-gray-700 font-medium mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                placeholder="Enter your password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-300 ease-in-out"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-500 text-sm mt-1 animate-pulse">
                {formik.errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-pink-700 transition duration-300 ease-in-out"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don&apos;t have an account?{" "}
          <div className="text-indigo-600 hover:text-indigo-800 font-semibold transition duration-300">
            <a href="/Signup">Sign up here</a>
          </div>
        </p>
      </div>
    </div>
  );
}

export default Login;