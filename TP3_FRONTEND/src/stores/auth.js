import { defineStore } from 'pinia'
import { jwtDecode } from "jwt-decode";
import { ref, computed } from 'vue'
import { apiPost, handleHttpError } from '@/utils/api'

export const useAuthStore = defineStore('auth', () => {

    const token = ref(localStorage.getItem('token') || null)

    const isAuthenticated = computed(() => {
        if (token.value) {
            try {
                const decoded = jwtDecode(token.value)
                const now = Date.now() / 1000
                return decoded.exp > now
            } catch {
                return false
            }
        }
        return false
    })

    // Current user
    const currentUser = computed(() => {
        if (token.value) {
            try {
                const decoded = jwtDecode(token.value)
                return {
                    id: decoded.sub,
                    username: decoded.username,
                    email: decoded.email,
                    first_name: decoded.first_name,
                    last_name: decoded.last_name,
                    is_admin: decoded.is_admin || false
                }
            } catch {
                return null
            }
        }
        return null
    })

    // Vérifier si l'utilisateur est admin
    const isAdmin = computed(() => {
        if (token.value) {
            try {
                const decoded = jwtDecode(token.value)
                return decoded.is_admin === true
            } catch {
                return false
            }
        }
        return false
    })

    const API = import.meta.env.VITE_API_URL

    /**
     * Inscription d'un nouvel utilisateur
     * Status attendu: 201 Created
     */
    async function Signup(credentials) {
        try {
            const response = await fetch(`${API}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: credentials.username,
                    email: credentials.email,
                    first_name: credentials.first_name,
                    last_name: credentials.last_name,
                    password: credentials.password
                })
            })

            if (!response.ok) {
                throw await handleHttpError(response)
            }

            // 201 Created
            const data = await response.json()
            return data
        } catch (error) {
            console.error('Signup error:', error)
            throw error
        }
    }

    /**
     * Connexion d'un utilisateur
     * Status attendu: 200 OK
     */
    async function login(credentials) {
        try {
            const response = await fetch(`${API}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: credentials.email,
                    password: credentials.password
                })
            })

            if (!response.ok) {
                throw await handleHttpError(response)
            }

            // 200 OK
            const data = await response.json()
            token.value = data.token
            localStorage.setItem('token', data.token)

            return data
        } catch (error) {
            console.error('Login error:', error)
            throw error
        }
    }

    function logout() {
        token.value = null
        localStorage.removeItem('token')
    }


    return {
        token,
        isAuthenticated,
        currentUser,
        isAdmin,
        login,
        Signup,
        logout,
    }

})