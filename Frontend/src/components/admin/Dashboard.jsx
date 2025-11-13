import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardContent } from "../adminCommon/Card";
import { Button } from "../adminCommon/Button";
import Loader from "../common/Loader";
import {
  Users,
  UserCheck,
  Calendar,
  Building2,
  ArrowRight,
} from "lucide-react";
import { adminAPI } from "../../api/adminAPI";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    availableRooms: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);

  const getPatientName = (patient) => {
    return patient?.userId?.fullName || "N/A";
  };

  const getDoctorName = (doctor) => {
    return doctor?.userId?.fullName || "N/A";
  };

  const getRoomNumber = (room) => {
    return room?.roomNum || "N/A";
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [appointmentsRes, patientsRes, doctorsRes, roomsRes] =
          await Promise.all([
            adminAPI.getAllAppointments(),
            adminAPI.getAllPatients(),
            adminAPI.getAllDoctors(),
            adminAPI.getAllRooms(),
          ]);

        const appointments = appointmentsRes.data.appointments || [];
        const patients = patientsRes.data.patients || [];
        const doctors = doctorsRes.data.doctors || [];
        const rooms = roomsRes.data.rooms || [];
        console.log("rooms", rooms);
        

        const totalPatients = patients.length;
        const totalDoctors = doctors.length;
        const totalAppointments = appointments.length;
        const availableRooms = rooms.filter((room) => room.isAvailable).length;

        const recentAppointments = appointments
          .filter((appointment) => appointment.status === "Scheduled")
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5)
          .map((appointment) => ({
            _id: appointment._id,
            patientName: getPatientName(appointment.patientId),
            doctorName: getDoctorName(appointment.doctorId),
            date: new Date(appointment.date).toLocaleDateString(),
            timeSlot: appointment.timeSlot,
            status: appointment.status,
            roomNum: getRoomNumber(appointment.roomId),
          }));

        const recentPatients = patients
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map((patient) => ({
            _id: patient._id,
            name: patient.userId?.fullName || "N/A",
            email: patient.userId?.email || "N/A",
            gender: patient.gender || "N/A",
            age: patient.userId?.age || "N/A",
            registeredDate: new Date(patient.createdAt).toLocaleDateString(),
          }));

        setStats({
          totalPatients,
          totalDoctors,
          totalAppointments,
          availableRooms,
        });
        setRecentAppointments(recentAppointments);
        setRecentPatients(recentPatients);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setStats({
          totalPatients: 0,
          totalDoctors: 0,
          totalAppointments: 0,
          availableRooms: 0,
        });
        setRecentAppointments([]);
        setRecentPatients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader size="lg" />
          <p className="text-gray-600 font-semibold mt-4">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

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

  const getStatusColor = (status) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen rounded-t-3xl bg-gray-50">
      {/* Hero Section with Image */}
      <div className="relative bg-gradient-to-r rounded-t-3xl from-blue-600  to-purple-700">
        <div className="absolute inset-0 bg-black rounded-t-3xl  opacity-20"></div>
        <div
          className="relative h-55 bg-cover bg-center rounded-t-3xl bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
          }}
        >
          <div className="absolute inset-0 rounded-t-3xl bg-gradient-to-r from-blue-600/80 to-purple-700/80"></div>
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-2">
                Clinic Management System
              </h1>
              <p className="text-xl opacity-90">
                Comprehensive Healthcare Dashboard
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
                  Welcome to your hospital management dashboard
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
              title="Total Patients"
              value={stats.totalPatients}
              icon={Users}
              color="bg-blue-500"
            />
            <StatCard
              title="Total Doctors"
              value={stats.totalDoctors}
              icon={UserCheck}
              color="bg-green-500"
            />
            <StatCard
              title="Appointments"
              value={stats.totalAppointments}
              icon={Calendar}
              color="bg-purple-500"
            />
            <StatCard
              title="Available Rooms"
              value={stats.availableRooms}
              icon={Building2}
              color="bg-orange-500"
            />
          </div>

          {/* Recent Data Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Appointments */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Header with decorative line */}
              <div className="relative h-1 bg-blue-500"></div>

              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Recent Appointments
                    </h2>
                  </div>
                  <Link to="/admin/appointments">
                    <button className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors duration-200">
                      View All
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>

              <div className="p-6">
                {recentAppointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="font-medium">
                      No scheduled appointments found.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Patient
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Doctor
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {recentAppointments.map((appointment) => (
                          <tr
                            key={appointment._id}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {appointment.patientName}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {appointment.doctorName}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {appointment.date} {appointment.timeSlot}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(
                                  appointment.status
                                )}`}
                              >
                                {appointment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Patients */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Header with decorative line */}
              <div className="relative h-1 bg-green-500"></div>

              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Recent Patients
                    </h2>
                  </div>
                  <Link to="/admin/patients">
                    <button className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors duration-200">
                      View All
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>

              <div className="p-6">
                {recentPatients.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="font-medium">No patients found.</p>
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Gender
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Age
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {recentPatients.map((patient) => (
                          <tr key={patient._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {patient.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {patient.email}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {patient.gender}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {patient.age}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
