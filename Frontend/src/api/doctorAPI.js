// src/api/doctorAPI.js
import axiosInstance from "./axiosInstance";

export const doctorAPI = {
    // get doctor's own profile (backend expects user id in params or uses auth token)
    getDoctorProfile: (id) => axiosInstance.get(`/doctor/getDoctorProfile/${id}`),

    // update doctor profile
    updateDoctorProfile: (id, data) =>
        axiosInstance.put(`/doctor/updateProfile/${id}`, data),

    // fetch appointments for doctor
    getDoctorAppointments: (doctorId) =>
        axiosInstance.get(`/doctor/viewAppointments/${doctorId}`),

    // Update appointment status
    updateAppointmentStatus: (appointmentId, data) =>
        axiosInstance.put(`/doctor/updateAppointmentStatus/${appointmentId}`, data),

    // create case history
    createCaseHistory: (data) =>
        axiosInstance.post(`/doctor/createPatientHistory`, data),

    // get patient history (doctor view)
    getPatientHistory: (doctorId) =>
        axiosInstance.get(`/doctor/viewPatientHistory/${doctorId}`),
};
