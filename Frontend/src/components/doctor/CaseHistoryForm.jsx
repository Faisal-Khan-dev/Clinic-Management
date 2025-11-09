import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "../doctorCommon/Card";
import { Button } from "../doctorCommon/Button";
import {
  User,
  FileText,
  Calendar,
  Pill,
  Stethoscope,
  Save,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { doctorAPI } from "../../api/doctorAPI";
import { useAuth } from "../../context/AuthContext";

const CaseHistoryForm = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    patientId: "",
    appointmentId: "",
    diagnosis: "",
    symptoms: "",
    prescription: "",
    notes: "",
    followUpDate: "",
    priority: "medium",
  });

  // Check if appointment data is passed from navigation
  useEffect(() => {
    if (location.state?.appointment) {
      const apt = location.state.appointment;
      setAppointment(apt);

      // Auto-fill form with appointment data
      setFormData((prev) => ({
        ...prev,
        patientId: apt.patientId?._id || apt.patientId,
        appointmentId: apt._id,
      }));
      setLoading(false);
    } else {
      setError(
        "No appointment data found. Please go back and select an appointment."
      );
      setLoading(false);
    }
  }, [location.state]);

  // Check if appointment is completed
  useEffect(() => {
    if (appointment && appointment.status !== "Completed") {
      setError(
        "Cannot create case history for non-completed appointments. Please mark the appointment as completed first."
      );
    }
  }, [appointment]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate appointment status
    if (appointment && appointment.status !== "Completed") {
      setError("Cannot create case history for non-completed appointments.");
      return;
    }

    // Validate required fields
    if (!formData.diagnosis || !formData.prescription) {
      setError("Diagnosis and Prescription are required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const caseHistoryData = {
        patientId: formData.patientId,
        doctorId: user?.id,
        appointmentId: formData.appointmentId,
        diagnosis: formData.diagnosis,
        prescription: formData.prescription,
        symptoms: formData.symptoms,
        notes: formData.notes,
        followUpDate: formData.followUpDate || undefined,
        priority: formData.priority,
      };

      const response = await doctorAPI.createCaseHistory(caseHistoryData);

      if (response.data.status) {
        setSuccess("Case history created successfully!");

        // Reset form
        setFormData({
          patientId: "",
          appointmentId: "",
          diagnosis: "",
          symptoms: "",
          prescription: "",
          notes: "",
          followUpDate: "",
          priority: "medium",
        });

        // Redirect to appointments page after 2 seconds
        setTimeout(() => {
          navigate("/doctor/appointments");
        }, 2000);
      } else {
        setError(response.data.message || "Failed to create case history");
      }
    } catch (err) {
      console.error("Error creating case history:", err);
      setError(
        err.response?.data?.message ||
          "Failed to create case history. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate("/doctor/appointments");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading appointment data...</span>
      </div>
    );
  }

  if (error && !appointment) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
        <Button onClick={handleBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Appointments</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Create Case History
          </h1>
          <p className="text-gray-600">
            Document patient consultation and treatment details
          </p>
        </div>
        <Button
          onClick={handleBack}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Appointments</span>
        </Button>
      </div>

      {/* Appointment Info */}
      {appointment && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Patient:</strong>{" "}
                {appointment.patientId?.userId?.fullName ||
                  appointment.patientId?.fullName ||
                  "Unknown Patient"}
              </div>
              <div>
                <strong>Appointment Date:</strong>{" "}
                {new Date(appointment.date).toLocaleDateString()}
              </div>
              <div>
                <strong>Status:</strong>{" "}
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    appointment.status === "Completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {appointment.status}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
          <div className="flex items-center">
            <Save className="h-5 w-5 text-green-400 mr-3" />
            <p className="text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Show form only if appointment is completed */}
      {appointment && appointment.status === "Completed" ? (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patient Information */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span>Patient Information</span>
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient
                  </label>
                  <div className="p-3 bg-gray-50 rounded border text-gray-700">
                    {appointment.patientId?.userId?.fullName ||
                      appointment.patientId?.fullName ||
                      "Unknown Patient"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      handleInputChange("priority", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Follow-up Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={formData.followUpDate}
                      onChange={(e) =>
                        handleInputChange("followUpDate", e.target.value)
                      }
                      className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold flex items-center space-x-2">
                  <Stethoscope className="h-5 w-5 text-green-600" />
                  <span>Medical Details</span>
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  label="Diagnosis *"
                  icon={<FileText className="h-4 w-4" />}
                  value={formData.diagnosis}
                  editing={true}
                  onChange={(value) => handleInputChange("diagnosis", value)}
                  required
                  placeholder="Enter primary diagnosis"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Symptoms
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <textarea
                      value={formData.symptoms}
                      onChange={(e) =>
                        handleInputChange("symptoms", e.target.value)
                      }
                      rows={3}
                      className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Describe patient symptoms..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Prescription and Notes */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold flex items-center space-x-2">
                <Pill className="h-5 w-5 text-purple-600" />
                <span>Prescription & Notes</span>
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prescription *
                </label>
                <div className="relative">
                  <Pill className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <textarea
                    value={formData.prescription}
                    onChange={(e) =>
                      handleInputChange("prescription", e.target.value)
                    }
                    required
                    rows={4}
                    className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Enter medication details, dosage, and instructions..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Any additional observations or recommendations..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({
                  patientId: formData.patientId,
                  appointmentId: formData.appointmentId,
                  diagnosis: "",
                  symptoms: "",
                  prescription: "",
                  notes: "",
                  followUpDate: "",
                  priority: "medium",
                });
                setError("");
                setSuccess("");
              }}
              disabled={isSubmitting}
            >
              Clear Form
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>
                {isSubmitting ? "Creating..." : "Create Case History"}
              </span>
            </Button>
          </div>
        </form>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Appointment Not Completed
            </h3>
            <p className="text-gray-600 mb-4">
              You can only create case history for completed appointments.
              Please mark the appointment as completed first.
            </p>
            <Button onClick={handleBack}>Back to Appointments</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// FormField component
const FormField = ({
  label,
  icon,
  value,
  editing,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
        {icon}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        placeholder={placeholder}
      />
    </div>
  </div>
);

export default CaseHistoryForm;
