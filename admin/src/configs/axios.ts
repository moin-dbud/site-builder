import axios from 'axios'

const BASE_URL = (import.meta.env.VITE_BASEURL as string || 'http://localhost:3000').replace(/\/+$/, '')

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
})

// Attach Better Auth bearer token from localStorage on every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('bearer_token')
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
})

// Redirect to login on 401 responses
api.interceptors.response.use(
    res => res,
    err => {
        if (err.response?.status === 401 && !window.location.pathname.includes('/login')) {
            localStorage.removeItem('bearer_token')
            window.location.href = '/login'
        }
        return Promise.reject(err)
    }
)

export default api
