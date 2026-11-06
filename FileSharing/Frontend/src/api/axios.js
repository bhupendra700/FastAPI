import axios from "axios";
import { useAuthStore } from '../store/authStore';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

API.interceptors.request.use((config)=>{
  const token = useAuthStore.getState().accessToken;

  if(token){
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
} , (error)=>{
  return Promise.reject(error);
})

API.interceptors.response.use(
  (response)=> response,
  async (error)=>{
    const originalRequest = error.config;

    if(error.response && error.response.status === 401 && !originalRequest._retry){
      originalRequest._retry = true;

      try{
        const { data:res } = await API.get(
          `${import.meta.env.VITE_API_URL}/api/auth/refresh`, 
          { withCredentials: true }
        );

        const newAccessToken = res.access_token;

        useAuthStore.getState().login(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return API(originalRequest)
      }
      catch (refreshError){
        console.error("Refresh token expired. Please login again.", refreshError);

        useAuthStore.getState().logout();

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default API;