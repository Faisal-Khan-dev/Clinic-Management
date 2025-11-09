import express from 'express'
import cors from 'cors';
import { dbConnect } from './config/db.js';
import authRoute from './routes/authRoutes.js' 
import dotenv from "dotenv";
import adminRoute from './routes/adminRoute.js';
import patientRoute from './routes/patientRoute.js';
import doctorRoute from './routes/doctorRoute.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors());

dbConnect()

app.use("/api", authRoute);
app.use("/api/admin", adminRoute);
app.use("/api/patient", patientRoute);
app.use("/api/doctor", doctorRoute);
    

app.listen(PORT, () => console.log(`server running on http://localhost:${PORT}`))