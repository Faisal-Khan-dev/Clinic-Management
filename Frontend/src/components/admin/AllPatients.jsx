import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "../adminCommon/Card";
import { Button } from "../adminCommon/Button";
import {
  Search,
  Filter,
  Trash2,
  ChevronDown,
  Users,
  ArrowRight,
} from "lucide-react";
import { adminAPI } from "../../api/adminAPI";

const AllPatients = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterAge, setFilterAge] = useState("All");
  const patientsPerPage = 5;

  // ✅ Fetch patients
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAllPatients();
      if (res?.data?.status) {
        setPatients(res.data.patients || []);
      } else {
        setError("Failed to fetch patients");
      }
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError("Something went wrong while fetching patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // ✅ Apply filters
  const applyFilters = (patientList) => {
    return patientList.filter((p) => {
      const u = p.userId || {};

      // --- Search Filter ---
      const name = u.fullName?.toLowerCase() || "";
      const email = u.email?.toLowerCase() || "";
      const matchesSearch =
        name.includes(searchTerm.toLowerCase()) ||
        email.includes(searchTerm.toLowerCase());

      // --- Status Filter ---
      const matchesStatus =
        filterStatus === "All"
          ? true
          : filterStatus === "Approved"
          ? u.isApproved === true
          : u.isApproved === false;

      // --- Age Filter ---
      const age = Number(u.age) || 0;
      let matchesAge = true;
      if (filterAge === "18-30") matchesAge = age >= 18 && age <= 30;
      else if (filterAge === "31-50") matchesAge = age >= 31 && age <= 50;
      else if (filterAge === "51+") matchesAge = age >= 51;

      return matchesSearch && matchesStatus && matchesAge;
    });
  };

  const filteredPatients = applyFilters(patients);

  // ✅ Pagination
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(
    indexOfFirstPatient,
    indexOfLastPatient
  );
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const getStatusColor = (isApproved) => {
    return isApproved
      ? "bg-green-100 text-green-800 border border-green-200"
      : "bg-yellow-100 text-yellow-800 border border-yellow-200";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Patients Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage all patient records and information
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Total Patients
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {patients.length}
                  </p>
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    <span>Registered</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-blue-500 transition-all duration-300 group-hover:scale-110">
                  <Users className="h-6 w-6 text-white" />
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
                    {patients.filter((p) => p.userId?.isApproved).length}
                  </p>
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    <span>Active</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-green-500 transition-all duration-300 group-hover:scale-110">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Pending
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {patients.filter((p) => !p.userId?.isApproved).length}
                  </p>
                  <div className="flex items-center text-yellow-600 text-sm font-medium">
                    <span>Awaiting</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-yellow-500 transition-all duration-300 group-hover:scale-110">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    This Month
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {patients.length}
                  </p>
                  <div className="flex items-center text-blue-600 text-sm font-medium">
                    <span>New</span>
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
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  All Patients ({filteredPatients.length})
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
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
                  <ChevronDown
                    className={`h-4 w-4 transform transition-transform ${
                      showFilters ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              </div>
            </div>

            {/* ✅ Filters Panel */}
            {showFilters && (
              <div className="mt-4 bg-gray-50 border rounded-md p-4 grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Approval Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="All">All</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age Range
                  </label>
                  <select
                    value={filterAge}
                    onChange={(e) => {
                      setFilterAge(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="All">All Ages</option>
                    <option value="18-30">18–30</option>
                    <option value="31-50">31–50</option>
                    <option value="51+">51+</option>
                  </select>
                </div>
              </div>
            )}
          </CardHeader>

          {/* ✅ Table */}
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading patients...
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : currentPatients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="font-medium">No patients found.</p>
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        "Patient ID",
                        "Name",
                        "Email",
                        "Age",
                        "Phone",
                        "CNIC",
                        "Role",
                        "Status",
                      ].map((header) => (
                        <th
                          key={header}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentPatients.map((patient, index) => {
                      const u = patient.userId || {};
                      return (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            #
                            {(indexOfFirstPatient + index + 1)
                              .toString()
                              .padStart(4, "0")}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {u.fullName || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {u.email || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {u.age || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {u.phone || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {u.cnic || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {u.role || "N/A"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(
                                u.isApproved
                              )}`}
                            >
                              {u.isApproved ? "Approved" : "Pending"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ✅ Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {indexOfFirstPatient + 1} to{" "}
                  {Math.min(indexOfLastPatient, filteredPatients.length)} of{" "}
                  {filteredPatients.length} results
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </div>
      </div>
    </div>
  );
};

export default AllPatients;
