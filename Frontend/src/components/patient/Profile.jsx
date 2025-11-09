import { useState, useEffect, useContext } from "react";
import AuthContext from "../../context/AuthContext";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import Loader from "../common/Loader";
import { User, Phone, MapPin, IdCard, Calendar, Save } from "lucide-react";
import { patientAPI } from "../../api/patientAPI";

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    address: "",
    cnic: "",
  });

  const fetchData = async () => {
  
    const profile = await patientAPI.getProfile(user.id)
    
    if (!profile.status) {
      return console.error("Failed to get Data form backend")
    }
  
    const localUser =
      profile.data.user || user;
  if (localUser) {
    setFormData({
      fullName: localUser.fullName || "",
      email: localUser.email || "",
      phone: localUser.phone || "",
      age: localUser.age || "",
      gender: localUser.gender || "",
      address: profile.data.patient.address || "",
      cnic: localUser.cnic || "",
      gender: profile.data.patient.gender || ""
    });

  }
  setLoading(false);
};


  // 🔹 Load data initially
  useEffect(() => { fetchData() }, [user]);

  // 🔹 Handle input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Save changes (update API call)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const patientId =
        user?.id || JSON.parse(localStorage.getItem("userData"))?.id;
      if (!patientId) {
        setError("User ID not found. Please log in again.");
        setUpdating(false);
        return;
      }

      // 🔸 Call backend API
      const res = await patientAPI.updateProfile(patientId, formData);

      if (res.data.status) {
        const updatedData = {
          ...formData,
          id: patientId,
        };

        // Update in Context + LocalStorage
        updateUser(updatedData);
        localStorage.setItem("userData", JSON.stringify(updatedData));

        setSuccess("Profile updated successfully!");
        setIsEditing(false);
      } else {
        setError(res.data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Update Error:", err);
      setError(err.response?.data?.message || "Error updating profile.");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Patient Profile
        </h1>
        <p className="text-gray-600">
          Manage your personal information and contact details
        </p>
      </div>

      <Card className="p-8">
        {/* Profile Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {formData.fullName}
              </h2>
              <p className="text-gray-600">{formData.email}</p>
            </div>
          </div>

          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          ) : (
            <div className="flex space-x-3">
              <Button variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} loading={updating}>
                <Save className="w-4 h-4 mr-2" /> Save
              </Button>
            </div>
          )}
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Info */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Personal Information
              </h3>

              <Input
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                icon={User}
                disabled={!isEditing}
              />

              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                disabled
                icon={User}
              />

              <Input
                label="Age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                icon={Calendar}
                disabled={!isEditing}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Information
              </h3>

              <Input
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                icon={Phone}
                disabled={!isEditing}
              />

              <Input
                label="CNIC"
                name="cnic"
                value={formData.cnic}
                onChange={handleChange}
                icon={IdCard}
                disabled={!isEditing}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
                />
              </div>
            </div>
          </div>

          {/* Error & Success Messages */}
          {(error || success) && (
            <div
              className={`mt-6 p-4 rounded-2xl ${
                error
                  ? "bg-red-50 border border-red-200 text-red-700"
                  : "bg-green-50 border border-green-200 text-green-700"
              }`}
            >
              {error || success}
            </div>
          )}
        </form>
      </Card>
    </div>
  );
};

export default Profile;
