import express from 'express'
import {
    createDoctor, getAllDoctors, getAllPatients, removeDoctor, createRoom, deleteRoom, updateRoom, assignDoctor,
    releaseRoom, getAllRooms, createAppointment, cancelAppointment, getAllAppointments, updateAppointment
} from '../controllers/adminController.js'
import { role } from '../middle_ware/roleMiddleware.js'
import { auth } from '../middle_ware/authMiddleware.js'

const adminRoute = express.Router()

adminRoute.post("/createDoctor", auth   ,createDoctor)
adminRoute.delete("/removeDoctor/:id", auth,role("Admin") ,removeDoctor)
adminRoute.get("/getAllDoctors", auth,role("Admin") ,getAllDoctors)
adminRoute.get("/getAllPatients", auth, role("Admin"), getAllPatients)

adminRoute.post("/createRoom", auth, createRoom);
adminRoute.delete("/delRoom/:id", auth, role("Admin"), deleteRoom);
adminRoute.put("/updateRoom/:id", auth, role("Admin"), updateRoom);
adminRoute.post("/assignRoom", auth,  assignDoctor);
adminRoute.put("/releaseRoom/:id", auth, role("Admin"), releaseRoom);
adminRoute.get("/getAllRooms", auth, role("Admin"), getAllRooms);

adminRoute.post("/bookAppointment", auth, role("Admin"), createAppointment);
adminRoute.delete("/cancelAppointment/:id", auth, role("Admin"), cancelAppointment);
adminRoute.get("/getAllAppointments", auth, role("Admin"), getAllAppointments);
adminRoute.put("/updateAppointment/:id", auth, role("Admin"), updateAppointment);


export default adminRoute