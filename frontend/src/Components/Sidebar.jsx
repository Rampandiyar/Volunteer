import { useState } from "react";
import {
  Clipboard,
  Menu,
  X,
  ClipboardList,
  User,
  UserCheck,
  Calendar,
  FileText,
  Send,
} from "lucide-react";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  // Retrieve the user role from localStorage
  const userRole = localStorage.getItem("userRole");

  // Define routes for admin and volunteer
  const adminRoutes = [
    { path: "/volunteermanage", name: "Volunteers", icon: UserCheck },
    { path: "/events", name: "Events Management", icon: Calendar },
    { path: "/admintasks", name: "Tasks Management", icon: Clipboard },
    { path: "/assignmentspage", name: "Assign Task", icon: FileText },
    {
      path: "/adminvolunteerlogviewer",
      name: "Volunteer Tracking",
      icon: FileText,
    },
    { path: "/sendnotification", name: "Send Notification", icon: Send },
  ];

  const volunteerRoutes = [
    { path: "/profile", name: "Edit", icon: User },
    { path: "/task", name: "Tasks", icon: ClipboardList },
    { path: "/volunteerlogviewer", name: "Activity Logs", icon: FileText },
  ];

  // Choose routes based on the user role
  const routes = userRole === "Admin" ? adminRoutes : volunteerRoutes;

  return (
    <>
      {/* Mobile Menu Toggle */}
      <div
        className="md:hidden fixed top-[18px] text left-72 z-50 cursor-pointer text-white/70 "
        size={20}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-16 left-0 h-full w-64 bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 
        shadow-2xl z-40 transition-transform duration-300 text-white
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
      >
        <div className="p-6">
          <nav className="space-y-4">
            {routes.map((route) => (
              <a
                key={route.path}
                href={route.path}
                className="flex items-center space-x-4 p-3 hover:bg-white/10 rounded-xl transition-colors duration-300"
              >
                <route.icon
                  className="text-indigo-200 group-hover:text-white transition-transform duration-300"
                  size={24}
                />
                <span className="text-indigo-200 group-hover:text-white font-semibold transition-colors duration-300">
                  {route.name}
                </span>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
