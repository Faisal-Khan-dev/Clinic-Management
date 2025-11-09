    import bcrypt from "bcrypt";
    import UserModel from '../models/user.js';
    import PatientModel from "../models/patient.js";
    import DoctorModel from "../models/doctor.js";
    import jwt from 'jsonwebtoken'
    import nodemailer from "nodemailer";



    export const signupController = async (req, res) => {
        try {

            console.log("res", req.body);

            const { fullName, age, email, password, phone, cnic, role } = req.body

            if (role !== "Patient") {
                return res.status(403).json({
                    message: "Only patients can register directly. Doctor accounts are created by Admin.",
                    status: false
                });
            }

            if (!fullName || !age || !phone || !cnic || !role || !email || !password) {
                return res.status(400).json({
                    message: "Required fields are missing!",
                    status: false
                })
            }


            const user = await UserModel.findOne({ email })

            if (user || user === process.env.ADMIN_EMAIL) {
                return res.status(400).json({
                    message: "Email already exist!",
                    status: false
                })
            }

            const hashPassword = await bcrypt.hash(password, 10)

            const userData = new UserModel({
                ...req.body,
                password: hashPassword,
                isApproved: true
            })
            await userData.save();

            if (role === "Patient") {
                await PatientModel.create({
                    userId: userData._id,
                    ...req.body
                })

                return res.status(201).json({
                    message: "Patient registered successfully!",
                    status: true,
                });

            } 

        } catch (error) {
            res.status(500).json({
                message: error.message || "something went wrong!",
                status: false
            })
        }

    }

    export const loginController = async (req, res) => {
        try {
            const { email, password } = req.body
            
            if (!email || !password) {
                return res.status(400).json({
                    message: "Required fields are missing",
                    status: false
                })
            }

            
            if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_LOGIN_PASSWORD) {
                
                const token = jwt.sign({ role: "Admin" }, process.env.SECRET_KEY, { expiresIn: "24h" });
                
                return res.status(200).json({
                    status: true,
                    message: "Staff logged in successfully!",
                    token,
                    user: {
                        fullName: "Clinic Admin",
                        email,
                        role: "Admin",
                    },
                });
            }

            const user = await UserModel.findOne({ email })
            
            if (!user) {
                return res.status(404).json({
                    message: "Invalid email or password!",
                    status: false
                })
            }

            const comparePassword = await bcrypt.compare(password, user.password)

            if (!comparePassword) {
                return res.status(401).json({
                    message: "Invalid email or password!",
                    status: false
                })
            }

            if (user.role !== "Patient" && !user.isApproved) {
                return res.status(403).json({
                    status: false,
                    message: "Your account is not approved yet!",
                });
            }

            let patientData = null;

            if (user.role === "Patient") {
                
                patientData = await PatientModel.findOne({ userId: user._id });
            }
            console.log("patientData", patientData);
            let _id = user._id
            const role = user.role
            
            let doctorData = null
            let doc_id;
            if (user.role === "Doctor") {

                doctorData = await DoctorModel.findOne({ userId: user._id });
                doc_id = doctorData._id
            }
            


            console.log("id",_id);
            console.log("role", role);
            
            
            const token = jwt.sign({ _id, role }, process.env.SECRET_KEY , {expiresIn: "24h"})
            console.log("token", token);
            
            const userData = user.toObject();

            if (user.role === "Doctor") {
                userData._id = doc_id
            }
            delete userData.password;
            
            res.status(200).json({
                message: `${user.role} sucessfuly Log-in`,
                status: true,
                token,
                userData,
                patientData,
                doctorData: doctorData || "not found",
            })
    
            } catch (error) {
            res.status(500).json({
                    message: error.message || "something went wrong!",
                    status: false
                })
            }
    }