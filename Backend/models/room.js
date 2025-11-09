import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
    {
        roomNum: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        isAvailable: {
            type: Boolean,
            default: true,
        },

        schedule: [
            {
                date: {
                    type: Date,
                    required: true
                },
                timeSlot: {
                    type: String,
                    required: true,
                    trim: true
                },
                appointmentId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Appointment",
                },
            },
        ],

        assignedDoctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
        },

        assignedPatientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
        },
        
        isBooked: {
            type: String,
            default : "Available"
        }
        
    },
    {
        timestamps: true,
    }
);

const RoomModel = mongoose.model("Room", roomSchema);
export default RoomModel;
