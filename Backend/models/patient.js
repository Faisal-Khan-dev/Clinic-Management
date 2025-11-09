import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    gender: {
        type: String,
        required: true
    },
    address: {
        type: String,
        trim: true,
        required: true
    }
},
 {
        timestamps: true,
    }
)

const PatientModel = mongoose.model("Patient", patientSchema)
export default PatientModel;