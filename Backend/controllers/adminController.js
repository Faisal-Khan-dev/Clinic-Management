import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import UserModel from "../models/user.js";
import DoctorModel from "../models/doctor.js";
import generator from "generate-password";
import PatientModel from "../models/patient.js";
import RoomModel from "../models/room.js";
import AppointmentModel from "../models/appointment.js";


export const createDoctor = async (req, res) => {
    try {

        const { fullName, email,age, phone, cnic, qualification, specialization, availableDays, shiftTimings, roomId } = req.body;

        if (!fullName || !age || !email || !phone || !cnic || !qualification || !specialization) {
            return res.status(400).json({
                status: false,
                message: "Required fields are missing!",
            });
        }

        const user = await UserModel.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: "Email already exist!",
                status: false,
            });
        }

        const randomPassword = generator.generate({
            length: 8,
            numbers: true,
            uppercase: true,
            strict: true,
        });
        
        const hashPassword = await bcrypt.hash(randomPassword, 10);

        const newUser = await UserModel.create({
           ...req.body,
            role: "Doctor",
            password: hashPassword,
            isApproved : true,
        });

        const newDoctor = await DoctorModel.create({
            userId: newUser._id,
            qualification,
            specialization,
            availableDays,
            shiftTimings,
            roomId,
            isApproved: true,
            status: "Active",
        });

        const populatedDoctor = await DoctorModel.findById(newDoctor._id).populate("userId");

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.ADMIN_EMAIL,
                pass: process.env.ADMIN_PASS,
            },
        });

        const mailOptions = {
            from: `"Clinic Admin" <${process.env.ADMIN_EMAIL}>`,
            to: email,
            subject: "Your Doctor Account Created - Clinic Management System",
            html: `
        <h2>Welcome Dr. ${fullName}</h2>
        <p>Your account has been created successfully!</p>
        <p><b>Login Email:</b> ${email}</p>
        <p><b>Temporary Password:</b> ${randomPassword}</p>
        <p>Please log in and change your password after your first login.</p>
        <br/>
        <p>Best regards,<br/>Clinic Management Team</p>
      `,
        };

        await transporter.sendMail(mailOptions);

        return res.status(201).json({
            status: true,
            message: "Doctor created successfully!",
            doctor: populatedDoctor,
        });


    } catch (error) {
        return res.status(500).json({
            message: error.message || "Something went wrong!",
            status: false,
        });
    }
};

export const removeDoctor = async (req, res) => {
    try {

        const doctorId = req.params.id
        console.log("id", doctorId);

        await UserModel.findById(doctorId)

        if (!doctorId) {
            return res.status(404).json({
                message: "Doctor not found!",
                status: false,
            });
        }

        await UserModel.findByIdAndDelete(doctorId)
        await DoctorModel.findByIdAndDelete(doctorId)

        return res.status(200).json({
            message: "Doctor removed successfully!",
            status: true,
        });

        
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Something went wrong!",
            status: false,
        });
    }
}

export const getAllDoctors = async(req, res) => {
    try {

        const doctors = await DoctorModel.find()
            .populate("userId", "fullName email phone cnic role isApproved") // only selected user fields
            .lean();
        console.log("doctors", doctors);

        return res.status(200).json({
            status: true,
            message: "Doctors fetched successfully",
            doctors,
        });
        
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Something went wrong!",
            status: false,
        });
    }
}

export const getAllPatients = async(req, res) => {
    try {

        const patients = await PatientModel.find()
            .populate("userId", "fullName email age phone cnic role isApproved") // only selected user fields
            .lean();
        console.log("patients", patients);

        return res.status(200).json({
            status: true,
            message: "Patients  fetched successfully",
            patients,
        });
        
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Something went wrong!",
            status: false,
        });
    }
}


// Room details by admin

export const createRoom = async (req, res) => {
    try {
        const { roomNum } = req.body;

        if (!roomNum) {
            return res.status(400).json({
                message: "Room ID is required!",
                status: false,
            });
        }
        const room = await RoomModel.create({ ...req.body, isAvailable: true });

        res.status(201).json({
            message: "Room created successfully!",
            status: true,
            room
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: false,
        });
    }
};


export const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;

        const room = await RoomModel.findByIdAndDelete(id);
        console.log("room", room);
        
        if (!room) return res.status(404).json({
            message: "Room not found!",
            status: false,
        });

        res.status(200).json({
            message: "Room deleted successfully!",
            status: true,
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

export const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const room = await RoomModel.findByIdAndUpdate(id, updates, { new: true });
        console.log("room", updates);
        
        if (!room) return res.status(404).json({
            message: "Room not found!",
            status: false,
        });

        res.status(200).json({
            message: "Room updated successfully!",
            status: true,
            room
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || "something went wrong",
            status: false,
        });
    }
};

export const assignDoctor = async (req, res) => {
    try {
        const { roomId, doctorId } = req.body;

        const room = await RoomModel.findById(roomId);
        console.log("room", room);
        
        const doctor = await DoctorModel.findById(doctorId);
        console.log("doctor", doctor);

        if (!room || !doctor) {
            return res.status(404).json({
                message: "Room or Doctor not found",
                status: false,
            });
        }
        if (!room.isAvailable) {
            return res.status(400).json({
                message: "Room is already assigned",
                status: false,
            });
        }
        doctor.roomId = roomId
        room.assignedDoctorId = doctorId;
        room.isAvailable = false;
        await room.save();
        await doctor.save();

        res.status(200).json({
            message: "Doctor assigned to room successfully",
            status: true,
            room,
            doctor
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};


export const releaseRoom = async (req, res) => {
    try {
        const { id } = req.params;

        const room = await RoomModel.findById(id);
        console.log("room", room);
        
        if (!room) {
            return res.status(404).json({
                message: "Room not found!",
                status: false,
            });
        }

        if (!room.assignedDoctorId) {
            return res.status(400).json({
                message: "No doctor assigned to this room.",
                status: false,
            });
        }

        await DoctorModel.findByIdAndUpdate(room.assignedDoctorId, { roomId: null });


        room.assignedDoctorId = null;
        room.isAvailable = true;
        await room.save();

        res.status(200).json({
            message: "Room released successfully!",
            status: true,
            room
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || "something went wrong!",
            status: false,
        });
    }
};

export const getAllRooms = async (req, res) => {
    try {
        const rooms = await RoomModel.find();
        console.log("rooms", rooms);
        
        res.status(200).json({
            message: "Rooms fetched successfully!",
            status: true,
            rooms
        });

    } catch (error) {
        res.status(500).json({
            message: error.message || "something went wrong!",
            status: false,
        });
    }
};


// Appointments Details by admin
export const createAppointment = async (req, res) => {
    try {
        const { doctorId, patientId, roomId, date, timeSlot } = req.body;

        if (!doctorId || !patientId || !roomId || !date || !timeSlot) {
            return res.status(400).json({
                status: false,
                message: "All fields are required!",
            });
        }

        const doctor = await DoctorModel.findById(doctorId);
        console.log("doctor", doctor);
        
        const patient = await PatientModel.findById(patientId);
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
            doctorId,
            patientId,
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
        await room.save();

        res.status(201).json({
            status: true,
            message: "Appointment booked successfully!",
            appointment,
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message || "Something went wrong!",
        });
    }
};

export const cancelAppointment = async (req, res) =>{
    
    try {

        const { id } = req.params
        
        const appointment = await AppointmentModel.findById(id)
        console.log("appointment", appointment);
        

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found!",
                status: false,
            });
        }

        appointment.status = "Cancelled";
        await appointment.save();

        if (appointment.roomId) {
            await RoomModel.findByIdAndUpdate(appointment.roomId, {
                isAvailable: true,
            });
        }

        
        return res.status(200).json({
            message: "Appointment cancelled successfully!",
            status: true,
            appointment,
        });
        
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message || "Something went wrong!",
        });
    }
}

export const getAllAppointments = async (req, res) => {
    try {
        const appointments = await AppointmentModel.find()
       
        
        if (!appointments.length) {
            return res.status(404).json({
                message: "No appointments found!",
                status: false,
            });
        }

        res.status(200).json({
            message: "All appointments fetched successfully!",
            status: true,
            appointments,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || "Something went wrong!",
            status: false,
        });
    }
};

export const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params; 
        const { date, timeSlot, status } = req.body;

        const updatedAppointment = await AppointmentModel.findByIdAndUpdate(
            id,
            { date, timeSlot, status },
            { new: true }
        );

        if (!updatedAppointment) {
            return res.status(404).json({
                message: "Appointment not found!",
                status: false,
            });
        }

        res.status(200).json({
            message: "Appointment updated successfully!",
            status: true,
            appointment: updatedAppointment,
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message || "Something went wrong!",
        });
    }
};