import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },

        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true,
        },

        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            required: true,
        },

        diagnosis: {
            type: String,
            required: true,
            trim: true,
        },

        prescription: {
            type: String,
            required: true,
            trim: true,
        },

        followUpDate: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const PatientHistory = mongoose.model("History", patientSchema)

export default PatientHistory