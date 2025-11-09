import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import { patientAPI } from "../../api/patientAPI";
import Card from "../common/Card";
import Button from "../common/Button";
import Loader from "../common/Loader";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  X,
  Edit,
  FileText,
  Activity,
  ArrowRight,
} from "lucide-react";

const PatientDashboard = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [view, setView] = useState("appointments");
  const navigate = useNavigate();

  // Dummy medical history data
  const medicalHistor = [
    {
      id: 1,
      date: "2024-09-14",
      doctor: "Dr. Sarah Malik",
      diagnosis: "Migraine",
      prescription: "Pain relief medication (Ibuprofen)",
      notes: "Follow-up in two weeks.",
    },
    {
      id: 2,
      date: "2024-07-21",
      doctor: "Dr. Ahmed Khan",
      diagnosis: "Seasonal Allergy",
      prescription: "Cetirizine 10mg daily",
      notes: "Use air purifier and avoid pollen exposure.",
    },
    {
      id: 3,
      date: "2024-04-05",
      doctor: "Dr. Hira Siddiqui",
      diagnosis: "High Blood Pressure",
      prescription: "Amlodipine 5mg daily",
      notes: "Monitor BP daily and limit salt intake.",
    },
  ];


  
  useEffect(() => {
    fetchAppointments();
  }, []);
  useEffect(() => {
    fetchMedicalHistories();
  }, []);

  const fetchMedicalHistories = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await patientAPI.getCaseHistory(user._id || user.id);
      const data = response.data.history || [];
      setMedicalHistory(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await patientAPI.getMyAppointments(user._id || user.id);
      const data = response.data.appointments || [];
      setAppointments(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      setCancellingId(appointmentId);
      await patientAPI.cancelAppointment(appointmentId);
      setAppointments((prev) =>
        prev.map((apt) =>
          apt._id === appointmentId ? { ...apt, status: "Cancelled" } : apt
        )
      );
    } catch (err) {
      console.error(err);
      setError("Failed to cancel appointment. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "scheduled":
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Patient Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back, {user?.fullName || "Patient"}
        </p>
      </div>

      {/* Switch Buttons */}
      <div className="flex justify-center space-x-4 mb-6">
        <Button
          variant={view === "appointments" ? "primary" : "secondary"}
          onClick={() => setView("appointments")}
        >
          My Appointments
        </Button>
        <Button
          variant={view === "history" ? "primary" : "secondary"}
          onClick={() => setView("history")}
        >
          Medical History
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader size="large" />
        </div>
      ) : view === "appointments" ? (
        <>
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Recent Appointments
            </h2>
            <button
              onClick={() => navigate("/patient/appointments")}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="text-red-700 text-sm font-medium text-center">
                {error}
              </p>
            </div>
          )}

          {appointments.length === 0 ? (
            <Card className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Appointments Yet
              </h3>
              <p className="text-gray-600 mb-6">
                You don't have any appointments right now.
              </p>
              <Button
                onClick={() => (window.location.href = "/patient/appointment")}
              >
                Book an Appointment
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {appointments.reverse().slice(0, 4).map((appointment) => (
                <Card
                  key={appointment._id}
                  className="p-6 transition-all border hover:shadow-md"
                >
                  <div className="flex flex-col space-y-4">
                    {/* Doctor Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            Dr.{" "}
                            {appointment.doctorId?.userId?.fullName ||
                              appointment.doctorName ||
                              "Unknown"}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {appointment.specialization || "General"}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {appointment.status || "Scheduled"}
                      </span>
                    </div>

                    {/* Appointment Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{appointment.timeSlot}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {appointment.roomId?.roomNum || "Not Assigned"}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    {appointment.status?.toLowerCase() !== "cancelled" && (
                      <div className="flex space-x-3 pt-2">
                        <Button
                          variant="danger"
                          size="small"
                          loading={cancellingId === appointment._id}
                          onClick={() =>
                            handleCancelAppointment(appointment._id)
                          }
                          disabled={appointment.status === "completed"}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Recent Medical History
            </h2>
            <button
              onClick={() => navigate("/patient/case-history")}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {medicalHistory.reverse().slice(0, 4).map((record) => (
              <Card key={record.id} className="p-6 border hover:shadow-md">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {record.diagnosis}
                    </h3>
                    <p className="text-sm text-gray-600">{record.doctor}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-1">
                  <strong>Date:</strong> {formatDate(record.date)}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  <strong>Prescription:</strong> {record.prescription}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  <strong>Notes:</strong> {record.notes}
                </p>
                <div className="flex items-center justify-end mt-3">
                  <Activity className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-700 font-medium">
                    Reviewed
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PatientDashboard;
