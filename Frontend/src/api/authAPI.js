import axiosInstance from "./axiosInstance";

export const login = (data) => axiosInstance.post("/login", data);
export const signup = (data) => axiosInstance.post("/signup", data);
