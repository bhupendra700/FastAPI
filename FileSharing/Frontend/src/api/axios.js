import axios from "axios";

let token = null;

export const setAuthToken = (newToken) => {
  token = newToken;
};

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

API.interceptors.request.use((config)=>{
  if(token){
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
} , (error)=>{
  return Promise.reject(error);
})

export default API;