import PatientHistory from "../models/patientHistory.js";
import AppointmentModel from "../models/appointment.js";
import RoomModel from "../models/room.js";
import PatientModel from "../models/patient.js";
import DoctorModel from "../models/doctor.js";
import UserModel from "../models/user.js";


export const createAppointment = async (req, res) => {
    try {
        const { patientId, doctorId, roomId, date, timeSlot } = req.body;

        let jeo = { patientId, doctorId, roomId, date, timeSlot }
        console.log("jeo",jeo);
        
        if (!patientId || !doctorId || !roomId || !date || !timeSlot) {
            return res.status(400).json({
                status: false,
                message: "All fields are required!",
            });
        }

        const doctor = await DoctorModel.findById(doctorId);
            console.log("doctor", doctor);
                
        const patient = await PatientModel.findOne({userId: patientId});
            console.log("patient", patient);
                
        const room = await RoomModel.findById(roomId);
            console.log("room", room);

       
        
        if (!doctor || !patient || !room) {
            return res.status(404).json({
                status: false,
                message: "Doctor, Patient, or Room not found!",
            });
        }


        const conflict = room.schedule.some(
            (slot) =>
                new Date(slot.date).toDateString() === new Date(date).toDateString() &&
                slot.timeSlot === timeSlot
        );

        if (conflict) {
            return res.status(400).json({
                status: false,
                message: "Room already booked for this date and time!",
            });
        }

        const appointment = await AppointmentModel.create({
            patientId,
            doctorId,
            roomId,
            date,
            timeSlot,
            status: "Scheduled",
        });

        room.schedule.push({
            date,
            timeSlot,
            appointmentId: appointment._id,
        });
        room.isAvailable = false;
        room.isBooked = "Booked"
        await room.save();

        res.status(201).json({
            message: "Appointment booked successfully!",
            status: true,
            appointment,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || "Something went wrong!",
            status: false,
        });
    }
};

export const cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await AppointmentModel.findById(id)
        const patientId = appointment.patientId

        

        
        if (!appointment) {
            return res.status(404).json({
                status: false,
                message: "Appointment not found or unauthorized!",
            });
        }

        const room = await RoomModel.findById(appointment.roomId)
        room.isBooked = "Available"
        await room.save()
        

        appointment.status = "Cancelled";
        await appointment.save();


        res.status(200).json({
            message: "Appointment cancelled successfully!",
            status: true,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || "Something went wrong!",
            status: false,
        });
    }
};


export const getPatientHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const patientId = id
        if (!patientId) {
            return res.status(400).json({
                status: false,
                message: "Patient ID is required!",
            });
        }
        const patient = await PatientModel.findOne({userId: patientId})
        const patientMainId = patient._id
        
        const history = await PatientHistory.find({ patientId: patientMainId })
            .populate({
                path: "doctorId",
                select: "userId qualification specialization",
                populate: {
                    path: "userId",
                    select: "fullName email phone age",
                },
            })
            .populate({
                path: "appointmentId",
                select: "date timeSlot status",
            })
            .sort({ createdAt: -1 });

        if (!history || history.length === 0) {
            return res.status(404).json({
                status: false,
                message: "No case history found for this patient!",
            });
        }

        res.status(200).json({
            status: true,
            message: "Patient case history fetched successfully!",
            totalRecords: history.length,
            history,
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message || "Something went wrong!",
        });
    }
};


export const updatePatientProfile = async (req, res) => {

    try {
        const { id } = req.params;
        const { fullName, age, phone, cnic, gender, address } = req.body;

        const user = await UserModel.findById(id);
        console.log("user", user);
        
        if (!user) {
            return res.status(404).json({
                message: "User not found!",
                status: false,
            });
        }

        if (user.role !== "Patient") {
            return res.status(403).json({
                message: "Only patients can update their profile!",
                status: false,
            });
        }

        await UserModel.findByIdAndUpdate(
            id,
            {
                fullName: fullName || user.fullName,
                age: age || user.age,
                phone: phone || user.phone,
                cnic: cnic || user.cnic,
            },
            { new: true }
        );

        const patient = await PatientModel.findOne({userId: id });
        console.log("patient", patient);
        

        if (!patient) {
            return res.status(404).json({
                message: "Patient record not found!",
                status: false,
            });
        }

        patient.gender = gender || patient.gender;
        patient.address = address || patient.address;
        await patient.save();

        const updatedUser = await UserModel.findById(id);
        const updatedPatient = await PatientModel.findOne({ id });

        res.status(200).json({
            message: "Profile updated successfully!",
            status: true,
            user: updatedUser,
            patient: updatedPatient,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || "Something went wrong!",
            status: false,
        });
    }
};


// ✅ GET PATIENT PROFILE
export const getPatientProfile = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the user
        const user = await UserModel.findById(id)
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find the patient data linked to this user
        const patient = await PatientModel.findOne({ userId: id });
        if (!patient) {
            return res.status(404).json({ message: "Patient record not found" });
        }

        res.status(200).json({
            success: true,
            message: "Patient profile fetched successfully",
            user,
            patient,
        });
    } catch (error) {
        console.error("Error fetching patient profile:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch profile",
            error: error.message,
        });
    }
};

export const getAllDoctors = async (req, res) => {
    try {
        // populate both user and room info
        const doctors = await DoctorModel.find()
            .populate("userId", "fullName email")
            .populate({
                path: "roomId",
                select: "roomNum isBooked schedule isAvailable",
            })
            .lean();

        // compute availability dynamically
        const formattedDoctors = doctors.map((doc) => {
            let availabilityStatus = "Unavailable";

            if (doc.roomId) {
                if (doc.roomId.isBooked === "Booked") {
                    availabilityStatus = "Booked";
                } else {
                    availabilityStatus = "Available";
                }
            }

            return {
                ...doc,
                availabilityStatus,
            };
        });
        

        console.log(
            "Doctors fetched:",
            formattedDoctors.map((d) => ({
                name: d.userId?.fullName,
                room: d.roomId?.roomNumber,
                status: d.availabilityStatus,
            }))
        );
        return res.status(200).json({
            message: "Doctors fetched successfully",
            status: true,
            doctors: formattedDoctors,
        });
    } catch (error) {
        console.error("Error fetching doctors:", error);
        return res.status(500).json({
            message: error.message || "Something went wrong!",
            status: false,
        });
    }
};
    
export const getMyAppointments =  async (req, res) => {
    try {
        const { id } = req.params;
        console.log("id", id);
        
        const patientId = id

        if (!patientId) {
            return res.status(400).json({
                status: false,
                message: "Patient ID is required!",
            });
        }

       
    

        const appointments = await AppointmentModel.find( {patientId} )
            .populate("patientId")
            .populate({
                path: "doctorId",
                select: "userId qualification specialization",
                populate: {
                    path: "userId",
                    select: "fullName email phone age",
                },
            })
            .populate("roomId")
            .sort({ date: 1 });

        if (!appointments.length) {
            return res.status(404).json({
                status: false,
                message: "No appointments found for this patient.",
            });
        }

        res.status(200).json({
            message: "Patient appointments fetched successfully!",
            status: true,
            total: appointments.length,
            appointments,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || "Something went wrong!",
            status: false,
        });
    }
};