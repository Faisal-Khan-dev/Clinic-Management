import express from "express";
import { updateDoctorProfile, getDoctorAppointments, updateAppointmentStatus, getDoctorCaseHistories, createCaseHistory, getPatientHistory, getDoctorProfile } from "../controllers/doctorController.js";
import { auth } from "../middle_ware/authMiddleware.js";
import { role } from "../middle_ware/roleMiddleware.js";

const doctorRoute = express.Router();


doctorRoute.put("/updateProfile/:id", auth, role("Doctor"), updateDoctorProfile);
doctorRoute.get("/viewAppointments/:id", auth, getDoctorAppointments);
doctorRoute.put("/updateAppointmentStatus/:id", auth, updateAppointmentStatus);
doctorRoute.post("/createPatientHistory", auth, createCaseHistory);
doctorRoute.get("/viewPatientHistory/:id", auth, getDoctorCaseHistories);
doctorRoute.get("/getDoctorProfile/:id", auth, getDoctorProfile);


export default doctorRoute;