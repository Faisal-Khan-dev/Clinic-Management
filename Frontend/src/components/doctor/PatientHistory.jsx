import { useState, useEffect } from "react";
import { doctorAPI } from "../../api/doctorAPI";
import { Card, CardContent } from "../doctorCommon/Card";
import { Button } from "../doctorCommon/Button";
import {
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  Download,
  Eye,
} from "lucide-react";

const PatientHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [caseHistories, setCaseHistories] = useState([]);
  const [loading, setLoading] = useState(false);

  

  // 🔹 doctorId — get from localStorage or context (based on your auth setup)
  const user = JSON.parse(localStorage.getItem("user"));
  const doctorId = user?.id
    // console.log("doctorId", doctorId);
    

  // 🔹 Fetch all case histories created by this doctor
  useEffect(() => {
    const fetchHistories = async () => {
      if (!doctorId) return;

      try {
        setLoading(true);
        const res = await doctorAPI.getPatientHistory(doctorId);
        console.log("res ", res);
        

        if (res.data.status) {
          setCaseHistories(res.data.data);
        } else {
          setCaseHistories([]);
        }
      } catch (error) {
        console.error("Error fetching doctor case histories:", error);
        setCaseHistories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistories();
  }, [doctorId]);

  // 🔹 Filter histories by search term and status
  const filteredHistories = caseHistories.filter((history) => {
    const matchSearch =
      history?.patientInfo?.fullName
        ?.toLowerCase()
        ?.includes(searchTerm.toLowerCase()) ||
      history?.diagnosis?.toLowerCase()?.includes(searchTerm.toLowerCase());
    const matchStatus =
      statusFilter === "all" || history.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // 🔹 Status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "ongoing":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Patient Case History
        </h1>
        <p className="text-gray-600">
          View all case histories created by you (doctor)
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients or diagnosis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="ongoing">Ongoing</option>
              <option value="pending">Pending</option>
            </select>

            <Button className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Apply Filters</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Case Histories */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : filteredHistories.length > 0 ? (
        <div className="space-y-4">
          {filteredHistories.map((history) => (
            <CaseHistoryCard
              key={history._id}
              history={history}
              statusColor={getStatusColor(history.status)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No case histories found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search criteria or filters
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// 🔹 Case History Card Component
const CaseHistoryCard = ({ history, statusColor }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
        {/* Patient Info */}
        <div className="flex-1">
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {history.patientInfo?.fullName || "Unknown Patient"}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                <span>
                  {history.patientInfo?.email
                    ? `Email: ${history.patientInfo.email}`
                    : ""}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColor}`}
                >
                  {history.status
                    ? history.status.charAt(0).toUpperCase() +
                      history.status.slice(1)
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Diagnosis and Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">
                Diagnosis & Symptoms
              </h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-900 font-medium">
                  {history.diagnosis}
                </p>
                <p className="text-sm text-gray-600">{history.symptoms}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">Prescription</h4>
              <p className="text-sm text-gray-600">{history.prescription}</p>
            </div>
          </div>
        </div>

        {/* Side Info and Actions */}
        <div className="flex flex-col items-start lg:items-end space-y-3 mt-4 lg:mt-0 lg:pl-4">
          <div className="text-sm text-gray-500 text-right">
            <div className="flex items-center space-x-1 mb-1">
              <Calendar className="h-4 w-4" />
              <span>
                {history.appointmentInfo?.date
                  ? new Date(history.appointmentInfo.date).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>{history.doctorInfo?.fullName || "Unknown Doctor"}</span>
            </div>
          </div>

          {history.followUpRequired && history.followUpDate && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
              <p className="text-sm text-orange-800 font-medium">
                Follow-up: {new Date(history.followUpDate).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Eye className="h-4 w-4" />
              <span>View</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default PatientHistory;
