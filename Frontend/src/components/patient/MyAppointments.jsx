import { useState, useEffect, useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { patientAPI } from "../../api/patientAPI";
import Card from "../common/Card";
import Button from "../common/Button";
import Loader from "../common/Loader";
import { Calendar, Clock, User, MapPin, X, Edit } from "lucide-react";

const MyAppointments = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await patientAPI.getMyAppointments(user._id || user.id);
      const allAppointments = response.data.appointments || [];

      // ✅ Filter out canceled appointments before setting state
      const activeAppointments = allAppointments.filter(
        (apt) => apt.status?.toLowerCase() !== "cancelled"
      );

      setAppointments(activeAppointments);
    } catch (err) {
      setError("Failed to load appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      setCancellingId(appointmentId);
      setError("");

      await patientAPI.cancelAppointment(appointmentId);

      // ✅ Instead of refetching, update state locally
      setAppointments((prev) =>
        prev.filter((apt) => apt._id !== appointmentId)
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
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          My Appointments
        </h1>
        <p className="text-gray-600">
          Manage your scheduled visits and appointments
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-red-700 text-sm font-medium text-center">
            {error}
          </p>
        </div>
      )}

      {/* Appointments List */}
      {appointments.length === 0 ? (
        <Card className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Appointments
          </h3>
          <p className="text-gray-600 mb-6">
            You don't have any active appointments right now.
          </p>
          <Button
            onClick={() => (window.location.href = "/patient/appointment")}
          >
            Book an Appointment
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6">
          {appointments.map((appointment) => (
            <Card key={appointment._id} hover className="p-6 transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                {/* Appointment Details */}
                <div className="flex-1 space-y-4">
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
                        <p className="text-gray-600">
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

                  <div className="grid md:grid-cols-3 gap-4 text-sm">
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
                        {appointment.roomId?.roomNum || "Room not assigned"}
                      </span>
                    </div>
                  </div>

                  {appointment.reason && (
                    <div className="text-sm">
                      <p className="text-gray-700">
                        <strong>Reason:</strong> {appointment.reason}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-3 lg:pl-6">
                  
                  <Button
                    variant="danger"
                    size="small"
                    loading={cancellingId === appointment._id}
                    onClick={() => handleCancelAppointment(appointment._id)}
                    disabled={
                      appointment.status === "completed" ||
                      cancellingId === appointment._id
                    }
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
