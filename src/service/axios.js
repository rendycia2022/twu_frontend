import axios from "axios";

export default axios;

const backendURL ='http://192.168.0.170';

const axiosSign = axios.create({
    baseURL: backendURL+':8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

const axiosHr = axios.create({
    baseURL: backendURL+':8020/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

const axiosFna = axios.create({
    baseURL: backendURL+':8021/api',
    headers: {
        'Content-Type': 'application/json',
    },
}); 

export {
    axiosSign, 
    axiosHr,
    axiosFna,
};