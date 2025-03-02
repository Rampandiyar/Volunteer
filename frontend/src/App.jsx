import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react"; // Import useEffect
import Home from "./pages/Home.jsx";
import Navbar from "./Components/Navbar.jsx";
import Login from "./pages/Auth/login.jsx";
import Signup from "./pages/Auth/Signup.jsx"; // Ensure correct import
import ForgotPassword from "./pages/Auth/ForgetPassword.jsx";
import TaskManagement from "./pages/Volunteer/TaskManagement.jsx";
import VolunteerTracking from "./pages/Admin/VolunteerTracking.jsx";
import Dashboard from "./pages/Admin/Dashboard.jsx";
import Sidebar from "./Components/Sidebar.jsx";
import Profile from "./pages/Admin/Profile.jsx";
import VolunteerManagement from "./pages/Admin/VolunteerManagement.jsx";
import EventS from "./pages/Admin/EventS.jsx";
import AssignmentsPage from "./pages/Admin/AssignmestPage.jsx";
import AdminTasks from "./pages/Admin/TaskAdmin.jsx";
import VolunteerLogViewer from "./pages/Admin/VolunteerLogViewer.jsx";
import SendNotification from "./pages/Admin/SendNotification.jsx";
import AdminDashboard from "./pages/Admin/DashboardAdmin.jsx";
import AdminVolunteerLogViewer from "./pages/Admin/Adminlogviewer.jsx";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId"); // Fetch from localStorage or state

  // Check if there's a value in localStorage (e.g., a logged-in user's token or session)
  const userRole = localStorage.getItem("userRole"); // Replace "userToken" with your actual key

  useEffect(() => {
    console.log("Current path:", location.pathname);
    console.log("User role:", userRole);

    const publicRoutes = ["/", "/login", "/signup", "/forgot-password"];

    // Normalize the current path to lowercase
    const normalizedPath = location.pathname.toLowerCase();

    // If not logged in and trying to access a protected route
    if (!userRole && !publicRoutes.includes(normalizedPath)) {
      console.log("Redirecting to /login");
      navigate("/login");
    }

    // Optional: Redirect logged-in users away from auth pages
    if (userRole && publicRoutes.includes(normalizedPath)) {
      console.log("Redirecting to dashboard");
      navigate(userRole === "Admin" ? "/admindashboard" : "/dashboard");
    }
  }, [userRole, location.pathname, navigate]);

  // Determine if Navbar and Footer should be hidden on certain pages
  const hideNavAndFooter = ["/", "/login", "/signup"].includes(
    location.pathname.toLowerCase() // Normalize path for comparison
  );

  // Determine if Sidebar should be shown on Admin-related routes
  const showSidebar = [
    "/dashboard",
    "/task",
    "/reports",
    "/volun",
    "/profile",
    "/volunteermanage",
    "/events",
    "/assignmentspage",
    "/admintasks",
    "/admindashboard",
    "/volunteerlogviewer",
    "/sendnotification",
    "/adminvolunteerlogviewer",
  ].includes(location.pathname.toLowerCase()); // Normalize path for comparison

  // Define routes for Volunteer
  const volunteerRoutes = (
    <>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/task" element={<TaskManagement />} />
      <Route path="/profile" element={<Profile />} />
      <Route
        path="/volunteerlogviewer"
        element={<VolunteerLogViewer userId={userId} />}
      />
    </>
  );

  // Define routes for Admin
  const adminRoutes = (
    <>
      <Route path="/admindashboard" element={<AdminDashboard />} />
      <Route path="/volun" element={<VolunteerTracking />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/volunteermanage" element={<VolunteerManagement />} />
      <Route path="/events" element={<EventS />} />
      <Route path="/assignmentspage" element={<AssignmentsPage />} />
      <Route path="/admintasks" element={<AdminTasks />} />
      <Route
        path="/adminvolunteerlogviewer"
        element={<AdminVolunteerLogViewer />}
      />
      <Route path="/sendnotification" element={<SendNotification />} />
    </>
  );

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar - Full width on mobile, separate space on laptop */}
      {!hideNavAndFooter && (
        <header className="w-full">
          <Navbar />
        </header>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Only on laptop screens */}
        {showSidebar && (
          <div className="hidden md:block w-64 bg-gray-200">
            <Sidebar />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-auto">
          {/* Mobile Sidebar (if needed) */}
          {showSidebar && (
            <div className="md:hidden">
              <Sidebar />
            </div>
          )}

          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />{" "}
              {/* Use lowercase */}
              <Route path="/forgot-password" element={<ForgotPassword />} />
              {/* Conditionally render routes based on userRole */}
              {userRole === "Volunteer" && volunteerRoutes}
              {userRole === "Admin" && adminRoutes}
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function WrappedApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}
