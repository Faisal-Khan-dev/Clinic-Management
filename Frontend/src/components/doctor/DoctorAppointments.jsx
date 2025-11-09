// src/components/doctor/DoctorAppointments.jsx
import { useEffect, useState, Fragment } from "react";
import { doctorAPI } from "../../api/doctorAPI";
import { useAuth } from "../../context/AuthContext";
import { Card, CardHeader, CardContent } from "../adminCommon/Card";
import { Button } from "../adminCommon/Button";
import Loader from "../common/Loader";
import {
  Search,
  Calendar,
  Clock,
  User,
  MapPin,
  XCircle,
  CheckCircle,
  Eye,
  Edit,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * DoctorAppointments - shows doctor's appointments with search & filters.
 * Uses existing getDoctorAppointments API
 */

const statusOptions = [
  { value: "all", label: "All" },
  { value: "Scheduled", label: "Scheduled" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
];

const AppointmentRow = ({ apt, onView, onStatusUpdate, onCaseHistory }) => {
  const patientName =
    apt.patientId?.userId?.fullName ||
    apt.patientId?.fullName ||
    apt.patientId?.name ||
    "Unknown";

  const patientContact =
    apt.patientId?.userId?.email ||
    apt.patientId?.email ||
    apt.patientId?.phone ||
    "";

  const roomNumber =
    apt.roomId?.roomNum ||
    apt.roomId?.roomNumber ||
    apt.roomId?.roomNumString ||
    "N/A";

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
        #{(apt._id || "").toString().slice(-6)}
      </td>

      <td className="px-4 py-3 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">{patientName}</div>
          <div className="text-sm text-gray-500">{patientContact}</div>
        </div>
      </td>

      <td className="px-4 py-3 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">
            {apt.doctorName || "You"}
          </div>
          <div className="text-sm text-gray-500">
            {apt.specialization || ""}
          </div>
        </div>
      </td>

      <td className="px-4 py-3 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">
            {new Date(apt.date).toLocaleDateString()}
          </div>
          <div className="text-sm text-gray-500">{apt.timeSlot}</div>
        </div>
      </td>

      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
        {roomNumber}
      </td>

      <td className="px-4 py-3 whitespace-nowrap">
        <StatusBadge status={apt.status} />
      </td>

      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => onView(apt)}>
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>

          {/* Edit Button - Only show for scheduled appointments */}
          {apt.status === "Scheduled" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusUpdate(apt)}
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          )}

          {/* Case History Button - Only show for completed appointments */}
          {apt.status === "Completed" && (
            <Button size="sm" onClick={() => onCaseHistory(apt)}>
              <ArrowRight className="h-3 w-3 mr-1" />
              Case History
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
};

const StatusBadge = ({ status }) => {
  const s = status || "Scheduled";
  let style = "bg-gray-100 text-gray-800 border-gray-200";
  if (s === "Scheduled") style = "bg-blue-100 text-blue-800 border-blue-200";
  if (s === "Completed") style = "bg-green-100 text-green-800 border-green-200";
  if (s === "Cancelled") style = "bg-red-100 text-red-800 border-red-200";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}
    >
      {s}
    </span>
  );
};

const DoctorAppointments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const doctorId = user?.id || user?._id;
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // UI filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // modals
  const [selectedApt, setSelectedApt] = useState(null);
  const [statusUpdateApt, setStatusUpdateApt] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!doctorId) return;
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  const fetchAppointments = async () => {
    try {
      console.log("Fetching appointments for doctor:", doctorId);
      setLoading(true);
      setError("");
      const res = await doctorAPI.getDoctorAppointments(doctorId);

      if (res?.data?.status) {
        const list = res.data.appointments || [];
        const normalized = list.map((a) => ({
          ...a,
          timeSlot: a.timeSlot || a.appointmentTime || "",
        }));
        setAppointments(normalized);
      } else {
        setError(res?.data?.message || "No appointments found");
        setAppointments([]);
      }
    } catch (err) {
      console.error("fetchAppointments error", err);
      setError(err.response?.data?.message || "Failed to fetch appointments");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

 const handleStatusUpdate = async () => {
   if (!statusUpdateApt) return;

   try {
     setUpdatingStatus(true);

     // Call API to update appointment status
     const response = await doctorAPI.updateAppointmentStatus(
       statusUpdateApt._id,
       {
         status: "Completed",
       }
     );

     if (response.data.status) {
       setSuccess("Appointment marked as completed successfully!");

       // Update local state
       setAppointments((prev) =>
         prev.map((apt) =>
           apt._id === statusUpdateApt._id
             ? { ...apt, status: "Completed" }
             : apt
         )
       );

       setStatusUpdateApt(null);

       // Hide success message after 3 seconds
       setTimeout(() => setSuccess(""), 3000);
     } else {
       setError(response.data.message || "Failed to update status");
     }
   } catch (err) {
     console.error("Status update error", err);
     setError(
       err.response?.data?.message || "Failed to update appointment status"
     );
   } finally {
     setUpdatingStatus(false);
   }
 };

  const handleCaseHistory = (appointment) => {
    // Navigate to case history page with appointment data
    navigate("/doctor/case-history", {
      state: {
        appointment: appointment,
        patientId: appointment.patientId?._id || appointment.patientId,
        patientName:
          appointment.patientId?.userId?.fullName ||
          appointment.patientId?.fullName ||
          "Unknown Patient",
      },
    });
  };

  // client side filtering
  const filtered = appointments.filter((apt) => {
    const patientName =
      apt.patientId?.userId?.fullName ||
      apt.patientId?.fullName ||
      apt.patientId?.name ||
      "";
    const patientEmail =
      apt.patientId?.userId?.email || apt.patientId?.email || "";

    const matchesSearch =
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (apt._id || "")
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (apt.status || "").toLowerCase() === statusFilter.toLowerCase();

    let matchesDate = true;
    if (fromDate) {
      matchesDate = new Date(apt.date) >= new Date(fromDate);
    }
    if (matchesDate && toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      matchesDate = new Date(apt.date) <= end;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-sm text-gray-600">Manage your scheduled visits</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
            <p className="text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-400 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by patient name or email..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="From"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="To"
              />
            </div>

            <div className="flex items-center space-x-2 w-full lg:w-auto">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setFromDate("");
                  setToDate("");
                }}
              >
                Reset
              </Button>
              <Button onClick={() => fetchAppointments()}>Refresh</Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4 text-gray-400">No appointments found</div>
              <div className="text-sm text-gray-500">Try changing filters</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
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
                      Room
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map((apt) => (
                    <AppointmentRow
                      key={apt._id}
                      apt={apt}
                      onView={(a) => setSelectedApt(a)}
                      onStatusUpdate={(a) => setStatusUpdateApt(a)}
                      onCaseHistory={(a) => handleCaseHistory(a)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      {selectedApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xl">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold">Appointment Details</h3>
              <button
                onClick={() => setSelectedApt(null)}
                className="p-1 rounded-md hover:bg-gray-100"
              >
                <XCircle className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <strong>Patient:</strong>{" "}
                {selectedApt.patientId?.userId?.fullName ||
                  selectedApt.patientId?.fullName}
              </div>
              <div>
                <strong>Email:</strong>{" "}
                {selectedApt.patientId?.userId?.email ||
                  selectedApt.patientId?.email}
              </div>
              <div>
                <strong>Date:</strong>{" "}
                {new Date(selectedApt.date).toLocaleDateString()}
              </div>
              <div>
                <strong>Time:</strong> {selectedApt.timeSlot}
              </div>
              <div>
                <strong>Room:</strong>{" "}
                {selectedApt.roomId?.roomNum ||
                  selectedApt.roomId?.roomNumber ||
                  "N/A"}
              </div>
              <div>
                <strong>Status:</strong>{" "}
                <StatusBadge status={selectedApt.status} />
              </div>
              <div>
                <strong>Notes:</strong>{" "}
                {selectedApt.notes || selectedApt.reason || "—"}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSelectedApt(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusUpdateApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold">Complete Appointment</h3>
              <button
                onClick={() => setStatusUpdateApt(null)}
                className="p-1 rounded-md hover:bg-gray-100"
                disabled={updatingStatus}
              >
                <XCircle className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p>
                  <strong>Patient:</strong>{" "}
                  {statusUpdateApt.patientId?.userId?.fullName}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(statusUpdateApt.date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Time:</strong> {statusUpdateApt.timeSlot}
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  Are you sure you want to mark this appointment as completed?
                  This will enable the Case History feature for this patient.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStatusUpdateApt(null)}
                  disabled={updatingStatus}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStatusUpdate}
                  disabled={updatingStatus}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {updatingStatus ? "Updating..." : "Mark as Completed"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
