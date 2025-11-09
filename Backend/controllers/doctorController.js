import UserModel from "../models/user.js";
import DoctorModel from "../models/doctor.js";
import AppointmentModel from "../models/appointment.js";
import PatientHistory from "../models/patientHistory.js";
import PatientModel from "../models/patient.js";



export const updateDoctorProfile = async (req, res) => {
    try {
        const { id } = req.params; 
        const { userData, qualification, specialization, availableDays, shiftTimings } = req.body;
        // console.log("id", id);
        // console.log("req", req.body.userData);

        const doctor = await DoctorModel.findById(id);
        // console.log("doctor", doctor);

        const _id = doctor.userId
        
        if (!doctor) {
            return res.status(404).json({
                message: "Doctor record not found!",
                status: false,
            });
        }

        doctor.qualification = qualification || doctor.qualification;
        doctor.specialization = specialization || doctor.specialization;
        doctor.availableDays = availableDays || doctor.availableDays;
        doctor.shiftTimings = shiftTimings || doctor.shiftTimings;

        console.log("updated doctor", doctor);
        
        await doctor.save();
        
        const user = await UserModel.findById(_id);
        console.log("user", user);
        
        if (!user) {
            return res.status(404).json({
                message: "User not found!",
                status: false,
            });
        }

        if (user.role !== "Doctor") {
            return res.status(403).json({
                message: "Only doctors can update their profile!",
                status: false,
            });
        }
        
        
        user.fullName = userData.fullName || user.fullName
        user.age = userData.age || user.age
        user.phone = userData.phone || user.phone
        console.log("userData", user);
        await user.save()
        
        
        // const updatedUser = await UserModel.findById(_id);
        // console.log("updatedUser", updatedUser);
        
        // const updatedDoctor = await DoctorModel.findOne({ id });
        // console.log("updatedDoctor", updatedDoctor);
        
        res.status(200).json({
            message: "Doctor profile updated successfully!",
            status: true,
            user: user,
            doctor: doctor,
        });

    } catch (error) {
        console.log(error.message);
        
        res.status(500).json({
            message: error.message || "Something went wrong!",
            status: false,
        });
    }
};

export const getDoctorAppointments = async (req, res) => {
    try {
        const { id } = req.params;

        const doctorId = id
        
        if (!doctorId) {
            return res.status(400).json({
                status: false,
                message: "Doctor ID is required!",
            });
        }
        

        const doctor = await DoctorModel.findById(doctorId);
        console.log(doctor);
        
        if (!doctor) {
            return res.status(404).json({
                status: false,
                message: "Doctor not found!",
            });
        }

        const appointments = await AppointmentModel.find({ doctorId: id })
            .populate({
                path: "patientId",
                select: "userId ",
                populate: {
                    path: "userId",
                    select: "fullName email phone age",
                },
            })
        .populate("roomId")
        .sort({ date: 1 });
        console.log(appointments)
        
        if (!appointments.length) {
            return res.status(404).json({
                status: false,
                message: "No appointments found for this doctor.",
            });
        }

        res.status(200).json({
            message: "Doctor appointments fetched successfully!",
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

export const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params; // appointment id
        const { status } = req.body;

        console.log("Updating appointment:", id, "to status:", status);

        if (!id || !status) {
            return res.status(400).json({
                status: false,
                message: "Appointment ID and status are required!",
            });
        }

        // Validate status
        const validStatuses = ["Scheduled", "Completed", "Cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                status: false,
                message: "Invalid status. Must be: Scheduled, Completed, or Cancelled",
            });
        }

        const appointment = await AppointmentModel.findByIdAndUpdate(
            id,
            { status: status },
            { new: true }
        )
            .populate("patientId")
            .populate("roomId");

        if (!appointment) {
            return res.status(404).json({
                status: false,
                message: "Appointment not found!",
            });
        }

        console.log("Updated appointment:", appointment);

        res.status(200).json({
            message: `Appointment status updated to ${status} successfully!`,
            status: true,
            appointment: appointment,
        });

    } catch (error) {
        console.error("Error updating appointment status:", error);
        res.status(500).json({
            message: error.message || "Something went wrong!",
            status: false,
        });
    }
};


export const createCaseHistory = async (req, res) => {
    try {
        const { patientId, doctorId, appointmentId, diagnosis, prescription, followUpDate } = req.body;

        if (!patientId || !doctorId || !appointmentId || !diagnosis || !prescription) {
            return res.status(400).json({
                message: "All required fields must be provided!",
                status: false,
            });
        }

        const doctor = await DoctorModel.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found!",
                status: false,
            });
        }

        const patient = await PatientModel.findById(patientId);
        if (!patient) {
            return res.status(404).json({
                message: "Patient not found!",
                status: false,
            });
        }

        const appointment = await AppointmentModel.findById(appointmentId);
        if (!appointment || appointment.doctorId.toString() !== doctorId || appointment.patientId.toString() !== patientId) {
            return res.status(400).json({
                message: "Invalid appointment for the provided doctor or patient!",
                status: false,
            });
        }
        const prevHistory = await PatientHistory.findOne({ appointmentId: appointmentId })
        if (prevHistory) {
            return res.status(400).json({
                message: "Already created for this appointment",
                status: false,
            });
        }

        const history = await PatientHistory.create({
            patientId,
            doctorId,
            appointmentId,
            diagnosis,
            prescription,
            followUpDate,
        });

        res.status(201).json({
            status: true,
            message: "Case history created successfully!",
            history,
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message || "Something went wrong!",
        });
    }
};

export const getPatientHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const patientId = id

        const previousHistory = await PatientHistory.find({ patientId })
            .populate({
                path: "doctorId",
                populate: {
                    path: "userId",
                    select: "fullName email phone qualification specialization",
                },
            })
            .populate("appointmentId", "date timeSlot")
            .lean();

        if (!previousHistory?.length) {
            return res.status(404).json({
                status: false,
                message: "No previous case history found for this patient.",
            });
        }

        const formatted = previousHistory.map((history) => ({
            ...history,
            doctorInfo: { ...history.doctorId?.userId },
            appointmentInfo: { ...history.appointmentId },
        }));

        return res.status(200).json({
            message: "Patient's previous case history fetched successfully.",
            status: true,
            data: formatted,
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Error fetching previous history.",
            status: false,
        });
    }
};

export const getDoctorCaseHistories = async (req, res) => {
    try {
        const { id } = req.params; // doctor ID

        const doctorId = id

        const histories = await PatientHistory.find({ doctorId })
           .populate({
                path: "patientId",
                select: "fullName email phone age gender", // populate patient info
            })
            .populate({
                path: "doctorId",
                populate: {
                    path: "userId",
                    select: "fullName email phone qualification specialization",
                },
            })
            .populate("appointmentId", "date timeSlot")
            .lean();

        if (!histories?.length) {
            return res.status(404).json({
                status: false,
                message: "No case histories found for this doctor.",
            });
        }

        const formatted = histories.map((history) => ({
            ...history,
            doctorInfo: { ...history.doctorId?.userId },
            appointmentInfo: { ...history.appointmentId },
            patientInfo: { ...history.patientId },
        }));

        return res.status(200).json({
            message: "Doctor's case histories fetched successfully.",
            status: true,
            data: formatted,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Error fetching case histories.",
            status: false,
        });
    }
};


export const getDoctorProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const doctorId = id
        console.log("Fetching profile for doctor ID:", doctorId);

        const doctor = await DoctorModel.findOne({ _id: doctorId  })
        .populate("userId")
        .populate("roomId");
        console.log("doctor", doctor)
        
        // const userId = doctor.userId
        // console.log("userId", userId)
                
           
        
        console.log("doctor", doctor);
        
// return
        if (!doctor) {
            return res.status(404).json({
                status: false,
                message: "Doctor profile not found!",
            });
        }

        if (!doctor.userId) {
            return res.status(404).json({
                status: false,
                message: "User data not found for this doctor!",
            });
        }

        // Format the response data
        const profileData = {
            _id: doctor._id,
            qualification: doctor.qualification,
            specialization: doctor.specialization,
            availableDays: doctor.availableDays,
            shiftTimings: doctor.shiftTimings,
            roomId: doctor.roomId,
            isApproved: doctor.isApproved,
            status: doctor.status,
            userId: {
                _id: doctor.userId._id,
                fullName: doctor.userId.fullName,
                email: doctor.userId.email,
                phone: doctor.userId.phone,
                cnic: doctor.userId.cnic,
                age: doctor.userId.age,
                role: doctor.userId.role,
                isApproved: doctor.userId.isApproved,
                isActive: doctor.userId.isActive
            },
            createdAt: doctor.createdAt,
            updatedAt: doctor.updatedAt
        };
        console.log("Profile data being sent:", profileData);

        return res.status(200).json({
            status: true,
            message: "Doctor profile fetched successfully!",
            profile: profileData,
        });


    } catch (error) {
        console.error("Error in getDoctorProfile:", error);
        return res.status(500).json({
            message: error.message || "Something went wrong!",
            status: false,
        });
    }
};