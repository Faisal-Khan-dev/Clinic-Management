import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "../adminCommon/Card";
import { Button } from "../adminCommon/Button";
import {
  Search,
  Plus,
  Edit,
  ChevronDown,
  X,
  Calendar,
  Clock,
  User,
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
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDate, setFilterDate] = useState("");
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

  // Helper functions to get names - Pehle define karo
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
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <Calendar className="h-3 w-3" />,
      },
      Completed: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <CheckCircle className="h-3 w-3" />,
      },
      Cancelled: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: <XCircle className="h-3 w-3" />,
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

  // Filter appointments - Ab helper functions available hain
  const filteredAppointments = appointments.filter((appointment) => {
    const patientName = getPatientName(appointment.patientId);
    const doctorName = getDoctorName(appointment.doctorId);
    const roomNum = getRoomNumber(appointment.roomId);


    const matchesSearch = [patientName, doctorName, roomNum].some((field) =>
      field.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesStatus =
      filterStatus === "All" || appointment.status === filterStatus;
    const matchesDate =
      !filterDate || appointment.date.split("T")[0] === filterDate;

    return matchesSearch && matchesStatus && matchesDate;
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

  // Appointment Card Component
  const AppointmentCard = ({ appointment }) => {
    const statusConfig = getStatusConfig(appointment.status);

    return (
      <Card
        key={appointment._id}
        className="p-4 hover:shadow-lg transition-shadow"
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">
              {getPatientName(appointment.patientId)}
            </h3>
            <p className="text-sm text-gray-600">Patient</p>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}
          >
            {statusConfig.icon}
            <span className="ml-1">{appointment.status}</span>
          </span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
            <span>{getDoctorName(appointment.doctorId)}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
            <span>{formatDate(appointment.date)}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-gray-400 mr-2" />
            <span>{formatTime(appointment.timeSlot)}</span>
          </div>
          <div className="flex items-center">
            <Building2 className="h-4 w-4 text-gray-400 mr-2" />
            <span>Room {getRoomNumber(appointment.roomId)}</span>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          {appointment.status === "Scheduled" && (
            <>
              <Button
                size="sm"
                onClick={() =>
                  openModal({ ...appointment, status: "Completed" })
                }
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                Complete
              </Button>
              <Button
                size="sm"
                onClick={() => handleCancel(appointment._id)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Cancel
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => openModal(appointment)}
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Appointments Management
        </h1>
        <p className="mt-2 text-sm text-gray-600">
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

      {/* Quick Stats - Moved to top */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {["Scheduled", "Completed", "Cancelled", "Total"].map((stat) => (
          <Card key={stat}>
            <CardContent className="p-4 text-center">
              <div
                className={`text-2xl font-semibold ${
                  stat === "Scheduled"
                    ? "text-blue-600"
                    : stat === "Completed"
                    ? "text-green-600"
                    : stat === "Cancelled"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {stat === "Total"
                  ? appointments.length
                  : appointments.filter((a) => a.status === stat).length}
              </div>
              <div className="text-sm text-gray-600 mt-1">{stat}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
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

              <Button
                variant="outline"
                className="flex items-center space-x-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <span>Filters</span>
                <ChevronDown
                  className={`h-4 w-4 transform transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </div>

            <Button
              onClick={() => openModal()}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Appointment</span>
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 bg-gray-50 border rounded-md p-4 grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All">All Status</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading appointments...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-500">No appointments found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment._id}
                  appointment={appointment}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-xl w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingAppointment ? "Edit Appointment" : "New Appointment"}
              </h3>
              <X
                className="h-5 w-5 cursor-pointer"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              />
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              {!editingAppointment && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Doctor
                    </label>
                    <select
                      value={formData.doctorId}
                      onChange={(e) =>
                        setFormData({ ...formData, doctorId: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Patient
                    </label>
                    <select
                      value={formData.patientId}
                      onChange={(e) =>
                        setFormData({ ...formData, patientId: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Room
                    </label>
                    <select
                      value={formData.roomId}
                      onChange={(e) =>
                        setFormData({ ...formData, roomId: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Slot
                </label>
                <input
                  type="text"
                  value={formData.timeSlot}
                  onChange={(e) =>
                    setFormData({ ...formData, timeSlot: e.target.value })
                  }
                  placeholder="e.g., 10:00 AM - 11:00 AM"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAppointment ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllAppointments;
