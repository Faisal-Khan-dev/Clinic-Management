import { useState, useEffect, useContext } from "react";
import { Card, CardContent, CardHeader } from "../doctorCommon/Card";
import { Calendar, Clock, Users, FileText, TrendingUp } from "lucide-react";
import { doctorAPI } from "../../api/doctorAPI";
import AuthContext from "../../context/AuthContext";


const DoctorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

  const doctorId = user.id; // or get from auth context

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

      const completedCases = histories.filter(
        (h) => h.status === "Completed"
      ).length;
      const pendingCases = appointments.filter(
        (a) => a.status === "Scheduled"
      ).length;

      setStats({
        totalAppointments: appointments.length,
        todayAppointments: todayAppointments.length,
        pendingCases,
        completedCases,
        patientSatisfaction: 94, // optional placeholder
        averageWaitTime: "15 min",
      });

      // Recent appointments (limit to 5)
      const sorted = [...appointments]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5)
        .map((a) => ({
          id: a._id,
          patientName: a.patientId?.userId?.fullName || "Unknown",
          time: a.timeSlot || "N/A",
          status: a.status?.toLowerCase(),
          type: a.reason || "Consultation",
        }));

      setRecentAppointments(sorted);
    } catch (error) {
      console.error("Error loading doctor dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    
    fetchDashboardData();
  }, [doctorId]);

  if (loading || !stats) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, Dr. {user?.fullName || "User"} — here’s your clinic
          overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Appointments"
          value={stats.totalAppointments}
          icon={<Calendar className="h-6 w-6" />}
          change="+12%"
          color="blue"
        />
        <StatCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          icon={<Clock className="h-6 w-6" />}
          change="+2"
          color="green"
        />
        <StatCard
          title="Pending Cases"
          value={stats.pendingCases}
          icon={<FileText className="h-6 w-6" />}
          change="-3"
          color="orange"
        />
        <StatCard
          title="Patient Satisfaction"
          value={`${stats.patientSatisfaction}%`}
          icon={<Users className="h-6 w-6" />}
          change="+4%"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Appointments */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-lg font-semibold flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Today's Appointments</span>
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAppointments.length ? (
                recentAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          appointment.status === "completed"
                            ? "bg-green-500"
                            : "bg-blue-500"
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
                        className={`text-sm capitalize ${
                          appointment.status === "completed"
                            ? "text-green-600"
                            : "text-blue-600"
                        }`}
                      >
                        {appointment.status}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No appointments today.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Quick Stats</span>
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed Cases</span>
              <span className="font-semibold text-green-600">
                {stats.completedCases}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg. Wait Time</span>
              <span className="font-semibold text-blue-600">
                {stats.averageWaitTime}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">New Patients</span>
              <span className="font-semibold text-purple-600">
                {recentAppointments.length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Reuse your StatCard & LoadingSkeleton (no changes)
const StatCard = ({ title, value, icon, change, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
  };

  const changeColor = change.startsWith("+")
    ? "text-green-600"
    : "text-red-600";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            <p className={`text-xs font-medium ${changeColor} mt-1`}>
              {change} from last week
            </p>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-64"></div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      ))}
    </div>
  </div>
);

export default DoctorDashboard;
