import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getAuthHeaders, handleHttpError } from '@/utils/api'

export const useUserStore = defineStore('user', () => {
    // État
    const profile = ref(null)
    const isLoading = ref(false)
    const error = ref(null)

    const API = import.meta.env.VITE_API_URL

    /**
     * GET - Récupérer le profil de l'utilisateur connecté
     * Status attendu: 200 OK
     * Nécessite: Authorization Bearer <token>
     */
    async function fetchProfile() {
        isLoading.value = true
        error.value = null
        try {
            const response = await fetch(`${API}/api/users/profile`, {
                method: 'GET',
                headers: getAuthHeaders()
            })

            if (!response.ok) {
                throw await handleHttpError(response)
            }

            // 200 OK
            const data = await response.json()
            profile.value = data
            return data
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * PUT - Modifier le profil de l'utilisateur connecté
     * Status attendu: 200 OK
     * Nécessite: Authorization Bearer <token>
     */
    async function updateProfile(userData) {
        isLoading.value = true
        error.value = null
        try {
            const response = await fetch(`${API}/api/users/profile`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(userData)
            })

            if (!response.ok) {
                throw await handleHttpError(response)
            }

            // 200 OK
            const data = await response.json()
            profile.value = data
            return data
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * DELETE - Supprimer le compte de l'utilisateur connecté
     * Status attendu: 204 No Content ou 200 OK
     * Nécessite: Authorization Bearer <token>
     */
    async function deleteProfile() {
        isLoading.value = true
        error.value = null
        try {
            const response = await fetch(`${API}/api/users/profile`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            })

            if (!response.ok) {
                throw await handleHttpError(response)
            }

            // 204 No Content ou 200 OK
            profile.value = null
            return true
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            isLoading.value = false
        }
    }

    return {
        profile,
        isLoading,
        error,
        fetchProfile,
        updateProfile,
        deleteProfile
    }
})