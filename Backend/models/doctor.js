import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true, 
    },
    qualification: {
        type: String,
        required: true,
        trim: true,
    },
    specialization: {
        type: String,
        required: true,
        trim: true,
    },
    availableDays: {
        type: [String],
        default: [],
    },
    shiftTimings: {
        type: String,
        default: null,
        trim: true,
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        default: null,
    },
    isApproved: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        default: true,
    },

},
    {
        timestamps: true
    }
)

const DoctorModel = mongoose.model("Doctor", doctorSchema)
export default DoctorModel;