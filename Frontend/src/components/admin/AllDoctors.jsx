import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "../adminCommon/Card";
import { Button } from "../adminCommon/Button";
import {
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  Trash2,
  UserCheck,
  Calendar,
  Clock,
  Building2,
  X,
  UserX,
} from "lucide-react";
import { adminAPI } from "../../api/adminAPI";

const AllDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [deletedDoctors, setDeletedDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterApproval, setFilterApproval] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [newDoctor, setNewDoctor] = useState({
    fullName: "",
    age: "",
    email: "",
    phone: "",
    cnic: "",
    qualification: "",
    specialization: "",
    availableDays: "",
    shiftTimings: "",
    roomId: "",
  });

  // ✅ Fetch doctors
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAllDoctors();
      console.log("res", res);

      if (res?.data?.status) {
        setDoctors(res.data.doctors || []);
        // Simulate deleted doctors count (you can replace this with actual API call)
        setDeletedDoctors(5); // Example: 5 deleted doctors
      } else {
        setError("Failed to fetch doctors");
      }
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setError("Something went wrong while fetching doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // ✅ Delete doctor - FIXED
  const handleDelete = async (doctorId) => {
    if (!window.confirm("Are you sure you want to remove this doctor?")) return;
    try {
      const res = await adminAPI.removeDoctor(doctorId);
      if (res?.data?.status) {
        setDoctors((prev) => prev.filter((doc) => doc._id !== doctorId));
        setDeletedDoctors((prev) => prev + 1); // Increment deleted count
        alert("Doctor deleted successfully!");
      } else {
        alert(res?.data?.message || "Failed to delete doctor!");
      }
    } catch (error) {
      console.error("Error deleting doctor:", error);
      alert("Something went wrong while deleting doctor.");
    }
  };

  // ✅ Create Doctor - FIXED
  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      // Format availableDays properly
      const formattedData = {
        ...newDoctor,
        age: parseInt(newDoctor.age) || 0,
        availableDays: newDoctor.availableDays
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean),
        roomId: newDoctor.roomId.trim() || undefined,
      };
      console.log("data", formattedData);

      const res = await adminAPI.createDoctor(formattedData);
      console.log("Create doctor response:", res);

      if (res?.data?.status) {
        alert("Doctor created successfully!");
        setShowCreateModal(false);
        setNewDoctor({
          fullName: "",
          age: "",
          email: "",
          phone: "",
          cnic: "",
          qualification: "",
          specialization: "",
          availableDays: "",
          shiftTimings: "",
          roomId: "",
        });
        fetchDoctors(); // Refresh the list
      } else {
        alert(res?.data?.message || "Failed to create doctor!");
      }
    } catch (error) {
      console.error("Error creating doctor:", error);
      alert(
        error.response?.data?.message ||
          "Something went wrong while creating doctor."
      );
    } finally {
      setCreating(false);
    }
  };

  // ✅ Apply filters
  const applyFilters = (list) => {
    return list.filter((doc) => {
      const u = doc.userId || {};
      const matchesSearch =
        (u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.specialization
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())) ??
        false;

      const matchesStatus =
        filterStatus === "All"
          ? true
          : filterStatus === "Active"
          ? doc.status === "Active"
          : doc.status !== "Active";

      const matchesApproval =
        filterApproval === "All"
          ? true
          : filterApproval === "Approved"
          ? u.isApproved === true
          : u.isApproved === false;

      return matchesSearch && matchesStatus && matchesApproval;
    });
  };

  const filteredDoctors = applyFilters(doctors);

  const getAvailabilityColor = (status) => {
    if (status === "Active") return "bg-green-100 text-green-800";
    if (status === "Inactive") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  const getApprovalColor = (approved) => {
    return approved
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Doctors Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage all doctor profiles and schedules
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Total Doctors
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {doctors.length}
                  </p>
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    <span>Registered</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-blue-500 transition-all duration-300 group-hover:scale-110">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Approved
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {doctors.filter((doc) => doc.userId?.isApproved).length}
                  </p>
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    <span>Active</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-green-500 transition-all duration-300 group-hover:scale-110">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Deleted Doctors
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {deletedDoctors}
                  </p>
                  <div className="flex items-center text-red-600 text-sm font-medium">
                    <span>Removed</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-red-500 transition-all duration-300 group-hover:scale-110">
                  <UserX className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Active
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {doctors.filter((doc) => doc.status === "Active").length}
                  </p>
                  <div className="flex items-center text-blue-600 text-sm font-medium">
                    <span>Working</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-purple-500 transition-all duration-300 group-hover:scale-110">
                  <UserCheck className="h-6 w-6 text-white" />
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
                  <UserCheck className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  All Doctors ({filteredDoctors.length})
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search doctors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                {/* Filter Button */}
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </Button>

                {/* Add Doctor Button */}
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Doctor</span>
                </Button>
              </div>
            </div>

            {/* ✅ Filters Panel */}
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
                    <option value="All">All</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Approval Status
                  </label>
                  <select
                    value={filterApproval}
                    onChange={(e) => setFilterApproval(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="All">All</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading doctors...
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : filteredDoctors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <UserCheck className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="font-medium">No doctors found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {filteredDoctors.map((doctor) => {
                  const u = doctor.userId || {};
                  return (
                    <div
                      key={doctor._id}
                      className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-200 p-6"
                    >
                      {/* Doctor Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {u.fullName || "N/A"}
                          </h3>
                          <p className="text-sm text-blue-600 font-medium">
                            {doctor.specialization || "N/A"}
                          </p>
                        </div>
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getApprovalColor(
                            u.isApproved
                          )}`}
                        >
                          {u.isApproved ? "Approved" : "Pending"}
                        </span>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-2 mb-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="truncate">{u.email || "N/A"}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{u.phone || "N/A"}</span>
                        </div>
                      </div>

                      {/* Doctor Details */}
                      <div className="space-y-2 mb-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">
                            Qualification:
                          </span>
                          <span className="text-gray-600 ml-1">
                            {doctor.qualification || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            CNIC:
                          </span>
                          <span className="text-gray-600 ml-1">
                            {u.cnic || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Age:
                          </span>
                          <span className="text-gray-600 ml-1">
                            {u.age || "N/A"}
                          </span>
                        </div>
                      </div>

                      {/* Schedule Info */}
                      {(doctor.availableDays || doctor.shiftTimings) && (
                        <div className="bg-blue-50 rounded-lg p-3 space-y-2 mb-4">
                          {doctor.availableDays && (
                            <div className="flex items-start space-x-2">
                              <Calendar className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div className="text-xs">
                                <span className="font-medium text-blue-900">
                                  Available Days:{" "}
                                </span>
                                <span className="text-blue-700">
                                  {Array.isArray(doctor.availableDays)
                                    ? doctor.availableDays.join(", ")
                                    : doctor.availableDays}
                                </span>
                              </div>
                            </div>
                          )}
                          {doctor.shiftTimings && (
                            <div className="flex items-start space-x-2">
                              <Clock className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div className="text-xs">
                                <span className="font-medium text-blue-900">
                                  Shift:{" "}
                                </span>
                                <span className="text-blue-700">
                                  {doctor.shiftTimings}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getAvailabilityColor(
                            doctor.status
                          )}`}
                        >
                          {doctor.status || "N/A"}
                        </span>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(doctor._id)}
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

      {/* ✅ Enhanced Create Doctor Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Create New Doctor
                  </h2>
                  <p className="text-sm text-gray-600">
                    Add a new doctor to the system
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={creating}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto flex-1 p-6">
              <form
                onSubmit={handleCreateDoctor}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {[
                  {
                    key: "fullName",
                    label: "Full Name",
                    required: true,
                    colSpan: "md:col-span-2",
                  },
                  {
                    key: "email",
                    label: "Email",
                    type: "email",
                    required: true,
                  },
                  { key: "phone", label: "Phone", required: true },
                  { key: "age", label: "Age", type: "number", required: true },
                  { key: "cnic", label: "CNIC", required: true },
                  {
                    key: "qualification",
                    label: "Qualification",
                    required: true,
                    colSpan: "md:col-span-2",
                  },
                  {
                    key: "specialization",
                    label: "Specialization",
                    required: true,
                    colSpan: "md:col-span-2",
                  },
                  {
                    key: "availableDays",
                    label: "Available Days",
                    placeholder: "Monday, Tuesday, Wednesday...",
                    colSpan: "md:col-span-2",
                  },
                  {
                    key: "shiftTimings",
                    label: "Shift Timings",
                    placeholder: "9:00 AM - 5:00 PM",
                  },
                  { key: "roomId", label: "Room ID", placeholder: "Optional" },
                ].map(
                  ({
                    key,
                    label,
                    type = "text",
                    placeholder = "",
                    required = true,
                    colSpan = "",
                  }) => (
                    <div key={key} className={colSpan}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {label}
                        {required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      <input
                        type={type}
                        value={newDoctor[key]}
                        onChange={(e) =>
                          setNewDoctor({ ...newDoctor, [key]: e.target.value })
                        }
                        required={required}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder={placeholder}
                      />
                    </div>
                  )
                )}
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateDoctor}
                disabled={creating}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {creating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Doctor"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllDoctors;
