import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "../doctorCommon/Card";
import {
  Calendar,
  Clock,
  Users,
  FileText,
  TrendingUp,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { doctorAPI } from "../../api/doctorAPI";
import AuthContext from "../../context/AuthContext";

const DoctorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const doctorId = user.id;

  const fetchDashboardData = async () => {
    try {
      if (!doctorId) return;
      console.log("function run ");

      // Fetch data in parallel
      const [profileRes, appointmentsRes, historiesRes] = await Promise.all([
        doctorAPI.getDoctorProfile(doctorId),
        doctorAPI.getDoctorAppointments(doctorId),
        doctorAPI.getPatientHistory(doctorId),
      ]);

      console.log(profileRes, appointmentsRes, historiesRes);
      const appointments = appointmentsRes?.data.appointments || [];
      const histories = historiesRes?.data.data || [];

      // Calculate stats dynamically
      const today = new Date().toISOString().split("T")[0];
      const todayAppointments = appointments.filter(
        (a) => a.date?.split("T")[0] === today
      );

      // Calculate completed cases from both appointments and histories
      const completedAppointments = appointments.filter(
        (a) => a.status === "Completed"
      ).length;

      const completedHistories = histories.filter(
        (h) => h.status === "Completed"
      ).length;

      // Total completed cases (from both sources)
      const completedCases = completedAppointments + completedHistories;

      const pendingCases = appointments.filter(
        (a) => a.status === "Scheduled"
      ).length;

      setStats({
        totalAppointments: appointments.length,
        todayAppointments: todayAppointments.length,
        pendingCases,
        completedCases,
        patientSatisfaction: 94,
        averageWaitTime: "15 min",
      });

      // Get today's date for filtering
      const todayDate = new Date().toISOString().split("T")[0];

      // Filter today's appointments and limit to 5
      const todaysFilteredAppointments = appointments
        .filter((appointment) => appointment.date?.split("T")[0] === todayDate)
        .slice(0, 5) // Limit to 5 appointments
        .map((a) => ({
          id: a._id,
          patientName: a.patientId?.userId?.fullName || "Unknown",
          time: a.timeSlot || "N/A",
          status: a.status?.toLowerCase(),
          type: a.reason || "Consultation",
        }));

      setRecentAppointments(todaysFilteredAppointments);
    } catch (error) {
      console.error("Error loading doctor dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [doctorId]);

  const handleViewAllAppointments = () => {
    navigate("/doctor/appointments");
  };

  if (loading || !stats) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen  bg-gray-50">
      {/* Hero Section with Image */}
      <div className="relative bg-gradient-to-r rounded-t-3xl from-blue-600 to-purple-700">
        <div className="absolute inset-0 rounded-t-3xl bg-black opacity-20"></div>
        <div
          className="relative h-55 bg-cover bg-center bg-no-repeat rounded-t-3xl shadow-lg"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-purple-700/80 rounded-t-3xl"></div>
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-2">Doctor Dashboard</h1>
              <p className="text-xl opacity-90">
                Comprehensive Patient Management System
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-6 -mt-8 relative z-20">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Dashboard Overview
                </h1>
                <p className="text-gray-600 mt-1">
                  Welcome back, Dr. {user?.fullName || "User"} — here's your
                  dashboard overview
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Today's Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Appointments"
              value={stats.totalAppointments}
              icon={Calendar}
              color="bg-blue-500"
            />
            <StatCard
              title="Today's Appointments"
              value={stats.todayAppointments}
              icon={Clock}
              color="bg-green-500"
            />
            <StatCard
              title="Completed Cases"
              value={stats.completedCases}
              icon={CheckCircle}
              color="bg-green-500"
            />
            <StatCard
              title="Patient Satisfaction"
              value={`${stats.patientSatisfaction}%`}
              icon={Users}
              color="bg-purple-500"
            />
          </div>

          {/* Recent Data Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's Appointments */}
            <div className="bg-white rounded-b-lg shadow-sm border border-gray-200 lg:col-span-2">
              {/* Header with decorative line */}
              <div className="relative h-1 bg-blue-500 rounded-t-lg"></div>

              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Today's Appointments ({recentAppointments.length})
                    </h2>
                  </div>
                  <button
                    onClick={handleViewAllAppointments}
                    className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors duration-200 cursor-pointer hover:bg-blue-50 rounded-lg"
                  >
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {recentAppointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="font-medium">
                      No appointments scheduled for today.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              appointment.status === "completed"
                                ? "bg-green-500"
                                : appointment.status === "scheduled"
                                ? "bg-blue-500"
                                : "bg-gray-500"
                            }`}
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {appointment.patientName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {appointment.type}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {appointment.time}
                          </p>
                          <p
                            className={`text-sm font-medium capitalize ${
                              appointment.status === "completed"
                                ? "text-green-600"
                                : appointment.status === "scheduled"
                                ? "text-blue-600"
                                : "text-gray-600"
                            }`}
                          >
                            {appointment.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-b-lg shadow-sm border border-gray-200">
              {/* Header with decorative line */}
              <div className="relative h-1 bg-green-500 rounded-t-lg"></div>

              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Quick Stats
                    </h2>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700 font-medium">
                      Completed Cases
                    </span>
                    <span className="font-semibold text-blue-600 text-lg">
                      {stats.completedCases}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-700 font-medium">
                      Avg. Wait Time
                    </span>
                    <span className="font-semibold text-green-600 text-lg">
                      {stats.averageWaitTime}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-gray-700 font-medium">
                      Today's Patients
                    </span>
                    <span className="font-semibold text-purple-600 text-lg">
                      {recentAppointments.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="text-gray-700 font-medium">
                      Pending Cases
                    </span>
                    <span className="font-semibold text-orange-600 text-lg">
                      {stats.pendingCases}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Updated StatCard component matching admin dashboard style
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          <div className="flex items-center text-green-600 text-sm font-medium">
            <span>Active</span>
          </div>
        </div>
        <div
          className={`p-3 rounded-lg ${color} transition-all duration-300 group-hover:scale-110`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  </div>
);

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    {/* Hero Section Skeleton */}
    <div className="relative bg-gray-300 rounded-b-3xl">
      <div className="h-56 rounded-t-3xl"></div>
    </div>

    <div className="p-6 -mt-8 relative z-20">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 animate-pulse">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
            <div className="text-right">
              <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
              <div className="h-5 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default DoctorDashboard;
