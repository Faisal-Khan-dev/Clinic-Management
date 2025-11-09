import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "../adminCommon/Card";
import { Button } from "../adminCommon/Button";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Building2,
  User,
  Trash2,
  ChevronDown,
  X,
  Calendar,
  Clock,
} from "lucide-react";
import { adminAPI } from "../../api/adminAPI";

const AllRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterAvailability, setFilterAvailability] = useState("All");
  const [filterType, setFilterType] = useState("All");

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

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.roomNum
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Check availability based on assignedDoctorId
    const isRoomAvailable = !room.assignedDoctorId;

    const matchesAvailability =
      filterAvailability === "All"
        ? true
        : filterAvailability === "Available"
        ? isRoomAvailable
        : !isRoomAvailable;

    const matchesType =
      filterType === "All"
        ? true
        : room.type?.toLowerCase() === filterType.toLowerCase();

    return matchesSearch && matchesAvailability && matchesType;
  });

  const getAvailabilityColor = (available) =>
    available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";

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

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Rooms Management
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage all hospital rooms and doctor assignments
        </p>
      </div>

      {/* Toast */}
      {toast.message && (
        <div
          className={`fixed top-5 right-5 px-4 py-2 rounded shadow ${
            toast.type === "error"
              ? "bg-red-500 text-white"
              : "bg-green-500 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
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

              {/* Filter toggle */}
              <Button
                variant="outline"
                className="flex items-center space-x-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                <span>Filter</span>
                <ChevronDown
                  className={`h-4 w-4 transform transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </div>

            {/* Add Room */}
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

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 bg-gray-50 border rounded-md p-4 grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Availability
                </label>
                <select
                  value={filterAvailability}
                  onChange={(e) => setFilterAvailability(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All">All</option>
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All">All</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Surgery">Surgery</option>
                  <option value="ICU">ICU</option>
                </select>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading rooms...
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No rooms found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
              {filteredRooms.map((room) => {
                const assignedDoctor = getAssignedDoctor(room);
                const isRoomAvailable = !room.assignedDoctorId;

                return (
                  <Card
                    key={room._id}
                    className="hover:shadow-lg transition-shadow duration-200 rounded-xl p-4 flex flex-col justify-between"
                  >
                    {/* Card header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-5 w-5 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          Room {room.roomNum}
                        </h3>
                      </div>
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getAvailabilityColor(
                          isRoomAvailable
                        )}`}
                      >
                        {isRoomAvailable ? "Available" : "Occupied"}
                      </span>
                    </div>

                    {/* Room details */}
                    <div className="flex flex-col space-y-3 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <span>
                          {assignedDoctor?.userId?.fullName ||
                            "No Doctor Assigned"}
                        </span>
                      </div>

                      {/* Doctor Details - Only show if doctor is assigned */}
                      {assignedDoctor && (
                        <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                          <div>
                            <span className="font-medium text-blue-900">
                              Specialization:{" "}
                            </span>
                            <span className="text-blue-700">
                              {assignedDoctor.specialization}
                            </span>
                          </div>

                          <div className="flex items-start space-x-2">
                            <Calendar className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-blue-900">
                                Available Days:{" "}
                              </span>
                              <span className="text-blue-700">
                                {assignedDoctor.availableDays?.join(", ") ||
                                  "Not specified"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-start space-x-2">
                            <Clock className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-blue-900">
                                Shift Timing:{" "}
                              </span>
                              <span className="text-blue-700">
                                {assignedDoctor.shiftTimings || "Not specified"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end items-center mt-auto space-x-3">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRoom(room);
                            setShowAssignModal(true);
                          }}
                          disabled={!isRoomAvailable}
                        >
                          Assign
                        </Button>
                        {assignedDoctor && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleReleaseRoom(room)}
                          >
                            Release
                          </Button>
                        )}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteRoom(room._id)}
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Room Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-xl w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingRoom._id ? "Edit Room" : "Add Room"}
              </h3>
              <X
                className="h-5 w-5 cursor-pointer"
                onClick={() => setShowRoomModal(false)}
              />
            </div>
            <form onSubmit={handleRoomSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Number
                </label>
                <input
                  type="text"
                  value={editingRoom.roomNum}
                  onChange={(e) =>
                    setEditingRoom({ ...editingRoom, roomNum: e.target.value })
                  }
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type
                </label>
                <select
                  value={editingRoom.type || ""}
                  onChange={(e) =>
                    setEditingRoom({ ...editingRoom, type: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Surgery">Surgery</option>
                  <option value="ICU">ICU</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowRoomModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Doctor Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-xl w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Assign Doctor to Room {selectedRoom.roomNum}
              </h3>
              <X
                className="h-5 w-5 cursor-pointer"
                onClick={() => setShowAssignModal(false)}
              />
            </div>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 text-sm focus:ring-blue-500 focus:border-blue-500"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
            >
              <option value="">Select Doctor</option>
              {doctors.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.userId.fullName} ({doc.specialization})
                </option>
              ))}
            </select>

            {/* Show selected doctor details */}
            {selectedDoctor && (
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <div className="text-sm text-blue-900">
                  <div className="font-medium mb-2">Doctor Details:</div>
                  {(() => {
                    const selectedDoc = doctors.find(
                      (doc) => doc._id === selectedDoctor
                    );
                    return (
                      <>
                        <div>
                          <strong>Name:</strong> {selectedDoc.userId.fullName}
                        </div>
                        <div>
                          <strong>Specialization:</strong>{" "}
                          {selectedDoc.specialization}
                        </div>
                        <div>
                          <strong>Available Days:</strong>{" "}
                          {selectedDoc.availableDays?.join(", ") ||
                            "Not specified"}
                        </div>
                        <div>
                          <strong>Shift Timing:</strong>{" "}
                          {selectedDoc.shiftTimings || "Not specified"}
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
      )}
    </div>
  );
};

export default AllRooms;
