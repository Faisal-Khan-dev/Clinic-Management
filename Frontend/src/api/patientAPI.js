import axiosInstance from "./axiosInstance";

export const patientAPI = {
    // Get patient profile
    getProfile: (patientId) =>
        axiosInstance.get(`/patient/getProfile/${patientId}`),

    getAllDoctors: () =>
        axiosInstance.get(`/patient/getAllDoctors`),

    // Update patient profile
    updateProfile: (patientId, data) =>
        axiosInstance.put(`/patient/updateProfile/${patientId}`, data),

    // Book appointment
    bookAppointment: (data) =>
        axiosInstance.post(`/patient/createAppointment`, data),

    // Get patient appointments
    getMyAppointments: (patientId) =>
        axiosInstance.get(`/patient/appointments/${patientId}`),

    // Cancel appointment
    cancelAppointment: (appointmentId) =>
        axiosInstance.delete(`/patient/cancelAppointment/${appointmentId}`),

    // Get case history
    getCaseHistory: (patientId) =>
        axiosInstance.get(`/patient/caseHistory/${patientId}`),
};