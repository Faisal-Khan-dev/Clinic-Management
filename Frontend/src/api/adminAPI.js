import axiosInstance from "./axiosInstance";

export const adminAPI = {
    // 🧑‍⚕️ Doctor APIs
    createDoctor: (data) => axiosInstance.post("/admin/createDoctor", data),
    getAllDoctors: () => axiosInstance.get("/admin/getAllDoctors"),
    removeDoctor: (id) => axiosInstance.delete(`/admin/removeDoctor/${id}`),

    // 🧍‍♂️ Patient APIs
    getAllPatients: () => axiosInstance.get("/admin/getAllPatients"),

    // 🏥 Room APIs
    createRoom: (data) => axiosInstance.post("/admin/createRoom", data),
    deleteRoom: (id) => axiosInstance.delete(`/admin/delRoom/${id}`),
    updateRoom: (id, data) => axiosInstance.put(`/admin/updateRoom/${id}`, data),
    assignRoom: (data) => axiosInstance.post("/admin/assignRoom", data),
    releaseRoom: (id) => axiosInstance.put(`/admin/releaseRoom/${id}`),
    getAllRooms: () => axiosInstance.get("/admin/getAllRooms"),

    // 📅 Appointment APIs
    createAppointment: (data) => axiosInstance.post("/admin/bookAppointment", data),
    cancelAppointment: (id) =>
        axiosInstance.delete(`/admin/cancelAppointment/${id}`),
    getAllAppointments: () => axiosInstance.get("/admin/getAllAppointments"),
    updateAppointment: (id, data) =>
        axiosInstance.put(`/admin/updateAppointment/${id}`, data),
};
