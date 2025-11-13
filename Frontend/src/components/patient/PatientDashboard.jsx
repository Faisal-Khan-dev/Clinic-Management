import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  User,
  Menu,
  X,
  LogOut,
  Stethoscope,
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  Calendar,
  Clock,
  FileText,
} from "lucide-react";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

   const menuItems = [
     {
       name: "Dashboard",
       path: "/patient/dashboard",
       icon: Stethoscope,
     },

     {
       name: "Book Appointment",
       path: "/patient/appointment",
       icon: Calendar,
     },
     {
       name: "My Appointments",
       path: "/patient/appointments",
       icon: Clock,
     },
     {
       name: "Case History",
       path: "/patient/case-history",
       icon: FileText,
     },
     {
       name: "Profile",
       path: "/patient/profile",
       icon: User,
     },
   ];

  const isActivePath = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/80 to-indigo-100/90 flex relative overflow-hidden">
      {/* Enhanced CSS Animations */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(99, 102, 241, 0.5);
          }
        }

        .animate-shimmer {
          animation: shimmer 3s linear infinite;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%);
          background-size: 1000px 100%;
        }

        .animate-slide-in-left {
          animation: slideInLeft 0.3s ease-out forwards;
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
      `}</style>

      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-80 bg-white/95 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full relative overflow-hidden">
          {/* Decorative gradient overlay */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 animate-shimmer" />

          {/* Header */}
          <div className="p-6 border-b border-gray-200/80 flex-shrink-0 animate-slide-in-left">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg animate-pulse-glow">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  HealthCare+
                </h1>
                <p className="text-sm text-gray-600 font-medium">
                  Patient Portal
                </p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div
            className="p-6 border-b border-gray-200/80 flex-shrink-0 animate-slide-in-left"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center transition-transform duration-300 hover:scale-110">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {user?.fullName || "Admin"}
                </p>
                <p className="text-xs text-gray-600 truncate font-medium">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 transform hover:scale-105 animate-slide-in-left ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600"
                  }`}
                  style={{ animationDelay: `${0.2 + index * 0.05}s` }}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform duration-300 ${
                      isActive ? "scale-110" : ""
                    }`}
                  />
                  <span className="font-semibold">{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div
            className="p-4 border-t border-gray-200/80 flex-shrink-0 animate-slide-in-left"
            style={{ animationDelay: "0.5s" }}
          >
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 hover:text-red-600 transition-all duration-300 transform hover:scale-105 group"
            >
              <LogOut className="w-5 h-5 group-hover:animate-pulse" />
              <span className="font-semibold">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-80 transition-all duration-300">
        {/* Top Navbar */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/80 sticky top-0 z-20 flex-shrink-0 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:scale-110"
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Welcome back, {user?.fullName?.split(" ")[0] || "Admin"}!
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50 shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-blue-700">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
