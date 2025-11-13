import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "../adminCommon/Card";
import { Button } from "../adminCommon/Button";
import {
  Search,
  Plus,
  Edit,
  X,
  Calendar,
  Clock,
  UserCheck,
  Building2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { adminAPI } from "../../api/adminAPI";

const AllAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState({
    doctorId: "",
    patientId: "",
    roomId: "",
    date: "",
    timeSlot: "",
    status: "Scheduled",
  });
  const [toast, setToast] = useState({ message: "", type: "" });

  // Helper functions to get names
  const getPatientName = (patientId) => {
    if (!patientId) return "N/A";
    if (typeof patientId === "object") return patientId.userId?.fullName;
    const patient = patients.find((p) => p._id === patientId);
    return patient?.userId?.fullName || "N/A";
  };

  const getDoctorName = (doctorId) => {
    if (!doctorId) return "N/A";
    if (typeof doctorId === "object") return doctorId.userId?.fullName;
    const doctor = doctors.find((d) => d._id === doctorId);
    return doctor?.userId?.fullName || "N/A";
  };

  const getRoomNumber = (roomId) => {
    if (!roomId) return "N/A";
    if (typeof roomId === "object") return roomId.roomNum;
    const room = rooms.find((r) => r._id === roomId);
    return room?.roomNum || "N/A";
  };

  // Status configuration
  const getStatusConfig = (status) => {
    const configs = {
      Scheduled: {
        color: "bg-blue-100 text-blue-800 border border-blue-200",
        icon: <Calendar className="h-4 w-4" />,
      },
      Completed: {
        color: "bg-green-100 text-green-800 border border-green-200",
        icon: <CheckCircle className="h-4 w-4" />,
      },
      Cancelled: {
        color: "bg-red-100 text-red-800 border border-red-200",
        icon: <XCircle className="h-4 w-4" />,
      },
    };
    return configs[status] || configs.Scheduled;
  };

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, doctorsRes, patientsRes, roomsRes] =
        await Promise.all([
          adminAPI.getAllAppointments(),
          adminAPI.getAllDoctors(),
          adminAPI.getAllPatients(),
          adminAPI.getAllRooms(),
        ]);

      if (appointmentsRes.data.status)
        setAppointments(appointmentsRes.data.appointments);
      if (doctorsRes.data.status) setDoctors(doctorsRes.data.doctors);
      if (patientsRes.data.status) setPatients(patientsRes.data.patients);
      if (roomsRes.data.status) setRooms(roomsRes.data.rooms);
    } catch (err) {
      showToast("Failed to fetch data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((appointment) => {
    const patientName = getPatientName(appointment.patientId);
    const doctorName = getDoctorName(appointment.doctorId);
    const roomNum = getRoomNumber(appointment.roomId);

    return [patientName, doctorName, roomNum].some((field) =>
      field.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAppointment) {
        const res = await adminAPI.updateAppointment(
          editingAppointment._id,
          formData
        );
        if (res.data.status) {
          showToast("Appointment updated successfully");
          setAppointments((prev) =>
            prev.map((apt) =>
              apt._id === editingAppointment._id ? res.data.appointment : apt
            )
          );
        }
      } else {
        const res = await adminAPI.createAppointment(formData);
        if (res.data.status) {
          showToast("Appointment created successfully");
          setAppointments((prev) => [...prev, res.data.appointment]);
        }
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      showToast(err.response?.data?.message || "Something went wrong", "error");
    }
  };

  // Cancel appointment
  const handleCancel = async (id) => {
    try {
      const res = await adminAPI.cancelAppointment(id);
      if (res.data.status) {
        showToast("Appointment cancelled successfully");
        setAppointments((prev) =>
          prev.map((apt) =>
            apt._id === id ? { ...apt, status: "Cancelled" } : apt
          )
        );
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to cancel appointment",
        "error"
      );
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      doctorId: "",
      patientId: "",
      roomId: "",
      date: "",
      timeSlot: "",
      status: "Scheduled",
    });
    setEditingAppointment(null);
  };

  // Open modal
  const openModal = (appointment = null) => {
    if (appointment) {
      setEditingAppointment(appointment);
      setFormData({
        doctorId: appointment.doctorId?._id || appointment.doctorId || "",
        patientId: appointment.patientId?._id || appointment.patientId || "",
        roomId: appointment.roomId?._id || appointment.roomId || "",
        date: appointment.date.split("T")[0],
        timeSlot: appointment.timeSlot,
        status: appointment.status,
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  // Format date and time
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatTime = (timeSlot) => timeSlot || "Not specified";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Appointments Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage all patient appointments and schedules
          </p>
        </div>

        {/* Toast */}
        {toast.message && (
          <div
            className={`fixed top-5 right-5 px-4 py-2 rounded shadow-lg z-50 ${
              toast.type === "error"
                ? "bg-red-500 text-white"
                : "bg-green-500 text-white"
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Total Appointments
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {appointments.length}
                  </p>
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    <span>All Time</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-blue-500 transition-all duration-300 group-hover:scale-110">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Scheduled
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {
                      appointments.filter((a) => a.status === "Scheduled")
                        .length
                    }
                  </p>
                  <div className="flex items-center text-blue-600 text-sm font-medium">
                    <span>Upcoming</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-blue-500 transition-all duration-300 group-hover:scale-110">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Completed
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {
                      appointments.filter((a) => a.status === "Completed")
                        .length
                    }
                  </p>
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    <span>Done</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-green-500 transition-all duration-300 group-hover:scale-110">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Cancelled
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {
                      appointments.filter((a) => a.status === "Cancelled")
                        .length
                    }
                  </p>
                  <div className="flex items-center text-red-600 text-sm font-medium">
                    <span>Cancelled</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-red-500 transition-all duration-300 group-hover:scale-110">
                  <XCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header with decorative line */}
          <div className="relative h-1 bg-blue-500 rounded-t-lg"></div>

          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  All Appointments ({filteredAppointments.length})
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by patient, doctor or room..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                {/* New Appointment Button */}
                <Button
                  onClick={() => openModal()}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Appointment</span>
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading appointments...
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="font-medium">No appointments found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {filteredAppointments.map((appointment) => {
                  const statusConfig = getStatusConfig(appointment.status);

                  return (
                    <div
                      key={appointment._id}
                      className="group bg-white rounded-xl border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6"
                    >
                      {/* Appointment Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {getPatientName(appointment.patientId)}
                          </h3>
                          <p className="text-sm text-gray-600 font-medium">
                            Patient
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}
                          >
                            {statusConfig.icon}
                            <span className="ml-1">{appointment.status}</span>
                          </span>
                        </div>
                      </div>

                      {/* Enhanced Appointment Details */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center p-2 bg-gray-50 rounded-lg border border-gray-100">
                          <UserCheck className="h-4 w-4 mr-3 text-blue-600 flex-shrink-0" />
                          <div>
                            <div className="text-xs text-gray-500 font-medium">
                              Doctor
                            </div>
                            <div className="text-sm font-semibold text-gray-900">
                              {getDoctorName(appointment.doctorId)}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-2 text-blue-600 flex-shrink-0" />
                              <div>
                                <div className="text-xs text-gray-500">
                                  Date
                                </div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {formatDate(appointment.date)}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-2 text-blue-600 flex-shrink-0" />
                              <div>
                                <div className="text-xs text-gray-500">
                                  Time
                                </div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {formatTime(appointment.timeSlot)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                          <div className="flex items-center">
                            <Building2 className="h-3 w-3 mr-2 text-blue-600 flex-shrink-0" />
                            <div>
                              <div className="text-xs text-gray-500">Room</div>
                              <div className="text-sm font-semibold text-gray-900">
                                Room {getRoomNumber(appointment.roomId)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Action Buttons */}
                      <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
                        {appointment.status === "Scheduled" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() =>
                                openModal({
                                  ...appointment,
                                  status: "Completed",
                                })
                              }
                              className="bg-green-600 hover:bg-green-700 text-white font-medium"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Complete
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleCancel(appointment._id)}
                              className="bg-red-600 hover:bg-red-700 text-white font-medium"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openModal(appointment)}
                          className="font-medium"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </div>
      </div>

      {/* Enhanced Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingAppointment
                      ? "Edit Appointment"
                      : "New Appointment"}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {editingAppointment
                      ? "Update appointment details"
                      : "Create a new appointment"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto flex-1 p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {!editingAppointment && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Doctor
                      </label>
                      <select
                        value={formData.doctorId}
                        onChange={(e) =>
                          setFormData({ ...formData, doctorId: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      >
                        <option value="">Select Doctor</option>
                        {doctors.map((doctor) => (
                          <option key={doctor._id} value={doctor._id}>
                            {doctor.userId?.fullName} - {doctor.specialization}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Patient
                      </label>
                      <select
                        value={formData.patientId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            patientId: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      >
                        <option value="">Select Patient</option>
                        {patients.map((patient) => (
                          <option key={patient._id} value={patient._id}>
                            {patient.userId?.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room
                      </label>
                      <select
                        value={formData.roomId}
                        onChange={(e) =>
                          setFormData({ ...formData, roomId: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      >
                        <option value="">Select Room</option>
                        {rooms
                          .filter((room) => room.isAvailable)
                          .map((room) => (
                            <option key={room._id} value={room._id}>
                              Room {room.roomNum} - {room.type}
                            </option>
                          ))}
                      </select>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Slot
                  </label>
                  <input
                    type="text"
                    value={formData.timeSlot}
                    onChange={(e) =>
                      setFormData({ ...formData, timeSlot: e.target.value })
                    }
                    placeholder="e.g., 10:00 AM - 11:00 AM"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <Button
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingAppointment ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllAppointments;
