import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        trim: true
    },
    cnic: {
        type: String,
        required: true,
        default: null,
        trim: true
    },
    phone: {
        type: String,
        trim: true,
        default: null,
        
    },
    role: {
        type: String,
        category: ["Patient", "Doctor", "Admin"],
        required: true,
        default: "Patient",
    },
    isApproved: {
        type: Boolean,
        default: function () {
            return this.role === "Patient" || this.role === "Admin";
        },
    },
    isActive: {
        type: Boolean,
        default: true,
    },
},
    { timestamps: true }
)

const UserModel = mongoose.model("User", userSchema)

export default UserModel;