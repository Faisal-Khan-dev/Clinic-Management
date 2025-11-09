import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "../adminCommon/Card";
import { Button } from "../adminCommon/Button";
import { Search, Filter, Trash2, ChevronDown } from "lucide-react";
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



  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Patients Management
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage all patient records and information
        </p>
      </div>

      <Card>
        {/* Top Bar with Search + Filter */}
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
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
              No patients found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
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
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #
                          {(indexOfFirstPatient + index + 1)
                            .toString()
                            .padStart(4, "0")}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {u.fullName || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {u.email || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {u.age || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {u.phone || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {u.cnic || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {u.role || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {u.isApproved ? "Approved ✅" : "Pending ⏳"}
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
            <div className="flex items-center justify-between mt-6">
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
      </Card>
    </div>
  );
};

export default AllPatients;
