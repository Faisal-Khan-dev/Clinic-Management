import { useState, useEffect, useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { patientAPI } from "../../api/patientAPI";
import Card from "../common/Card";
import Loader from "../common/Loader";
import { FileText, Calendar, User, Pill, AlertCircle } from "lucide-react";

const CaseHistory = () => {
  const { user } = useContext(AuthContext);
  const [caseHistory, setCaseHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCaseHistory();
  }, []);

  const fetchCaseHistory = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await patientAPI.getCaseHistory(user.id);
      
      setCaseHistory(response.data.history || []);
    } catch (err) {
      setError("Failed to load case history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Medical Case History
        </h1>
        <p className="text-gray-600">
          Your complete medical records and treatment history
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-red-700 text-sm font-medium text-center">
            {error}
          </p>
        </div>
      )}

      {/* Case History List */}
      {caseHistory.length === 0 ? (
        <Card className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Case History
          </h3>
          <p className="text-gray-600">
            Your medical case history will appear here after your first
            appointment.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {caseHistory.map((caseRecord, index) => (
            <Card key={caseRecord.id || index} className="p-6">
              {/* Case Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Visit with Dr. {caseRecord.doctorName}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(caseRecord.visitDate)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{caseRecord.specialization}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {caseRecord.status || "Completed"}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Diagnosis */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">Diagnosis</h4>
                  </div>
                  <div className="bg-blue-50 rounded-2xl p-4">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {caseRecord.diagnosis ||
                        "No specific diagnosis recorded."}
                    </p>
                  </div>
                </div>

                {/* Treatment */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Pill className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-gray-900">
                      Treatment & Prescription
                    </h4>
                  </div>
                  <div className="bg-green-50 rounded-2xl p-4">
                    {caseRecord.prescription ? (
                      <div className="space-y-2">
                        {caseRecord.prescription.split("\n").map((line, i) => (
                          <p key={i} className="text-gray-700 text-sm">
                            {line}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-700 text-sm">
                        No prescription provided.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              {caseRecord.notes && (
                <div className="mt-4 space-y-3">
                  <h4 className="font-semibold text-gray-900">
                    Additional Notes
                  </h4>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {caseRecord.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Follow-up */}
              {caseRecord.followUpDate && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      <span className="text-gray-600">Follow-up Date:</span>
                      <span className="font-semibold text-gray-900">
                        {formatDate(caseRecord.followUpDate)}
                      </span>
                    </div>
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                      Follow-up Required
                    </span>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CaseHistory;
