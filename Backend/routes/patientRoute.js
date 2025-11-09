import express from "express";
import {
    createAppointment,
    cancelAppointment,
    getPatientHistory,
    updatePatientProfile,
    getPatientProfile,
    getAllDoctors,
    getMyAppointments
} from "../controllers/patientController.js";
import { auth } from "../middle_ware/authMiddleware.js";
import { role } from "../middle_ware/roleMiddleware.js";

const patientRoute = express.Router();

patientRoute.post("/createAppointment", auth, role("Patient"), createAppointment);
patientRoute.get("/appointments/:id", auth, role("Patient"), getMyAppointments);
patientRoute.delete("/cancelAppointment/:id", auth, role("Patient"), cancelAppointment);
patientRoute.get("/caseHistory/:id", auth, role("Patient"), getPatientHistory);
patientRoute.put("/updateProfile/:id", auth, role("Patient"), updatePatientProfile);
patientRoute.get("/getProfile/:id", auth, role("Patient"), getPatientProfile);
patientRoute.get("/getAllDoctors", auth, role("Patient"), getAllDoctors);


export default patientRoute;