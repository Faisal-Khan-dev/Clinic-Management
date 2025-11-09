import express from 'express'
import { signupController, loginController } from '../controllers/authController.js'

const authRoute = express.Router()

authRoute.post("/signup", signupController)
authRoute.post("/login", loginController)

export default authRoute