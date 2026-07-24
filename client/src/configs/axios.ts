import axios from 'axios'

const BASE_URL = (import.meta.env.VITE_BASEURL as string || 'http://localhost:3000').replace(/\/+$/, '')

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('bearer_token')
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
})

export default api