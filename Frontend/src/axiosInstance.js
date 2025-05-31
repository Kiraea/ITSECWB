import axios from "axios";
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 1000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

export {axiosInstance};