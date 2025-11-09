import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AuthContext, { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

// Patient Components
import PatientDashboard from "./components/patient/PatientDashboard";
import AppointmentBooking from "./components/patient/AppointmentBooking";
import MyAppointments from "./components/patient/MyAppointments";
import CaseHistory from "./components/patient/CaseHistory";
import Profile from "./components/patient/Profile";
import PatientDashboardPage from "./components/patient/patientDashboardPage";

// 🔹 Admin Pages
import Dashboard from "./components/admin/Dashboard";
import AllPatients from "./components/admin/AllPatients";
import AllDoctors from "./components/admin/AllDoctors";
import AllRooms from "./components/admin/AllRooms";
import { useContext } from "react";
import AdminLayout from "./components/admin/AdminLayout";
import AllAppointments from "./components/admin/AllAppointments";

import DoctorLayout from "./components/doctor/DoctorLayout";
import DoctorDashboard from "./components/doctor/DoctorDashboard";
import DoctorProfile from "./components/doctor/DoctorProfile";
import DoctorAppointments from "./components/doctor/DoctorAppointments";
import CaseHistoryForm from "./components/doctor/CaseHistoryForm";
import PatientHistory from "./components/doctor/PatientHistory";



// Loading component
const Loader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// App content with routes
const AppContent = () => {
  const { loading } = useAuth();
  const { user } = useContext(AuthContext);
  const isDoctor = user?.role === "Doctor";

  console.log(user);
  
    const isAdmin = user?.role === "Admin";

  if (loading) {
    return <Loader />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Patient Routes */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute>
            <PatientDashboard />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<PatientDashboardPage />} />
        <Route path="appointment" element={<AppointmentBooking />} />
        <Route path="appointments" element={<MyAppointments />} />
        <Route path="case-history" element={<CaseHistory />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {isAdmin ? (
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/patients" element={<AllPatients />} />
          <Route path="/admin/doctors" element={<AllDoctors />} />
          <Route path="/admin/rooms" element={<AllRooms />} />
          <Route path="/admin/appointments" element={<AllAppointments />} />
        </Route>
      ) : (
        // Redirect to login if not admin
        <Route path="/admin/*" element={<Navigate to="/" replace />} />
      )}

      {/* Doctor Routes */}
      {isDoctor ? (
        <Route
          path="/doctor"
          element={
            <ProtectedRoute>
              <DoctorLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="profile" element={<DoctorProfile />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="case-history" element={<CaseHistoryForm />} />
          <Route path="patient-history" element={<PatientHistory />} />
        </Route>
      ) : (
        <Route path="/doctor/*" element={<Navigate to="/" replace />} />
      )}

      {/* 404 Page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );

};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
