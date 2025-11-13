import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "../adminCommon/Card";
import { Button } from "../adminCommon/Button";
import {
  Search,
  Plus,
  Building2,
  User,
  Trash2,
  X,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  MapPin,
} from "lucide-react";
import { adminAPI } from "../../api/adminAPI";

const AllRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState("");

  const [toast, setToast] = useState({ message: "", type: "" });

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAllRooms();
      console.log("rooms res", res);

      if (res.data.status) setRooms(res.data.rooms);
    } catch (err) {
      showToast("Failed to fetch rooms", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await adminAPI.getAllDoctors();
      console.log("doctor res", res);

      if (res.data.status) setDoctors(res.data.doctors);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchDoctors();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  // Get assigned doctor details for a room
  const getAssignedDoctor = (room) => {
    if (!room.assignedDoctorId) return null;

    // Find doctor from doctors array by ID
    const doctor = doctors.find((doc) => doc._id === room.assignedDoctorId);
    return doctor;
  };

  // Get available doctors (doctors not assigned to any room)
  const getAvailableDoctors = () => {
    const assignedDoctorIds = rooms
      .map((room) => room.assignedDoctorId)
      .filter((id) => id); // Remove null/undefined values

    return doctors.filter((doctor) => !assignedDoctorIds.includes(doctor._id));
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.roomNum
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Status configuration
  const getStatusConfig = (available) => {
    if (available) {
      return {
        color: "bg-green-100 text-green-800 border border-green-200",
        icon: <CheckCircle className="h-4 w-4" />,
        text: "Available",
      };
    } else {
      return {
        color: "bg-red-100 text-red-800 border border-red-200",
        icon: <XCircle className="h-4 w-4" />,
        text: "Occupied",
      };
    }
  };

  const getRoomTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "consultation":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "surgery":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "icu":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom._id) {
        const res = await adminAPI.updateRoom(editingRoom._id, editingRoom);
        if (res.data.status) showToast("Room updated successfully");
      } else {
        const res = await adminAPI.createRoom({
          roomNum: editingRoom.roomNum,
          type: editingRoom.type,
        });
        if (res.data.status) showToast("Room created successfully");
      }
      fetchRooms();
    } catch (err) {
      showToast(err.message || "Something went wrong", "error");
    } finally {
      setShowRoomModal(false);
      setEditingRoom(null);
    }
  };

  const handleDeleteRoom = async (id) => {
    try {
      const res = await adminAPI.deleteRoom(id);
      if (res.data.status) {
        showToast("Room deleted successfully");
        fetchRooms();
      }
    } catch (err) {
      showToast("Failed to delete room", "error");
    }
  };

  const handleAssignDoctor = async () => {
    if (!selectedDoctor) return showToast("Select a doctor", "error");
    try {
      const res = await adminAPI.assignRoom({
        roomId: selectedRoom._id,
        doctorId: selectedDoctor,
      });
      if (res.data.status) {
        showToast("Doctor assigned successfully");
        fetchRooms();
      }
    } catch (err) {
      showToast(err.message || "Failed to assign doctor", "error");
    } finally {
      setShowAssignModal(false);
      setSelectedDoctor("");
      setSelectedRoom(null);
    }
  };

  const handleReleaseRoom = async (room) => {
    try {
      const res = await adminAPI.releaseRoom(room._id);
      if (res.data.status) {
        showToast("Room released successfully");
        fetchRooms();
      }
    } catch (err) {
      showToast(err.message || "Failed to release room", "error");
    }
  };

  // Stats calculation
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((room) => !room.assignedDoctorId).length;
  const occupiedRooms = rooms.filter((room) => room.assignedDoctorId).length;
  const consultationRooms = rooms.filter(
    (room) => room.type === "Consultation"
  ).length;
  const availableDoctors = getAvailableDoctors().length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Rooms Management</h1>
          <p className="text-gray-600 mt-1">
            Manage all hospital rooms and doctor assignments
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
                    Total Rooms
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {totalRooms}
                  </p>
                  <div className="flex items-center text-blue-600 text-sm font-medium">
                    <span>All Rooms</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-blue-500 transition-all duration-300 group-hover:scale-110">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Available
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {availableRooms}
                  </p>
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    <span>Ready to use</span>
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
                    Occupied
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {occupiedRooms}
                  </p>
                  <div className="flex items-center text-red-600 text-sm font-medium">
                    <span>In use</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-red-500 transition-all duration-300 group-hover:scale-110">
                  <XCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Available Doctors
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {availableDoctors}
                  </p>
                  <div className="flex items-center text-purple-600 text-sm font-medium">
                    <span>Ready to assign</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-purple-500 transition-all duration-300 group-hover:scale-110">
                  <Users className="h-6 w-6 text-white" />
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
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  All Rooms ({filteredRooms.length})
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by room number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                {/* Add Room Button */}
                <Button
                  onClick={() => {
                    setEditingRoom({ roomNum: "", type: "" });
                    setShowRoomModal(true);
                  }}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Room</span>
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading rooms...
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="font-medium">No rooms found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {filteredRooms.map((room) => {
                  const assignedDoctor = getAssignedDoctor(room);
                  const isRoomAvailable = !room.assignedDoctorId;
                  const statusConfig = getStatusConfig(isRoomAvailable);

                  return (
                    <div
                      key={room._id}
                      className="group rounded-xl border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6"
                    >
                      {/* Room Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            Room {room.roomNum}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getRoomTypeColor(
                              room.type
                            )}`}
                          >
                            {room.type}
                          </span>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}
                          >
                            {statusConfig.icon}
                            <span className="ml-1">{statusConfig.text}</span>
                          </span>
                        </div>
                      </div>

                      {/* Enhanced Room Details */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center p-2 rounded-lg border border-gray-100">
                          <User className="h-4 w-4 mr-3 text-blue-600 flex-shrink-0" />
                          <div>
                            <div className="text-xs text-gray-500 font-medium">
                              Assigned Doctor
                            </div>
                            <div className="text-sm font-semibold text-gray-900">
                              {assignedDoctor?.userId?.fullName ||
                                "No Doctor Assigned"}
                            </div>
                          </div>
                        </div>

                        {/* Doctor Details - Only show if doctor is assigned */}
                        {assignedDoctor && (
                          <div className="bg-blue-50 rounded-lg p-3 space-y-2 border border-blue-200">
                            <div className="flex items-center">
                              <User className="h-3 w-3 mr-2 text-blue-600 flex-shrink-0" />
                              <div>
                                <div className="text-xs text-blue-900 font-medium">
                                  Specialization
                                </div>
                                <div className="text-sm font-semibold text-blue-700">
                                  {assignedDoctor.specialization}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start space-x-2">
                              <Calendar className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="text-xs text-blue-900 font-medium">
                                  Available Days
                                </div>
                                <div className="text-sm font-semibold text-blue-700">
                                  {assignedDoctor.availableDays?.join(", ") ||
                                    "Not specified"}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start space-x-2">
                              <Clock className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="text-xs text-blue-900 font-medium">
                                  Shift Timing
                                </div>
                                <div className="text-sm font-semibold text-blue-700">
                                  {assignedDoctor.shiftTimings ||
                                    "Not specified"}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Enhanced Action Buttons */}
                      <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRoom(room);
                            setShowAssignModal(true);
                          }}
                          disabled={!isRoomAvailable}
                          className="font-medium"
                        >
                          <Users className="h-3 w-3 mr-1" />
                          Assign
                        </Button>
                        {assignedDoctor && (
                          <Button
                            size="sm"
                            onClick={() => handleReleaseRoom(room)}
                            className="bg-red-600 hover:bg-red-700 text-white font-medium"
                          >
                            <MapPin className="h-3 w-3 mr-1" />
                            Release
                          </Button>
                        )}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteRoom(room._id)}
                          className="font-medium"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
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

      {/* Enhanced Room Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingRoom?._id ? "Edit Room" : "New Room"}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {editingRoom?._id
                      ? "Update room details"
                      : "Create a new room"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowRoomModal(false);
                  setEditingRoom(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto flex-1 p-6">
              <form onSubmit={handleRoomSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Number
                  </label>
                  <input
                    type="text"
                    value={editingRoom?.roomNum || ""}
                    onChange={(e) =>
                      setEditingRoom({
                        ...editingRoom,
                        roomNum: e.target.value,
                      })
                    }
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter room number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Type
                  </label>
                  <select
                    value={editingRoom?.type || ""}
                    onChange={(e) =>
                      setEditingRoom({ ...editingRoom, type: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Surgery">Surgery</option>
                    <option value="ICU">ICU</option>
                  </select>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRoomModal(false);
                  setEditingRoom(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleRoomSubmit}>
                {editingRoom?._id ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Assign Doctor Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Assign Doctor to Room {selectedRoom?.roomNum}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Assign a doctor to this room
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
              >
                <option value="">Select Doctor</option>
                {getAvailableDoctors().map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.userId?.fullName} ({doc.specialization})
                  </option>
                ))}
              </select>

              {/* Show selected doctor details */}
              {selectedDoctor && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                  <div className="text-sm text-blue-900 space-y-2">
                    <div className="font-semibold text-blue-800 mb-2">
                      Doctor Details:
                    </div>
                    {(() => {
                      const selectedDoc = doctors.find(
                        (doc) => doc._id === selectedDoctor
                      );
                      return (
                        <>
                          <div className="flex items-center space-x-2">
                            <User className="h-3 w-3 text-blue-600" />
                            <span>
                              <strong>Name:</strong>{" "}
                              {selectedDoc.userId?.fullName}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="h-3 w-3 text-blue-600" />
                            <span>
                              <strong>Specialization:</strong>{" "}
                              {selectedDoc.specialization}
                            </span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Calendar className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span>
                              <strong>Available Days:</strong>{" "}
                              {selectedDoc.availableDays?.join(", ") ||
                                "Not specified"}
                            </span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Clock className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span>
                              <strong>Shift Timing:</strong>{" "}
                              {selectedDoc.shiftTimings || "Not specified"}
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAssignModal(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAssignDoctor}>Assign</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllRooms;
