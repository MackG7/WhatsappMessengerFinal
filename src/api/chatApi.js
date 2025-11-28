import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api"
});

export const fetchMyChats = async (token) => {
    const response = await api.get("/chat/my-chats", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};
