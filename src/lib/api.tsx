//@ts-nocheck
import axios from "axios";
import tokenService from "./token.service";
import config from './config.json'
import secureLocalStorage from "react-secure-storage";
let headers = {};
const token = secureLocalStorage.getItem("token");


if (token) {
    headers.Authorization = `Bearer ${token}`;
}

const axiosInstance = axios.create({
    baseURL: config.ApiUrl,
});

axiosInstance.interceptors.request.use((config) => {
    const token = secureLocalStorage.getItem("token");
    if (!token) {
        throw new axios.Cancel("Token is not available. Do login, please.");
    } else {
        config.headers.Authorization = "Bearer " + token;
        return config;
    }
});
axiosInstance.interceptors.response.use(
    (response) =>
        new Promise((resolve, reject) => {
            resolve(response);
        }),
    (error) => {
        if (!error.response) {
            return new Promise((resolve, reject) => {
                reject(error);
            });
        }
        console.log("App error 😪:", error?.response)

        if (error?.response?.status === 400 && error?.response?.data?.errors === "invalid token, login again") {
            tokenService.removeToken();
            window.location = "/auth";
        }
        // if (error?.response?.status === 500) {
        //     console.log(error);
        //     catchRaiseHell(error)
        // }
        else {
            return new Promise((resolve, reject) => {
                reject(error);
            });
        }
    }
);

export default axiosInstance;
