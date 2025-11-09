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
import { adminAPI } from "../../api/adminAPI"; // Import your API instance

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

  // Helper function to get patient name
  const getPatientName = (patient) => {
    return patient?.userId?.fullName || "N/A";
  };

  // Helper function to get doctor name
  const getDoctorName = (doctor) => {
    return doctor?.userId?.fullName || "N/A";
  };

  // Helper function to get room number
  const getRoomNumber = (room) => {
    return room?.roomNum || "N/A";
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [appointmentsRes, patientsRes, doctorsRes, roomsRes] =
          await Promise.all([
            adminAPI.getAllAppointments(),
            adminAPI.getAllPatients(),
            adminAPI.getAllDoctors(),
            adminAPI.getAllRooms(),
          ]);

        console.log("Dashboard Data:", {
          appointments: appointmentsRes.data,
          patients: patientsRes.data,
          doctors: doctorsRes.data,
          rooms: roomsRes.data,
        });

        // Extract data from responses
        const appointments = appointmentsRes.data.appointments || [];
        const patients = patientsRes.data.patients || [];
        const doctors = doctorsRes.data.doctors || [];
        const rooms = roomsRes.data.rooms || [];

        // Calculate stats
        const totalPatients = patients.length;
        const totalDoctors = doctors.length;
        const totalAppointments = appointments.length;
        const availableRooms = rooms.filter((room) => room.isAvailable).length;

        // Get recent appointments (last 5 scheduled appointments)
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

        // Get recent patients (last 5 registered patients)
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

        // Update state
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
        // Set default values in case of error
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
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 p-3 rounded-lg ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
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
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome to your hospital management dashboard
        </p>
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
          title="Total Appointments"
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Appointments - Only Scheduled */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Scheduled Appointments
            </h2>
            <Link to="/admin/appointments">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No scheduled appointments found.
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentAppointments.map((appointment) => (
                      <tr key={appointment._id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {appointment.patientName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {appointment.doctorName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {appointment.date} {appointment.timeSlot}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
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
          </CardContent>
        </Card>

        {/* Recent Patients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Recently Added Patients
            </h2>
            <Link to="/admin/patients">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentPatients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No patients found.
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
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
                      <tr key={patient._id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {patient.name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {patient.email}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {patient.gender}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {patient.age}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
