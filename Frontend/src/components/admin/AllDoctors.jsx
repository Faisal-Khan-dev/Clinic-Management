import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "../adminCommon/Card";
import { Button } from "../adminCommon/Button";
import { Search, Filter, Plus, Mail, Phone, Trash2 } from "lucide-react";
import { adminAPI } from "../../api/adminAPI";

const AllDoctors = () => {
  const [doctors, setDoctors] = useState([]);
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
        roomId: newDoctor.roomId.trim() || undefined, // ✅ Empty string ko undefined karo
      };
      console.log("data", formattedData);
      
// return
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

  const getApprovalIcon = (approved) => (approved ? "✅" : "⏳");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Doctors Management
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage all doctor profiles and schedules
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
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
              <Button
                variant="outline"
                className="flex items-center space-x-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Doctor</span>
            </Button>
          </div>

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
            <div className="text-center py-12 text-gray-400">
              No doctors found
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => {
                const u = doctor.userId || {};
                return (
                  <Card key={doctor._id} className="hover:shadow-lg transition">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {u.fullName || "N/A"}
                          </h3>
                          <p className="text-sm text-blue-600 font-medium">
                            {doctor.specialization || "N/A"}
                          </p>
                        </div>
                        <span className="text-xl">
                          {getApprovalIcon(u.isApproved)}
                        </span>
                      </div>
                      <div className="space-y-2 mb-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" /> {u.email || "N/A"}
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" /> {u.phone || "N/A"}
                        </div>
                        <div>
                          <strong>Qualification:</strong>{" "}
                          {doctor.qualification || "N/A"}
                        </div>
                        <div>
                          <strong>CNIC:</strong> {u.cnic || "N/A"}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getAvailabilityColor(
                            doctor.status
                          )}`}
                        >
                          {doctor.status}
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
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ✅ Fixed Create Doctor Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Create New Doctor</h2>
            </div>
            <div className="overflow-y-auto flex-1">
              <form onSubmit={handleCreateDoctor} className="p-6 space-y-4">
                {[
                  { key: "fullName", label: "Full Name", required: true },
                  { key: "age", label: "Age", type: "number", required: true },
                  {
                    key: "email",
                    label: "Email",
                    type: "email",
                    required: true,
                  },
                  { key: "phone", label: "Phone", required: true },
                  { key: "cnic", label: "CNIC", required: true },
                  {
                    key: "qualification",
                    label: "Qualification",
                    required: true,
                  },
                  {
                    key: "specialization",
                    label: "Specialization",
                    required: true,
                  },
                  {
                    key: "availableDays",
                    label: "Available Days",
                    placeholder: "Monday, Tuesday, Wednesday...",
                    required: false,
                  },
                  {
                    key: "shiftTimings",
                    label: "Shift Timings",
                    placeholder: "9:00 AM - 5:00 PM",
                    required: false,
                  },
                  {
                    key: "roomId",
                    label: "Room ID",
                    required: false,
                  },
                ].map(
                  ({
                    key,
                    label,
                    type = "text",
                    placeholder = "",
                    required = true,
                  }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                        {label}{" "}
                        {required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type={type}
                        value={newDoctor[key]}
                        onChange={(e) =>
                          setNewDoctor({ ...newDoctor, [key]: e.target.value })
                        }
                        required={required}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder={placeholder}
                      />
                    </div>
                  )
                )}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    disabled={creating}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={creating}
                    className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {creating ? "Creating..." : "Create Doctor"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllDoctors;
