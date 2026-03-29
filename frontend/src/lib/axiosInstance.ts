import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15_000,
});
