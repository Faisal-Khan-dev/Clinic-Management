import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "../doctorCommon/Card";
import { Button } from "../doctorCommon/Button";
import {
  User,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Clock,
  Save,
  MapPin,
  AlertCircle,
  Edit3,
  Shield,
  BadgeCheck,
} from "lucide-react";
import { doctorAPI } from "../../api/doctorAPI";
import { useAuth } from "../../context/AuthContext";

const DoctorProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: "",
    cnic: "",
    qualification: "",
    specialization: "",
    availableDays: "",
    shiftTimings: "",
  });

  // Fetch doctor profile
  const fetchDoctorProfile = async () => {
    try {
      setLoading(true);
      setError("");

      if (!user?.id) {
        setError("User not found. Please login again.");
        return;
      }

      // console.log("Fetching profile for user ID:", user.id);

      const response = await doctorAPI.getDoctorProfile(user.id);
      // console.log("API Response:", response);

      if (response.data.status) {
        const doctorData = response.data.profile;
        setProfile(doctorData);

        // Set all form data including full name
        setFormData({
          fullName: doctorData.userId?.fullName || "",
          email: doctorData.userId?.email || "",
          phone: doctorData.userId?.phone || "",
          age: doctorData.userId?.age || "",
          cnic: doctorData.userId?.cnic || "",
          qualification: doctorData.qualification || "",
          specialization: doctorData.specialization || "",
          availableDays: Array.isArray(doctorData.availableDays)
            ? doctorData.availableDays.join(", ")
            : doctorData.availableDays || "",
          shiftTimings: doctorData.shiftTimings || "",
        });
      } else {
        setError(response.data.message || "Failed to fetch profile");
      }
    } catch (error) {
      console.error("Error fetching doctor profile:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchDoctorProfile();
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!user?.id) {
        setError("User not found. Please login again.");
        return;
      }

      // Prepare update data - include full name in userData
      const updateData = {
        qualification: formData.qualification,
        specialization: formData.specialization,
        availableDays: formData.availableDays
          .split(",")
          .map((day) => day.trim()),
        shiftTimings: formData.shiftTimings,
        userData: {
          fullName: formData.fullName, // Include full name
          phone: formData.phone,
          age: formData.age,
        },
      };

      // console.log("Updating profile with data:", updateData);

      const response = await doctorAPI.updateDoctorProfile(user.id, updateData);
      // console.log("updateres", response);

      if (response.data.status) {
        setProfile(response.data.doctor);
        setIsEditing(false);
        setSuccess("Profile updated successfully!");

        // Refresh profile data
        fetchDoctorProfile();

        // Hide success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original profile data
    if (profile) {
      setFormData({
        fullName: profile.userId?.fullName || "",
        email: profile.userId?.email || "",
        phone: profile.userId?.phone || "",
        age: profile.userId?.age || "",
        cnic: profile.userId?.cnic || "",
        qualification: profile.qualification || "",
        specialization: profile.specialization || "",
        availableDays: Array.isArray(profile.availableDays)
          ? profile.availableDays.join(", ")
          : profile.availableDays || "",
        shiftTimings: profile.shiftTimings || "",
      });
    }
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-900">
            Loading Profile
          </p>
          <p className="mt-2 text-gray-600">
            Please wait while we fetch your information
          </p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto h-16 w-16 text-red-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Profile
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            onClick={fetchDoctorProfile}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <User className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Profile Found
          </h3>
          <p className="text-gray-600 mb-6">
            Unable to load doctor profile information.
          </p>
          <Button
            onClick={fetchDoctorProfile}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Doctor Profile
                </h1>
                <p className="mt-2 text-lg text-gray-600">
                  Manage your complete profile information
                </p>
              </div>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 flex items-center space-x-3 px-6 py-3"
                >
                  <Edit3 className="h-5 w-5" />
                  <span className="font-medium">Edit Profile</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="mb-6 space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
              <div className="flex items-center">
                <BadgeCheck className="h-5 w-5 text-green-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    {success}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Form */}
        <form onSubmit={handleSave}>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center space-x-3">
                <User className="h-6 w-6" />
                <span>Profile Information</span>
              </h2>
            </div>

            {/* Form Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <span>Personal Details</span>
                  </h3>

                  <FormField
                    label="Full Name"
                    icon={<User className="h-4 w-4" />}
                    value={formData.fullName}
                    editing={isEditing}
                    onChange={(value) => handleInputChange("fullName", value)}
                    required
                    placeholder="Enter your full name"
                  />

                  <FormField
                    label="Email Address"
                    icon={<Mail className="h-4 w-4" />}
                    value={formData.email}
                    editing={false}
                    type="email"
                    placeholder="Your email address"
                  />

                  <FormField
                    label="Phone Number"
                    icon={<Phone className="h-4 w-4" />}
                    value={formData.phone}
                    editing={isEditing}
                    onChange={(value) => handleInputChange("phone", value)}
                    type="tel"
                    placeholder="Enter phone number"
                  />

                  <FormField
                    label="Age"
                    icon={<Calendar className="h-4 w-4" />}
                    value={formData.age}
                    editing={isEditing}
                    onChange={(value) => handleInputChange("age", value)}
                    type="number"
                    placeholder="Enter your age"
                  />

                  <FormField
                    label="CNIC Number"
                    icon={<Shield className="h-4 w-4" />}
                    value={formData.cnic}
                    editing={false}
                    placeholder="Your CNIC number"
                  />
                </div>

                {/* Professional Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    <span>Professional Details</span>
                  </h3>

                  <FormField
                    label="Qualification"
                    icon={<BookOpen className="h-4 w-4" />}
                    value={formData.qualification}
                    editing={isEditing}
                    onChange={(value) =>
                      handleInputChange("qualification", value)
                    }
                    required
                    placeholder="e.g., MBBS, MD, etc."
                  />

                  <FormField
                    label="Specialization"
                    icon={<BookOpen className="h-4 w-4" />}
                    value={formData.specialization}
                    editing={isEditing}
                    onChange={(value) =>
                      handleInputChange("specialization", value)
                    }
                    required
                    placeholder="e.g., Cardiology, Neurology, etc."
                  />

                  <FormField
                    label="Available Days"
                    icon={<Calendar className="h-4 w-4" />}
                    value={formData.availableDays}
                    editing={isEditing}
                    onChange={(value) =>
                      handleInputChange("availableDays", value)
                    }
                    placeholder="Monday, Wednesday, Friday"
                  />

                  <FormField
                    label="Shift Timings"
                    icon={<Clock className="h-4 w-4" />}
                    value={formData.shiftTimings}
                    editing={isEditing}
                    onChange={(value) =>
                      handleInputChange("shiftTimings", value)
                    }
                    placeholder="9:00 AM - 5:00 PM"
                  />

                  {/* Status Information */}
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Account Status
                    </h3>
                    <div className="space-y-3">
                      <StatusBadge
                        label="Profile Approval"
                        value={profile.isApproved ? "Approved" : "Pending"}
                        isActive={profile.isApproved}
                      />
                      <StatusBadge
                        label="Account Status"
                        value={profile.userId?.isActive ? "Active" : "Inactive"}
                        isActive={profile.userId?.isActive}
                      />
                      {profile.roomId && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            Assigned Room
                          </span>
                          <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                            <MapPin className="h-3 w-3 mr-1" />
                            Room {profile.roomId.roomNum}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="px-8 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2 font-medium"
                  >
                    <Save className="h-5 w-5" />
                    <span>
                      {isLoading ? "Saving Changes..." : "Save Changes"}
                    </span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Form Field Component
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
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
        {icon}
      </div>
      {editing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder={placeholder}
        />
      ) : (
        <div className="block w-full pl-10 pr-3 py-3 border border-transparent rounded-lg bg-gray-50 text-gray-900">
          {value || <span className="text-gray-400">Not provided</span>}
        </div>
      )}
    </div>
  </div>
);

// Status Badge Component
const StatusBadge = ({ label, value, isActive }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
        isActive
          ? "bg-green-100 text-green-800"
          : "bg-yellow-100 text-yellow-800"
      }`}
    >
      {value}
    </span>
  </div>
);

export default DoctorProfile;
