import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_BASEURL || 'http://localhost:3000',
    withCredentials: true,
})

// Redirect to login on 401 responses
api.interceptors.response.use(
    res => res,
    err => {
        if (err.response?.status === 401 && !window.location.pathname.includes('/login')) {
            window.location.href = '/login'
        }
        return Promise.reject(err)
    }
)

export default api
