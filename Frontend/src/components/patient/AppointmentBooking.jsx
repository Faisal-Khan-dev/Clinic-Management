import { useState, useEffect, useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { patientAPI } from "../../api/patientAPI";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import Loader from "../common/Loader";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Stethoscope,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

const AppointmentBooking = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const [formData, setFormData] = useState({
    date: "",
    timeSlot: "",
  });

  // ✅ Fetch all doctors
  useEffect(() => {
    fetchDoctors();
    console.log(doctors);
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await patientAPI.getAllDoctors();

      if (res.data.status && Array.isArray(res.data.doctors)) {
        setDoctors(res.data.doctors);

      } else {
        setError("No doctors found!");
      }
      
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error loading doctors");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Book Appointment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) return;

    
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      
      
      
      const payload = {
        patientId: user.id,
        doctorId: selectedDoctor._id,
        roomId: selectedDoctor.roomId?._id || selectedDoctor.room?.roomId,
        date: formData.date,
        timeSlot: formData.timeSlot,
      };

      console.log(payload);
      
      const res = await patientAPI.bookAppointment(payload);
      console.log("res", res);
      

      if (res.data.status) {
        setSuccess("Appointment booked successfully!");
        setFormData({ date: "", timeSlot: "" });
        setSelectedDoctor(null);
        fetchDoctors();
      } else {
        setError(res.data.message || "Booking failed!");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong!");
    } finally {
      setSubmitting(false);
    }
  };

  const getMinDate = () => new Date().toISOString().split("T")[0];
  const getMaxDate = () => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toISOString().split("T")[0];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Book an Appointment
        </h1>
        <p className="text-gray-600">
          View all available doctors and schedule your visit
        </p>
      </div>

      {/* Doctor List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.length > 0 ? (
          doctors.map((doc) => {
            const status = doc.availabilityStatus || "Unavailable";
            {console.log(status);
            }
            let statusStyle = "text-gray-600";
            let statusIcon = <AlertCircle className="w-4 h-4 mr-1" />;

            if (status === "Available") {
              statusStyle = "text-green-600";
              statusIcon = <CheckCircle className="w-4 h-4 mr-1" />;
            } else if (status === "Booked") {
              statusStyle = "text-orange-600";
              statusIcon = <Clock className="w-4 h-4 mr-1" />;
            } else {
              statusStyle = "text-red-600";
              statusIcon = <XCircle className="w-4 h-4 mr-1" />;
            }

            return (
              <Card
                key={doc._id}
                className={`p-6 transition-all duration-200 ${
                  selectedDoctor?._id === doc._id
                    ? "border-blue-500 shadow-lg"
                    : "hover:border-blue-300"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
                      <User className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {doc.userId?.fullName || "Dr. Unknown"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {doc.specialization || "Specialization N/A"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`flex items-center text-sm font-medium ${statusStyle}`}
                  >
                    {statusIcon}
                    {status}
                  </span>
                </div>

                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    <Stethoscope className="inline w-4 h-4 mr-2 text-gray-400" />
                    Specialization: {doc.specialization}
                  </p>
                  <p>
                    <Calendar className="inline w-4 h-4 mr-2 text-gray-400" />
                    Available Days: {doc.availableDays?.join(", ") || "N/A"}
                  </p>
                  <p>
                    <Clock className="inline w-4 h-4 mr-2 text-gray-400" />
                    Timings: {doc.shiftTimings || "Not specified"}
                  </p>
                  <p>
                    <MapPin className="inline w-4 h-4 mr-2 text-gray-400" />
                    Room: {doc.roomId?.roomNum || doc.room?.roomNum || "N/A"}
                  </p>
                </div>

                {status === "Available" && (
                  <Button
                    className="mt-4 w-full"
                    onClick={() => setSelectedDoctor(doc)}
                  >
                    Book Appointment
                  </Button>
                )}
              </Card>
            );
          })
        ) : (
          <p className="text-center text-gray-500 col-span-full">
            No doctors available at the moment.
          </p>
        )}
      </div>

      {/* Appointment Booking Form */}
      {selectedDoctor && (
        <Card className="p-8 border-t-4 border-blue-500 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Book Appointment with {selectedDoctor.userId?.fullName}
            </h2>
            <Button variant="secondary" onClick={() => setSelectedDoctor(null)}>
              Cancel
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Appointment Date"
                type="date"
                name="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                min={getMinDate()}
                max={getMaxDate()}
                icon={Calendar}
                required
              />

              <Input
                label="Time Slot"
                name="timeSlot"
                placeholder="e.g. 10:00 AM"
                value={formData.timeSlot}
                onChange={(e) =>
                  setFormData({ ...formData, timeSlot: e.target.value })
                }
                icon={Clock}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-center text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-3 text-center text-green-700">
                {success}
              </div>
            )}

            <Button type="submit" loading={submitting} className="w-full">
              Confirm Appointment
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};

export default AppointmentBooking;
